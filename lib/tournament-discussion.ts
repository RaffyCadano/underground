import { prisma } from '@/lib/prisma';

export const TOURNAMENT_DISCUSSION_MAX_LENGTH = 2000;
export const DISCUSSION_THREADS_PAGE_SIZE = 25;
export const DISCUSSION_REPLIES_PREVIEW = 15;

const authorSelect = {
  id: true,
  username: true,
  avatar: true,
} as const;

const replySelect = {
  id: true,
  content: true,
  createdAt: true,
  user: { select: authorSelect },
} as const;

export type TournamentDiscussionAuthor = {
  id: string;
  username: string;
  avatar: string | null;
};

export type TournamentDiscussionReply = {
  id: string;
  content: string;
  createdAt: Date;
  user: TournamentDiscussionAuthor;
};

export type TournamentDiscussionThreadPost = {
  id: string;
  content: string;
  isPinned: boolean;
  isAnnouncement: boolean;
  editedAt: Date | null;
  createdAt: Date;
  user: TournamentDiscussionAuthor;
  replies: TournamentDiscussionReply[];
  replyCount: number;
  hasMoreReplies: boolean;
};

export type TournamentDiscussionCursor = {
  createdAt: string;
  id: string;
};

export type TournamentDiscussionPage = {
  posts: TournamentDiscussionThreadPost[];
  totalMessageCount: number;
  hasOlderThreads: boolean;
  oldestThreadCursor: TournamentDiscussionCursor | null;
};

export function normalizeDiscussionContent(raw: string) {
  return raw.replace(/\r\n/g, '\n').trim();
}

export function validateDiscussionContent(content: string): string | null {
  if (!content) return 'Message cannot be empty.';
  if (content.length > TOURNAMENT_DISCUSSION_MAX_LENGTH) {
    return `Message must be ${TOURNAMENT_DISCUSSION_MAX_LENGTH} characters or fewer.`;
  }
  return null;
}

function threadCursorFromPost(post: { createdAt: Date; id: string }): TournamentDiscussionCursor {
  return { createdAt: post.createdAt.toISOString(), id: post.id };
}

function parseThreadCursor(cursor: TournamentDiscussionCursor) {
  return { createdAt: new Date(cursor.createdAt), id: cursor.id };
}

async function attachReplyPreviews(
  posts: {
    id: string;
    content: string;
    isPinned: boolean;
    isAnnouncement: boolean;
    editedAt: Date | null;
    createdAt: Date;
    user: TournamentDiscussionAuthor;
  }[],
): Promise<TournamentDiscussionThreadPost[]> {
  return Promise.all(
    posts.map(async (post) => {
      const [replyCount, replies] = await Promise.all([
        prisma.tournamentDiscussionPost.count({ where: { parentId: post.id } }),
        prisma.tournamentDiscussionPost.findMany({
          where: { parentId: post.id },
          orderBy: { createdAt: 'desc' },
          take: DISCUSSION_REPLIES_PREVIEW,
          select: replySelect,
        }),
      ]);

      return {
        ...post,
        replyCount,
        hasMoreReplies: replyCount > replies.length,
        replies: replies.reverse(),
      };
    }),
  );
}

export async function loadTournamentDiscussion(
  tournamentId: string,
  options?: { before?: TournamentDiscussionCursor },
): Promise<TournamentDiscussionPage> {
  const [totalMessageCount, threads] = await Promise.all([
    prisma.tournamentDiscussionPost.count({ where: { tournamentId } }),
    prisma.tournamentDiscussionPost.findMany({
      where: {
        tournamentId,
        parentId: null,
        ...(options?.before
          ? {
              OR: [
                { createdAt: { lt: parseThreadCursor(options.before).createdAt } },
                {
                  createdAt: parseThreadCursor(options.before).createdAt,
                  id: { lt: parseThreadCursor(options.before).id },
                },
              ],
            }
          : {}),
      },
      orderBy: options?.before
        ? [{ createdAt: 'desc' }, { id: 'desc' }]
        : [{ isPinned: 'desc' }, { createdAt: 'desc' }, { id: 'desc' }],
      take: DISCUSSION_THREADS_PAGE_SIZE + 1,
      select: {
        id: true,
        content: true,
        isPinned: true,
        isAnnouncement: true,
        editedAt: true,
        createdAt: true,
        user: { select: authorSelect },
      },
    }),
  ]);

  const hasOlderThreads = threads.length > DISCUSSION_THREADS_PAGE_SIZE;
  const pageThreads = hasOlderThreads
    ? threads.slice(0, DISCUSSION_THREADS_PAGE_SIZE)
    : threads;
  const posts = await attachReplyPreviews(pageThreads);
  const oldest = pageThreads.length > 0 ? pageThreads[pageThreads.length - 1] : undefined;

  return {
    posts,
    totalMessageCount,
    hasOlderThreads,
    oldestThreadCursor: oldest ? threadCursorFromPost(oldest) : null,
  };
}

export async function loadMoreDiscussionReplies(postId: string, beforeCreatedAt: Date) {
  const replyCount = await prisma.tournamentDiscussionPost.count({ where: { parentId: postId } });
  const replies = await prisma.tournamentDiscussionPost.findMany({
    where: { parentId: postId, createdAt: { lt: beforeCreatedAt } },
    orderBy: { createdAt: 'desc' },
    take: DISCUSSION_REPLIES_PREVIEW,
    select: replySelect,
  });

  const loaded = replies.reverse();
  const oldestLoaded = loaded[0]?.createdAt ?? beforeCreatedAt;
  const olderRemaining = await prisma.tournamentDiscussionPost.count({
    where: { parentId: postId, createdAt: { lt: oldestLoaded } },
  });

  return {
    replies: loaded as TournamentDiscussionReply[],
    replyCount,
    hasMoreReplies: olderRemaining > 0,
  };
}

export async function countTournamentDiscussionPosts(tournamentId: string) {
  return prisma.tournamentDiscussionPost.count({ where: { tournamentId } });
}
