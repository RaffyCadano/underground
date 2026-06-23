'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlertTriangle, Loader2, X } from 'lucide-react';

function formatAccessDate(iso: string | null) {
  if (!iso) return 'the end of your billing period';
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function CancelPremierButton({
  currentPeriodEnd,
  cancelAtPeriodEnd = false,
  canCancel = false,
}: {
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd?: boolean;
  canCancel?: boolean;
}) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;

    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && !loading) setOpen(false);
    }

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open, loading]);

  if (!canCancel && !cancelAtPeriodEnd && !successMessage) return null;

  async function confirmCancel() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/stripe/cancel-subscription', { method: 'POST' });
      const data = (await response.json()) as {
        ok?: boolean;
        message?: string;
        accessUntil?: string;
        error?: string;
      };

      if (!response.ok || !data.ok) {
        setError(data.error ?? 'Could not cancel subscription.');
        setLoading(false);
        return;
      }

      setOpen(false);
      setSuccessMessage(data.message ?? 'Your subscription will cancel at the end of this billing period.');
      router.refresh();
    } catch {
      setError('Could not cancel subscription.');
      setLoading(false);
    }
  }

  return (
    <>
      {successMessage && (
        <p className="mt-3 rounded-lg border border-brand-500/20 bg-brand-500/10 px-3 py-2 text-sm text-brand-200">
          {successMessage}
        </p>
      )}

      {cancelAtPeriodEnd && !successMessage && (
        <p className="mt-3 text-sm text-amber-200/90">
          Cancellation scheduled. Premier access continues until{' '}
          <span className="font-medium text-amber-100">{formatAccessDate(currentPeriodEnd)}</span>.
        </p>
      )}

      {canCancel && !cancelAtPeriodEnd && (
        <button
          type="button"
          onClick={() => {
            setError(null);
            setOpen(true);
          }}
          className="mt-3 text-sm font-medium text-red-400 underline decoration-red-900/60 underline-offset-2 transition hover:text-red-300"
        >
          Cancel Premier subscription
        </button>
      )}

      {mounted &&
        open &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cancel-premier-title"
            onClick={() => !loading && setOpen(false)}
          >
            <div
              className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl shadow-black/40"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="border-b border-slate-800 px-5 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full border border-red-500/30 bg-red-500/10 text-red-300">
                      <AlertTriangle size={18} />
                    </span>
                    <div>
                      <h2 id="cancel-premier-title" className="text-lg font-semibold text-white">
                        Cancel Premier?
                      </h2>
                      <p className="mt-1 text-sm text-slate-400">
                        You will keep Premier until{' '}
                        <span className="font-medium text-slate-300">
                          {formatAccessDate(currentPeriodEnd)}
                        </span>
                        . After that, your plan returns to Free and ads will show again.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    disabled={loading}
                    className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-800 hover:text-white disabled:opacity-50"
                    aria-label="Close"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              <div className="space-y-4 px-5 py-4 text-sm text-slate-400">
                <p>
                  Monthly and annual plans stay active through the end of the current billing period.
                  See our{' '}
                  <Link
                    href="/refund-policy"
                    target="_blank"
                    className="font-medium text-brand-300 hover:text-brand-200"
                    onClick={(event) => event.stopPropagation()}
                  >
                    Refund Policy
                  </Link>{' '}
                  for refund eligibility.
                </p>
                {error && <p className="text-sm text-red-400">{error}</p>}
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-slate-800 px-5 py-4 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  disabled={loading}
                  className="btn-secondary disabled:opacity-50"
                >
                  Keep Premier
                </button>
                <button
                  type="button"
                  onClick={confirmCancel}
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-500/40 bg-red-500/15 px-4 py-2.5 text-sm font-semibold text-red-200 transition hover:bg-red-500/25 disabled:opacity-50"
                >
                  {loading && <Loader2 size={16} className="animate-spin" />}
                  Confirm cancellation
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
