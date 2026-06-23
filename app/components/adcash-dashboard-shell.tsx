import Script from 'next/script';
import { AdcashBanner } from '@/app/components/adcash-banner';
import { AdcashSkyscraper } from '@/app/components/adcash-skyscraper';
import { getViewerShowAds } from '@/lib/ads';
import { getSkyscraperZoneIds } from '@/lib/adcash-mount';
import { ADCASH_MAIN_COLUMN_ID } from '@/lib/adcash-layout';

export async function AdcashDashboardShell({ children }: { children: React.ReactNode }) {
  const showAds = await getViewerShowAds();
  const { left: leftZoneId, right: rightZoneId } = getSkyscraperZoneIds();

  return (
    <>
      {showAds && (
        <Script
          id="aclib"
          src="https://acscdn.com/script/aclib.js"
          strategy="afterInteractive"
        />
      )}
      <AdcashBanner enabled={showAds} />
      {showAds ? (
        <div className="grid min-h-0 w-full min-w-0 grid-cols-1 xl:grid-cols-[minmax(0,1fr)_min(100%,1536px)_minmax(0,1fr)]">
          <div className="hidden min-w-0 self-start xl:flex xl:justify-end">
            <AdcashSkyscraper enabled={showAds} side="left" zoneId={leftZoneId} />
          </div>
          <div id={ADCASH_MAIN_COLUMN_ID} className="min-w-0">
            {children}
          </div>
          {rightZoneId ? (
            <div className="hidden min-w-0 self-start xl:flex xl:justify-start">
              <AdcashSkyscraper enabled={showAds} side="right" zoneId={rightZoneId} />
            </div>
          ) : (
            <div className="hidden min-w-0 xl:block" aria-hidden />
          )}
        </div>
      ) : (
        children
      )}
    </>
  );
}
