import {
  otherConversationParticipant,
  formatMessagePreview,
} from '@/lib/conversations';
import type { ThreadMessageView } from '@/lib/message-ui';
import { prisma } from '@/lib/prisma';

const participantSelect = {
  id: true,
  username: true,
  avatar: true,
  email: true,
} as const;

const messageSelect = {
  id: true,
  body: true,
  imageUrl: true,
  senderId: true,
  createdAt: true,
  editedAt: true,
  unsentAt: true,
  readAt: true,
  likes: { select: { userId: true } },
  hiddenFor: { select: { userId: true } },
} as const;

const deletedConversationFilter = (userId: string) => ({
  NOT: {
    userStates: {
      some: { userId, deletedAt: { not: null } },
    },
  },
});

const activeConversationFilter = (userId: string) => ({
  NOT: {
    userStates: {
      some: {
        userId,
        OR: [{ deletedAt: { not: null } }, { archivedAt: { not: null } }],
      },
    },
  },
});

const archivedConversationFilter = (userId: string) => ({
  ...deletedConversationFilter(userId),
  userStates: {
    some: { userId, archivedAt: { not: null }, deletedAt: null },
  },
});

export async function getConversationForUser(
  conversationId: string,
  userId: string,
  options?: { allowArchived?: boolean },
) {
  const conversation = await prisma.conversation.findFirst({
    where: {
      id: conversationId,
      OR: [{ participantLowId: userId }, { participantHighId: userId }],
      ...(options?.allowArchived ? deletedConversationFilter(userId) : activeConversationFilter(userId)),
    },
    include: {
      participantLow: { select: participantSelect },
      participantHigh: { select: participantSelect },
    },
  });

  if (!conversation) {
    return null;
  }

  return conversation;
}

export async function getMessageForUser(messageId: string, userId: string) {
  const message = await prisma.directMessage.findUnique({
    where: { id: messageId },
    include: {
      conversation: {
        select: { participantLowId: true, participantHighId: true },
      },
    },
  });

  if (!message) return null;

  const { conversation } = message;
  if (conversation.participantLowId !== userId && conversation.participantHighId !== userId) {
    return null;
  }

  return message;
}

function mapMessage(message: {
  id: string;
  body: string;
  imageUrl: string | null;
  senderId: string;
  createdAt: Date;
  editedAt: Date | null;
  unsentAt: Date | null;
  readAt: Date | null;
  likes: { userId: string }[];
}, userId: string): ThreadMessageView {
  return {
    id: message.id,
    body: message.body,
    imageUrl: message.imageUrl,
    senderId: message.senderId,
    createdAt: message.createdAt.toISOString(),
    editedAt: message.editedAt?.toISOString() ?? null,
    unsentAt: message.unsentAt?.toISOString() ?? null,
    isMine: message.senderId === userId,
    isRead: message.readAt != null,
    likeCount: message.likes.length,
    likedByMe: message.likes.some((like) => like.userId === userId),
  };
}

export async function loadConversationThread(
  userId: string,
  conversationId: string,
  options?: { allowArchived?: boolean },
) {
  const conversation = await getConversationForUser(conversationId, userId, options);
  if (!conversation) {
    return null;
  }

  const messages = await prisma.directMessage.findMany({
    where: {
      conversationId,
      NOT: { hiddenFor: { some: { userId } } },
    },
    orderBy: { createdAt: 'asc' },
    select: messageSelect,
  });

  await prisma.directMessage.updateMany({
    where: {
      conversationId,
      senderId: { not: userId },
      readAt: null,
    },
    data: { readAt: new Date() },
  });

  const other = otherConversationParticipant(conversation, userId);
  return {
    id: conversation.id,
    other: {
      id: other.id,
      username: other.username,
      avatar: other.avatar,
    },
    messages: messages.map((message) => mapMessage(message, userId)),
  };
}

async function mapConversationsForUser(
  userId: string,
  conversations: Awaited<ReturnType<typeof fetchConversationRows>>,
) {
  const unreadCounts = await Promise.all(
    conversations.map((conversation) =>
      prisma.directMessage.count({
        where: {
          conversationId: conversation.id,
          senderId: { not: userId },
          readAt: null,
          unsentAt: null,
          NOT: { hiddenFor: { some: { userId } } },
        },
      }),
    ),
  );

  return conversations.map((conversation, index) => {
    const other = otherConversationParticipant(conversation, userId);
    const lastMessage = conversation.messages[0] ?? null;
    return {
      id: conversation.id,
      updatedAt: conversation.updatedAt.toISOString(),
      other: {
        id: other.id,
        username: other.username,
        avatar: other.avatar,
      },
      lastMessage: lastMessage
        ? {
            body: formatMessagePreview(lastMessage.body, 72, {
              unsent: lastMessage.unsentAt != null,
              hasImage: Boolean(lastMessage.imageUrl),
            }),
            createdAt: lastMessage.createdAt.toISOString(),
            senderId: lastMessage.senderId,
            isRead: lastMessage.readAt != null,
          }
        : null,
      unreadCount: unreadCounts[index],
    };
  });
}

function fetchConversationRows(userId: string, whereExtra: Record<string, unknown>) {
  return prisma.conversation.findMany({
    where: {
      OR: [{ participantLowId: userId }, { participantHighId: userId }],
      ...whereExtra,
    },
    orderBy: { updatedAt: 'desc' },
    include: {
      participantLow: { select: participantSelect },
      participantHigh: { select: participantSelect },
      messages: {
        where: { NOT: { hiddenFor: { some: { userId } } } },
        orderBy: { createdAt: 'desc' },
        take: 1,
        select: {
          id: true,
          body: true,
          imageUrl: true,
          createdAt: true,
          senderId: true,
          readAt: true,
          unsentAt: true,
        },
      },
    },
  });
}

export async function loadConversationsForUser(userId: string) {
  const conversations = await fetchConversationRows(userId, activeConversationFilter(userId));
  return mapConversationsForUser(userId, conversations);
}

export async function loadArchivedConversationsForUser(userId: string) {
  const conversations = await fetchConversationRows(userId, archivedConversationFilter(userId));
  return mapConversationsForUser(userId, conversations);
}

export async function loadUnreadMessageCount(userId: string) {
  return prisma.directMessage.count({
    where: {
      readAt: null,
      senderId: { not: userId },
      unsentAt: null,
      NOT: { hiddenFor: { some: { userId } } },
      conversation: {
        OR: [{ participantLowId: userId }, { participantHighId: userId }],
        ...activeConversationFilter(userId),
      },
    },
  });
}
