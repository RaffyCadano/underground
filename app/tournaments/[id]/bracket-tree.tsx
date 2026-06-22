'use client';

import { Fragment, useState, useTransition } from 'react';
import { PenLine } from 'lucide-react';
import { reportResult, correctScore } from '@/app/actions/matches';
import { MatchResultModal } from './match-result-modal';

type Player = { id: string; username: string } | null;

export type BracketMatch = {
  id: string;
  round: number;
  matchIndex: number;
  player1: Player;
  player2: Player;
  player1Id?: string | null;
  player2Id?: string | null;
  winner: Player;
  score: string | null;
  status: string;
};

const MATCH_H = 72;
const GAP_R1 = 8;
const UNIT = MATCH_H + GAP_R1;
const CONN_W = 28;
const COL_W = 176;

function topPad(roundIdx: number) {
  return (UNIT * (Math.pow(2, roundIdx) - 1)) / 2;
}

function matchGap(roundIdx: number) {
  return UNIT * Math.pow(2, roundIdx) - MATCH_H;
}

function roundLabel(round: number, totalRounds: number, format: string) {
  if (format === 'swiss' || format === 'round_robin') return `Round ${round}`;
  const fromEnd = totalRounds - round;
  if (fromEnd === 0) return 'Final';
  if (fromEnd === 1) return 'Semifinal';
  if (fromEnd === 2) return 'Quarterfinal';
  return `Round ${round}`;
}

