import type { LucideIcon } from 'lucide-react';
import { Layers, RefreshCw, Trophy, Users } from 'lucide-react';
import { SITE_NAME } from '@/lib/site';

export type BracketFormatGuide = {
  id: string;
  label: string;
  tag: string;
  icon: LucideIcon;
  summary: string;
  bestFor: string;
  generation: string[];
  duringEvent: string[];
  standings: string;
};

export const BRACKET_FORMAT_GUIDES: BracketFormatGuide[] = [
  {
    id: 'single_elimination',
    label: 'Single Elimination',
    tag: 'Classic knockout',
    icon: Trophy,
    summary:
      'A straight knockout tree. Win and you move forward; lose once and you are out. Fast, simple, and great for one-day events.',
    bestFor: 'Locals, shop battles, and any event where you want a clear champion quickly.',
    generation: [
      `${SITE_NAME} counts registered players and builds a bracket sized to the next power of two (4, 8, 16, 32, …).`,
      'Players are ordered by seed (if set), then registration order. Round-one slots are filled left to right.',
      'If the field is not a perfect power of two, empty slots become byes — those players auto-advance without playing.',
      'Every match in later rounds is created up front. As you report scores, winners are placed into the correct next-round slot automatically.',
      'When the final match is completed, the tournament is marked complete.',
      'If enabled, semifinal losers are paired in a separate 3rd place match (shown beside the final).',
    ],
    duringEvent: [
      'Find your name on the bracket — matches with both players assigned are ready to play.',
      'TBD means the bracket is waiting on a result from an earlier round.',
      'Byes from round one may already show as completed wins before you play your first match.',
    ],
    standings:
      'Placement follows the bracket tree — champion, finalist, semi-finalists, and so on. Circuit rank points apply when the event is ranked.',
  },
  {
    id: 'double_elimination',
    label: 'Double Elimination',
    tag: 'Second chance',
    icon: Layers,
    summary:
      'Two parallel brackets: winners and losers. Your first loss drops you to the losers side; a second loss eliminates you. The winners and losers champions meet in grand finals.',
    bestFor: 'Longer events where players want a safety net after one bad round.',
    generation: [
      'The winners bracket is built like single elimination — same seeding, byes, and power-of-two sizing.',
      'A full losers bracket is generated with drop-in slots wired to each winners-bracket loss.',
      'Grand finals links the winners champion and the last player standing in losers.',
      'Organizers can choose grand-finals rules: default bracket reset, a single deciding match, or skip grand finals (winners champ crowned when losers ends).',
      'Optional: split losers bracket so half the playoff field starts in losers (advanced setting).',
    ],
    duringEvent: [
      'Use Bracket tabs — Full, Winners, or Losers — to focus the view.',
      'A loss in winners sends you to a specific losers match; follow the tree to see your next game.',
      'Losers bracket matches must finish before grand finals can begin.',
    ],
    standings:
      'Standings show wins, losses, and which bracket each player is in. Final placement is decided by grand-finals results (or winners-bracket finish if grand finals are skipped).',
  },
  {
    id: 'swiss',
    label: 'Swiss',
    tag: 'Fair pairings',
    icon: Users,
    summary:
      'Everyone plays every scheduled round — no early elimination. Each new round pairs players with similar records so standings stay competitive.',
    bestFor: 'Leagues, preliminaries, and events where every blader should get multiple matches.',
    generation: [
      'Swiss does not build the whole event at once. Round 1 is generated when the organizer starts the bracket.',
      'Players are sorted by Swiss points (everyone starts at 0), then by circuit rank as a tiebreaker.',
      'The system pairs neighbors in that list, avoiding rematches when possible. Odd player out may receive a bye.',
      'After each round, all matches must be reported before the organizer can generate the next round.',
      'Point values (match win, tie, game win, bye, etc.) are set by the organizer when creating the event.',
    ],
    duringEvent: [
      'Check Standings for your record and Swiss points after each round.',
      'New pairings appear only after the organizer generates the next round — not automatically.',
      'You may face different opponents every round; rematches are avoided when the pairing algorithm allows.',
    ],
    standings:
      'Ranked by total Swiss points, then match wins, then circuit rating. Top finishers can be used for prizes or seeding a follow-up playoff.',
  },
  {
    id: 'round_robin',
    label: 'Round Robin',
    tag: 'Everyone plays everyone',
    icon: RefreshCw,
    summary:
      'Every participant faces every other participant exactly once. No bracket tree — the full schedule is generated at once and final order comes from standings.',
    bestFor: 'Small pools, group stages, and events where total record matters more than a knockout path.',
    generation: [
      'All pairings are created in one pass: every unique player-vs-player matchup becomes a match.',
      'Matches are listed together (same round number) with separate match indices — play them in any order your organizer prefers.',
      'For large fields, consider enabling a group stage so each pool stays manageable (up to 20 per group).',
      'The organizer chooses how standings break ties: match wins, game wins, points scored, and more.',
    ],
    duringEvent: [
      'Use the match list or standings view to see who you have not played yet.',
      'There is no “next round” — progress is how many of your scheduled matches are done.',
    ],
    standings:
      'Final order uses the organizer’s tiebreak settings (e.g. match wins, then point differential). Everyone’s full record is visible in standings.',
  },
];

export const TWO_STAGE_GUIDE = {
  title: 'Two-stage tournaments (groups → playoffs)',
  body: 'Some events run a group stage first, then a knockout final stage.',
  steps: [
    'Players are split into groups using a snake draft so groups stay balanced by seed.',
    'Each group plays round robin — everyone in the group faces everyone else in that group.',
    'Top finishers per group (configurable: 1, 2, 4, 8, or 16) advance to the final stage.',
    'The final stage is single or double elimination among qualifiers. Playoff size must be a power of two.',
    'Group results are kept; playoff matches are generated separately when the organizer advances the event.',
  ],
};

export const GENERATION_OVERVIEW = [
  {
    title: 'Registration & seeds',
    body: `Organizers add players (or bladers register themselves). Seeds control first-round placement when set; otherwise order follows registration time.`,
  },
  {
    title: 'Generate bracket',
    body: `When registration closes, the organizer clicks generate (or start group stage). ${SITE_NAME} creates matches in the database — no manual bracket drawing.`,
  },
  {
    title: 'Report scores',
    body: 'Players or staff report match results from the tournament page. Knockout formats auto-advance winners; Swiss waits for the round to finish before the next generation.',
  },
  {
    title: 'Standings & rankings',
    body: 'Standings update live. Ranked events award circuit points based on placement and wins when the tournament completes.',
  },
];
