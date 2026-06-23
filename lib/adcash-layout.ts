export const ADCASH_LEADERBOARD_ID = 'adcash-leaderboard-banner';
export const ADCASH_MAIN_COLUMN_ID = 'adcash-main-column';
export const ADCASH_SKYSCRAPER_GAP_PX = 24;
export const ADCASH_SKYSCRAPER_WIDTH_PX = 120;
export const ADCASH_SKYSCRAPER_MIN_INSET_PX = 16;

/** Leaderboard strip: label + 60px slot + container py-2 + border. */
export const ADCASH_LEADERBOARD_MIN_HEIGHT_PX = 97;

export function measureSkyscraperTopOffset(): number {
  const header = document.querySelector('header');
  const banner = document.getElementById(ADCASH_LEADERBOARD_ID);
  const headerBottom = header?.getBoundingClientRect().bottom ?? 0;

  if (!banner) return headerBottom;

  const bannerBottom = banner.getBoundingClientRect().bottom;
  return Math.max(headerBottom, bannerBottom);
}
