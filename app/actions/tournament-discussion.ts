'use server';

import { getServerSession } from 'next-auth';
import { revalidatePath } from 'next/cache';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { assertCanManageTournament } from '@/lib/tournament-host';
import {
  normalizeDiscussionContent,
  validateDiscussionContent,
  type TournamentDiscussionCursor,
  loadMoreDiscussionReplies,
  loadTournamentDiscussion,
} from '@/lib/tournament-discussion';

type ActionResult = { error?: string };

async function requireSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error('Sign in to join the discussion.');
  }
  return session.user;
}

async function getTournamentForDiscussion(tournamentId: string) {
  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId },
    select: { id: true, slug: true, createdById: true },
  });
  if (!tournament) throw new Error('Tournament not found.');
  return tournament;
}

function revalidateTournamentDiscussion(tournament: { id: string; slug: string | null }) {
  revalidatePath(`/tournaments/${tournament.id}`);
  if (tournament.slug) {
    revalidatePath(`/tournaments/${tournament.slug}`);
  }
}

export async function createTournamentDiscussionPost(
  tournamentId: string,
  content: string,
  isAnnouncement = false,
): Promise<ActionResult> {
  try {
    const user = await requireSession();
    const tournament = await getTournamentForDiscussion(tournamentId);
    const normalized = normalizeDiscussionContent(content);
    const validationError = validateDiscussionContent(normalized);
    if (validationError) return { error: validationError };

    const canManage = await assertCanManageTournament(tournamentId, user.id, user.role).then(
      () => true,
      () => false,
    );

    if (isAnnouncement && !canManage) {
      return { error: 'Only the organizer can post announcements.' };
    }

    await prisma.tournamentDiscussionPost.create({
      data: {
        tournamentId,
        userId: user.id,
        content: normalized,
        isAnnouncement: isAnnouncement && canManage,
        isPinned: isAnnouncement && canManage,
      },
    });

    revalidateTournamentDiscussion(tournament);
    return {};
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Could not post message.' };
  }
}

export async function createTournamentDiscussionReply(
  tournamentId: string,
  parentId: string,
  content: string,
): Promise<ActionResult> {
  try {
    const user = await requireSession();
    const tournament = await getTournamentForDiscussion(tournamentId);
    const normalized = normalizeDiscussionContent(content);
    const validationError = validateDiscussionContent(normalized);
    if (validationError) return { error: validationError };

    const parent = await prisma.tournamentDiscussionPost.findFirst({
      where: { id: parentId, tournamentId, parentId: null },
      select: { id: true },
    });
    if (!parent) return { error: 'Could not find the post to reply to.' };

    await prisma.tournamentDiscussionPost.create({
      data: {
        tournamentId,
        userId: user.id,
        parentId: parent.id,
        content: normalized,
      },
    });

    revalidateTournamentDiscussion(tournament);
    return {};
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Could not post reply.' };
  }
}

export async function deleteTournamentDiscussionPost(postId: string): Promise<ActionResult> {
  try {
    const user = await requireSession();
    const post = await prisma.tournamentDiscussionPost.findUnique({
      where: { id: postId },
      select: {
        id: true,
        userId: true,
        tournament: { select: { id: true, slug: true, createdById: true } },
      },
    });
    if (!post) return { error: 'Post not found.' };

    const canManage = await assertCanManageTournament(
      post.tournament.id,
      user.id,
      user.role,
    ).then(
      () => true,
      () => false,
    );

    if (post.userId !== user.id && !canManage) {
      return { error: 'You cannot delete this post.' };
    }

    await prisma.tournamentDiscussionPost.delete({ where: { id: post.id } });
    revalidateTournamentDiscussion(post.tournament);
    return {};
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Could not delete post.' };
  }
}

export async function editTournamentDiscussionAnnouncement(
  postId: string,
  content: string,
): Promise<ActionResult> {
  try {
    const user = await requireSession();
    const normalized = normalizeDiscussionContent(content);
    const validationError = validateDiscussionContent(normalized);
    if (validationError) return { error: validationError };

    const post = await prisma.tournamentDiscussionPost.findFirst({
      where: { id: postId, parentId: null, isAnnouncement: true },
      select: {
        id: true,
        content: true,
        userId: true,
        tournament: { select: { id: true, slug: true, createdById: true } },
      },
    });
    if (!post) return { error: 'Announcement not found.' };

    const canManage = await assertCanManageTournament(
      post.tournament.id,
      user.id,
      user.role,
    ).then(
      () => true,
      () => false,
    );

    if (!canManage && post.userId !== user.id) {
      return { error: 'You cannot edit this announcement.' };
    }

    if (post.content === normalized) {
      return {};
    }

    await prisma.tournamentDiscussionPost.update({
      where: { id: post.id },
      data: { content: normalized, editedAt: new Date() },
    });

    revalidateTournamentDiscussion(post.tournament);
    return {};
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Could not edit announcement.' };
  }
}

export async function toggleTournamentDiscussionPin(postId: string): Promise<ActionResult> {
  try {
    const user = await requireSession();
    const post = await prisma.tournamentDiscussionPost.findFirst({
      where: { id: postId, parentId: null },
      select: {
        id: true,
        isPinned: true,
        tournament: { select: { id: true, slug: true } },
      },
    });
    if (!post) return { error: 'Post not found.' };

    await assertCanManageTournament(post.tournament.id, user.id, user.role);

    await prisma.tournamentDiscussionPost.update({
      where: { id: post.id },
      data: { isPinned: !post.isPinned },
    });

    revalidateTournamentDiscussion(post.tournament);
    return {};
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Could not update pin.' };
  }
}

export async function fetchOlderTournamentDiscussionThreads(
  tournamentId: string,
  cursor: TournamentDiscussionCursor,
) {
  try {
    await getTournamentForDiscussion(tournamentId);
    return await loadTournamentDiscussion(tournamentId, { before: cursor });
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Could not load older messages.',
    };
  }
}

export async function fetchMoreTournamentDiscussionReplies(
  postId: string,
  beforeCreatedAt: string,
) {
  try {
    const post = await prisma.tournamentDiscussionPost.findFirst({
      where: { id: postId, parentId: null },
      select: { id: true, tournamentId: true },
    });
    if (!post) return { error: 'Post not found.' };

    const result = await loadMoreDiscussionReplies(post.id, new Date(beforeCreatedAt));
    return {
      replies: result.replies.map((reply) => ({
        ...reply,
        createdAt: reply.createdAt.toISOString(),
      })),
      replyCount: result.replyCount,
      hasMoreReplies: result.hasMoreReplies,
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Could not load replies.',
    };
  }
}
