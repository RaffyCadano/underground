import { buildDoubleElimStructure } from '../lib/double-elim';
import { nextPowerOf2 } from '../lib/bracket-seeding';

function countLbR1PairMatches(specs: ReturnType<typeof buildDoubleElimStructure>, bracketSize: number) {
  let count = 0;
  for (let i = 0; i < bracketSize / 2; i += 2) {
    const m0 = specs.find((m) => m.bracketSide === 'winners' && m.round === 1 && m.matchIndex === i);
    const m1 = specs.find((m) => m.bracketSide === 'winners' && m.round === 1 && m.matchIndex === i + 1);
    if (!m0 || !m1) continue;
    if (m0.player1Id && m0.player2Id && m1.player1Id && m1.player2Id) count++;
  }
  return count;
}

for (const n of [12]) {
  const specs = buildDoubleElimStructure(Array.from({ length: n }, (_, i) => `p${i + 1}`));
  const bracketSize = nextPowerOf2(n);
  console.log(`\n${n}p lbR1Pairs=${countLbR1PairMatches(specs, bracketSize)}`);
  for (const m of specs
    .filter((m) => m.bracketSide === 'winners' && m.round === 1 && m.player1Id && m.player2Id)
    .sort((a, b) => a.matchIndex - b.matchIndex)) {
    const t = specs.find((x) => x.id === m.loserNextId);
    console.log(`  WB R1 M${m.matchIndex} -> LB R${t?.round} M${t?.matchIndex} slot ${m.loserNextSlot}`);
  }
}
