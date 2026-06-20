import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const clubs = [
  {
    name: 'NC Bladers',
    slug: 'nc-bladers',
    tagline: "North Carolina's premier Beyblade X club circuit.",
    region: 'Statewide',
    captain: 'BladerKing',
    memberCount: 24,
    eventsCount: 6,
  },
  {
    name: 'Charlotte X Club',
    slug: 'charlotte-x-club',
    tagline: 'Weekly meetups and bracket nights in the Queen City.',
    region: 'Charlotte',
    captain: 'SpinMaster',
    memberCount: 12,
    eventsCount: 4,
  },
  {
    name: 'Raleigh X Arena',
    slug: 'raleigh-x-arena',
    tagline: 'Competitive training and local tournament hosting.',
    region: 'Raleigh',
    captain: 'ArenaAce',
    memberCount: 15,
    eventsCount: 5,
  },
];

const count = await prisma.communityClub.count();
if (count === 0) {
  await prisma.communityClub.createMany({ data: clubs });
  console.log(`Seeded ${clubs.length} community clubs.`);
} else {
  console.log(`Skipped seed — ${count} club(s) already exist.`);
}

await prisma.$disconnect();
