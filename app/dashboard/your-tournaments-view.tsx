import Link from 'next/link';
import { MapPin, Trophy } from 'lucide-react';
import { YourTournamentsHero } from '@/app/components/your-tournaments-hero';
import { prisma } from '@/lib/prisma';

function tournamentStatusClass(status: string) {
  if (status === 'active') return 'border-brand-500/40 bg-brand-500/10 text-brand-300';
  if (status === 'open') return 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300';
  if (status === 'complete') return 'border-slate-700 bg-slate-800 text-slate-500';
  return 'border-slate-700 bg-slate-800 text-slate-400';
}

function formatShortDate(date: Date) {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export async function YourTournamentsView({ userId }: { userId: string; role?: string }) {
  const createHref = '/dashboard/tournaments/create';

  const hosted = await prisma.tournament.findMany({
    where: { createdById: userId },
    orderBy: { date: 'desc' },
    select: {
      id: true,
      name: true,
      date: true,
      status: true,
      location: true,
      _count: { select: { participants: true } },
    },
  });

  return (
    <div className="space-y-8">
      <YourTournamentsHero createHref={createHref} />

      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/60">
        <div className="flex items-center justify-between gap-4 border-b border-slate-800 px-5 py-4 sm:px-6">
          <div>
            <h2 className="text-base font-semibold text-white">Your tournaments</h2>
            <p className="mt-0.5 text-xs text-slate-500">
              {hosted.length === 0
                ? 'No hosted tournaments yet'
                : `${hosted.length} tournament${hosted.length === 1 ? '' : 's'} you created`}
            </p>
          </div>
          {hosted.length > 0 && (
            <Link
              href="/dashboard/tournaments"
              className="shrink-0 text-xs font-semibold text-brand-300 hover:text-brand-200"
            >
              Manage all
            </Link>
          )}
        </div>

        {hosted.length === 0 ? (
          <div className="px-5 py-12 text-center sm:px-6">
            <span className="mx-auto inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-500">
              <Trophy size={20} />
            </span>
            <p className="mt-3 text-sm font-semibold text-white">No tournaments yet</p>
            <p className="mx-auto mt-1 max-w-sm text-sm text-slate-400">
              Create your first tournament to manage brackets, participants, and scores.
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <Link href={createHref} className="btn-primary text-sm">
                Create a Tournament
              </Link>
              <Link href="/tournaments" className="btn-secondary text-sm">
                Browse tournaments
              </Link>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {hosted.map((t) => (
              <Link
                key={t.id}
                href={`/tournaments/${t.id}`}
                className="flex items-center justify-between gap-4 px-5 py-4 transition hover:bg-slate-900/80 sm:px-6"
              >
                <div className="min-w-0">
                  <p className="truncate font-semibold text-white">{t.name}</p>
                  <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                    <span>{formatShortDate(t.date)}</span>
                    <span>{t._count.participants} players</span>
                    {t.location && (
                      <span className="inline-flex items-center gap-1">
                        <MapPin size={11} />
                        {t.location}
                      </span>
                    )}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${tournamentStatusClass(t.status)}`}
                >
                  {t.status}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
