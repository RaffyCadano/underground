'use client';

import { useRef, useState, useTransition } from 'react';
import { uploadTournamentDescriptionImage } from '@/app/actions/uploads';
import { DescriptionEditorToolbar } from '@/app/components/description-editor-toolbar';
import { insertAtCursor, wrapSelection } from '@/lib/description-editor-format';

type Props = {
  id?: string;
  name?: string;
  value: string;
  onChange: (value: string) => void;
  uploadEnabled?: boolean;
  rows?: number;
  placeholder?: string;
  className?: string;
  onGenerate?: () => void;
  canGenerate?: boolean;
};

export function TournamentDescriptionEditor({
  id = 'tournament-description',
  name = 'description',
  value,
  onChange,
  uploadEnabled = false,
  rows = 5,
  placeholder,
  className = '',
  onGenerate,
  canGenerate = false,
}: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState('');
  const [sourceMode, setSourceMode] = useState(false);
  const [isPending, startTransition] = useTransition();
  const storageReady = uploadEnabled;

  function handlePickFile() {
    setError('');
    fileInputRef.current?.click();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    startTransition(async () => {
      const result = await uploadTournamentDescriptionImage(formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      if (!result.url || !textareaRef.current) return;

      const alt = file.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').trim() || 'Tournament image';
      const markdown = `![${alt}](${result.url})`;
      const { next, cursor } = insertAtCursor(textareaRef.current, markdown);
      onChange(next);
      requestAnimationFrame(() => {
        textareaRef.current?.focus();
        textareaRef.current?.setSelectionRange(cursor, cursor);
      });
    });
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (!(e.ctrlKey || e.metaKey) || !textareaRef.current) return;

    if (e.key === 'b') {
      e.preventDefault();
      onChange(wrapSelection(textareaRef.current, '**', '**'));
    } else if (e.key === 'i') {
      e.preventDefault();
      onChange(wrapSelection(textareaRef.current, '*', '*'));
    }
  }

  return (
    <div>
      <div className="overflow-hidden rounded-lg border border-slate-700 bg-slate-950">
        <DescriptionEditorToolbar
          textareaRef={textareaRef}
          onChange={onChange}
          onUploadImage={handlePickFile}
          uploadEnabled={storageReady}
          uploading={isPending}
          sourceMode={sourceMode}
          onToggleSource={() => setSourceMode((mode) => !mode)}
          onGenerate={onGenerate}
          canGenerate={canGenerate}
        />

        <textarea
          ref={textareaRef}
          id={id}
          name={name}
          rows={rows}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`block min-h-[7.5rem] w-full resize-y border-0 bg-slate-950 px-3 py-2.5 text-sm text-slate-100 outline-none transition placeholder:text-slate-600 focus:ring-2 focus:ring-inset focus:ring-brand-500/30 ${
            sourceMode ? 'font-mono text-xs leading-relaxed' : ''
          } ${className}`.trim()}
        />
      </div>

      {!storageReady && (
        <p className="mt-3 text-xs leading-relaxed text-amber-200">
          <span className="inline-block rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2">
            Image upload needs{' '}
            <code className="text-amber-100">NEXT_PUBLIC_SUPABASE_URL</code> and{' '}
            <code className="text-amber-100">SUPABASE_SECRET_KEY</code> in your environment.
          </span>
        </p>
      )}

      {error && (
        <p className="mt-3 text-xs text-red-300">
          <span className="inline-block rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2">
            {error}
          </span>
        </p>
      )}

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
