'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Loader2, X } from 'lucide-react';

type Player = { id: string; username: string };

type Props = {
  open: boolean;
  mode: 'report' | 'edit';
  player1: Player | null;
  player2: Player | null;
  score: string;
  onScoreChange: (value: string) => void;
  onReport: (winnerId: string) => void;
  editWinnerId?: string | null;
  onEditWinnerChange?: (winnerId: string) => void;
  onSaveEdit: () => void;
  onClose: () => void;
  isPending: boolean;
  error: string;
};

export function MatchResultModal({
  open,
  mode,
  player1,
  player2,
  score,
  onScoreChange,
  onReport,
  editWinnerId,
  onEditWinnerChange,
  onSaveEdit,
  onClose,
  isPending,
  error,
}: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && !isPending) onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKey);
    };
  }, [open, onClose, isPending]);

  if (!mounted || !open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="match-result-title"
      onClick={() => !isPending && onClose()}
    >
      <div
        className="card w-full max-w-sm p-0 shadow-2xl shadow-black/50"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-slate-800 px-5 py-4">
          <div>
            <p id="match-result-title" className="text-lg font-semibold text-white">
              {mode === 'report' ? 'Report result' : 'Edit score'}
            </p>
            <p className="mt-1 text-sm text-slate-400">
              {player1?.username ?? 'TBD'} vs {player2?.username ?? 'TBD'}
            </p>
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

        <div className="px-5 py-4">
          {error && (
            <p className="mb-3 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
              {error}
            </p>
          )}

          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
            Set score
          </label>
          <input
            autoFocus
            type="text"
            value={score}
            onChange={(e) => onScoreChange(e.target.value)}
            placeholder="e.g. 3-1"
            disabled={isPending}
            className="input mt-2"
          />

          {mode === 'report' ? (
            <div className="mt-4 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Winner</p>
              {player1 && (
                <button
                  type="button"
                  onClick={() => onReport(player1.id)}
                  disabled={isPending}
                  className="btn-primary w-full disabled:opacity-60"
                >
                  {isPending ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 size={14} className="animate-spin" />
                      Saving…
                    </span>
                  ) : (
                    `${player1.username} wins`
                  )}
                </button>
              )}
              {player2 && (
                <button
                  type="button"
                  onClick={() => onReport(player2.id)}
                  disabled={isPending}
                  className="btn-primary w-full disabled:opacity-60"
                >
                  {isPending ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 size={14} className="animate-spin" />
                      Saving…
                    </span>
                  ) : (
                    `${player2.username} wins`
                  )}
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="mt-4 space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Winner</p>
                {player1 && (
                  <button
                    type="button"
                    onClick={() => onEditWinnerChange?.(player1.id)}
                    disabled={isPending}
                    className={`w-full rounded-lg border px-4 py-2.5 text-sm font-semibold transition disabled:opacity-60 ${
                      editWinnerId === player1.id
                        ? 'border-brand-500 bg-brand-500/15 text-brand-200'
                        : 'border-slate-700 bg-slate-900 text-slate-200 hover:border-slate-600'
                    }`}
                  >
                    {player1.username}
                  </button>
                )}
                {player2 && (
                  <button
                    type="button"
                    onClick={() => onEditWinnerChange?.(player2.id)}
                    disabled={isPending}
                    className={`w-full rounded-lg border px-4 py-2.5 text-sm font-semibold transition disabled:opacity-60 ${
                      editWinnerId === player2.id
                        ? 'border-brand-500 bg-brand-500/15 text-brand-200'
                        : 'border-slate-700 bg-slate-900 text-slate-200 hover:border-slate-600'
                    }`}
                  >
                    {player2.username}
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={onSaveEdit}
                disabled={isPending || !editWinnerId}
                className="btn-primary mt-4 w-full disabled:opacity-60"
              >
                {isPending ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 size={14} className="animate-spin" />
                    Saving…
                  </span>
                ) : (
                  'Save changes'
                )}
              </button>
            </>
          )}

          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="mt-3 w-full py-2 text-sm text-slate-400 transition hover:text-slate-200 disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
