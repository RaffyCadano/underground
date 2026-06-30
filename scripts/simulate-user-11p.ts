import { buildDoubleElimStructure } from '../lib/double-elim';

type Spec = ReturnType<typeof buildDoubleElimStructure>[number];
type SimMatch = Spec & { status: 'pending' | 'complete' | 'bye'; winnerId: string | null };

function cloneSpecs(specs: Spec[]): SimMatch[] {
  return specs.map((m) => ({
    ...m,
    status:
      m.bracketSide === 'winners' &&
      m.round === 1 &&
      ((m.player1Id && !m.player2Id) || (!m.player1Id && m.player2Id))
        ? 'complete'
        : 'pending',
    winnerId:
      m.bracketSide === 'winners' &&
      m.round === 1 &&
      ((m.player1Id && !m.player2Id) || (!m.player1Id && m.player2Id))
        ? (m.player1Id ?? m.player2Id)
        : null,
  }));
}

function placeInSlot(matches: SimMatch[], matchId: string, slot: 1 | 2, playerId: string) {
  const m = matches.find((x) => x.id === matchId);
  if (!m) return false;
  const field = slot === 1 ? 'player1Id' : 'player2Id';
  if (m[field]) return false;
  if (slot === 1) m.player1Id = playerId;
  else m.player2Id = playerId;
  return true;
}

function placeLoser(matches: SimMatch[], loserNextId: string, loserNextSlot: number, loserId: string) {
  const target = matches.find((m) => m.id === loserNextId);
  if (!target) return false;
  const field = loserNextSlot === 1 ? 'player1Id' : 'player2Id';
  if (target[field]) return false;
  placeInSlot(matches, loserNextId, loserNextSlot as 1 | 2, loserId);
  return true;
}

function advance(matches: SimMatch[], matchId: string, winnerId: string) {
  const match = matches.find((m) => m.id === matchId)!;
  const loserId = match.player1Id === winnerId ? match.player2Id : match.player1Id;
  match.status = 'complete';
  match.winnerId = winnerId;
  if (match.winnerNextId && match.winnerNextSlot) {
    const ok = placeInSlot(matches, match.winnerNextId, match.winnerNextSlot as 1 | 2, winnerId);
    if (!ok) console.log('FAILED winner place', match.bracketSide, 'R' + match.round, 'M' + match.matchIndex, '->', winnerId);
  }
  if (match.loserNextId && match.loserNextSlot && loserId) {
    const ok = placeLoser(matches, match.loserNextId, match.loserNextSlot, loserId);
    if (!ok) console.log('FAILED loser place', match.bracketSide, 'R' + match.round, 'M' + match.matchIndex, loserId, '->', match.loserNextId, 'slot', match.loserNextSlot);
  }
}

function resolveSoloByes(matches: SimMatch[]) {
  for (let pass = 0; pass < 48; pass++) {
    let changed = false;
    for (const match of matches) {
      if (match.status === 'complete' || match.status === 'bye') continue;
      if (match.bracketSide === 'grand_final' || match.bracketSide === 'reset') continue;
      if (match.player1Id || match.player2Id) continue;
      const incoming = matches.filter((m) => m.winnerNextId === match.id || m.loserNextId === match.id);
      if (incoming.length === 0) {
        match.status = 'bye';
        changed = true;
        break;
      }
    }
    if (changed) continue;
    for (const match of matches) {
      if (match.status === 'complete' || match.status === 'bye') continue;
      if (match.bracketSide === 'grand_final' || match.bracketSide === 'reset') continue;
      const soloId = match.player1Id ?? match.player2Id;
      if (!soloId || (match.player1Id && match.player2Id)) continue;
      const emptySlot = match.player1Id ? 2 : 1;
      const pending = matches.filter(
        (m) =>
          (m.winnerNextId === match.id || m.loserNextId === match.id) &&
          m.status !== 'complete' &&
          m.status !== 'bye',
      );
      if (pending.length) continue;
      const feeders = matches.filter(
        (m) =>
          (m.loserNextId === match.id && m.loserNextSlot === emptySlot) ||
          (m.winnerNextId === match.id && m.winnerNextSlot === emptySlot),
      );
      if (feeders.length === 0) {
        if (match.bracketSide === 'losers') {
          const allIncoming = matches.filter(
            (m) => m.winnerNextId === match.id || m.loserNextId === match.id,
          );
          if (
            allIncoming.length > 0 &&
            allIncoming.every((m) => m.status === 'complete' || m.status === 'bye')
          ) {
            match.status = 'complete';
            match.winnerId = soloId;
            advance(matches, match.id, soloId);
            changed = true;
            break;
          }
        } else {
          match.status = 'complete';
          match.winnerId = soloId;
          advance(matches, match.id, soloId);
          changed = true;
          break;
        }
        continue;
      }
      if (!feeders.every((m) => m.status === 'complete' || m.status === 'bye')) continue;
      match.status = 'complete';
      match.winnerId = soloId;
      advance(matches, match.id, soloId);
      changed = true;
      break;
    }
    if (!changed) break;
  }
}

