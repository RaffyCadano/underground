import { Fragment } from 'react';

type Player = { id: string; username: string } | null;

export type BracketMatch = {
  id: string;
  round: number;
  matchIndex: number;
  player1: Player;
  player2: Player;
  winner: Player;
  score: string | null;
  status: string;
};

const MATCH_H = 68; // px - height of one match card
const GAP_R1 = 8;   // px - gap between matches in round 1
const UNIT = MATCH_H + GAP_R1; // 76px
const CONN_W = 28;  // px - connector SVG width
const COL_W = 164;  // px - match column width

function topPad(roundIdx: number) {
  // 0-indexed. Vertical offset before first match so each round's matches are centred.
  return UNIT * (Math.pow(2, roundIdx) - 1) / 2;
}

function matchGap(roundIdx: number) {
  // Gap between consecutive match cards in this round
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

function MatchCard({ match }: { match: BracketMatch }) {
  const slots = [
    { player: match.player1, won: !!match.winner && match.winner.id === match.player1?.id },
    { player: match.player2, won: !!match.winner && match.winner.id === match.player2?.id },
  ];

  const isBye = match.status === 'bye';
  const isDone = match.status === 'complete';

  return (
    <div
      className={`overflow-hidden rounded-lg border ${
        isBye
          ? 'border-slate-800 bg-slate-900/40 opacity-60'
          : isDone
          ? 'border-slate-700 bg-slate-900'
          : 'border-slate-800 bg-slate-900/70'
      }`}
      style={{ width: COL_W, height: MATCH_H, flexShrink: 0 }}
    >
      {slots.map(({ player, won }, i) => (
        <div
          key={i}
          className={`flex items-center justify-between px-3 ${
            i === 0 ? 'border-b border-slate-800' : ''
          } ${won ? 'bg-brand-500/10' : ''}`}
          style={{ height: MATCH_H / 2 }}
        >
          <span
            className={`truncate text-xs font-medium ${
              won ? 'text-white' : player ? 'text-slate-300' : 'text-slate-500'
            }`}
          >
            {player?.username ?? (isBye ? 'BYE' : 'TBD')}
          </span>
          {won && (
            <span className="ml-1 shrink-0 rounded bg-brand-500/20 px-1 text-[10px] font-bold text-brand-300">
              W
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

interface ConnectorSvgProps {
  matchCount: number; // matches in next round = feeders / 2
  colIdx: number;     // 1-indexed column being rendered (connector is before this)
  totalHeight: number;
}

function ConnectorSvg({ matchCount, colIdx, totalHeight }: ConnectorSvgProps) {
  const prevUnit = UNIT * Math.pow(2, colIdx - 1);
  const prevPad = topPad(colIdx - 1);
  const mid = CONN_W / 2;

  return (
    <svg
      width={CONN_W}
      height={totalHeight}
      className="shrink-0"
      style={{ overflow: 'visible' }}
    >
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
}

export function BracketTree({ rounds, format }: BracketTreeProps) {
  if (rounds.length === 0) return null;

  const totalRounds = rounds.length;
  // Total height is determined by round 1
  const bracketHeight = rounds[0][1].length * UNIT - GAP_R1;

  return (
    <div className="overflow-x-auto pb-2">
      {/* Round labels row */}
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

      {/* Bracket body */}
      <div className="flex items-start" style={{ height: bracketHeight }}>
        {rounds.map(([round, matches], colIdx) => {
          const pad = topPad(colIdx);
          const gap = matchGap(colIdx);

          return (
            <Fragment key={round}>
              {/* Connector SVG before this column (except first) */}
              {colIdx > 0 && (
                <ConnectorSvg
                  matchCount={matches.length}
                  colIdx={colIdx}
                  totalHeight={bracketHeight}
                />
              )}

              {/* Match column */}
              <div
                className="flex shrink-0 flex-col"
                style={{ paddingTop: pad, gap: `${gap}px`, width: COL_W }}
              >
                {matches.map((m) => (
                  <MatchCard key={m.id} match={m} />
                ))}
              </div>
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}
