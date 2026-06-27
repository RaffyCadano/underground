'use client';

import { useEffect, useState, useTransition } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { createPortal } from 'react-dom';
import { AlertTriangle, Loader2, Trash2, X } from 'lucide-react';
import { deleteTournament } from '@/app/actions/tournaments';

export function DeleteTournamentButton({
  tournamentId,
  tournamentName,
  variant = 'button',
  onAction,
  open: controlledOpen,
  onOpenChange,
  hideTrigger = false,
}: {
  tournamentId: string;
  tournamentName: string;
  variant?: 'button' | 'menuItem' | 'toolbar';
  onAction?: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  hideTrigger?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [internalOpen, setInternalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;

  function setOpen(next: boolean) {
    if (isControlled) {
      onOpenChange?.(next);
    } else {
      setInternalOpen(next);
    }
  }

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;

    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && !isPending) closeModal();
    }

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open, isPending]);

  function openModal(e?: React.MouseEvent) {
    e?.preventDefault();
    e?.stopPropagation();
    onAction?.();
    setError('');
    setOpen(true);
  }

  function closeModal() {
    if (isPending) return;
    setOpen(false);
    setError('');
  }

  function confirmDelete() {
    setError('');
    startTransition(async () => {
      const result = await deleteTournament(tournamentId);

      if ('error' in result) {
        setError(result.error);
        return;
      }

      setOpen(false);

      const targetPath =
        pathname === `/tournaments/${tournamentId}` ? '/dashboard/tournaments' : pathname;
      const params = new URLSearchParams({ deleted: '1', name: result.name });
      router.replace(`${targetPath}?${params.toString()}`, { scroll: false });
    });
  }

  const modal =
    open &&
    mounted &&
    createPortal(
      <div
        className="fixed inset-0 z-[130] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-tournament-title"
        onClick={() => !isPending && closeModal()}
      >
        <div
          className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl shadow-black/50"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="border-b border-red-500/20 bg-red-500/5 px-5 py-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-red-500/30 bg-red-500/10 text-red-400">
                  <AlertTriangle size={20} />
                </span>
                <div>
                  <h2 id="delete-tournament-title" className="text-lg font-semibold text-white">
                    Delete tournament?
                  </h2>
                  <p className="mt-1 text-sm text-slate-400">This action cannot be undone.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeModal}
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
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Tournament
              </p>
              <p className="mt-1 font-semibold text-white">{tournamentName}</p>
            </div>

            <p className="mt-4 text-sm text-slate-400">The following will be permanently removed:</p>
            <ul className="mt-2 space-y-1.5 text-sm text-slate-300">
              {['All registered participants', 'Match results and bracket data', 'Tournament settings'].map(
                (item) => (
                  <li key={item} className="flex items-center gap-2">
                    <span className="h-1 w-1 shrink-0 rounded-full bg-red-400/80" />
                    {item}
                  </li>
                ),
              )}
            </ul>

            {error && (
              <p className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                {error}
              </p>
            )}
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-slate-800 bg-slate-900/40 px-5 py-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={closeModal}
              disabled={isPending}
              className="btn-secondary w-full sm:w-auto disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={confirmDelete}
              disabled={isPending}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-red-500/40 bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-500 disabled:opacity-60 sm:w-auto"
            >
              {isPending ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Deleting…
                </>
              ) : (
                <>
                  <Trash2 size={15} />
                  Delete tournament
                </>
              )}
            </button>
          </div>
        </div>
      </div>,
      document.body,
    );

  return (
    <>
      {!hideTrigger &&
        (variant === 'menuItem' ? (
          <button
            type="button"
            onClick={openModal}
            disabled={isPending}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-red-400 transition hover:bg-slate-900 disabled:opacity-60"
          >
            <Trash2 size={14} />
            Delete
          </button>
        ) : (
          <button
            type="button"
            onClick={openModal}
            disabled={isPending}
            title={`Delete ${tournamentName}`}
            className={
              variant === 'toolbar'
                ? 'inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-900/80 px-4 py-2.5 text-sm font-semibold text-red-300 transition hover:border-red-500/40 hover:bg-slate-900 hover:text-red-200 disabled:opacity-60'
                : 'inline-flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-300 transition hover:border-red-400/50 hover:bg-red-500/20 disabled:opacity-60'
            }
          >
            <Trash2 size={variant === 'toolbar' ? 15 : 14} className="shrink-0" />
            Delete
          </button>
        ))}
      {modal}
    </>
  );
}
