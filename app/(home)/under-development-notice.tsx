'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Construction, X } from 'lucide-react';

export function UnderDevelopmentNotice() {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(true);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;

    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  if (!mounted || !open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dev-notice-title"
    >
      <button
        type="button"
        aria-label="Close notice"
        onClick={() => setOpen(false)}
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
      />

      <div
        className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-amber-500/20 bg-slate-900 shadow-2xl shadow-amber-950/20"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent" />

        <div className="border-b border-slate-800 bg-slate-950/80 px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-amber-500/35 bg-amber-500/10 text-amber-300">
                <Construction size={20} />
              </span>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-400/90">
                  Early preview
                </p>
                <h2 id="dev-notice-title" className="mt-1 text-lg font-semibold text-white">
                  UGNCBBX is still under development
                </h2>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-lg border border-slate-700 bg-slate-800 p-1.5 text-slate-400 transition hover:text-white"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="space-y-4 px-6 py-5">
          <p className="text-sm leading-relaxed text-slate-300">
            Thanks for checking out the site. We&apos;re actively building the UGNCBBX circuit platform,
            so some pages, stats, and tournament details may not be fully accurate yet.
          </p>
          <ul className="list-inside list-disc space-y-1.5 text-sm text-slate-400">
            <li>Rankings and event listings are still being populated</li>
            <li>Bracket and registration features may change</li>
            <li>Report anything that looks off — we&apos;re improving things quickly</li>
          </ul>
        </div>

        <div className="flex justify-center border-t border-slate-800 bg-slate-950/50 px-6 py-4">
          <button type="button" onClick={() => setOpen(false)} className="btn-primary w-full sm:w-auto">
            Got it, continue browsing
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
