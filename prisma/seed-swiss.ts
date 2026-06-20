import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { generateSwissRound } from '../lib/bracket';

const prisma = new PrismaClient();

async function main() {
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
          rankPoints: (players.length - i) * 120 + Math.floor(Math.random() * 50),
          wins: Math.floor(Math.random() * 10),
          losses: Math.floor(Math.random() * 5),
        },
      })
    )
  );

  // Clean up existing swiss demo
  await prisma.match.deleteMany({ where: { tournamentId: 'swiss-demo-8p' } });
  await prisma.tournamentParticipant.deleteMany({ where: { tournamentId: 'swiss-demo-8p' } });
  await prisma.tournament.deleteMany({ where: { id: 'swiss-demo-8p' } });

  const tournament = await prisma.tournament.create({
    data: {
      id: 'swiss-demo-8p',
      name: 'NC BBX Swiss Invitational',
      date: new Date('2026-06-20'),
      location: 'Durham, NC',
      format: 'swiss',
      status: 'open',
      description: '8-player Swiss format demo — players are re-paired each round by wins',
    },
  });

  for (const user of users) {
    await prisma.tournamentParticipant.create({
      data: { tournamentId: tournament.id, userId: user.id },
    });
  }

  console.log('Seeded 8 players in Swiss tournament. Generating Round 1...');
  await generateSwissRound(tournament.id);
  console.log('Done! Visit /tournaments/swiss-demo-8p');
}

main().catch(console.error).finally(() => prisma.$disconnect());