function MatchCard({
  match,
  isAdmin,
  userId,
  interactive,
}: {
  match: BracketMatch;
  isAdmin: boolean;
  userId: string | null;
  interactive: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [reporting, setReporting] = useState(false);
  const [editing, setEditing] = useState(false);
  const [score, setScore] = useState('');
  const [editScore, setEditScore] = useState('');
  const [error, setError] = useState('');

  const p1Won = !!match.winner && match.winner.id === match.player1?.id;
  const p2Won = !!match.winner && match.winner.id === match.player2?.id;
  const isBye = match.status === 'bye';
  const isDone = match.status === 'complete';
  const scoreParts = match.score ? match.score.split('-') : [];
  const p1Score = scoreParts[0] ?? null;
  const p2Score = scoreParts[1] ?? null;

  const canReport =
    interactive &&
    match.status === 'pending' &&
    match.player1 &&
    match.player2 &&
    (isAdmin || userId === match.player1.id || userId === match.player2.id);

  const canEdit = interactive && isDone && isAdmin && match.player1 && match.player2;

  function handleReport(winnerId: string) {
    setError('');
    startTransition(async () => {
      try {
        await reportResult(match.id, winnerId, score);
        setReporting(false);
        setScore('');
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Failed to report result.');
      }
    });
  }

  function handleEdit() {
    setError('');
    startTransition(async () => {
      try {
        await correctScore(match.id, editScore);
        setEditing(false);
        setEditScore('');
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Failed to update score.');
      }
    });
  }

  const isActionable = (canReport || canEdit) && !reporting && !editing;

  function openAction() {
    if (canReport && !reporting && !editing) {
      setReporting(true);
      setEditing(false);
      setScore('');
      setError('');
    } else if (canEdit && !reporting && !editing) {
      setEditing(true);
      setReporting(false);
      setEditScore(match.score ?? '');
      setError('');
    }
  }

  function closeAction() {
    setReporting(false);
    setEditing(false);
    setScore('');
    setEditScore('');
    setError('');
  }

  const slots = [
    { player: match.player1, won: p1Won, setScore: p1Score },
    { player: match.player2, won: p2Won, setScore: p2Score },
  ];

  return (
    <>
      <div className="group relative" style={{ width: COL_W, height: MATCH_H, flexShrink: 0 }}>
        <div
          role={isActionable ? 'button' : undefined}
          tabIndex={isActionable ? 0 : undefined}
          data-pan-exclude={isActionable ? '' : undefined}
          onClick={openAction}
          onKeyDown={(e) => {
            if (isActionable && (e.key === 'Enter' || e.key === ' ')) {
              e.preventDefault();
              openAction();
            }
          }}
          className={`relative flex h-full flex-col overflow-hidden rounded-lg border transition ${
            isBye
              ? 'border-slate-800 bg-slate-900/40 opacity-60'
              : isDone
                ? 'border-slate-700 bg-slate-900'
                : canReport
                  ? 'cursor-pointer border-slate-700 bg-slate-900 before:absolute before:inset-y-0 before:left-0 before:w-[3px] before:rounded-l-md before:bg-brand-500 hover:border-brand-500/40 hover:bg-slate-900/90'
                  : 'border-slate-800 bg-slate-900/70'
          } ${canEdit && !canReport ? 'cursor-pointer hover:border-slate-600' : ''} ${
            reporting || editing ? 'border-brand-500/50 ring-2 ring-brand-500/25' : ''
          }`}
        >
        {slots.map(({ player, won, setScore: s }, i) => (
          <div
            key={i}
            className={`flex flex-1 items-center justify-between gap-2 px-2.5 ${
              i === 0 ? 'border-b border-slate-800/80' : ''
            } ${won ? 'bg-brand-500/10' : ''}`}
          >
            <span
              className={`min-w-0 truncate text-xs font-medium leading-none ${
                won ? 'text-white' : player ? 'text-slate-200' : 'text-slate-500'
              }`}
            >
              {player?.username ?? (isBye ? 'BYE' : 'TBD')}
            </span>
            <div className="flex shrink-0 items-center gap-1">
              {s !== null && (
                <span
                  className={`min-w-[1.25rem] rounded px-1 text-center tabular-nums text-[10px] font-bold ${
                    won ? 'bg-brand-500/25 text-brand-200' : 'text-slate-500'
                  }`}
                >
                  {s}
                </span>
              )}
              {won && (
                <span className="rounded bg-brand-500/25 px-1 text-[9px] font-bold text-brand-200">
                  W
                </span>
              )}
            </div>
          </div>
        ))}

        {canReport && isActionable && (
          <>
            <span className="absolute right-1.5 top-1.5 rounded-md bg-brand-500/15 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide text-brand-300 [@media(hover:hover)]:hidden">
              Score
            </span>
            <div className="pointer-events-none absolute inset-0 hidden items-center justify-center bg-slate-950/80 opacity-0 backdrop-blur-[2px] transition-opacity duration-150 [@media(hover:hover)]:group-hover:flex [@media(hover:hover)]:group-hover:opacity-100">
              <span className="rounded-full border border-brand-500/30 bg-brand-500/10 px-3 py-1 text-[10px] font-semibold text-brand-200">
                Enter result
              </span>
            </div>
          </>
        )}

        {canEdit && isActionable && (
          <div className="pointer-events-none absolute inset-0 hidden items-center justify-center bg-slate-950/80 opacity-0 backdrop-blur-[2px] transition-opacity duration-150 [@media(hover:hover)]:group-hover:flex [@media(hover:hover)]:group-hover:opacity-100">
            <span className="inline-flex items-center gap-1 rounded-full border border-slate-600 bg-slate-800/90 px-3 py-1 text-[10px] font-semibold text-slate-200">
              <PenLine size={10} />
              Edit score
            </span>
          </div>
        )}
        </div>
      </div>

      <MatchResultModal
        open={reporting || editing}
        mode={reporting ? 'report' : 'edit'}
        player1={match.player1}
        player2={match.player2}
        score={reporting ? score : editScore}
        onScoreChange={reporting ? setScore : setEditScore}
        onReport={handleReport}
        onSaveEdit={handleEdit}
        onClose={closeAction}
        isPending={isPending}
        error={error}
      />
    </>
  );
}

function ConnectorSvg({
  matchCount,
  colIdx,
  totalHeight,
}: {
  matchCount: number;
  colIdx: number;
  totalHeight: number;
}) {
  const prevUnit = UNIT * Math.pow(2, colIdx - 1);
  const prevPad = topPad(colIdx - 1);
  const mid = CONN_W / 2;

  return (
    <svg width={CONN_W} height={totalHeight} className="shrink-0" style={{ overflow: 'visible' }}>
      {Array.from({ length: matchCount }, (_, i) => {
        const y1 = prevPad + i * 2 * prevUnit + MATCH_H / 2;
        const y2 = prevPad + (i * 2 + 1) * prevUnit + MATCH_H / 2;
        const midY = (y1 + y2) / 2;

        return (
          <g key={i} stroke="#334155" strokeWidth="1" fill="none">
            <polyline points={`0,${y1} ${mid},${y1} ${mid},${midY}`} />
            <polyline points={`0,${y2} ${mid},${y2} ${mid},${midY}`} />
            <line x1={mid} y1={midY} x2={CONN_W} y2={midY} />
          </g>
        );
      })}
    </svg>
  );
}

interface BracketTreeProps {
  rounds: [number, BracketMatch[]][];
  format: string;
  isAdmin?: boolean;
  userId?: string | null;
  interactive?: boolean;
}

export function BracketTree({
  rounds,
  format,
  isAdmin = false,
  userId = null,
  interactive = false,
}: BracketTreeProps) {
  if (rounds.length === 0) return null;

  const totalRounds = rounds.length;
  const bracketHeight = rounds[0][1].length * UNIT - GAP_R1;

  return (
    <div className="overflow-x-auto pb-2">
      <div className="mb-2 flex">
        {rounds.map(([round], colIdx) => (
          <Fragment key={round}>
            {colIdx > 0 && <div style={{ width: CONN_W }} />}
            <div
              className="shrink-0 text-center text-[10px] font-bold uppercase tracking-widest text-slate-400"
              style={{ width: COL_W }}
            >
              {roundLabel(round, totalRounds, format)}
            </div>
          </Fragment>
        ))}
      </div>

      <div className="flex items-start" style={{ height: bracketHeight }}>
        {rounds.map(([round, matches], colIdx) => {
          const pad = topPad(colIdx);
          const gap = matchGap(colIdx);

          return (
            <Fragment key={round}>
              {colIdx > 0 && (
                <ConnectorSvg matchCount={matches.length} colIdx={colIdx} totalHeight={bracketHeight} />
              )}
              <div
                className="flex shrink-0 flex-col"
                style={{ paddingTop: pad, gap: `${gap}px`, width: COL_W }}
              >
                {matches.map((m) => (
                  <MatchCard
                    key={m.id}
                    match={m}
                    isAdmin={isAdmin}
                    userId={userId}
                    interactive={interactive}
                  />
                ))}
              </div>
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}
