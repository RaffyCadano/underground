import { buildDoubleElimStructure } from '../lib/double-elim';

const specs = buildDoubleElimStructure(Array.from({ length: 11 }, (_, i) => `p${i + 1}`));
const lb = specs.filter((m) => m.bracketSide === 'losers');
const rounds = [...new Set(lb.map((m) => m.round))].sort((a, b) => a - b);
for (const r of rounds) {
  const ms = lb.filter((m) => m.round === r).sort((a, b) => a.matchIndex - b.matchIndex);
  console.log(`LB R${r}:`, ms.map((m) => `${m.id} M${m.matchIndex}`).join(', '));
}
console.log('--- WB R2 loser routes ---');
for (const m of specs
  .filter((m) => m.bracketSide === 'winners' && m.round === 2)
  .sort((a, b) => a.matchIndex - b.matchIndex)) {
  const t = specs.find((x) => x.id === m.loserNextId);
  console.log(
    `WB R2 M${m.matchIndex} -> ${t?.bracketSide} R${t?.round} M${t?.matchIndex} slot ${m.loserNextSlot}`,
  );
}
