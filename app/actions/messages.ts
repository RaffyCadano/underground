'use server';

import { randomUUID } from 'crypto';
import { getServerSession } from 'next-auth';
import { revalidatePath } from 'next/cache';
import { authOptions } from '@/lib/auth';
import {
  conversationParticipantPair,
  DIRECT_MESSAGE_MAX_LENGTH,
  otherConversationParticipant,
} from '@/lib/conversations';
import { MESSAGE_EDIT_WINDOW_MS } from '@/lib/message-ui';
import {
  getConversationForUser,
  getMessageForUser,
  loadArchivedConversationsForUser,
  loadConversationThread,
  loadConversationsForUser,
  loadUnreadMessageCount,
} from '@/lib/messages-data';
import { prisma } from '@/lib/prisma';
import { addBlockedUser } from '@/app/actions/profile';
import { getSupabaseAdmin, TOURNAMENT_IMAGES_BUCKET } from '@/lib/supabase-admin';

const participantSelect = {
  id: true,
  username: true,
  avatar: true,
  email: true,
} as const;

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

async function requireSessionUserId() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error('Sign in to use messages.');
  }
  return session.user.id;
}

async function usersAreBlocked(userAId: string, userBId: string) {
  if (userAId === userBId) return true;

  const users = await prisma.user.findMany({
    where: { id: { in: [userAId, userBId] } },
    select: { id: true, username: true, email: true },
  });
  const userA = users.find((user) => user.id === userAId);
  const userB = users.find((user) => user.id === userBId);
  if (!userA || !userB) return true;

  const aIdentifiers = [userA.username.toLowerCase(), userA.email.toLowerCase()];
  const bIdentifiers = [userB.username.toLowerCase(), userB.email.toLowerCase()];

  const block = await prisma.blockedUser.findFirst({
    where: {
      OR: [
        { userId: userAId, identifier: { in: bIdentifiers } },
        { userId: userBId, identifier: { in: aIdentifiers } },
      ],
    },
    select: { id: true },
  });

  return Boolean(block);
}

function revalidateMessages() {
  revalidatePath('/messages');
}

async function upsertConversationUserState(
  conversationId: string,
  userId: string,
  data: { archivedAt?: Date | null; deletedAt?: Date | null },
) {
  await prisma.conversationUserState.upsert({
    where: { conversationId_userId: { conversationId, userId } },
    create: { conversationId, userId, ...data },
    update: data,
  });
}

export async function getUnreadMessageCount(userId: string) {
  return loadUnreadMessageCount(userId);
}

export async function listConversationsForUser(userId: string) {
  return loadConversationsForUser(userId);
}

export async function listArchivedConversationsForUser(userId: string) {
  return loadArchivedConversationsForUser(userId);
}

export async function getConversationThread(conversationId: string) {
  const userId = await requireSessionUserId();
  const thread = await loadConversationThread(userId, conversationId);
  if (!thread) {
    throw new Error('Conversation not found.');
  }
  revalidateMessages();
  return thread;
}

export async function findUserForNewMessage(username: string) {
  const userId = await requireSessionUserId();
  const normalized = username.trim();
  if (!normalized) {
    return { error: 'Enter a username.' };
  }

  const recipient = await prisma.user.findFirst({
    where: { username: { equals: normalized, mode: 'insensitive' } },
    select: participantSelect,
  });

  if (!recipient) {
    return { error: 'No player found with that username.' };
  }

  if (recipient.id === userId) {
    return { error: 'You cannot message yourself.' };
  }

  if (await usersAreBlocked(userId, recipient.id)) {
    return { error: 'You cannot message this player.' };
  }

  return {
    user: {
      id: recipient.id,
      username: recipient.username,
      avatar: recipient.avatar,
    },
  };
}

