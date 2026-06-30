import { buildDoubleElimStructure } from '../lib/double-elim';

for (const n of [8, 11]) {
  const specs = buildDoubleElimStructure(Array.from({ length: n }, (_, i) => `p${i + 1}`));
  const lb = specs.filter((m) => m.bracketSide === 'losers');
  const counts = [...new Set(lb.map((m) => m.round))]
    .sort((a, b) => a - b)
    .map((r) => lb.filter((m) => m.round === r).length);
  console.log(`\n${n}p LB: ${counts.join(',')}`);
  for (const wr of [2, 3]) {
    console.log(`  WB R${wr}:`);
    for (const m of specs.filter((x) => x.bracketSide === 'winners' && x.round === wr)) {
      const t = specs.find((x) => x.id === m.loserNextId);
      console.log(`    M${m.matchIndex} -> LB R${t?.round} M${t?.matchIndex} s${m.loserNextSlot}`);
    }
  }
}
