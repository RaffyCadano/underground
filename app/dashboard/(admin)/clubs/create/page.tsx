import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { CreateClubForm } from '@/app/admin/create-club-form';

export default function CreateClubPage() {
  return (
    <div className="w-full min-w-0">
      <Link
        href="/dashboard/clubs"
        className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-400 transition hover:text-brand-300"
      >
        <ArrowLeft size={16} />
        Back to clubs
      </Link>

      <div className="mb-8">
        <span className="badge">New club</span>
        <h2 className="mt-3 text-2xl font-semibold text-white">Add community club</h2>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-400">
          List a Beyblade X crew on the public teams page — region, tagline, captain, and member stats.
        </p>
      </div>

      <CreateClubForm />
    </div>
  );
}
