'use client';

import { useActionState, useState } from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import {
  createTournamentTemplate,
  updateTournamentTemplate,
} from '@/app/actions/tournament-templates';
import {
  TournamentBuilderForm,
  buildFieldsFromTournamentInitial,
  type TournamentBuilderFields,
} from '@/app/components/tournament-builder-form';
import type { TournamentTemplateFormInitial } from '@/lib/tournament-template';
import { generateTournamentDescription } from '@/lib/tournament-description';
import { GAME_TYPE_LABELS } from '@/lib/tournament-options';
import { FORMAT_LABELS } from '@/lib/tournament-labels';

export function TournamentTemplateForm({
  templateId,
  initial,
  timezoneHint,
  imageUploadEnabled = false,
  cancelHref = '/profile/tournament-templates',
}: {
  templateId?: string;
  initial?: TournamentTemplateFormInitial;
  timezoneHint?: string;
  imageUploadEnabled?: boolean;
  cancelHref?: string;
}) {
  const isEdit = Boolean(templateId);
  const [state, action, pending] = useActionState(
    isEdit ? updateTournamentTemplate : createTournamentTemplate,
    null,
  );
  const [fields, setFields] = useState<TournamentBuilderFields>(() =>
    buildFieldsFromTournamentInitial(initial),
  );

  function update<K extends keyof TournamentBuilderFields>(
    key: K,
    value: TournamentBuilderFields[K],
  ) {
    setFields((prev) => ({ ...prev, [key]: value }));
  }

  function handleGenerateDescription() {
    setFields((prev) => ({
      ...prev,
      description: generateTournamentDescription({
        name: prev.name,
        date: '',
        location: '',
        checkInTime: '',
        eventStartTime: '',
        format: prev.format,
        entryFee: prev.entryFee,
        prizePool: prev.prizePool,
        playerCap: prev.hasPlayerCap ? prev.playerCap : '',
        isRanked: prev.isRanked,
        gameType: prev.gameType,
      }),
    }));
  }

  return (
    <form action={action} className="min-w-0 space-y-6">
      {templateId && <input type="hidden" name="templateId" value={templateId} />}
      {state?.error && (
        <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {state.error}
        </p>
      )}

      <TournamentBuilderForm
        mode="template"
        fields={fields}
        update={update}
        imageUploadEnabled={imageUploadEnabled}
        timezoneHint={timezoneHint}
        templateName={fields.name}
        onTemplateNameChange={(name) => update('name', name)}
        onGenerateDescription={handleGenerateDescription}
        canGenerateDescription={fields.name.trim().length > 0}
      />

      <div className="rounded-xl border border-slate-800 bg-slate-900/40 px-4 py-3 text-xs text-slate-500">
        <p className="font-semibold uppercase tracking-wider text-slate-400">Template summary</p>
        <p className="mt-2 text-slate-400">
          {FORMAT_LABELS[fields.format] ?? fields.format} · {GAME_TYPE_LABELS[fields.gameType] ?? fields.gameType}
          {fields.stageType === 'two' ? ' · Two-stage' : ''} · {fields.isRanked ? 'Ranked' : 'Unranked'}
        </p>
      </div>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Link href={cancelHref} className="btn-secondary text-center">
          Cancel
        </Link>
        <button type="submit" disabled={pending} className="btn-primary inline-flex items-center justify-center gap-2 disabled:opacity-60">
          {pending ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Saving…
            </>
          ) : isEdit ? (
            'Save template'
          ) : (
            'Create template'
          )}
        </button>
      </div>
    </form>
  );
}
