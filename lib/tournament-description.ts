import { formatUsdDisplay } from '@/lib/money';

const FORMAT_LABELS: Record<string, string> = {
  single_elimination: 'single elimination',
  double_elimination: 'double elimination',
  swiss: 'Swiss',
  round_robin: 'round robin',
};

const FORMAT_DETAILS: Record<string, string[]> = {
  single_elimination: [
    'One loss ends your run — every match counts on the road to the title.',
    'High-stakes bracket play where only the last blader standing takes the crown.',
    'Classic bracket format: win and advance, lose and go home.',
  ],
  double_elimination: [
    'Winners and losers brackets mean everyone gets a second chance before elimination.',
    'Fight through both brackets for a shot at the grand final and the UGNCBBX title.',
    'Double elimination action — drop a match early and battle back through the losers side.',
  ],
  swiss: [
    'Swiss rounds pair you with opponents at your level as the event unfolds.',
    'Multiple rounds of Swiss pairings — climb the standings with every win.',
    'Swiss format: no early elimination, just consistent competition across the day.',
  ],
  round_robin: [
    'Round robin means you face everyone in the pool — every match shapes the final standings.',
    'Play the full field in round robin format and let your record do the talking.',
    'Everyone meets everyone — pure round robin competition from first spin to last.',
  ],
};

function formatEventDate(dateStr: string) {
  if (!dateStr) return null;
  const date = new Date(`${dateStr}T12:00:00`);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function pickVariant<T>(items: T[], seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash + seed.charCodeAt(i) * (i + 1)) % items.length;
  }
  return items[hash] ?? items[0];
}

import { formatScheduleLine } from '@/lib/tournament-schedule';

export function generateTournamentDescription(input: {
  name: string;
  date: string;
  location: string;
  checkInTime?: string;
  eventStartTime?: string;
  format: string;
  entryFee?: string;
  prizePool?: string;
  playerCap?: string;
  isRanked?: boolean;
  gameType?: string;
}) {
  const name = input.name.trim() || 'UGNCBBX tournament';
  const location = input.location.trim();
  const format = input.format || 'single_elimination';
  const formatLabel = FORMAT_LABELS[format] ?? 'tournament';
  const formattedDate = formatEventDate(input.date);
  const detail = pickVariant(FORMAT_DETAILS[format] ?? FORMAT_DETAILS.single_elimination, name + format);
  const entryFee = input.entryFee?.trim();
  const prizePool = input.prizePool?.trim();
  const playerCap = input.playerCap?.trim();
  const gameLabel =
    input.gameType === 'beyblade_x_3on3'
      ? 'Beyblade X 3v3'
      : input.gameType === 'beyblade_burst'
        ? 'Beyblade Burst'
        : input.gameType === 'custom'
          ? 'custom rules'
          : 'Beyblade X';

  const opener = location
    ? `${name} hits ${location}`
    : `${name} is coming to the UGNCBBX circuit`;

  const when = formattedDate ? ` on ${formattedDate}` : '';
  const rankedNote =
    input.isRanked === false
      ? ' This is an unranked event — play for fun and prizes, not rank points.'
      : ' Register now, bring your best combos, and fight for rank points on the circuit.';

  const extras: string[] = [];
  const checkIn = formatScheduleLine('Check-In Open', input.checkInTime);
  const eventStart = formatScheduleLine('Event Start', input.eventStartTime);
  if (checkIn) extras.push(`${checkIn}.`);
  if (eventStart) extras.push(`${eventStart}.`);
  if (entryFee) extras.push(`Entry: ${formatUsdDisplay(entryFee)}.`);
  if (prizePool) extras.push(`Prizes: ${formatUsdDisplay(prizePool)}.`);
  if (playerCap) extras.push(`Limited to ${playerCap} players.`);

  const extrasText = extras.length > 0 ? ` ${extras.join(' ')}` : '';

  return `${opener}${when}. This ${formatLabel} ${gameLabel} event brings bladers together for bracket day competition. ${detail}${extrasText}${rankedNote}`;
}
