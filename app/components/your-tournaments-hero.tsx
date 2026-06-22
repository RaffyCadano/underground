import Link from 'next/link';
import { Plus } from 'lucide-react';

type Props = {
  createHref: string;
};

export function YourTournamentsHero({ createHref }: Props) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-br from-brand-500/12 via-slate-950 to-slate-950 px-6 py-8 sm:px-10 sm:py-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_0%_0%,rgba(34,197,94,0.14),transparent_55%)]" />
      <div className="relative max-w-2xl">
        <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl md:text-4xl">
          Your tournaments
        </h1>
        <p className="mt-3 text-lg font-medium italic text-brand-300 sm:text-xl">Commence battle</p>
        <p className="mt-4 text-sm leading-relaxed text-slate-400 sm:text-base">
          Create and manage your tournament, brackets, participants, and more.
        </p>
        <Link
          href={createHref}
          className="btn-primary mt-6 inline-flex items-center gap-2"
        >
          <Plus size={16} />
          Create a Tournament
        </Link>
      </div>
    </div>
  );
}
