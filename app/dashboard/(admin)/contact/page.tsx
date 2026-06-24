import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
  PendingContactInboxTable,
  ResolvedContactInboxTable,
} from '@/app/dashboard/contact-inbox-tables';

export const dynamic = 'force-dynamic';

function serializeContactRows<
  T extends { createdAt: Date; resolvedAt: Date | null },
>(rows: T[]) {
  return rows.map((row) => ({
    ...row,
    createdAt: row.createdAt.toISOString(),
    resolvedAt: row.resolvedAt?.toISOString() ?? null,
  }));
}

export default async function DashboardContactPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') redirect('/dashboard');

  const [pending, resolved] = await Promise.all([
    prisma.contactMessage.findMany({
      where: { status: 'pending' },
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, username: true, email: true } },
      },
    }),
    prisma.contactMessage.findMany({
      where: { status: 'resolved' },
      orderBy: { resolvedAt: 'desc' },
      take: 20,
      include: {
        user: { select: { id: true, username: true, email: true } },
      },
    }),
  ]);

  const pendingRows = serializeContactRows(pending);
  const resolvedRows = serializeContactRows(resolved);

  return (
    <div className="min-w-0">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Contact inbox</h2>
          <p className="mt-1 text-sm text-slate-400">
            Contact form submissions and in-app message reports.
          </p>
        </div>
        <Link href="/contact" className="text-sm font-semibold text-brand-300 hover:text-brand-200">
          View public page
        </Link>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3">
          <p className="text-xs uppercase tracking-wider text-amber-200/80">Pending</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-white">{pending.length}</p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-950 px-4 py-3">
          <p className="text-xs uppercase tracking-wider text-slate-500">Recently resolved</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-white">{resolved.length}</p>
        </div>
      </div>

      <div className="mb-10">
        <h3 className="mb-4 text-sm font-semibold text-white">Pending messages</h3>
        <PendingContactInboxTable entries={pendingRows} />
      </div>

      {resolved.length > 0 && (
        <div>
          <h3 className="mb-4 text-sm font-semibold text-white">Recently resolved</h3>
          <ResolvedContactInboxTable entries={resolvedRows} />
        </div>
      )}
    </div>
  );
}
