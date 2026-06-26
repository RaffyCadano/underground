'use client';

import { Fragment, useState, useTransition } from 'react';
import { reportResult, correctScore } from '@/app/actions/matches';
import { MatchResultModal } from './match-result-modal';
import type { BracketMatch } from './bracket-tree';

export type HqBracketRound = {
  round: number;
  matches: BracketMatch[];
};

type Props = {
  rounds: HqBracketRound[];
  isAdmin: boolean;
  userId: string | null;
  trailingMatches?: BracketMatch[];
  trailingLabels?: string[];
  minHeight?: number;
};

const MATCH_H = 56;
const GAP_R1 = 12;
const UNIT = MATCH_H + GAP_R1;
const CONN_W = 28;
const COL_W = 188;

function topPad(roundIdx: number): number {
  return (UNIT * (Math.pow(2, roundIdx) - 1)) / 2;
}

function matchGap(roundIdx: number): number {
  return UNIT * Math.pow(2, roundIdx) - MATCH_H;
}

function computeBracketHeight(r1Count: number): number {
  if (r1Count <= 0) return MATCH_H;
  return r1Count * UNIT - GAP_R1;
}

function parseScore(score: string | null): [string, string] {
  if (!score) return ['', ''];
  const parts = score.split('-').map((s) => s.trim());
  if (parts.length >= 2) return [parts[0], parts[1]];
  return [score, ''];
}

function HqMatchCard({
  match,
  isAdmin,
  userId,
  label,
}: {
  match: BracketMatch;
  isAdmin: boolean;
  userId: string | null;
  label?: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [reporting, setReporting] = useState(false);
  const [editing, setEditing] = useState(false);
  const [score, setScore] = useState('');
  const [editScore, setEditScore] = useState('');
  const [editWinnerId, setEditWinnerId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const [s1, s2] = parseScore(match.score);
  const isComplete = match.status === 'complete';
  const isBye = match.status === 'bye';

  const canReport =
    match.status === 'pending' &&
    match.player1 &&
    match.player2 &&
    (isAdmin || userId === match.player1.id || userId === match.player2.id);

  const canEdit = isComplete && isAdmin && match.player1 && match.player2;
  const clickable = (canReport || canEdit) && !reporting && !editing;

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
    if (!editWinnerId) return;
    setError('');
    startTransition(async () => {
      try {
        await correctScore(match.id, editScore, editWinnerId);
        setEditing(false);
        setEditScore('');
        setEditWinnerId(null);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Failed to update score.');
      }
    });
  }

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
      setEditWinnerId(match.winner?.id ?? null);
      setError('');
    }
  }

  function closeAction() {
    setReporting(false);
    setEditing(false);
    setScore('');
    setEditScore('');
    setEditWinnerId(null);
    setError('');
  }

  const slots = [
    {
      player: match.player1,
      won: match.winner?.id === match.player1?.id,
      setScore: s1,
    },
    {
      player: match.player2,
      won: match.winner?.id === match.player2?.id,
      setScore: s2,
    },
  ];

  return (
    <>
      <div className="relative shrink-0" style={{ width: COL_W, height: MATCH_H }}>
        {label ? (
          <p className="pointer-events-none absolute -top-4 left-0 right-0 truncate text-center text-[9px] font-bold uppercase tracking-wider text-slate-500">
            {label}
          </p>
        ) : null}

        <div
          role={clickable ? 'button' : undefined}
          tabIndex={clickable ? 0 : undefined}
          data-pan-exclude={clickable ? '' : undefined}
          onClick={clickable ? openAction : undefined}
          onKeyDown={
            clickable
              ? (e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openAction();
                  }
                }
              : undefined
          }
          className={`flex h-full flex-col overflow-hidden rounded border bg-slate-900/90 ${
            isBye
              ? 'border-slate-800 opacity-60'
              : isComplete
                ? 'border-slate-600'
                : match.status === 'in_progress'
                  ? 'border-sky-500/70 ring-1 ring-sky-500/30'
                  : canReport
                    ? 'relative border-slate-700 before:absolute before:inset-y-0 before:left-0 before:z-10 before:w-[3px] before:rounded-l before:bg-sky-500'
                    : 'border-slate-700'
          } ${clickable ? 'cursor-pointer transition hover:border-sky-500/60 hover:shadow-md' : ''}`}
        >
          {slots.map(({ player, won, setScore }, i) => (
            <div
              key={i}
              className={`flex flex-1 items-center justify-between gap-2 px-2.5 ${
                i === 0 ? 'border-b border-slate-700/80' : ''
              } ${won ? 'bg-emerald-950/50 font-semibold text-emerald-100' : 'text-slate-300'}`}
            >
              <span className="min-w-0 flex-1 truncate text-[11px] leading-none">
                {player?.username ?? (
                  <span className="font-normal italic text-slate-600">{isBye ? 'BYE' : 'TBD'}</span>
                )}
              </span>
              {isComplete && setScore !== '' ? (
                <span className="shrink-0 text-[11px] tabular-nums leading-none text-slate-400">
                  {setScore}
                </span>
              ) : null}
            </div>
          ))}
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
        editWinnerId={editWinnerId}
        onEditWinnerChange={setEditWinnerId}
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
    <svg
      width={CONN_W}
      height={totalHeight}
      className="shrink-0"
      style={{ overflow: 'visible' }}
      aria-hidden
    >
      {Array.from({ length: matchCount }, (_, i) => {
        const y1 = prevPad + i * 2 * prevUnit + MATCH_H / 2;
        const y2 = prevPad + (i * 2 + 1) * prevUnit + MATCH_H / 2;
        const midY = (y1 + y2) / 2;

        return (
          <g key={i} stroke="#475569" strokeWidth="1.5" fill="none">
            <polyline points={`0,${y1} ${mid},${y1} ${mid},${midY}`} />
            <polyline points={`0,${y2} ${mid},${y2} ${mid},${midY}`} />
            <line x1={mid} y1={midY} x2={CONN_W} y2={midY} />
          </g>
        );
      })}
    </svg>
  );
}

