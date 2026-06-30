import { buildDoubleElimStructure } from '../lib/double-elim';

const specs = buildDoubleElimStructure(Array.from({ length: 11 }, (_, i) => `p${i + 1}`));
for (const m of specs.filter((x) => x.bracketSide === 'losers' && x.round === 2)) {
  const fed = specs.some((s) => s.winnerNextId === m.id || s.loserNextId === m.id);
  console.log(`R2 M${m.matchIndex}: fed=${fed}`, fed ? '' : '(orphan)');
}
