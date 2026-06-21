import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { CreateClubForm } from '@/app/admin/create-club-form';

export default function CreateClubPage() {
  return (
    <div>
      <Link
        href="/dashboard/clubs"
        className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-400 transition hover:text-brand-300"
      >
        <ArrowLeft size={16} />
        Back to clubs
      </Link>

      <div className="mb-6">
        <span className="badge">New club</span>
        <h2 className="mt-3 text-xl font-semibold text-white">Add community club</h2>
        <p className="mt-1 max-w-xl text-sm text-slate-400">
          Clubs appear on the public teams page. Add name, region, and optional details.
        </p>
      </div>

      <div className="max-w-xl">
        <CreateClubForm />
      </div>
    </div>
  );
}
