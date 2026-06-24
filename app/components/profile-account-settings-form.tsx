'use client';

import { useActionState, useEffect, useId, useRef, useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { createPortal } from 'react-dom';
import { Info, Loader2, X, CheckCircle2 } from 'lucide-react';
import {
  addBlockedUser,
  removeBlockedUser,
  sendEmailVerification,
  updateAccountSettings,
  uploadProfileAvatar,
} from '@/app/actions/profile';
import { PlayerAvatar } from '@/app/components/player-avatar';
import { SuccessToast } from '@/app/components/success-toast';
import { prepareAvatarFile } from '@/lib/avatar-upload-client';
import {
  COUNTRY_OPTIONS,
  LANGUAGE_OPTIONS,
  TIMEZONE_OPTIONS,
} from '@/lib/profile-settings-options';
import { SITE_NAME } from '@/lib/site';

type BlockedRow = {
  id: string;
  identifier: string;
};

type User = {
  username: string;
  email: string;
  emailVerified: boolean;
  fullName: string | null;
  language: string;
  timezone: string;
  country: string;
  avatar: string | null;
  blockedUsers: BlockedRow[];
};

type Props = {
  user: User;
  hasPremier: boolean;
  uploadEnabled: boolean;
  canEditUsername: boolean;
};

function LabelTooltip({ text }: { text: string }) {
  const tooltipId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => setMounted(true), []);

  function updatePosition() {
    const button = buttonRef.current;
    if (!button) return;
    const rect = button.getBoundingClientRect();
    setPosition({
      top: rect.bottom + 8,
      left: rect.left + rect.width / 2,
    });
  }

  function show() {
    updatePosition();
    setOpen(true);
  }

  function hide() {
    setOpen(false);
  }

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        className="ml-1.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full align-middle text-slate-500 transition hover:text-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
        aria-label={text}
        aria-describedby={open ? tooltipId : undefined}
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
      >
        <Info size={14} />
      </button>
      {mounted &&
        open &&
        createPortal(
          <div
            id={tooltipId}
            role="tooltip"
            style={{ top: position.top, left: position.left }}
            className="pointer-events-none fixed z-[100] w-52 -translate-x-1/2 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs leading-relaxed text-slate-300 shadow-xl shadow-black/40"
          >
            {text}
          </div>,
          document.body,
        )}
    </>
  );
}

function FieldRow({
  label,
  hint,
  children,
}: {
  label: React.ReactNode;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-2 border-b border-slate-800/80 py-5 sm:grid-cols-[10rem_minmax(0,1fr)] sm:items-start sm:gap-6">
      <div className="pt-0.5">
        <div className="flex items-center text-sm font-medium text-slate-300">
          {typeof label === 'string' ? <label>{label}</label> : label}
        </div>
        {hint && <p className="mt-1 text-xs leading-relaxed text-slate-500">{hint}</p>}
      </div>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="border-b border-slate-800 bg-slate-900/40 px-5 py-3 text-sm font-semibold text-white sm:px-6">
      {children}
    </h2>
  );
}

function VerifyEmailButton({ verified }: { verified: boolean }) {
  const [pending, startTransition] = useTransition();
  const [toast, setToast] = useState<{
    open: boolean;
    tone: 'success' | 'error';
    title: string;
    body?: string;
  }>({ open: false, tone: 'success', title: '' });

  function handleVerify() {
    setToast((current) => ({ ...current, open: false }));
    startTransition(async () => {
      const result = await sendEmailVerification();
      if (!result) return;
      if (result.error) {
        setToast({
          open: true,
          tone: 'error',
          title: 'Could not send verification email',
          body: result.error,
        });
        return;
      }
      if (result.success) {
        setToast({
          open: true,
          tone: 'success',
          title: result.success.includes('dev server logs')
            ? 'Verification link ready'
            : 'Verification email sent',
          body: result.success,
        });
      }
    });
  }

  if (verified) {
    return (
      <span className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-emerald-300">
        <CheckCircle2 size={15} aria-hidden />
        Verified
      </span>
    );
  }

  return (
    <>
      <SuccessToast
        open={toast.open}
        tone={toast.tone}
        title={toast.title}
        body={toast.body}
        onDismiss={() => setToast((current) => ({ ...current, open: false }))}
        autoDismissMs={toast.tone === 'error' ? 8000 : 6000}
      />
      <button
        type="button"
        onClick={handleVerify}
        disabled={pending}
        className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-brand-300 transition hover:text-brand-200 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? (
          <>
            <Loader2 size={15} className="animate-spin" aria-hidden />
            Sending…
          </>
        ) : (
          'Verify email'
        )}
      </button>
    </>
  );
}

