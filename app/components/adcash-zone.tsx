import { adcashMountScript } from '@/lib/adcash-mount';

export function AdcashZone({
  zoneId,
  idSuffix,
  slotClassName,
  label = 'Advertisement',
}: {
  zoneId: string;
  /** Disambiguates multiple slots using the same zone on one page (e.g. embed top/bottom). */
  idSuffix?: string;
  slotClassName?: string;
  label?: string;
}) {
  const containerId = idSuffix ? `adcash-zone-${zoneId}-${idSuffix}` : `adcash-zone-${zoneId}`;

  return (
    <div
      id={containerId}
      className={slotClassName ?? 'flex items-center justify-center'}
      aria-label={label}
      data-adcash-zone={zoneId}
    >
      <script
        type="text/javascript"
        dangerouslySetInnerHTML={{ __html: adcashMountScript(zoneId, containerId) }}
      />
    </div>
  );
}
