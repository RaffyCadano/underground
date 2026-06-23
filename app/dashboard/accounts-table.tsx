'use client';

import { useEffect, useMemo, useRef, useState, useTransition } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { AlertTriangle, Copy, Download, Loader2, Trash2, X } from 'lucide-react';
import { deleteUsers } from '@/app/actions/users';
import { AccountActionsMenu } from '@/app/dashboard/account-actions-menu';
import { AccountRoleButton } from '@/app/dashboard/account-role-button';
import { SuccessToast } from '@/app/components/success-toast';
import {
  canManageProtectedAdminAccount,
  isProtectedAdminAccount,
  roleBadgeClass,
  roleLabel,
} from '@/lib/roles';

export type AccountRow = {
  id: string;
  username: string;
  email: string;
  role: string;
  rankPoints: number;
  wins: number;
  losses: number;
  joinedLabel: string;
};

const thClass =
  'whitespace-nowrap px-3 py-3 text-xs font-semibold uppercase tracking-wider sm:px-4 xl:px-5';
const tdClass = 'px-3 py-3.5 sm:px-4 sm:py-4 xl:px-5';

function RoleBadge({ role }: { role: string }) {
  return (
    <span
      className={`inline-flex shrink-0 rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${roleBadgeClass(role)}`}
    >
      {roleLabel(role)}
    </span>
  );
}

function csvEscape(value: string) {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function rowsToTsv(rows: AccountRow[]) {
  const header = ['Username', 'Email', 'Role', 'Record', 'Points', 'Joined'];
  const lines = rows.map((row) =>
    [row.username, row.email, row.role, `${row.wins}-${row.losses}`, String(row.rankPoints), row.joinedLabel].join(
      '\t',
    ),
  );
  return [header.join('\t'), ...lines].join('\n');
}

function rowsToCsv(rows: AccountRow[]) {
  const header = ['Username', 'Email', 'Role', 'Record', 'Points', 'Joined'];
  const lines = rows.map((row) =>
    [
      csvEscape(row.username),
      csvEscape(row.email),
      csvEscape(row.role),
      csvEscape(`${row.wins}-${row.losses}`),
      csvEscape(String(row.rankPoints)),
      csvEscape(row.joinedLabel),
    ].join(','),
  );
  return [header.join(','), ...lines].join('\n');
}

function AccountActions({
  user,
  currentUserId,
  currentUsername,
}: {
  user: AccountRow;
  currentUserId: string;
  currentUsername: string;
}) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <AccountRoleButton
        userId={user.id}
        username={user.username}
        role={user.role}
        currentUserId={currentUserId}
      />
      <AccountActionsMenu
        user={user}
        currentUserId={currentUserId}
        currentUsername={currentUsername}
      />
    </div>
  );
}