export function ProfileAccountSettingsForm({
  user,
  hasPremier,
  uploadEnabled,
  canEditUsername,
}: Props) {
  const router = useRouter();
  const { update } = useSession();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [state, saveAction, savePending] = useActionState(updateAccountSettings, null);
  const [successToastOpen, setSuccessToastOpen] = useState(false);
  const [blockToastOpen, setBlockToastOpen] = useState(false);
  const [blockToastTitle, setBlockToastTitle] = useState('');
  const [blockToastBody, setBlockToastBody] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [selectedFileName, setSelectedFileName] = useState('');
  const [blockInput, setBlockInput] = useState('');
  const [blockError, setBlockError] = useState('');
  const [uploadPending, setUploadPending] = useState(false);
  const [blockPending, startBlockTransition] = useTransition();
  const prevSaveStateRef = useRef(state);

  useEffect(() => {
    if (state === prevSaveStateRef.current) return;
    prevSaveStateRef.current = state;
    if (!state?.success) return;

    setSuccessToastOpen(true);
    void update();
    router.refresh();
    // Only react to new action results — not session/router identity changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  async function uploadFile(file: File) {
    setUploadPending(true);
    setUploadError('');

    try {
      const prepared = await prepareAvatarFile(file);
      const formData = new FormData();
      formData.append('file', prepared);

      const result = await uploadProfileAvatar(formData);
      if (result.error) {
        setUploadError(result.error);
        return;
      }

      setSelectedFileName('');
      router.refresh();
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed. Please try again.');
    } finally {
      setUploadPending(false);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setSelectedFileName(file.name);
    void uploadFile(file);
  }

  function handleAddBlock(e: React.FormEvent) {
    e.preventDefault();
    setBlockError('');
    const identifier = blockInput.trim();
    startBlockTransition(async () => {
      const result = await addBlockedUser(identifier);
      if (result.error) {
        setBlockError(result.error);
        return;
      }
      setBlockInput('');
      setBlockToastTitle('User blocked');
      setBlockToastBody(
        `${identifier} can no longer message you or register for your tournaments.`,
      );
      setBlockToastOpen(true);
      router.refresh();
    });
  }

  function handleRemoveBlock(id: string, identifier: string) {
    setBlockError('');
    startBlockTransition(async () => {
      const result = await removeBlockedUser(id);
      if (result.error) {
        setBlockError(result.error);
        return;
      }
      setBlockToastTitle('User unblocked');
      setBlockToastBody(`${identifier} can message you and register for your tournaments again.`);
      setBlockToastOpen(true);
      router.refresh();
    });
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/60">
      <SuccessToast
        open={successToastOpen}
        title="Account settings saved"
        body="Your profile changes have been updated."
        onDismiss={() => setSuccessToastOpen(false)}
      />
      <SuccessToast
        open={blockToastOpen}
        title={blockToastTitle}
        body={blockToastBody}
        onDismiss={() => setBlockToastOpen(false)}
      />
      <form action={saveAction}>
        <div className="px-5 sm:px-6">
          <FieldRow
            label={
              <>
                <label>Email</label>
                <LabelTooltip text="Email cannot be changed here." />
              </>
            }
          >
            <div className="flex flex-wrap items-center gap-3">
              <input
                type="email"
                name="email"
                defaultValue={user.email}
                readOnly
                className="input max-w-md w-full flex-1 cursor-default bg-slate-900/50"
              />
              <VerifyEmailButton verified={user.emailVerified} />
            </div>
          </FieldRow>

          <FieldRow
            label={
              canEditUsername ? (
                'Username'
              ) : (
                <>
                  <label>Username</label>
                  <LabelTooltip text="Only admins can change their username here." />
                </>
              )
            }
          >
            <input
              type="text"
              name={canEditUsername ? 'username' : undefined}
              required={canEditUsername}
              minLength={canEditUsername ? 3 : undefined}
              defaultValue={user.username}
              readOnly={!canEditUsername}
              className={`input w-full max-w-md${canEditUsername ? '' : ' cursor-default bg-slate-900/50'}`}
            />
          </FieldRow>

          <FieldRow label="Full Name">
            <input
              type="text"
              name="fullName"
              defaultValue={user.fullName ?? ''}
              className="input w-full max-w-md"
            />
          </FieldRow>

          <FieldRow label="Language">
            <div className="flex flex-wrap items-center gap-3">
              <select name="language" defaultValue={user.language} className="select max-w-md flex-1">
                {LANGUAGE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <Link
                href="https://crowdin.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-brand-300 hover:text-brand-200"
              >
                Help Translate
              </Link>
            </div>
          </FieldRow>

          <FieldRow label="Time Zone">
            <select name="timezone" defaultValue={user.timezone} className="select w-full max-w-md">
              {TIMEZONE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </FieldRow>

          <FieldRow label="Country">
            <select name="country" defaultValue={user.country} className="select w-full max-w-md">
              {COUNTRY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </FieldRow>

          <FieldRow
            label="Avatar"
            hint="Falls back on your initial if no image is provided."
          >
            <div className="space-y-4">
              <PlayerAvatar
                username={user.username}
                avatar={user.avatar}
                size="lg"
                shape="rounded"
              />

              {uploadEnabled ? (
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadPending}
                      className="btn-secondary text-sm"
                    >
                      {uploadPending ? (
                        <>
                          <Loader2 size={14} className="animate-spin" />
                          Uploading…
                        </>
                      ) : (
                        'Choose file'
                      )}
                    </button>
                    <span className="text-sm text-slate-500">
                      {selectedFileName || 'No file chosen'}
                    </span>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <p className="text-xs text-slate-500">
                    500KB max file size. Image will be resized and cropped to a square from the
                    center.
                  </p>
                  {uploadError && (
                    <p className="text-sm text-red-300">{uploadError}</p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-slate-500">
                  Photo upload is unavailable — configure Supabase storage to enable avatars.
                </p>
              )}
            </div>
          </FieldRow>
        </div>

        <SectionTitle>Misc</SectionTitle>
        <div className="px-5 py-4 sm:px-6">
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 px-4 py-3">
            <p className="text-sm font-medium text-white">Ad-free browsing</p>
            {hasPremier ? (
              <p className="mt-1 text-sm text-slate-400">
                Site ads are hidden on your account with Premier.
              </p>
            ) : (
              <p className="mt-1 text-sm text-slate-400">
                Upgrade to Premier to remove on-page ads across {SITE_NAME}.{' '}
                <Link href="/profile/subscriptions" className="font-medium text-brand-300 hover:text-brand-200">
                  View plans
                </Link>
              </p>
            )}
          </div>
        </div>

        <SectionTitle>Blocked Users</SectionTitle>
        <div className="px-5 py-5 sm:px-6">
          <p className="text-sm text-slate-400">
            Prevent these users from registering for your tournaments and sending you private
            messages.{' '}
            <Link href="/about" className="text-brand-300 hover:text-brand-200">
              Learn more
            </Link>
          </p>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="min-w-0 flex-1">
              <label className="block text-sm font-medium text-slate-300">Username or Email</label>
              <input
                type="text"
                value={blockInput}
                onChange={(e) => setBlockInput(e.target.value)}
                placeholder="username or email@example.com"
                className="input mt-1 w-full max-w-md"
              />
            </div>
            <button
              type="button"
              onClick={(e) => handleAddBlock(e)}
              disabled={blockPending || !blockInput.trim()}
              className="btn-secondary shrink-0"
            >
              {blockPending ? 'Adding…' : 'Block user'}
            </button>
          </div>

          {blockError && <p className="mt-3 text-sm text-red-300">{blockError}</p>}

          {user.blockedUsers.length > 0 && (
            <ul className="mt-4 divide-y divide-slate-800 rounded-xl border border-slate-800">
              {user.blockedUsers.map((row) => (
                <li
                  key={row.id}
                  className="flex items-center justify-between gap-3 px-4 py-3 text-sm text-slate-300"
                >
                  <span>{row.identifier}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveBlock(row.id, row.identifier)}
                    disabled={blockPending}
                    className="inline-flex items-center gap-1 text-slate-500 transition hover:text-red-300"
                    aria-label={`Unblock ${row.identifier}`}
                  >
                    <X size={14} />
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border-t border-slate-800 bg-slate-900/30 px-5 py-4 sm:px-6">
          {state?.error && (
            <p className="mb-3 rounded-lg border border-red-500/25 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {state.error}
            </p>
          )}
          <button type="submit" disabled={savePending} className="btn-primary">
            {savePending ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
