import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Calendar, Globe, MapPin, UserRound } from 'lucide-react';
import { TournamentDescriptionContent } from '@/app/components/tournament-description-content';
import { timezoneLabel } from '@/lib/profile-settings-options';
import { prisma } from '@/lib/prisma';
import { playerProfilePath } from '@/lib/player-profile';
import { SITE_NAME } from '@/lib/site';

function formatEventDateTime(date: Date, timezone: string) {
  return date.toLocaleString('en-US', {
    weekday: 'short',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: timezone,
  });
}

function formatLocation(event: {
  isOnline: boolean;
  venueName: string | null;
  location: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  country: string | null;
}) {
  if (event.isOnline) return 'Online event';

  const parts = [
    event.venueName,
    event.location,
    event.addressLine1,
    event.addressLine2,
    [event.city, event.state].filter(Boolean).join(', '),
    event.postalCode,
    event.country,
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(' · ') : 'Location TBD';
}

export default async function EventPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const event = await prisma.event.findUnique({
    where: { slug: slug.toUpperCase() },
    include: {
      host: { select: { username: true } },
    },
  });

  if (!event) notFound();

  const locationLabel = formatLocation(event);

  return (
    <section className="container py-10 lg:py-14">
      <div className="mx-auto max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-400">{SITE_NAME} Event</p>
        <h1 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">{event.title}</h1>

        {event.shortDescription && (
          <p className="mt-3 text-base leading-relaxed text-slate-300">{event.shortDescription}</p>
        )}

        <div className="mt-6 flex flex-wrap gap-4 text-sm text-slate-400">
          <span className="inline-flex items-center gap-2">
            <Calendar size={15} className="text-slate-500" />
            {formatEventDateTime(event.startsAt, event.timezone)}
            {event.endsAt && (
              <>
                <span className="text-slate-600">→</span>
                {formatEventDateTime(event.endsAt, event.timezone)}
              </>
            )}
          </span>
          <span className="inline-flex items-center gap-2">
            {event.isOnline ? <Globe size={15} className="text-slate-500" /> : <MapPin size={15} className="text-slate-500" />}
            {locationLabel}
          </span>
          <span className="inline-flex items-center gap-2">
            <UserRound size={15} className="text-slate-500" />
            Hosted by{' '}
            <Link href={playerProfilePath(event.host.username)} className="font-medium text-brand-300 hover:text-brand-200">
              {event.host.username}
            </Link>
          </span>
        </div>

        <p className="mt-2 text-xs text-slate-500">{timezoneLabel(event.timezone)}</p>

        {event.description?.trim() && (
          <div className="prose-invert mt-8 rounded-2xl border border-slate-800 bg-slate-950/60 p-6">
            <TournamentDescriptionContent content={event.description} />
          </div>
        )}

        <div className="mt-8">
          <Link href="/dashboard/your-events" className="text-sm font-semibold text-brand-300 hover:text-brand-200">
            ← Back to your events
          </Link>
        </div>
      </div>
    </section>
  );
}
