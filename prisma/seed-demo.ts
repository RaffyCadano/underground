import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { generateSingleElimination } from '../lib/bracket';

const prisma = new PrismaClient();

async function main() {
  // Create 8 demo players
  const players = [
    'DragonBlader', 'StormKnight', 'PhoenixRise', 'IceBreaker',
    'ThunderBolt', 'ShadowSpin', 'BlazeFury', 'VortexKing',
  ];

  const hash = await bcrypt.hash('demo1234', 12);

  const users = await Promise.all(
    players.map((username, i) =>
      prisma.user.upsert({
        where: { username },
        update: {},
        create: {
          username,
          email: `${username.toLowerCase()}@demo.com`,
          password: hash,
          role: i === 0 ? 'admin' : 'player',
          rankPoints: Math.floor(Math.random() * 400) + 100,
          wins: Math.floor(Math.random() * 10),
          losses: Math.floor(Math.random() * 5),
        },
      })
    )
  );

  // Create demo tournament
  const tournament = await prisma.tournament.upsert({
    where: { id: 'demo-tournament-8p' },
    update: { status: 'open' },
    create: {
      id: 'demo-tournament-8p',
      name: 'NC Beyblade X Spring Open',
      date: new Date('2026-06-15'),
      location: 'Raleigh, NC',
      format: 'single_elimination',
      status: 'open',
      description: '8-player single elimination bracket demo',
    },
  });

  // Add participants
  for (const user of users) {
    await prisma.tournamentParticipant.upsert({
      where: { tournamentId_userId: { tournamentId: tournament.id, userId: user.id } },
      update: {},
      create: { tournamentId: tournament.id, userId: user.id },
    });
  }

  console.log('Seeded 8 players and tournament. Generating bracket...');
  await generateSingleElimination(tournament.id);
  console.log('Done! Visit /tournaments/demo-tournament-8p');
}

main().catch(console.error).finally(() => prisma.$disconnect());
