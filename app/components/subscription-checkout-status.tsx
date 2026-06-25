'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export function SubscriptionCheckoutStatus() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const checkout = searchParams.get('checkout');
    if (!checkout) return;

    if (checkout === 'success') {
      setMessage('Payment received. Your Premier plan is now active.');
      router.refresh();
    } else if (checkout === 'canceled') {
      setMessage('Checkout was canceled. You can try again whenever you are ready.');
    }

    router.replace('/profile/subscriptions', { scroll: false });
  }, [router, searchParams]);

  if (!message) return null;

  return (
    <p className="rounded-lg border border-slate-800 bg-slate-900/60 px-4 py-3 text-sm text-slate-300">
      {message}
    </p>
  );
}
