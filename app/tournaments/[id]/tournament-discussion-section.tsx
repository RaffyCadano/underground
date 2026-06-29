'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';
import { Loader2, Megaphone, MessageSquare, Pencil, Pin, PinOff, Reply, Trash2 } from 'lucide-react';
import {
  createTournamentDiscussionPost,
  createTournamentDiscussionReply,
  deleteTournamentDiscussionPost,
  editTournamentDiscussionAnnouncement,
  fetchMoreTournamentDiscussionReplies,
  fetchOlderTournamentDiscussionThreads,
  toggleTournamentDiscussionPin,
} from '@/app/actions/tournament-discussion';
import { PlayerAvatar } from '@/app/components/player-avatar';
import { DiscussionPostsLoadingSkeleton, DiscussionReplySkeleton } from './tournament-discussion-skeleton';
import {
  TOURNAMENT_DISCUSSION_MAX_LENGTH,
  type TournamentDiscussionCursor,
  type TournamentDiscussionThreadPost,
} from '@/lib/tournament-discussion';

function formatDiscussionTime(value: string) {
  const date = new Date(value);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
    hour: 'numeric',
    minute: '2-digit',
  });
}

function DiscussionComposer({
  placeholder,
  submitLabel,
  showAnnouncementToggle,
  disabled,
  onSubmit,
}: {
  placeholder: string;
  submitLabel: string;
  showAnnouncementToggle?: boolean;
  disabled?: boolean;
  onSubmit: (content: string, isAnnouncement: boolean) => Promise<{ error?: string }>;
}) {
  const [draft, setDraft] = useState('');
  const [isAnnouncement, setIsAnnouncement] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit() {
    setError(null);
    startTransition(async () => {
      const result = await onSubmit(draft, isAnnouncement);
      if (result.error) {
        setError(result.error);
        return;
      }
      setDraft('');
      setIsAnnouncement(false);
    });
  }

  return (
    <div className="space-y-3">
      <textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value.slice(0, TOURNAMENT_DISCUSSION_MAX_LENGTH))}
        placeholder={placeholder}
        rows={3}
        disabled={disabled || pending}
        className="w-full resize-y rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-brand-500/50 focus:outline-none focus:ring-1 focus:ring-brand-500/30 disabled:opacity-60"
      />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          {showAnnouncementToggle && (
            <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-slate-400">
              <input
                type="checkbox"
                checked={isAnnouncement}
                onChange={(e) => setIsAnnouncement(e.target.checked)}
                disabled={disabled || pending}
                className="rounded border-slate-600 bg-slate-900 text-brand-500 focus:ring-brand-500/40"
              />
              <Megaphone size={14} className="text-amber-400" />
              Post as announcement
            </label>
          )}
          <span className="text-xs text-slate-500">
            {draft.length}/{TOURNAMENT_DISCUSSION_MAX_LENGTH}
          </span>
        </div>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={disabled || pending || !draft.trim()}
          className="btn-primary inline-flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {pending ? <Loader2 size={15} className="animate-spin" /> : <MessageSquare size={15} />}
          {pending ? 'Posting…' : submitLabel}
        </button>
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  );
}

