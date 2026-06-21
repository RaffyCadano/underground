import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { CreateTournamentForm } from '@/app/admin/create-tournament-form';

export default function CreateTournamentPage() {
  return (
    <div>
      <Link
        href="/dashboard/tournaments"
        className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-400 transition hover:text-brand-300"
      >
        <ArrowLeft size={16} />
        Back to tournaments
      </Link>

      <div className="mb-6">
        <h2 className="text-xl font-semibold text-white">Create tournament</h2>
        <p className="mt-1 text-sm text-slate-400">
          Set up a new event — format, date, and optional group stage or grand finals rules.
        </p>
      </div>

      <div className="max-w-xl">
        <CreateTournamentForm />
      </div>
    </div>
  );
}
