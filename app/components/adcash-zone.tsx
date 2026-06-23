import { adcashMountScript } from '@/lib/adcash-mount';

export function AdcashZone({
  zoneId,
  slotClassName,
  label = 'Advertisement',
}: {
  zoneId: string;
  slotClassName?: string;
  label?: string;
}) {
  const containerId = `adcash-zone-${zoneId}`;

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
