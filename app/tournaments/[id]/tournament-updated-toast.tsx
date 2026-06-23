'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { SuccessToast } from '@/app/components/success-toast';

function TournamentUpdatedToastInner({
  tournamentName,
  enabled,
}: {
  tournamentName: string;
  enabled: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!enabled || searchParams.get('updated') !== '1') return;
    setOpen(true);
  }, [enabled, searchParams]);

  const dismiss = useCallback(() => {
    setOpen(false);
    if (searchParams.get('updated') !== '1') return;
    const next = new URLSearchParams(searchParams.toString());
    next.delete('updated');
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [pathname, router, searchParams]);

  return (
    <SuccessToast
      open={open}
      title="Tournament updated"
      body={`${tournamentName} has been saved with your latest changes.`}
      onDismiss={dismiss}
    />
  );
}

export function TournamentUpdatedToast({
  tournamentName,
  enabled,
}: {
  tournamentName: string;
  enabled: boolean;
}) {
  return (
    <Suspense fallback={null}>
      <TournamentUpdatedToastInner tournamentName={tournamentName} enabled={enabled} />
    </Suspense>
  );
}
