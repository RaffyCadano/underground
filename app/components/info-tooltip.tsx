'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Info } from 'lucide-react';

export function InfoTooltip({
  text,
  className = 'w-64 max-w-[min(16rem,calc(100vw-2rem))]',
}: {
  text: string;
  className?: string;
}) {
  const tooltipId = useId();
  const anchorRef = useRef<HTMLSpanElement>(null);
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => setMounted(true), []);

  function updatePosition() {
    const anchor = anchorRef.current;
    if (!anchor) return;
    const rect = anchor.getBoundingClientRect();
    setPosition({
      top: rect.bottom + 8,
      left: rect.left + rect.width / 2,
    });
  }

  function show() {
    updatePosition();
    setOpen(true);
  }

  function hide() {
    setOpen(false);
  }

  return (
    <>
      <span
        ref={anchorRef}
        className="ml-1 inline-flex h-4 w-4 shrink-0 cursor-default items-center justify-center align-middle text-slate-500 transition [@media(hover:hover)]:hover:text-slate-300"
        onMouseEnter={show}
        onMouseLeave={hide}
      >
        <Info size={14} aria-hidden="true" />
      </span>
      {mounted &&
        open &&
        createPortal(
          <div
            id={tooltipId}
            role="tooltip"
            style={{ top: position.top, left: position.left }}
            className={`pointer-events-none fixed z-[100] -translate-x-1/2 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs leading-relaxed text-slate-300 shadow-xl shadow-black/40 ${className}`}
          >
            {text}
          </div>,
          document.body,
        )}
    </>
  );
}
