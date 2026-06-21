import Link from 'next/link';
import { ArrowRight, BarChart3, Crown, Medal, Swords } from 'lucide-react';

export type CircuitPlayer = {
  id: string;
  username: string;
  rankPoints: number;
  wins: number;
  losses: number;
};

export type CircuitMatch = {
  id: string;
  score: string | null;
  player1: { username: string } | null;
  player2: { username: string } | null;
  winner: { username: string } | null;
  tournament: { id: string; name: string };
};

function rankBadge(rank: number) {
  if (rank === 1) {
    return { className: 'border-amber-500/40 bg-amber-500/15 text-amber-300', icon: Crown };
  }
  if (rank === 2) {
    return { className: 'border-slate-400/30 bg-slate-400/10 text-slate-300', icon: Medal };
  }
  if (rank === 3) {
    return { className: 'border-orange-700/40 bg-orange-900/20 text-orange-400', icon: Medal };
  }
  return { className: 'border-slate-700 bg-slate-800 text-slate-500', icon: null };
}

function winRate(wins: number, losses: number) {
  const total = wins + losses;
  return total > 0 ? Math.round((wins / total) * 100) : 0;
}

function PodiumSpot({ player, rank }: { player: CircuitPlayer; rank: number }) {
  const badge = rankBadge(rank);
  const BadgeIcon = badge.icon;
  const rate = winRate(player.wins, player.losses);
  const isFirst = rank === 1;

  return (
    <Link
      href={`/players/${player.username.toLowerCase()}`}
      className={`group relative flex min-w-0 flex-1 flex-col items-center rounded-xl border p-3 text-center transition hover:border-slate-600 sm:p-4 ${
        isFirst
          ? 'border-brand-500/35 bg-gradient-to-b from-brand-500/10 to-slate-950/40 sm:-mt-3 sm:pb-5'
          : 'border-slate-800 bg-slate-950/50'
      }`}
    >
      {isFirst && (
        <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-amber-400/80 to-transparent" />
      )}
      <span
        className={`inline-flex h-8 w-8 items-center justify-center rounded-full border text-xs font-bold ${badge.className}`}
      >
        {BadgeIcon ? <BadgeIcon size={14} /> : rank}
      </span>
      <span className="mt-2 inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-700 bg-slate-800 text-sm font-bold text-white transition group-hover:border-brand-500/40 group-hover:text-brand-200 sm:h-11 sm:w-11">
        {player.username.charAt(0).toUpperCase()}
      </span>
      <p className="mt-2 w-full truncate text-sm font-semibold text-white group-hover:text-brand-200">
        {player.username}
      </p>
      <p className="mt-1 text-lg font-semibold tabular-nums text-brand-300">
        {player.rankPoints.toLocaleString()}
        <span className="ml-0.5 text-[10px] font-normal text-slate-500">pts</span>
      </p>
      <p className="mt-1 text-[11px] tabular-nums text-slate-500">
        {player.wins}-{player.losses} · {rate}%
      </p>
    </Link>
  );
}

