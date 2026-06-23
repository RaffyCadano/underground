/** 468×60 leaderboard — override with NEXT_PUBLIC_ADCASH_LEADERBOARD_ZONE_ID. */
export const ADCASH_LEADERBOARD_ZONE_ID_DEFAULT = '11502574';

export function getLeaderboardZoneId(): string {
  return (
    process.env.NEXT_PUBLIC_ADCASH_LEADERBOARD_ZONE_ID?.trim() ||
    ADCASH_LEADERBOARD_ZONE_ID_DEFAULT
  );
}

/** @deprecated Use getLeaderboardZoneId() */
export const ADCASH_LEADERBOARD_ZONE_ID = ADCASH_LEADERBOARD_ZONE_ID_DEFAULT;

/** 160×600 skyscraper (left). Override with NEXT_PUBLIC_ADCASH_SKYSCRAPER_LEFT_ZONE_ID. */
export const ADCASH_SKYSCRAPER_LEFT_ZONE_ID_DEFAULT = '11502586';

/** 160×600 skyscraper (right). Override with NEXT_PUBLIC_ADCASH_SKYSCRAPER_RIGHT_ZONE_ID. */
export const ADCASH_SKYSCRAPER_RIGHT_ZONE_ID_DEFAULT = '11502602';

export function getSkyscraperZoneIds(): { left: string; right: string | null } {
  const left =
    process.env.NEXT_PUBLIC_ADCASH_SKYSCRAPER_LEFT_ZONE_ID?.trim() ||
    ADCASH_SKYSCRAPER_LEFT_ZONE_ID_DEFAULT;
  const right =
    process.env.NEXT_PUBLIC_ADCASH_SKYSCRAPER_RIGHT_ZONE_ID?.trim() ||
    ADCASH_SKYSCRAPER_RIGHT_ZONE_ID_DEFAULT;
  return { left, right: right !== left ? right : null };
}

/** @deprecated Use getSkyscraperZoneIds().left */
export const ADCASH_SKYSCRAPER_ZONE_ID = ADCASH_SKYSCRAPER_LEFT_ZONE_ID_DEFAULT;

declare global {
  interface Window {
    aclib?: {
      runBanner?: (options: { zoneId: string }) => void;
    };
  }
}

export function adcashMountScript(zoneId: string, containerId: string): string {
  const safeZone = zoneId.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
  const safeId = containerId.replace(/\\/g, '\\\\').replace(/'/g, "\\'");

  return `(function(){var z='${safeZone}',id='${safeId}',n=0;function m(){var c=document.getElementById(id);if(!c||c.dataset.adcashMounted==='true')return;if(typeof window.aclib!=='undefined'&&typeof aclib.runBanner==='function'){var s=document.createElement('script');s.type='text/javascript';s.text="aclib.runBanner({ zoneId: '"+z+"' });";c.appendChild(s);c.dataset.adcashMounted='true';return;}if(++n<50)setTimeout(m,100);}m();})();`;
}

export function mountAdcashBanner(container: HTMLDivElement, zoneId: string) {
  let attempts = 0;

  const tryMount = () => {
    if (container.dataset.adcashMounted === 'true') return;

    if (typeof window.aclib?.runBanner === 'function') {
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.text = `aclib.runBanner({ zoneId: '${zoneId}' });`;
      container.appendChild(script);
      container.dataset.adcashMounted = 'true';
      return;
    }

    attempts += 1;
    if (attempts < 50) {
      window.setTimeout(tryMount, 100);
    }
  };

  tryMount();
}
