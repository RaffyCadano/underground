import { AdcashAdLabel } from '@/app/components/adcash-ad-label';
import { AdcashZone } from '@/app/components/adcash-zone';
import { getLeaderboardZoneId } from '@/lib/adcash-mount';

export function AdcashEmbedStrip({ slot }: { slot: 'top' | 'bottom' }) {
  return (
    <div
      className={`shrink-0 border-slate-800 bg-slate-950/90 px-2 py-1.5 ${
        slot === 'top' ? 'border-b' : 'border-t'
      }`}
    >
      <AdcashAdLabel className="mb-1 text-center text-[9px]" />
      <AdcashZone
        zoneId={getLeaderboardZoneId()}
        idSuffix={slot}
        slotClassName="mx-auto flex min-h-[60px] w-full max-w-[468px] items-center justify-center"
      />
    </div>
  );
}
