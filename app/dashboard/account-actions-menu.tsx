'use client';

import { useEffect, useRef, useState, useTransition, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import {
  AlertTriangle,
  ChevronDown,
  ExternalLink,
  Loader2,
  MoreHorizontal,
  Pencil,
  Trash2,
  Trophy,
  UserRound,
  Shield,
  X,
} from 'lucide-react';
import { deleteUser, updateUser } from '@/app/actions/users';
import {
  ASSIGNABLE_ROLES,
  canManageProtectedAdminAccount,
  isProtectedAdminAccount,
  roleBadgeClass,
  roleLabel,
} from '@/lib/roles';
import { playerProfilePath } from '@/lib/player-profile';

export type AccountUser = {
  id: string;
  username: string;
  email: string;
  role: string;
  wins: number;
  losses: number;
  rankPoints: number;
};

function ModalPortal({
  open,
  onClose,
  labelledBy,
  children,
  disabled,
  sheetOnMobile = false,
}: {
  open: boolean;
  onClose: () => void;
  labelledBy: string;
  children: ReactNode;
  disabled?: boolean;
  sheetOnMobile?: boolean;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!open || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] overflow-y-auto overscroll-contain"
      role="dialog"
      aria-modal="true"
      aria-labelledby={labelledBy}
    >
      <button
        type="button"
        aria-label="Close dialog"
        onClick={onClose}
        disabled={disabled}
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
      />
      <div
        className={`relative z-10 flex min-h-full w-full justify-center ${
          sheetOnMobile ? 'items-end p-0 sm:items-center sm:p-4' : 'items-center p-4'
        }`}
      >
        <div className="w-full max-w-full sm:max-w-none" onClick={(e) => e.stopPropagation()}>
          {children}
        </div>
      </div>
    </div>,
    document.body,
  );
}

