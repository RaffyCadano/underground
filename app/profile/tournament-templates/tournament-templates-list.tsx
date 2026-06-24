'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { FileStack, Plus } from 'lucide-react';
import { deleteTournamentTemplate } from '@/app/actions/tournament-templates';
import { SuccessToast } from '@/app/components/success-toast';
import { FORMAT_LABELS } from '@/lib/tournament-labels';
import { GAME_TYPE_LABELS } from '@/lib/tournament-options';
import { TournamentTemplateActionsMenu } from './tournament-template-actions-menu';

type TemplateRow = {
  id: string;
  name: string;
  format: string;
  gameType: string;
  groupStageEnabled: boolean;
  isRanked: boolean;
  updatedAt: string;
};

const thClass = 'px-3 py-2.5 text-xs font-semibold uppercase tracking-wider';
const tdClass = 'px-3 py-2.5 align-middle';

function formatUpdated(date: string) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'numeric',
    day: 'numeric',
    year: 'numeric',
  });
}

function templateDetails(template: TemplateRow) {
  const parts = [
    GAME_TYPE_LABELS[template.gameType] ?? template.gameType,
    template.groupStageEnabled ? 'Two-stage' : null,
    template.isRanked ? 'Ranked' : 'Unranked',
  ].filter(Boolean);
  return parts.join(' · ');
}

export function TournamentTemplatesList({
  templates,
  showCreatedToast,
  showUpdatedToast,
}: {
  templates: TemplateRow[];
  showCreatedToast: boolean;
  showUpdatedToast: boolean;
}) {
  const router = useRouter();
  const [toast, setToast] = useState<'created' | 'updated' | null>(
    showCreatedToast ? 'created' : showUpdatedToast ? 'updated' : null,
  );
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleDelete(id: string, name: string) {
    if (!window.confirm(`Delete template "${name}"?`)) return;
    setDeletingId(id);
    startTransition(async () => {
      const result = await deleteTournamentTemplate(id);
      setDeletingId(null);
      if (result.error) {
        window.alert(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <>
      <SuccessToast
        open={toast === 'created'}
        title="Template created"
        body="Your tournament template is ready to reuse."
        onDismiss={() => setToast(null)}
      />
      <SuccessToast
        open={toast === 'updated'}
        title="Template saved"
        body="Your template changes have been updated."
        onDismiss={() => setToast(null)}
      />

      <div className="flex flex-wrap items-center justify-end gap-3">
        <Link href="/profile/tournament-templates/new" className="btn-primary inline-flex items-center gap-2">
          <Plus size={16} />
          New Template
        </Link>
      </div>

      {templates.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-slate-800 bg-slate-950/40 px-6 py-12 text-center">
          <FileStack className="mx-auto text-slate-600" size={32} />
          <p className="mt-4 font-semibold text-white">No templates yet</p>
          <p className="mt-2 text-sm text-slate-500">
            Save bracket formats, rules, and registration defaults to spin up events faster.
          </p>
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-800 bg-slate-950">
          <div className="overflow-x-auto">
            <table className="min-w-[40rem] w-full text-left text-sm">
              <thead className="border-b border-slate-800 bg-slate-900/80 text-slate-400">
                <tr>
                  <th className={`${thClass} min-w-[10rem]`}>Template</th>
                  <th className={`${thClass} min-w-[8rem]`}>Format</th>
                  <th className={`${thClass} hidden min-w-[10rem] md:table-cell`}>Details</th>
                  <th className={`${thClass} min-w-[6rem]`}>Ranked</th>
                  <th className={`${thClass} hidden min-w-[6rem] sm:table-cell`}>Updated</th>
                  <th className={`${thClass} w-12 text-right`}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {templates.map((template) => {
                  const formatLabel = FORMAT_LABELS[template.format] ?? template.format;
                  const details = templateDetails(template);

                  return (
                    <tr
                      key={template.id}
                      className="border-t border-slate-800/80 transition hover:bg-slate-900/50"
                    >
                      <td className={tdClass}>
                        <div className="min-w-0">
                          <p className="truncate font-medium text-white">{template.name}</p>
                          <p className="mt-0.5 truncate text-xs text-slate-500 md:hidden">
                            {formatLabel} · {details}
                          </p>
                          <p className="mt-0.5 text-xs text-slate-600 sm:hidden">
                            Updated {formatUpdated(template.updatedAt)}
                          </p>
                        </div>
                      </td>
                      <td className={`${tdClass} text-slate-300`}>{formatLabel}</td>
                      <td className={`${tdClass} hidden text-slate-400 md:table-cell`}>{details}</td>
                      <td className={tdClass}>
                        <span
                          className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                            template.isRanked
                              ? 'border-brand-500/35 bg-brand-500/10 text-brand-300'
                              : 'border-slate-700 bg-slate-800 text-slate-500'
                          }`}
                        >
                          {template.isRanked ? 'Ranked' : 'Unranked'}
                        </span>
                      </td>
                      <td className={`${tdClass} hidden whitespace-nowrap text-slate-400 sm:table-cell`}>
                        {formatUpdated(template.updatedAt)}
                      </td>
                      <td className={`${tdClass} text-right`}>
                        <TournamentTemplateActionsMenu
                          templateId={template.id}
                          templateName={template.name}
                          deleting={isPending && deletingId === template.id}
                          onDelete={() => handleDelete(template.id, template.name)}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
