'use client';

import { useEffect, useId, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, Code2, Copy, Printer, X } from 'lucide-react';

export function BracketShareActions({ tournamentId }: { tournamentId: string }) {
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
      `<iframe src="${origin}/tournaments/${tournamentId}/embed" width="100%" height="640" style="border:0;border-radius:12px" title="Tournament bracket" loading="lazy"></iframe>`,
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

  return (
    <>
      <div className="flex flex-wrap items-center gap-2 print:hidden">
        <button
          type="button"
          onClick={() => setEmbedOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:border-slate-600 hover:bg-slate-800"
        >
          <Code2 size={14} />
          Embed Brackets
        </button>
        <button
          type="button"
          onClick={handlePrint}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:border-slate-600 hover:bg-slate-800"
        >
          <Printer size={14} />
          Printed Brackets
        </button>
      </div>

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
                <div>
                  <h2 id={dialogTitleId} className="text-lg font-semibold text-white">
                    Embed Brackets
                  </h2>
                  <p className="mt-1 text-sm text-slate-400">
                    Paste this code on your site to embed the live bracket.
                  </p>
                </div>
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
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
