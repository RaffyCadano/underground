import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { advanceWinner, generateSingleEliminationBracket } from '../lib/bracket';

const prisma = new PrismaClient();

const TOURNAMENT_ID = 'single-elim-demo-10p';

const PLAYERS = [
  'Redu',
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

async function main() {
  const hash = await bcrypt.hash('demo1234', 12);

  const users = await Promise.all(
    PLAYERS.map((username, i) =>
      prisma.user.upsert({
        where: { username },
        update: {},
        create: {
          username,
          email: `${username.toLowerCase()}@demo.underground.local`,
          password: hash,
          role: i === 0 ? 'admin' : 'player',
          rankPoints: (PLAYERS.length - i) * 100,
          wins: 0,
          losses: 0,
        },
      }),
    ),
  );

  await prisma.match.deleteMany({ where: { tournamentId: TOURNAMENT_ID } });
  await prisma.tournamentParticipant.deleteMany({ where: { tournamentId: TOURNAMENT_ID } });
  await prisma.tournament.deleteMany({ where: { id: TOURNAMENT_ID } });

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
      createdById: users[0].id,
    },
  });

  for (let i = 0; i < users.length; i++) {
    await prisma.tournamentParticipant.create({
      data: {
        tournamentId: tournament.id,
        userId: users[i].id,
        seed: i + 1,
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
      },
    }),
    prisma.match.findFirst({
      where: { tournamentId: tournament.id, bracketSide: 'third_place' },
      include: {
        player1: { select: { username: true } },
        player2: { select: { username: true } },
      },
    }),
  ]);

  console.log('\nBracket ready:');
  console.log(`  Final:     ${finalMatch?.player1?.username ?? 'TBD'} vs ${finalMatch?.player2?.username ?? 'TBD'}`);
  console.log(
    `  3rd place: ${thirdPlace?.player1?.username ?? 'TBD'} vs ${thirdPlace?.player2?.username ?? 'TBD'}`,
  );
  console.log(`\nVisit: /tournaments/${TOURNAMENT_ID}`);
  console.log('Embed: /tournaments/single-elim-demo-10p/embed');
  console.log('Login as Redu / demo1234 to report scores as admin.\n');
}

main().catch(console.error).finally(() => prisma.$disconnect());