async function resolveConversationId(
  userId: string,
  input: { conversationId?: string; recipientUsername?: string },
): Promise<{ error: string } | { conversationId: string }> {
  if (input.conversationId) {
    const conversation = await getConversationForUser(input.conversationId, userId);
    if (!conversation) {
      return { error: 'Conversation not found.' as const };
    }

    const other = otherConversationParticipant(conversation, userId);
    if (await usersAreBlocked(userId, other.id)) {
      return { error: 'You cannot message this player.' as const };
    }

    return { conversationId: conversation.id };
  }

  const username = input.recipientUsername?.trim();
  if (!username) {
    return { error: 'Choose who to message.' as const };
  }

  const lookup = await findUserForNewMessage(username);
  if ('error' in lookup && lookup.error) {
    return { error: lookup.error };
  }
  if (!('user' in lookup) || !lookup.user) {
    return { error: 'Recipient not found.' as const };
  }

  const pair = conversationParticipantPair(userId, lookup.user.id);
  const conversation = await prisma.conversation.upsert({
    where: { participantLowId_participantHighId: pair },
    create: pair,
    update: {},
    select: { id: true },
  });

  return { conversationId: conversation.id };
}

export async function sendDirectMessage(input: {
  conversationId?: string;
  recipientUsername?: string;
  body?: string;
  imageUrl?: string | null;
}): Promise<
  | { error: string }
  | {
      conversationId: string;
      messageId: string;
      createdAt: string;
      body: string;
      imageUrl: string | null;
      senderId: string;
    }
> {
  const userId = await requireSessionUserId();
  const body = (input.body ?? '').trim();
  const imageUrl = input.imageUrl?.trim() || null;

  if (!body && !imageUrl) {
    return { error: 'Message cannot be empty.' };
  }
  if (body.length > DIRECT_MESSAGE_MAX_LENGTH) {
    return { error: `Message must be ${DIRECT_MESSAGE_MAX_LENGTH} characters or fewer.` };
  }

  const resolved = await resolveConversationId(userId, input);
  if ('error' in resolved) {
    return { error: resolved.error };
  }

  const message = await prisma.directMessage.create({
    data: {
      conversationId: resolved.conversationId,
      senderId: userId,
      body,
      imageUrl,
    },
    select: { id: true, createdAt: true },
  });

  await prisma.conversation.update({
    where: { id: resolved.conversationId },
    data: { updatedAt: new Date() },
  });

  return {
    conversationId: resolved.conversationId,
    messageId: message.id,
    createdAt: message.createdAt.toISOString(),
    body,
    imageUrl,
    senderId: userId,
  };
}

export async function editDirectMessage(messageId: string, body: string) {
  const userId = await requireSessionUserId();
  const trimmed = body.trim();

  if (!trimmed) {
    return { error: 'Message cannot be empty.' };
  }
  if (trimmed.length > DIRECT_MESSAGE_MAX_LENGTH) {
    return { error: `Message must be ${DIRECT_MESSAGE_MAX_LENGTH} characters or fewer.` };
  }

  const message = await getMessageForUser(messageId, userId);
  if (!message) {
    return { error: 'Message not found.' };
  }
  if (message.senderId !== userId) {
    return { error: 'You can only edit your own messages.' };
  }
  if (message.unsentAt) {
    return { error: 'This message was unsent.' };
  }
  if (Date.now() - message.createdAt.getTime() > MESSAGE_EDIT_WINDOW_MS) {
    return { error: 'Messages can only be edited within 15 minutes.' };
  }

  await prisma.directMessage.update({
    where: { id: messageId },
    data: { body: trimmed, editedAt: new Date() },
  });

  revalidateMessages();
  return { success: true as const };
}

export async function unsendDirectMessage(messageId: string) {
  const userId = await requireSessionUserId();
  const message = await getMessageForUser(messageId, userId);

  if (!message) {
    return { error: 'Message not found.' };
  }
  if (message.senderId !== userId) {
    return { error: 'You can only unsend your own messages.' };
  }
  if (message.unsentAt) {
    return { error: 'Message already unsent.' };
  }

  await prisma.directMessage.update({
    where: { id: messageId },
    data: { unsentAt: new Date(), body: '', imageUrl: null },
  });

  revalidateMessages();
  return { success: true as const };
}

