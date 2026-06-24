'use client';

import { Flag } from 'lucide-react';
import { reportDirectMessage } from '@/app/actions/messages';
import { MessageConfirmModal, useMessageActionModal } from '@/app/messages/message-confirm-modal';

export function ReportMessageModal({
  open,
  otherUsername,
  messageId,
  onClose,
  onReported,
  onError,
}: {
  open: boolean;
  otherUsername: string;
  messageId: string;
  onClose: () => void;
  onReported: () => void;
  onError?: (message: string) => void;
}) {
  const { error, isPending, runAction } = useMessageActionModal(open, onClose, onError);

  return (
    <MessageConfirmModal
      open={open}
      onClose={onClose}
      titleId="report-message-title"
      title="Report message?"
      subtitle="We'll review this with moderators."
      icon={Flag}
      iconClassName="border-slate-600 bg-slate-800 text-slate-300"
      headerClassName="border-slate-800 bg-slate-900/40"
      username={otherUsername}
      usernameLabel="Reported player"
      description={
        <p>
          A report will be sent to the UGNCBBX moderators with your account details and this
          message. Only report content that breaks community guidelines.
        </p>
      }
      confirmLabel="Submit report"
      confirmingLabel="Submitting…"
      confirmIcon={Flag}
      confirmClassName="border border-slate-600 bg-slate-800 text-slate-100 hover:bg-slate-700"
      isPending={isPending}
      error={error}
      onConfirm={() => {
        runAction(() => reportDirectMessage(messageId), onReported);
      }}
    />
  );
}
