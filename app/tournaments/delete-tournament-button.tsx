'use client';

import { useEffect, useState, useTransition } from 'react';
import { Trash2, X } from 'lucide-react';
import { deleteTournament } from '@/app/actions/tournaments';

export function DeleteTournamentButton({
  tournamentId,
  tournamentName,
}: {
  tournamentId: string;
  tournamentName: string;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && !isPending) setOpen(false);
    }

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, isPending]);

  function openModal(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
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
      try {
        await deleteTournament(tournamentId);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to delete tournament.');
      }
    });
  }

  return (
    <>
      <div className="flex shrink-0 flex-col items-end gap-1">
        <button
          type="button"
          onClick={openModal}
          disabled={isPending}
          title={`Delete ${tournamentName}`}
          className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-300 transition hover:border-red-400/50 hover:bg-red-500/20 disabled:opacity-60"
        >
          <Trash2 size={14} />
          Delete
        </button>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-tournament-title"
        >
          <button
            type="button"
            aria-label="Close"
            onClick={closeModal}
            disabled={isPending}
            className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
          />

          <div
            className="card relative z-10 w-full max-w-md p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-red-500/30 bg-red-500/10 text-red-300">
                  <Trash2 size={18} />
                </span>
                <div>
                  <h2 id="delete-tournament-title" className="text-lg font-semibold text-white">
                    Delete tournament?
                  </h2>
                  <p className="mt-2 text-sm text-slate-400">
                    <span className="font-medium text-slate-200">{tournamentName}</span> will be
                    permanently removed, including all participants and match results.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeModal}
                disabled={isPending}
                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-800 hover:text-white disabled:opacity-60"
              >
                <X size={18} />
              </button>
            </div>

            {error && (
              <p className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-300">
                {error}
              </p>
            )}

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeModal}
                disabled={isPending}
                className="btn-secondary disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={isPending}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-500/40 bg-red-500/15 px-5 py-2.5 text-sm font-semibold text-red-300 transition hover:border-red-400/60 hover:bg-red-500/25 disabled:opacity-60"
              >
                <Trash2 size={15} />
                {isPending ? 'Deleting…' : 'Delete tournament'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
