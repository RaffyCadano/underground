import Link from 'next/link';
import { ArrowRight, AtSign, ExternalLink, Mail, Shield } from 'lucide-react';
import { PlayerAvatar } from '@/app/components/player-avatar';

type Props = {
  username: string;
  email: string;
  role: string;
  avatar: string | null;
  profileHref: string;
};

function roleStyles(role: string) {
  if (role === 'admin') {
    return 'border-brand-500/35 bg-brand-500/10 text-brand-300';
  }
  return 'border-slate-700 bg-slate-800/80 text-slate-300';
}

function AccountField({
  icon: Icon,
  label,
  value,
  mono = false,
}: {
  icon: typeof AtSign;
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start gap-3 px-5 py-4 sm:px-6">
      <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-slate-400">
        <Icon size={16} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-slate-500">{label}</p>
        <p
          className={`mt-1 break-all text-sm font-semibold text-white ${mono ? 'font-mono text-[13px]' : ''}`}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

export function ProfileAccountSection({ username, email, role, avatar, profileHref }: Props) {
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/60">
        <div className="border-b border-slate-800 bg-slate-900/50 px-5 py-4 sm:px-6">
          <p className="text-sm font-semibold text-white">Account details</p>
          <p className="mt-0.5 text-xs text-slate-500">Your sign-in info and role on UGNCBBX.</p>
        </div>

        <div className="divide-y divide-slate-800/80">
          <AccountField icon={AtSign} label="Username" value={username} />
          <AccountField icon={Mail} label="Email" value={email} mono />
          <div className="flex items-start gap-3 px-5 py-4 sm:px-6">
            <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-slate-400">
              <Shield size={16} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-slate-500">Role</p>
              <span
                className={`mt-2 inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider ${roleStyles(role)}`}
              >
                {role}
              </span>
            </div>
          </div>
        </div>
      </div>

      <Link
        href={profileHref}
        className="group relative overflow-hidden rounded-2xl border border-brand-500/25 bg-gradient-to-br from-brand-500/10 via-slate-950/80 to-slate-950 transition hover:border-brand-400/40 hover:shadow-lg hover:shadow-brand-950/20"
      >
        <div className="h-1 bg-gradient-to-r from-transparent via-brand-400/70 to-transparent" />

        <div className="flex h-full flex-col p-5 sm:p-6">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-400/90">
            <ExternalLink size={13} />
            Public profile
          </div>

          <div className="mt-5 flex items-center gap-3">
            <div className="rounded-xl bg-gradient-to-br from-brand-500/20 via-transparent to-brand-500/10 p-0.5">
              <PlayerAvatar username={username} avatar={avatar} size="lg" shape="rounded-xl" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-base font-semibold text-white group-hover:text-brand-100">
                {username}
              </p>
              <p className="mt-0.5 text-xs text-slate-500">Visible on the circuit</p>
            </div>
          </div>

          <p className="mt-4 text-sm leading-relaxed text-slate-400">
            See your stats, tournament history, and ranking as other bladers view them.
          </p>

          <span className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-brand-500/30 bg-brand-500/10 px-4 py-2.5 text-sm font-semibold text-brand-200 transition group-hover:border-brand-400/45 group-hover:bg-brand-500/15">
            View profile
            <ArrowRight size={15} className="transition group-hover:translate-x-0.5" />
          </span>
        </div>
      </Link>
    </div>
  );
}
