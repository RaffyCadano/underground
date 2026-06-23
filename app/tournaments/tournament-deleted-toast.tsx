'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { SuccessToast } from '@/app/components/success-toast';

function TournamentDeletedToastInner() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');

  useEffect(() => {
    if (searchParams.get('deleted') !== '1') return;
    setName(searchParams.get('name')?.trim() ?? '');
    setOpen(true);
  }, [searchParams]);

  const dismiss = useCallback(() => {
    setOpen(false);
    if (searchParams.get('deleted') !== '1') return;
    const next = new URLSearchParams(searchParams.toString());
    next.delete('deleted');
    next.delete('name');
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [pathname, router, searchParams]);

  return (
    <SuccessToast
      open={open}
      title="Tournament deleted"
      body={
        name
          ? `${name} has been permanently removed.`
          : 'The tournament has been permanently removed.'
      }
      onDismiss={dismiss}
    />
  );
}

export function TournamentDeletedToast() {
  return (
    <Suspense fallback={null}>
      <TournamentDeletedToastInner />
    </Suspense>
  );
}
