import { participantDisplayName } from '@/lib/tournament-participant';

export type TournamentMatch = {
  id: string;
  round: number;
  matchIndex: number;
  bracketSide: string | null;
  groupId?: number | null;
  status: string;
  score: string | null;
  player1Id: string | null;
  player2Id: string | null;
  winnerId: string | null;
  player1: { id: string; username: string } | null;
  player2: { id: string; username: string } | null;
  winner: { id: string; username: string } | null;
};

export type TournamentParticipant = {
  userId: string;
  seed: number | null;
  groupId?: number | null;
  walkInName?: string | null;
  user: { id: string; username: string; rankPoints: number };
};

export type BracketStatus =
  | 'Champion'
  | 'Runner-up'
  | '3rd place'
  | '4th place'
  | 'Grand Final'
  | 'Winners Bracket'
  | 'Losers Bracket'
  | 'Active'
  | 'Eliminated'
  | 'Registered';

function isInGrandFinalOrReset(matches: TournamentMatch[], userId: string): boolean {
  for (const side of ['grand_final', 'reset'] as const) {
    const m = matches.find((x) => x.bracketSide === side);
    if (m && (m.player1Id === userId || m.player2Id === userId)) return true;
  }
  return false;
}

/** Double elimination: out after 2 losses, or when the bracket has no remaining path. */
function isEliminatedFromBracket(
  matches: TournamentMatch[],
  userId: string,
  losses: number,
): boolean {
  if (losses >= 2) return true;

  const inUpcoming = matches.some(
    (m) =>
      m.bracketSide !== 'reset' &&
      m.status !== 'complete' &&
      m.status !== 'bye' &&
      (m.player1Id === userId || m.player2Id === userId),
  );
  if (inUpcoming) return false;

  const waitingInMatch = matches.some((m) => {
    if (m.status === 'complete' || m.status === 'bye') return false;
    const inMatch = m.player1Id === userId || m.player2Id === userId;
    if (!inMatch) return false;
    return Boolean(m.player1Id) !== Boolean(m.player2Id);
  });
  if (waitingInMatch) return false;

  if (isInGrandFinalOrReset(matches, userId)) return false;

  const grandFinal = matches.find((m) => m.bracketSide === 'grand_final');
  const losersStillRunning = matches.some(
    (m) => m.bracketSide === 'losers' && m.status !== 'complete' && m.status !== 'bye',
  );

  // Grand final lineup is set — everyone else is out even if they only have one loss on paper
  if (grandFinal?.player1Id && grandFinal.player2Id) {
    if (grandFinal.player1Id !== userId && grandFinal.player2Id !== userId) return true;
  }

  // Losers bracket finished — only the grand-final losers-side slot is still alive with one loss
  if (losses === 1 && !losersStillRunning && grandFinal?.player2Id) {
    if (grandFinal.player2Id !== userId) return true;
  }

  return false;
}

export type PlayerStanding = {
  userId: string;
  username: string;
  seed: number | null;
  rankPoints: number;
  wins: number;
  losses: number;
  status: BracketStatus;
  statusRank: number;
};

export type BracketGroup = {
  id: string;
  label: string;
  playerIds: string[];
  players: { userId: string; username: string; wins: number; losses: number }[];
  matches: TournamentMatch[];
};

const STATUS_ORDER: Record<BracketStatus, number> = {
  Champion: 0,
  'Runner-up': 1,
  '3rd place': 2,
  '4th place': 3,
  'Grand Final': 4,
  Active: 5,
  'Winners Bracket': 6,
  'Losers Bracket': 7,
  Registered: 8,
  Eliminated: 9,
};

function countLosses(matches: TournamentMatch[], userId: string): number {
  let losses = 0;
  for (const m of matches) {
    if (m.bracketSide === 'group') continue;
    if (m.status !== 'complete' && m.status !== 'bye') continue;
    if (!m.winnerId) continue;
    if (m.player1Id !== userId && m.player2Id !== userId) continue;
    if (m.winnerId !== userId) losses++;
  }
  return losses;
}

function countWins(matches: TournamentMatch[], userId: string): number {
  let wins = 0;
  for (const m of matches) {
    if (m.bracketSide === 'group') continue;
    if (m.status !== 'complete' || m.winnerId !== userId) continue;
    if (m.player1Id === userId || m.player2Id === userId) wins++;
  }
  return wins;
}