function LeaderboardRow({ player, rank }: { player: CircuitPlayer; rank: number }) {
  const badge = rankBadge(rank);
  const rate = winRate(player.wins, player.losses);

  return (
    <Link
      href={`/players/${player.username.toLowerCase()}`}
      className="group block rounded-xl border border-slate-800/80 bg-slate-950/40 px-3 py-3 transition hover:border-slate-700 hover:bg-slate-900/60 sm:px-4"
    >
      <div className="flex items-center gap-3">
        <span
          className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-bold tabular-nums ${badge.className}`}
        >
          {rank}
        </span>
        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-700 bg-slate-800 text-sm font-bold text-slate-300 transition group-hover:border-brand-500/30">
          {player.username.charAt(0).toUpperCase()}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-white group-hover:text-brand-200">{player.username}</p>
          <p className="text-xs tabular-nums text-slate-500">
            {player.wins}-{player.losses} W-L
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-sm font-semibold tabular-nums text-brand-300">
            {player.rankPoints.toLocaleString()}
          </p>
          <p className="text-[10px] text-slate-500">pts</p>
        </div>
      </div>
      <div className="mt-2.5 flex items-center gap-2 pl-11">
        <div className="h-1 flex-1 overflow-hidden rounded-full bg-slate-800">
          <div className="h-full rounded-full bg-brand-500/70" style={{ width: `${rate}%` }} />
        </div>
        <span className="w-8 shrink-0 text-right text-[10px] tabular-nums text-slate-500">{rate}%</span>
      </div>
    </Link>
  );
}

function MatchResultCard({ match }: { match: CircuitMatch }) {
  const scoreParts = match.score ? match.score.split('-') : [];
  const p1Score = scoreParts[0]?.trim() ?? '—';
  const p2Score = scoreParts[1]?.trim() ?? '—';
  const p1Name = match.player1?.username ?? 'TBD';
  const p2Name = match.player2?.username ?? 'TBD';
  const p1Won = match.winner?.username === p1Name;
  const p2Won = match.winner?.username === p2Name;

  return (
    <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950/50 transition hover:border-slate-700">
      <Link
        href={`/tournaments/${match.tournament.id}`}
        className="block truncate border-b border-slate-800/80 bg-slate-900/40 px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500 transition hover:bg-slate-900/70 hover:text-brand-300 sm:px-4"
      >
        {match.tournament.name}
      </Link>

      <div className="grid grid-cols-[1fr_auto_1fr] items-stretch gap-0">
        <div
          className={`flex min-w-0 items-center justify-end gap-2 px-3 py-3 sm:px-4 ${
            p1Won ? 'bg-emerald-950/35' : ''
          }`}
        >
          <span
            className={`min-w-0 truncate text-right text-sm font-semibold ${
              p1Won ? 'text-emerald-100' : 'text-slate-500'
            }`}
          >
            {p1Name}
          </span>
          {p1Won && (
            <span className="shrink-0 rounded bg-emerald-500/20 px-1.5 py-0.5 text-[9px] font-bold uppercase text-emerald-300">
              W
            </span>
          )}
        </div>

        <div className="flex flex-col items-center justify-center border-x border-slate-800/80 bg-slate-900/30 px-2.5 py-2 sm:px-3">
          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-600">Score</span>
          <span className="mt-0.5 text-sm font-bold tabular-nums text-white">
            {p1Score}
            <span className="mx-1 text-slate-600">–</span>
            {p2Score}
          </span>
        </div>

        <div
          className={`flex min-w-0 items-center gap-2 px-3 py-3 sm:px-4 ${p2Won ? 'bg-emerald-950/35' : ''}`}
        >
          {p2Won && (
            <span className="shrink-0 rounded bg-emerald-500/20 px-1.5 py-0.5 text-[9px] font-bold uppercase text-emerald-300">
              W
            </span>
          )}
          <span
            className={`min-w-0 truncate text-sm font-semibold ${
              p2Won ? 'text-emerald-100' : 'text-slate-500'
            }`}
          >
            {p2Name}
          </span>
        </div>
      </div>
    </div>
  );
}

type Props = {
  topPlayers: CircuitPlayer[];
  recentMatches: CircuitMatch[];
};

export function CircuitSection({ topPlayers, recentMatches }: Props) {
  const podium = topPlayers.slice(0, 3);
  const rest = topPlayers.slice(3);

  return (
    <section className="border-y border-slate-800 bg-slate-950/40">
      <div className="container py-10 sm:py-16">
        <div className="mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Circuit pulse</p>
            <h2 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">Rankings & recent results</h2>
            <p className="mt-2 text-sm text-slate-400">
              Top bladers on the leaderboard and the latest scores from Underground events.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/rankings"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-300 hover:text-brand-200"
            >
              Full rankings
              <ArrowRight size={14} />
            </Link>
            <Link
              href="/tournaments"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-400 hover:text-slate-200"
            >
              All events
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
          {/* Top bladers */}
          <div className="min-w-0 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/50">
            <div className="flex items-center gap-3 border-b border-slate-800 px-4 py-4 sm:px-6 sm:py-5">
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-brand-500/30 bg-brand-500/10 text-brand-300">
                <BarChart3 size={18} />
              </span>
              <div className="min-w-0">
                <h3 className="text-base font-semibold text-white sm:text-lg">Top bladers</h3>
                <p className="text-xs text-slate-500">Underground leaderboard</p>
              </div>
            </div>

            {topPlayers.length === 0 ? (
              <p className="px-4 py-10 text-center text-sm text-slate-400 sm:px-6">No players yet.</p>
            ) : (
              <div className="space-y-4 p-4 sm:p-5">
                {podium.length >= 3 && (
                  <div className="flex items-end gap-2 sm:gap-3">
                    <PodiumSpot player={podium[1]} rank={2} />
                    <PodiumSpot player={podium[0]} rank={1} />
                    <PodiumSpot player={podium[2]} rank={3} />
                  </div>
                )}

                {podium.length > 0 && podium.length < 3 && (
                  <div className="space-y-2">
                    {podium.map((p, i) => (
                      <LeaderboardRow key={p.id} player={p} rank={i + 1} />
                    ))}
                  </div>
                )}

                {rest.length > 0 && (
                  <div className="space-y-2">
                    {podium.length >= 3 && (
                      <p className="px-1 text-[10px] font-bold uppercase tracking-wider text-slate-600">
                        Also ranked
                      </p>
                    )}
                    {rest.map((p, i) => (
                      <LeaderboardRow key={p.id} player={p} rank={podium.length + i + 1} />
                    ))}
                  </div>
                )}

                <Link
                  href="/rankings"
                  className="flex items-center justify-center gap-2 rounded-xl border border-slate-800 bg-slate-950/40 py-2.5 text-sm font-semibold text-brand-300 transition hover:border-brand-500/30 hover:bg-brand-500/5"
                >
                  View full leaderboard
                  <ArrowRight size={14} />
                </Link>
              </div>
            )}
          </div>

          {/* Recent matches */}
          <div className="min-w-0 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/50">
            <div className="flex items-center gap-3 border-b border-slate-800 px-4 py-4 sm:px-6 sm:py-5">
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-700 bg-slate-800 text-slate-300">
                <Swords size={18} />
              </span>
              <div className="min-w-0">
                <h3 className="text-base font-semibold text-white sm:text-lg">Recent matches</h3>
                <p className="text-xs text-slate-500">Latest results on the circuit</p>
              </div>
            </div>

            {recentMatches.length === 0 ? (
              <p className="px-4 py-10 text-center text-sm text-slate-400 sm:px-6">No completed matches yet.</p>
            ) : (
              <div className="space-y-3 p-4 sm:p-5">
                {recentMatches.map((m) => (
                  <MatchResultCard key={m.id} match={m} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
