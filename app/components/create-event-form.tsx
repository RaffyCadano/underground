'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Calendar, Clock, Globe, MapPin, Play, RefreshCw } from 'lucide-react';
import { createEvent } from '@/app/actions/events';
import { TournamentDescriptionContent } from '@/app/components/tournament-description-content';
import { TournamentDescriptionEditor } from '@/app/components/tournament-description-editor';
import { generateEventSlug } from '@/lib/event-slug';
import { TIMEZONE_OPTIONS } from '@/lib/profile-settings-options';
import { SITE_NAME } from '@/lib/site';

function FormSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="card overflow-hidden">
      <div className="border-b border-slate-800 bg-slate-900/50 px-4 py-3 sm:px-5">
        <h3 className="text-sm font-semibold text-white">{title}</h3>
      </div>
      <div className="space-y-4 p-4 sm:p-5">{children}</div>
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

type Props = {
  hostUsername: string;
  defaultTimezone: string;
  permalinkPrefix: string;
  imageUploadEnabled?: boolean;
};

export function CreateEventForm({
  hostUsername,
  defaultTimezone,
  permalinkPrefix,
  imageUploadEnabled = false,
}: Props) {
  const [state, action, pending] = useActionState(createEvent, null);
  const formRef = useRef<HTMLFormElement>(null);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState(() => generateEventSlug());
  const [slugTouched, setSlugTouched] = useState(false);
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [descriptionTab, setDescriptionTab] = useState<'write' | 'preview'>('write');
  const [startsAt, setStartsAt] = useState('');
  const [endsAt, setEndsAt] = useState('');
  const [timezone, setTimezone] = useState(defaultTimezone);
  const [venueName, setVenueName] = useState('');
  const [location, setLocation] = useState('');
  const [manualAddress, setManualAddress] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [stateRegion, setStateRegion] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('US');

  useEffect(() => {
    if (slugTouched || !title.trim()) return;
    const derived = title
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 32);
    if (derived.length >= 3) setSlug(derived);
  }, [title, slugTouched]);

  function regenerateSlug() {
    setSlugTouched(true);
    setSlug(generateEventSlug());
  }

  function clearAddress() {
    setVenueName('');
    setLocation('');
    setAddressLine1('');
    setAddressLine2('');
    setCity('');
    setStateRegion('');
    setPostalCode('');
    setCountry('US');
    setManualAddress(false);
    setIsOnline(false);
  }

  function handleOnlineChange(checked: boolean) {
    setIsOnline(checked);
    if (checked) {
      setVenueName('');
      setLocation('');
      setAddressLine1('');
      setAddressLine2('');
      setCity('');
      setStateRegion('');
      setPostalCode('');
      setManualAddress(false);
    }
  }

  return (
    <div className="w-full min-w-0 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white sm:text-3xl">Create an event</h1>
        <div className="mt-4 overflow-hidden rounded-xl border border-slate-800 bg-slate-950/60">
          <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:p-5">
            <div className="flex h-14 w-24 shrink-0 items-center justify-center rounded-lg border border-slate-700 bg-slate-900 text-slate-500">
              <Play size={22} className="ml-0.5" />
            </div>
            <p className="text-sm leading-relaxed text-slate-400">
              Learn all about {SITE_NAME} events with this short tutorial video.
            </p>
          </div>
        </div>
        <p className="mt-4 text-sm text-slate-400">
          If you decide a single tournament is all you need, you can{' '}
          <Link href="/dashboard/tournaments/create" className="font-semibold text-brand-300 hover:text-brand-200">
            start that here
          </Link>
          .
        </p>
      </div>

      <form ref={formRef} action={action} className="space-y-6">
        <input type="hidden" name="description" value={description} />
        {state?.error && (
          <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {state.error}
          </p>
        )}

        <FormSection title="Event details">
          <div>
            <FieldLabel>Host</FieldLabel>
            <p className="mt-2 text-sm font-medium text-white">{hostUsername}</p>
          </div>

          <div>
            <FieldLabel htmlFor="event-title">Title</FieldLabel>
            <input
              id="event-title"
              name="title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input mt-2"
              placeholder="Summer Beyblade Circuit"
            />
          </div>

          <div>
            <FieldLabel htmlFor="event-slug">Permalink</FieldLabel>
            <div className="mt-2 flex flex-wrap items-stretch gap-2">
              <span className="inline-flex items-center rounded-lg border border-slate-700 bg-slate-900 px-3 text-xs text-slate-500 sm:text-sm">
                {permalinkPrefix}
              </span>
              <div className="flex min-w-0 flex-1 items-center gap-2">
                <input
                  id="event-slug"
                  name="slug"
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => {
                    setSlugTouched(true);
                    setSlug(e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, '').slice(0, 32));
                  }}
                  className="input min-w-0 flex-1 font-mono uppercase tracking-wider"
                  placeholder="NRW8R"
                />
                <button
                  type="button"
                  onClick={regenerateSlug}
                  className="btn-secondary shrink-0 px-3 py-2"
                  title="Generate new permalink"
                >
                  <RefreshCw size={14} />
                </button>
              </div>
            </div>
          </div>

          <div>
            <FieldLabel htmlFor="event-short-description">Short description</FieldLabel>
            <textarea
              id="event-short-description"
              name="shortDescription"
              rows={2}
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              className="input mt-2 resize-y"
              placeholder="A one-line summary for social sharing."
            />
            <p className="mt-1.5 text-xs text-slate-500">
              This will be the description that will appear when you share your event in social media.
            </p>
          </div>

          <div>
            <FieldLabel>Description</FieldLabel>
            <div className="mt-2 overflow-hidden rounded-lg border border-slate-700 bg-slate-950">
              <div className="flex border-b border-slate-800">
                <button
                  type="button"
                  onClick={() => setDescriptionTab('write')}
                  className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider transition ${
                    descriptionTab === 'write'
                      ? 'border-b-2 border-brand-400 text-white'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  Write
                </button>
                <button
                  type="button"
                  onClick={() => setDescriptionTab('preview')}
                  className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider transition ${
                    descriptionTab === 'preview'
                      ? 'border-b-2 border-brand-400 text-white'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  Preview
                </button>
              </div>
              <div className="p-3">
                {descriptionTab === 'write' ? (
                  <TournamentDescriptionEditor
                    id="event-description"
                    name=""
                    value={description}
                    onChange={setDescription}
                    uploadEnabled={imageUploadEnabled}
                    rows={8}
                    placeholder="Event schedule, rules, parking, prizes…"
                  />
                ) : (
                  <div className="min-h-[12rem] rounded-lg border border-slate-800 bg-slate-900/50 p-4">
                    {description.trim() ? (
                      <TournamentDescriptionContent content={description} />
                    ) : (
                      <p className="text-sm text-slate-500">Nothing to preview yet.</p>
                    )}
                  </div>
                )}
              </div>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-slate-500">
              We use Markdown for templating. For more information on what markdown is, you can visit{' '}
              <a
                href="http://commonmark.org/help"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-300 hover:text-brand-200"
              >
                http://commonmark.org/help
              </a>
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <FieldLabel htmlFor="event-starts-at">Starts at</FieldLabel>
              <div className="relative mt-2">
                <Calendar
                  size={15}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                />
                <input
                  id="event-starts-at"
                  name="startsAt"
                  type="datetime-local"
                  required
                  value={startsAt}
                  onChange={(e) => setStartsAt(e.target.value)}
                  className="input pl-9"
                />
              </div>
            </div>
            <div>
              <FieldLabel htmlFor="event-ends-at">Ends at</FieldLabel>
              <div className="relative mt-2">
                <Clock
                  size={15}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                />
                <input
                  id="event-ends-at"
                  name="endsAt"
                  type="datetime-local"
                  value={endsAt}
                  onChange={(e) => setEndsAt(e.target.value)}
                  className="input pl-9"
                />
              </div>
            </div>
          </div>

          <div>
            <FieldLabel htmlFor="event-timezone">Timezone</FieldLabel>
            <select
              id="event-timezone"
              name="timezone"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="select mt-2 w-full max-w-md"
            >
              {TIMEZONE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </FormSection>

        <FormSection title="Location">
          <div>
            <FieldLabel htmlFor="event-venue">Venue name or address</FieldLabel>
            <input
              id="event-venue"
              name="venueName"
              type="text"
              value={venueName}
              onChange={(e) => setVenueName(e.target.value)}
              disabled={isOnline}
              className="input mt-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Venue name"
            />
          </div>

          <div>
            <FieldLabel htmlFor="event-location">Enter a location</FieldLabel>
            <div className="relative mt-2">
              <MapPin
                size={15}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
              />
              <input
                id="event-location"
                name="location"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                disabled={isOnline}
                className="input pl-9 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Search for a venue or address"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
            <label className="inline-flex items-center gap-2 text-slate-300">
              <input
                type="checkbox"
                checked={manualAddress}
                onChange={(e) => setManualAddress(e.target.checked)}
                disabled={isOnline}
                className="rounded border-slate-600 bg-slate-900"
              />
              Input address manually
            </label>
            <label className="inline-flex items-center gap-2 text-slate-300">
              <input
                type="checkbox"
                name="isOnline"
                checked={isOnline}
                onChange={(e) => handleOnlineChange(e.target.checked)}
                className="rounded border-slate-600 bg-slate-900"
              />
              <Globe size={14} className="text-slate-500" />
              This is an online event
            </label>
            <button
              type="button"
              onClick={clearAddress}
              className="text-xs font-semibold text-brand-300 hover:text-brand-200"
            >
              Clear address
            </button>
          </div>

          {manualAddress && !isOnline && (
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <FieldLabel htmlFor="event-address-1">Address line 1</FieldLabel>
                <input
                  id="event-address-1"
                  name="addressLine1"
                  type="text"
                  value={addressLine1}
                  onChange={(e) => setAddressLine1(e.target.value)}
                  className="input mt-2"
                />
              </div>
              <div className="sm:col-span-2">
                <FieldLabel htmlFor="event-address-2">Address line 2</FieldLabel>
                <input
                  id="event-address-2"
                  name="addressLine2"
                  type="text"
                  value={addressLine2}
                  onChange={(e) => setAddressLine2(e.target.value)}
                  className="input mt-2"
                />
              </div>
              <div>
                <FieldLabel htmlFor="event-city">City</FieldLabel>
                <input
                  id="event-city"
                  name="city"
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="input mt-2"
                />
              </div>
              <div>
                <FieldLabel htmlFor="event-state">State / Province</FieldLabel>
                <input
                  id="event-state"
                  name="state"
                  type="text"
                  value={stateRegion}
                  onChange={(e) => setStateRegion(e.target.value)}
                  className="input mt-2"
                />
              </div>
              <div>
                <FieldLabel htmlFor="event-postal">Postal code</FieldLabel>
                <input
                  id="event-postal"
                  name="postalCode"
                  type="text"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  className="input mt-2"
                />
              </div>
              <div>
                <FieldLabel htmlFor="event-country">Country</FieldLabel>
                <input
                  id="event-country"
                  name="country"
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="input mt-2"
                />
              </div>
            </div>
          )}
        </FormSection>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Link href="/dashboard/your-events" className="btn-secondary text-center">
            Cancel
          </Link>
          <button type="submit" disabled={pending} className="btn-primary disabled:opacity-60">
            {pending ? 'Creating…' : 'Create event'}
          </button>
        </div>
      </form>
    </div>
  );
}
