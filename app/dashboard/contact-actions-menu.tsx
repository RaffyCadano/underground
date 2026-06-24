'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, MessageSquare, Trash2 } from 'lucide-react';
import { DeleteContactMessageButton } from '@/app/dashboard/delete-contact-message-button';
import { ResolveContactMessageButton } from '@/app/dashboard/resolve-contact-message-button';
import {
  TableActionsDropdown,
  tableActionsDangerItemClass,
  tableActionsItemClass,
} from '@/app/components/table-actions-dropdown';
import type { ParsedContactInboxEntry } from '@/lib/contact-inbox';

type ContactActionsEntry = {
  id: string;
  email: string;
  subject: string;
};

export function ContactActionsMenu({
  entry,
  parsed,
  variant,
}: {
  entry: ContactActionsEntry;
  parsed: ParsedContactInboxEntry;
  variant: 'pending' | 'resolved';
}) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const mailtoReply = `mailto:${entry.email}?subject=${encodeURIComponent(`Re: ${entry.subject}`)}`;

  return (
    <>
      <TableActionsDropdown label="Message actions">
        {(close) => (
          <>
            <a href={mailtoReply} onClick={close} className={tableActionsItemClass}>
              <Mail size={14} />
              Reply
            </a>
            {parsed.isDmReport && parsed.conversationId && (
              <Link
                href={`/messages?c=${encodeURIComponent(parsed.conversationId)}`}
                onClick={close}
                className={tableActionsItemClass}
              >
                <MessageSquare size={14} />
                Thread
              </Link>
            )}
            {variant === 'pending' && (
              <ResolveContactMessageButton
                messageId={entry.id}
                variant="menuItem"
                onAction={close}
              />
            )}
            <button
              type="button"
              onClick={() => {
                close();
                setDeleteOpen(true);
              }}
              className={tableActionsDangerItemClass}
            >
              <Trash2 size={14} />
              Delete
            </button>
          </>
        )}
      </TableActionsDropdown>
      <DeleteContactMessageButton
        messageId={entry.id}
        subject={entry.subject}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        hideTrigger
      />
    </>
  );
}
