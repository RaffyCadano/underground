import {
  CalendarDays,
  Code2,
  Medal,
  Trophy,
  UsersRound,
  type LucideIcon,
} from 'lucide-react';
import { SITE_NAME } from '@/lib/site';

/** `true` = included (checkmark). `false` = not available. `string` = plan-specific text. */
export type PlanFeatureCell = boolean | string;

export type PlanFeatureRow = {
  feature: string;
  standard: PlanFeatureCell;
  premier: PlanFeatureCell;
};

export type PlanFeatureCategory = {
  id: string;
  label: string;
  icon: LucideIcon;
  rows: PlanFeatureRow[];
};

export const PLAN_FEATURE_CATEGORIES: PlanFeatureCategory[] = [
  {
    id: 'tournaments',
    label: 'Tournaments',
    icon: Trophy,
    rows: [
      {
        feature: 'Host Dedicated Tournament Page',
        standard: 'Yes (with display ads)',
        premier: 'Yes (no ads)',
      },
      { feature: 'Single Elimination', standard: true, premier: true },
      { feature: 'Double Elimination', standard: true, premier: true },
      { feature: 'Round Robin', standard: true, premier: true },
      { feature: 'Swiss', standard: true, premier: true },
      { feature: 'Free For All', standard: false, premier: false },
      { feature: 'Time Trial', standard: false, premier: false },
      { feature: 'Single Race', standard: false, premier: false },
      { feature: 'Grand Prix', standard: false, premier: false },
      { feature: 'Pools & Two Stage Tournaments', standard: false, premier: false },
      { feature: 'Split Participants', standard: false, premier: false },
      { feature: 'League Ready', standard: false, premier: false },
      { feature: 'Multiple Sets Per Match', standard: false, premier: false },
      { feature: 'Standings', standard: true, premier: true },
      { feature: 'Country Flag in Race Standings', standard: false, premier: false },
      { feature: 'Discussion Board', standard: false, premier: false },
      { feature: 'Score Reporting', standard: true, premier: true },
      {
        feature: 'Allow Match Attachments',
        standard: 'Links only',
        premier: 'Up to 25MB',
      },
      {
        feature: 'Share Admin Access',
        standard: 'Yes (unlimited admins)',
        premier: 'Yes (unlimited admins)',
      },
      {
        feature: 'Embed Brackets',
        standard: `Yes (with display ads + ${SITE_NAME} watermark)`,
        premier: `Yes (no ads + ${SITE_NAME} watermark + customized themes)`,
      },
      { feature: 'Printed Brackets', standard: false, premier: false },
      {
        feature: 'Participant Limits',
        standard: 'Up to 256',
        premier: 'Up to 512',
      },
      { feature: 'Add Participants in Bulk', standard: true, premier: true },
      { feature: 'Require Team Registration', standard: true, premier: true },
      { feature: 'Host Registration Page', standard: true, premier: true },
      {
        feature: 'Charge Registration Fee',
        standard: 'Yes ($0.75/order service fee + Stripe)',
        premier: 'Yes ($0 service fee + Stripe)',
      },
      { feature: 'Require Verified Emails', standard: false, premier: false },
      { feature: 'Region Locking', standard: false, premier: false },
      { feature: 'Blocklist', standard: true, premier: true },
      { feature: 'Custom Tournament Ads', standard: false, premier: false },
      { feature: 'Custom Fields', standard: false, premier: false },
      { feature: 'Private Messaging', standard: true, premier: true },
      { feature: 'Social Image Sharing', standard: false, premier: false },
      { feature: 'Enable Check-in', standard: true, premier: true },
      { feature: 'Set Match Station', standard: false, premier: false },
      { feature: 'Set Match Times', standard: false, premier: false },
      { feature: 'Display Station Queue', standard: false, premier: false },
    ],
  },
  {
    id: 'contests',
    label: 'Contests',
    icon: Medal,
    rows: [
      {
        feature: 'Host Dedicated Contest Page',
        standard: 'Yes (with display ads)',
        premier: 'Yes (no ads)',
      },
      { feature: 'Voting & Submissions', standard: false, premier: false },
      { feature: 'Score Reporting', standard: true, premier: true },
      {
        feature: 'Participant Limits',
        standard: 'Up to 256',
        premier: 'Up to 512',
      },
      { feature: 'Host Registration Page', standard: true, premier: true },
      {
        feature: 'Charge Registration Fee',
        standard: 'Yes ($0.75/order service fee + Stripe)',
        premier: 'Yes ($0 service fee + Stripe)',
      },
      { feature: 'Private Messaging', standard: true, premier: true },
    ],
  },
  {
    id: 'events',
    label: 'Events',
    icon: CalendarDays,
    rows: [
      {
        feature: 'Host Dedicated Event Page',
        standard: 'Yes (with display ads)',
        premier: 'Yes (no ads)',
      },
      { feature: 'Calendar Listings', standard: true, premier: true },
      { feature: 'Linked Tournaments', standard: true, premier: true },
      { feature: 'Registration Page', standard: true, premier: true },
      {
        feature: 'Charge Registration Fee',
        standard: 'Yes ($0.75/order service fee + Stripe)',
        premier: 'Yes ($0 service fee + Stripe)',
      },
      { feature: 'Custom Event Branding', standard: false, premier: 'Custom themes' },
    ],
  },
  {
    id: 'communities',
    label: 'Communities',
    icon: UsersRound,
    rows: [
      {
        feature: 'Community Hub Page',
        standard: 'Yes (with display ads)',
        premier: 'Yes (no ads)',
      },
      { feature: 'Team & Club Listings', standard: true, premier: true },
      { feature: 'Member Roster', standard: true, premier: true },
      { feature: 'Linked Events & Tournaments', standard: true, premier: true },
      {
        feature: 'Pro Community License',
        standard: false,
        premier: 'Included with Premier',
      },
      { feature: 'Custom Community Branding', standard: false, premier: 'Custom themes' },
      { feature: 'Private Messaging', standard: true, premier: true },
    ],
  },
  {
    id: 'integrations',
    label: 'Integration & API',
    icon: Code2,
    rows: [
      { feature: 'REST API Access', standard: false, premier: 'Coming soon' },
      { feature: 'API Keys & Webhooks', standard: false, premier: 'Coming soon' },
      { feature: 'Embeddable Brackets', standard: `With ads + watermark`, premier: 'No ads + custom themes' },
      { feature: 'Third-Party Integrations', standard: false, premier: false },
      { feature: 'Stripe Connect Payouts', standard: true, premier: true },
      {
        feature: 'Platform Service Fee on Paid Orders',
        standard: '$0.75 per order',
        premier: '$0 per order',
      },
    ],
  },
];
