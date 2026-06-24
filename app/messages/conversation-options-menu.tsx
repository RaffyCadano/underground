'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Archive, ArchiveRestore, Ban, Flag, MoreHorizontal, Trash2 } from 'lucide-react';
import { unarchiveConversation } from '@/app/actions/messages';
import { DeleteChatModal } from '@/app/messages/delete-chat-modal';
import { ArchiveChatModal } from '@/app/messages/archive-chat-modal';
import { BlockUserModal } from '@/app/messages/block-user-modal';
import { ReportUserModal } from '@/app/messages/report-user-modal';

export function ConversationOptionsMenu({
  conversationId,
  otherUsername,
  isArchived = false,
  variant = 'sidebar',
  isSelected = false,
  onError,
}: {
  conversationId: string;
  otherUsername: string;
  isArchived?: boolean;
  variant?: 'sidebar' | 'header';
  isSelected?: boolean;
  onError?: (message: string) => void;
}) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [archiveModalOpen, setArchiveModalOpen] = useState(false);
  const [blockModalOpen, setBlockModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();
  const menuRef = useRef<HTMLDivElement>(null);

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

  function redirectToInbox() {
    if (variant === 'header' || isSelected) {
      router.push('/messages');
    }
  }

  function runAction(
    action: () => Promise<{ error?: string; success?: boolean }>,
    options?: { onSuccess?: () => void },
  ) {
    setError('');
    onError?.('');
    startTransition(async () => {
      const result = await action();
      if (result.error) {
        setError(result.error);
        onError?.(result.error);
        return;
      }

      setMenuOpen(false);
      if (options?.onSuccess) {
        options.onSuccess();
      } else if (variant === 'sidebar' && isSelected) {
        router.push('/messages');
      } else if (variant === 'header') {
        router.push('/messages');
      }
      router.refresh();
    });
  }

  const triggerClass =
    variant === 'header'
      ? 'rounded-lg border border-slate-800 p-1.5 text-slate-400 transition hover:border-slate-700 hover:bg-slate-900 hover:text-white'
      : 'rounded-lg border border-slate-800/80 bg-slate-950/95 p-1 text-slate-500 shadow-xl backdrop-blur-sm transition hover:border-slate-700 hover:bg-slate-900 hover:text-slate-200';

  const wrapperClass =
    variant === 'header'
      ? 'relative'
      : `absolute right-2 top-1/2 z-10 -translate-y-1/2 transition-opacity ${
          menuOpen ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 focus-within:opacity-100'
        }`;

  return (
    <div ref={menuRef} className={wrapperClass}>
      <button
        type="button"
        disabled={isPending}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setMenuOpen((open) => !open);
        }}
        className={triggerClass}
        aria-label={`Options for ${otherUsername}`}
        aria-expanded={menuOpen}
      >
        <MoreHorizontal size={variant === 'header' ? 18 : 16} />
      </button>

      {menuOpen && (
        <div className="absolute right-0 top-full z-20 mt-1 min-w-[9.5rem] overflow-hidden rounded-xl border border-slate-700 bg-slate-950 py-1 shadow-xl">
          {isArchived ? (
            <button
              type="button"
              disabled={isPending}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                runAction(() => unarchiveConversation(conversationId), {
                  onSuccess: () => {
                    router.push(`/messages?c=${encodeURIComponent(conversationId)}`);
                  },
                });
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-slate-300 hover:bg-slate-900"
            >
              <ArchiveRestore size={14} />
              Unarchive Chat
            </button>
          ) : (
            <button
              type="button"
              disabled={isPending}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setMenuOpen(false);
                setArchiveModalOpen(true);
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-slate-300 hover:bg-slate-900"
            >
              <Archive size={14} />
              Archive Chat
            </button>
          )}
          <button
            type="button"
            disabled={isPending}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setMenuOpen(false);
              setBlockModalOpen(true);
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-slate-300 hover:bg-slate-900"
          >
            <Ban size={14} />
            Block User
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setMenuOpen(false);
              setDeleteModalOpen(true);
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-red-400 hover:bg-slate-900"
          >
            <Trash2 size={14} />
            Delete Chat
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setMenuOpen(false);
              setReportModalOpen(true);
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-slate-300 hover:bg-slate-900"
          >
            <Flag size={14} />
            Report
          </button>
        </div>
      )}

      {error && variant === 'header' && (
        <p className="absolute right-0 top-full z-10 mt-1 min-w-[10rem] rounded-lg border border-red-500/30 bg-slate-950 px-2 py-1 text-[11px] text-red-400">
          {error}
        </p>
      )}

      <ArchiveChatModal
        open={archiveModalOpen}
        otherUsername={otherUsername}
        conversationId={conversationId}
        onClose={() => setArchiveModalOpen(false)}
        onError={onError}
        onArchived={() => {
          setMenuOpen(false);
          redirectToInbox();
          router.refresh();
        }}
      />

      <DeleteChatModal
        open={deleteModalOpen}
        otherUsername={otherUsername}
        conversationId={conversationId}
        onClose={() => setDeleteModalOpen(false)}
        onError={onError}
        onDeleted={() => {
          setMenuOpen(false);
          redirectToInbox();
          router.refresh();
        }}
      />

      <BlockUserModal
        open={blockModalOpen}
        otherUsername={otherUsername}
        conversationId={conversationId}
        onClose={() => setBlockModalOpen(false)}
        onError={onError}
        onBlocked={() => {
          setMenuOpen(false);
          redirectToInbox();
          router.refresh();
        }}
      />

      <ReportUserModal
        open={reportModalOpen}
        otherUsername={otherUsername}
        conversationId={conversationId}
        onClose={() => setReportModalOpen(false)}
        onError={onError}
        onReported={() => {
          setMenuOpen(false);
          router.refresh();
        }}
      />
    </div>
  );
}
