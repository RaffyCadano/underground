import Link from 'next/link';
import { ArrowRight, ExternalLink, Mail, Trophy } from 'lucide-react';
import { PlayerAvatar } from '@/app/components/player-avatar';
import { roleBadgeClass, roleLabel } from '@/lib/roles';

type Props = {
  username: string;
  email: string;
  role: string;
  avatar: string | null;
  profileHref: string;
  wins: number;
  losses: number;
  rankPoints: number;
};

export function ProfileIdentityHeader({
  username,
  email,
  role,
  avatar,
  profileHref,
  wins,
  losses,
  rankPoints,
}: Props) {
  const record = `${wins}W · ${losses}L`;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/80 shadow-lg shadow-black/20">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_0%_0%,rgba(34,197,94,0.12),transparent_55%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_100%_100%,rgba(56,189,248,0.08),transparent_50%)]" />
      <div className="h-1 bg-gradient-to-r from-transparent via-brand-400/60 to-transparent" />

      <div className="relative px-5 py-5 sm:px-6 sm:py-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <div className="shrink-0 rounded-2xl bg-gradient-to-br from-brand-500/25 via-transparent to-sky-500/15 p-0.5">
              <PlayerAvatar
                username={username}
                avatar={avatar}
                size="2xl"
                shape="rounded-xl"
                className="border-slate-800 bg-slate-900 ring-2 ring-slate-950"
              />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                Your profile
              </p>
              <h2 className="mt-1 truncate text-xl font-semibold text-white sm:text-2xl">
                {username}
              </h2>
              <p className="mt-1 flex items-center gap-1.5 truncate text-sm text-slate-400">
                <Mail size={13} className="shrink-0 text-slate-500" />
                <span className="truncate">{email}</span>
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${roleBadgeClass(role)}`}
                >
                  {roleLabel(role)}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border border-slate-700 bg-slate-900/80 px-2.5 py-0.5 text-[10px] font-semibold tabular-nums text-slate-400">
                  <Trophy size={10} className="text-brand-400" />
                  {rankPoints.toLocaleString()} pts
                </span>
                <span className="rounded-full border border-slate-800 bg-slate-900/60 px-2.5 py-0.5 text-[10px] font-semibold tabular-nums text-slate-500">
                  {record}
                </span>
              </div>
            </div>
          </div>

          <Link
            href={profileHref}
            className="group inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-xl border border-brand-500/30 bg-brand-500/10 px-4 py-3 text-sm font-semibold text-brand-200 transition hover:border-brand-400/45 hover:bg-brand-500/15 sm:w-auto"
          >
            <ExternalLink size={15} />
            View public profile
            <ArrowRight
              size={15}
              className="transition group-hover:translate-x-0.5"
            />
          </Link>
        </div>
      </div>
    </div>
  );
}
