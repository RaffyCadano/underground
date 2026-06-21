import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { CreateTournamentForm } from '@/app/admin/create-tournament-form';

export default function CreateTournamentPage() {
  return (
    <div className="w-full min-w-0">
      <Link
        href="/dashboard/tournaments"
        className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-400 transition hover:text-brand-300"
      >
        <ArrowLeft size={16} />
        Back to tournaments
      </Link>

      <div className="mb-8">
        <span className="badge">New event</span>
        <h2 className="mt-3 text-2xl font-semibold text-white">Create tournament</h2>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-400">
          Set up format, schedule, and rules. You can add players and generate the bracket after
          creation.
        </p>
      </div>

      <CreateTournamentForm />
    </div>
  );
}
