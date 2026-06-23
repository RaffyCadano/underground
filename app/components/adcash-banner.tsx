import { ADCASH_LEADERBOARD_ZONE_ID } from '@/lib/adcash-mount';
import { ADCASH_LEADERBOARD_MIN_HEIGHT_PX } from '@/lib/adcash-layout';
import { AdcashDisplaySlot } from '@/app/components/adcash-display-slot';

export function AdcashBanner({ enabled = true }: { enabled?: boolean }) {
  if (!enabled) return null;

  return (
    <div
      id="adcash-leaderboard-banner"
      className="border-b border-slate-800/80 bg-slate-950/60"
      style={{ minHeight: ADCASH_LEADERBOARD_MIN_HEIGHT_PX }}
    >
      <div className="container py-2">
        <AdcashDisplaySlot
          zoneId={ADCASH_LEADERBOARD_ZONE_ID}
          enabled={enabled}
          showUpgradeLabel
          className="mx-auto w-full max-w-[468px]"
          slotClassName="mx-auto flex min-h-[60px] w-full max-w-[468px] items-center justify-center"
          label="Leaderboard advertisement"
        />
      </div>
    </div>
  );
}
