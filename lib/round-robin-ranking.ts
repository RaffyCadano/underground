import { parseRoundRobinRankBy, type RoundRobinRankBy } from '@/lib/tournament-options';

export type RoundRobinMatch = {
  status: string;
  player1Id: string | null;
  player2Id: string | null;
  winnerId: string | null;
  score: string | null;
};

export type RoundRobinPlayerStats = {
  wins: number;
  losses: number;
  gameWins: number;
  pointsScored: number;
  pointsAllowed: number;
  pointDifferential: number;
  rankValue: number;
};

function parseSetScore(score: string | null): [number, number] | null {
  if (!score) return null;
  const parts = score.split(/[-:]/).map((p) => parseInt(p.trim(), 10));
  if (parts.length < 2 || parts.some((n) => !Number.isFinite(n) || n < 0)) return null;
  return [parts[0], parts[1]];
}

export function computeRoundRobinPlayerStats(
  userId: string,
  matches: RoundRobinMatch[],
): Omit<RoundRobinPlayerStats, 'rankValue'> {
  const stats = {
    wins: 0,
    losses: 0,
    gameWins: 0,
    pointsScored: 0,
    pointsAllowed: 0,
    pointDifferential: 0,
  };

  for (const match of matches) {
    if (match.status !== 'complete' || !match.winnerId) continue;
    if (match.player1Id !== userId && match.player2Id !== userId) continue;

    const isPlayer1 = match.player1Id === userId;
    const won = match.winnerId === userId;
    if (won) stats.wins++;
    else stats.losses++;

    const sets = parseSetScore(match.score);
    if (!sets) continue;

    const myScore = isPlayer1 ? sets[0] : sets[1];
    const oppScore = isPlayer1 ? sets[1] : sets[0];
    stats.gameWins += myScore;
    stats.pointsScored += myScore;
    stats.pointsAllowed += oppScore;
  }

  stats.pointDifferential = stats.pointsScored - stats.pointsAllowed;
  return stats;
}

export function roundRobinRankValue(
  stats: Omit<RoundRobinPlayerStats, 'rankValue'>,
  rankBy: RoundRobinRankBy,
): number {
  switch (rankBy) {
    case 'game_wins':
      return stats.gameWins;
    case 'points_scored':
      return stats.pointsScored;
    case 'point_differential':
      return stats.pointDifferential;
    case 'match_wins':
    default:
      return stats.wins;
  }
}

export function compareRoundRobinStandings(
  a: Pick<RoundRobinPlayerStats, 'rankValue' | 'wins' | 'pointDifferential'> & { rankPoints: number },
  b: Pick<RoundRobinPlayerStats, 'rankValue' | 'wins' | 'pointDifferential'> & { rankPoints: number },
  rankBy: RoundRobinRankBy,
): number {
  return (
    b.rankValue - a.rankValue ||
    b.wins - a.wins ||
    b.pointDifferential - a.pointDifferential ||
    b.rankPoints - a.rankPoints
  );
}

export function resolveRoundRobinRankBy(value: string | null | undefined): RoundRobinRankBy {
  return parseRoundRobinRankBy(value);
}
