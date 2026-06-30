import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { generateRoundRobinRound } from '../lib/bracket';

const prisma = new PrismaClient();

const TOURNAMENT_ID = 'rr3v3tst';

const PLAYER_NAMES = [
  'FlashRider',
  'OrbitWolf',
  'ApexHawk',
  'NovaEdge',
  'CrimsonDash',
  'SonicStrike',
] as const;

const DESCRIPTION = `## 3v3 round robin test event

**Unranked** — casual or local play; **no rank point changes**.

### Format
- **Beyblade X 3v3** — deck-style; **3 Beyblades** per blader per match.
- **Single stage** — one pool, no groups.
- **Round robin** — play everyone in the pool once.
- **Standings** by **match wins**.

### Schedule
- Check-in: 2:00 PM
- Event start: 2:30 PM
- **Raleigh, NC**

Round 1 is complete in this test bracket — use **Generate Round 2** or **Regenerate Round 2** in Actions to continue.`;

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
          rankPoints: 320 - index * 20,
          wins: 4 + index,
          losses: 2,
        },
      }),
    ),
  );

  const tournament = await prisma.tournament.create({
    data: {
      id: TOURNAMENT_ID,
      slug: TOURNAMENT_ID,
      name: 'Raleigh 3v3 Round Robin Test',
      description: DESCRIPTION,
      date: new Date('2026-07-19'),
      checkInTime: '14:00',
      eventStartTime: '14:30',
      location: 'Raleigh, NC',
      format: 'round_robin',
      status: 'open',
      groupStageEnabled: false,
      gameType: 'beyblade_x_3on3',
      isRanked: false,
      roundRobinRankBy: 'match_wins',
      playerCap: 8,
      entryFee: null,
      prizePool: 'Shop credit for 1st',
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

  // Progressive round robin: round 1 only (matches UI "Generate Round 2" flow).
  await generateRoundRobinRound(tournament.id);

  const round1Matches = await prisma.match.findMany({
    where: { tournamentId: tournament.id, round: 1 },
    orderBy: { matchIndex: 'asc' },
  });

  const completedScores = ['3-2', '3-1', '3-0'];
  for (let i = 0; i < round1Matches.length; i++) {
    const match = round1Matches[i];
    if (!match.player1Id || !match.player2Id) continue;
    const player1Wins = i !== 1;
    await prisma.match.update({
      where: { id: match.id },
      data: {
        winnerId: player1Wins ? match.player1Id : match.player2Id,
        score: completedScores[i % completedScores.length],
        status: 'complete',
      },
    });
  }

  await prisma.tournament.update({
    where: { id: tournament.id },
    data: { status: 'active' },
  });

  await prisma.tournamentDiscussionPost.create({
    data: {
      tournamentId: tournament.id,
      userId: host.id,
      content:
        '**Round 1 is done** on this test bracket. Admins can generate or regenerate Round 2 from Actions. Unranked 3v3 — bring three Beyblades.',
      isAnnouncement: true,
      isPinned: true,
    },
  });

  console.log('Seeded Raleigh 3v3 round robin test tournament.');
  console.log(`Visit: /tournaments/${TOURNAMENT_ID}`);
  console.log(`Round 1 complete (${round1Matches.length} matches). Ready for Round 2.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
