'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Archive,
  ArrowLeft,
  BellDot,
  ExternalLink,
  Inbox,
  Loader2,
  MessageSquare,
  MessageSquarePlus,
  Search,
  User,
  X,
  type LucideIcon,
} from 'lucide-react';
import { findUserForNewMessage } from '@/app/actions/messages';
import { ConversationListItemRow } from '@/app/messages/conversation-list-item';
import { ConversationOptionsMenu } from '@/app/messages/conversation-options-menu';
import { MessageBubble } from '@/app/messages/message-bubble';
import { MessageComposer, type SentMessagePayload } from '@/app/messages/message-composer';
import { useLiveMessages } from '@/app/messages/use-live-messages';
import { PlayerAvatar } from '@/app/components/player-avatar';
import { ScrollReveal } from '@/app/components/scroll-reveal';
import { playerProfilePath } from '@/lib/player-profile';
import type { ThreadMessageView } from '@/lib/message-ui';

export type ConversationListItem = {
  id: string;
  updatedAt: string;
  other: {
    id: string;
    username: string;
    avatar: string | null;
  };
  lastMessage: {
    body: string;
    createdAt: string;
    senderId: string;
    isRead: boolean;
  } | null;
  unreadCount: number;
};

export type MessageThread = {
  id: string;
  other: {
    id: string;
    username: string;
    avatar: string | null;
  };
  messages: ThreadMessageView[];
};

type ComposeTarget = {
  id: string;
  username: string;
  avatar: string | null;
};

export type MessagesSidebarTab = 'all' | 'archive' | 'unread';

const SIDEBAR_TABS: { id: MessagesSidebarTab; label: string; icon: LucideIcon }[] = [
  { id: 'all', label: 'All', icon: Inbox },
  { id: 'archive', label: 'Archive', icon: Archive },
  { id: 'unread', label: 'Unread', icon: BellDot },
];

