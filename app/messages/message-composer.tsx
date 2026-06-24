'use client';

import { useEffect, useRef, useState } from 'react';
import { ImagePlus, Loader2, Send, X } from 'lucide-react';
import { sendDirectMessage, uploadDirectMessageImage } from '@/app/actions/messages';
import { DIRECT_MESSAGE_MAX_LENGTH } from '@/lib/conversations';
import { EmojiPickerDropdown } from '@/app/messages/emoji-picker-dropdown';

type AttachedImage = {
  file: File;
  previewUrl: string;
};

export type SentMessagePayload = {
  conversationId: string;
  messageId: string;
  createdAt: string;
  body: string;
  imageUrl: string | null;
  senderId: string;
};

export function MessageComposer({
  conversationId,
  recipientUsername,
  placeholder,
  imageUploadEnabled,
  disabled,
  onSent,
  onError,
  variant = 'default',
}: {
  conversationId?: string;
  recipientUsername?: string;
  placeholder: string;
  imageUploadEnabled: boolean;
  disabled?: boolean;
  onSent: (payload?: SentMessagePayload) => void;
  onError: (message: string) => void;
  variant?: 'default' | 'embedded' | 'thread';
}) {
  const [draft, setDraft] = useState('');
  const [pending, setPending] = useState(false);
  const [attachedImage, setAttachedImage] = useState<AttachedImage | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (attachedImage?.previewUrl) {
        URL.revokeObjectURL(attachedImage.previewUrl);
      }
    };
  }, [attachedImage]);

  function clearAttachedImage() {
    setAttachedImage((current) => {
      if (current?.previewUrl) {
        URL.revokeObjectURL(current.previewUrl);
      }
      return null;
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  function insertEmoji(emoji: string) {
    const el = textareaRef.current;
    if (!el) {
      setDraft((value) => `${value}${emoji}`.slice(0, DIRECT_MESSAGE_MAX_LENGTH));
      return;
    }

    const start = el.selectionStart ?? draft.length;
    const end = el.selectionEnd ?? draft.length;
    const next = `${draft.slice(0, start)}${emoji}${draft.slice(end)}`.slice(0, DIRECT_MESSAGE_MAX_LENGTH);
    setDraft(next);
    requestAnimationFrame(() => {
      el.focus();
      const cursor = Math.min(start + emoji.length, next.length);
      el.setSelectionRange(cursor, cursor);
    });
  }

  async function handleSend() {
    const body = draft.trim();
    if ((!body && !attachedImage) || pending || disabled) return;

    const attachedSnapshot = attachedImage;
    setDraft('');
    clearAttachedImage();
    setPending(true);
    onError('');

    let imageUrl: string | null = null;
    try {
      if (attachedSnapshot) {
        if (!conversationId) {
          throw new Error('Start the conversation before sending an image.');
        }

        const formData = new FormData();
        formData.set('file', attachedSnapshot.file);
        const upload = await uploadDirectMessageImage(conversationId, formData);
        if (upload.error || !upload.url) {
          throw new Error(upload.error ?? 'Upload failed.');
        }
        imageUrl = upload.url;
      }

      const result = await sendDirectMessage({
        conversationId,
        recipientUsername,
        body,
        imageUrl,
      });

      if ('error' in result) {
        throw new Error(result.error);
      }

      onSent({
        conversationId: result.conversationId,
        messageId: result.messageId,
        createdAt: result.createdAt,
        body: result.body,
        imageUrl: result.imageUrl,
        senderId: result.senderId,
      });
    } catch (error) {
      setDraft(body);
      if (attachedSnapshot) {
        setAttachedImage(attachedSnapshot);
      }
      onError(error instanceof Error ? error.message : 'Could not send message.');
    } finally {
      setPending(false);
    }
  }

  function handleImageSelect(file: File | null) {
    if (!file || !conversationId || !imageUploadEnabled || pending || disabled) return;

    onError('');
    setAttachedImage((current) => {
      if (current?.previewUrl) {
        URL.revokeObjectURL(current.previewUrl);
      }
      return {
        file,
        previewUrl: URL.createObjectURL(file),
      };
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    requestAnimationFrame(() => textareaRef.current?.focus());
  }

  const canSend = Boolean(draft.trim() || attachedImage);

  const shellClass =
    variant === 'embedded'
      ? 'pt-3'
      : variant === 'thread'
        ? 'border-t border-slate-800/80 bg-slate-950/80 py-2'
        : 'border-t border-slate-800/80 bg-slate-950/80 px-3 py-2 sm:px-4';

  return (
    <div className={shellClass}>
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 px-1.5 py-1">
        {attachedImage && (
          <div className="mb-1.5 flex items-start px-0.5 pt-0.5">
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={attachedImage.previewUrl}
                alt="Attached image preview"
                className="h-16 w-16 rounded-lg border border-slate-700 object-cover"
              />
              <button
                type="button"
                onClick={clearAttachedImage}
                disabled={pending || disabled}
                className="absolute -right-1.5 -top-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full border border-slate-700 bg-slate-950 text-slate-300 shadow-sm transition hover:bg-slate-800 hover:text-white disabled:opacity-50"
                aria-label="Remove attached image"
              >
                <X size={12} />
              </button>
            </div>
          </div>
        )}

        <div className="flex items-center gap-1">
          <div className="flex shrink-0 items-center">
            <EmojiPickerDropdown onSelect={insertEmoji} disabled={pending || disabled} />
            {imageUploadEnabled && conversationId && (
              <>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={pending || disabled}
                  className="group/image-trigger relative inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-800 hover:text-slate-300 disabled:opacity-50"
                  aria-label="Attach image"
                >
                  <ImagePlus size={18} />
                  <span
                    role="tooltip"
                    className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1.5 -translate-x-1/2 whitespace-nowrap rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-[10px] font-medium text-slate-300 opacity-0 shadow-lg transition-opacity duration-150 group-hover/image-trigger:opacity-100 group-focus-visible/image-trigger:opacity-100"
                  >
                    Image
                  </span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={(e) => handleImageSelect(e.target.files?.[0] ?? null)}
                />
              </>
            )}
          </div>

          <textarea
            ref={textareaRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value.slice(0, DIRECT_MESSAGE_MAX_LENGTH))}
            rows={1}
            placeholder={placeholder}
            disabled={pending || disabled}
            className="max-h-28 min-h-[2rem] flex-1 resize-none border-0 bg-transparent px-1 py-1.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-0"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                void handleSend();
              }
            }}
          />

          <button
            type="button"
            onClick={() => void handleSend()}
            disabled={pending || disabled || !canSend}
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-500 text-white shadow-sm transition hover:bg-brand-400 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-brand-500"
            aria-label="Send message"
          >
            {pending ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Send size={16} className="shrink-0" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