function TrailingConnector({ alignY, totalHeight }: { alignY: number; totalHeight: number }) {
  return (
    <svg
      width={CONN_W}
      height={totalHeight}
      className="shrink-0"
      style={{ overflow: 'visible' }}
      aria-hidden
    >
      <line x1={0} y1={alignY} x2={CONN_W} y2={alignY} stroke="#475569" strokeWidth="1.5" />
    </svg>
  );
}

export function BracketHqTree({
  rounds,
  isAdmin,
  userId,
  trailingMatches,
  trailingLabels,
  minHeight,
}: Props) {
  const r1Count = rounds[0]?.matches.length ?? 0;
  const totalRounds = rounds.length;
  const bracketHeight = minHeight ?? computeBracketHeight(r1Count);

  const lastRoundPad = totalRounds > 0 ? topPad(totalRounds - 1) : 0;
  const trailingCenterY = lastRoundPad + MATCH_H / 2;

  if (rounds.length === 0 && !trailingMatches?.length) {
    return <p className="py-8 text-center text-sm text-slate-500">No matches yet</p>;
  }

  return (
    <div className="flex items-start" style={{ minHeight: bracketHeight }}>
      {rounds.map((round, colIdx) => {
        const pad = topPad(colIdx);
        const gap = matchGap(colIdx);

        return (
          <Fragment key={round.round}>
            {colIdx > 0 && (
              <ConnectorSvg
                matchCount={round.matches.length}
                colIdx={colIdx}
                totalHeight={bracketHeight}
              />
            )}
            <div
              className="flex shrink-0 flex-col"
              style={{ paddingTop: pad, gap: `${gap}px`, width: COL_W }}
            >
              {round.matches.map((match) => (
                <HqMatchCard key={match.id} match={match} isAdmin={isAdmin} userId={userId} />
              ))}
            </div>
          </Fragment>
        );
      })}

      {trailingMatches && trailingMatches.length > 0 && totalRounds > 0 && (
        <TrailingConnector alignY={trailingCenterY} totalHeight={bracketHeight} />
      )}

      {trailingMatches && trailingMatches.length > 0 && (
        <div
          className="flex shrink-0 flex-col"
          style={{
            paddingTop: lastRoundPad,
            gap: trailingMatches.length > 1 ? `${MATCH_H + GAP_R1 + 12}px` : undefined,
            width: COL_W,
          }}
        >
          {trailingMatches.map((match, i) => (
            <HqMatchCard
              key={match.id}
              match={match}
              isAdmin={isAdmin}
              userId={userId}
              label={trailingLabels?.[i]}
            />
          ))}
        </div>
      )}
    </div>
  );
}
