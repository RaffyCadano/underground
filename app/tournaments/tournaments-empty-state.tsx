import { Trophy } from 'lucide-react';
import { TournamentsSearchSection } from './tournaments-search-section';

type Props = {
  query?: string;
  status?: string;
  statusOptions: { value: string; label: string }[];
};

export function TournamentsEmptyState({
  query = '',
  status = 'all',
  statusOptions,
}: Props) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/60">
      <div className="h-1 bg-gradient-to-r from-transparent via-brand-400 to-transparent" />

      <div className="border-b border-slate-800 px-5 py-5 sm:px-8 sm:py-6">
        <TournamentsSearchSection
          query={query}
          status={status}
          statusOptions={statusOptions}
        />
      </div>

      <div className="bg-gradient-to-br from-brand-500/[0.06] to-transparent px-5 py-8 sm:px-8 sm:py-10">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-brand-500/30 bg-brand-500/10 text-brand-300">
            <Trophy size={24} />
          </span>
          <h2 className="mt-4 text-2xl font-semibold text-white sm:text-3xl">No tournaments yet</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-400 sm:text-base">
            The UGNCBBX circuit is getting ready for game day. When admins publish events, they
            will show up here — open for registration, live brackets, and full results.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-slate-500 sm:text-base">
            Use the search above to filter by name, location, or status once events are listed.
          </p>
        </div>
      </div>
    </div>
  );
}
