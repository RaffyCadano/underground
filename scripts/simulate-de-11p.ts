import { buildDoubleElimStructure } from '../lib/double-elim';

type Spec = ReturnType<typeof buildDoubleElimStructure>[number];

type SimMatch = Spec & {
  status: 'pending' | 'complete' | 'bye';
  winnerId: string | null;
};

function cloneSpecs(specs: Spec[]): SimMatch[] {
  return specs.map((m) => ({
    ...m,
    status:
      m.bracketSide === 'winners' &&
      m.round === 1 &&
      ((m.player1Id && !m.player2Id) || (!m.player1Id && m.player2Id))
        ? 'complete'
        : m.player1Id || m.player2Id
          ? 'pending'
          : 'pending',
    winnerId:
      m.bracketSide === 'winners' &&
      m.round === 1 &&
      ((m.player1Id && !m.player2Id) || (!m.player1Id && m.player2Id))
        ? (m.player1Id ?? m.player2Id)
        : null,
  }));
}

function byId(matches: SimMatch[]) {
  return new Map(matches.map((m) => [m.id, m]));
}

function placeInSlot(matches: SimMatch[], matchId: string, slot: 1 | 2, playerId: string) {
  const m = matches.find((x) => x.id === matchId);
  if (!m) return;
  if (slot === 1) m.player1Id = playerId;
  else m.player2Id = playerId;
}

function placeLoser(
  matches: SimMatch[],
  loserNextId: string,
  loserNextSlot: number,
  loserId: string,
) {
  const target = matches.find((m) => m.id === loserNextId);
  if (!target) return;
  const field = loserNextSlot === 1 ? 'player1Id' : 'player2Id';
  if (!target[field]) {
    placeInSlot(matches, loserNextId, loserNextSlot as 1 | 2, loserId);
  }
}

function advance(matches: SimMatch[], matchId: string, winnerId: string) {
  const match = matches.find((m) => m.id === matchId);
  if (!match) return;
  const loserId = match.player1Id === winnerId ? match.player2Id : match.player1Id;
  match.status = 'complete';
  match.winnerId = winnerId;

  if (match.winnerNextId && match.winnerNextSlot) {
    placeInSlot(matches, match.winnerNextId, match.winnerNextSlot as 1 | 2, winnerId);
  }
  if (match.loserNextId && match.loserNextSlot && loserId) {
    placeLoser(matches, match.loserNextId, match.loserNextSlot, loserId);
  }
}

