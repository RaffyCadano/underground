import { CircleHelp } from 'lucide-react';

const FORMAT_LABELS: Record<string, string> = {
  single_elimination: 'Single Elimination',
  double_elimination: 'Double Elimination',
  swiss: 'Swiss Format',
  round_robin: 'Round Robin',
};

type Props = {
  format: string;
  status: string;
  hasBracket: boolean;
  isAdmin: boolean;
};

function getFormatRules(format: string): string[] {
  switch (format) {
    case 'double_elimination':
      return [
        'Winners bracket: one loss sends you to the losers bracket.',
        'Losers bracket: a second loss eliminates you.',
        'Grand final: winners champ vs losers survivor — bracket reset if the losers player wins.',
      ];
    case 'swiss':
    case 'round_robin':
      return [
        'Each round pairs players with similar win records.',
        'You may face different opponents every round.',
        'Standings are based on total wins across all rounds.',
      ];
    default:
      return [
        'Win and you advance to the next round.',
        'Lose once and you are eliminated.',
        'Odd player counts get BYEs in round one.',
      ];
  }
}

function getSteps(format: string, status: string, hasBracket: boolean, isAdmin: boolean) {
  if (!hasBracket && status === 'open') {
    return [
      {
        step: '1',
        title: isAdmin ? 'Add players' : 'Register',
        body: isAdmin
          ? 'Search and select players to add — you can pick several at once.'
          : 'Sign in and hit “Register for this tournament” in the sidebar.',
      },
      {
        step: '2',
        title: 'Generate bracket',
        body: isAdmin
          ? 'When registration is full, click “Generate bracket” to seed the event.'
          : 'Wait for an admin to close registration and start the bracket.',
      },
      {
        step: '3',
        title: 'Play & report',
        body: 'Enter match scores as games finish. Winners advance automatically.',
      },
    ];
  }

  if (hasBracket && status === 'active') {
    return [
      {
        step: '1',
        title: 'Find your match',
        body: 'Check the bracket below or “Report match result” in the sidebar for pending games.',
      },
      {
        step: '2',
        title: 'Enter the score',
        body: 'Use Beyblade X set scores (e.g. 3-1). The winner is advanced in the bracket.',
      },
      {
        step: '3',
        title: 'Keep playing',
        body:
          format === 'swiss' || format === 'round_robin'
            ? 'Finish every match in the round before the admin generates the next one.'
            : 'Work through the bracket until a champion is crowned.',
      },
    ];
  }

  return [
    {
      step: '1',
      title: 'Tournament complete',
      body: 'All matches are finished. Check the bracket for final placements.',
    },
    {
      step: '2',
      title: 'Rankings updated',
      body: 'Winners earned rank points. See where everyone landed on the circuit leaderboard.',
    },
  ];
}

export function TournamentFormatGuide({ format, status, hasBracket, isAdmin }: Props) {
  const formatLabel = FORMAT_LABELS[format] ?? format;
  const steps = getSteps(format, status, hasBracket, isAdmin);
  const rules = getFormatRules(format);
  const defaultOpen = !hasBracket || status === 'open';

  return (
    <div className="card p-5">
      <details className="group" open={defaultOpen}>
        <summary className="flex cursor-pointer list-none items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 marker:content-none [&::-webkit-details-marker]:hidden">
          <CircleHelp size={14} className="shrink-0 text-brand-400" />
          How this works
          <span className="ml-auto text-[10px] font-normal normal-case tracking-normal text-slate-500 group-open:hidden">
            Show
          </span>
        </summary>

        <div className="mt-4 space-y-4">
          <p className="text-sm text-slate-300">
            <span className="font-semibold text-white">{formatLabel}</span>
            {hasBracket ? ' — bracket is live.' : ' — registration open.'}
          </p>

          <ol className="space-y-3">
            {steps.map(({ step, title, body }) => (
              <li key={step} className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-800 text-[11px] font-bold text-brand-300">
                  {step}
                </span>
                <div className="min-w-0 pt-0.5">
                  <p className="text-sm font-semibold text-white">{title}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-slate-400">{body}</p>
                </div>
              </li>
            ))}
          </ol>

          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              {formatLabel} rules
            </p>
            <ul className="mt-2 space-y-1.5">
              {rules.map((rule) => (
                <li key={rule} className="flex gap-2 text-xs leading-relaxed text-slate-400">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-brand-500/80" />
                  {rule}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </details>
    </div>
  );
}
