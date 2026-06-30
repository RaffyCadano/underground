'use client';

import { Fragment, useState, useTransition, type ReactNode } from 'react';
import { Check } from 'lucide-react';
import { reportResult, correctScore } from '@/app/actions/matches';
import { MatchResultModal } from './match-result-modal';
import type { BracketMatch } from './bracket-tree';
import {
  bhqGhostTierCount,
  bracketTreeHeight,
  losersBhqRoundTitle,
  winnersBhqRoundTitle,
  type BhqRoundTitleParts,
} from '@/lib/bracket-round-labels';

export type HqBracketRound = {
  round: number;
  matches: BracketMatch[];
};

export const HQ_MATCH_H = 58;
export const HQ_GAP_R1 = 12;
export const HQ_COL_W = 184;
export const HQ_CONN_W = 28;
export const HQ_UNIT = HQ_MATCH_H + HQ_GAP_R1;

type MatchLink = {
  id: string;
  round: number;
  matchIndex: number;
  bracketSide: string | null;
  winnerNextId?: string | null;
  loserNextId?: string | null;
};

type Props = {
  rounds: HqBracketRound[];
  isAdmin: boolean;
  userId: string | null;
  trailingMatches?: BracketMatch[];
  trailingLabels?: string[];
  minHeight?: number;
  /** Tree columns use binary spacing (winners). Losers-vertical stacks rounds top-to-bottom. */
  layout?: 'tree' | 'losers-tree' | 'losers-vertical';
  /** Column order: losers finals near grand finals when reversed. */
  direction?: 'ltr' | 'rtl';
  roundTitlesPosition?: 'none' | 'top' | 'bottom';
  getRoundTitle?: (round: number, roundIdx: number, totalRounds: number) => string;
  seedByPlayerId?: Map<string, number>;
  matchNumbers?: Map<string, number>;
  showMatchNumbers?: boolean;
  className?: string;
  /** Bracket HQ classic: strikethrough Winners/Losers on round titles */
  bhqTitles?: boolean;
  bracketKind?: 'winners' | 'losers';
  /** Winners rounds for feeder Y alignment in losers-tree layout */
  winnersRounds?: HqBracketRound[];
  /** Match linkage for losers-tree feeder positioning */
  matchLinks?: MatchLink[];
  /** Next power-of-two bracket size (e.g. 11 players → 16) for BHQ ghost padding */
  bracketSize?: number;
};

const MATCH_H = HQ_MATCH_H;
const GAP_R1 = HQ_GAP_R1;
const GAP_H = HQ_GAP_R1;
const UNIT = HQ_UNIT;
const CONN_W = HQ_CONN_W;
const CONN_V = HQ_CONN_W;
const COL_W = HQ_COL_W;
const ROW_LABEL_W = 108;
const TREE_PAD_BOTTOM = 36;
const CONN_STROKE = '#475569';

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

export function computeBracketHeightForSize(bracketSize: number): number {
  return bracketTreeHeight(bracketSize, UNIT, GAP_R1);
}

type HalfBracketPos = { y: number; side: 'left' | 'right' };

/** BHQ half-bracket: left/right matches share row Y (top pairs with top). */
function halfBracketMatchPositions(matchCount: number, logicalIdx: number): HalfBracketPos[] {
  const pad = topPad(logicalIdx);
  const gap = matchGap(logicalIdx);

  if (matchCount <= 0) return [];
  if (matchCount === 1) {
    return [{ y: pad + MATCH_H / 2, side: 'left' }];
  }

  const leftCount = Math.ceil(matchCount / 2);
  return Array.from({ length: matchCount }, (_, i) => {
    const isRight = i >= leftCount;
    const rowInHalf = isRight ? i - leftCount : i;
    return {
      y: pad + rowInHalf * (MATCH_H + gap) + MATCH_H / 2,
      side: isRight ? 'right' : 'left',
    };
  });
}

function winnersRoundSlotCount(bracketSize: number, round: number): number {
  return Math.max(1, bracketSize / Math.pow(2, round));
}

function roundMaxSlotCount(matches: BracketMatch[]): number {
  if (matches.length === 0) return 0;
  return Math.max(...matches.map((m) => m.matchIndex)) + 1;
}

function matchSlotPosition(
  matchIndex: number,
  slotCount: number,
  logicalIdx: number,
): HalfBracketPos {
  const positions = halfBracketMatchPositions(slotCount, logicalIdx);
  return (
    positions[matchIndex] ??
    positions[Math.min(matchIndex, Math.max(0, positions.length - 1))] ?? {
      y: MATCH_H / 2,
      side: 'left',
    }
  );
}

/** Row-align slot-indexed centers (left/right partners share Y). */
function alignSlotCenters(slots: number[], filled: Set<number>): number[] {
  const slotCount = slots.length;
  if (slotCount <= 1) return slots;
  const aligned = [...slots];
  const leftCount = Math.ceil(slotCount / 2);
  for (let row = 0; row < leftCount; row++) {
    const rightIdx = leftCount + row;
    if (rightIdx < slotCount && filled.has(row) && filled.has(rightIdx)) {
      const y = (slots[row] + slots[rightIdx]) / 2;
      aligned[row] = y;
      aligned[rightIdx] = y;
    }
  }
  return aligned;
}

function losersColumnLogicalIdx(column: BhqLosersColumn, ghostTierCount: number): number {
  if (column.kind === 'ghost') return ghostTierCount;
  return ghostTierCount + Math.max(0, column.round - 1);
}

function losersRoundSlotCount(losersRounds: HqBracketRound[], round: number): number {
  const full = losersRounds.find((r) => r.round === round);
  return full ? Math.max(roundMaxSlotCount(full.matches), 1) : 1;
}

