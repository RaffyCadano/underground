'use client';

import { useLayoutEffect, useState } from 'react';
import { ADCASH_SKYSCRAPER_ZONE_ID } from '@/lib/adcash-mount';
import {
  ADCASH_LEADERBOARD_ID,
  ADCASH_MAIN_COLUMN_ID,
  ADCASH_SKYSCRAPER_GAP_PX,
  ADCASH_SKYSCRAPER_MIN_INSET_PX,
  ADCASH_SKYSCRAPER_WIDTH_PX,
  measureSkyscraperTopOffset,
} from '@/lib/adcash-layout';
import { AdcashDisplaySlot } from '@/app/components/adcash-display-slot';

function measureSkyscraperPosition(side: 'left' | 'right') {
  const column = document.getElementById(ADCASH_MAIN_COLUMN_ID);
  const top = measureSkyscraperTopOffset();

  if (!column) {
    return {
      top,
      left: ADCASH_SKYSCRAPER_MIN_INSET_PX,
      right: ADCASH_SKYSCRAPER_MIN_INSET_PX,
    };
  }

  const columnRect = column.getBoundingClientRect();

  if (side === 'left') {
    return {
      top,
      left: Math.max(
        ADCASH_SKYSCRAPER_MIN_INSET_PX,
        columnRect.left - ADCASH_SKYSCRAPER_GAP_PX - ADCASH_SKYSCRAPER_WIDTH_PX,
      ),
      right: ADCASH_SKYSCRAPER_MIN_INSET_PX,
    };
  }

  return {
    top,
    left: ADCASH_SKYSCRAPER_MIN_INSET_PX,
    right: Math.max(
      ADCASH_SKYSCRAPER_MIN_INSET_PX,
      window.innerWidth - columnRect.right - ADCASH_SKYSCRAPER_GAP_PX - ADCASH_SKYSCRAPER_WIDTH_PX,
    ),
  };
}

export function AdcashSkyscraper({
  enabled = true,
  side = 'right',
}: {
  enabled?: boolean;
  side?: 'left' | 'right';
}) {
  const [position, setPosition] = useState<{ top: number; left: number; right: number } | null>(
    null,
  );

  useLayoutEffect(() => {
    if (!enabled) return;

    function update() {
      setPosition(measureSkyscraperPosition(side));
    }

    update();

    const resizeObserver = new ResizeObserver(update);
    const header = document.querySelector('header');
    const banner = document.getElementById(ADCASH_LEADERBOARD_ID);
    const column = document.getElementById(ADCASH_MAIN_COLUMN_ID);

    if (header) resizeObserver.observe(header);
    if (banner) resizeObserver.observe(banner);
    if (column) resizeObserver.observe(column);

    const mutationObserver =
      banner &&
      new MutationObserver(() => {
        update();
      });

    if (banner && mutationObserver) {
      mutationObserver.observe(banner, { childList: true, subtree: true, attributes: true });
    }

    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, { passive: true });

    return () => {
      resizeObserver.disconnect();
      mutationObserver?.disconnect();
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update);
    };
  }, [enabled, side]);

  if (!enabled) return null;

  const insetStyle =
    side === 'left'
      ? { top: position?.top ?? 0, left: position?.left ?? ADCASH_SKYSCRAPER_MIN_INSET_PX }
      : { top: position?.top ?? 0, right: position?.right ?? ADCASH_SKYSCRAPER_MIN_INSET_PX };

  return (
    <>
      <aside className="hidden w-[120px] shrink-0 xl:block" aria-hidden />
      <div
        className={`fixed z-30 hidden w-[120px] xl:block${position ? '' : ' invisible'}`}
        style={insetStyle}
      >
        <AdcashDisplaySlot
          zoneId={ADCASH_SKYSCRAPER_ZONE_ID}
          enabled={enabled}
          showUpgradeLabel
          upgradeLabelStacked
          className="w-[120px]"
          upgradeLabelClassName="mb-3 w-[120px] text-center text-[9px] leading-snug text-slate-500"
          slotClassName="flex min-h-[600px] w-[120px] items-center justify-center"
          label={`${side === 'left' ? 'Left' : 'Right'} skyscraper advertisement`}
        />
      </div>
    </>
  );
}
