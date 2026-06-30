'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, BookmarkPlus, CheckCircle2, ChevronDown } from 'lucide-react';
import { FORMAT_LABELS } from '@/lib/tournament-labels';
import { GAME_TYPE_OPTIONS } from '@/lib/tournament-options';

export type TournamentTemplateOption = {
  id: string;
  name: string;
  format: string;
  gameType: string;
  isRanked: boolean;
  groupStageEnabled: boolean;
};

const GAME_TYPE_LABELS: Record<string, string> = Object.fromEntries(
  GAME_TYPE_OPTIONS.map((o) => [o.value, o.label]),
);

function templateSummary(template: TournamentTemplateOption): string {
  const parts = [
    FORMAT_LABELS[template.format] ?? template.format,
    GAME_TYPE_LABELS[template.gameType] ?? template.gameType,
    template.groupStageEnabled ? 'Two-stage' : null,
    template.isRanked ? 'Ranked' : 'Unranked',
  ].filter(Boolean);
  return parts.join(' · ');
}

export function TournamentTemplatePicker({
  templates,
  selectedTemplateId,
}: {
  templates: TournamentTemplateOption[];
  selectedTemplateId?: string;
}) {
  const router = useRouter();
  const appliedId = selectedTemplateId ?? '';
  const [draftId, setDraftId] = useState(appliedId);

  useEffect(() => {
    setDraftId(appliedId);
  }, [appliedId]);

  const appliedTemplate = templates.find((t) => t.id === appliedId);
  const draftTemplate = templates.find((t) => t.id === draftId);
  const isApplied = Boolean(appliedId && draftId === appliedId);
  const hasPendingChange = draftId !== appliedId;

  function applySelection() {
    router.push(
      draftId
        ? `/dashboard/tournaments/create?template=${encodeURIComponent(draftId)}`
        : '/dashboard/tournaments/create',
    );
  }

  return (
    <div className="card mb-6 overflow-hidden">
      <div className="border-b border-slate-800 bg-slate-900/50 px-4 py-3">
        <h3 className="text-sm font-semibold text-white">Template</h3>
        <p className="mt-0.5 text-xs text-slate-500">
          Optionally start from a saved template — format, fees, and rules are prefilled.
        </p>
      </div>
      <div className="p-4">
        {templates.length === 0 ? (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-400">
              You don&apos;t have any saved templates yet. Save one from an existing tournament or
              create a new template in your profile.
            </p>
            <Link
              href="/profile/tournament-templates/new"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm font-semibold text-slate-200 transition hover:border-brand-500/40 hover:text-white"
            >
              <BookmarkPlus size={15} />
              New template
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <label
                htmlFor="tournament-template"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400"
              >
                Select template
              </label>
              <div className="relative">
                <select
                  id="tournament-template"
                  value={draftId}
                  onChange={(e) => setDraftId(e.target.value)}
                  className="w-full appearance-none rounded-lg border border-slate-700 bg-slate-900 py-2.5 pl-3 pr-10 text-sm text-white focus:border-brand-500/50 focus:outline-none focus:ring-1 focus:ring-brand-500/30"
                >
                  <option value="">Start from scratch</option>
                  {templates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name} — {templateSummary(template)}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={16}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
                  aria-hidden
                />
              </div>
            </div>

            {isApplied && appliedTemplate && (
              <div className="flex items-start gap-2.5 rounded-lg border border-emerald-500/25 bg-emerald-500/5 px-3 py-2.5">
                <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-400" />
                <p className="text-xs leading-relaxed text-slate-300">
                  <span className="font-semibold text-emerald-200">{appliedTemplate.name}</span> is
                  applied. Event details below are prefilled — add date, location, and schedule,
                  then create the tournament.
                </p>
              </div>
            )}

            {hasPendingChange && (
              <button
                type="button"
                onClick={applySelection}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-400 sm:w-auto"
              >
                {draftId ? 'Use this template' : 'Start from scratch'}
                <ArrowRight size={15} />
              </button>
            )}

            {!hasPendingChange && !isApplied && (
              <p className="text-xs text-slate-500">
                Pick a template above, then click{' '}
                <span className="font-medium text-slate-400">Use this template</span>. Or{' '}
                <Link
                  href="/profile/tournament-templates"
                  className="font-medium text-brand-400 hover:text-brand-300"
                >
                  manage templates
                </Link>
                .
              </p>
            )}

            {hasPendingChange && draftTemplate && (
              <p className="text-xs text-slate-500">{templateSummary(draftTemplate)}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
