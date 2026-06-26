import { SITE_NAME } from '@/lib/site';

export type NewsCategory = 'platform' | 'circuit' | 'update';

export type NewsArticle = {
  slug: string;
  title: string;
  publishedAt: string;
  category: NewsCategory;
  excerpt: string;
  body: string;
};

export const NEWS_CATEGORY_LABELS: Record<NewsCategory, string> = {
  platform: 'Platform',
  circuit: 'Circuit',
  update: 'Update',
};

export const NEWS_ARTICLES: NewsArticle[] = [
  {
    slug: 'premier-plan-and-features',
    title: `${SITE_NAME} Premier and the new features page`,
    publishedAt: '2026-06-22',
    category: 'platform',
    excerpt:
      'Premier removes ads, unlocks ranked events and unlimited tournaments, and the features page now shows exactly what Standard and Premier include.',
    body: `## What changed

${SITE_NAME} Premier is live for organizers who want an ad-free experience and more room to grow.

**Premier includes:**

- Ad-free browsing for you and your players
- Unlimited hosted tournaments (Standard includes up to 3)
- Ranked events that award circuit rank points
- No player cap limit (Standard caps at 256 players per event)
- Embeddable brackets without display ads

**Standard stays free** with full bracket tools — single and double elimination, Swiss, round robin, and two-stage group play — plus registration, walk-ins, standings, and score reporting.

Visit the [features page](/features) for a full side-by-side comparison, or [view pricing](/pricing) to upgrade.`,
  },
  {
    slug: 'bracket-guide-learn-more',
    title: 'New guide: how brackets are generated',
    publishedAt: '2026-06-20',
    category: 'update',
    excerpt:
      'A plain-language walkthrough of single elim, double elim, Swiss, round robin, and two-stage tournaments on the platform.',
    body: `## Brackets explained

We added a **Learn more** guide that walks through how ${SITE_NAME} builds and runs each tournament format — from open registration through generate bracket to final standings.

The guide covers:

- **Single elimination** — seeding, byes, and advancement
- **Double elimination** — winners bracket, losers bracket, and grand finals
- **Swiss** — round pairing by record and Swiss points
- **Round robin** — everyone plays everyone in the pool
- **Two-stage** — group stage round robin feeding a playoff bracket

If you are hosting your first event or switching formats, start on the [Learn more](/learn-more) page.`,
  },
  {
    slug: 'welcome-to-ugncbbx',
    title: `Welcome to ${SITE_NAME}`,
    publishedAt: '2026-06-01',
    category: 'circuit',
    excerpt:
      'The North Carolina Beyblade X circuit hub for brackets, rankings, clubs, and local events.',
    body: `## Built for NC bladers

${SITE_NAME} is the home of competitive Beyblade X in North Carolina — run brackets, report scores, and climb the rankings from one place.

**What you can do today:**

- Browse and register for [open tournaments](/tournaments)
- Track [circuit rankings](/rankings) as match results are reported
- Explore [player profiles](/players) and [community clubs](/teams)
- Host events with Swiss, single elim, double elim, round robin, and two-stage formats
- Message other players on the circuit

**For organizers**, create a free account, set up your event, add players or open registration, and generate the bracket when you are ready.

Questions or feedback? [Contact us](/contact) — we read every message.`,
  },
  {
    slug: 'player-messaging',
    title: 'Direct messaging is live',
    publishedAt: '2026-05-15',
    category: 'platform',
    excerpt:
      'Message other players from their profile or your inbox — with block controls in account settings.',
    body: `## Stay in touch on the circuit

Players can now send **direct messages** to each other on ${SITE_NAME}.

- Open **Messages** from your profile menu
- Start a conversation from another player's public profile
- Block users you do not want to hear from in **Profile → Account settings**

Messaging is available on Standard and Premier. Use it to coordinate rides, confirm deck checks, or follow up after locals.`,
  },
];

export function getNewsArticles(): NewsArticle[] {
  return [...NEWS_ARTICLES].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );
}

export function getNewsArticle(slug: string): NewsArticle | undefined {
  return NEWS_ARTICLES.find((article) => article.slug === slug);
}

export function formatNewsDate(isoDate: string): string {
  return new Date(`${isoDate}T12:00:00`).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}
