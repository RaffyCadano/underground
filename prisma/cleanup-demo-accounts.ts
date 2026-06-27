import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/** Removes legacy demo fixture accounts created by older seeds (@demo.underground.local). */
async function main() {
  const legacy = await prisma.user.findMany({
    where: { email: { endsWith: '@demo.underground.local' } },
    select: { id: true, username: true, email: true },
  });

  let removed = 0;
  let skipped = 0;

  for (const user of legacy) {
    const participations = await prisma.tournamentParticipant.count({ where: { userId: user.id } });
    if (participations > 0) {
      console.log(`Skip ${user.username} (${user.email}) — still in ${participations} tournament(s)`);
      skipped++;
      continue;
    }

    await prisma.user.delete({ where: { id: user.id } });
    console.log(`Removed ${user.username} (${user.email})`);
    removed++;
  }

  console.log(`\nDone: ${removed} removed, ${skipped} skipped.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
