'use client';

import { Archive } from 'lucide-react';
import { archiveConversation } from '@/app/actions/messages';
import { MessageConfirmModal, useMessageActionModal } from '@/app/messages/message-confirm-modal';

export function ArchiveChatModal({
  open,
  otherUsername,
  conversationId,
  onClose,
  onArchived,
  onError,
}: {
  open: boolean;
  otherUsername: string;
  conversationId: string;
  onClose: () => void;
  onArchived: () => void;
  onError?: (message: string) => void;
}) {
  const { error, isPending, runAction } = useMessageActionModal(open, onClose, onError);

  return (
    <MessageConfirmModal
      open={open}
      onClose={onClose}
      titleId="archive-chat-title"
      title="Archive chat?"
      subtitle="Move this thread out of your inbox."
      icon={Archive}
      iconClassName="border-brand-500/30 bg-brand-500/10 text-brand-400"
      headerClassName="border-brand-500/20 bg-brand-500/5"
      username={otherUsername}
      usernameLabel="Conversation"
      description={
        <p>
          This chat with {otherUsername} will be moved to your Archive tab. You can unarchive it
          anytime and no messages will be deleted.
        </p>
      }
      confirmLabel="Archive chat"
      confirmingLabel="Archiving…"
      confirmIcon={Archive}
      confirmClassName="border border-brand-500/40 bg-brand-500/15 text-brand-200 hover:bg-brand-500/25"
      isPending={isPending}
      error={error}
      onConfirm={() => {
        runAction(() => archiveConversation(conversationId), onArchived);
      }}
    />
  );
}
