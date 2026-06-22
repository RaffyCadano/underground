'use client';

import { useRef, useState, useTransition, type DragEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, ImagePlus, Loader2, Trash2, Upload } from 'lucide-react';
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
    <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/60">
      <div className="flex items-center gap-2 border-b border-slate-800 bg-slate-900/50 px-5 py-4">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-700 bg-slate-900 text-brand-400">
          <Camera size={15} />
        </span>
        <div>
          <h3 className="text-sm font-semibold text-white">Profile photo</h3>
          <p className="text-xs text-slate-500">Shown on your public profile and leaderboards</p>
        </div>
      </div>

      <div className="p-5 sm:p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          <div className="relative shrink-0 self-center sm:self-start">
            <PlayerAvatar
              username={username}
              avatar={avatarUrl}
              size="xl"
              shape="rounded-xl"
              className="border-slate-700 bg-slate-900"
            />
            {isPending && (
              <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-slate-950/75">
                <Loader2 size={22} className="animate-spin text-brand-400" />
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            {uploadEnabled ? (
              <button
                type="button"
                onClick={handlePick}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                disabled={isPending}
                className={`w-full rounded-xl border border-dashed px-4 py-5 text-left transition disabled:cursor-not-allowed disabled:opacity-60 ${
                  dragActive
                    ? 'border-brand-400/60 bg-brand-500/10'
                    : 'border-slate-700 bg-slate-900/40 hover:border-brand-500/40 hover:bg-slate-900/70'
                }`}
              >
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700 bg-slate-950 text-slate-400">
                  {dragActive ? (
                    <Upload size={16} className="text-brand-400" />
                  ) : (
                    <ImagePlus size={16} />
                  )}
                </span>
                <p className="mt-3 text-sm font-semibold text-white">
                  {dragActive
                    ? 'Drop to upload'
                    : avatarUrl
                      ? 'Replace photo'
                      : 'Upload a photo'}
                </p>
                <p className="mt-1 text-xs text-slate-500">Drag and drop or click to browse</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {['JPEG', 'PNG', 'WebP', 'GIF'].map((format) => (
                    <span
                      key={format}
                      className="rounded-md border border-slate-800 bg-slate-950 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500"
                    >
                      {format}
                    </span>
                  ))}
                  <span className="rounded-md border border-slate-800 bg-slate-950 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                    Max 5 MB
                  </span>
                </div>
              </button>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-800 bg-slate-900/30 px-4 py-5 text-sm text-slate-500">
                Image upload is not configured. Add Supabase storage keys to enable profile
                photos.
              </div>
            )}

            {avatarUrl && uploadEnabled && (
              <button
                type="button"
                onClick={handleRemove}
                disabled={isPending}
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 transition hover:text-red-300 disabled:opacity-60"
              >
                <Trash2 size={13} />
                Remove photo
              </button>
            )}

            {error && (
              <p className="mt-3 rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2 text-sm text-red-300">
                {error}
              </p>
            )}
          </div>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handleFileChange}
      />
    </section>
  );
}
