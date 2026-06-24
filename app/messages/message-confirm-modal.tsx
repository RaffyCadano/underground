'use client';

import { useEffect, useState, useTransition, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Loader2, X, type LucideIcon } from 'lucide-react';

export function MessageConfirmModal({
  open,
  onClose,
  titleId,
  title,
  subtitle,
  icon: Icon,
  iconClassName,
  headerClassName,
  username,
  usernameLabel,
  description,
  confirmLabel,
  confirmingLabel,
  confirmIcon: ConfirmIcon,
  confirmClassName,
  isPending,
  error,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  titleId: string;
  title: string;
  subtitle: string;
  icon: LucideIcon;
  iconClassName: string;
  headerClassName: string;
  username: string;
  usernameLabel: string;
  description: ReactNode;
  confirmLabel: string;
  confirmingLabel: string;
  confirmIcon: LucideIcon;
  confirmClassName: string;
  isPending: boolean;
  error: string;
  onConfirm: () => void;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;

    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && !isPending) {
        onClose();
      }
    }

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open, isPending, onClose]);

  if (!open || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onClick={() => !isPending && onClose()}
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl shadow-black/50"
        onClick={(event) => event.stopPropagation()}
      >
        <div className={`border-b px-5 py-4 ${headerClassName}`}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <span
                className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${iconClassName}`}
              >
                <Icon size={20} />
              </span>
              <div>
                <h2 id={titleId} className="text-lg font-semibold text-white">
                  {title}
                </h2>
                <p className="mt-1 text-sm text-slate-400">{subtitle}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-800 hover:text-white disabled:opacity-50"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="px-5 py-4">
          <div className="rounded-xl border border-slate-800 bg-slate-900/80 px-4 py-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{usernameLabel}</p>
            <p className="mt-1 font-semibold text-white">{username}</p>
          </div>

          <div className="mt-4 text-sm text-slate-400">{description}</div>

          {error && (
            <p className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
              {error}
            </p>
          )}
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-slate-800 bg-slate-900/40 px-5 py-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="btn-secondary w-full sm:w-auto disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isPending}
            className={`inline-flex w-full items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold transition disabled:opacity-60 sm:w-auto ${confirmClassName}`}
          >
            {isPending ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                {confirmingLabel}
              </>
            ) : (
              <>
                <ConfirmIcon size={16} />
                {confirmLabel}
              </>
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export function useMessageActionModal(
  open: boolean,
  onClose: () => void,
  onError?: (message: string) => void,
) {
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!open) {
      setError('');
    }
  }, [open]);

  function runAction(
    action: () => Promise<{ error?: string; success?: boolean }>,
    onSuccess: () => void,
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

      onClose();
      onSuccess();
    });
  }

  return { error, isPending, runAction };
}
