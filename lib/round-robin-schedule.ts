const ROUND_ROBIN_BYE = '__BYE__';

/** Circle-method round robin: each player meets every other player exactly once across all rounds. */
export function buildRoundRobinSchedule(playerIds: string[]): [string, string][][] {
  if (playerIds.length < 2) return [];

  const order = [...playerIds];
  if (order.length % 2 === 1) {
    order.push(ROUND_ROBIN_BYE);
  }

  const n = order.length;
  const rounds: [string, string][][] = [];

  for (let round = 0; round < n - 1; round++) {
    const pairs: [string, string][] = [];
    for (let i = 0; i < n / 2; i++) {
      const a = order[i];
      const b = order[n - 1 - i];
      if (a !== ROUND_ROBIN_BYE && b !== ROUND_ROBIN_BYE) {
        pairs.push([a, b]);
      }
    }
    rounds.push(pairs);

    const fixed = order[0];
    const last = order[n - 1];
    const middle = order.slice(1, n - 1);
    order.splice(0, order.length, fixed, last, ...middle);
  }

  return rounds;
}

export function roundRobinRoundCount(playerCount: number): number {
  if (playerCount < 2) return 0;
  return playerCount % 2 === 0 ? playerCount - 1 : playerCount;
}

export function roundRobinTotalPairings(playerCount: number): number {
  if (playerCount < 2) return 0;
  return (playerCount * (playerCount - 1)) / 2;
}

function pairingKey(player1Id: string, player2Id: string): string {
  return player1Id < player2Id ? `${player1Id}:${player2Id}` : `${player2Id}:${player1Id}`;
}

export function roundRobinPairingKey(player1Id: string, player2Id: string): string {
  return pairingKey(player1Id, player2Id);
}

export type RoundRobinMatchProgress = {
  round: number;
  status: string;
  player1Id: string | null;
  player2Id: string | null;
};

export function computeRoundRobinProgress(
  playerIds: string[],
  matches: RoundRobinMatchProgress[],
) {
  const playerCount = playerIds.length;
  const totalRounds = roundRobinRoundCount(playerCount);
  const totalPairings = roundRobinTotalPairings(playerCount);
  const gamesPerPlayer = playerCount > 0 ? playerCount - 1 : 0;

  const completedPairingKeys = new Set<string>();
  let completedMatchCount = 0;
  let pendingMatchCount = 0;
  let roundsGenerated = 0;

  const gamesPlayed = new Map(playerIds.map((id) => [id, 0]));

  for (const match of matches) {
    roundsGenerated = Math.max(roundsGenerated, match.round);
    if (!match.player1Id || !match.player2Id) continue;

    if (match.status === 'complete') {
      completedMatchCount++;
      completedPairingKeys.add(pairingKey(match.player1Id, match.player2Id));
      gamesPlayed.set(match.player1Id, (gamesPlayed.get(match.player1Id) ?? 0) + 1);
      gamesPlayed.set(match.player2Id, (gamesPlayed.get(match.player2Id) ?? 0) + 1);
    } else {
      pendingMatchCount++;
    }
  }

  const gamesPlayedValues = [...gamesPlayed.values()];
  const minGamesPlayed = gamesPlayedValues.length > 0 ? Math.min(...gamesPlayedValues) : 0;
  const maxGamesPlayed = gamesPlayedValues.length > 0 ? Math.max(...gamesPlayedValues) : 0;

  const allPairingsComplete = completedPairingKeys.size >= totalPairings;
  const allRoundsGenerated = roundsGenerated >= totalRounds;

  return {
    totalRounds,
    totalPairings,
    completedPairings: completedPairingKeys.size,
    completedMatchCount,
    pendingMatchCount,
    roundsGenerated,
    gamesPerPlayer,
    minGamesPlayed,
    maxGamesPlayed,
    allPairingsComplete,
    allRoundsGenerated,
  };
}

export function pairingsForRoundRobinRound(
  playerIds: string[],
  roundNumber: number,
): [string, string][] {
  const schedule = buildRoundRobinSchedule(playerIds);
  const index = roundNumber - 1;
  if (index < 0 || index >= schedule.length) return [];
  return schedule[index] ?? [];
}
