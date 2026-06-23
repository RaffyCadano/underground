import { AdcashAdLabel } from '@/app/components/adcash-ad-label';
import { AdcashSkyscraperFixed } from '@/app/components/adcash-skyscraper-fixed';
import { AdcashZone } from '@/app/components/adcash-zone';

export function AdcashSkyscraper({
  enabled = true,
  side = 'right',
  zoneId,
}: {
  enabled?: boolean;
  side?: 'left' | 'right';
  zoneId: string;
}) {
  if (!enabled) return null;

  return (
    <AdcashSkyscraperFixed side={side}>
      <AdcashAdLabel className="mb-2 w-[160px] text-center text-[9px] leading-snug text-slate-500" />
      <AdcashZone
        zoneId={zoneId}
        slotClassName="flex min-h-[600px] w-[160px] items-center justify-center"
        label={`${side === 'left' ? 'Left' : 'Right'} skyscraper advertisement`}
      />
    </AdcashSkyscraperFixed>
  );
}
