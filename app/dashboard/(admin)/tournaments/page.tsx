import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { DeleteTournamentButton } from '@/app/tournaments/delete-tournament-button';

const FORMAT_LABELS: Record<string, string> = {
  single_elimination: 'Single Elimination',
  double_elimination: 'Double Elimination',
  swiss: 'Swiss Format',
  round_robin: 'Round Robin',
};

const STATUS_LABELS: Record<string, string> = {
  open: 'Open',
  active: 'In Progress',
  complete: 'Complete',
};

export default async function DashboardTournamentsPage() {
  const tournaments = await prisma.tournament.findMany({
    orderBy: { date: 'desc' },
    include: { _count: { select: { participants: true, matches: true } } },
  });

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Tournament management</h2>
          <p className="mt-1 text-sm text-slate-400">Create, manage, and delete tournaments.</p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <Link href="/tournaments" className="text-sm font-semibold text-brand-300 hover:text-brand-200">
            View public page
          </Link>
          <Link href="/dashboard/tournaments/create" className="btn-primary">
            Create tournament
          </Link>
        </div>
      </div>

      <div className="space-y-3">
        {tournaments.length === 0 ? (
          <div className="card-muted p-8 text-center text-slate-400">
            No tournaments yet.{' '}
            <Link href="/dashboard/tournaments/create" className="font-semibold text-brand-300 hover:text-brand-200">
              Create one
            </Link>{' '}
            to get started.
          </div>
        ) : (
          tournaments.map((t) => (
              <div
                key={t.id}
                className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-950 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="font-semibold text-white">{t.name}</p>
                  <p className="mt-1 text-xs text-slate-400">
                    {t.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    {' · '}
                    {FORMAT_LABELS[t.format] ?? t.format}
                    {' · '}
                    {t._count.participants} players · {t._count.matches} matches
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wider ${
                      t.status === 'open'
                        ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                        : t.status === 'active'
                        ? 'border-brand-500/40 bg-brand-500/10 text-brand-300'
                        : 'border-slate-700 bg-slate-800/60 text-slate-400'
                    }`}
                  >
                    {STATUS_LABELS[t.status] ?? t.status}
                  </span>
                  <Link href={`/tournaments/${t.id}`} className="btn-secondary">
                    Manage
                  </Link>
                  <DeleteTournamentButton tournamentId={t.id} tournamentName={t.name} />
                </div>
              </div>
            ))
        )}
      </div>
    </div>
  );
}
