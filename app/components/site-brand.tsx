import Link from 'next/link';

const TAGLINE = 'Let it rip. Climb the rankings.';

export function SiteBrand() {
  return (
    <Link
      href="/"
      className="group flex items-center gap-3 transition hover:opacity-95"
    >
      <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-brand-500/30 bg-brand-500/10 text-sm font-bold text-brand-300 transition group-hover:border-brand-400/50 group-hover:bg-brand-500/20">
        U
      </span>
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
