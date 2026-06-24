'use client';

import { useEffect, useId, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { Check, Code2, Copy, Crown, Printer, X } from 'lucide-react';
import { SITE_NAME } from '@/lib/site';

const bracketToolbarIconButtonClass =
  'inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:text-slate-200';

export function BracketShareActions({
  tournamentId,
  inline = false,
}: {
  tournamentId: string;
  inline?: boolean;
}) {
  const dialogTitleId = useId();
  const [mounted, setMounted] = useState(false);
  const [embedOpen, setEmbedOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [embedCode, setEmbedCode] = useState('');

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!embedOpen) return;
    const origin = window.location.origin;
    setEmbedCode(
      `<iframe src="${origin}/tournaments/${tournamentId}/embed" width="100%" height="640" frameborder="0" scrolling="auto" allowtransparency="true" title="Tournament bracket"></iframe>`,
    );
    setCopied(false);
  }, [embedOpen, tournamentId]);

  useEffect(() => {
    if (!embedOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setEmbedOpen(false);
    }
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [embedOpen]);

  async function copyEmbedCode() {
    try {
      await navigator.clipboard.writeText(embedCode);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  function handlePrint() {
    window.print();
  }

  const buttons = (
    <div className="flex gap-1">
      <button
        type="button"
        onClick={() => setEmbedOpen(true)}
        className={bracketToolbarIconButtonClass}
        aria-label="Embed Brackets"
        title="Embed Brackets"
      >
        <Code2 size={16} className="shrink-0" />
      </button>
      <button
        type="button"
        onClick={handlePrint}
        className={bracketToolbarIconButtonClass}
        aria-label="Printed Brackets"
        title="Printed Brackets"
      >
        <Printer size={16} className="shrink-0" />
      </button>
    </div>
  );

  return (
    <>
      {inline ? (
        buttons
      ) : (
        <div className="flex gap-1 overflow-x-auto rounded-xl border border-slate-800 bg-slate-900 p-1 print:hidden">
          {buttons}
        </div>
      )}

      {embedOpen &&
        mounted &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md"
            role="dialog"
            aria-modal="true"
            aria-labelledby={dialogTitleId}
            onClick={() => setEmbedOpen(false)}
          >
            <div
              className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-3 border-b border-slate-800 px-5 py-4">
                <h2 id={dialogTitleId} className="text-lg font-semibold text-white">
                  Bracket Embed Code
                </h2>
                <button
                  type="button"
                  onClick={() => setEmbedOpen(false)}
                  className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-800 hover:text-white"
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-4 px-5 py-5">
                <div className="rounded-xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 via-slate-950 to-slate-950 px-4 py-3">
                  <p className="text-sm text-slate-300">
                    Upgrade to{' '}
                    <Link
                      href="/profile/subscriptions"
                      className="inline-flex items-center gap-1 font-semibold text-amber-200 underline decoration-amber-500/40 underline-offset-2 transition hover:text-amber-100"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <span className="inline-flex items-center gap-1 rounded border border-amber-500/50 bg-gradient-to-r from-amber-500/25 to-orange-500/20 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-200">
                        <Crown size={9} />
                        Premier
                      </span>
                      {SITE_NAME} Premier
                    </Link>{' '}
                    to remove advertisements from the embed.
                  </p>
                </div>

                <textarea
                  readOnly
                  value={embedCode}
                  rows={5}
                  className="w-full resize-none rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 font-mono text-xs leading-relaxed text-slate-300"
                />

                <button
                  type="button"
                  onClick={copyEmbedCode}
                  className="btn-primary inline-flex w-full items-center justify-center gap-2"
                >
                  {copied ? (
                    <>
                      <Check size={16} />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy size={16} />
                      Copy embed code
                    </>
                  )}
                </button>

                <p className="text-center text-sm text-slate-500">
                  Need help?{' '}
                  <Link
                    href="/features"
                    className="font-medium text-brand-300 hover:text-brand-200"
                    onClick={(event) => event.stopPropagation()}
                  >
                    View bracket embed instructions
                  </Link>
                  .
                </p>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
