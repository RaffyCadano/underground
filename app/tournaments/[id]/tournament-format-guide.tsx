import { CircleHelp } from 'lucide-react';
import { parseGrandFinalsModifier } from '@/lib/tournament-options';

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
  groupStageEnabled?: boolean;
  phase?: string | null;
  grandFinalsModifier?: string;
  groupSize?: number;
  advancePerGroup?: number;
};

function grandFinalRule(modifier: string): string {
  switch (parseGrandFinalsModifier(modifier)) {
    case 'single_match':
      return 'Grand final: one match between the winners and losers bracket champions decides the title.';
    case 'skip':
      return 'Grand final: skipped — the winners bracket champion is crowned when the losers bracket finishes.';
    default:
      return 'Grand final: winners champ vs losers survivor. If the losers player wins, a bracket reset match decides the title.';
  }
}

function getFormatRules(
  format: string,
  opts?: { groupStageEnabled?: boolean; advancePerGroup?: number; grandFinalsModifier?: string },
): string[] {
  switch (format) {
    case 'double_elimination': {
      const rules = [
        'Winners bracket: one loss sends you to the losers bracket.',
        'Losers bracket: a second loss eliminates you.',
        grandFinalRule(opts?.grandFinalsModifier ?? 'default'),
        'Your next match: find your name on the bracket — pending games with both players set are ready to play (blue left edge). TBD means waiting on another result.',
        'Use Bracket tabs: Full Bracket, Winners Bracket, or Losers Bracket to focus the view. Standings shows wins, losses, and bracket status.',
      ];
      if (opts?.groupStageEnabled) {
        const adv = opts.advancePerGroup ?? 2;
        rules.unshift(
          `Group stage: round robin in groups of ${opts.groupSize ?? 4}. Top ${adv} per group advance to double elimination playoffs.`,
        );
      }
      return rules;
    }
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

type Step = { step: string; title: string; body: string };

function getSteps(
  format: string,
  status: string,
  hasBracket: boolean,
  isAdmin: boolean,
  opts?: {
    groupStageEnabled?: boolean;
    phase?: string | null;
    advancePerGroup?: number;
  },
): Step[] {
  const isDe = format === 'double_elimination';
  const hasGroupStage = isDe && opts?.groupStageEnabled;
  const phase = opts?.phase;
  const generateLabel = hasGroupStage ? 'Start group stage' : 'Generate bracket';

  if (!hasBracket && status === 'open') {
    const steps: Step[] = [
      {
        step: '1',
        title: isAdmin ? 'Add players' : 'Register',
        body: isAdmin
          ? 'Search and select players to add — you can pick several at once.'
          : 'Sign in and hit “Register for this tournament” in the sidebar.',
      },
      {
        step: '2',
        title: hasGroupStage ? 'Start group stage' : 'Generate bracket',
        body: isAdmin
          ? hasGroupStage
            ? `Click “${generateLabel}” to assign round robin groups and open match reporting.`
            : 'When registration is ready, click “Generate bracket” to seed the double elimination tree.'
          : hasGroupStage
            ? 'Wait for an admin to start the group stage.'
            : 'Wait for an admin to close registration and start the bracket.',
      },
    ];

    if (hasGroupStage) {
      steps.push({
        step: '3',
        title: 'Complete groups, then playoffs',
        body: `Play every group match on the Group Stage tab. Top ${opts?.advancePerGroup ?? 2} per group advance — admin starts playoffs when groups finish.`,
      });
    } else {
      steps.push({
        step: '3',
        title: 'Play & report',
        body: 'Click your match on the bracket to enter scores. Winners and losers advance automatically.',
      });
    }
    return steps;
  }

  if (hasGroupStage && phase === 'group' && status === 'active') {
    return [
      {
        step: '1',
        title: 'Group stage is live',
        body: 'Open the Group Stage tab. Each group plays round robin — report every match until all group games are done.',
      },
      {
        step: '2',
        title: 'Find your match',
        body: 'Matches with a Report button are ready. Both players must be listed — not TBD.',
      },
      {
        step: '3',
        title: 'Start playoffs',
        body: isAdmin
          ? `When all group matches are complete, click “Start playoffs” to seed the top ${opts?.advancePerGroup ?? 2} per group into double elimination.`
          : `After groups finish, the admin starts playoffs and the Bracket tab opens for the elimination stage.`,
      },
    ];
  }

  if (hasBracket && status === 'active') {
    const steps: Step[] = [
      {
        step: '1',
        title: 'Find your next match',
        body: isDe
          ? 'Open the Bracket tab (Full, Winners, or Losers). Your next game is the leftmost pending match with your name and a real opponent — look for the blue left edge.'
          : 'Check the bracket below or “Report match result” in the sidebar for pending games.',
      },
      {
        step: '2',
        title: 'Enter the score',
        body: 'Click the match and use Beyblade X set scores (e.g. 3-1). The winner advances; in double elim, the loser drops to the correct bracket slot.',
      },
      {
        step: '3',
        title: 'Track progress',
        body:
          format === 'swiss' || format === 'round_robin'
            ? 'Finish every match in the round before the admin generates the next one.'
            : isDe
              ? 'Check Standings for wins, losses, and status (Winners Bracket, Losers Bracket, Grand Final). Work through both brackets until a champion is crowned.'
              : 'Work through the bracket until a champion is crowned.',
      },
    ];
    return steps;
  }

  return [
    {
      step: '1',
      title: 'Tournament complete',
      body: isDe
        ? 'All matches are finished. Check the Bracket tab for the final tree and the Standings tab for placements and status.'
        : 'All matches are finished. Check the bracket for final placements.',
    },
    {
      step: '2',
      title: 'Rankings updated',
      body: 'Winners earned rank points (+50 per match win). See where everyone landed on the circuit leaderboard.',
    },
  ];
}

function getStatusLine(
  format: string,
  hasBracket: boolean,
  status: string,
  opts?: { groupStageEnabled?: boolean; phase?: string | null },
): string {
  const label = FORMAT_LABELS[format] ?? format;
  if (!hasBracket && status === 'open') return `${label} — registration open.`;
  if (status === 'complete') return `${label} — tournament complete.`;
  if (opts?.groupStageEnabled && opts.phase === 'group') return `${label} — group stage is live.`;
  if (opts?.groupStageEnabled && opts.phase === 'playoffs') {
    return `${label} — playoffs (double elimination).`;
  }
  if (hasBracket) return `${label} — bracket is live.`;
  return `${label} — registration open.`;
}

export function TournamentFormatGuide({
  format,
  status,
  hasBracket,
  isAdmin,
  groupStageEnabled = false,
  phase = null,
  grandFinalsModifier = 'default',
  groupSize = 4,
  advancePerGroup = 2,
}: Props) {
  const formatLabel = FORMAT_LABELS[format] ?? format;
  const opts = { groupStageEnabled, phase, advancePerGroup, grandFinalsModifier, groupSize };
  const steps = getSteps(format, status, hasBracket, isAdmin, opts);
  const rules = getFormatRules(format, opts);
  const defaultOpen = !hasBracket || status === 'open' || status === 'active';

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
            <span className="font-semibold text-white">{getStatusLine(format, hasBracket, status, opts)}</span>
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