function EditField({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500">{label}</label>
      {children}
      {hint && <p className="text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

function SectionHeading({ icon: Icon, title }: { icon: typeof UserRound; title: string }) {
  return (
    <div className="flex items-center gap-2 border-b border-slate-800 bg-slate-900/50 px-4 py-2.5 sm:px-5 sm:py-3">
      <Icon size={14} className="shrink-0 text-brand-400" />
      <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400 sm:text-xs">{title}</h3>
    </div>
  );
}

export function AccountActionsMenu({
  user,
  currentUserId,
  currentUsername,
}: {
  user: AccountUser;
  currentUserId: string;
  currentUsername: string;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuPanelRef = useRef<HTMLDivElement>(null);

  const canManageAccount = canManageProtectedAdminAccount(
    { username: currentUsername },
    { username: user.username },
  );
  const isProtectedAccount = isProtectedAdminAccount(user);
  const canDelete = canManageAccount && user.id !== currentUserId;
  const canEdit = canManageAccount;
  const canChangeRole = canManageAccount && user.id !== currentUserId && !isProtectedAdminAccount(user);
  const profileHref = playerProfilePath(user.username);

  const [form, setForm] = useState({
    username: user.username,
    email: user.email,
    role: user.role,
    wins: String(user.wins),
    losses: String(user.losses),
    rankPoints: String(user.rankPoints),
  });

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!menuOpen) return;

    function updatePosition() {
      const trigger = triggerRef.current;
      if (!trigger) return;

      const rect = trigger.getBoundingClientRect();
      const menuWidth = 188;
      const gap = 6;
      const viewportPadding = 8;
      const estimatedMenuHeight = 132;

      let top = rect.bottom + gap;
      let left = rect.right - menuWidth;

      if (left < viewportPadding) left = viewportPadding;
      if (left + menuWidth > window.innerWidth - viewportPadding) {
        left = window.innerWidth - menuWidth - viewportPadding;
      }

      if (top + estimatedMenuHeight > window.innerHeight - viewportPadding) {
        top = rect.top - estimatedMenuHeight - gap;
      }

      setMenuPosition({ top, left });
    }

    updatePosition();
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);
    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;

    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (triggerRef.current?.contains(target) || menuPanelRef.current?.contains(target)) return;
      setMenuOpen(false);
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setMenuOpen(false);
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [menuOpen]);

  useEffect(() => {
    const modalOpen = editOpen || deleteOpen;
    if (!modalOpen) return;

    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && !isPending) {
        setEditOpen(false);
        setDeleteOpen(false);
        setError('');
      }
    }

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [editOpen, deleteOpen, isPending]);

  function openEdit() {
    if (!canEdit) return;
    setMenuOpen(false);
    setForm({
      username: user.username,
      email: user.email,
      role: user.role,
      wins: String(user.wins),
      losses: String(user.losses),
      rankPoints: String(user.rankPoints),
    });
    setError('');
    setEditOpen(true);
  }

  function openDelete() {
    if (!canDelete) return;
    setMenuOpen(false);
    setError('');
    setDeleteOpen(true);
  }

  function closeEdit() {
    if (isPending) return;
    setEditOpen(false);
    setError('');
  }

  function closeDelete() {
    if (isPending) return;
    setDeleteOpen(false);
    setError('');
  }

  function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    const wins = Number(form.wins);
    const losses = Number(form.losses);
    const rankPoints = Number(form.rankPoints);

    if (Number.isNaN(wins) || Number.isNaN(losses) || Number.isNaN(rankPoints)) {
      setError('Wins, losses, and points must be numbers.');
      return;
    }

    startTransition(async () => {
      try {
        await updateUser({
          userId: user.id,
          username: form.username,
          email: form.email,
          role: form.role,
          wins,
          losses,
          rankPoints,
        });
        setEditOpen(false);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to update account.');
      }
    });
  }

  function confirmDelete() {
    setError('');
    startTransition(async () => {
      try {
        await deleteUser(user.id);
        setDeleteOpen(false);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to delete account.');
      }
    });
  }

  const menuItems = [
    {
      label: 'View profile',
      icon: ExternalLink,
      onClick: () => setMenuOpen(false),
      href: profileHref,
      tone: 'default' as const,
    },
    {
      label: 'Edit account',
      icon: Pencil,
      onClick: openEdit,
      disabled: !canEdit,
      disabledReason: 'The main admin account cannot be modified',
      tone: 'default' as const,
    },
    {
      label: 'Delete account',
      icon: Trash2,
      onClick: openDelete,
      disabled: !canDelete,
      disabledReason: user.id === currentUserId
        ? 'You cannot delete your own account'
        : 'The main admin account cannot be deleted',
      tone: 'danger' as const,
    },
  ];

  return (
    <>
      <div className="relative inline-flex">
        <button
          ref={triggerRef}
          type="button"
          onClick={() =>
            setMenuOpen((v) => {
              if (v) setMenuPosition(null);
              return !v;
            })
          }
          aria-expanded={menuOpen}
          aria-haspopup="menu"
          className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
            menuOpen
              ? 'border-brand-500/40 bg-slate-800 text-white'
              : 'border-slate-700 bg-slate-900/80 text-slate-300 hover:border-slate-600 hover:bg-slate-800 hover:text-white'
          }`}
        >
          <MoreHorizontal size={14} className="text-slate-400" />
          Actions
          <ChevronDown
            size={14}
            className={`text-slate-500 transition ${menuOpen ? 'rotate-180' : ''}`}
          />
        </button>
      </div>

      {mounted &&
        menuOpen &&
        menuPosition &&
        createPortal(
          <div
            ref={menuPanelRef}
            role="menu"
            style={{ top: menuPosition.top, left: menuPosition.left }}
            className="fixed z-[90] min-w-[188px] overflow-hidden rounded-xl border border-slate-800 bg-slate-950 py-1 shadow-xl shadow-black/40"
          >
            {menuItems.map((item) => {
              const Icon = item.icon;
              const className = `flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm font-medium transition ${
                item.disabled
                  ? 'cursor-not-allowed text-slate-600'
                  : item.tone === 'danger'
                  ? 'text-red-300 hover:bg-red-500/10'
                  : 'text-slate-200 hover:bg-slate-800'
              }`;

              if (item.href && !item.disabled) {
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    role="menuitem"
                    onClick={item.onClick}
                    className={className}
                  >
                    <Icon size={15} className="text-slate-400" />
                    {item.label}
                  </Link>
                );
              }

              return (
                <button
                  key={item.label}
                  type="button"
                  role="menuitem"
                  onClick={item.onClick}
                  disabled={item.disabled}
                  title={item.disabled ? item.disabledReason : undefined}
                  className={className}
                >
                  <Icon size={15} className={item.tone === 'danger' ? 'text-red-400' : 'text-slate-400'} />
                  {item.label}
                </button>
              );
            })}
          </div>,
          document.body,
        )}

      <ModalPortal open={editOpen} onClose={closeEdit} labelledBy="edit-user-title" disabled={isPending} sheetOnMobile>
        <div className="mx-auto flex max-h-[92dvh] w-full max-w-xl flex-col overflow-hidden rounded-t-2xl border border-slate-800 bg-slate-950 shadow-2xl shadow-black/50 sm:max-h-[min(90dvh,48rem)] sm:rounded-2xl">
          <div className="h-1 shrink-0 bg-gradient-to-r from-transparent via-brand-500 to-transparent" />

          <div className="shrink-0 border-b border-slate-800 bg-gradient-to-br from-brand-500/10 to-transparent px-4 py-4 sm:px-6 sm:py-5">
            <div className="flex items-start justify-between gap-3 sm:gap-4">
              <div className="min-w-0 pr-2">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-300/80">
                  Account management
                </p>
                <h2 id="edit-user-title" className="mt-1 text-base font-semibold text-white sm:text-lg">
                  Edit account
                </h2>
                <p className="mt-1 text-xs text-slate-400 sm:text-sm">Update profile, access, and circuit record.</p>
              </div>
              <button
                type="button"
                onClick={closeEdit}
                disabled={isPending}
                className="shrink-0 rounded-lg border border-slate-700 bg-slate-900 p-1.5 text-slate-400 transition hover:text-white disabled:opacity-60"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          <form onSubmit={handleEditSubmit} className="flex min-h-0 flex-1 flex-col">
            <div className="flex-1 overflow-y-auto overscroll-contain">
              <div className="border-b border-slate-800 px-4 py-4 sm:px-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-brand-500/30 bg-brand-500/10 text-base font-bold text-brand-200 sm:h-12 sm:w-12 sm:text-lg">
                      {user.username.charAt(0).toUpperCase()}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-white sm:text-base">{user.username}</p>
                      <p className="truncate text-xs text-slate-400 sm:text-sm">{user.email}</p>
                    </div>
                  </div>
                  <span
                    className={`self-start rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-wider sm:ml-auto ${roleBadgeClass(user.role)}`}
                  >
                    {roleLabel(user.role)}
                  </span>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 sm:mt-4">
                  {[
                    { label: 'Wins', value: user.wins },
                    { label: 'Losses', value: user.losses },
                    { label: 'Points', value: user.rankPoints },
                  ].map(({ label, value }) => (
                    <div
                      key={label}
                      className="rounded-xl border border-slate-800 bg-slate-900/60 px-2 py-2 text-center sm:px-3 sm:py-2.5"
                    >
                      <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-500 sm:text-[10px]">
                        {label}
                      </p>
                      <p className="mt-0.5 text-base font-bold tabular-nums text-white sm:text-lg">{value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="overflow-hidden border-b border-slate-800">
                <SectionHeading icon={UserRound} title="Profile" />
                <div className="space-y-4 px-4 py-4 sm:px-6">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <EditField
                      label="Username"
                      hint={isProtectedAccount ? 'The main admin username cannot be changed.' : undefined}
                    >
                      <input
                        type="text"
                        required
                        minLength={3}
                        value={form.username}
                        onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
                        disabled={isProtectedAccount}
                        className="input disabled:cursor-not-allowed disabled:opacity-60"
                      />
                    </EditField>
                    <EditField label="Email">
                      <input
                        type="email"
                        required
                        value={form.email}
                        onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                        className="input"
                      />
                    </EditField>
                  </div>
                </div>
              </div>

              <div className="overflow-hidden border-b border-slate-800">
                <SectionHeading icon={Shield} title="Access" />
                <div className="px-4 py-4 sm:px-6">
                  <EditField
                    label="Role"
                    hint={
                      !canChangeRole
                        ? isProtectedAccount
                          ? 'The main admin role cannot be changed.'
                          : 'You cannot change your own role.'
                        : undefined
                    }
                  >
                    {canChangeRole ? (
                      <div className="grid grid-cols-1 gap-2 min-[420px]:grid-cols-3">
                        {ASSIGNABLE_ROLES.map(({ value, label }) => {
                          const selected = form.role === value;
                          return (
                            <button
                              key={value}
                              type="button"
                              onClick={() => setForm((f) => ({ ...f, role: value }))}
                              className={`w-full rounded-lg border px-4 py-2.5 text-sm font-semibold transition sm:py-2 ${
                                selected
                                  ? value === 'admin'
                                    ? 'border-brand-500/50 bg-brand-500/15 text-brand-200'
                                    : value === 'organizer'
                                      ? 'border-sky-500/50 bg-sky-500/15 text-sky-200'
                                      : 'border-slate-600 bg-slate-800 text-white'
                                  : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                              }`}
                            >
                              {label}
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold capitalize ${roleBadgeClass(user.role)}`}
                      >
                        {roleLabel(user.role)}
                      </span>
                    )}
                  </EditField>
                </div>
              </div>

              <div className="overflow-hidden border-b border-slate-800">
                <SectionHeading icon={Trophy} title="Circuit record" />
                <div className="px-4 py-4 sm:px-6">
                  <div className="grid grid-cols-1 gap-4 min-[420px]:grid-cols-3">
                    <EditField label="Wins">
                      <input
                        type="number"
                        min={0}
                        required
                        value={form.wins}
                        onChange={(e) => setForm((f) => ({ ...f, wins: e.target.value }))}
                        className="input tabular-nums"
                      />
                    </EditField>
                    <EditField label="Losses">
                      <input
                        type="number"
                        min={0}
                        required
                        value={form.losses}
                        onChange={(e) => setForm((f) => ({ ...f, losses: e.target.value }))}
                        className="input tabular-nums"
                      />
                    </EditField>
                    <EditField label="Rank points">
                      <input
                        type="number"
                        min={0}
                        required
                        value={form.rankPoints}
                        onChange={(e) => setForm((f) => ({ ...f, rankPoints: e.target.value }))}
                        className="input tabular-nums"
                      />
                    </EditField>
                  </div>
                </div>
              </div>

              {error && (
                <p className="mx-4 mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-300 sm:mx-6">
                  {error}
                </p>
              )}
            </div>

            <div className="flex shrink-0 flex-col-reverse gap-2 border-t border-slate-800 bg-slate-900/80 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:flex-row sm:justify-end sm:gap-3 sm:px-6 sm:py-4">
              <button
                type="button"
                onClick={closeEdit}
                disabled={isPending}
                className="btn-secondary w-full disabled:opacity-60 sm:w-auto"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="btn-primary inline-flex w-full items-center justify-center gap-2 disabled:opacity-60 sm:w-auto"
              >
                {isPending ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Saving…
                  </>
                ) : (
                  'Save changes'
                )}
              </button>
            </div>
          </form>
        </div>
      </ModalPortal>

      <ModalPortal open={deleteOpen} onClose={closeDelete} labelledBy="delete-user-title" disabled={isPending}>
        <div className="mx-auto max-w-md overflow-hidden rounded-2xl border border-red-500/25 bg-slate-900 shadow-2xl shadow-red-950/30">
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
                  <h2 id="delete-user-title" className="mt-1 text-lg font-semibold text-white">
                    Delete account?
                  </h2>
                </div>
              </div>
              <button
                type="button"
                onClick={closeDelete}
                disabled={isPending}
                className="rounded-lg border border-slate-700 bg-slate-800 p-1.5 text-slate-400 transition hover:text-white disabled:opacity-60"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          <div className="space-y-4 px-6 py-5">
            <div className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-950 px-4 py-3">
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-700 bg-slate-800 text-sm font-bold text-white">
                {user.username.charAt(0).toUpperCase()}
              </span>
              <div className="min-w-0">
                <p className="truncate font-semibold text-white">{user.username}</p>
                <p className="truncate text-xs text-slate-400">{user.email}</p>
              </div>
              <span className="ml-auto shrink-0 rounded-full border border-slate-700 bg-slate-800 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                {user.role}
              </span>
            </div>

            <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3">
              <div className="flex gap-2.5">
                <AlertTriangle size={16} className="mt-0.5 shrink-0 text-red-400" />
                <div className="text-sm text-slate-300">
                  <p className="font-medium text-red-200">This action cannot be undone.</p>
                  <ul className="mt-2 list-inside list-disc space-y-1 text-slate-400">
                    <li>Account and login access removed</li>
                    <li>Tournament registrations cleared</li>
                    <li>Match history unlinked from this user</li>
                  </ul>
                </div>
              </div>
            </div>

            {error && (
              <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-300">
                {error}
              </p>
            )}
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-slate-800 bg-slate-950/50 px-6 py-4 sm:flex-row sm:justify-end">
            <button type="button" onClick={closeDelete} disabled={isPending} className="btn-secondary disabled:opacity-60">
              Cancel
            </button>
            <button
              type="button"
              onClick={confirmDelete}
              disabled={isPending}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-500/50 bg-red-600/20 px-5 py-2.5 text-sm font-semibold text-red-200 transition hover:border-red-400/70 hover:bg-red-600/30 disabled:opacity-60"
            >
              <Trash2 size={15} />
              {isPending ? 'Deleting…' : 'Delete account'}
            </button>
          </div>
        </div>
      </ModalPortal>
    </>
  );
}
