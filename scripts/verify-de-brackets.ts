import { buildDoubleElimStructure } from '../lib/double-elim';
import { nextPowerOf2 } from '../lib/bracket-seeding';

function countLbR1PairMatches(
  specs: ReturnType<typeof buildDoubleElimStructure>,
  bracketSize: number,
): number {
  let count = 0;
  for (let i = 0; i < bracketSize / 2; i += 2) {
    const m0 = specs.find((m) => m.bracketSide === 'winners' && m.round === 1 && m.matchIndex === i);
    const m1 = specs.find(
      (m) => m.bracketSide === 'winners' && m.round === 1 && m.matchIndex === i + 1,
    );
    if (!m0 || !m1) continue;
    if (m0.player1Id && m0.player2Id && m1.player1Id && m1.player2Id) count++;
  }
  return count;
}

function verify(playerCount: number) {
  const ids = Array.from({ length: playerCount }, (_, i) => `p${i + 1}`);
  const specs = buildDoubleElimStructure(ids);
  const bracketSize = nextPowerOf2(playerCount);

  const wb1Dual = specs.filter(
    (m) => m.bracketSide === 'winners' && m.round === 1 && m.player1Id && m.player2Id,
  ).length;

  const lb = specs.filter((m) => m.bracketSide === 'losers');
  const lbRounds = [...new Set(lb.map((m) => m.round))].sort((a, b) => a - b);
  const counts = lbRounds.map((r) => lb.filter((m) => m.round === r).length);

  const lbR1PairMatches = countLbR1PairMatches(specs, bracketSize);
  const lbR1 = lb.filter((m) => m.round === 1);

  if (lbR1.length !== (lbR1PairMatches > 0 ? lbR1PairMatches : counts[0] ?? 0)) {
    throw new Error(
      `${playerCount}p: LB round 1 size mismatch — pair matches=${lbR1PairMatches}, got ${lbR1.length} (${counts.join(',')})`,
    );
  }

  const wbR1Dual = specs
    .filter((m) => m.bracketSide === 'winners' && m.round === 1 && m.player1Id && m.player2Id)
    .sort((a, b) => a.matchIndex - b.matchIndex);

  for (const wb of wbR1Dual) {
    if (!wb.loserNextId) {
      throw new Error(`${playerCount}p: WB R1 dual M${wb.matchIndex} has no loser route`);
    }
    const target = specs.find((m) => m.id === wb.loserNextId);
    if (!target || target.bracketSide !== 'losers') {
      throw new Error(
        `${playerCount}p: WB R1 M${wb.matchIndex} loser target invalid: ${target?.bracketSide}`,
      );
    }
  }

  const wbR2 = specs.filter((m) => m.bracketSide === 'winners' && m.round === 2);
  const collisions = new Map<string, number>();
  for (const m of wbR2) {
    if (!m.loserNextId) continue;
    const key = `${m.loserNextId}:${m.loserNextSlot}`;
    collisions.set(key, (collisions.get(key) ?? 0) + 1);
  }
  const dupes = [...collisions.entries()].filter(([, n]) => n > 1);
  if (dupes.length) {
    throw new Error(`${playerCount}p: duplicate WB R2 loser targets ${JSON.stringify(dupes)}`);
  }

  for (const m of lb) {
    const fed = specs.some((s) => s.winnerNextId === m.id || s.loserNextId === m.id);
    if (!fed) {
      // Odd solo-drop counts leave an unused opener slot; resolveSoloByeMatches marks it bye.
      if (m.round === 1 && lbR1PairMatches === 0) continue;
      throw new Error(`${playerCount}p: unreachable LB R${m.round} M${m.matchIndex}`);
    }
  }

  console.log(
    `${playerCount}p OK — dual WBR1=${wb1Dual}, LB R1 pairs=${lbR1PairMatches}, LB rounds: ${counts.join(', ')}`,
  );
}

for (const n of [8, 11, 12, 16]) {
  verify(n);
}