export async function deleteDirectMessageForMe(messageId: string) {
  const userId = await requireSessionUserId();
  const message = await getMessageForUser(messageId, userId);

  if (!message) {
    return { error: 'Message not found.' };
  }

  await prisma.directMessageHide.upsert({
    where: { messageId_userId: { messageId, userId } },
    create: { messageId, userId },
    update: {},
  });

  revalidateMessages();
  return { success: true as const };
}

export async function toggleDirectMessageLike(messageId: string) {
  const userId = await requireSessionUserId();
  const message = await getMessageForUser(messageId, userId);

  if (!message) {
    return { error: 'Message not found.' };
  }
  if (message.unsentAt) {
    return { error: 'Cannot like an unsent message.' };
  }

  const existing = await prisma.directMessageLike.findUnique({
    where: { messageId_userId: { messageId, userId } },
    select: { id: true },
  });

  if (existing) {
    await prisma.directMessageLike.delete({ where: { id: existing.id } });
    revalidateMessages();
    return { liked: false as const };
  }

  await prisma.directMessageLike.create({
    data: { messageId, userId },
  });

  revalidateMessages();
  return { liked: true as const };
}

export async function uploadDirectMessageImage(
  conversationId: string,
  formData: FormData,
): Promise<{ url?: string; error?: string }> {
  const userId = await requireSessionUserId();
  const conversation = await getConversationForUser(conversationId, userId);
  if (!conversation) {
    return { error: 'Conversation not found.' };
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return { error: 'Image upload is not configured.' };
  }

  const file = formData.get('file');
  if (!(file instanceof File) || file.size === 0) {
    return { error: 'Choose an image to upload.' };
  }
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    return { error: 'Use a JPEG, PNG, WebP, or GIF image.' };
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return { error: 'Image must be 5 MB or smaller.' };
  }

  const ext = file.type.split('/')[1]?.replace('jpeg', 'jpg') ?? 'jpg';
  const path = `messages/${conversationId}/${randomUUID()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await supabase.storage.from(TOURNAMENT_IMAGES_BUCKET).upload(path, buffer, {
    contentType: file.type,
    cacheControl: '3600',
    upsert: false,
  });

  if (error) {
    return { error: error.message || 'Upload failed.' };
  }

  const { data } = supabase.storage.from(TOURNAMENT_IMAGES_BUCKET).getPublicUrl(path);
  if (!data.publicUrl) {
    return { error: 'Upload succeeded but public URL could not be generated.' };
  }

  return { url: data.publicUrl };
}

export async function archiveConversation(conversationId: string) {
  const userId = await requireSessionUserId();
  const conversation = await getConversationForUser(conversationId, userId);
  if (!conversation) {
    return { error: 'Conversation not found.' };
  }

  await upsertConversationUserState(conversationId, userId, {
    archivedAt: new Date(),
    deletedAt: null,
  });

  revalidateMessages();
  return { success: true as const };
}

export async function unarchiveConversation(conversationId: string) {
  const userId = await requireSessionUserId();
  const conversation = await prisma.conversation.findFirst({
    where: {
      id: conversationId,
      OR: [{ participantLowId: userId }, { participantHighId: userId }],
      userStates: {
        some: { userId, archivedAt: { not: null }, deletedAt: null },
      },
    },
    select: { id: true },
  });
  if (!conversation) {
    return { error: 'Conversation not found.' };
  }

  await upsertConversationUserState(conversationId, userId, {
    archivedAt: null,
  });

  revalidateMessages();
  return { success: true as const };
}

export async function deleteConversationForUser(conversationId: string) {
  const userId = await requireSessionUserId();
  const conversation = await prisma.conversation.findFirst({
    where: {
      id: conversationId,
      OR: [{ participantLowId: userId }, { participantHighId: userId }],
    },
    select: { id: true },
  });
  if (!conversation) {
    return { error: 'Conversation not found.' };
  }

  await upsertConversationUserState(conversationId, userId, {
    deletedAt: new Date(),
    archivedAt: null,
  });

  revalidateMessages();
  return { success: true as const };
}

export async function blockUserInConversation(conversationId: string) {
  const userId = await requireSessionUserId();
  const conversation = await prisma.conversation.findFirst({
    where: {
      id: conversationId,
      OR: [{ participantLowId: userId }, { participantHighId: userId }],
    },
    include: {
      participantLow: { select: participantSelect },
      participantHigh: { select: participantSelect },
    },
  });
  if (!conversation) {
    return { error: 'Conversation not found.' };
  }

  const other = otherConversationParticipant(conversation, userId);
  const result = await addBlockedUser(other.username);
  if (result.error) {
    return { error: result.error };
  }

  revalidateMessages();
  revalidatePath('/profile');
  return { success: true as const };
}

export async function reportDirectMessage(messageId: string) {
  const userId = await requireSessionUserId();
  const message = await getMessageForUser(messageId, userId);
  if (!message) {
    return { error: 'Message not found.' };
  }
  if (message.unsentAt) {
    return { error: 'This message can no longer be reported.' };
  }

  const reporter = await prisma.user.findUnique({
    where: { id: userId },
    select: { username: true, email: true },
  });
  if (!reporter) {
    return { error: 'Account not found.' };
  }

  const reportedUser = await prisma.user.findUnique({
    where: { id: message.senderId },
    select: { username: true, email: true },
  });
  if (!reportedUser) {
    return { error: 'Sender not found.' };
  }

  const messagePreview =
    [message.body?.trim(), message.imageUrl ? `[Image: ${message.imageUrl}]` : null]
      .filter(Boolean)
      .join('\n') || '(no content)';

  await prisma.contactMessage.create({
    data: {
      name: reporter.username,
      email: reporter.email,
      subject: `DM message report: @${reportedUser.username}`.slice(0, 200),
      message: [
        `Reporter: @${reporter.username} (${reporter.email})`,
        `Reported user: @${reportedUser.username}`,
        `Conversation ID: ${message.conversationId}`,
        `Message ID: ${messageId}`,
        `Sent at: ${message.createdAt.toISOString()}`,
        '',
        'Reported message:',
        messagePreview,
        '',
        'This report was submitted from a message in the inbox.',
      ].join('\n'),
      category: 'account',
      userId,
    },
  });

  revalidatePath('/dashboard/contact');
  return { success: true as const };
}

export async function reportConversation(conversationId: string) {
  const userId = await requireSessionUserId();
  const conversation = await prisma.conversation.findFirst({
    where: {
      id: conversationId,
      OR: [{ participantLowId: userId }, { participantHighId: userId }],
    },
    include: {
      participantLow: { select: participantSelect },
      participantHigh: { select: participantSelect },
    },
  });
  if (!conversation) {
    return { error: 'Conversation not found.' };
  }

  const reporter = await prisma.user.findUnique({
    where: { id: userId },
    select: { username: true, email: true },
  });
  if (!reporter) {
    return { error: 'Account not found.' };
  }

  const other = otherConversationParticipant(conversation, userId);
  await prisma.contactMessage.create({
    data: {
      name: reporter.username,
      email: reporter.email,
      subject: `DM report: ${other.username}`.slice(0, 200),
      message: [
        `Reporter: @${reporter.username} (${reporter.email})`,
        `Reported user: @${other.username}`,
        `Conversation ID: ${conversationId}`,
        '',
        'This report was submitted from the messages inbox.',
      ].join('\n'),
      category: 'account',
      userId,
    },
  });

  revalidatePath('/dashboard/contact');
  return { success: true as const };
}
