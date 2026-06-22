'use client';

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';

export type ScrollRevealDirection = 'up' | 'down' | 'left' | 'right' | 'none' | 'scale';

type ScrollRevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: ScrollRevealDirection;
  once?: boolean;
  threshold?: number;
  style?: CSSProperties;
};

const directionClass: Record<ScrollRevealDirection, string> = {
  up: 'scroll-reveal-up',
  down: 'scroll-reveal-down',
  left: 'scroll-reveal-left',
  right: 'scroll-reveal-right',
  none: 'scroll-reveal-fade',
  scale: 'scroll-reveal-scale',
};

export function ScrollReveal({
  children,
  className = '',
  delay = 0,
  direction = 'up',
  once = false,
  threshold = 0.12,
  style,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mq.matches) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setVisible(false);
        }
      },
      { threshold, rootMargin: '0px 0px -6% 0px' },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [once, threshold]);

  return (
    <div
      ref={ref}
      className={`scroll-reveal ${directionClass[direction]} ${visible ? 'scroll-reveal-visible' : ''} ${className}`}
      style={{
        ...style,
        transitionDelay: visible ? `${delay}ms` : '0ms',
      }}
    >
      {children}
    </div>
  );
}
