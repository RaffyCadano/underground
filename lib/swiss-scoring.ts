export type SwissScoring = {
  pointsPerMatchWin: number;
  pointsPerMatchTie: number;
  pointsPerGameWin: number;
  pointsPerGameTie: number;
  pointsPerBye: number;
};

export type SwissScoringFormFields = {
  swissPointsPerMatchWin: string;
  swissPointsPerMatchTie: string;
  swissPointsPerGameWin: string;
  swissPointsPerGameTie: string;
  swissPointsPerBye: string;
};

export const DEFAULT_SWISS_SCORING: SwissScoring = {
  pointsPerMatchWin: 1,
  pointsPerMatchTie: 0.5,
  pointsPerGameWin: 0,
  pointsPerGameTie: 0,
  pointsPerBye: 1,
};

export const DEFAULT_SWISS_SCORING_FORM: SwissScoringFormFields = {
  swissPointsPerMatchWin: '1',
  swissPointsPerMatchTie: '0.5',
  swissPointsPerGameWin: '0',
  swissPointsPerGameTie: '0',
  swissPointsPerBye: '1',
};

const SWISS_FORM_KEYS: (keyof SwissScoringFormFields)[] = [
  'swissPointsPerMatchWin',
  'swissPointsPerMatchTie',
  'swissPointsPerGameWin',
  'swissPointsPerGameTie',
  'swissPointsPerBye',
];

const SCORING_TO_FORM: Record<keyof SwissScoring, keyof SwissScoringFormFields> = {
  pointsPerMatchWin: 'swissPointsPerMatchWin',
  pointsPerMatchTie: 'swissPointsPerMatchTie',
  pointsPerGameWin: 'swissPointsPerGameWin',
  pointsPerGameTie: 'swissPointsPerGameTie',
  pointsPerBye: 'swissPointsPerBye',
};

export function formatSwissPoint(value: number): string {
  if (Number.isInteger(value)) return String(value);
  return String(value);
}

export function swissScoringToFormFields(scoring: SwissScoring = DEFAULT_SWISS_SCORING): SwissScoringFormFields {
  return {
    swissPointsPerMatchWin: formatSwissPoint(scoring.pointsPerMatchWin),
    swissPointsPerMatchTie: formatSwissPoint(scoring.pointsPerMatchTie),
    swissPointsPerGameWin: formatSwissPoint(scoring.pointsPerGameWin),
    swissPointsPerGameTie: formatSwissPoint(scoring.pointsPerGameTie),
    swissPointsPerBye: formatSwissPoint(scoring.pointsPerBye),
  };
}

export function parseSwissPointInput(raw: FormDataEntryValue | null | undefined, fallback: number): number {
  const str = String(raw ?? '').trim();
  if (!str) return fallback;
  const n = parseFloat(str);
  if (!Number.isFinite(n) || n < 0) return fallback;
  return Math.round(n * 1000) / 1000;
}

export function parseSwissScoringFromForm(formData: FormData): SwissScoring {
  return {
    pointsPerMatchWin: parseSwissPointInput(
      formData.get('swissPointsPerMatchWin'),
      DEFAULT_SWISS_SCORING.pointsPerMatchWin,
    ),
    pointsPerMatchTie: parseSwissPointInput(
      formData.get('swissPointsPerMatchTie'),
      DEFAULT_SWISS_SCORING.pointsPerMatchTie,
    ),
    pointsPerGameWin: parseSwissPointInput(
      formData.get('swissPointsPerGameWin'),
      DEFAULT_SWISS_SCORING.pointsPerGameWin,
    ),
    pointsPerGameTie: parseSwissPointInput(
      formData.get('swissPointsPerGameTie'),
      DEFAULT_SWISS_SCORING.pointsPerGameTie,
    ),
    pointsPerBye: parseSwissPointInput(formData.get('swissPointsPerBye'), DEFAULT_SWISS_SCORING.pointsPerBye),
  };
}

export function parseSwissScoringFromFormFields(fields: SwissScoringFormFields): SwissScoring {
  const formData = new FormData();
  for (const key of SWISS_FORM_KEYS) {
    formData.set(key, fields[key]);
  }
  return parseSwissScoringFromForm(formData);
}

export function swissScoringToPrismaData(scoring: SwissScoring) {
  return {
    swissPointsPerMatchWin: scoring.pointsPerMatchWin,
    swissPointsPerMatchTie: scoring.pointsPerMatchTie,
    swissPointsPerGameWin: scoring.pointsPerGameWin,
    swissPointsPerGameTie: scoring.pointsPerGameTie,
    swissPointsPerBye: scoring.pointsPerBye,
  };
}