export function AccountsTable({
  users,
  currentUserId,
  currentUsername,
}: {
  users: AccountRow[];
  currentUserId: string;
  currentUsername: string;
}) {
  const router = useRouter();
  const selectAllRef = useRef<HTMLInputElement>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [actionMessage, setActionMessage] = useState('');
  const [actionError, setActionError] = useState('');
  const [successToastOpen, setSuccessToastOpen] = useState(false);
  const [successToastTitle, setSuccessToastTitle] = useState('');
  const [successToastBody, setSuccessToastBody] = useState('');
  const [isPending, startTransition] = useTransition();

  const selectedUsers = useMemo(
    () => users.filter((user) => selectedIds.has(user.id)),
    [users, selectedIds],
  );

  const allSelected = users.length > 0 && selectedIds.size === users.length;
  const someSelected = selectedIds.size > 0 && !allSelected;

  const deletableSelected = useMemo(
    () =>
      selectedUsers.filter((user) => {
        if (user.id === currentUserId) return false;
        if (isProtectedAdminAccount(user)) {
          return canManageProtectedAdminAccount(
            { username: currentUsername },
            { username: user.username },
          );
        }
        return true;
      }),
    [selectedUsers, currentUserId, currentUsername],
  );

  function toggleRow(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setActionMessage('');
    setActionError('');
  }

  function toggleAll() {
    setSelectedIds(allSelected ? new Set() : new Set(users.map((user) => user.id)));
    setActionMessage('');
    setActionError('');
  }

  async function handleCopy() {
    if (selectedUsers.length === 0) return;
    try {
      await navigator.clipboard.writeText(rowsToTsv(selectedUsers));
      setActionMessage(`Copied ${selectedUsers.length} row${selectedUsers.length === 1 ? '' : 's'} to clipboard.`);
      setActionError('');
    } catch {
      setActionError('Could not copy to clipboard.');
      setActionMessage('');
    }
  }

  function handleExport() {
    if (selectedUsers.length === 0) return;
    const blob = new Blob([rowsToCsv(selectedUsers)], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ugncbbx-accounts-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    setActionMessage(`Exported ${selectedUsers.length} row${selectedUsers.length === 1 ? '' : 's'}.`);
    setActionError('');
  }

  function openDeleteModal() {
    setDeleteError('');
    setDeleteOpen(true);
  }

  function closeDeleteModal() {
    if (isPending) return;
    setDeleteOpen(false);
    setDeleteError('');
  }

  function confirmBulkDelete() {
    if (deletableSelected.length === 0) {
      setDeleteError('None of the selected accounts can be deleted.');
      return;
    }

    setDeleteError('');

    startTransition(async () => {
      try {
        const result = await deleteUsers(deletableSelected.map((user) => user.id));

        if (result.deleted > 0) {
          setDeleteOpen(false);
          setSelectedIds(new Set());
          setSuccessToastTitle(
            `Deleted ${result.deleted} account${result.deleted === 1 ? '' : 's'}`,
          );
          setSuccessToastBody(
            result.skipped > 0
              ? `${result.skipped} protected account${result.skipped === 1 ? ' was' : 's were'} skipped.`
              : 'Selected accounts were permanently removed.',
          );
          setSuccessToastOpen(true);
          if (result.errors.length > 0) {
            setActionError(result.errors.join(' '));
          }
          router.refresh();
        } else {
          setDeleteError(result.errors.join(' ') || 'No accounts were deleted.');
        }
      } catch (error) {
        setDeleteError(error instanceof Error ? error.message : 'Failed to delete accounts.');
      }
    });
  }

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = someSelected;
    }
  }, [someSelected]);

  return (
    <>
      <div className="border-b border-slate-800 bg-slate-900/60 px-3 py-3 sm:px-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              disabled={selectedUsers.length === 0}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:border-slate-600 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Copy size={14} />
              Copy
            </button>
            <button
              type="button"
              onClick={handleExport}
              disabled={selectedUsers.length === 0}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:border-slate-600 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Download size={14} />
              Export
            </button>
            <button
              type="button"
              onClick={openDeleteModal}
              disabled={deletableSelected.length === 0 || isPending}
              className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-300 transition hover:border-red-400/40 hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Trash2 size={14} />
              Delete {deletableSelected.length > 0 ? deletableSelected.length : selectedUsers.length} row
              {(deletableSelected.length > 0 ? deletableSelected.length : selectedUsers.length) === 1 ? '' : 's'}
            </button>
          </div>

          <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-slate-300">
            <input
              ref={selectAllRef}
              type="checkbox"
              checked={allSelected}
              onChange={toggleAll}
              className="h-4 w-4 rounded border-slate-600 bg-slate-950 text-brand-500 focus:ring-brand-500/40"
            />
            Select all rows in table
          </label>
        </div>

        {(actionMessage || actionError) && (
          <p
            className={`mt-3 text-xs ${actionError ? 'text-red-300' : 'text-brand-300'}`}
            role={actionError ? 'alert' : 'status'}
          >
            {actionError || actionMessage}
          </p>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-[38rem] w-full text-left text-sm">
          <thead className="border-b border-slate-800 bg-slate-900 text-slate-400">
            <tr>
              <th className={`${thClass} w-10`}>
                <span className="sr-only">Select</span>
              </th>
              <th
                className={`${thClass} sticky left-10 z-20 min-w-[9rem] bg-slate-900 shadow-[4px_0_12px_-4px_rgba(0,0,0,0.5)] sm:min-w-[10rem]`}
              >
                User
              </th>
              <th className={`${thClass} hidden min-w-[10rem] md:table-cell`}>Email</th>
              <th className={`${thClass} min-w-[5rem]`}>Role</th>
              <th className={`${thClass} hidden min-w-[4.5rem] sm:table-cell`}>Record</th>
              <th className={`${thClass} hidden min-w-[4rem] lg:table-cell`}>Points</th>
              <th className={`${thClass} hidden min-w-[6.5rem] xl:table-cell`}>Joined</th>
              <th
                className={`${thClass} sticky right-0 z-20 min-w-[8.5rem] bg-slate-900 text-right shadow-[-4px_0_12px_-4px_rgba(0,0,0,0.5)]`}
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => {
              const checked = selectedIds.has(user.id);
              return (
                <tr
                  key={user.id}
                  className={`group border-t border-slate-800 transition hover:bg-slate-900/60 ${
                    checked ? 'bg-brand-500/5' : ''
                  }`}
                >
                  <td className={`${tdClass} w-10`}>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleRow(user.id)}
                      aria-label={`Select ${user.username}`}
                      className="h-4 w-4 rounded border-slate-600 bg-slate-950 text-brand-500 focus:ring-brand-500/40"
                    />
                  </td>
                  <td
                    className={`${tdClass} sticky left-10 z-10 min-w-[9rem] bg-slate-950 shadow-[4px_0_12px_-4px_rgba(0,0,0,0.5)] group-hover:bg-slate-900/60 sm:min-w-[10rem] ${
                      checked ? 'bg-brand-500/5' : ''
                    }`}
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium text-white">{user.username}</p>
                      <p className="mt-0.5 truncate text-xs text-slate-400 md:hidden">{user.email}</p>
                      <p className="mt-1 text-[11px] leading-relaxed text-slate-500 sm:hidden">
                        {user.wins}-{user.losses} · {user.rankPoints} pts · {user.joinedLabel}
                      </p>
                      <p className="mt-1 hidden text-[11px] text-slate-500 sm:block lg:hidden">
                        {user.rankPoints} pts
                      </p>
                      <p className="mt-1 hidden text-[11px] text-slate-500 sm:block xl:hidden">
                        Joined {user.joinedLabel}
                      </p>
                    </div>
                  </td>
                  <td className={`${tdClass} hidden max-w-[14rem] truncate text-slate-300 md:table-cell`}>
                    {user.email}
                  </td>
                  <td className={tdClass}>
                    <RoleBadge role={user.role} />
                  </td>
                  <td className={`${tdClass} hidden tabular-nums text-slate-300 sm:table-cell`}>
                    {user.wins}-{user.losses}
                  </td>
                  <td className={`${tdClass} hidden tabular-nums text-slate-300 lg:table-cell`}>
                    {user.rankPoints}
                  </td>
                  <td className={`${tdClass} hidden whitespace-nowrap text-slate-400 xl:table-cell`}>
                    {user.joinedLabel}
                  </td>
                  <td
                    className={`${tdClass} sticky right-0 z-10 min-w-[8.5rem] bg-slate-950 text-right shadow-[-4px_0_12px_-4px_rgba(0,0,0,0.5)] group-hover:bg-slate-900/60 ${
                      checked ? 'bg-brand-500/5' : ''
                    }`}
                  >
                    <AccountActions
                      user={user}
                      currentUserId={currentUserId}
                      currentUsername={currentUsername}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <SuccessToast
        open={successToastOpen}
        title={successToastTitle}
        body={successToastBody}
        onDismiss={() => setSuccessToastOpen(false)}
      />

      {deleteOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="bulk-delete-title"
          >
            <button
              type="button"
              aria-label="Close dialog"
              onClick={closeDeleteModal}
              disabled={isPending}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />
            <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl border border-red-500/25 bg-slate-900 shadow-2xl shadow-red-950/30">
              <div className="h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent" />

              <div className="border-b border-slate-800 bg-slate-950/80 px-6 py-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-red-500/40 bg-red-500/15 text-red-300">
                      <Trash2 size={20} />
                    </span>
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-red-400/90">
                        Danger zone
                      </p>
                      <h2 id="bulk-delete-title" className="mt-1 text-lg font-semibold text-white">
                        Delete {deletableSelected.length} account
                        {deletableSelected.length === 1 ? '' : 's'}?
                      </h2>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={closeDeleteModal}
                    disabled={isPending}
                    className="rounded-lg border border-slate-700 bg-slate-800 p-1.5 text-slate-400 transition hover:text-white disabled:opacity-60"
                    aria-label="Close"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              <div className="space-y-4 px-6 py-5">
                <div className="rounded-xl border border-slate-800 bg-slate-950 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    {deletableSelected.length} account{deletableSelected.length === 1 ? '' : 's'} will be removed
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {deletableSelected.slice(0, 8).map((user) => (
                      <span
                        key={user.id}
                        className="inline-flex max-w-[10rem] truncate rounded-full border border-slate-700 bg-slate-800/80 px-2.5 py-1 text-xs font-medium text-slate-200"
                      >
                        {user.username}
                      </span>
                    ))}
                    {deletableSelected.length > 8 && (
                      <span className="inline-flex rounded-full border border-slate-700 bg-slate-800/80 px-2.5 py-1 text-xs font-medium text-slate-400">
                        +{deletableSelected.length - 8} more
                      </span>
                    )}
                  </div>
                </div>

                <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3">
                  <div className="flex gap-2.5">
                    <AlertTriangle size={16} className="mt-0.5 shrink-0 text-red-400" />
                    <div className="text-sm text-slate-300">
                      <p className="font-medium text-red-200">This action cannot be undone.</p>
                      <ul className="mt-2 list-inside list-disc space-y-1 text-slate-400">
                        <li>Accounts and login access removed</li>
                        <li>Tournament registrations cleared</li>
                        <li>Match history unlinked from these users</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {selectedUsers.length > deletableSelected.length && (
                  <p className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-xs text-amber-200">
                    {selectedUsers.length - deletableSelected.length} protected or self account
                    {selectedUsers.length - deletableSelected.length === 1 ? '' : 's'} in your selection will be
                    skipped.
                  </p>
                )}

                {deleteError && (
                  <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-300">
                    {deleteError}
                  </p>
                )}
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-slate-800 bg-slate-950/50 px-6 py-4 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeDeleteModal}
                  disabled={isPending}
                  className="btn-secondary disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmBulkDelete}
                  disabled={isPending}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-500/50 bg-red-600/20 px-5 py-2.5 text-sm font-semibold text-red-200 transition hover:border-red-400/70 hover:bg-red-600/30 disabled:opacity-60"
                >
                  {isPending ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      Deleting…
                    </>
                  ) : (
                    <>
                      <Trash2 size={15} />
                      Delete {deletableSelected.length} account
                      {deletableSelected.length === 1 ? '' : 's'}
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
