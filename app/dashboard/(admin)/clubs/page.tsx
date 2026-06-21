import Link from 'next/link';
import { MapPin } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { DeleteClubButton } from '@/app/teams/delete-club-button';

export default async function DashboardClubsPage() {
  const clubs = await prisma.communityClub.findMany({
    orderBy: [{ memberCount: 'desc' }, { name: 'asc' }],
  });

  const totalMembers = clubs.reduce((sum, c) => sum + c.memberCount, 0);

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Community clubs</h2>
          <p className="mt-1 text-sm text-slate-400">
            Manage clubs shown on the public teams page.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <Link href="/teams" className="text-sm font-semibold text-brand-300 hover:text-brand-200">
            View public page
          </Link>
          <Link href="/dashboard/clubs/create" className="btn-primary">
            Add club
          </Link>
        </div>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-800 bg-slate-950 px-4 py-3">
          <p className="text-xs uppercase tracking-wider text-slate-500">Clubs listed</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-white">{clubs.length}</p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-950 px-4 py-3">
          <p className="text-xs uppercase tracking-wider text-slate-500">Total members</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-white">{totalMembers}</p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-950 px-4 py-3">
          <p className="text-xs uppercase tracking-wider text-slate-500">Regions</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-white">
            {new Set(clubs.map((c) => c.region)).size}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {clubs.length === 0 ? (
          <div className="card-muted p-8 text-center text-slate-400">
            No community clubs yet.{' '}
            <Link href="/dashboard/clubs/create" className="font-semibold text-brand-300 hover:text-brand-200">
              Add one
            </Link>{' '}
            to get started.
          </div>
        ) : (
          clubs.map((club) => (
            <div
              key={club.id}
              className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-950 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-white">{club.name}</p>
                  {club.verified && (
                    <span className="rounded-full border border-brand-500/30 bg-brand-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-brand-300">
                      Verified
                    </span>
                  )}
                </div>
                {club.tagline && <p className="mt-1 text-sm text-slate-400">{club.tagline}</p>}
                <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                  <span className="inline-flex items-center gap-1">
                    <MapPin size={12} />
                    {club.region}
                  </span>
                  <span>{club.memberCount} members</span>
                  <span>{club.eventsCount} events</span>
                  {club.captain && <span>Captain: {club.captain}</span>}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <Link href="/teams" className="btn-secondary">
                  Public listing
                </Link>
                <DeleteClubButton clubId={club.id} clubName={club.name} />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