export function swissScoringFromTournament(tournament: {
  swissPointsPerMatchWin?: number | null;
  swissPointsPerMatchTie?: number | null;
  swissPointsPerGameWin?: number | null;
  swissPointsPerGameTie?: number | null;
  swissPointsPerBye?: number | null;
}): SwissScoring {
  return {
    pointsPerMatchWin: tournament.swissPointsPerMatchWin ?? DEFAULT_SWISS_SCORING.pointsPerMatchWin,
    pointsPerMatchTie: tournament.swissPointsPerMatchTie ?? DEFAULT_SWISS_SCORING.pointsPerMatchTie,
    pointsPerGameWin: tournament.swissPointsPerGameWin ?? DEFAULT_SWISS_SCORING.pointsPerGameWin,
    pointsPerGameTie: tournament.swissPointsPerGameTie ?? DEFAULT_SWISS_SCORING.pointsPerGameTie,
    pointsPerBye: tournament.swissPointsPerBye ?? DEFAULT_SWISS_SCORING.pointsPerBye,
  };
}

export type SwissMatchForScoring = {
  status: string;
  player1Id: string | null;
  player2Id: string | null;
  winnerId: string | null;
  score: string | null;
};

export type SwissPlayerStats = {
  points: number;
  wins: number;
  losses: number;
  ties: number;
  byes: number;
};

function parseSetScore(score: string | null): [number, number] | null {
  if (!score) return null;
  const parts = score.split(/[-:]/).map((p) => parseInt(p.trim(), 10));
  if (parts.length < 2 || parts.some((n) => !Number.isFinite(n) || n < 0)) return null;
  return [parts[0], parts[1]];
}

function isByeMatch(match: SwissMatchForScoring): boolean {
  if (match.status === 'bye') return true;
  const hasP1 = Boolean(match.player1Id);
  const hasP2 = Boolean(match.player2Id);
  return hasP1 !== hasP2;
}

function byePlayerId(match: SwissMatchForScoring): string | null {
  if (!isByeMatch(match)) return null;
  return match.player1Id ?? match.player2Id;
}

function isCompleteMatch(match: SwissMatchForScoring): boolean {
  return match.status === 'complete' || match.status === 'bye';
}

export function computeSwissPlayerStats(
  userId: string,
  matches: SwissMatchForScoring[],
  scoring: SwissScoring,
): SwissPlayerStats {
  const stats: SwissPlayerStats = { points: 0, wins: 0, losses: 0, ties: 0, byes: 0 };

  for (const match of matches) {
    if (!isCompleteMatch(match)) continue;

    const byeId = byePlayerId(match);
    if (byeId === userId) {
      stats.byes++;
      stats.points += scoring.pointsPerBye;
      continue;
    }

    if (match.player1Id !== userId && match.player2Id !== userId) continue;

    const sets = parseSetScore(match.score);
    const isTie =
      !match.winnerId ||
      (sets != null && sets[0] === sets[1] && scoring.pointsPerMatchTie > 0);

    if (isTie) {
      stats.ties++;
      stats.points += scoring.pointsPerMatchTie;
    } else if (match.winnerId === userId) {
      stats.wins++;
      stats.points += scoring.pointsPerMatchWin;
    } else if (match.winnerId) {
      stats.losses++;
    }

    if (sets && (scoring.pointsPerGameWin > 0 || scoring.pointsPerGameTie > 0)) {
      const mySets = match.player1Id === userId ? sets[0] : sets[1];
      const oppSets = match.player1Id === userId ? sets[1] : sets[0];
      if (sets[0] === sets[1]) {
        stats.points += mySets * scoring.pointsPerGameTie;
      } else {
        stats.points += mySets * scoring.pointsPerGameWin;
        if (scoring.pointsPerGameTie > 0) {
          stats.points += oppSets * scoring.pointsPerGameTie;
        }
      }
    }
  }

  return stats;
}

export function formatSwissScoringRule(scoring: SwissScoring): string {
  const parts = [`${formatSwissPoint(scoring.pointsPerMatchWin)} per match win`];
  if (scoring.pointsPerMatchTie > 0) {
    parts.push(`${formatSwissPoint(scoring.pointsPerMatchTie)} per match tie`);
  }
  if (scoring.pointsPerGameWin > 0) {
    parts.push(`${formatSwissPoint(scoring.pointsPerGameWin)} per game/set win`);
  }
  if (scoring.pointsPerGameTie > 0) {
    parts.push(`${formatSwissPoint(scoring.pointsPerGameTie)} per game/set tie`);
  }
  if (scoring.pointsPerBye > 0) {
    parts.push(`${formatSwissPoint(scoring.pointsPerBye)} per bye`);
  }
  return `Scoring: ${parts.join(', ')}.`;
}

export function updateSwissScoringField(
  fields: SwissScoringFormFields,
  key: keyof SwissScoringFormFields,
  value: string,
): SwissScoringFormFields {
  return { ...fields, [key]: value };
}

export function swissScoringFormFieldFor(
  scoringKey: keyof SwissScoring,
): keyof SwissScoringFormFields {
  return SCORING_TO_FORM[scoringKey];
}
