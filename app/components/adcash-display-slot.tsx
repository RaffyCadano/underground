'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { mountAdcashBanner } from '@/lib/adcash-mount';

export function AdcashDisplaySlot({
  zoneId,
  enabled = true,
  className,
  slotClassName,
  showUpgradeLabel = false,
  upgradeLabelClassName,
  upgradeLabelStacked = false,
  label,
}: {
  zoneId: string;
  enabled?: boolean;
  className?: string;
  slotClassName?: string;
  showUpgradeLabel?: boolean;
  upgradeLabelClassName?: string;
  upgradeLabelStacked?: boolean;
  label?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!enabled || !containerRef.current) return;
    mountAdcashBanner(containerRef.current, zoneId);
  }, [enabled, zoneId]);

  if (!enabled) return null;

  return (
    <div className={className}>
      {showUpgradeLabel && (
        <p
          className={
            upgradeLabelClassName ??
            'mb-1.5 text-center text-[10px] font-medium uppercase tracking-wider text-slate-500'
          }
        >
          {upgradeLabelStacked ? (
            <>
              <span className="block uppercase tracking-wider">Ad</span>
              <Link
                href="/profile/subscriptions"
                className="mt-1 block font-semibold normal-case tracking-normal text-slate-400 underline decoration-slate-700 underline-offset-2 transition hover:text-brand-300 hover:decoration-brand-500/50"
              >
                Upgrade to Remove
              </Link>
            </>
          ) : (
            <>
              Ad{' '}
              <span className="font-normal normal-case tracking-normal text-slate-600">–</span>{' '}
              <Link
                href="/profile/subscriptions"
                className="font-semibold normal-case tracking-normal text-slate-400 underline decoration-slate-700 underline-offset-2 transition hover:text-brand-300 hover:decoration-brand-500/50"
              >
                Upgrade to Remove
              </Link>
            </>
          )}
        </p>
      )}
      <div
        ref={containerRef}
        className={slotClassName ?? 'flex items-center justify-center'}
        aria-label={label ?? 'Advertisement'}
      />
    </div>
  );
}