function resolveSoloByes(matches: SimMatch[]) {
  for (let pass = 0; pass < 24; pass++) {
    let changed = false;

    for (const match of matches) {
      if (match.status === 'complete' || match.status === 'bye') continue;
      if (match.bracketSide === 'grand_final' || match.bracketSide === 'reset') continue;
      if (match.player1Id || match.player2Id) continue;

      const incoming = matches.filter(
        (m) => m.winnerNextId === match.id || m.loserNextId === match.id,
      );
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

      const pendingIncoming = matches.filter(
        (m) =>
          (m.winnerNextId === match.id || m.loserNextId === match.id) &&
          m.status !== 'complete' &&
          m.status !== 'bye',
      );
      if (pendingIncoming.length > 0) continue;

      const feeders = matches.filter(
        (m) =>
          (m.loserNextId === match.id && m.loserNextSlot === emptySlot) ||
          (m.winnerNextId === match.id && m.winnerNextSlot === emptySlot),
      );
      if (feeders.length === 0) {
        if (match.bracketSide !== 'winners') continue;
        match.status = 'complete';
        match.winnerId = soloId;
        advance(matches, match.id, soloId);
        changed = true;
        break;
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

function label(matches: SimMatch[], id: string | null) {
  if (!id) return 'TBD';
  const n = id.replace('p', 'P');
  return n;
}

function printLb(matches: SimMatch[], round: number) {
  const roundMatches = matches
    .filter((m) => m.bracketSide === 'losers' && m.round === round)
    .sort((a, b) => a.matchIndex - b.matchIndex);
  console.log(`  LB R${round}:`);
  for (const m of roundMatches) {
    console.log(
      `    M${m.matchIndex}: ${label(matches, m.player1Id)} vs ${label(matches, m.player2Id)} [${m.status}]`,
    );
  }
}

function playerInMultiplePending(matches: SimMatch[]) {
  const seen = new Map<string, string[]>();
  for (const m of matches) {
    if (m.status === 'complete' || m.status === 'bye') continue;
    for (const pid of [m.player1Id, m.player2Id]) {
      if (!pid) continue;
      const list = seen.get(pid) ?? [];
      list.push(`${m.bracketSide} R${m.round} M${m.matchIndex}`);
      seen.set(pid, list);
    }
  }
  return [...seen.entries()].filter(([, slots]) => slots.length > 1);
}

const ids = Array.from({ length: 11 }, (_, i) => `p${i + 1}`);
const specs = buildDoubleElimStructure(ids);
const matches = cloneSpecs(specs);

// Apply R1 byes
for (const m of matches.filter((x) => x.bracketSide === 'winners' && x.round === 1)) {
  if (m.winnerId) {
    advance(matches, m.id, m.winnerId);
    resolveSoloByes(matches);
  }
}

// Complete dual WB R1 (alternate winners)
const dualR1 = matches
  .filter((m) => m.bracketSide === 'winners' && m.round === 1 && m.player1Id && m.player2Id)
  .sort((a, b) => a.matchIndex - b.matchIndex);

for (const m of dualR1) {
  const winner = m.player1Id!;
  advance(matches, m.id, winner);
  resolveSoloByes(matches);
}

console.log('After WB R1:');
printLb(matches, 1);
printLb(matches, 2);

// Complete WB R2 - losers drop
const wbR2 = matches
  .filter((m) => m.bracketSide === 'winners' && m.round === 2)
  .sort((a, b) => a.matchIndex - b.matchIndex);

for (const m of wbR2) {
  if (!m.player1Id || !m.player2Id) continue;
  const winner = m.player1Id;
  advance(matches, m.id, winner);
  resolveSoloByes(matches);
}

console.log('\nAfter WB R2:');
printLb(matches, 1);
printLb(matches, 2);
printLb(matches, 3);

const dupes = playerInMultiplePending(matches);
if (dupes.length) {
  console.error('\nFAIL: players in multiple pending matches:', dupes);
  process.exit(1);
}

const orphanSolos = matches.filter(
  (m) =>
    m.bracketSide === 'losers' &&
    m.status === 'complete' &&
    m.winnerId &&
    !(m.player1Id && m.player2Id),
);
if (orphanSolos.length) {
  console.error('\nFAIL: solo LB matches auto-completed:', orphanSolos.map((m) => m.id));
  process.exit(1);
}

// Complete LB R1 (skip unused opener slots marked bye)
const lbR1 = matches.filter(
  (m) => m.bracketSide === 'losers' && m.round === 1 && m.status !== 'bye',
);
for (const m of lbR1) {
  if (!m.player1Id || !m.player2Id) continue;
  advance(matches, m.id, m.player1Id);
  resolveSoloByes(matches);
}

console.log('\nAfter LB R1:');
printLb(matches, 2);
printLb(matches, 3);

const dupes2 = playerInMultiplePending(matches);
if (dupes2.length) {
  console.error('\nFAIL after LB R1:', dupes2);
  process.exit(1);
}

const soloCompleted = matches.filter(
  (m) =>
    m.bracketSide === 'losers' &&
    m.status === 'complete' &&
    !(m.player1Id && m.player2Id),
);
if (soloCompleted.length) {
  console.error('\nFAIL solo completed LB:', soloCompleted);
  process.exit(1);
}

console.log('\nOK after LB R1');
