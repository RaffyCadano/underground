'use client';

import { useEffect, useState, useTransition } from 'react';
import { createPortal } from 'react-dom';
import { Shield, X } from 'lucide-react';
import { updateUserRole } from '@/app/actions/users';
import { ASSIGNABLE_ROLES, isAdminRole, isProtectedAdminAccount } from '@/lib/roles';

export function AccountRoleButton({
  userId,
  username,
  role,
  currentUserId,
}: {
  userId: string;
  username: string;
  role: string;
  currentUserId: string;
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [selectedRole, setSelectedRole] = useState(role);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');

  const isSelf = userId === currentUserId;
  const isAdmin = isAdminRole(role);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    setSelectedRole(role);
    setError('');

    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && !isPending) setOpen(false);
    }

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open, role, isPending]);

  function closeModal() {
    if (isPending) return;
    setOpen(false);
    setError('');
  }

  function confirmRoleChange() {
    setError('');
    startTransition(async () => {
      try {
        await updateUserRole(userId, selectedRole);
        setOpen(false);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to update role.');
      }
    });
  }

  if (isSelf || isProtectedAdminAccount({ username })) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
          isAdmin
            ? 'border-brand-500/35 bg-brand-500/10 text-brand-200 hover:border-brand-400/50 hover:bg-brand-500/20'
            : role === 'organizer'
              ? 'border-sky-500/35 bg-sky-500/10 text-sky-200 hover:border-sky-400/50 hover:bg-sky-500/20'
              : 'border-slate-700 bg-slate-900/80 text-slate-300 hover:border-slate-600 hover:bg-slate-800 hover:text-white'
        }`}
      >
        <Shield size={14} className={isAdmin ? 'text-brand-400' : role === 'organizer' ? 'text-sky-400' : 'text-slate-500'} />
        Role
      </button>

      {mounted &&
        open &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="role-user-title"
          >
            <button
              type="button"
              aria-label="Close dialog"
              onClick={closeModal}
              disabled={isPending}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />

            <div
              className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl shadow-black/50"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="border-b border-slate-800 bg-slate-950/80 px-6 py-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-brand-500/30 bg-brand-500/10 text-brand-300">
                      <Shield size={20} />
                    </span>
                    <div>
                      <h2 id="role-user-title" className="text-lg font-semibold text-white">
                        Change role
                      </h2>
                      <p className="mt-1 text-sm text-slate-400">Update access for {username}.</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={closeModal}
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
                    {username.charAt(0).toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-white">{username}</p>
                    <p className="text-xs capitalize text-slate-400">Current: {role}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300">New role</label>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    disabled={isPending}
                    className="select mt-1"
                  >
                    {ASSIGNABLE_ROLES.map(({ value, label }) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                {error && (
                  <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-300">
                    {error}
                  </p>
                )}
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-slate-800 bg-slate-950/50 px-6 py-4 sm:flex-row sm:justify-end">
                <button type="button" onClick={closeModal} disabled={isPending} className="btn-secondary disabled:opacity-60">
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmRoleChange}
                  disabled={isPending || selectedRole === role}
                  className="btn-primary disabled:opacity-60"
                >
                  {isPending ? 'Saving…' : 'Save role'}
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
