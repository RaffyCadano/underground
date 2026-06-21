'use client';

import { useRef, useState, useTransition, type DragEvent } from 'react';
import { useRouter } from 'next/navigation';
import { ImagePlus, Loader2, Trash2, Upload } from 'lucide-react';
import { removeProfileAvatar, uploadProfileAvatar } from '@/app/actions/profile';
import { PlayerAvatar } from '@/app/components/player-avatar';

type Props = {
  username: string;
  avatarUrl: string | null;
  uploadEnabled: boolean;
};

export function ProfileAvatarUpload({ username, avatarUrl, uploadEnabled }: Props) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [isPending, startTransition] = useTransition();

  function uploadFile(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    startTransition(async () => {
      const result = await uploadProfileAvatar(formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      setError('');
      router.refresh();
    });
  }

  function handlePick() {
    if (!uploadEnabled || isPending) return;
    setError('');
    fileInputRef.current?.click();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    uploadFile(file);
  }

  function handleRemove() {
    setError('');
    startTransition(async () => {
      const result = await removeProfileAvatar();
      if (result.error) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  function handleDragEnter(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (uploadEnabled && !isPending) setDragActive(true);
  }

  function handleDragLeave(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }

  function handleDragOver(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (!uploadEnabled || isPending) return;

    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    setError('');
    uploadFile(file);
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/60">
      <div className="border-b border-slate-800 bg-slate-900/50 px-5 py-4 sm:px-6">
        <p className="text-sm font-semibold text-white">Profile photo</p>
        <p className="mt-0.5 text-xs text-slate-500">
          Visible on your public profile, player directory, and leaderboards.
        </p>
      </div>

      <div className="px-5 py-6 sm:px-6 sm:py-8">
        <div className="mx-auto flex max-w-md flex-col items-center text-center">
          <div className="relative">
            <div className="rounded-2xl bg-gradient-to-br from-brand-500/20 via-transparent to-brand-500/10 p-1">
              <PlayerAvatar
                username={username}
                avatar={avatarUrl}
                size="2xl"
                shape="rounded-xl"
                className="border-slate-800 bg-slate-900"
              />
            </div>
            {isPending && (
              <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-slate-950/70">
                <Loader2 size={28} className="animate-spin text-brand-400" />
              </div>
            )}
          </div>

          <p className="mt-4 text-base font-semibold text-white">{username}</p>
          <p className="mt-1 text-xs text-slate-500">
            {avatarUrl ? 'Your current profile photo' : 'No photo uploaded yet'}
          </p>

          {uploadEnabled ? (
            <button
              type="button"
              onClick={handlePick}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              disabled={isPending}
              className={`mt-6 w-full rounded-xl border border-dashed px-5 py-6 transition disabled:cursor-not-allowed disabled:opacity-60 ${
                dragActive
                  ? 'border-brand-400/60 bg-brand-500/10'
                  : 'border-slate-700 bg-slate-900/40 hover:border-brand-500/40 hover:bg-slate-900/70'
              }`}
            >
              <span className="mx-auto inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-700 bg-slate-950 text-slate-400">
                {dragActive ? (
                  <Upload size={18} className="text-brand-400" />
                ) : (
                  <ImagePlus size={18} />
                )}
              </span>
              <p className="mt-3 text-sm font-semibold text-white">
                {dragActive ? 'Drop image to upload' : avatarUrl ? 'Replace photo' : 'Upload a photo'}
              </p>
              <p className="mt-1 text-xs text-slate-500">Drag and drop or click to browse</p>
              <div className="mt-3 flex flex-wrap justify-center gap-1.5">
                {['JPEG', 'PNG', 'WebP', 'GIF'].map((format) => (
                  <span
                    key={format}
                    className="rounded-full border border-slate-800 bg-slate-950 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500"
                  >
                    {format}
                  </span>
                ))}
                <span className="rounded-full border border-slate-800 bg-slate-950 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  Max 5 MB
                </span>
              </div>
            </button>
          ) : (
            <div className="mt-6 w-full rounded-xl border border-dashed border-slate-800 bg-slate-900/30 px-5 py-6 text-sm text-slate-500">
              Image upload is not configured. Add Supabase storage keys to your environment to enable
              profile photos.
            </div>
          )}

          {avatarUrl && uploadEnabled && (
            <button
              type="button"
              onClick={handleRemove}
              disabled={isPending}
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-red-300 disabled:opacity-60"
            >
              <Trash2 size={14} />
              Remove photo
            </button>
          )}

          {error && (
            <p className="mt-4 w-full rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2 text-sm text-red-300">
              {error}
            </p>
          )}
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
