import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const FIRST = [
  'Storm',
  'Blade',
  'Spin',
  'Turbo',
  'Hyper',
  'Neo',
  'Volt',
  'Burst',
  'Phantom',
  'Nova',
  'Cosmic',
  'Iron',
  'Shadow',
  'Azure',
  'Crimson',
  'Sonic',
  'Apex',
  'Orbit',
  'Zenith',
  'Flash',
];

const LAST = [
  'Blader',
  'Knight',
  'Fury',
  'King',
  'Strike',
  'Dash',
  'Edge',
  'Wolf',
  'Hawk',
  'Rider',
];

function buildUsernames(count: number): string[] {
  const names: string[] = [];
  for (const first of FIRST) {
    for (const last of LAST) {
      names.push(`${first}${last}`);
      if (names.length >= count) return names;
    }
  }
  return names;
}

function statsForRank(rankIndex: number) {
  const rankPoints = Math.max(25, 1480 - rankIndex * 14 + Math.floor(Math.random() * 30));
  const totalMatches = 8 + Math.floor(Math.random() * 35);
  const winRate = Math.min(0.85, Math.max(0.25, 0.82 - rankIndex * 0.005 + (Math.random() - 0.5) * 0.08));
  const wins = Math.min(totalMatches - 1, Math.max(0, Math.round(totalMatches * winRate)));
  const losses = totalMatches - wins;
  const daysAgo = Math.floor(Math.random() * 180);
  const createdAt = new Date();
  createdAt.setDate(createdAt.getDate() - daysAgo);

  return { rankPoints, wins, losses, createdAt };
}

async function main() {
  const usernames = buildUsernames(100);
  const hash = await bcrypt.hash('demo1234', 12);

  let created = 0;
  let updated = 0;

  for (let i = 0; i < usernames.length; i++) {
    const username = usernames[i];
    const email = `${username.toLowerCase()}@mock.underground`;
    const { rankPoints, wins, losses, createdAt } = statsForRank(i);

    const existing = await prisma.user.findUnique({ where: { username } });
    await prisma.user.upsert({
      where: { username },
      update: {
        rankPoints,
        wins,
        losses,
        role: 'player',
      },
      create: {
        username,
        email,
        password: hash,
        role: 'player',
        rankPoints,
        wins,
        losses,
        createdAt,
      },
    });

    if (existing) updated++;
    else created++;
  }

  const total = await prisma.user.count({ where: { role: 'player' } });
  console.log(`Mock players seeded: ${created} created, ${updated} updated (${usernames.length} total in batch).`);
  console.log(`Players on roster: ${total}. Default password: demo1234`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
