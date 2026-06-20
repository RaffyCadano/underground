import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { rankedPlayerWhere } from '@/lib/rankings';

export async function PlayerDashboard({ userId }: { userId: string }) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      tournaments: {
        include: { tournament: { select: { id: true, name: true, date: true, status: true } } },
        orderBy: { createdAt: 'desc' },
      },
      matches1: {
        where: { status: 'pending', player2Id: { not: null } },
        include: {
          tournament: { select: { id: true, name: true } },
          player2: { select: { username: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      },
      matches2: {
        where: { status: 'pending', player1Id: { not: null } },
        include: {
          tournament: { select: { id: true, name: true } },
          player1: { select: { username: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      },
    },
  });

  if (!user) return null;

  const total = user.wins + user.losses;
  const winRate = total > 0 ? Math.round((user.wins / total) * 100) + '%' : '-';

  const upcomingTournaments = user.tournaments.filter(
    (tp) => tp.tournament.status === 'open' || tp.tournament.status === 'active',
  );

  const pendingMatches = [
    ...user.matches1.map((m) => ({
      id: m.id,
      tournamentId: m.tournament.id,
      tournamentName: m.tournament.name,
      opponent: m.player2?.username ?? '?',
    })),
    ...user.matches2.map((m) => ({
      id: m.id,
      tournamentId: m.tournament.id,
      tournamentName: m.tournament.name,
      opponent: m.player1?.username ?? '?',
    })),
  ];

  const rank = await prisma.user.count({
    where: { ...rankedPlayerWhere, rankPoints: { gt: user.rankPoints } },
  });

  return (
    <section className="container">
      <div className="mb-8">
        <span className="badge">Dashboard</span>
        <h1 className="mt-3 text-4xl font-semibold text-white">My arena</h1>
        <p className="mt-2 text-slate-300">Welcome back, {user.username}.</p>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="card p-6">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Ranking points</p>
          <p className="mt-3 text-3xl font-semibold text-white tabular-nums">{user.rankPoints.toLocaleString()}</p>
          <p className="mt-2 text-sm text-slate-400">Ranked #{rank + 1} globally</p>
        </div>
        <div className="card p-6">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Record</p>
          <p className="mt-3 text-3xl font-semibold text-white tabular-nums">{user.wins}-{user.losses}</p>
          <p className="mt-2 text-sm text-slate-400">{winRate} win rate</p>
        </div>
        <div className="card p-6">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Tournaments</p>
          <p className="mt-3 text-3xl font-semibold text-white tabular-nums">{user.tournaments.length}</p>
          <p className="mt-2 text-sm text-slate-400">{upcomingTournaments.length} upcoming / active</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <h2 className="mb-4 text-lg font-semibold text-white">Pending matches</h2>
          {pendingMatches.length === 0 ? (
            <p className="text-slate-400">No pending matches.</p>
          ) : (
            <div className="space-y-3">
              {pendingMatches.map((m) => (
                <Link
                  key={m.id}
                  href={`/tournaments/${m.tournamentId}`}
                  className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 transition hover:border-brand-500/40"
                >
                  <div>
                    <p className="text-sm font-semibold text-white">vs {m.opponent}</p>
                    <p className="text-xs text-slate-400">{m.tournamentName}</p>
                  </div>
                  <span className="text-xs font-semibold text-brand-300">Report</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="card p-6">
          <h2 className="mb-4 text-lg font-semibold text-white">Registered tournaments</h2>
          {user.tournaments.length === 0 ? (
            <div>
              <p className="text-slate-400">Not registered for any tournaments.</p>
              <Link href="/tournaments" className="mt-3 inline-block text-sm font-semibold text-brand-300 transition hover:text-brand-200">
                Browse tournaments
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {user.tournaments.map((tp) => (
                <Link
                  key={tp.id}
                  href={`/tournaments/${tp.tournament.id}`}
                  className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 transition hover:border-brand-500/40"
                >
                  <span className="text-sm font-semibold text-white">{tp.tournament.name}</span>
                  <span className="text-xs text-slate-400">
                    {tp.tournament.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
