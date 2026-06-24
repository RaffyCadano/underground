'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Mail, MessageSquare, MoreHorizontal } from 'lucide-react';
import { DeleteContactMessageButton } from '@/app/dashboard/delete-contact-message-button';
import { ResolveContactMessageButton } from '@/app/dashboard/resolve-contact-message-button';
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
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const mailtoReply = `mailto:${entry.email}?subject=${encodeURIComponent(`Re: ${entry.subject}`)}`;

  useEffect(() => {
    if (!menuOpen) return;

    function handlePointerDown(event: MouseEvent | TouchEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
    };
  }, [menuOpen]);

  const itemClass =
    'flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-slate-300 transition hover:bg-slate-900';

  return (
    <div ref={menuRef} className="relative flex justify-end">
      <button
        type="button"
        onClick={() => setMenuOpen((open) => !open)}
        className="rounded-lg border border-slate-700 bg-slate-900 p-1.5 text-slate-400 transition hover:border-slate-600 hover:text-white"
        aria-label="Message actions"
        aria-expanded={menuOpen}
      >
        <MoreHorizontal size={16} />
      </button>

      {menuOpen && (
        <div className="absolute right-0 top-full z-20 mt-1 min-w-[10rem] overflow-hidden rounded-xl border border-slate-700 bg-slate-950 py-1 shadow-xl">
          <a
            href={mailtoReply}
            onClick={() => setMenuOpen(false)}
            className={itemClass}
          >
            <Mail size={14} />
            Reply
          </a>
          {parsed.isDmReport && parsed.conversationId && (
            <Link
              href={`/messages?c=${encodeURIComponent(parsed.conversationId)}`}
              onClick={() => setMenuOpen(false)}
              className={itemClass}
            >
              <MessageSquare size={14} />
              Thread
            </Link>
          )}
          {variant === 'pending' && (
            <ResolveContactMessageButton
              messageId={entry.id}
              variant="menuItem"
              onAction={() => setMenuOpen(false)}
            />
          )}
          <DeleteContactMessageButton
            messageId={entry.id}
            subject={entry.subject}
            variant="menuItem"
            onAction={() => setMenuOpen(false)}
          />
        </div>
      )}
    </div>
  );
}
