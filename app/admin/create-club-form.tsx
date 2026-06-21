'use client';

import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { useActionState } from 'react';
import { createClub } from '@/app/actions/clubs';

export function CreateClubForm() {
  const [state, action, pending] = useActionState(createClub, null);

  return (
    <div className="card p-6">
      <form action={action} className="space-y-4">
        {state?.error && (
          <p className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {state.error}
          </p>
        )}
        <div>
          <label htmlFor="club-name" className="block text-sm font-medium text-slate-300">
            Club name *
          </label>
          <input
            id="club-name"
            name="name"
            type="text"
            required
            placeholder="NC Bladers"
            className="input mt-1"
          />
        </div>
        <div>
          <label htmlFor="club-region" className="block text-sm font-medium text-slate-300">
            Region *
          </label>
          <input
            id="club-region"
            name="region"
            type="text"
            required
            placeholder="Charlotte"
            className="input mt-1"
          />
        </div>
        <div>
          <label htmlFor="club-tagline" className="block text-sm font-medium text-slate-300">
            Tagline
          </label>
          <textarea
            id="club-tagline"
            name="tagline"
            rows={2}
            placeholder="Short description of the club"
            className="textarea mt-1"
          />
        </div>
        <div>
          <label htmlFor="club-captain" className="block text-sm font-medium text-slate-300">
            Captain
          </label>
          <input
            id="club-captain"
            name="captain"
            type="text"
            placeholder="Username or display name"
            className="input mt-1"
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="club-members" className="block text-sm font-medium text-slate-300">
              Members
            </label>
            <input
              id="club-members"
              name="memberCount"
              type="number"
              min={0}
              defaultValue={0}
              className="input mt-1"
            />
          </div>
          <div>
            <label htmlFor="club-events" className="block text-sm font-medium text-slate-300">
              Events hosted
            </label>
            <input
              id="club-events"
              name="eventsCount"
              type="number"
              min={0}
              defaultValue={0}
              className="input mt-1"
            />
          </div>
        </div>

        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
          <Link href="/dashboard/clubs" className="btn-secondary text-center">
            Cancel
          </Link>
          <button type="submit" disabled={pending} className="btn-primary disabled:opacity-60">
            {pending ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 size={16} className="animate-spin" />
                Creating…
              </span>
            ) : (
              'Create club'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
