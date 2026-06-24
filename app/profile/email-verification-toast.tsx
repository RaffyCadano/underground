'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { SuccessToast } from '@/app/components/success-toast';

function EmailVerificationToastInner() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [verifiedOpen, setVerifiedOpen] = useState(false);
  const [errorOpen, setErrorOpen] = useState(false);

  useEffect(() => {
    setVerifiedOpen(searchParams.get('emailVerified') === '1');
    setErrorOpen(searchParams.get('emailVerifyError') === '1');
  }, [searchParams]);

  const clearParam = useCallback(
    (key: string) => {
      if (searchParams.get(key) !== '1') return;
      const next = new URLSearchParams(searchParams.toString());
      next.delete(key);
      const qs = next.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  return (
    <>
      <SuccessToast
        open={verifiedOpen}
        title="Email verified"
        body="Your email address is confirmed."
        onDismiss={() => {
          setVerifiedOpen(false);
          clearParam('emailVerified');
        }}
      />
      <SuccessToast
        open={errorOpen}
        tone="error"
        title="Verification link invalid"
        body="This link may have expired. Request a new verification email from your account settings."
        onDismiss={() => {
          setErrorOpen(false);
          clearParam('emailVerifyError');
        }}
      />
    </>
  );
}

export function EmailVerificationToast() {
  return (
    <Suspense fallback={null}>
      <EmailVerificationToastInner />
    </Suspense>
  );
}