function getSingleElimBracketStatus(
  matches: TournamentMatch[],
  userId: string,
  tournamentStatus: string,
): BracketStatus {
  const playoff = matches.filter((m) => m.bracketSide !== 'group');
  const main = playoff.filter((m) => m.bracketSide !== 'third_place');
  if (main.length === 0) return 'Registered';

  const maxRound = Math.max(...main.map((m) => m.round));
  const finalMatch = main.find((m) => m.round === maxRound && m.matchIndex === 0);
  const thirdPlace = playoff.find((m) => m.bracketSide === 'third_place');

  if (finalMatch?.status === 'complete' && finalMatch.winnerId === userId) return 'Champion';
  if (
    finalMatch?.status === 'complete' &&
    (finalMatch.player1Id === userId || finalMatch.player2Id === userId)
  ) {
    return 'Runner-up';
  }
  if (
    finalMatch &&
    finalMatch.status !== 'complete' &&
    (finalMatch.player1Id === userId || finalMatch.player2Id === userId)
  ) {
    return 'Grand Final';
  }

  if (thirdPlace?.status === 'complete' && thirdPlace.winnerId === userId) return '3rd place';
  if (
    thirdPlace?.status === 'complete' &&
    (thirdPlace.player1Id === userId || thirdPlace.player2Id === userId)
  ) {
    return '4th place';
  }

  const stillInMain = main.some(
    (m) => m.status === 'pending' && (m.player1Id === userId || m.player2Id === userId),
  );
  const inThirdPlace =
    thirdPlace &&
    thirdPlace.status !== 'complete' &&
    (thirdPlace.player1Id === userId || thirdPlace.player2Id === userId);

  if (stillInMain || inThirdPlace) return 'Active';

  if (tournamentStatus !== 'complete') {
    const advanced = main.some(
      (m) =>
        m.round > 1 &&
        m.status === 'pending' &&
        (m.player1Id === userId || m.player2Id === userId) &&
        m.player1Id &&
        m.player2Id,
    );
    if (advanced) return 'Active';
  }

  return 'Eliminated';
}

export function getBracketStatus(
  matches: TournamentMatch[],
  userId: string,
  tournamentStatus: string,
): BracketStatus {
  if (matches.length === 0) return 'Registered';

  const losses = countLosses(matches, userId);

  const grandFinal = matches.find((m) => m.bracketSide === 'grand_final');
  const reset = matches.find((m) => m.bracketSide === 'reset');

  if (tournamentStatus === 'complete') {
    if (reset?.status === 'complete' && reset.winnerId === userId) return 'Champion';
    if (
      reset?.status === 'complete' &&
      (reset.player1Id === userId || reset.player2Id === userId)
    ) {
      return 'Runner-up';
    }
    if (grandFinal?.status === 'complete' && grandFinal.winnerId === userId) return 'Champion';
    if (
      grandFinal?.status === 'complete' &&
      (grandFinal.player1Id === userId || grandFinal.player2Id === userId)
    ) {
      return 'Runner-up';
    }

    return 'Eliminated';
  }

  if (grandFinal && (grandFinal.player1Id === userId || grandFinal.player2Id === userId)) {
    if (grandFinal.status === 'pending' || grandFinal.status === 'in_progress') return 'Grand Final';
  }
  if (reset && (reset.player1Id === userId || reset.player2Id === userId)) {
    if (reset.status === 'pending' || reset.status === 'in_progress') return 'Grand Final';
  }

  if (isEliminatedFromBracket(matches, userId, losses)) return 'Eliminated';
  if (losses === 1) return 'Losers Bracket';
  if (losses === 0 && matches.length > 0) return 'Winners Bracket';

  return 'Registered';
}

