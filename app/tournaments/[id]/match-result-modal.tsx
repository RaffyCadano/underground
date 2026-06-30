'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Loader2, X } from 'lucide-react';

type Player = { id: string; username: string };

function parseMatchScore(score: string): [string, string] {
  const idx = score.indexOf('-');
  if (idx === -1) return [score.trim(), ''];
  return [score.slice(0, idx).trim(), score.slice(idx + 1).trim()];
}

function formatMatchScore(p1: string, p2: string): string {
  const a = p1.trim();
  const b = p2.trim();
  if (a && b) return `${a}-${b}`;
  return a || b || '';
}

function PlayerScoreRow({
  username,
  score,
  onScoreChange,
  isWinner,
  onSelectWinner,
  disabled,
  autoFocus,
}: {
  username: string;
  score: string;
  onScoreChange: (value: string) => void;
  isWinner: boolean;
  onSelectWinner: () => void;
  disabled: boolean;
  autoFocus?: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="min-w-0 flex-1 truncate text-sm font-medium text-white">{username}</span>
      <button
        type="button"
        onClick={onSelectWinner}
        disabled={disabled}
        aria-label={`${username} wins`}
        aria-pressed={isWinner}
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border text-xs font-bold transition disabled:opacity-60 ${
          isWinner
            ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300'
            : 'border-slate-700 bg-slate-900 text-slate-500 hover:border-slate-600 hover:text-slate-300'
        }`}
      >
        W
      </button>
      <input
        type="text"
        inputMode="numeric"
        value={score}
        onChange={(e) => onScoreChange(e.target.value)}
        disabled={disabled}
        autoFocus={autoFocus}
        placeholder="0"
        className="input w-14 shrink-0 px-2 text-center tabular-nums"
      />
    </div>
  );
}

export function MatchResultInlineForm({
  player1,
  player2,
  score = '',
  winnerId: initialWinnerId = null,
  onSave,
  onCancel,
  isPending,
}: {
  player1: Player;
  player2: Player;
  score?: string;
  winnerId?: string | null;
  onSave: (winnerId: string, score: string) => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  const [p1Score, setP1Score] = useState('');
  const [p2Score, setP2Score] = useState('');
  const [winnerId, setWinnerId] = useState<string | null>(null);

  useEffect(() => {
    const [s1, s2] = parseMatchScore(score);
    setP1Score(s1);
    setP2Score(s2);
    setWinnerId(initialWinnerId);
  }, [score, initialWinnerId, player1.id, player2.id]);

  function handleSave() {
    if (!winnerId) return;
    onSave(winnerId, formatMatchScore(p1Score, p2Score));
  }

  return (
    <div className="space-y-3">
      <PlayerScoreRow
        username={player1.username}
        score={p1Score}
        onScoreChange={setP1Score}
        isWinner={winnerId === player1.id}
        onSelectWinner={() => setWinnerId(player1.id)}
        disabled={isPending}
        autoFocus
      />
      <PlayerScoreRow
        username={player2.username}
        score={p2Score}
        onScoreChange={setP2Score}
        isWinner={winnerId === player2.id}
        onSelectWinner={() => setWinnerId(player2.id)}
        disabled={isPending}
      />
      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={handleSave}
          disabled={isPending || !winnerId}
          className="btn-primary flex-1 disabled:opacity-60"
        >
          {isPending ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 size={14} className="animate-spin" />
              Saving…
            </span>
          ) : (
            'Save'
          )}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isPending}
          className="btn-secondary disabled:opacity-60"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

type Props = {
  open: boolean;
  mode: 'report' | 'edit';
  player1: Player | null;
  player2: Player | null;
  score: string;
  onScoreChange?: (value: string) => void;
  onReport: (winnerId: string, score: string) => void;
  editWinnerId?: string | null;
  onEditWinnerChange?: (winnerId: string) => void;
  onSaveEdit: (winnerId: string, score: string) => void;
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

  if (!mounted || !open || !player1 || !player2) return null;

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
          <p id="match-result-title" className="text-lg font-semibold text-white">
            {mode === 'report' ? 'Report result' : 'Edit score'}
          </p>
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

          <MatchResultInlineForm
            key={`${mode}-${player1.id}-${player2.id}-${score}-${editWinnerId ?? ''}`}
            player1={player1}
            player2={player2}
            score={score}
            winnerId={editWinnerId}
            onSave={(winnerId, combined) => {
              onScoreChange?.(combined);
              onEditWinnerChange?.(winnerId);
              if (mode === 'report') onReport(winnerId, combined);
              else onSaveEdit(winnerId, combined);
            }}
            onCancel={onClose}
            isPending={isPending}
          />
        </div>
      </div>
    </div>,
    document.body,
  );
}
