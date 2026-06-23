'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { FileStack, Loader2, Pencil, Plus, Trash2, Trophy } from 'lucide-react';
import { deleteTournamentTemplate } from '@/app/actions/tournament-templates';
import { SuccessToast } from '@/app/components/success-toast';
import { FORMAT_LABELS } from '@/lib/tournament-labels';
import { GAME_TYPE_LABELS } from '@/lib/tournament-options';

type TemplateRow = {
  id: string;
  name: string;
  format: string;
  gameType: string;
  groupStageEnabled: boolean;
  isRanked: boolean;
  updatedAt: string;
};

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

      <div className="flex flex-wrap items-center justify-between gap-3">
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
        <div className="mt-6 space-y-3">
          {templates.map((template) => (
            <div
              key={template.id}
              className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-950/60 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="font-semibold text-white">{template.name}</p>
                <p className="mt-1 text-sm text-slate-400">
                  {FORMAT_LABELS[template.format] ?? template.format} ·{' '}
                  {GAME_TYPE_LABELS[template.gameType] ?? template.gameType}
                  {template.groupStageEnabled ? ' · Two-stage' : ''} ·{' '}
                  {template.isRanked ? 'Ranked' : 'Unranked'}
                </p>
                <p className="mt-1 text-xs text-slate-600">
                  Updated {new Date(template.updatedAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link
                  href={`/dashboard/tournaments/create?template=${template.id}`}
                  className="btn-secondary inline-flex items-center gap-1.5 text-sm"
                >
                  <Trophy size={14} />
                  Create event
                </Link>
                <Link
                  href={`/profile/tournament-templates/${template.id}/edit`}
                  className="btn-secondary inline-flex items-center gap-1.5 text-sm"
                >
                  <Pencil size={14} />
                  Edit
                </Link>
                <button
                  type="button"
                  onClick={() => handleDelete(template.id, template.name)}
                  disabled={isPending && deletingId === template.id}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm font-semibold text-red-300 transition hover:bg-red-500/15 disabled:opacity-60"
                >
                  {isPending && deletingId === template.id ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Trash2 size={14} />
                  )}
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
