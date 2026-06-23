import Link from 'next/link';
import { Database, RefreshCw } from 'lucide-react';

export function DatabaseUnavailable({
  title = 'Events temporarily unavailable',
  description = 'We could not reach the database. Tournament listings and registration may be offline until connectivity is restored.',
}: {
  title?: string;
  description?: string;
}) {
  const isDev = process.env.NODE_ENV === 'development';

  return (
    <div className="rounded-2xl border border-amber-500/25 bg-gradient-to-br from-amber-500/10 via-slate-950/60 to-slate-950 px-5 py-8 text-center sm:px-8 sm:py-10">
      <span className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-300">
        <Database size={22} />
      </span>
      <h2 className="mt-4 text-lg font-semibold text-white sm:text-xl">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-400">{description}</p>

      {isDev && (
        <div className="mx-auto mt-5 max-w-lg rounded-xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-left text-xs leading-relaxed text-slate-400">
          <p className="font-semibold text-slate-300">Local dev checklist</p>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li>Open the Supabase dashboard and restore the project if it is paused.</li>
            <li>
              Copy the <span className="text-slate-300">Transaction pooler</span> URL into{' '}
              <code className="text-slate-300">DATABASE_URL</code> in <code className="text-slate-300">.env.local</code>.
            </li>
            <li>Restart the Next.js dev server after updating env vars.</li>
          </ul>
        </div>
      )}

      <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Link href="/tournaments" className="btn-secondary inline-flex w-full items-center justify-center gap-2 sm:w-auto">
          <RefreshCw size={15} />
          Try again
        </Link>
        <Link href="/" className="btn-ghost inline-flex w-full sm:w-auto">
          Back to home
        </Link>
      </div>
    </div>
  );
}
