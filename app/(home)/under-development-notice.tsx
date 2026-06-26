'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Construction, X } from 'lucide-react';

const STORAGE_KEY = 'ugncbbx-home-dev-notice-dismissed';

export function UnderDevelopmentNotice() {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return;
    if (sessionStorage.getItem(STORAGE_KEY) === '1') return;
    setOpen(true);
  }, [mounted]);

  useEffect(() => {
    if (!open || !mounted) {
      setVisible(false);
      return;
    }

    const frame = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(frame);
  }, [open, mounted]);

  function dismiss() {
    sessionStorage.setItem(STORAGE_KEY, '1');
    setOpen(false);
  }

  if (!mounted || !open) return null;

  return createPortal(
    <div
      className={`fixed bottom-4 right-4 z-[60] w-[min(100vw-2rem,24rem)] transition-all duration-300 sm:bottom-6 sm:right-6 ${
        visible ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'
      }`}
      role="status"
      aria-live="polite"
    >
      <div className="overflow-hidden rounded-xl border border-amber-500/30 bg-slate-950 shadow-2xl shadow-black/40">
        <div className="h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
        <div className="flex items-start gap-3 p-4">
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amber-500/35 bg-amber-500/10 text-amber-300">
            <Construction size={20} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-white">Site under development</p>
            <p className="mt-1 text-xs leading-relaxed text-slate-400">
              UGNCBBX is still being built. Some pages, stats, and tournament details may not be fully
              accurate yet.
            </p>
          </div>
          <button
            type="button"
            onClick={dismiss}
            className="shrink-0 rounded-lg p-1 text-slate-500 transition hover:bg-slate-800 hover:text-slate-300"
            aria-label="Dismiss"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