export function computeTournamentStandings(
  participants: TournamentParticipant[],
  matches: TournamentMatch[],
  tournamentStatus: string,
  format?: string,
): PlayerStanding[] {
  const resolveStatus =
    format === 'single_elimination'
      ? (userId: string) => getSingleElimBracketStatus(matches, userId, tournamentStatus)
      : (userId: string) => getBracketStatus(matches, userId, tournamentStatus);

  return participants
    .map((p) => {
      const status = resolveStatus(p.userId);
      return {
        userId: p.userId,
        username: participantDisplayName(p),
        seed: p.seed,
        rankPoints: p.user.rankPoints,
        wins: countWins(matches, p.userId),
        losses: countLosses(matches, p.userId),
        status,
        statusRank: STATUS_ORDER[status],
      };
    })
    .sort((a, b) => {
      if (a.statusRank !== b.statusRank) return a.statusRank - b.statusRank;
      if (format === 'single_elimination') {
        if (b.wins !== a.wins) return b.wins - a.wins;
        if (a.losses !== b.losses) return a.losses - b.losses;
      } else {
        if (a.losses !== b.losses) return a.losses - b.losses;
        if (b.wins !== a.wins) return b.wins - a.wins;
      }
      const seedA = a.seed ?? 9999;
      const seedB = b.seed ?? 9999;
      if (seedA !== seedB) return seedA - seedB;
      return b.rankPoints - a.rankPoints;
    });
}

export function computeBracketGroups(
  participants: TournamentParticipant[],
  matches: TournamentMatch[],
): BracketGroup[] {
  const wbR1 = matches
    .filter((m) => m.bracketSide === 'winners' && m.round === 1)
    .sort((a, b) => a.matchIndex - b.matchIndex);

  if (wbR1.length === 0) {
    const chunk = Math.ceil(participants.length / 4) || 1;
    return Array.from({ length: Math.ceil(participants.length / chunk) || 1 }, (_, i) => {
      const slice = participants.slice(i * chunk, (i + 1) * chunk);
      return {
        id: `group-${i}`,
        label: `Group ${String.fromCharCode(65 + i)}`,
        playerIds: slice.map((p) => p.userId),
        players: slice.map((p) => ({
          userId: p.userId,
          username: participantDisplayName(p),
          wins: countWins(matches, p.userId),
          losses: countLosses(matches, p.userId),
        })),
        matches: [],
      };
    });
  }

  const groupCount = Math.min(4, Math.max(1, Math.ceil(wbR1.length / 2)));
  const matchesPerGroup = Math.ceil(wbR1.length / groupCount);

  return Array.from({ length: groupCount }, (_, g) => {
    const groupR1 = wbR1.slice(g * matchesPerGroup, (g + 1) * matchesPerGroup);
    const playerIds = new Set<string>();
    for (const m of groupR1) {
      if (m.player1Id) playerIds.add(m.player1Id);
      if (m.player2Id) playerIds.add(m.player2Id);
    }

    const ids = [...playerIds];
    const groupMatches = matches.filter(
      (m) =>
        m.status !== 'bye' &&
        ((m.player1Id && playerIds.has(m.player1Id)) || (m.player2Id && playerIds.has(m.player2Id))),
    );

    return {
      id: `group-${g}`,
      label: `Group ${String.fromCharCode(65 + g)}`,
      playerIds: ids,
      players: ids
        .map((userId) => {
          const p = participants.find((x) => x.userId === userId);
          return {
            userId,
            username: p ? participantDisplayName(p) : 'Unknown',
            wins: countWins(matches, userId),
            losses: countLosses(matches, userId),
          };
        })
        .sort((a, b) => b.wins - a.wins || a.losses - b.losses),
      matches: groupMatches.sort((a, b) => a.round - b.round || a.matchIndex - b.matchIndex),
    };
  });
}

export type PodiumEntry = {
  placement: 1 | 2 | 3;
  userId: string;
  username: string;
};

function loserId(match: TournamentMatch): string | null {
  if (!match.winnerId) return null;
  if (match.player1Id && match.player1Id !== match.winnerId) return match.player1Id;
  if (match.player2Id && match.player2Id !== match.winnerId) return match.player2Id;
  return null;
}

function usernameFor(matches: TournamentMatch[], userId: string): string {
  for (const m of matches) {
    if (m.player1?.id === userId) return m.player1.username;
    if (m.player2?.id === userId) return m.player2.username;
    if (m.winner?.id === userId) return m.winner.username;
  }
  return 'Unknown';
}

function findBracketFinal(
  matches: TournamentMatch[],
  side: 'winners' | 'losers',
): TournamentMatch | undefined {
  const sideMatches = matches.filter((m) => m.bracketSide === side && m.status === 'complete');
  if (sideMatches.length === 0) return undefined;
  const maxRound = Math.max(...sideMatches.map((m) => m.round));
  return sideMatches.find((m) => m.round === maxRound && m.matchIndex === 0);
}

