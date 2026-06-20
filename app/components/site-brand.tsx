import Link from 'next/link';
import { SiteLogo } from '@/app/components/site-logo';

const TAGLINE = 'Let it rip. Climb the rankings.';

export function SiteBrand() {
  return (
    <Link
      href="/"
      className="group flex items-center gap-3 transition hover:opacity-95"
    >
      <SiteLogo className="transition group-hover:border-brand-400/50" />
      <div className="min-w-0 leading-tight">
        <p className="text-base font-semibold tracking-tight text-slate-100 transition group-hover:text-white">
          Underground
        </p>
        <p className="mt-0.5 truncate text-xs text-slate-500 transition group-hover:text-slate-400">
          {TAGLINE}
        </p>
      </div>
    </Link>
  );
}
