'use client';

import Link from 'next/link';
import { Loader2, Pencil, Trash2, Trophy } from 'lucide-react';
import {
  TableActionsDropdown,
  tableActionsDangerItemClass,
  tableActionsItemClass,
} from '@/app/components/table-actions-dropdown';

export function TournamentTemplateActionsMenu({
  templateId,
  templateName,
  deleting,
  onDelete,
}: {
  templateId: string;
  templateName: string;
  deleting: boolean;
  onDelete: () => void;
}) {
  return (
    <TableActionsDropdown label={`Actions for ${templateName}`} menuClassName="min-w-[9.5rem]">
      {(close) => (
        <>
          <Link
            href={`/dashboard/tournaments/create?template=${templateId}`}
            onClick={close}
            className={tableActionsItemClass}
          >
            <Trophy size={14} />
            Create event
          </Link>
          <Link
            href={`/profile/tournament-templates/${templateId}/edit`}
            onClick={close}
            className={tableActionsItemClass}
          >
            <Pencil size={14} />
            Edit
          </Link>
          <button
            type="button"
            disabled={deleting}
            onClick={() => {
              close();
              onDelete();
            }}
            className={tableActionsDangerItemClass}
          >
            {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
            Delete
          </button>
        </>
      )}
    </TableActionsDropdown>
  );
}
