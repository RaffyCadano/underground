'use client';

import { useActionState, useEffect, useRef, useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Info, Loader2, X } from 'lucide-react';
import {
  addBlockedUser,
  removeBlockedUser,
  updateAccountSettings,
  uploadProfileAvatar,
} from '@/app/actions/profile';
import { PlayerAvatar } from '@/app/components/player-avatar';
import { SuccessToast } from '@/app/components/success-toast';
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
  fullName: string | null;
  language: string;
  timezone: string;
  country: string;
  avatar: string | null;
  emailPrivateMessages: boolean;
  emailMatchNotifications: boolean;
  markReadOnEmail: boolean;
  productUpdates: boolean;
  optOutPersonalizedAds: boolean;
  blockedUsers: BlockedRow[];
};

type Props = {
  user: User;
  uploadEnabled: boolean;
  canEditUsername: boolean;
};

function LabelTooltip({ text }: { text: string }) {
  return (
    <span className="group relative ml-1.5 inline-flex align-middle">
      <button
        type="button"
        className="inline-flex h-4 w-4 items-center justify-center rounded-full text-slate-500 transition hover:text-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
        aria-label={text}
      >
        <Info size={14} />
      </button>
      <span
        role="tooltip"
        className="pointer-events-none absolute left-1/2 top-full z-20 mt-2 w-48 -translate-x-1/2 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs leading-relaxed text-slate-300 opacity-0 shadow-lg transition group-hover:opacity-100 group-focus-within:opacity-100"
      >
        {text}
      </span>
    </span>
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

function CheckboxField({
  name,
  label,
  defaultChecked,
  hint,
}: {
  name: string;
  label: string;
  defaultChecked: boolean;
  hint?: string;
}) {
  return (
    <label className="flex cursor-pointer gap-3 rounded-lg py-2">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="mt-1 h-4 w-4 shrink-0 rounded border-slate-600 bg-slate-950 text-brand-500 focus:ring-brand-500/40"
      />
      <span className="min-w-0">
        <span className="text-sm text-slate-200">{label}</span>
        {hint && <span className="mt-0.5 block text-xs text-slate-500">{hint}</span>}
      </span>
    </label>
  );
}

export function ProfileAccountSettingsForm({ user, uploadEnabled, canEditUsername }: Props) {
  const router = useRouter();
  const { update } = useSession();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [state, saveAction, savePending] = useActionState(updateAccountSettings, null);
  const [successToastOpen, setSuccessToastOpen] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [selectedFileName, setSelectedFileName] = useState('');
  const [blockInput, setBlockInput] = useState('');
  const [blockError, setBlockError] = useState('');
  const [uploadPending, startUploadTransition] = useTransition();
  const [blockPending, startBlockTransition] = useTransition();

  useEffect(() => {
    if (!state?.success) return;
    setSuccessToastOpen(true);
    void update();
    router.refresh();
  }, [state?.success, update, router]);

  function uploadFile(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    startUploadTransition(async () => {
      const result = await uploadProfileAvatar(formData);
      if (result.error) {
        setUploadError(result.error);
        return;
      }
      setUploadError('');
      router.refresh();
    });
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploadError('');
    setSelectedFileName(file.name);
    uploadFile(file);
  }

  function handleAddBlock(e: React.FormEvent) {
    e.preventDefault();
    setBlockError('');
    startBlockTransition(async () => {
      const result = await addBlockedUser(blockInput);
      if (result.error) {
        setBlockError(result.error);
        return;
      }
      setBlockInput('');
      router.refresh();
    });
  }

  function handleRemoveBlock(id: string) {
    setBlockError('');
    startBlockTransition(async () => {
      const result = await removeBlockedUser(id);
      if (result.error) setBlockError(result.error);
      else router.refresh();
    });
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/60">
      <SuccessToast
        open={successToastOpen}
        title="Account settings saved"
        body="Your profile changes have been updated."
        onDismiss={() => setSuccessToastOpen(false)}
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
            <input
              type="email"
              name="email"
              defaultValue={user.email}
              readOnly
              className="input w-full max-w-md cursor-default bg-slate-900/50"
            />
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

        <SectionTitle>Messaging Options</SectionTitle>
        <div className="space-y-1 px-5 py-4 sm:px-6">
          <CheckboxField
            name="emailPrivateMessages"
            label="Email new private messages"
            defaultChecked={user.emailPrivateMessages}
          />
          <CheckboxField
            name="emailMatchNotifications"
            label="Email new match notifications"
            hint="recommended"
            defaultChecked={user.emailMatchNotifications}
          />
          <CheckboxField
            name="markReadOnEmail"
            label={`Mark messages and notifications as read on ${SITE_NAME} if they're emailed`}
            defaultChecked={user.markReadOnEmail}
          />
          <CheckboxField
            name="productUpdates"
            label="Send me occasional product updates and info about major tournaments."
            defaultChecked={user.productUpdates}
          />
        </div>

        <SectionTitle>Misc</SectionTitle>
        <div className="px-5 py-4 sm:px-6">
          <CheckboxField
            name="optOutPersonalizedAds"
            label="Opt out of personalized ads"
            defaultChecked={user.optOutPersonalizedAds}
          />
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
                    onClick={() => handleRemoveBlock(row.id)}
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
