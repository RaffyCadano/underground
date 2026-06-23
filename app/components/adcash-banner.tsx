import Link from 'next/link';
import { getLeaderboardZoneId } from '@/lib/adcash-mount';
import { ADCASH_LEADERBOARD_MIN_HEIGHT_PX } from '@/lib/adcash-layout';
import { AdcashAdLabel } from '@/app/components/adcash-ad-label';
import { AdcashZone } from '@/app/components/adcash-zone';

export function AdcashBanner({ enabled = true }: { enabled?: boolean }) {
  if (!enabled) return null;

  return (
    <div
      id="adcash-leaderboard-banner"
      className="border-b border-slate-800/80 bg-slate-950/60"
      style={{ minHeight: ADCASH_LEADERBOARD_MIN_HEIGHT_PX }}
    >
      <div className="container py-2">
        <div className="mx-auto w-full max-w-[468px]">
          <AdcashAdLabel />
          <AdcashZone
            zoneId={getLeaderboardZoneId()}
            slotClassName="mx-auto flex min-h-[60px] w-full max-w-[468px] items-center justify-center"
            label="Leaderboard advertisement"
          />
        </div>
        <p className="mt-2 text-center text-[10px] text-slate-600">
          <Link
            href="/profile/subscriptions"
            className="text-slate-500 underline decoration-slate-700 underline-offset-2 transition hover:text-brand-300"
          >
            Remove ads with Premier
          </Link>
        </p>
      </div>
    </div>
  );
}