function buildColumnSlotCenters(
  column: BhqLosersColumn,
  centerById: Map<string, number>,
  bracketHeight: number,
  logicalIdx: number,
  slotCount: number,
): number[] {
  const slots = Array.from({ length: slotCount }, () => bracketHeight / 2);
  const filled = new Set<number>();
  for (const match of column.matches) {
    const gridY = matchSlotPosition(match.matchIndex, slotCount, logicalIdx).y;
    const feederY = centerById.get(match.id);
    slots[match.matchIndex] = feederY ?? gridY;
    filled.add(match.matchIndex);
  }
  if (slotCount > 1 && column.kind !== 'ghost') {
    return alignSlotCenters(slots, filled);
  }
  return slots;
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
  seedByPlayerId,
  matchNumber,
  showMatchNumber = true,
  alignRight = false,
  isFinals = false,
}: {
  match: BracketMatch;
  isAdmin: boolean;
  userId: string | null;
  label?: string;
  seedByPlayerId?: Map<string, number>;
  matchNumber?: number;
  showMatchNumber?: boolean;
  alignRight?: boolean;
  isFinals?: boolean;
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
  const isPlaceholder = !match.player1 && !match.player2 && !isComplete && !isBye;

  const canReport =
    match.status === 'pending' &&
    match.player1 &&
    match.player2 &&
    (isAdmin || userId === match.player1.id || userId === match.player2.id);

  const canEdit = isComplete && isAdmin && match.player1 && match.player2;
  const clickable = (canReport || canEdit) && !reporting && !editing;

  function handleReport(winnerId: string, reportedScore: string) {
    setError('');
    startTransition(async () => {
      try {
        await reportResult(match.id, winnerId, reportedScore);
        setReporting(false);
        setScore('');
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Failed to report result.');
      }
    });
  }

  function handleEdit(winnerId: string, updatedScore: string) {
    setError('');
    startTransition(async () => {
      try {
        await correctScore(match.id, updatedScore, winnerId);
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
      playerId: match.player1Id,
      hint: match.player1Hint,
      won: match.winner?.id === match.player1?.id,
      setScore: s1,
    },
    {
      player: match.player2,
      playerId: match.player2Id,
      hint: match.player2Hint,
      won: match.winner?.id === match.player2?.id,
      setScore: s2,
    },
  ];

  const cardState = isBye
    ? 'bhq-card--bye'
    : isPlaceholder
      ? 'bhq-card--placeholder'
      : match.status === 'in_progress'
        ? 'bhq-card--live'
        : canReport
          ? 'bhq-card--actionable'
          : '';

  return (
    <>
      <div
        className={`game relative shrink-0 ${isFinals ? 'game--finals' : ''} ${alignRight ? 'game-right' : ''}`}
        style={{ width: COL_W, height: MATCH_H }}
      >
        {label ? <p className="game-label">{label}</p> : null}

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
          className={`bhq-card relative flex h-full flex-col overflow-hidden ${cardState} ${clickable ? 'bhq-card--clickable' : ''}`}
        >
          {slots.map(({ player, playerId, hint, won, setScore }, i) => {
            const seed = playerId ? seedByPlayerId?.get(playerId) : undefined;
            return (
            <div
              key={i}
              className={`bhq-slot ${won ? 'bhq-slot--won' : ''} ${!player && hint ? 'slot-instruct bhq-slot--hint' : ''}`}
            >
              <span className="bhq-seed">{seed ?? ''}</span>
              <span className="slot-name">
                {player?.username ?? (
                  hint ? (
                    hint
                  ) : (
                    <span className="text-slate-500">{isBye ? 'BYE' : 'TBD'}</span>
                  )
                )}
              </span>
              <div className="flex w-8 shrink-0 items-center justify-end gap-0.5">
                {isComplete && setScore !== '' ? (
                  <span className="bhq-score">{setScore}</span>
                ) : null}
                {isComplete && won ? (
                  <Check className="h-3 w-3 text-emerald-400" strokeWidth={3} aria-hidden />
                ) : null}
              </div>
            </div>
          );
          })}
        </div>
        {showMatchNumber && matchNumber != null ? (
          <span className="game-number">{matchNumber}</span>
        ) : null}
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

function columnContentHeight(matchCount: number): number {
  if (matchCount <= 0) return MATCH_H;
  return matchCount * MATCH_H + Math.max(0, matchCount - 1) * GAP_R1;
}

function columnPadding(matchCount: number, bracketHeight: number): number {
  return Math.max(0, (bracketHeight - columnContentHeight(matchCount)) / 2);
}

function matchCenterY(pad: number, idx: number): number {
  return pad + idx * UNIT + MATCH_H / 2;
}

function computeWinnersCentersById(
  winnersRounds: HqBracketRound[],
  bracketSize: number,
  ghostTierCount = 0,
): Map<string, number> {
  const map = new Map<string, number>();
  if (winnersRounds.length === 0) return map;

  const colsBySlot: Array<Array<number | undefined>> = [];

  for (let c = 0; c < winnersRounds.length; c++) {
    const round = winnersRounds[c];
    const slotCount = winnersRoundSlotCount(bracketSize, round.round);
    const logicalIdx = ghostTierCount + c;
    colsBySlot[c] = new Array(slotCount).fill(undefined);

    if (c === 0) {
      for (const match of round.matches) {
        const pos = matchSlotPosition(match.matchIndex, slotCount, logicalIdx);
        colsBySlot[c][match.matchIndex] = pos.y;
        map.set(match.id, pos.y);
      }
      continue;
    }

    for (const match of round.matches) {
      const slot = match.matchIndex;
      const y1 = colsBySlot[c - 1][slot * 2];
      const y2 = colsBySlot[c - 1][slot * 2 + 1];
      let y: number;
      if (y1 != null && y2 != null) y = (y1 + y2) / 2;
      else if (y1 != null || y2 != null) y = (y1 ?? y2)!;
      else y = matchSlotPosition(slot, slotCount, logicalIdx).y;

      colsBySlot[c][slot] = y;
      map.set(match.id, y);
    }
  }

  return map;
}

function buildLosersIncomingMap(links: MatchLink[]): Map<string, string[]> {
  const byId = new Map(links.map((m) => [m.id, m]));
  const incoming = new Map<string, string[]>();

  function add(targetId: string, feederId: string) {
    const list = incoming.get(targetId) ?? [];
    if (!list.includes(feederId)) list.push(feederId);
    incoming.set(targetId, list);
  }

  for (const m of links) {
    if (m.loserNextId) add(m.loserNextId, m.id);
    if (m.winnerNextId && m.bracketSide === 'losers') {
      const target = byId.get(m.winnerNextId);
      if (target?.bracketSide === 'losers') add(m.winnerNextId, m.id);
    }
  }

  return incoming;
}

function computeLosersTreeCenters(
  losersRounds: HqBracketRound[],
  bracketHeight: number,
  winnersCenters: Map<string, number>,
  incoming: Map<string, string[]>,
  ghostTierCount: number,
): number[][] {
  const centerById = new Map<string, number>(winnersCenters);
  const result: number[][] = [];

  for (let r = 0; r < losersRounds.length; r++) {
    const round = losersRounds[r];
    const slotCount = losersRoundSlotCount(losersRounds, round.round);
    const logicalIdx = ghostTierCount + Math.max(0, round.round - 1);
    result[r] = [];

    for (let i = 0; i < round.matches.length; i++) {
      const match = round.matches[i];
      const feeders = incoming.get(match.id) ?? [];
      const feederYs = feeders
        .map((id) => centerById.get(id))
        .filter((y): y is number => y != null);

      let y: number;
      if (feederYs.length >= 2) {
        y = feederYs.reduce((sum, v) => sum + v, 0) / feederYs.length;
      } else if (feederYs.length === 1) {
        y = feederYs[0];
      } else {
        y = matchSlotPosition(match.matchIndex, slotCount, logicalIdx).y;
      }

      centerById.set(match.id, y);
      result[r].push(y);
    }
  }

  return result;
}

type BhqLosersColumn = {
  kind: 'ghost' | 'advance' | 'main';
  round: number;
  matches: BracketMatch[];
};

type BhqWinnersColumn = {
  kind: 'ghost' | 'main';
  round: number;
  matches: BracketMatch[];
};

function bhqColumnWidth(
  matchCount: number,
  kind: BhqLosersColumn['kind'] | BhqWinnersColumn['kind'],
  slotCount?: number,
): number {
  if (kind === 'ghost') return COL_W;
  const slots = slotCount ?? matchCount;
  return slots > 1 ? COL_W * 2 + GAP_H : COL_W;
}

function winnersMatchCenters(matchCount: number, logicalIdx: number): number[] {
  return halfBracketMatchPositions(matchCount, logicalIdx).map((p) => p.y);
}

function buildBhqWinnersDisplayColumns(
  rounds: HqBracketRound[],
  bracketSize: number,
): BhqWinnersColumn[] {
  const columns: BhqWinnersColumn[] = [];
  const ghostTiers = bhqGhostTierCount(bracketSize);
  for (let g = 0; g < ghostTiers; g++) {
    columns.push({ kind: 'ghost', round: 0, matches: [] });
    columns.push({ kind: 'ghost', round: 0, matches: [] });
  }
  for (const round of rounds) {
    columns.push({ kind: 'main', round: round.round, matches: round.matches });
  }
  return columns;
}

function hasWbFeeder(
  matchId: string,
  incoming: Map<string, string[]>,
  byId: Map<string, MatchLink>,
): boolean {
  return (incoming.get(matchId) ?? []).some((id) => byId.get(id)?.bracketSide === 'winners');
}

/** Bracket HQ losers: ghost padding + interleaved main/advance columns per round. */
function buildBhqLosersDisplayColumns(
  losersRounds: HqBracketRound[],
  matchLinks: MatchLink[],
  bracketSize: number,
): BhqLosersColumn[] {
  const incoming = buildLosersIncomingMap(matchLinks);
  const byId = new Map(matchLinks.map((m) => [m.id, m]));
  const columns: BhqLosersColumn[] = [];
  const advanceShown = new Set<string>();
  const n = losersRounds.length;

  const ghostPairs = bhqGhostTierCount(bracketSize);
  for (let g = 0; g < ghostPairs; g++) {
    columns.push({ kind: 'ghost', round: 0, matches: [] });
    columns.push({ kind: 'ghost', round: 0, matches: [] });
  }

  for (let r = 0; r < n; r++) {
    const round = losersRounds[r];
    const isFirst = r === 0;
    const isLast = r === n - 1;

    let mainMatches: BracketMatch[];
    if (isFirst) {
      mainMatches = round.matches.filter((m) => !advanceShown.has(m.id));
    } else if (isLast) {
      mainMatches = round.matches.filter((m) => !advanceShown.has(m.id));
    } else {
      mainMatches = round.matches.filter(
        (m) => !advanceShown.has(m.id) && !hasWbFeeder(m.id, incoming, byId),
      );
    }

    if (mainMatches.length > 0) {
      columns.push({ kind: 'main', round: round.round, matches: mainMatches });
    }

    if (!isLast) {
      const next = losersRounds[r + 1];
      const isBeforeFinals = r + 1 === n - 1;
      const advanceMatches = next.matches.filter(
        (m) =>
          hasWbFeeder(m.id, incoming, byId) &&
          !advanceShown.has(m.id) &&
          (!isBeforeFinals || next.matches.length > 1),
      );
      for (const m of advanceMatches) advanceShown.add(m.id);
      if (advanceMatches.length > 0) {
        columns.push({ kind: 'advance', round: next.round, matches: advanceMatches });
      }
    }
  }

  return columns;
}

function columnMatchCenters(
  column: BhqLosersColumn,
  centerById: Map<string, number>,
  bracketHeight: number,
  logicalIdx: number,
  slotCount: number,
): number[] {
  return buildColumnSlotCenters(column, centerById, bracketHeight, logicalIdx, slotCount);
}

function renderBhqSplitColumn(
  column: { kind: string; matches: BracketMatch[] },
  bracketHeight: number,
  isAdmin: boolean,
  userId: string | null,
  cardOpts: Parameters<typeof renderMatchCard>[3],
  trailingLabels?: string[],
  logicalIdx?: number,
  slotCount?: number,
  slotCenters?: number[],
) {
  if (column.kind === 'ghost' || column.matches.length === 0) {
    const ghostWidth = bhqColumnWidth(0, column.kind as BhqLosersColumn['kind']);
    return (
      <div
        className="relative shrink-0"
        style={{ width: ghostWidth, height: bracketHeight }}
        aria-hidden={column.kind === 'ghost'}
      />
    );
  }

  const slots = slotCount ?? roundMaxSlotCount(column.matches);
  const width = bhqColumnWidth(column.matches.length, column.kind as BhqLosersColumn['kind'], slots);

  return (
    <div className="relative shrink-0" style={{ width, height: bracketHeight }}>
      {column.matches.map((match, i) => {
        const grid = matchSlotPosition(match.matchIndex, slots, logicalIdx ?? 0);
        const pos: HalfBracketPos = {
          y: slotCenters?.[match.matchIndex] ?? grid.y,
          side: grid.side,
        };

        const xOffset = pos.side === 'right' ? COL_W + GAP_H : 0;
        return (
          <div
            key={match.id}
            className="absolute"
            style={{
              left: xOffset,
              width: COL_W,
              top: pos.y - MATCH_H / 2,
            }}
          >
            {renderMatchCard(match, isAdmin, userId, {
              ...cardOpts,
              label: trailingLabels?.[i],
              alignRight: pos.side === 'right',
              isFinals: trailingLabels?.[i]?.toLowerCase().includes('grand final'),
            })}
          </div>
        );
      })}
    </div>
  );
}

function renderBhqLosersColumn(
  column: BhqLosersColumn,
  centerById: Map<string, number>,
  bracketHeight: number,
  isAdmin: boolean,
  userId: string | null,
  cardOpts: Parameters<typeof renderMatchCard>[3],
  logicalIdx: number,
  slotCount: number,
) {
  const slotCenters = buildColumnSlotCenters(
    column,
    centerById,
    bracketHeight,
    logicalIdx,
    slotCount,
  );
  return renderBhqSplitColumn(
    column,
    bracketHeight,
    isAdmin,
    userId,
    cardOpts,
    undefined,
    logicalIdx,
    slotCount,
    slotCenters,
  );
}

function BhqLosersConnectorSpacer({ advance }: { advance?: boolean }) {
  return (
    <div
      className={`shrink-0 ${advance ? 'opacity-90' : ''}`}
      style={{ width: CONN_W }}
      aria-hidden
    />
  );
}

function LosersConnectorSvg({
  prevSlots,
  prevSlotCount,
  currMatches,
  currSlots,
  prevRoundIds,
  incoming,
  centerById,
  totalHeight,
  reverse = false,
}: {
  prevSlots: number[];
  prevSlotCount: number;
  currMatches: BracketMatch[];
  currSlots: number[];
  prevRoundIds: Set<string>;
  incoming: Map<string, string[]>;
  centerById: Map<string, number>;
  totalHeight: number;
  reverse?: boolean;
}) {
  const mid = CONN_W / 2;
  const sorted = [...currMatches].sort((a, b) => a.matchIndex - b.matchIndex);

  return (
    <svg
      width={CONN_W}
      height={totalHeight}
      className="shrink-0"
      style={{ overflow: 'visible' }}
      aria-hidden
    >
      {sorted.map((match) => {
        const y2 = currSlots[match.matchIndex] ?? totalHeight / 2;
        const feeders = (incoming.get(match.id) ?? []).filter((id) => prevRoundIds.has(id));
        const feederYs = feeders
          .map((id) => centerById.get(id))
          .filter((y): y is number => y != null)
          .sort((a, b) => a - b);

        let y1a: number;
        let y1b: number;

        if (feederYs.length >= 2) {
          y1a = feederYs[0];
          y1b = feederYs[feederYs.length - 1];
        } else if (feederYs.length === 1) {
          y1a = feederYs[0];
          y1b = feederYs[0];
        } else {
          const slot = match.matchIndex;
          y1a = prevSlots[slot * 2] ?? prevSlots[slot] ?? y2;
          y1b = prevSlots[slot * 2 + 1] ?? y1a;
        }

        const merge = Math.abs(y1a - y1b) > 1;

        if (merge) {
          const midY = (y1a + y1b) / 2;
          if (reverse) {
            return (
              <g key={match.id} stroke={CONN_STROKE} strokeWidth="1.5" fill="none">
                <polyline points={`${CONN_W},${y1a} ${mid},${y1a} ${mid},${midY}`} />
                <polyline points={`${CONN_W},${y1b} ${mid},${y1b} ${mid},${midY}`} />
                <polyline points={`${mid},${midY} ${mid},${y2} 0,${y2}`} />
              </g>
            );
          }
          return (
            <g key={match.id} stroke={CONN_STROKE} strokeWidth="1.5" fill="none">
              <polyline points={`0,${y1a} ${mid},${y1a} ${mid},${midY}`} />
              <polyline points={`0,${y1b} ${mid},${y1b} ${mid},${midY}`} />
              <polyline points={`${mid},${midY} ${mid},${y2} ${CONN_W},${y2}`} />
            </g>
          );
        }

        const points = reverse
          ? `${CONN_W},${y1a} ${mid},${y1a} ${mid},${y2} 0,${y2}`
          : `0,${y1a} ${mid},${y1a} ${mid},${y2} ${CONN_W},${y2}`;

        return (
          <g key={match.id} stroke={CONN_STROKE} strokeWidth="1.5" fill="none">
            <polyline points={points} />
          </g>
        );
      })}
    </svg>
  );
}

function SplitConnectorSvg({
  prevSlotCount,
  currSlotCount,
  prevLogicalIdx,
  totalHeight,
}: {
  prevSlotCount: number;
  currSlotCount: number;
  prevLogicalIdx: number;
  totalHeight: number;
}) {
  const prevPositions = halfBracketMatchPositions(prevSlotCount, prevLogicalIdx);
  const currPositions = halfBracketMatchPositions(currSlotCount, prevLogicalIdx + 1);
  const reach = COL_W + GAP_H;
  const xMid = CONN_W / 2;
  const xLeft = -reach;
  const xRight = 0;

  function feederX(slotIdx: number): number {
    return prevPositions[slotIdx]?.side === 'right' ? xRight : xLeft;
  }

  return (
    <svg
      width={CONN_W}
      height={totalHeight}
      className="shrink-0"
      style={{ overflow: 'visible' }}
      aria-hidden
    >
      {Array.from({ length: currSlotCount }, (_, i) => {
        const y1a = prevPositions[2 * i]?.y ?? prevPositions[0]?.y ?? 0;
        const y1b = prevPositions[2 * i + 1]?.y ?? y1a;
        const y2 = currPositions[i]?.y ?? (y1a + y1b) / 2;
        const xa = feederX(2 * i);
        const xb = feederX(2 * i + 1);
        const merge = Math.abs(y1a - y1b) > 1;

        if (merge) {
          const midY = (y1a + y1b) / 2;
          return (
            <g key={i} stroke={CONN_STROKE} strokeWidth="1.5" fill="none">
              <polyline points={`${xa},${y1a} ${xMid},${y1a} ${xMid},${midY}`} />
              <polyline points={`${xb},${y1b} ${xMid},${y1b} ${xMid},${midY}`} />
              <line x1={xMid} y1={midY} x2={CONN_W} y2={y2} />
            </g>
          );
        }

        return (
          <g key={i} stroke={CONN_STROKE} strokeWidth="1.5" fill="none">
            <polyline points={`${xa},${y1a} ${xMid},${y1a} ${xMid},${y2} ${CONN_W},${y2}`} />
          </g>
        );
      })}
    </svg>
  );
}

function ConnectorSvg({
  matchCount,
  colIdx,
  totalHeight,
  prevSlotCount,
  currSlotCount,
}: {
  matchCount: number;
  colIdx: number;
  totalHeight: number;
  prevSlotCount?: number;
  currSlotCount?: number;
}) {
  const prevSlots = prevSlotCount ?? matchCount;
  const currSlots = currSlotCount ?? matchCount;

  if (prevSlots > 1) {
    return (
      <SplitConnectorSvg
        prevSlotCount={prevSlots}
        currSlotCount={currSlots}
        prevLogicalIdx={colIdx - 1}
        totalHeight={totalHeight}
      />
    );
  }

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
          <g key={i} stroke={CONN_STROKE} strokeWidth="1.25" fill="none">
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
      <line x1={0} y1={alignY} x2={CONN_W} y2={alignY} stroke={CONN_STROKE} strokeWidth="1.25" />
    </svg>
  );
}

function BhqRoundTitleLabel({ parts }: { parts: BhqRoundTitleParts }) {
  return (
    <>
      <s className="opacity-45">{parts.prefix} </s>
      {parts.label}
    </>
  );
}

function BhqDisplayTitlesRow({
  columns,
  position,
  totalRounds,
  bhqTitles,
  bracketKind,
  trailingLabel,
}: {
  columns: Array<{
    kind: 'ghost' | 'advance' | 'main' | 'trailing';
    round?: number;
    roundIdx?: number;
    width: number;
    skipTitle?: boolean;
  }>;
  position: 'top' | 'bottom';
  totalRounds: number;
  bhqTitles?: boolean;
  bracketKind?: 'winners' | 'losers';
  trailingLabel?: string;
}) {
  return (
    <div className={`flex items-start ${position === 'bottom' ? 'mt-6 pb-2' : 'mb-2.5'}`}>
      {columns.map((col, colIdx) => {
        let title: ReactNode = null;
        if (!col.skipTitle && col.kind === 'main' && col.round != null && col.roundIdx != null) {
          const bhqParts =
            bhqTitles && bracketKind
              ? bracketKind === 'winners'
                ? winnersBhqRoundTitle(col.round, totalRounds)
                : losersBhqRoundTitle(col.round, totalRounds)
              : null;
          const plain =
            bracketKind === 'losers'
              ? `Losers Round ${col.round}`
              : `Round ${col.round}`;
          title = bhqParts ? <BhqRoundTitleLabel parts={bhqParts} /> : plain;
        } else if (col.kind === 'trailing') {
          title = trailingLabel ?? 'Grand Finals';
        }

        return (
          <Fragment key={`bhq-title-${colIdx}-${col.kind}-${col.round ?? 'x'}`}>
            {colIdx > 0 && <div className="shrink-0" style={{ width: CONN_W }} />}
            <p
              className={`bracket-round-title shrink-0 text-center ${
                bracketKind === 'losers'
                  ? 'bracket-round-title--losers'
                  : 'bracket-round-title--winners'
              }`}
              style={{ width: col.width }}
            >
              {title}
            </p>
          </Fragment>
        );
      })}
    </div>
  );
}

function RoundTitlesRow({
  rounds,
  position,
  getRoundTitle,
  direction,
  bhqTitles,
  bracketKind,
}: {
  rounds: HqBracketRound[];
  position: 'top' | 'bottom';
  getRoundTitle?: (round: number, roundIdx: number, totalRounds: number) => string;
  direction: 'ltr' | 'rtl';
  bhqTitles?: boolean;
  bracketKind?: 'winners' | 'losers';
}) {
  const total = rounds.length;
  const displayRounds = direction === 'rtl' ? [...rounds].reverse() : rounds;

  return (
    <div className={`flex items-start ${position === 'bottom' ? 'mt-5 pb-1' : 'mb-2.5'}`}>
      {displayRounds.map((round, colIdx) => {
        const roundIdx = direction === 'rtl' ? total - 1 - colIdx : colIdx;
        const plain = getRoundTitle?.(round.round, roundIdx, total) ?? `Round ${round.round}`;
        const bhqParts =
          bhqTitles && bracketKind
            ? bracketKind === 'winners'
              ? winnersBhqRoundTitle(round.round, total)
              : losersBhqRoundTitle(round.round, total)
            : null;

        return (
          <Fragment key={`title-${round.round}`}>
            {colIdx > 0 && <div className="shrink-0" style={{ width: CONN_W }} />}
            <p
              className={`bracket-round-title shrink-0 text-center ${
                bracketKind === 'losers'
                  ? 'bracket-round-title--losers'
                  : 'bracket-round-title--winners'
              }`}
              style={{ width: COL_W }}
            >
              {bhqParts ? <BhqRoundTitleLabel parts={bhqParts} /> : plain}
            </p>
          </Fragment>
        );
      })}
    </div>
  );
}

function renderMatchCard(
  match: BracketMatch,
  isAdmin: boolean,
  userId: string | null,
  opts: {
    label?: string;
    seedByPlayerId?: Map<string, number>;
    matchNumbers?: Map<string, number>;
    showMatchNumbers?: boolean;
    alignRight?: boolean;
    isFinals?: boolean;
  },
) {
  return (
    <HqMatchCard
      key={match.id}
      match={match}
      isAdmin={isAdmin}
      userId={userId}
      label={opts.label}
      seedByPlayerId={opts.seedByPlayerId}
      matchNumber={opts.matchNumbers?.get(match.id)}
      showMatchNumber={opts.showMatchNumbers}
      alignRight={opts.alignRight}
      isFinals={opts.isFinals}
    />
  );
}

function verticalRowWidth(matchCount: number): number {
  return matchCount * COL_W + Math.max(0, matchCount - 1) * GAP_H;
}

function verticalMatchCenterX(matchCount: number, idx: number, containerWidth: number): number {
  const rw = verticalRowWidth(matchCount);
  const offset = (containerWidth - rw) / 2;
  return offset + idx * (COL_W + GAP_H) + COL_W / 2;
}

function VerticalLosersConnectorSvg({
  prevMatchCount,
  matchCount,
  containerWidth,
}: {
  prevMatchCount: number;
  matchCount: number;
  containerWidth: number;
}) {
  const mid = CONN_V / 2;

  return (
    <svg
      width={containerWidth}
      height={CONN_V}
      className="shrink-0"
      style={{ overflow: 'visible' }}
      aria-hidden
    >
      {Array.from({ length: matchCount }, (_, i) => {
        const x2 = verticalMatchCenterX(matchCount, i, containerWidth);
        const prevIdx = Math.min(
          Math.round(((i + 0.5) / matchCount) * prevMatchCount - 0.5),
          prevMatchCount - 1,
        );
        const x1 = verticalMatchCenterX(prevMatchCount, Math.max(0, prevIdx), containerWidth);

        return (
          <g key={i} stroke={CONN_STROKE} strokeWidth="1.25" fill="none">
            <polyline points={`${x1},0 ${x1},${mid} ${x2},${mid} ${x2},${CONN_V}`} />
          </g>
        );
      })}
    </svg>
  );
}

function VerticalLosersTree({
  rounds,
  isAdmin,
  userId,
  getRoundTitle,
  seedByPlayerId,
  matchNumbers,
  showMatchNumbers = true,
  className,
}: {
  rounds: HqBracketRound[];
  isAdmin: boolean;
  userId: string | null;
  getRoundTitle?: (round: number, roundIdx: number, totalRounds: number) => string;
  seedByPlayerId?: Map<string, number>;
  matchNumbers?: Map<string, number>;
  showMatchNumbers?: boolean;
  className?: string;
}) {
  if (rounds.length === 0) {
    return <p className="py-8 text-center text-sm text-slate-500">No matches yet</p>;
  }

  const totalRounds = rounds.length;
  const containerWidth = Math.max(...rounds.map((r) => verticalRowWidth(r.matches.length)), COL_W);
  const cardOpts = { seedByPlayerId, matchNumbers, showMatchNumbers };

  return (
    <div className={className}>
      {rounds.map((round, rowIdx) => {
        const title =
          getRoundTitle?.(round.round, rowIdx, totalRounds) ?? `Losers Round ${round.round}`;
        const prevRound = rowIdx > 0 ? rounds[rowIdx - 1] : null;

        return (
          <div key={round.round} className="flex items-start gap-3">
            <p
              className="shrink-0 pt-5 text-right text-[10px] font-semibold uppercase leading-tight tracking-wider text-amber-500/85"
              style={{ width: ROW_LABEL_W }}
            >
              {title}
            </p>
            <div className="flex flex-col items-center">
              {prevRound && (
                <VerticalLosersConnectorSvg
                  prevMatchCount={prevRound.matches.length}
                  matchCount={round.matches.length}
                  containerWidth={containerWidth}
                />
              )}
              <div
                className="flex justify-center"
                style={{ gap: `${GAP_H}px`, width: containerWidth }}
              >
                {round.matches.map((match) =>
                  renderMatchCard(match, isAdmin, userId, cardOpts),
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function BhqVerticalBridge({ height = 20 }: { height?: number }) {
  return (
    <div className="flex justify-center" style={{ width: HQ_COL_W }}>
      <div className="w-px bg-slate-600" style={{ height }} aria-hidden />
    </div>
  );
}

export function BracketHqTree({
  rounds,
  isAdmin,
  userId,
  trailingMatches,
  trailingLabels,
  minHeight,
  layout = 'tree',
  direction = 'ltr',
  roundTitlesPosition = 'none',
  getRoundTitle,
  seedByPlayerId,
  matchNumbers,
  showMatchNumbers = true,
  className,
  bhqTitles = false,
  bracketKind,
  winnersRounds,
  matchLinks,
  bracketSize: bracketSizeProp,
}: Props) {
  if (layout === 'losers-vertical') {
    return (
      <VerticalLosersTree
        rounds={rounds}
        isAdmin={isAdmin}
        userId={userId}
        getRoundTitle={getRoundTitle}
        seedByPlayerId={seedByPlayerId}
        matchNumbers={matchNumbers}
        showMatchNumbers={showMatchNumbers}
        className={className}
      />
    );
  }

  const isLosersTree = layout === 'losers-tree';
  const isRtl = direction === 'rtl';
  const displayRounds = isRtl ? [...rounds].reverse() : rounds;

  const r1Count = rounds[0]?.matches.length ?? 0;
  const totalRounds = rounds.length;
  const bracketSize =
    bracketSizeProp ??
    Math.pow(2, Math.ceil(Math.log2(Math.max(2, r1Count * 2))));
  const bracketHeight =
    minHeight ??
    (bracketSizeProp
      ? computeBracketHeightForSize(bracketSize)
      : computeBracketHeight(Math.max(r1Count, 1)));

  const ghostTierCount = bhqGhostTierCount(bracketSize);

  const winnersCentersById = computeWinnersCentersById(
    winnersRounds ?? [],
    bracketSize,
    ghostTierCount,
  );
  const incoming = buildLosersIncomingMap(matchLinks ?? []);
  const isLosersBracket = bracketKind === 'losers';
  const losersCenters =
    (isLosersTree || isLosersBracket) && (matchLinks?.length ?? 0) > 0
      ? computeLosersTreeCenters(
          rounds,
          bracketHeight,
          winnersCentersById,
          incoming,
          ghostTierCount,
        )
      : null;

  const centerById = new Map<string, number>(winnersCentersById);
  if (losersCenters) {
    rounds.forEach((round, r) => {
      round.matches.forEach((m, i) => centerById.set(m.id, losersCenters[r][i]));
    });
  }

  const lastWinnersLogicalIdx =
    !isLosersTree && totalRounds > 0 ? ghostTierCount + totalRounds - 1 : 0;
  const lastRoundPad = isLosersTree
    ? Math.max(0, (losersCenters?.[totalRounds - 1]?.[0] ?? MATCH_H / 2) - MATCH_H / 2)
    : totalRounds > 0
      ? topPad(lastWinnersLogicalIdx)
      : 0;
  const trailingCenterY = (() => {
    if (isLosersTree && losersCenters?.[totalRounds - 1]?.[0] != null) {
      return losersCenters[totalRounds - 1][0];
    }
    if (!isLosersTree && totalRounds > 0) {
      const lastRound = rounds[rounds.length - 1];
      const slotCount = winnersRoundSlotCount(bracketSize, lastRound.round);
      const centers = winnersMatchCenters(slotCount, lastWinnersLogicalIdx);
      return centers[0] ?? lastRoundPad + MATCH_H / 2;
    }
    return lastRoundPad + MATCH_H / 2;
  })();

  if (rounds.length === 0 && !trailingMatches?.length) {
    return <p className="py-8 text-center text-sm text-slate-500">No matches yet</p>;
  }

  const cardOpts = { seedByPlayerId, matchNumbers, showMatchNumbers };

  const bhqLosersColumns =
    isLosersTree && losersCenters
      ? buildBhqLosersDisplayColumns(rounds, matchLinks ?? [], bracketSize)
      : null;

  const bhqWinnersColumns =
    layout === 'tree' && rounds.length > 0
      ? buildBhqWinnersDisplayColumns(isRtl ? [...rounds].reverse() : rounds, bracketSize)
      : null;

  const ghostTierCountForColumns = ghostTierCount;

  function buildTitleColumns(
    displayColumns: Array<{ kind: string; round: number; matches: BracketMatch[] }>,
    includeTrailing: boolean,
  ) {
    type TitleCol = {
      kind: 'ghost' | 'advance' | 'main' | 'trailing';
      round?: number;
      roundIdx?: number;
      width: number;
      skipTitle?: boolean;
    };

    const cols: TitleCol[] = displayColumns.map((col, colIdx) => {
      const mainIdx =
        col.kind === 'main'
          ? displayColumns
              .slice(0, colIdx + 1)
              .filter((c) => c.kind === 'main').length - 1
          : undefined;
      return {
        kind: col.kind as 'ghost' | 'advance' | 'main',
        round: col.round,
        roundIdx: mainIdx,
        width: bhqColumnWidth(
          col.matches.length,
          col.kind as BhqLosersColumn['kind'],
          col.kind === 'ghost'
            ? undefined
            : col.round > 0
              ? bracketKind === 'losers'
                ? losersRoundSlotCount(rounds, col.round)
                : winnersRoundSlotCount(bracketSize, col.round)
              : roundMaxSlotCount(col.matches) || undefined,
        ),
        skipTitle: col.kind === 'advance' || col.kind === 'ghost',
      };
    });

    if (includeTrailing) {
      cols.push({ kind: 'trailing', width: COL_W, skipTitle: false });
    }

    return cols;
  }

  const treeBody =
    isLosersTree && losersCenters && bhqLosersColumns ? (
      <div
        className="flex items-start"
        style={{ minHeight: bracketHeight, paddingBottom: TREE_PAD_BOTTOM }}
      >
        {bhqLosersColumns.map((column, colIdx) => {
          const prevCol = colIdx > 0 ? bhqLosersColumns[colIdx - 1] : null;
          const logicalIdx = losersColumnLogicalIdx(column, ghostTierCount);
          const slotCount =
            column.kind === 'ghost'
              ? 0
              : losersRoundSlotCount(rounds, column.round);
          const prevLogicalIdx = prevCol
            ? losersColumnLogicalIdx(prevCol, ghostTierCount)
            : ghostTierCount;
          const prevSlotCount = prevCol
            ? prevCol.kind === 'ghost'
              ? winnersRoundSlotCount(bracketSize, 1)
              : losersRoundSlotCount(rounds, prevCol.round)
            : 0;
          const prevSlots = prevCol
            ? buildColumnSlotCenters(
                prevCol,
                centerById,
                bracketHeight,
                prevLogicalIdx,
                prevSlotCount,
              )
            : [];
          const currSlots = columnMatchCenters(
            column,
            centerById,
            bracketHeight,
            logicalIdx,
            slotCount,
          );
          const prevRoundIds = new Set(prevCol?.matches.map((m) => m.id) ?? []);
          const showConnector =
            colIdx > 0 &&
            column.kind !== 'ghost' &&
            (prevCol?.matches.length ?? 0) + column.matches.length > 0;
          const isAdvanceConnector = column.kind === 'advance' || prevCol?.kind === 'advance';

          return (
            <Fragment key={`lb-col-${colIdx}-${column.kind}-${column.round}`}>
              {colIdx > 0 &&
                (showConnector ? (
                  <LosersConnectorSvg
                    prevSlots={prevSlots}
                    prevSlotCount={prevSlotCount}
                    currMatches={column.matches}
                    currSlots={currSlots}
                    prevRoundIds={prevRoundIds}
                    incoming={incoming}
                    centerById={centerById}
                    totalHeight={bracketHeight}
                    reverse={false}
                  />
                ) : (
                  <BhqLosersConnectorSpacer advance={isAdvanceConnector} />
                ))}
              <div className={column.kind === 'advance' ? 'round-advance-col' : undefined}>
                {renderBhqLosersColumn(
                  column,
                  centerById,
                  bracketHeight,
                  isAdmin,
                  userId,
                  cardOpts,
                  logicalIdx,
                  slotCount,
                )}
              </div>
            </Fragment>
          );
        })}
      </div>
    ) : bhqWinnersColumns ? (
      <div
        className="flex items-start"
        style={{ minHeight: bracketHeight, paddingBottom: TREE_PAD_BOTTOM }}
      >
        {bhqWinnersColumns.map((column, colIdx) => {
          const mainColIdx = bhqWinnersColumns
            .slice(0, colIdx + 1)
            .filter((c) => c.kind === 'main').length - 1;
          const logicalIdx =
            column.kind === 'main' ? ghostTierCountForColumns + Math.max(0, mainColIdx) : colIdx;
          const slotCount =
            column.kind === 'main'
              ? isLosersBracket
                ? losersRoundSlotCount(rounds, column.round)
                : winnersRoundSlotCount(bracketSize, column.round)
              : 0;
          const prevCol = colIdx > 0 ? bhqWinnersColumns[colIdx - 1] : null;
          const showConnector =
            colIdx > 0 && column.kind === 'main' && prevCol?.kind !== 'ghost';
          const prevSlotCount =
            prevCol?.kind === 'main'
              ? isLosersBracket
                ? losersRoundSlotCount(rounds, prevCol.round)
                : winnersRoundSlotCount(bracketSize, prevCol.round)
              : 0;
          const slotCenters =
            isLosersBracket && column.kind === 'main'
              ? buildColumnSlotCenters(
                  { kind: 'main', round: column.round, matches: column.matches },
                  centerById,
                  bracketHeight,
                  logicalIdx,
                  slotCount,
                )
              : undefined;

          return (
            <Fragment key={`wb-col-${colIdx}-${column.kind}-${column.round}`}>
              {colIdx > 0 &&
                (showConnector ? (
                  <ConnectorSvg
                    matchCount={column.matches.length}
                    colIdx={logicalIdx}
                    totalHeight={bracketHeight}
                    prevSlotCount={prevSlotCount > 0 ? prevSlotCount : undefined}
                    currSlotCount={slotCount}
                  />
                ) : (
                  <BhqLosersConnectorSpacer />
                ))}
              {renderBhqSplitColumn(
                column,
                bracketHeight,
                isAdmin,
                userId,
                cardOpts,
                undefined,
                column.kind === 'main' ? logicalIdx : undefined,
                slotCount > 0 ? slotCount : undefined,
                slotCenters,
              )}
            </Fragment>
          );
        })}

        {!isLosersBracket && trailingMatches && trailingMatches.length > 0 && totalRounds > 0 && (
          <TrailingConnector alignY={trailingCenterY} totalHeight={bracketHeight} />
        )}

        {!isLosersBracket && trailingMatches && trailingMatches.length > 0 && (
          <div className="relative shrink-0" style={{ width: COL_W, height: bracketHeight }}>
            {trailingMatches.map((match, i) => (
              <div
                key={match.id}
                className="absolute left-0"
                style={{
                  width: COL_W,
                  top:
                    trailingMatches.length > 1
                      ? trailingCenterY - MATCH_H / 2 + i * UNIT
                      : trailingCenterY - MATCH_H / 2,
                }}
              >
                {renderMatchCard(match, isAdmin, userId, {
                  ...cardOpts,
                  label: trailingLabels?.[i],
                  isFinals: trailingLabels?.[i]?.toLowerCase().includes('grand final'),
                })}
              </div>
            ))}
          </div>
        )}
      </div>
    ) : (
      <div className="flex items-start" style={{ minHeight: bracketHeight }}>
        {displayRounds.map((round, colIdx) => {
          const logicalIdx = isRtl ? totalRounds - 1 - colIdx : colIdx;
          const pad = topPad(logicalIdx);
          const gap = matchGap(logicalIdx);

          return (
            <Fragment key={round.round}>
              {colIdx > 0 && (
                <ConnectorSvg
                  matchCount={round.matches.length}
                  colIdx={logicalIdx}
                  totalHeight={bracketHeight}
                />
              )}
              <div
                className="flex shrink-0 flex-col"
                style={{ paddingTop: pad, gap: `${gap}px`, width: COL_W }}
              >
                {round.matches.map((match) => renderMatchCard(match, isAdmin, userId, cardOpts))}
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
            {trailingMatches.map((match, i) =>
              renderMatchCard(match, isAdmin, userId, {
                ...cardOpts,
                label: trailingLabels?.[i],
                isFinals: trailingLabels?.[i]?.toLowerCase().includes('grand final'),
              }),
            )}
          </div>
        )}
      </div>
    );

  const titleColumns =
    roundTitlesPosition !== 'none' && bhqTitles
      ? isLosersTree && bhqLosersColumns
        ? buildTitleColumns(bhqLosersColumns, false)
        : bhqWinnersColumns
          ? buildTitleColumns(
              bhqWinnersColumns,
              Boolean(
                trailingMatches &&
                  trailingMatches.length > 0 &&
                  bracketKind !== 'losers',
              ),
            )
          : null
      : null;

  const titles =
    roundTitlesPosition !== 'none' ? (
      titleColumns ? (
        <BhqDisplayTitlesRow
          columns={titleColumns}
          position={roundTitlesPosition}
          totalRounds={totalRounds}
          bhqTitles={bhqTitles}
          bracketKind={bracketKind}
          trailingLabel="Grand Finals"
        />
      ) : (
        <RoundTitlesRow
          rounds={rounds}
          position={roundTitlesPosition}
          getRoundTitle={getRoundTitle}
          direction={direction}
          bhqTitles={bhqTitles}
          bracketKind={bracketKind}
        />
      )
    ) : null;

  return (
    <div className={className}>
      {roundTitlesPosition === 'top' && titles}
      {treeBody}
      {roundTitlesPosition === 'bottom' && titles}
    </div>
  );
}
