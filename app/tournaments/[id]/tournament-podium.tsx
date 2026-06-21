import Link from 'next/link';
import { Crown, Medal } from 'lucide-react';
import type { PodiumEntry } from '@/lib/tournament-stats';

const PLACEMENT_META: Record<
  PodiumEntry['placement'],
  { label: string; className: string; icon: typeof Crown | typeof Medal | null }
> = {
  1: {
    label: '1st',
    className: 'border-amber-500/40 bg-amber-500/10 text-amber-200',
    icon: Crown,
  },
  2: {
    label: '2nd',
    className: 'border-slate-500/40 bg-slate-500/10 text-slate-200',
    icon: Medal,
  },
  3: {
    label: '3rd',
    className: 'border-orange-700/40 bg-orange-900/20 text-orange-300',
    icon: Medal,
  },
};

type Props = {
  entries: PodiumEntry[];
};

export function TournamentPodium({ entries }: Props) {
  if (entries.length === 0) return null;

  return (
    <div className="mb-5 rounded-xl border border-slate-800 bg-gradient-to-b from-slate-900/80 to-slate-950/60 p-4">
      <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
        Final placements
      </p>
      <div className="grid gap-3 sm:grid-cols-3">
        {entries.map((entry) => {
          const meta = PLACEMENT_META[entry.placement];
          const Icon = meta.icon;

          return (
            <Link
              key={entry.userId}
              href={`/players/${entry.username.toLowerCase()}`}
              className={`group flex items-center gap-3 rounded-xl border px-4 py-3 transition hover:brightness-110 ${meta.className} ${
                entry.placement === 1 ? 'sm:-mt-0.5 sm:shadow-lg sm:shadow-amber-950/20' : ''
              }`}
            >
              <span
                className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-xs font-bold ${meta.className}`}
              >
                {Icon ? <Icon size={16} /> : entry.placement}
              </span>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider opacity-80">
                  Top {entry.placement} · {meta.label}
                </p>
                <p className="truncate text-sm font-semibold text-white group-hover:text-brand-200">
                  {entry.username}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
