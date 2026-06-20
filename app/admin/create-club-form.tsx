'use client';

import { useActionState } from 'react';
import { createClub } from '@/app/actions/clubs';

export function CreateClubForm() {
  const [state, action, pending] = useActionState(createClub, null);

  return (
    <div className="card p-6">
      <h2 className="mb-5 text-lg font-semibold text-white">Add community club</h2>
      <form action={action} className="space-y-4">
        {state?.error && (
          <p className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {state.error}
          </p>
        )}
        <div>
          <label className="block text-sm font-medium text-slate-300">Club name *</label>
          <input name="name" type="text" required placeholder="NC Bladers" className="input mt-1" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300">Region *</label>
          <input name="region" type="text" required placeholder="Charlotte" className="input mt-1" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300">Tagline</label>
          <textarea
            name="tagline"
            rows={2}
            placeholder="Short description of the club"
            className="textarea mt-1"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300">Captain</label>
          <input name="captain" type="text" placeholder="Username or display name" className="input mt-1" />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-300">Members</label>
            <input name="memberCount" type="number" min={0} defaultValue={0} className="input mt-1" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300">Events hosted</label>
            <input name="eventsCount" type="number" min={0} defaultValue={0} className="input mt-1" />
          </div>
        </div>
        <button type="submit" disabled={pending} className="btn-primary w-full disabled:opacity-60">
          {pending ? 'Creating…' : 'Create club'}
        </button>
      </form>
    </div>
  );
}