export function computeTournamentPodium(
  matches: TournamentMatch[],
  tournamentStatus: string,
  format: string,
  grandFinalsModifier = 'default',
): PodiumEntry[] {
  if (tournamentStatus !== 'complete') return [];

  const playoffMatches = matches.filter((m) => m.bracketSide !== 'group');
  if (playoffMatches.length === 0) return [];

  const podium: PodiumEntry[] = [];
  const used = new Set<string>();

  const add = (placement: 1 | 2 | 3, userId: string | null | undefined) => {
    if (!userId || used.has(userId)) return;
    used.add(userId);
    podium.push({
      placement,
      userId,
      username: usernameFor(playoffMatches, userId),
    });
  };

  if (format === 'double_elimination') {
    const reset = playoffMatches.find((m) => m.bracketSide === 'reset' && m.status === 'complete');
    const grandFinal = playoffMatches.find(
      (m) => m.bracketSide === 'grand_final' && m.status === 'complete',
    );

    if (reset?.winnerId) {
      add(1, reset.winnerId);
      add(2, loserId(reset));
    } else if (grandFinal?.winnerId) {
      add(1, grandFinal.winnerId);
      add(2, loserId(grandFinal));
    } else if (grandFinalsModifier === 'skip') {
      const wbFinal = findBracketFinal(playoffMatches, 'winners');
      add(1, wbFinal?.winnerId);
      const lbFinal = findBracketFinal(playoffMatches, 'losers');
      add(2, lbFinal?.winnerId);
    }

    const lbChampId =
      grandFinal?.player2Id ??
      (grandFinalsModifier === 'skip' ? findBracketFinal(playoffMatches, 'losers')?.winnerId : null);
    if (lbChampId) {
      const lbFinalMatch = playoffMatches
        .filter(
          (m) =>
            m.bracketSide === 'losers' &&
            m.status === 'complete' &&
            m.winnerId === lbChampId &&
            (m.player1Id === lbChampId || m.player2Id === lbChampId),
        )
        .sort((a, b) => b.round - a.round || b.matchIndex - a.matchIndex)[0];
      if (lbFinalMatch) add(3, loserId(lbFinalMatch));
    }
  } else if (format === 'single_elimination') {
    const sideMatches = playoffMatches.filter(
      (m) => m.bracketSide !== 'third_place' && m.status === 'complete' && m.winnerId,
    );
    if (sideMatches.length === 0) return [];
    const maxRound = Math.max(...sideMatches.map((m) => m.round));
    const finalMatch = sideMatches.find((m) => m.round === maxRound && m.matchIndex === 0);
    if (finalMatch?.winnerId) {
      add(1, finalMatch.winnerId);
      add(2, loserId(finalMatch));
    }
    const thirdPlace = playoffMatches.find(
      (m) => m.bracketSide === 'third_place' && m.status === 'complete',
    );
    if (thirdPlace?.winnerId) {
      add(3, thirdPlace.winnerId);
    }
  }

  return podium.sort((a, b) => a.placement - b.placement);
}

export function statusBadgeClass(status: BracketStatus): string {
  switch (status) {
    case 'Champion':
      return 'border-amber-500/40 bg-amber-500/15 text-amber-200';
    case 'Runner-up':
      return 'border-sky-500/40 bg-sky-500/15 text-sky-200';
    case '3rd place':
      return 'border-orange-500/40 bg-orange-500/15 text-orange-200';
    case '4th place':
      return 'border-slate-500/40 bg-slate-500/15 text-slate-300';
    case 'Grand Final':
      return 'border-brand-500/40 bg-brand-500/15 text-brand-200';
    case 'Active':
      return 'border-emerald-500/40 bg-emerald-500/15 text-emerald-200';
    case 'Winners Bracket':
      return 'border-emerald-500/40 bg-emerald-500/15 text-emerald-200';
    case 'Losers Bracket':
      return 'border-orange-500/40 bg-orange-500/15 text-orange-200';
    case 'Eliminated':
      return 'border-slate-600 bg-slate-800/80 text-slate-400';
    default:
      return 'border-slate-600 bg-slate-800/80 text-slate-400';
  }
}
