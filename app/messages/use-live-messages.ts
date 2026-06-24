'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { ThreadMessageView } from '@/lib/message-ui';
import type { ConversationListItem, MessageThread } from '@/app/messages/messages-inbox';

const THREAD_POLL_MS = 2_000;
const INBOX_POLL_MS = 4_000;

function threadSignature(thread: MessageThread) {
  return thread.messages
    .map(
      (message) =>
        `${message.id}:${message.createdAt}:${message.editedAt ?? ''}:${message.unsentAt ?? ''}:${message.likeCount}:${message.likedByMe}:${message.body.length}`,
    )
    .join('|');
}

function inboxSignature(
  conversations: ConversationListItem[],
  archivedConversations: ConversationListItem[],
  unreadTotal: number,
) {
  const summarize = (items: ConversationListItem[]) =>
    items
      .map(
        (item) =>
          `${item.id}:${item.updatedAt}:${item.unreadCount}:${item.lastMessage?.createdAt ?? ''}:${item.lastMessage?.body ?? ''}`,
      )
      .join('|');

  return `${unreadTotal}::${summarize(conversations)}::${summarize(archivedConversations)}`;
}

export function useLiveMessages({
  conversationId,
  initialThread,
  initialConversations,
  initialArchivedConversations,
  initialUnreadTotal,
}: {
  conversationId: string | null;
  initialThread: MessageThread | null;
  initialConversations: ConversationListItem[];
  initialArchivedConversations: ConversationListItem[];
  initialUnreadTotal: number;
}) {
  const [thread, setThread] = useState(initialThread);
  const [conversations, setConversations] = useState(initialConversations);
  const [archivedConversations, setArchivedConversations] = useState(initialArchivedConversations);
  const [unreadTotal, setUnreadTotal] = useState(initialUnreadTotal);

  const threadSignatureRef = useRef('');
  const inboxSignatureRef = useRef('');

  useEffect(() => {
    if (!conversationId) {
      setThread(null);
      threadSignatureRef.current = '';
      return;
    }

    setThread(initialThread);
    threadSignatureRef.current = initialThread ? threadSignature(initialThread) : '';
  }, [initialThread, conversationId]);

  useEffect(() => {
    setConversations(initialConversations);
    setArchivedConversations(initialArchivedConversations);
    setUnreadTotal(initialUnreadTotal);
    inboxSignatureRef.current = inboxSignature(
      initialConversations,
      initialArchivedConversations,
      initialUnreadTotal,
    );
  }, [initialConversations, initialArchivedConversations, initialUnreadTotal]);

  const appendLocalMessage = useCallback((message: ThreadMessageView) => {
    setThread((current) => {
      if (!current) return current;
      if (current.messages.some((item) => item.id === message.id)) {
        return current;
      }

      const next: MessageThread = {
        ...current,
        messages: [...current.messages, message],
      };
      threadSignatureRef.current = threadSignature(next);
      return next;
    });
  }, []);

  const refreshThread = useCallback(async () => {
    if (!conversationId) return;

    try {
      const response = await fetch(`/api/messages/thread/${encodeURIComponent(conversationId)}`, {
        cache: 'no-store',
      });
      if (!response.ok) return;

      const data = (await response.json()) as MessageThread;
      const signature = threadSignature(data);
      if (signature !== threadSignatureRef.current) {
        threadSignatureRef.current = signature;
        setThread(data);
      }
    } catch {
      // Ignore transient network errors during polling.
    }
  }, [conversationId]);

  const refreshInbox = useCallback(async () => {
    try {
      const response = await fetch('/api/messages/inbox', { cache: 'no-store' });
      if (!response.ok) return;

      const data = (await response.json()) as {
        conversations: ConversationListItem[];
        archivedConversations: ConversationListItem[];
        unreadTotal: number;
      };

      const signature = inboxSignature(
        data.conversations,
        data.archivedConversations,
        data.unreadTotal,
      );
      if (signature === inboxSignatureRef.current) return;

      inboxSignatureRef.current = signature;
      setConversations(data.conversations);
      setArchivedConversations(data.archivedConversations);
      setUnreadTotal(data.unreadTotal);
    } catch {
      // Ignore transient network errors during polling.
    }
  }, []);

  useEffect(() => {
    if (!conversationId) return;

    let cancelled = false;

    async function pollThread() {
      if (cancelled || document.visibilityState === 'hidden') return;
      await refreshThread();
    }

    void pollThread();
    const interval = window.setInterval(pollThread, THREAD_POLL_MS);

    function onVisibilityChange() {
      if (document.visibilityState === 'visible') {
        void pollThread();
      }
    }

    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [conversationId, refreshThread]);

  useEffect(() => {
    let cancelled = false;

    async function pollInbox() {
      if (cancelled || document.visibilityState === 'hidden') return;
      await refreshInbox();
    }

    void pollInbox();
    const interval = window.setInterval(pollInbox, INBOX_POLL_MS);

    function onVisibilityChange() {
      if (document.visibilityState === 'visible') {
        void pollInbox();
      }
    }

    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [refreshInbox]);

  return {
    thread,
    conversations,
    archivedConversations,
    unreadTotal,
    refreshThread,
    refreshInbox,
    appendLocalMessage,
  };
}
