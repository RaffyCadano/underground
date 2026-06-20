'use client';

import { ReactLenis, useLenis } from 'lenis/react';
import { usePathname, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState, type ReactNode } from 'react';

function LenisScrollToTop() {
  const lenis = useLenis();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    lenis?.scrollTo(0, { immediate: true });
  }, [pathname, searchParams, lenis]);

  return null;
}

export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduceMotion(mq.matches);
    const onChange = (event: MediaQueryListEvent) => setReduceMotion(event.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  if (reduceMotion) {
    return <>{children}</>;
  }

  return (
    <ReactLenis
      root
      options={{
        lerp: 0.085,
        duration: 1.15,
        smoothWheel: true,
        syncTouch: false,
        wheelMultiplier: 0.9,
      }}
    >
      <Suspense fallback={null}>
        <LenisScrollToTop />
      </Suspense>
      {children}
    </ReactLenis>
  );
}
