'use client';

import { useState, useTransition } from 'react';
import { BracketTree, type BracketMatch } from './bracket-tree';
import { MatchResultModal } from './match-result-modal';
import { reportResult, correctScore } from '@/app/actions/matches';

type RawMatch = {
  id: string;
  round: number;
  matchIndex: number;
  bracketSide: string;
  score: string | null;
  status: string;
  player1Id: string | null;
  player2Id: string | null;
  player1: { id: string; username: string } | null;
  player2: { id: string; username: string } | null;
  winner: { id: string; username: string } | null;
};

function toBracketMatch(m: RawMatch): BracketMatch {
  return {
    id: m.id,
    round: m.round,
    matchIndex: m.matchIndex,
    player1: m.player1,
    player2: m.player2,
    player1Id: m.player1Id,
    player2Id: m.player2Id,
    winner: m.winner,
    score: m.score,
    status: m.status,
  };
}

function groupRounds(matches: RawMatch[]): [number, BracketMatch[]][] {
  const roundMap = new Map<number, BracketMatch[]>();
  for (const m of matches) {
    if (!roundMap.has(m.round)) roundMap.set(m.round, []);
    roundMap.get(m.round)!.push(toBracketMatch(m));
  }
  return Array.from(roundMap.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([round, ms]) => [round, ms.sort((a, b) => a.matchIndex - b.matchIndex)] as [number, BracketMatch[]]);
}

function ChampionshipCard({
  match,
  title,
  isAdmin,
  userId,
}: {
  match: BracketMatch;
  title: string;
  isAdmin: boolean;
  userId: string | null;
}) {
  const [isPending, startTransition] = useTransition();
  const [reporting, setReporting] = useState(false);
  const [editing, setEditing] = useState(false);
  const [score, setScore] = useState('');
  const [editScore, setEditScore] = useState('');
  const [error, setError] = useState('');

  const slots = [
    { player: match.player1, label: 'Winners bracket', won: match.winner?.id === match.player1?.id },
    { player: match.player2, label: 'Losers bracket', won: match.winner?.id === match.player2?.id },
  ];

  const isDone = match.status === 'complete';
  const canReport =
    match.status === 'pending' &&
    match.player1 &&
    match.player2 &&
    (isAdmin || userId === match.player1.id || userId === match.player2.id);
  const canEdit = isDone && isAdmin && match.player1 && match.player2;

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

  function closeAction() {
    setReporting(false);
    setEditing(false);
    setScore('');
    setEditScore('');
    setError('');
  }

  return (
    <>
      <div className="mx-auto max-w-sm overflow-hidden rounded-xl border border-brand-500/30 bg-slate-900 shadow-lg shadow-brand-500/5">
        <div className="border-b border-brand-500/20 bg-brand-500/10 px-4 py-2 text-center text-[10px] font-bold uppercase tracking-widest text-brand-300">
          {title}
        </div>
        {slots.map(({ player, label, won }, i) => (
          <div
            key={i}
            className={`flex items-center justify-between px-4 py-3 ${
              i === 0 ? 'border-b border-slate-800' : ''
            } ${won ? 'bg-brand-500/10' : ''}`}
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">{player?.username ?? 'TBD'}</p>
              <p className="text-[10px] text-slate-500">{label}</p>
            </div>
            {won && (
              <span className="ml-2 shrink-0 rounded bg-brand-500/20 px-1.5 py-0.5 text-[10px] font-bold text-brand-300">
                W
              </span>
            )}
          </div>
        ))}
        {match.score && (
          <p className="border-t border-slate-800 px-4 py-2 text-center text-xs text-slate-400">{match.score}</p>
        )}

        {(canReport || canEdit) && !reporting && !editing && (
          <div className="border-t border-slate-800 p-3">
            {canReport && (
              <button
                type="button"
                onClick={() => {
                  setReporting(true);
                  setScore('');
                  setError('');
                }}
                className="btn-primary w-full"
              >
                Enter result
              </button>
            )}
            {canEdit && (
              <button
                type="button"
                onClick={() => {
                  setEditing(true);
                  setEditScore(match.score ?? '');
                  setError('');
                }}
                className={`w-full rounded-lg border border-slate-700 py-2 text-xs font-semibold text-slate-400 hover:text-brand-300 ${canReport ? 'mt-2' : ''}`}
              >
                Edit score
              </button>
            )}
          </div>
        )}
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

interface Props {
  matches: RawMatch[];
  isAdmin: boolean;
  userId: string | null;
}

export function BracketDoubleElim({ matches, isAdmin, userId }: Props) {
  const winners = matches.filter((m) => m.bracketSide === 'winners');
  const losers = matches.filter((m) => m.bracketSide === 'losers');
  const grandFinal = matches.find((m) => m.bracketSide === 'grand_final');
  const reset = matches.find((m) => m.bracketSide === 'reset');

  const winnersRounds = groupRounds(winners);
  const losersRounds = groupRounds(losers);

  const treeProps = { isAdmin, userId, interactive: true };

  return (
    <div className="space-y-10">
      <section>
        <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-400">Winners bracket</h3>
        <p className="mb-4 text-sm text-slate-500">One loss drops you to the losers bracket.</p>
        <BracketTree rounds={winnersRounds} format="double_elimination" {...treeProps} />
      </section>

      {losersRounds.length > 0 && (
        <section>
          <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-400">Losers bracket</h3>
          <p className="mb-4 text-sm text-slate-500">
            Lose twice and you&apos;re out. The survivor faces the winners bracket champion.
          </p>
          <BracketTree rounds={losersRounds} format="double_elimination" {...treeProps} />
        </section>
      )}

      {grandFinal && (
        <section>
          <h3 className="mb-4 text-center text-xs font-bold uppercase tracking-widest text-slate-400">
            Championship
          </h3>
          <ChampionshipCard
            match={toBracketMatch(grandFinal)}
            title="Grand final"
            isAdmin={isAdmin}
            userId={userId}
          />
        </section>
      )}

      {reset && (
        <section>
          <h3 className="mb-4 text-center text-xs font-bold uppercase tracking-widest text-amber-400/80">
            Bracket reset
          </h3>
          <p className="mb-4 text-center text-sm text-slate-500">
            The losers bracket champion won the grand final — one more match decides the title.
          </p>
          <ChampionshipCard
            match={toBracketMatch(reset)}
            title="Reset match"
            isAdmin={isAdmin}
            userId={userId}
          />
        </section>
      )}
    </div>
  );
}