function printLb(matches: SimMatch[], round: number) {
  const ms = matches
    .filter((m) => m.bracketSide === 'losers' && m.round === round && m.status !== 'bye')
    .sort((a, b) => a.matchIndex - b.matchIndex);
  if (!ms.length) return;
  console.log(`  LB R${round}:`);
  for (const m of ms) {
    console.log(`    M${m.matchIndex}: ${m.player1Id ?? 'TBD'} vs ${m.player2Id ?? 'TBD'}`);
  }
}

const ids = Array.from({ length: 11 }, (_, i) => `p${i + 1}`);
const specs = buildDoubleElimStructure(ids);
const matches = cloneSpecs(specs);

for (const m of matches.filter((x) => x.bracketSide === 'winners' && x.round === 1 && x.winnerId)) {
  advance(matches, m.id, m.winnerId!);
  resolveSoloByes(matches);
}

const dualR1 = matches
  .filter((m) => m.bracketSide === 'winners' && m.round === 1 && m.player1Id && m.player2Id)
  .sort((a, b) => a.matchIndex - b.matchIndex);

for (const m of dualR1) {
  advance(matches, m.id, m.player1Id!);
  resolveSoloByes(matches);
}

console.log('After WB R1:');
printLb(matches, 1);
printLb(matches, 2);

const wbR2 = matches.filter((m) => m.bracketSide === 'winners' && m.round === 2).sort((a, b) => a.matchIndex - b.matchIndex);
for (const m of wbR2) {
  if (!m.player1Id || !m.player2Id) continue;
  advance(matches, m.id, m.player1Id);
  resolveSoloByes(matches);
}

console.log('\nAfter WB R2:');
printLb(matches, 1);
printLb(matches, 2);
printLb(matches, 3);

const lbR1 = matches.find((m) => m.bracketSide === 'losers' && m.round === 1 && m.player1Id && m.player2Id)!;
advance(matches, lbR1.id, lbR1.player1Id!);
resolveSoloByes(matches);

console.log('\nAfter LB R1:');
printLb(matches, 2);
printLb(matches, 3);

const lbR2 = matches
  .filter((m) => m.bracketSide === 'losers' && m.round === 2 && m.status !== 'bye')
  .sort((a, b) => a.matchIndex - b.matchIndex);
for (const m of lbR2) {
  if (!m.player1Id || !m.player2Id) continue;
  advance(matches, m.id, m.player1Id);
  resolveSoloByes(matches);
}

console.log('\nAfter LB R2:');
printLb(matches, 3);
printLb(matches, 4);

const wbR3 = matches.filter((m) => m.bracketSide === 'winners' && m.round === 3).sort((a, b) => a.matchIndex - b.matchIndex);
for (const m of wbR3) {
  if (!m.player1Id || !m.player2Id) continue;
  advance(matches, m.id, m.player1Id);
  resolveSoloByes(matches);
}

console.log('\nAfter WB R3:');
printLb(matches, 3);
printLb(matches, 4);

const lbR3 = matches
  .filter((m) => m.bracketSide === 'losers' && m.round === 3 && m.status !== 'bye')
  .sort((a, b) => a.matchIndex - b.matchIndex);
for (const m of lbR3) {
  if (!m.player1Id || !m.player2Id) continue;
  advance(matches, m.id, m.player1Id);
  resolveSoloByes(matches);
}

console.log('\nAfter LB R3:');
printLb(matches, 4);
printLb(matches, 5);

const solo = matches.filter(
  (m) =>
    m.bracketSide === 'losers' &&
    m.status === 'pending' &&
    (m.player1Id || m.player2Id) &&
    !(m.player1Id && m.player2Id),
);
console.log('\nSolo LB:', solo.map((m) => `R${m.round}M${m.matchIndex} ${m.player1Id ?? 'TBD'} vs ${m.player2Id ?? 'TBD'}`));
