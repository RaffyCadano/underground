'use client';

import { AlertTriangle, Trash2 } from 'lucide-react';
import { deleteConversationForUser } from '@/app/actions/messages';
import { MessageConfirmModal, useMessageActionModal } from '@/app/messages/message-confirm-modal';

export function DeleteChatModal({
  open,
  otherUsername,
  conversationId,
  onClose,
  onDeleted,
  onError,
}: {
  open: boolean;
  otherUsername: string;
  conversationId: string;
  onClose: () => void;
  onDeleted: () => void;
  onError?: (message: string) => void;
}) {
  const { error, isPending, runAction } = useMessageActionModal(open, onClose, onError);

  return (
    <MessageConfirmModal
      open={open}
      onClose={onClose}
      titleId="delete-chat-title"
      title="Delete chat?"
      subtitle="This only removes the chat for you."
      icon={AlertTriangle}
      iconClassName="border-red-500/30 bg-red-500/10 text-red-400"
      headerClassName="border-red-500/20 bg-red-500/5"
      username={otherUsername}
      usernameLabel="Conversation"
      description={
        <p>
          Your copy of this thread will be removed from your inbox. {otherUsername} will still have
          their messages.
        </p>
      }
      confirmLabel="Delete chat"
      confirmingLabel="Deleting…"
      confirmIcon={Trash2}
      confirmClassName="border border-red-500/40 bg-red-500/15 text-red-300 hover:bg-red-500/25"
      isPending={isPending}
      error={error}
      onConfirm={() => {
        runAction(() => deleteConversationForUser(conversationId), onDeleted);
      }}
    />
  );
}
