import Link from 'next/link';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Gamepad2,
  MapPin,
  Medal,
  Pencil,
  Trophy,
  UserRound,
  Users,
} from 'lucide-react';
import { GAME_TYPE_LABELS } from '@/lib/tournament-options';
import { formatPlayerCapLabel } from '@/lib/tournament-registration';
import { formatEventTime } from '@/lib/tournament-schedule';
import { formatUsdDisplay } from '@/lib/money';
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
  const dateLong = date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
  const dateShort = date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
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
    valueShort?: string;
    wide?: boolean;
    href?: string;
  }> = [
    { icon: Calendar, label: 'Date', value: dateLong, valueShort: dateShort, wide: true },
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
    ...(entryFee ? [{ icon: Trophy, label: 'Entry', value: formatUsdDisplay(entryFee) }] : []),
    ...(prizePool ? [{ icon: Medal, label: 'Prizes', value: formatUsdDisplay(prizePool) }] : []),
  ];

  return (
    <section className="relative overflow-hidden border-b border-slate-800 bg-slate-950 !py-0">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_55%_at_50%_-15%,rgba(34,197,94,0.14),transparent)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-500/40 to-transparent" />

      <div className="container relative py-6 sm:py-8 lg:py-10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/tournaments"
            className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-slate-400 transition hover:text-brand-300"
          >
            <ArrowLeft size={16} className="shrink-0" />
            Back to tournaments
          </Link>
          {isAdmin && (
            <Link
              href={`/dashboard/tournaments/${tournamentId}/edit`}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-900/80 px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-brand-500/40 hover:bg-slate-900 hover:text-white sm:w-auto sm:justify-start"
            >
              <Pencil size={15} className="shrink-0" />
              Edit tournament
            </Link>
          )}
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

        <h1 className="mt-5 max-w-4xl break-words text-2xl font-semibold tracking-tight text-white text-balance sm:text-3xl lg:text-4xl">
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

        <dl className="mt-6 grid grid-cols-2 gap-2 sm:mt-8 sm:gap-3 md:grid-cols-3 lg:grid-cols-4">
          {facts.map(({ icon: Icon, label, value, valueShort, wide, href }) => (
            <div
              key={label}
              className={`flex min-w-0 items-start gap-2.5 rounded-xl border border-slate-800/90 bg-slate-900/50 px-3 py-3 backdrop-blur-sm sm:gap-3 sm:px-4 sm:py-3.5 ${
                wide ? 'col-span-2 md:col-span-1' : ''
              }`}
            >
              <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-700 bg-slate-950 text-slate-400 sm:h-9 sm:w-9">
                <Icon size={16} />
              </span>
              <div className="min-w-0 flex-1">
                <dt className="text-[9px] font-bold uppercase tracking-[0.16em] text-slate-500 sm:text-[10px] sm:tracking-[0.18em]">
                  {label}
                </dt>
                <dd className="mt-0.5 text-xs font-semibold leading-snug text-white sm:mt-1 sm:text-sm">
                  {href ? (
                    <Link href={href} className="block truncate transition hover:text-brand-300 sm:whitespace-normal">
                      {value}
                    </Link>
                  ) : valueShort ? (
                    <>
                      <span className="sm:hidden">{valueShort}</span>
                      <span className="hidden sm:inline">{value}</span>
                    </>
                  ) : (
                    <span className="block break-words">{value}</span>
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
