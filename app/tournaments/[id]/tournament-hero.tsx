import Link from 'next/link';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Gamepad2,
  MapPin,
  Medal,
  Trophy,
  UserRound,
  Users,
} from 'lucide-react';
import { GAME_TYPE_LABELS } from '@/lib/tournament-options';
import { formatPlayerCapLabel } from '@/lib/tournament-registration';
import { formatEventTime } from '@/lib/tournament-schedule';
import { playerProfilePath } from '@/lib/player-profile';
import { TournamentHeroRegister } from './tournament-hero-register';

const FORMAT_LABELS: Record<string, string> = {
  single_elimination: 'Single Elimination',
  double_elimination: 'Double Elimination',
  swiss: 'Swiss Format',
  round_robin: 'Round Robin',
};

function statusChipClass(status: string) {
  if (status === 'open') return 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300';
  if (status === 'active') return 'border-brand-500/40 bg-brand-500/10 text-brand-300';
  return 'border-slate-700 bg-slate-800/60 text-slate-400';
}

function statusLabel(status: string) {
  if (status === 'open') return 'Open';
  if (status === 'active') return 'In progress';
  if (status === 'complete') return 'Complete';
  return status.charAt(0).toUpperCase() + status.slice(1);
}

type Props = {
  name: string;
  status: string;
  format: string;
  gameType: string;
  isRanked: boolean;
  date: Date;
  location: string | null;
  checkInTime: string | null;
  eventStartTime: string | null;
  participantCount: number;
  playerCap: number | null;
  entryFee: string | null;
  prizePool: string | null;
  tournamentId: string;
  organizerUsername: string | null;
  isLoggedIn: boolean;
  isJoined: boolean;
  isAdmin: boolean;
};

export function TournamentHero({
  name,
  status,
  format,
  gameType,
  isRanked,
  date,
  location,
  checkInTime,
  eventStartTime,
  participantCount,
  playerCap,
  entryFee,
  prizePool,
  tournamentId,
  organizerUsername,
  isLoggedIn,
  isJoined,
  isAdmin,
}: Props) {
  const dateLabel = date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
  const checkIn = formatEventTime(checkInTime);
  const eventStart = formatEventTime(eventStartTime);
  const playersLabel = formatPlayerCapLabel(participantCount, playerCap);

  const facts: Array<{
    icon: typeof Calendar;
    label: string;
    value: string;
    href?: string;
  }> = [
    { icon: Calendar, label: 'Date', value: dateLabel },
    ...(location ? [{ icon: MapPin, label: 'Location', value: location }] : []),
    ...(organizerUsername
      ? [
          {
            icon: UserRound,
            label: 'Organizer',
            value: organizerUsername,
            href: playerProfilePath(organizerUsername),
          },
        ]
      : [{ icon: UserRound, label: 'Organizer', value: 'UGNCBBX' }]),
    ...(checkIn ? [{ icon: Clock, label: 'Check-in open', value: checkIn }] : []),
    ...(eventStart ? [{ icon: Clock, label: 'Event start', value: eventStart }] : []),
    { icon: Users, label: 'Players', value: playersLabel },
    ...(entryFee ? [{ icon: Trophy, label: 'Entry', value: entryFee }] : []),
    ...(prizePool ? [{ icon: Medal, label: 'Prizes', value: prizePool }] : []),
  ];

  return (
    <section className="relative overflow-hidden border-b border-slate-800 bg-slate-950">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_55%_at_50%_-15%,rgba(34,197,94,0.14),transparent)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-500/40 to-transparent" />

      <div className="container relative py-8 sm:py-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <Link
            href="/tournaments"
            className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-slate-400 transition hover:text-brand-300"
          >
            <ArrowLeft size={16} />
            Back to tournaments
          </Link>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${statusChipClass(status)}`}
          >
            {status === 'active' && (
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-400" aria-hidden />
            )}
            {statusLabel(status)}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-900/80 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-300">
            <Trophy size={12} className="text-slate-500" />
            {FORMAT_LABELS[format] ?? format}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-900/80 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-300">
            <Gamepad2 size={12} className="text-slate-500" />
            {GAME_TYPE_LABELS[gameType] ?? gameType}
          </span>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${
              isRanked
                ? 'border-brand-500/35 bg-brand-500/10 text-brand-200'
                : 'border-slate-700 bg-slate-900/80 text-slate-400'
            }`}
          >
            <Medal size={12} className={isRanked ? 'text-brand-400' : 'text-slate-500'} />
            {isRanked ? 'Ranked' : 'Unranked'}
          </span>
        </div>

        <h1 className="mt-5 max-w-4xl text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          {name}
        </h1>

        <TournamentHeroRegister
          tournamentId={tournamentId}
          status={status}
          isLoggedIn={isLoggedIn}
          isJoined={isJoined}
          isAdmin={isAdmin}
          participantCount={participantCount}
          playerCap={playerCap}
          isRanked={isRanked}
        />

        <dl className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {facts.map(({ icon: Icon, label, value, href }) => (
            <div
              key={label}
              className="flex items-start gap-3 rounded-xl border border-slate-800/90 bg-slate-900/50 px-4 py-3.5 backdrop-blur-sm"
            >
              <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-700 bg-slate-950 text-slate-400">
                <Icon size={16} />
              </span>
              <div className="min-w-0">
                <dt className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                  {label}
                </dt>
                <dd className="mt-1 text-sm font-semibold leading-snug text-white">
                  {href ? (
                    <Link href={href} className="transition hover:text-brand-300">
                      {value}
                    </Link>
                  ) : (
                    value
                  )}
                </dd>
              </div>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