function DiscussionPost({
  post,
  tournamentId,
  currentUserId,
  isAdmin,
  onChanged,
}: {
  post: SerializedDiscussionPost;
  tournamentId: string;
  currentUserId: string | null;
  isAdmin: boolean;
  onChanged: () => void;
}) {
  const [replyOpen, setReplyOpen] = useState(false);
  const [replies, setReplies] = useState(post.replies);
  const [replyCount, setReplyCount] = useState(post.replyCount);
  const [hasMoreReplies, setHasMoreReplies] = useState(post.hasMoreReplies);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editDraft, setEditDraft] = useState(post.content);
  const [editError, setEditError] = useState<string | null>(null);
  const [displayContent, setDisplayContent] = useState(post.content);
  const [editedAt, setEditedAt] = useState(post.editedAt);
  const [pending, startTransition] = useTransition();
  const canDelete = Boolean(currentUserId && (currentUserId === post.user.id || isAdmin));
  const canEditAnnouncement = Boolean(
    post.isAnnouncement && currentUserId && (isAdmin || currentUserId === post.user.id),
  );

  useEffect(() => {
    setEditDraft(post.content);
    setDisplayContent(post.content);
    setEditedAt(post.editedAt);
  }, [post.content, post.editedAt]);

  function runAction(action: () => Promise<{ error?: string }>) {
    startTransition(async () => {
      const result = await action();
      if (!result.error) onChanged();
    });
  }

  async function loadMoreReplies() {
    const oldestReply = replies[0];
    if (!oldestReply) return;
    setLoadingReplies(true);
    const result = await fetchMoreTournamentDiscussionReplies(post.id, oldestReply.createdAt);
    setLoadingReplies(false);
    if ('error' in result && result.error) return;
    if ('replies' in result && result.replies) {
      setReplies((current) => [...result.replies!, ...current]);
      setReplyCount(result.replyCount ?? replyCount);
      setHasMoreReplies(result.hasMoreReplies ?? false);
    }
  }

  const hiddenReplyCount = Math.max(0, replyCount - replies.length);

  function saveAnnouncementEdit() {
    setEditError(null);
    startTransition(async () => {
      const result = await editTournamentDiscussionAnnouncement(post.id, editDraft);
      if (result.error) {
        setEditError(result.error);
        return;
      }
      setDisplayContent(editDraft.trim());
      setEditedAt(new Date().toISOString());
      setEditing(false);
      onChanged();
    });
  }

  return (
    <article
      className={`rounded-xl border p-4 sm:p-5 ${
        post.isAnnouncement
          ? 'border-amber-500/25 bg-amber-500/[0.04]'
          : post.isPinned
            ? 'border-brand-500/20 bg-brand-500/[0.03]'
            : 'border-slate-800 bg-slate-950/60'
      }`}
    >
      <div className="flex items-start gap-3">
        <Link href={`/players/${post.user.username}`} className="shrink-0">
          <PlayerAvatar username={post.user.username} avatar={post.user.avatar} size="md" />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <Link
              href={`/players/${post.user.username}`}
              className="font-semibold text-white hover:text-brand-300"
            >
              {post.user.username}
            </Link>
            <span className="text-xs text-slate-500">
              {formatDiscussionTime(post.createdAt)}
              {editedAt ? ' · edited' : ''}
            </span>
            {post.isAnnouncement && (
              <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-300">
                <Megaphone size={10} />
                Announcement
              </span>
            )}
            {post.isPinned && !post.isAnnouncement && (
              <span className="inline-flex items-center gap-1 rounded-full border border-brand-500/30 bg-brand-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-brand-300">
                <Pin size={10} />
                Pinned
              </span>
            )}
          </div>
          {editing ? (
            <div className="mt-3 space-y-3">
              <textarea
                value={editDraft}
                onChange={(e) =>
                  setEditDraft(e.target.value.slice(0, TOURNAMENT_DISCUSSION_MAX_LENGTH))
                }
                rows={4}
                disabled={pending}
                className="w-full resize-y rounded-xl border border-amber-500/30 bg-slate-950 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-amber-400/50 focus:outline-none focus:ring-1 focus:ring-amber-400/30 disabled:opacity-60"
              />
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={saveAnnouncementEdit}
                  disabled={pending || !editDraft.trim()}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-amber-500/40 bg-amber-500/15 px-3 py-1.5 text-xs font-semibold text-amber-100 transition hover:border-amber-400/60 hover:bg-amber-500/25 disabled:opacity-60"
                >
                  {pending ? <Loader2 size={13} className="animate-spin" /> : null}
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditing(false);
                    setEditDraft(displayContent);
                    setEditError(null);
                  }}
                  disabled={pending}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:border-slate-600 hover:text-white disabled:opacity-60"
                >
                  Cancel
                </button>
                <span className="text-xs text-slate-500">
                  {editDraft.length}/{TOURNAMENT_DISCUSSION_MAX_LENGTH}
                </span>
              </div>
              {editError && <p className="text-sm text-red-400">{editError}</p>}
            </div>
          ) : (
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-200">
              {displayContent}
            </p>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-2">
            {currentUserId && (
              <button
                type="button"
                onClick={() => setReplyOpen((open) => !open)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-slate-300 transition hover:border-slate-600 hover:text-white"
              >
                <Reply size={13} />
                Reply
              </button>
            )}
            {canEditAnnouncement && !editing && (
              <button
                type="button"
                onClick={() => {
                  setEditDraft(displayContent);
                  setEditError(null);
                  setEditing(true);
                }}
                className="inline-flex items-center gap-1.5 rounded-lg border border-amber-500/25 bg-amber-500/10 px-2.5 py-1.5 text-xs font-medium text-amber-200 transition hover:border-amber-400/40 hover:bg-amber-500/15"
              >
                <Pencil size={13} />
                Edit
              </button>
            )}
            {isAdmin && !editing && (
              <button
                type="button"
                onClick={() => runAction(() => toggleTournamentDiscussionPin(post.id))}
                disabled={pending}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-slate-300 transition hover:border-slate-600 hover:text-white disabled:opacity-60"
              >
                {post.isPinned ? <PinOff size={13} /> : <Pin size={13} />}
                {post.isPinned ? 'Unpin' : 'Pin'}
              </button>
            )}
            {canDelete && !editing && (
              <button
                type="button"
                onClick={() => runAction(() => deleteTournamentDiscussionPost(post.id))}
                disabled={pending}
                className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/20 bg-red-500/5 px-2.5 py-1.5 text-xs font-medium text-red-300 transition hover:border-red-500/35 hover:bg-red-500/10 disabled:opacity-60"
              >
                <Trash2 size={13} />
                Delete
              </button>
            )}
          </div>

          {replyOpen && currentUserId && (
            <div className="mt-4 border-t border-slate-800 pt-4">
              <DiscussionComposer
                placeholder="Write a reply…"
                submitLabel="Reply"
                disabled={pending}
                onSubmit={async (content) => {
                  const result = await createTournamentDiscussionReply(tournamentId, post.id, content);
                  if (!result.error) setReplyOpen(false);
                  return result;
                }}
              />
            </div>
          )}

          {replies.length > 0 && (
            <div className="mt-4 space-y-3 border-t border-slate-800 pt-4">
              {hasMoreReplies && (
                <div className="space-y-2">
                  {loadingReplies ? (
                    <>
                      <DiscussionReplySkeleton />
                      <DiscussionReplySkeleton />
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={loadMoreReplies}
                      className="text-xs font-medium text-brand-300 transition hover:text-brand-200"
                    >
                      {`Show ${hiddenReplyCount} earlier ${hiddenReplyCount === 1 ? 'reply' : 'replies'}`}
                    </button>
                  )}
                </div>
              )}
              {replies.map((reply) => {
                const canDeleteReply = Boolean(
                  currentUserId && (currentUserId === reply.user.id || isAdmin),
                );
                return (
                  <div key={reply.id} className="flex items-start gap-3 rounded-lg bg-slate-900/50 p-3">
                    <Link href={`/players/${reply.user.username}`} className="shrink-0">
                      <PlayerAvatar username={reply.user.username} avatar={reply.user.avatar} size="sm" />
                    </Link>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <Link
                          href={`/players/${reply.user.username}`}
                          className="text-sm font-semibold text-white hover:text-brand-300"
                        >
                          {reply.user.username}
                        </Link>
                        <span className="text-xs text-slate-500">
                          {formatDiscussionTime(reply.createdAt)}
                        </span>
                      </div>
                      <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-slate-300">
                        {reply.content}
                      </p>
                      {canDeleteReply && (
                        <button
                          type="button"
                          onClick={() =>
                            runAction(() => deleteTournamentDiscussionPost(reply.id))
                          }
                          disabled={pending}
                          className="mt-2 inline-flex items-center gap-1 text-xs text-red-300/80 transition hover:text-red-300 disabled:opacity-60"
                        >
                          <Trash2 size={12} />
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

type SerializedDiscussionPost = {
  id: string;
  content: string;
  isPinned: boolean;
  isAnnouncement: boolean;
  editedAt: string | null;
  createdAt: string;
  replyCount: number;
  hasMoreReplies: boolean;
  user: {
    id: string;
    username: string;
    avatar: string | null;
  };
  replies: {
    id: string;
    content: string;
    createdAt: string;
    user: {
      id: string;
      username: string;
      avatar: string | null;
    };
  }[];
};

function serializePosts(posts: TournamentDiscussionThreadPost[]): SerializedDiscussionPost[] {
  return posts.map((post) => ({
    ...post,
    createdAt: post.createdAt.toISOString(),
    editedAt: post.editedAt?.toISOString() ?? null,
    replies: post.replies.map((reply) => ({
      ...reply,
      createdAt: reply.createdAt.toISOString(),
    })),
  }));
}

function mergeThreadPages(
  current: SerializedDiscussionPost[],
  older: SerializedDiscussionPost[],
) {
  const seen = new Set(current.map((post) => post.id));
  return [...current, ...older.filter((post) => !seen.has(post.id))];
}

export function TournamentDiscussionSection({
  tournamentId,
  posts,
  totalMessageCount,
  hasOlderThreads,
  oldestThreadCursor,
  isLoggedIn,
  isAdmin,
  currentUserId,
}: {
  tournamentId: string;
  posts: TournamentDiscussionThreadPost[];
  totalMessageCount: number;
  hasOlderThreads: boolean;
  oldestThreadCursor: TournamentDiscussionCursor | null;
  isLoggedIn: boolean;
  isAdmin: boolean;
  currentUserId: string | null;
}) {
  const router = useRouter();
  const [threadPosts, setThreadPosts] = useState(() => serializePosts(posts));
  const [canLoadOlder, setCanLoadOlder] = useState(hasOlderThreads);
  const [threadCursor, setThreadCursor] = useState<TournamentDiscussionCursor | null>(
    oldestThreadCursor,
  );
  const [loadingOlder, setLoadingOlder] = useState(false);

  useEffect(() => {
    setThreadPosts(serializePosts(posts));
    setCanLoadOlder(hasOlderThreads);
    setThreadCursor(oldestThreadCursor);
  }, [posts, hasOlderThreads, oldestThreadCursor]);

  if (!isLoggedIn && posts.length === 0 && totalMessageCount === 0) {
    return null;
  }

  function refresh() {
    router.refresh();
  }

  async function loadOlderThreads() {
    if (!threadCursor || loadingOlder) return;
    setLoadingOlder(true);
    const result = await fetchOlderTournamentDiscussionThreads(tournamentId, threadCursor);
    setLoadingOlder(false);
    if ('error' in result && result.error) return;
    if ('posts' in result && result.posts) {
      setThreadPosts((current) => mergeThreadPages(current, serializePosts(result.posts!)));
      setCanLoadOlder(result.hasOlderThreads ?? false);
      setThreadCursor(result.oldestThreadCursor ?? null);
    }
  }

  return (
    <div className="card overflow-hidden" id="tournament-discussion">
      <div className="border-b border-slate-800 bg-slate-900/50 px-4 py-3.5 sm:px-5 sm:py-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Event chat</p>
            <h2 className="mt-0.5 text-sm font-semibold text-white">Discussion</h2>
          </div>
          {totalMessageCount > 0 && (
            <span className="rounded-full border border-slate-700 bg-slate-900 px-2.5 py-1 text-xs font-medium text-slate-400">
              {totalMessageCount} {totalMessageCount === 1 ? 'message' : 'messages'}
            </span>
          )}
        </div>
        <p className="mt-1 text-xs text-slate-500">
          Ask questions, share updates, and talk about this event with other players.
        </p>
      </div>

      <div className="space-y-5 p-4 sm:p-6">
        {isLoggedIn ? (
          <DiscussionComposer
            placeholder="Start a conversation or ask the organizer a question…"
            submitLabel="Post"
            showAnnouncementToggle={isAdmin}
            onSubmit={async (content, isAnnouncement) => {
              const result = await createTournamentDiscussionPost(
                tournamentId,
                content,
                isAnnouncement,
              );
              if (!result.error) refresh();
              return result;
            }}
          />
        ) : (
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm text-slate-400">
            <Link href="/login" className="font-medium text-brand-300 hover:text-brand-200">
              Sign in
            </Link>{' '}
            to join the discussion.
          </div>
        )}

        {threadPosts.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-800 px-4 py-8 text-center text-sm text-slate-500">
            No messages yet. Be the first to start the conversation.
          </div>
        ) : (
          <div className="space-y-4">
            {canLoadOlder && (
              <div className="space-y-4">
                {loadingOlder ? (
                  <DiscussionPostsLoadingSkeleton count={2} />
                ) : (
                  <div className="flex justify-center">
                    <button
                      type="button"
                      onClick={loadOlderThreads}
                      className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-300 transition hover:border-slate-600 hover:text-white"
                    >
                      Load older messages
                    </button>
                  </div>
                )}
              </div>
            )}
            {threadPosts.map((post) => (
              <DiscussionPost
                key={post.id}
                post={post}
                tournamentId={tournamentId}
                currentUserId={currentUserId}
                isAdmin={isAdmin}
                onChanged={refresh}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
