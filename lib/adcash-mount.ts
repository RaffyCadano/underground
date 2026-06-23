export const ADCASH_LEADERBOARD_ZONE_ID = '11501630';
export const ADCASH_SKYSCRAPER_ZONE_ID = '11501638';

declare global {
  interface Window {
    aclib?: {
      runBanner?: (options: { zoneId: string }) => void;
    };
  }
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
