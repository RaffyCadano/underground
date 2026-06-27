import { randomBytes } from 'crypto';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { advanceWinner, generateSingleEliminationBracket } from '../lib/bracket';
import { guestEmail, uniqueInternalWalkInUsername } from '../lib/guest-player';

const prisma = new PrismaClient();

const TOURNAMENT_ID = 'single-elim-demo-10p';
const HOST_NAME = 'Redu';

const WALK_IN_PLAYERS = [
  'TokenG',
  'Jubert',
  'vandam',
  'WillCT',
  'ubey',
  'YellowMamba',
  'NoLimit',
  'Spun',
  'Uba',
] as const;

async function completePendingRound(tournamentId: string, round: number) {
  const matches = await prisma.match.findMany({
    where: {
      tournamentId,
      round,
      status: 'pending',
      bracketSide: { not: 'third_place' },
    },
    orderBy: { matchIndex: 'asc' },
  });

  for (const match of matches) {
    if (!match.player1Id || !match.player2Id) continue;
    const winnerId = match.player1Id;
    await prisma.match.update({
      where: { id: match.id },
      data: { winnerId, score: '3-1', status: 'complete' },
    });
    await advanceWinner(tournamentId, round, match.matchIndex, winnerId);
  }
}

async function createWalkInUser(passwordHash: string) {
  const username = await uniqueInternalWalkInUsername(prisma);
  return prisma.user.create({
    data: {
      username,
      email: guestEmail(`${username}-${randomBytes(4).toString('hex')}`),
      password: passwordHash,
      role: 'guest',
    },
  });
}

async function removeLegacyDemoAccounts() {
  const legacy = await prisma.user.findMany({
    where: { email: { endsWith: '@demo.underground.local' } },
    select: { id: true },
  });

  for (const { id } of legacy) {
    const participations = await prisma.tournamentParticipant.count({ where: { userId: id } });
    if (participations > 0) continue;
    await prisma.user.delete({ where: { id } });
  }
}

async function main() {
  const hash = await bcrypt.hash('demo1234', 12);

  await prisma.match.deleteMany({ where: { tournamentId: TOURNAMENT_ID } });
  await prisma.tournamentParticipant.deleteMany({ where: { tournamentId: TOURNAMENT_ID } });
  await prisma.tournament.deleteMany({ where: { id: TOURNAMENT_ID } });
  await removeLegacyDemoAccounts();

  const host = await prisma.user.upsert({
    where: { username: HOST_NAME },
    update: {},
    create: {
      username: HOST_NAME,
      email: 'redu@demo.underground.local',
      password: hash,
      role: 'admin',
      rankPoints: 0,
      wins: 0,
      losses: 0,
    },
  });

  const walkInUsers = await Promise.all(
    WALK_IN_PLAYERS.map(async (displayName) => ({
      displayName,
      user: await createWalkInUser(hash),
    })),
  );

  const tournament = await prisma.tournament.create({
    data: {
      id: TOURNAMENT_ID,
      slug: 'single-elim-demo-10p',
      name: 'Single Elim Demo — 10 Players (3rd Place)',
      date: new Date('2026-06-26'),
      location: 'Winston-Salem, NC',
      format: 'single_elimination',
      status: 'open',
      gameType: 'beyblade_x',
      isRanked: false,
      entryFee: '$10',
      prizePool: 'Booster box for 1st, TT for 2nd, prize for 3rd',
      checkInTime: '21:00',
      eventStartTime: '21:30',
      deBreakTiesPlacement: true,
      description:
        'Mock single elimination bracket with 10 players and a 3rd place match. Semifinals are complete — final and bronze match are ready to report.',
      createdById: host.id,
    },
  });

  await prisma.tournamentParticipant.create({
    data: { tournamentId: tournament.id, userId: host.id, seed: 1 },
  });

  for (let i = 0; i < walkInUsers.length; i++) {
    const { user, displayName } = walkInUsers[i];
    await prisma.tournamentParticipant.create({
      data: {
        tournamentId: tournament.id,
        userId: user.id,
        walkInName: displayName,
        seed: i + 2,
      },
    });
  }

  console.log('Generating 10-player single elimination bracket (3rd place enabled)...');
  await generateSingleEliminationBracket(tournament.id);

  console.log('Simulating results through semifinals...');
  await completePendingRound(tournament.id, 1);
  await completePendingRound(tournament.id, 2);
  await completePendingRound(tournament.id, 3);

  const [finalMatch, thirdPlace] = await Promise.all([
    prisma.match.findFirst({
      where: { tournamentId: tournament.id, bracketSide: { not: 'third_place' }, round: 4, matchIndex: 0 },
      include: {
        player1: { select: { username: true } },
        player2: { select: { username: true } },
        tournament: {
          select: {
            participants: {
              select: { userId: true, walkInName: true },
            },
          },
        },
      },
    }),
    prisma.match.findFirst({
      where: { tournamentId: tournament.id, bracketSide: 'third_place' },
      include: {
        player1: { select: { username: true } },
        player2: { select: { username: true } },
        tournament: {
          select: {
            participants: {
              select: { userId: true, walkInName: true },
            },
          },
        },
      },
    }),
  ]);

  function label(
    match: typeof finalMatch,
    slot: 'player1' | 'player2',
  ): string {
    if (!match) return 'TBD';
    const userId = slot === 'player1' ? match.player1Id : match.player2Id;
    const participant = match.tournament.participants.find((p) => p.userId === userId);
    return participant?.walkInName ?? match[slot]?.username ?? 'TBD';
  }

  console.log('\nBracket ready:');
  console.log(`  Final:     ${label(finalMatch, 'player1')} vs ${label(finalMatch, 'player2')}`);
  console.log(`  3rd place: ${label(thirdPlace, 'player1')} vs ${label(thirdPlace, 'player2')}`);
  console.log(`\nVisit: /tournaments/${TOURNAMENT_ID}`);
  console.log('Embed: /tournaments/single-elim-demo-10p/embed');
  console.log('Login as Redu / demo1234 to report scores as admin.');
  console.log('Walk-in demo players are tournament-only (guest role) and do not appear in account management.\n');
}

main().catch(console.error).finally(() => prisma.$disconnect());
