'use client';

import { useState } from 'react';
import { ConversationOptionsMenu } from '@/app/messages/conversation-options-menu';
import { PlayerAvatar } from '@/app/components/player-avatar';
import { formatMessagePreview, formatMessageTimestamp } from '@/lib/conversations';
import type { ConversationListItem } from '@/app/messages/messages-inbox';

export function ConversationListItemRow({
  conversation,
  active,
  isArchived = false,
  selectedConversationId,
  onSelect,
}: {
  conversation: ConversationListItem;
  active: boolean;
  isArchived?: boolean;
  selectedConversationId: string | null;
  onSelect: (conversationId: string) => void;
}) {
  const [error, setError] = useState('');

  const unread = conversation.unreadCount > 0;
  const preview = conversation.lastMessage
    ? formatMessagePreview(conversation.lastMessage.body)
    : 'No messages yet';
  const previewTime = conversation.lastMessage
    ? formatMessageTimestamp(new Date(conversation.lastMessage.createdAt))
    : formatMessageTimestamp(new Date(conversation.updatedAt));

  return (
    <li className="group relative">
      <button
        type="button"
        onClick={() => onSelect(conversation.id)}
        className={`relative flex w-full items-center gap-3 rounded-xl px-2.5 py-2.5 pr-10 text-left transition ${
          active
            ? 'border border-brand-500/30 bg-brand-500/10 shadow-sm shadow-brand-500/5'
            : 'border border-transparent hover:border-slate-800/80 hover:bg-slate-900/60'
        }`}
      >
        <PlayerAvatar
          username={conversation.other.username}
          avatar={conversation.other.avatar}
          size="md"
          className={`ring-2 ring-offset-2 ring-offset-slate-950 ${
            active ? 'ring-brand-500/40' : unread ? 'ring-brand-500/20' : 'ring-transparent'
          }`}
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <p
              className={`truncate text-sm ${
                unread ? 'font-bold text-white' : active ? 'font-semibold text-brand-100' : 'font-medium text-slate-200'
              }`}
            >
              {conversation.other.username}
            </p>
            <span
              className={`shrink-0 text-[10px] ${
                unread ? 'font-medium text-brand-400' : 'text-slate-500'
              }`}
            >
              {previewTime}
            </span>
          </div>
          <p
            className={`mt-0.5 truncate text-xs ${
              unread ? 'font-medium text-slate-300' : 'text-slate-500'
            }`}
          >
            {preview}
          </p>
        </div>
        {unread && (
          <span className="inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-brand-500 px-1.5 text-[10px] font-bold text-white">
            {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
          </span>
        )}
      </button>

      <ConversationOptionsMenu
        conversationId={conversation.id}
        otherUsername={conversation.other.username}
        isArchived={isArchived}
        isSelected={selectedConversationId === conversation.id}
        onError={setError}
      />

      {error && (
        <p className="px-3 pb-2 text-[11px] text-red-400">{error}</p>
      )}
    </li>
  );
}
