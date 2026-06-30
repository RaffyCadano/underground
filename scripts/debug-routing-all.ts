import { buildDoubleElimStructure } from '../lib/double-elim';

for (const n of [8, 11, 12]) {
  const specs = buildDoubleElimStructure(Array.from({ length: n }, (_, i) => `p${i + 1}`));
  const lb = specs.filter((m) => m.bracketSide === 'losers');
  const counts = [...new Set(lb.map((m) => m.round))]
    .sort((a, b) => a - b)
    .map((r) => lb.filter((m) => m.round === r).length);
  console.log(`\n${n}p LB rounds: ${counts.join(', ')}`);
  for (const wr of [2, 3]) {
    const routes = specs
      .filter((m) => m.bracketSide === 'winners' && m.round === wr)
      .sort((a, b) => a.matchIndex - b.matchIndex)
      .map((m) => {
        const t = specs.find((x) => x.id === m.loserNextId);
        return `M${m.matchIndex}->R${t?.round}M${t?.matchIndex}s${m.loserNextSlot}`;
      });
    console.log(`  WB R${wr}: ${routes.join(', ')}`);
    const keys = specs
      .filter((m) => m.bracketSide === 'winners' && m.round === wr && m.loserNextId)
      .map((m) => `${m.loserNextId}:${m.loserNextSlot}`);
    const dupes = keys.filter((k, i) => keys.indexOf(k) !== i);
    if (dupes.length) console.log(`  DUPE: ${dupes.join(', ')}`);
  }
}
