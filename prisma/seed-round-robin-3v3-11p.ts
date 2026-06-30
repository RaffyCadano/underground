import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { generateRoundRobinBracket } from '../lib/bracket';

const prisma = new PrismaClient();

const TOURNAMENT_ID = 'rr3v311p';

const PLAYER_NAMES = [
  'DragonBlader',
  'StormKnight',
  'PhoenixRise',
  'IceBreaker',
  'ThunderBolt',
  'ShadowSpin',
  'BlazeFury',
  'VortexKing',
  'IronHawk',
  'ZenithDash',
  'CosmicEdge',
] as const;

const DESCRIPTION = `## 11-player 3v3 round robin test

**Unranked** — casual local event; **no rank point changes**.

### Format
- **Beyblade X 3v3** — **3 Beyblades** per blader (deck-style).
- **Single stage** — one pool of **11 players**.
- **Round robin** — everyone plays everyone once (55 total matches).
- **Standings** rank by **match wins**.

### Schedule
- Check-in: 11:00 AM
- Event start: 11:30 AM
- **Durham, NC**

Odd player count — one bye per round in the schedule. Round 1 results are seeded; remaining rounds are open.`;

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
          rankPoints: 500 - index * 15,
          wins: 6 + (index % 4),
          losses: 3 + (index % 3),
        },
      }),
    ),
  );

  const tournament = await prisma.tournament.create({
    data: {
      id: TOURNAMENT_ID,
      slug: TOURNAMENT_ID,
      name: 'Durham 3v3 Round Robin — 11 Players',
      description: DESCRIPTION,
      date: new Date('2026-07-26'),
      checkInTime: '11:00',
      eventStartTime: '11:30',
      location: 'Durham, NC',
      format: 'round_robin',
      status: 'open',
      groupStageEnabled: false,
      gameType: 'beyblade_x_3on3',
      isRanked: false,
      roundRobinRankBy: 'match_wins',
      playerCap: 16,
      entryFee: null,
      prizePool: 'Prize support for top 3',
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

  const round1Matches = await prisma.match.findMany({
    where: { tournamentId: tournament.id, round: 1 },
    orderBy: { matchIndex: 'asc' },
  });

  const completedScores = ['3-1', '3-2', '3-0', '2-3', '3-1'];
  for (let i = 0; i < round1Matches.length; i++) {
    const match = round1Matches[i];
    if (!match.player1Id || !match.player2Id) continue;
    const player1Wins = i % 2 === 0;
    await prisma.match.update({
      where: { id: match.id },
      data: {
        winnerId: player1Wins ? match.player1Id : match.player2Id,
        score: completedScores[i % completedScores.length],
        status: 'complete',
      },
    });
  }

  const totalMatches = await prisma.match.count({ where: { tournamentId: tournament.id } });

  await prisma.tournamentDiscussionPost.create({
    data: {
      tournamentId: tournament.id,
      userId: host.id,
      content:
        '**11-player** unranked 3v3 round robin test. One bye each round — check the bracket schedule. Round 1 is complete.',
      isAnnouncement: true,
      isPinned: true,
    },
  });

  console.log('Seeded 11-player 3v3 round robin test tournament.');
  console.log(`Visit: /tournaments/${TOURNAMENT_ID}`);
  console.log(
    `Players: ${players.length} · Matches: ${totalMatches} total · Round 1: ${round1Matches.length} (${round1Matches.filter((m) => m.player1Id && m.player2Id).length} played)`,
  );
}

main().catch(console.error).finally(() => prisma.$disconnect());
