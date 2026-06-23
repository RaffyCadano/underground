'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { SuccessToast } from '@/app/components/success-toast';

function SignedOutToastInner() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (searchParams.get('signedOut') !== '1') return;
    setOpen(true);
  }, [searchParams]);

  const dismiss = useCallback(() => {
    setOpen(false);
    if (searchParams.get('signedOut') !== '1') return;
    const next = new URLSearchParams(searchParams.toString());
    next.delete('signedOut');
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [pathname, router, searchParams]);

  return (
    <SuccessToast
      open={open}
      title="Signed out"
      body="You've been signed out. Sign in again anytime to pick up where you left off."
      onDismiss={dismiss}
    />
  );
}

export function SignedOutToast() {
  return (
    <Suspense fallback={null}>
      <SignedOutToastInner />
    </Suspense>
  );
}
