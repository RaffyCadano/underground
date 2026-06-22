type MatchWithScore = { score: string | null };

/** True when at least one match has a reported score (not auto-bye advancement). */
export function hasReportedMatchResults(matches: MatchWithScore[]): boolean {
  return matches.some((m) => m.score != null && m.score.trim() !== '');
}

/** Bracket exists but no games have been reported — safe to cancel and edit the roster. */
export function canResetBracketForRoster(matches: MatchWithScore[]): boolean {
  return matches.length > 0 && !hasReportedMatchResults(matches);
}
