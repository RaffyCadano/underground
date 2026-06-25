import Link from 'next/link';
import { Crown } from 'lucide-react';
import { SITE_NAME } from '@/lib/site';

export function TournamentPlanLimitNotice({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 via-slate-950 to-slate-950 px-4 py-3">
      <p className="text-sm font-semibold text-amber-100">{title}</p>
      <p className="mt-1 text-sm leading-relaxed text-slate-300">
        {body}{' '}
        <Link
          href="/profile/subscriptions"
          className="inline-flex items-center gap-1 font-semibold text-amber-200 underline decoration-amber-500/40 underline-offset-2 transition hover:text-amber-100"
        >
          <span className="inline-flex items-center gap-1 rounded border border-amber-500/50 bg-gradient-to-r from-amber-500/25 to-orange-500/20 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-200">
            <Crown size={9} />
            Premier
          </span>
          {SITE_NAME} Premier
        </Link>
      </p>
    </div>
  );
}
