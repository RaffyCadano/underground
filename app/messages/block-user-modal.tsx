'use client';

import { Ban } from 'lucide-react';
import { blockUserInConversation } from '@/app/actions/messages';
import { MessageConfirmModal, useMessageActionModal } from '@/app/messages/message-confirm-modal';

export function BlockUserModal({
  open,
  otherUsername,
  conversationId,
  onClose,
  onBlocked,
  onError,
}: {
  open: boolean;
  otherUsername: string;
  conversationId: string;
  onClose: () => void;
  onBlocked: () => void;
  onError?: (message: string) => void;
}) {
  const { error, isPending, runAction } = useMessageActionModal(open, onClose, onError);

  return (
    <MessageConfirmModal
      open={open}
      onClose={onClose}
      titleId="block-user-title"
      title="Block user?"
      subtitle="They won't be able to message you."
      icon={Ban}
      iconClassName="border-amber-500/30 bg-amber-500/10 text-amber-400"
      headerClassName="border-amber-500/20 bg-amber-500/5"
      username={otherUsername}
      usernameLabel="Player"
      description={
        <p>
          {otherUsername} will no longer be able to send you direct messages. You can unblock them
          later from your profile settings.
        </p>
      }
      confirmLabel="Block user"
      confirmingLabel="Blocking…"
      confirmIcon={Ban}
      confirmClassName="border border-amber-500/40 bg-amber-500/15 text-amber-200 hover:bg-amber-500/25"
      isPending={isPending}
      error={error}
      onConfirm={() => {
        runAction(() => blockUserInConversation(conversationId), onBlocked);
      }}
    />
  );
}
