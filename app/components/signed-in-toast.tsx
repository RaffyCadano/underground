'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { SuccessToast } from '@/app/components/success-toast';

function SignedInToastInner() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (searchParams.get('signedIn') !== '1') return;
    setOpen(true);
  }, [searchParams]);

  const dismiss = useCallback(() => {
    setOpen(false);
    if (searchParams.get('signedIn') !== '1') return;
    const next = new URLSearchParams(searchParams.toString());
    next.delete('signedIn');
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [pathname, router, searchParams]);

  return (
    <SuccessToast
      open={open}
      title="Signed in"
      body="Welcome back — you're signed in to UGNCBBX."
      onDismiss={dismiss}
    />
  );
}

export function SignedInToast() {
  return (
    <Suspense fallback={null}>
      <SignedInToastInner />
    </Suspense>
  );
}