export function MessagesInbox({
  conversations: initialConversations,
  archivedConversations: initialArchivedConversations,
  sidebarTab: initialSidebarTab,
  selectedConversationId,
  thread: initialThread,
  composeUsername,
  initialComposeOpen,
  unreadTotal: initialUnreadTotal,
  imageUploadEnabled,
}: {
  conversations: ConversationListItem[];
  archivedConversations: ConversationListItem[];
  sidebarTab: MessagesSidebarTab;
  selectedConversationId: string | null;
  thread: MessageThread | null;
  composeUsername: string | null;
  initialComposeOpen: boolean;
  unreadTotal: number;
  imageUploadEnabled: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<MessagesSidebarTab>(initialSidebarTab);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(selectedConversationId);
  const {
    thread,
    conversations,
    archivedConversations,
    unreadTotal,
    refreshThread,
    refreshInbox,
    appendLocalMessage,
  } = useLiveMessages({
    conversationId: activeConversationId,
    initialThread,
    initialConversations,
    initialArchivedConversations,
    initialUnreadTotal,
  });
  const [error, setError] = useState('');
  const [composeOpen, setComposeOpen] = useState(initialComposeOpen);
  const [composeInput, setComposeInput] = useState(composeUsername ?? '');
  const [composeTarget, setComposeTarget] = useState<ComposeTarget | null>(null);
  const [composeLookupError, setComposeLookupError] = useState('');
  const [sidebarQuery, setSidebarQuery] = useState('');
  const [mobileShowInbox, setMobileShowInbox] = useState(false);
  const messagesScrollRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const prevConversationIdRef = useRef<string | null>(null);
  const prevMessageCountRef = useRef(0);

  const normalizedSidebarQuery = sidebarQuery.trim().toLowerCase();

  const tabConversations =
    activeTab === 'archive'
      ? archivedConversations
      : activeTab === 'unread'
        ? conversations.filter((conversation) => conversation.unreadCount > 0)
        : conversations;

  const filteredConversations = normalizedSidebarQuery
    ? tabConversations.filter((conversation) => {
        const username = conversation.other.username.toLowerCase();
        const preview = conversation.lastMessage?.body.toLowerCase() ?? '';
        return username.includes(normalizedSidebarQuery) || preview.includes(normalizedSidebarQuery);
      })
    : tabConversations;

  const sidebarHasThreads = conversations.length > 0 || archivedConversations.length > 0;
  const unreadInboxCount = conversations.filter((conversation) => conversation.unreadCount > 0).length;

  function setSidebarTab(tab: MessagesSidebarTab) {
    setActiveTab(tab);
    setActiveConversationId(null);
    setMobileShowInbox(true);

    const params = new URLSearchParams(searchParams.toString());
    if (tab === 'all') {
      params.delete('tab');
    } else {
      params.set('tab', tab);
    }
    params.delete('c');
    const query = params.toString();
    const path = query ? `/messages?${query}` : '/messages';
    window.history.replaceState(null, '', path);
  }

  const hasActiveConversation = Boolean(activeConversationId);
  const hasThread = Boolean(activeConversationId && thread);
  const showAsideOnMobile = !composeOpen && (!hasActiveConversation || mobileShowInbox);
  const showThreadPanelOnMobile = composeOpen || (hasActiveConversation && !mobileShowInbox);
  const hasConversations = tabConversations.length > 0;
  const firstTabConversation = tabConversations[0] ?? null;
  const activeConversationPreview =
    activeConversationId &&
    [...conversations, ...archivedConversations].find(
      (conversation) => conversation.id === activeConversationId,
    );

  function scrollThreadToBottom(behavior: ScrollBehavior = 'smooth') {
    const el = messagesScrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior });
  }

  function isNearThreadBottom(threshold = 120) {
    const el = messagesScrollRef.current;
    if (!el) return true;
    return el.scrollHeight - el.scrollTop - el.clientHeight < threshold;
  }

  useEffect(() => {
    const conversationChanged = activeConversationId !== prevConversationIdRef.current;
    prevConversationIdRef.current = activeConversationId;

    const messageCount = thread?.messages.length ?? 0;
    const messagesGrew = messageCount > prevMessageCountRef.current;
    prevMessageCountRef.current = messageCount;

    if (conversationChanged || (messagesGrew && isNearThreadBottom())) {
      requestAnimationFrame(() => {
        scrollThreadToBottom(conversationChanged ? 'auto' : 'smooth');
      });
    }
  }, [thread?.messages.length, activeConversationId]);

  async function handleThreadUpdated() {
    await refreshThread();
  }

  function handleMessageSent(sent?: SentMessagePayload) {
    if (sent) {
      appendLocalMessage({
        id: sent.messageId,
        body: sent.body,
        imageUrl: sent.imageUrl,
        senderId: sent.senderId,
        createdAt: sent.createdAt,
        editedAt: null,
        unsentAt: null,
        isMine: true,
        isRead: true,
        likeCount: 0,
        likedByMe: false,
      });
    }

    void Promise.all([refreshThread(), refreshInbox()]);
  }

  useEffect(() => {
    if (!composeUsername) return;
    setComposeOpen(true);
    setComposeInput(composeUsername);
    void lookupRecipient(composeUsername);
  }, [composeUsername]);

  useEffect(() => {
    setActiveTab(initialSidebarTab);
    setActiveConversationId(selectedConversationId);
  }, [initialSidebarTab, selectedConversationId]);

  useEffect(() => {
    if (selectedConversationId) {
      setMobileShowInbox(false);
    }
  }, [selectedConversationId]);

  function selectConversation(conversationId: string) {
    setComposeOpen(false);
    setMobileShowInbox(false);
    setError('');
    setActiveConversationId(conversationId);

    const params = new URLSearchParams(window.location.search);
    params.set('c', conversationId);
    if (activeTab !== 'all') {
      params.set('tab', activeTab);
    } else {
      params.delete('tab');
    }
    const query = params.toString();
    window.history.replaceState(null, '', `/messages?${query}`);
  }

  function openConversation(conversationId: string) {
    selectConversation(conversationId);
  }

  function openCompose() {
    setError('');
    setComposeLookupError('');
    setComposeTarget(null);
    setComposeInput('');
    setComposeOpen(true);
    setMobileShowInbox(false);
    router.push('/messages?new=1');
  }

  function closeCompose() {
    setComposeOpen(false);
    setComposeLookupError('');
    setComposeTarget(null);
    setMobileShowInbox(true);
    router.push('/messages');
  }

  async function lookupRecipient(username: string) {
    const trimmed = username.trim();
    if (!trimmed) {
      setComposeTarget(null);
      setComposeLookupError('');
      return;
    }

    const result = await findUserForNewMessage(trimmed);
    if ('error' in result && result.error) {
      setComposeTarget(null);
      setComposeLookupError(result.error);
      return;
    }

    if ('user' in result && result.user) {
      setComposeTarget(result.user);
      setComposeLookupError('');
    }
  }

  function messageGroupMeta(messages: ThreadMessageView[], index: number) {
    const message = messages[index];
    const prev = messages[index - 1];
    const next = messages[index + 1];

    const isUnsent = Boolean(message.unsentAt);
    const prevUnsent = Boolean(prev?.unsentAt);
    const sameSenderAsPrev =
      prev && prev.senderId === message.senderId && !prevUnsent && !isUnsent;
    const sameSenderAsNext =
      next && next.senderId === message.senderId && !next?.unsentAt && !isUnsent;

    const isNewTurn = !prev || prev.senderId !== message.senderId || prevUnsent || isUnsent;

    return {
      isGrouped: Boolean(sameSenderAsPrev),
      isNewTurn,
      showAvatar: !message.isMine && !sameSenderAsNext && !isUnsent,
    };
  }

  return (
    <div className="w-full overflow-x-hidden">
      <section className="relative hidden border-b border-slate-800 py-0 lg:block">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(34,197,94,0.1),transparent)]" />
        <div className="container relative py-6 xl:py-8">
          <ScrollReveal className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="min-w-0 space-y-1">
              <h1 className="text-2xl font-semibold tracking-tight text-white xl:text-3xl">Messages</h1>
              <p className="max-w-2xl text-sm leading-relaxed text-slate-400 xl:text-base">
                Chat with organizers, opponents, and bladers on the circuit.
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-3">
              {unreadTotal > 0 && (
                <span className="inline-flex items-center rounded-full border border-brand-500/30 bg-brand-500/10 px-3 py-1 text-xs font-semibold text-brand-200">
                  {unreadTotal} unread
                </span>
              )}
              <button
                type="button"
                onClick={openCompose}
                className="btn-primary inline-flex items-center justify-center gap-2 whitespace-nowrap"
              >
                <MessageSquarePlus size={16} />
                New message
              </button>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <section className="container flex min-h-0 flex-col overflow-hidden px-2 pb-2 sm:px-6 sm:pb-8 max-lg:h-[min(32rem,calc(100dvh-7rem))] max-lg:max-h-[min(32rem,calc(100dvh-7rem))] lg:px-4 lg:pb-10 lg:overflow-visible xl:pb-12">
        <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-slate-800 bg-slate-950/80 shadow-2xl shadow-black/30 lg:rounded-2xl">
          <div className="relative grid h-full min-h-0 overflow-hidden lg:h-[38rem] lg:max-h-[38rem] lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] xl:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
              {/* Conversation list */}
              <aside
                className={`flex h-full min-h-0 flex-col overflow-hidden bg-gradient-to-b from-slate-950/90 via-slate-950/70 to-slate-950/50 max-lg:absolute max-lg:inset-0 max-lg:z-10 lg:relative lg:z-auto lg:border-r lg:border-slate-800 ${
                  showAsideOnMobile ? 'flex' : 'hidden lg:flex'
                }`}
              >
                <div className="shrink-0 space-y-3 border-b border-slate-800/80 bg-slate-950/40 p-3 sm:p-3.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-2.5">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-brand-500/25 bg-brand-500/10 shadow-sm shadow-brand-500/10">
                        <MessageSquare size={17} className="text-brand-400" />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-white sm:text-base">Messages</p>
                        <p className="truncate text-[11px] text-slate-500 sm:text-xs">
                          {unreadTotal > 0 ? (
                            <span className="text-brand-400">{unreadTotal} unread</span>
                          ) : (
                            'Chat with bladers on the circuit'
                          )}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={openCompose}
                      className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-xl border border-brand-500/35 bg-brand-500/10 px-2.5 text-brand-300 transition hover:border-brand-400/50 hover:bg-brand-500/20 hover:text-brand-200 sm:px-3 lg:h-9 lg:w-9 lg:gap-0 lg:px-0"
                      aria-label="New message"
                    >
                      <MessageSquarePlus size={18} className="shrink-0" />
                      <span className="text-xs font-semibold lg:sr-only">New message</span>
                    </button>
                  </div>

                  <div className="group relative focus-within:ring-1 focus-within:ring-brand-500/30 focus-within:ring-offset-0 rounded-xl">
                    <Search
                      size={15}
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 transition group-focus-within:text-brand-400"
                    />
                    <input
                      type="search"
                      value={sidebarQuery}
                      onChange={(e) => setSidebarQuery(e.target.value)}
                      placeholder="Search conversations…"
                      className="input w-full rounded-xl border-slate-800/90 bg-slate-900/70 py-2 pl-9 pr-9 text-sm placeholder:text-slate-600 focus:border-brand-500/40"
                      aria-label="Search conversations"
                    />
                    {sidebarQuery && (
                      <button
                        type="button"
                        onClick={() => setSidebarQuery('')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-500 transition hover:bg-slate-800 hover:text-slate-300"
                        aria-label="Clear search"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-1 rounded-xl border border-slate-800/80 bg-slate-900/50 p-1">
                    {SIDEBAR_TABS.map((tab) => {
                      const active = activeTab === tab.id;
                      const TabIcon = tab.icon;
                      const badge =
                        tab.id === 'unread' && unreadInboxCount > 0 ? unreadInboxCount : null;
                      return (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setSidebarTab(tab.id)}
                          className={`relative flex min-w-0 flex-col items-center justify-center gap-0.5 rounded-lg px-1.5 py-2 text-[10px] font-semibold transition sm:flex-row sm:gap-1.5 sm:py-1.5 sm:text-[11px] ${
                            active
                              ? 'border border-brand-500/30 bg-brand-500/10 text-white shadow-sm shadow-brand-500/5'
                              : 'border border-transparent text-slate-500 hover:bg-slate-800/60 hover:text-slate-300'
                          }`}
                        >
                          <TabIcon
                            size={14}
                            className={active ? 'text-brand-400' : 'text-slate-500'}
                          />
                          <span className="truncate">{tab.label}</span>
                          {badge != null && (
                            <span className="absolute -right-0.5 -top-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-500 px-1 text-[9px] font-bold text-white ring-2 ring-slate-950">
                              {badge > 9 ? '9+' : badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                  {!sidebarHasThreads ? (
                    <div className="m-3 rounded-xl border border-dashed border-slate-800 bg-slate-900/30 px-4 py-10 text-center">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-slate-800 bg-slate-900/80">
                        <MessageSquare size={22} className="text-slate-500" />
                      </div>
                      <p className="mt-4 text-sm font-medium text-white">No conversations yet</p>
                      <p className="mt-1 text-xs text-slate-500">Start a thread with another blader.</p>
                      <button
                        type="button"
                        onClick={openCompose}
                        className="btn-primary mt-5 inline-flex items-center gap-2 text-xs"
                      >
                        <MessageSquarePlus size={14} />
                        New message
                      </button>
                    </div>
                  ) : !hasConversations ? (
                    <div className="m-3 rounded-xl border border-dashed border-slate-800 bg-slate-900/30 px-4 py-10 text-center">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-slate-800 bg-slate-900/80">
                        {activeTab === 'archive' ? (
                          <Archive size={22} className="text-slate-500" />
                        ) : activeTab === 'unread' ? (
                          <BellDot size={22} className="text-slate-500" />
                        ) : (
                          <Inbox size={22} className="text-slate-500" />
                        )}
                      </div>
                      <p className="mt-4 text-sm font-medium text-white">
                        {activeTab === 'archive'
                          ? 'No archived chats'
                          : activeTab === 'unread'
                            ? "You're all caught up"
                            : 'No conversations yet'}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {activeTab === 'archive'
                          ? 'Archived threads will appear here.'
                          : activeTab === 'unread'
                            ? 'No unread messages right now.'
                            : 'Start a thread with another blader.'}
                      </p>
                    </div>
                  ) : filteredConversations.length === 0 ? (
                    <div className="m-3 rounded-xl border border-dashed border-slate-800 bg-slate-900/30 px-4 py-10 text-center">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-slate-800 bg-slate-900/80">
                        <Search size={20} className="text-slate-500" />
                      </div>
                      <p className="mt-4 text-sm font-medium text-white">No matches</p>
                      <p className="mt-1 text-xs text-slate-500">
                        Nothing matched &ldquo;{sidebarQuery.trim()}&rdquo;
                      </p>
                    </div>
                  ) : (
                    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                      <div className="flex shrink-0 items-center justify-between gap-2 px-4 pb-1.5 pt-3">
                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                          {activeTab === 'archive'
                            ? 'Archived'
                            : activeTab === 'unread'
                              ? 'Unread'
                              : 'Recent chats'}
                        </p>
                        <span className="rounded-full border border-slate-800 bg-slate-900/60 px-2 py-0.5 text-[10px] font-medium tabular-nums text-slate-500">
                          {filteredConversations.length}
                        </span>
                      </div>
                      <ul
                        className="min-h-0 flex-1 space-y-0.5 overflow-y-auto overscroll-y-contain px-2 pb-3"
                        data-lenis-prevent
                      >
                        {filteredConversations.map((conversation) => (
                          <ConversationListItemRow
                            key={conversation.id}
                            conversation={conversation}
                            active={conversation.id === activeConversationId}
                            isArchived={activeTab === 'archive'}
                            selectedConversationId={activeConversationId}
                            onSelect={selectConversation}
                          />
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </aside>

              {/* Thread / compose */}
              <div
                className={`flex h-full min-h-0 min-w-0 flex-col overflow-hidden max-lg:absolute max-lg:inset-0 max-lg:z-20 lg:relative lg:z-auto ${
                  showThreadPanelOnMobile ? 'flex' : 'hidden lg:flex'
                }`}
              >
                {composeOpen ? (
                  <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                    <div className="flex shrink-0 items-center gap-3 border-b border-slate-800 px-4 py-3 sm:px-5">
                      <button
                        type="button"
                        onClick={closeCompose}
                        className="inline-flex items-center gap-1 text-sm font-semibold text-slate-400 transition hover:text-white lg:hidden"
                      >
                        <ArrowLeft size={16} />
                        Back
                      </button>
                      <div>
                        <p className="text-sm font-semibold text-white">New message</p>
                        <p className="text-xs text-slate-500">Message another blader by username</p>
                      </div>
                    </div>

                    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-[radial-gradient(ellipse_at_top,rgba(15,23,42,0.4),transparent_60%)] p-4 sm:p-5">
                      <label htmlFor="compose-to" className="text-xs font-medium text-slate-400">
                        To
                      </label>
                      <div className="relative mt-2">
                        <User
                          size={16}
                          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                        />
                        <input
                          id="compose-to"
                          type="text"
                          value={composeInput}
                          onChange={(e) => {
                            setComposeInput(e.target.value);
                            void lookupRecipient(e.target.value);
                          }}
                          placeholder="Username"
                          className="input w-full rounded-xl pl-9"
                          autoFocus
                        />
                      </div>
                      {composeLookupError && (
                        <p className="mt-2 text-xs font-medium text-red-400">{composeLookupError}</p>
                      )}
                      {composeTarget && (
                        <div className="mt-4 flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/50 px-3 py-2.5">
                          <PlayerAvatar username={composeTarget.username} avatar={composeTarget.avatar} size="md" />
                          <div>
                            <p className="text-sm font-semibold text-white">{composeTarget.username}</p>
                            <Link
                              href={playerProfilePath(composeTarget.username)}
                              className="text-xs text-slate-500 hover:text-brand-300"
                            >
                              View profile
                            </Link>
                          </div>
                        </div>
                      )}

                      {composeTarget && (
                        <div className="mt-auto">
                          <MessageComposer
                            recipientUsername={composeTarget.username}
                            placeholder="Write your message…"
                            imageUploadEnabled={false}
                            disabled={!composeTarget}
                            variant="embedded"
                            onSent={(payload) => {
                              setComposeOpen(false);
                              if (payload?.conversationId) {
                                router.push(`/messages?c=${encodeURIComponent(payload.conversationId)}`);
                              }
                              router.refresh();
                            }}
                            onError={setError}
                          />
                        </div>
                      )}
                      {error && !composeTarget && (
                        <p className="mt-2 text-xs font-medium text-red-400">{error}</p>
                      )}
                    </div>
                  </div>
                ) : hasThread && thread ? (
                  <div className="flex h-full min-h-0 flex-col overflow-hidden">
                    <div className="flex shrink-0 items-center justify-between gap-2 border-b border-slate-800/80 bg-slate-950/90 px-3 py-2 sm:px-4">
                      <div className="flex min-w-0 items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setMobileShowInbox(true)}
                          className="inline-flex shrink-0 rounded-lg p-1 text-slate-400 transition hover:bg-slate-800 hover:text-white lg:hidden"
                          aria-label="Back to conversations"
                        >
                          <ArrowLeft size={18} />
                        </button>
                        <Link
                          href={playerProfilePath(thread.other.username)}
                          className="flex min-w-0 items-center gap-2.5 transition hover:opacity-90"
                        >
                          <PlayerAvatar username={thread.other.username} avatar={thread.other.avatar} size="sm" />
                          <div className="min-w-0 leading-tight">
                            <p className="truncate text-sm font-semibold text-white">{thread.other.username}</p>
                            <p className="text-[11px] text-slate-500">View profile</p>
                          </div>
                        </Link>
                      </div>
                      <div className="flex shrink-0 items-center gap-1.5">
                        <Link
                          href={playerProfilePath(thread.other.username)}
                          className="hidden rounded-lg border border-slate-800 p-1.5 text-slate-400 transition hover:border-slate-700 hover:text-white sm:inline-flex"
                          aria-label="Open profile"
                        >
                          <ExternalLink size={15} />
                        </Link>
                        <ConversationOptionsMenu
                          conversationId={thread.id}
                          otherUsername={thread.other.username}
                          isArchived={
                            activeTab === 'archive' ||
                            archivedConversations.some((conversation) => conversation.id === thread.id)
                          }
                          variant="header"
                        />
                      </div>
                    </div>

                    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-slate-950/40">
                      <div
                        ref={messagesScrollRef}
                        className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-y-contain px-3 py-2 sm:px-4 [-webkit-overflow-scrolling:touch]"
                        data-lenis-prevent
                      >
                        {thread.messages.length === 0 ? (
                          <div className="flex min-h-full flex-col items-center justify-center py-16 text-center">
                            <PlayerAvatar username={thread.other.username} avatar={thread.other.avatar} size="xl" />
                            <p className="mt-4 text-sm font-medium text-white">{thread.other.username}</p>
                            <p className="mt-1 text-sm text-slate-500">
                              No messages yet. Say hello!
                            </p>
                          </div>
                        ) : (
                          <div className="flex min-h-full flex-col justify-end">
                            {thread.messages.map((message, index) => {
                              const { isGrouped, isNewTurn, showAvatar } = messageGroupMeta(
                                thread.messages,
                                index,
                              );
                              return (
                                <MessageBubble
                                  key={message.id}
                                  message={message}
                                  onUpdated={handleThreadUpdated}
                                  isGrouped={isGrouped}
                                  isNewTurn={isNewTurn}
                                  isFirst={index === 0}
                                  showAvatar={showAvatar}
                                  otherUsername={thread.other.username}
                                  otherAvatar={thread.other.avatar}
                                />
                              );
                            })}
                            <div ref={messagesEndRef} aria-hidden />
                          </div>
                        )}
                      </div>

                      <div className="shrink-0 px-3 sm:px-4">
                        <MessageComposer
                          conversationId={thread.id}
                          placeholder={`Message ${thread.other.username}…`}
                          imageUploadEnabled={imageUploadEnabled}
                          variant="thread"
                          onSent={handleMessageSent}
                          onError={setError}
                        />
                      </div>
                      {error && (
                        <p className="shrink-0 px-3 pb-2 text-xs font-medium text-red-400 sm:px-4">{error}</p>
                      )}
                    </div>
                  </div>
                ) : activeConversationId && !thread && activeConversationPreview ? (
                  <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                    <div className="flex shrink-0 items-center justify-between gap-2 border-b border-slate-800/80 bg-slate-950/90 px-3 py-2 sm:px-4">
                      <div className="flex min-w-0 items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setMobileShowInbox(true)}
                          className="inline-flex shrink-0 rounded-lg p-1 text-slate-400 transition hover:bg-slate-800 hover:text-white lg:hidden"
                          aria-label="Back to conversations"
                        >
                          <ArrowLeft size={18} />
                        </button>
                        <div className="flex min-w-0 items-center gap-2.5">
                          <PlayerAvatar
                            username={activeConversationPreview.other.username}
                            avatar={activeConversationPreview.other.avatar}
                            size="sm"
                          />
                          <div className="min-w-0 leading-tight">
                            <p className="truncate text-sm font-semibold text-white">
                              {activeConversationPreview.other.username}
                            </p>
                            <p className="text-[11px] text-slate-500">Loading messages…</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex min-h-0 flex-1 items-center justify-center bg-slate-950/40">
                      <Loader2 size={28} className="animate-spin text-brand-400" aria-label="Loading conversation" />
                    </div>
                  </div>
                ) : activeConversationId && !thread ? (
                  <div className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
                    <p className="text-sm font-semibold text-white">Couldn&apos;t load this conversation</p>
                    <p className="mt-2 max-w-sm text-sm text-slate-400">
                      Try again or pick another thread from the sidebar.
                    </p>
                    <Link href="/messages" className="btn-secondary mt-6 inline-flex items-center gap-2">
                      Back to inbox
                    </Link>
                  </div>
                ) : (
                  <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-6 py-16 text-center max-lg:hidden">
                    <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900 text-brand-400">
                      <MessageSquare size={24} />
                    </span>
                    <h2 className="mt-4 text-lg font-semibold text-white">Select a conversation</h2>
                    <p className="mt-2 max-w-sm text-sm text-slate-400">
                      {hasConversations
                        ? 'Click a name on the left to read and reply.'
                        : 'Start a new message with another blader.'}
                    </p>
                    {firstTabConversation ? (
                      <button
                        type="button"
                        onClick={() => openConversation(firstTabConversation.id)}
                        className="btn-primary mt-6 inline-flex items-center gap-2"
                      >
                        Open {firstTabConversation.other.username}
                      </button>
                    ) : (
                      <button type="button" onClick={openCompose} className="btn-primary mt-6 inline-flex items-center gap-2">
                        <MessageSquarePlus size={16} />
                        New message
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
      </section>
    </div>
  );
}
