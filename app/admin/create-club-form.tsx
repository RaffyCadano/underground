'use client';

import Link from 'next/link';
import { useActionState, useState } from 'react';
import {
  CalendarDays,
  Loader2,
  MapPin,
  Shield,
  UserRound,
  Users,
  UsersRound,
} from 'lucide-react';
import { createClub } from '@/app/actions/clubs';

function teamInitials(name: string) {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="card min-w-0 overflow-hidden">
      <div className="border-b border-slate-800 bg-slate-900/50 px-5 py-4">
        <h3 className="text-sm font-semibold text-white">{title}</h3>
        {description && <p className="mt-0.5 text-xs text-slate-500">{description}</p>}
      </div>
      <div className="space-y-4 p-5">{children}</div>
    </div>
  );
}

function FieldLabel({ htmlFor, children }: { htmlFor?: string; children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
      {children}
    </label>
  );
}

function ClubPreview({
  name,
  region,
  tagline,
  captain,
  memberCount,
  eventsCount,
}: {
  name: string;
  region: string;
  tagline: string;
  captain: string;
  memberCount: string;
  eventsCount: string;
}) {
  const displayName = name.trim() || 'Club name';
  const displayRegion = region.trim() || 'Region';
  const members = Number(memberCount) || 0;
  const events = Number(eventsCount) || 0;

  return (
    <div className="card overflow-hidden">
      <div className="border-b border-slate-800 bg-gradient-to-br from-brand-500/10 to-transparent px-4 py-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Teams page preview</p>
      </div>
      <div className="p-4">
        <div className="overflow-hidden rounded-2xl border border-brand-500/25 bg-slate-900/60">
          <div className="h-1 bg-gradient-to-r from-transparent via-brand-400 to-transparent" />
          <div className="p-4">
            <div className="flex items-start justify-between gap-2">
              <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-brand-500/30 bg-brand-500/10 text-sm font-bold text-brand-200">
                {teamInitials(displayName)}
              </span>
              <span className="inline-flex max-w-[55%] items-center gap-1 truncate rounded-full border border-slate-700 bg-slate-950 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                <MapPin size={10} className="shrink-0" />
                <span className="truncate">{displayRegion}</span>
              </span>
            </div>

            <h4 className="mt-3 text-base font-semibold text-white">{displayName}</h4>
            {tagline.trim() ? (
              <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-slate-400">{tagline}</p>
            ) : (
              <p className="mt-2 text-xs italic text-slate-600">Tagline appears here…</p>
            )}

            <div className="mt-4 grid grid-cols-3 gap-1.5 text-center">
              <div className="rounded-lg border border-slate-800 bg-slate-950/80 py-2">
                <p className="text-sm font-semibold tabular-nums text-white">{members}</p>
                <p className="text-[9px] uppercase tracking-wider text-slate-500">Members</p>
              </div>
              <div className="rounded-lg border border-slate-800 bg-slate-950/80 py-2">
                <p className="text-sm font-semibold tabular-nums text-white">{events}</p>
                <p className="text-[9px] uppercase tracking-wider text-slate-500">Events</p>
              </div>
              <div className="rounded-lg border border-slate-800 bg-slate-950/80 px-1 py-2">
                <p className="truncate text-xs font-semibold text-brand-300">{captain.trim() || '—'}</p>
                <p className="text-[9px] uppercase tracking-wider text-slate-500">Captain</p>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-slate-800 pt-3">
              <span className="inline-flex items-center gap-1.5 text-[10px] text-slate-500">
                <Shield size={11} />
                Verified on publish
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CreateClubForm() {
  const [state, action, pending] = useActionState(createClub, null);
  const [name, setName] = useState('');
  const [region, setRegion] = useState('');
  const [tagline, setTagline] = useState('');
  const [captain, setCaptain] = useState('');
  const [memberCount, setMemberCount] = useState('0');
  const [eventsCount, setEventsCount] = useState('0');

  return (
    <div className="w-full min-w-0 xl:grid xl:grid-cols-[minmax(0,1fr)_240px] xl:items-start xl:gap-8">
      <form action={action} className="min-w-0 space-y-5">
        {state?.error && (
          <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {state.error}
          </p>
        )}

        <FormSection title="Club identity" description="How the club appears on the public teams page.">
          <div>
            <FieldLabel htmlFor="club-name">Club name *</FieldLabel>
            <div className="relative mt-2">
              <UsersRound
                size={15}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
              />
              <input
                id="club-name"
                name="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="NC Bladers"
                className="input pl-9"
              />
            </div>
          </div>

          <div>
            <FieldLabel htmlFor="club-region">Region *</FieldLabel>
            <div className="relative mt-2">
              <MapPin
                size={15}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
              />
              <input
                id="club-region"
                name="region"
                type="text"
                required
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                placeholder="Charlotte, NC"
                className="input pl-9"
              />
            </div>
          </div>

          <div>
            <FieldLabel htmlFor="club-tagline">Tagline</FieldLabel>
            <textarea
              id="club-tagline"
              name="tagline"
              rows={3}
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="Competitive Beyblade X crew — weekly meetups and tournament prep."
              className="textarea mt-2"
            />
          </div>
        </FormSection>

        <FormSection title="Leadership & activity" description="Optional stats shown on the club card.">
          <div>
            <FieldLabel htmlFor="club-captain">Captain</FieldLabel>
            <div className="relative mt-2">
              <UserRound
                size={15}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
              />
              <input
                id="club-captain"
                name="captain"
                type="text"
                value={captain}
                onChange={(e) => setCaptain(e.target.value)}
                placeholder="Username or display name"
                className="input pl-9"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <FieldLabel htmlFor="club-members">Members</FieldLabel>
              <div className="relative mt-2">
                <Users
                  size={15}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                />
                <input
                  id="club-members"
                  name="memberCount"
                  type="number"
                  min={0}
                  value={memberCount}
                  onChange={(e) => setMemberCount(e.target.value)}
                  className="input pl-9"
                />
              </div>
            </div>
            <div>
              <FieldLabel htmlFor="club-events">Events hosted</FieldLabel>
              <div className="relative mt-2">
                <CalendarDays
                  size={15}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                />
                <input
                  id="club-events"
                  name="eventsCount"
                  type="number"
                  min={0}
                  value={eventsCount}
                  onChange={(e) => setEventsCount(e.target.value)}
                  className="input pl-9"
                />
              </div>
            </div>
          </div>
        </FormSection>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
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

      <aside className="hidden min-w-0 xl:block">
        <div className="sticky top-24 space-y-3">
          <ClubPreview
            name={name}
            region={region}
            tagline={tagline}
            captain={captain}
            memberCount={memberCount}
            eventsCount={eventsCount}
          />
          <p className="px-1 text-[11px] leading-relaxed text-slate-600">
            Matches the card layout on{' '}
            <Link href="/teams" className="text-brand-400 hover:text-brand-300">
              /teams
            </Link>
            . New clubs are listed as verified by default.
          </p>
        </div>
      </aside>
    </div>
  );
}
