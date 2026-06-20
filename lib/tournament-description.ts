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
    'Fight through both brackets for a shot at the grand final and the Underground title.',
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

export function generateTournamentDescription(input: {
  name: string;
  date: string;
  location: string;
  format: string;
}) {
  const name = input.name.trim() || 'Underground tournament';
  const location = input.location.trim();
  const format = input.format || 'single_elimination';
  const formatLabel = FORMAT_LABELS[format] ?? 'tournament';
  const formattedDate = formatEventDate(input.date);
  const detail = pickVariant(FORMAT_DETAILS[format] ?? FORMAT_DETAILS.single_elimination, name + format);

  const opener = location
    ? `${name} hits ${location}`
    : `${name} is coming to the Underground circuit`;

  const when = formattedDate ? ` on ${formattedDate}` : '';

  return `${opener}${when}. This ${formatLabel} event brings Beyblade X bladers together for bracket day competition. ${detail} Register now, bring your best combos, and fight for rank points on the circuit.`;
}
