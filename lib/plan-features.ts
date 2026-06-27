import {
  CalendarDays,
  Trophy,
  UsersRound,
  type LucideIcon,
} from 'lucide-react';
import { SITE_NAME } from '@/lib/site';

/** `true` = included (checkmark). `false` = not available. `string` = plan-specific text. */
export type PlanFeatureCell = boolean | string;

export type PlanFeatureRow = {
  feature: string;
  description: string;
  standard: PlanFeatureCell;
  premier: PlanFeatureCell;
};

export type PlanFeatureCategory = {
  id: string;
  label: string;
  icon: LucideIcon;
  rows: PlanFeatureRow[];
};

export const HOSTED_TOURNAMENTS_FEATURE = 'Hosted Tournaments';

export function standardHostedTournamentsLabel(limit: number): string {
  return `Up to ${limit}`;
}

export const PLAN_FEATURE_CATEGORIES: PlanFeatureCategory[] = [
  {
    id: 'tournaments',
    label: 'Tournaments',
    icon: Trophy,
    rows: [
      {
        feature: 'Host Dedicated Tournament Page',
        description: `Promote a dedicated tournament page with brackets, participants, standings, schedule details, registration, and more — all on ${SITE_NAME}.`,
        standard: 'Yes (with display ads)',
        premier: 'Yes (no ads)',
      },
      {
        feature: 'Single Elimination',
        description: 'Classic knockout bracket — one loss ends a player\'s run and winners advance round by round.',
        standard: true,
        premier: true,
      },
      {
        feature: 'Double Elimination',
        description: 'Winners and losers brackets so every player gets a second chance before elimination.',
        standard: true,
        premier: true,
      },
      {
        feature: 'Round Robin',
        description: 'Every participant plays everyone else in the pool; standings rank final placements.',
        standard: true,
        premier: true,
      },
      {
        feature: 'Swiss',
        description: 'Players are re-paired each round by record so matchups stay competitive throughout the event.',
        standard: true,
        premier: true,
      },
      {
        feature: 'Two-Stage (Group Stage + Playoffs)',
        description: 'Run a group stage first, then advance top players into a playoff bracket for the finals.',
        standard: true,
        premier: true,
      },
      {
        feature: 'Standings',
        description: 'Live standings show wins, losses, Swiss points, and bracket status as results come in.',
        standard: true,
        premier: true,
      },
      {
        feature: 'Score Reporting',
        description: 'Players and hosts report match scores; results update the bracket and standings automatically.',
        standard: true,
        premier: true,
      },
      {
        feature: 'Embed Brackets',
        description: `Embed a live bracket on your own site with an iframe — includes ${SITE_NAME} branding and optional display ads on Standard.`,
        standard: `Yes (with display ads + ${SITE_NAME} branding)`,
        premier: `Yes (no ads + ${SITE_NAME} branding)`,
      },
      {
        feature: 'Print Brackets',
        description: 'Print a clean bracket layout from the tournament page for posting at your venue.',
        standard: true,
        premier: true,
      },
      {
        feature: HOSTED_TOURNAMENTS_FEATURE,
        description: 'How many tournaments you can create and host on your account at once.',
        standard: standardHostedTournamentsLabel(3),
        premier: 'Unlimited',
      },
      {
        feature: 'Ranked Tournaments',
        description: `Ranked events award ${SITE_NAME} rank points for wins; unranked events are casual with no point changes.`,
        standard: false,
        premier: true,
      },
      {
        feature: 'Player Cap',
        description: 'Set the maximum number of players who can register before the bracket is generated.',
        standard: 'Up to 256',
        premier: 'Unlimited',
      },
      {
        feature: 'Add Participants in Bulk',
        description: 'Search and multi-select registered players to add several participants at once.',
        standard: true,
        premier: true,
      },
      {
        feature: 'Add Walk-in Players',
        description: 'Add walk-ins with a custom display name when someone shows up without a site account.',
        standard: true,
        premier: true,
      },
      {
        feature: 'Open Registration Page',
        description: 'Players sign in and register themselves while the tournament is open — no manual entry required.',
        standard: true,
        premier: true,
      },
      {
        feature: 'Schedule Check-in & Start Times',
        description: 'Show check-in and event start times on the public tournament page so players know when to arrive.',
        standard: true,
        premier: true,
      },
      {
        feature: 'Entry Fee & Prize Pool Labels',
        description: 'Display entry fee and prize pool details on the tournament page for players and spectators.',
        standard: true,
        premier: true,
      },
      {
        feature: 'Private Messaging',
        description: 'Send direct messages to other players from profiles or your inbox.',
        standard: true,
        premier: true,
      },
      {
        feature: 'Block Users in Messages',
        description: 'Block accounts from messaging you — useful for moderation and personal safety.',
        standard: true,
        premier: true,
      },
    ],
  },
  {
    id: 'events',
    label: 'Events',
    icon: CalendarDays,
    rows: [
      {
        feature: 'Host Dedicated Event Page',
        description: `Publish a dedicated event page with title, description, date, and location — shareable on ${SITE_NAME}.`,
        standard: 'Yes (with display ads)',
        premier: 'Yes (no ads)',
      },
      {
        feature: 'Date, Location & Timezone',
        description: 'Set start and end times, venue or online details, and the timezone shown to attendees.',
        standard: true,
        premier: true,
      },
      {
        feature: 'Public Event Permalink',
        description: 'Every event gets a stable public URL you can share in flyers, Discord, or social posts.',
        standard: true,
        premier: true,
      },
    ],
  },
  {
    id: 'communities',
    label: 'Communities',
    icon: UsersRound,
    rows: [
      {
        feature: 'Club Listings on Teams Page',
        description: `List your club on the public ${SITE_NAME} teams page with region, tagline, captain, and activity stats.`,
        standard: 'Yes (with display ads)',
        premier: 'Yes (no ads)',
      },
      {
        feature: 'Submit Club Listing Request',
        description: 'Request a new club listing for review — get your crew visible on the teams directory.',
        standard: true,
        premier: true,
      },
    ],
  },
];

export function planFeatureCategoriesWithHostedLimit(
  standardMaxHosted: number,
): PlanFeatureCategory[] {
  const label = standardHostedTournamentsLabel(standardMaxHosted);
  return PLAN_FEATURE_CATEGORIES.map((category) => ({
    ...category,
    rows: category.rows.map((row) =>
      row.feature === HOSTED_TOURNAMENTS_FEATURE ? { ...row, standard: label } : row,
    ),
  }));
}
