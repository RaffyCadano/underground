import Link from 'next/link';
import { ArrowRight, Calendar, Clock, Shield, Swords } from 'lucide-react';
import { roleLabel } from '@/lib/roles';

type Props = {
  role: string;
  pendingRequest: { id: string; message: string; createdAt: Date } | null;
};

export function OrganizerRequestSection({ role, pendingRequest }: Props) {
  if (role === 'admin' || role === 'organizer') {
    return (
      <section className="overflow-hidden rounded-2xl border border-sky-500/25 bg-gradient-to-br from-sky-500/10 via-slate-950/40 to-slate-950">
        <div className="p-5">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-sky-500/30 bg-sky-500/10 text-sky-300">
            <Shield size={16} />
          </span>
          <h3 className="mt-3 text-sm font-semibold text-white">Organizer access</h3>
          <p className="mt-1 text-xs leading-relaxed text-slate-400">
            Your account has {roleLabel(role).toLowerCase()} access. Create and manage tournaments
            from the dashboard.
          </p>
          <Link
            href="/dashboard/tournaments"
            className="btn-secondary mt-4 inline-flex w-full items-center justify-center gap-2"
          >
            <Swords size={14} />
            Manage tournaments
          </Link>
        </div>
      </section>
    );
  }

  if (pendingRequest) {
    return (
      <section className="overflow-hidden rounded-2xl border border-amber-500/25 bg-gradient-to-br from-amber-500/10 via-slate-950/40 to-slate-950">
        <div className="p-5">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-300">
            <Clock size={16} />
          </span>
          <h3 className="mt-3 text-sm font-semibold text-white">Request pending</h3>
          <p className="mt-1 text-xs leading-relaxed text-slate-400">
            Submitted{' '}
            {pendingRequest.createdAt.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
            . We&apos;ll review your organizer application soon.
          </p>
          <Link
            href="/organizer/request"
            className="btn-secondary mt-4 inline-flex w-full items-center justify-center gap-2"
          >
            View request
            <ArrowRight size={14} />
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/60">
      <div className="p-5">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-brand-500/25 bg-brand-500/10 text-brand-300">
          <Calendar size={16} />
        </span>
        <h3 className="mt-3 text-sm font-semibold text-white">Become an organizer</h3>
        <p className="mt-1 text-xs leading-relaxed text-slate-400">
          Run tournaments on the UGNCBBX circuit — brackets, scores, and walk-ins from one
          dashboard.
        </p>
        <Link
          href="/organizer/request"
          className="btn-primary mt-4 inline-flex w-full items-center justify-center gap-2"
        >
          Request access
          <ArrowRight size={14} />
        </Link>
      </div>
    </section>
  );
}
