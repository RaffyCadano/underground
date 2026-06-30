import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { generateRoundRobinBracket } from '../lib/bracket';

const prisma = new PrismaClient();

const TOURNAMENT_ID = 'rr3v3demo';

const PLAYER_NAMES = [
  'StormBlader',
  'BladeKnight',
  'SpinFury',
  'TurboKing',
  'HyperStrike',
  'NeoDash',
] as const;

const DESCRIPTION = `## Casual 3v3 round robin showcase

**Unranked** — casual local event; **no rank point changes** on UGNCBBX.

### Format
- **Beyblade X 3v3** — each blader brings a deck of **3 Beyblades** per match (deck-style 3v3).
- **Single stage** — one pool; everyone plays in the same round robin.
- **Round robin** — every player faces every other player once.
- **Standings** rank by **match wins** (total matches won in the pool).

### Schedule
- Check-in: 10:00 AM
- First spin: 10:30 AM
- Location: Charlotte, NC

Bring three ready Beyblades per match. House rules: Xtreme stadium, 4-point finish per Beyblade game within the 3v3 set.`;

async function main() {
  const hash = await bcrypt.hash('demo1234', 12);

  await prisma.match.deleteMany({ where: { tournamentId: TOURNAMENT_ID } });
  await prisma.tournamentParticipant.deleteMany({ where: { tournamentId: TOURNAMENT_ID } });
  await prisma.tournamentDiscussionPost.deleteMany({ where: { tournamentId: TOURNAMENT_ID } });
  await prisma.tournament.deleteMany({ where: { id: TOURNAMENT_ID } });

  const host =
    (await prisma.user.findFirst({
      where: { role: 'admin' },
      orderBy: { createdAt: 'asc' },
    })) ??
    (await prisma.user.upsert({
      where: { username: 'TheVandaminator' },
      update: {},
      create: {
        username: 'TheVandaminator',
        email: 'admin@ugncbbx.local',
        password: hash,
        role: 'admin',
      },
    }));

  const players = await Promise.all(
    PLAYER_NAMES.map((username, index) =>
      prisma.user.upsert({
        where: { username },
        update: {},
        create: {
          username,
          email: `${username.toLowerCase()}@demo.ugncbbx.local`,
          password: hash,
          role: 'player',
          rankPoints: 400 - index * 25,
          wins: 5 + index,
          losses: 3,
        },
      }),
    ),
  );

  const tournament = await prisma.tournament.create({
    data: {
      id: TOURNAMENT_ID,
      slug: TOURNAMENT_ID,
      name: 'NC 3v3 Casual Round Robin',
      description: DESCRIPTION,
      date: new Date('2026-07-12'),
      checkInTime: '10:00',
      eventStartTime: '10:30',
      location: 'Charlotte, NC',
      format: 'round_robin',
      status: 'open',
      groupStageEnabled: false,
      gameType: 'beyblade_x_3on3',
      isRanked: false,
      roundRobinRankBy: 'match_wins',
      playerCap: 8,
      entryFee: null,
      prizePool: 'Bragging rights & shop credit for 1st',
      createdById: host.id,
    },
  });

  for (let i = 0; i < players.length; i++) {
    await prisma.tournamentParticipant.create({
      data: {
        tournamentId: tournament.id,
        userId: players[i].id,
        seed: i + 1,
      },
    });
  }

  await generateRoundRobinBracket(
    tournament.id,
    players.map((player) => player.id),
  );

  const matches = await prisma.match.findMany({
    where: { tournamentId: tournament.id },
    orderBy: [{ round: 'asc' }, { matchIndex: 'asc' }],
  });

  const completedScores = ['3-1', '3-2', '3-0', '2-3', '3-1', '3-2', '3-0', '3-1', '2-3', '3-2'];
  for (let i = 0; i < Math.min(10, matches.length); i++) {
    const match = matches[i];
    if (!match.player1Id || !match.player2Id) continue;
    const player1Wins = i % 3 !== 2;
    await prisma.match.update({
      where: { id: match.id },
      data: {
        winnerId: player1Wins ? match.player1Id : match.player2Id,
        score: completedScores[i % completedScores.length],
        status: 'complete',
      },
    });
  }

  const roundsGenerated = Math.max(...matches.map((match) => match.round));

  await prisma.tournamentDiscussionPost.create({
    data: {
      tournamentId: tournament.id,
      userId: host.id,
      content:
        'Welcome! This is an **unranked** 3v3 round robin mock event. Bring 3 Beyblades — check the About section for format details. Reply here if you have questions.',
      isAnnouncement: true,
      isPinned: true,
    },
  });

  console.log(`Seeded 6-player 3v3 round robin mock tournament.`);
  console.log(`Visit: /tournaments/${TOURNAMENT_ID}`);
  console.log(`Status: ${Math.min(10, matches.length)} / ${matches.length} matches completed across ${roundsGenerated} rounds.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
