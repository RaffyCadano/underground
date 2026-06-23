'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { SuccessToast } from '@/app/components/success-toast';

function TournamentCreatedToastInner({
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
    if (!enabled || searchParams.get('created') !== '1') return;
    setOpen(true);
  }, [enabled, searchParams]);

  const dismiss = useCallback(() => {
    setOpen(false);
    if (searchParams.get('created') !== '1') return;
    const next = new URLSearchParams(searchParams.toString());
    next.delete('created');
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [pathname, router, searchParams]);

  return (
    <SuccessToast
      open={open}
      title="Tournament created"
      body={`${tournamentName} is live with open registration. Add players and generate the bracket when you're ready.`}
      onDismiss={dismiss}
    />
  );
}

export function TournamentCreatedToast({
  tournamentName,
  enabled,
}: {
  tournamentName: string;
  enabled: boolean;
}) {
  return (
    <Suspense fallback={null}>
      <TournamentCreatedToastInner tournamentName={tournamentName} enabled={enabled} />
    </Suspense>
  );
}
