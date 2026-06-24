'use client';

import { useEffect, useLayoutEffect, useRef, useState, useTransition } from 'react';
import { createPortal } from 'react-dom';
import { Heart, MoreHorizontal } from 'lucide-react';
import {
  deleteDirectMessageForMe,
  editDirectMessage,
  toggleDirectMessageLike,
  unsendDirectMessage,
} from '@/app/actions/messages';
import { PlayerAvatar } from '@/app/components/player-avatar';
import { ReportMessageModal } from '@/app/messages/report-message-modal';
import { formatMessageTooltip } from '@/lib/conversations';
import {
  canEditMessage,
  canUnsendMessage,
  type ThreadMessageView,
} from '@/lib/message-ui';

async function saveSharedImage(imageUrl: string) {
  const response = await fetch(imageUrl);
  if (!response.ok) {
    throw new Error('Could not download image.');
  }

  const blob = await response.blob();
  const ext = blob.type.split('/')[1]?.replace('jpeg', 'jpg') || 'jpg';
  const filename = imageUrl.split('/').pop()?.split('?')[0] || `message-image-${Date.now()}.${ext}`;

  if (typeof navigator.share === 'function' && typeof File !== 'undefined') {
    const file = new File([blob], filename, { type: blob.type || 'image/jpeg' });
    if (typeof navigator.canShare === 'function' && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({ files: [file] });
        return;
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          return;
        }
      }
    }
  }

  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = objectUrl;
  link.download = filename;
  link.rel = 'noopener';
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(objectUrl);
}

const MENU_VIEWPORT_PADDING = 8;
const MENU_GAP = 4;
const MENU_ESTIMATED_WIDTH = 96;
const MENU_ESTIMATED_HEIGHT = 120;

type MessageMenuPosition = {
  top: number;
  left: number;
  placement: 'above' | 'below';
};

export function MessageBubble({
  message,
  onUpdated,
  showAvatar = false,
  otherUsername,
  otherAvatar,
  isGrouped = false,
  isNewTurn = true,
  isFirst = false,
}: {
  message: ThreadMessageView;
  onUpdated: () => void;
  showAvatar?: boolean;
  otherUsername?: string;
  otherAvatar?: string | null;
  isGrouped?: boolean;
  isNewTurn?: boolean;
  isFirst?: boolean;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [savingImage, setSavingImage] = useState(false);
  const [editDraft, setEditDraft] = useState(message.body);
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();
  const [menuMounted, setMenuMounted] = useState(false);
  const [menuPosition, setMenuPosition] = useState<MessageMenuPosition | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuTriggerRef = useRef<HTMLButtonElement>(null);
  const menuPanelRef = useRef<HTMLDivElement>(null);

  const unsent = Boolean(message.unsentAt);
  const editable = canEditMessage(message);
  const unsentable = canUnsendMessage(message);
  const sentAt = new Date(message.createdAt);
  const timeTooltip = `${formatMessageTooltip(sentAt)}${message.editedAt ? ' · edited' : ''}`;
  const topSpacing = isFirst
    ? ''
    : unsent
      ? 'mt-1.5'
      : isGrouped
        ? 'mt-0.5'
        : isNewTurn
          ? 'mt-3'
          : 'mt-2';

  useEffect(() => setMenuMounted(true), []);

  function computeMenuPosition(panel?: HTMLElement | null): MessageMenuPosition | null {
    const button = menuTriggerRef.current;
    if (!button) return null;

    const rect = button.getBoundingClientRect();
    const panelWidth = panel?.offsetWidth ?? MENU_ESTIMATED_WIDTH;
    const panelHeight = panel?.offsetHeight ?? MENU_ESTIMATED_HEIGHT;

    let left = message.isMine ? rect.right - panelWidth : rect.left;
    left = Math.max(
      MENU_VIEWPORT_PADDING,
      Math.min(left, window.innerWidth - panelWidth - MENU_VIEWPORT_PADDING),
    );

    const spaceAbove = rect.top - MENU_VIEWPORT_PADDING;
    const spaceBelow = window.innerHeight - rect.bottom - MENU_VIEWPORT_PADDING;

    if (spaceAbove >= panelHeight + MENU_GAP || spaceAbove >= spaceBelow) {
      return { top: rect.top - MENU_GAP, left, placement: 'above' };
    }

    return { top: rect.bottom + MENU_GAP, left, placement: 'below' };
  }

  function openMenu() {
    setMenuPosition(computeMenuPosition());
    setMenuOpen(true);
  }

  function toggleMenu() {
    if (menuOpen) {
      setMenuOpen(false);
      return;
    }
    openMenu();
  }

  useLayoutEffect(() => {
    if (!menuOpen) {
      setMenuPosition(null);
      return;
    }

    const next = computeMenuPosition(menuPanelRef.current);
    if (next) {
      setMenuPosition(next);
    }
  }, [menuOpen, message.isMine, unsent, message.imageUrl, editable, unsentable, savingImage]);

  useEffect(() => {
    if (!menuOpen) return;

    function handleScroll() {
      setMenuOpen(false);
    }

    function handleResize() {
      const next = computeMenuPosition(menuPanelRef.current);
      if (next) {
        setMenuPosition(next);
      }
    }

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll, true);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [menuOpen, message.isMine]);

  useEffect(() => {
    if (!menuOpen) return;

    function handlePointerDown(event: MouseEvent | TouchEvent) {
      const target = event.target as Node;
      if (menuRef.current?.contains(target) || menuPanelRef.current?.contains(target)) {
        return;
      }
      setMenuOpen(false);
    }

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
    };
  }, [menuOpen]);

  function runAction(action: () => Promise<{ error?: string; success?: boolean; liked?: boolean }>) {
    setError('');
    startTransition(async () => {
      const result = await action();
      if ('error' in result && result.error) {
        setError(result.error);
        return;
      }
      setMenuOpen(false);
      setEditing(false);
      onUpdated();
    });
  }

  async function handleSaveImage() {
    if (!message.imageUrl || savingImage) return;

    setError('');
    setSavingImage(true);
    try {
      await saveSharedImage(message.imageUrl);
      setMenuOpen(false);
    } catch {
      setError('Could not download image. Try opening it and saving from your browser.');
    } finally {
      setSavingImage(false);
    }
  }

  function renderMessageMenu() {
    if (!menuOpen || !menuMounted || !menuPosition) return null;

    return createPortal(
      <div
        ref={menuPanelRef}
        style={{
          position: 'fixed',
          top: menuPosition.top,
          left: menuPosition.left,
          transform: menuPosition.placement === 'above' ? 'translateY(-100%)' : undefined,
        }}
        className="z-[100] w-max max-w-[calc(100vw-1rem)] overflow-hidden rounded-xl border border-slate-700 bg-slate-950 py-0.5 shadow-xl"
      >
        {!unsent && message.imageUrl && (
          <button
            type="button"
            disabled={savingImage}
            onClick={() => void handleSaveImage()}
            className="flex w-full whitespace-nowrap px-2.5 py-1.5 text-left text-xs text-slate-300 hover:bg-slate-900 disabled:opacity-50"
          >
            {savingImage ? 'Downloading…' : 'Download'}
          </button>
        )}
        {!unsent && message.isMine && editable && (
          <button
            type="button"
            onClick={() => {
              setEditing(true);
              setMenuOpen(false);
            }}
            className="flex w-full whitespace-nowrap px-2.5 py-1.5 text-left text-xs text-slate-300 hover:bg-slate-900"
          >
            Edit
          </button>
        )}
        {!unsent && message.isMine && unsentable && (
          <button
            type="button"
            onClick={() => runAction(() => unsendDirectMessage(message.id))}
            className="flex w-full whitespace-nowrap px-2.5 py-1.5 text-left text-xs text-slate-300 hover:bg-slate-900"
          >
            Unsend
          </button>
        )}
        {!unsent && !message.isMine && otherUsername && (
          <button
            type="button"
            onClick={() => {
              setMenuOpen(false);
              setReportModalOpen(true);
            }}
            className="flex w-full whitespace-nowrap px-2.5 py-1.5 text-left text-xs text-slate-300 hover:bg-slate-900"
          >
            Report
          </button>
        )}
        <button
          type="button"
          onClick={() => runAction(() => deleteDirectMessageForMe(message.id))}
          className="flex w-full whitespace-nowrap px-2.5 py-1.5 text-left text-xs text-red-400 hover:bg-slate-900"
        >
          Delete
        </button>
      </div>,
      document.body,
    );
  }

  if (unsent) {
    const unsentRowAlign = !message.isMine && showAvatar ? 'items-start' : 'items-end';

    return (
      <div
        className={`group flex flex-wrap gap-2.5 ${message.isMine ? 'flex-row-reverse' : 'flex-row'} ${unsentRowAlign} ${topSpacing}`}
      >
        {!message.isMine && (
          <div className={`w-8 shrink-0 ${showAvatar ? '' : 'self-end'}`}>
            {showAvatar && otherUsername ? (
              <PlayerAvatar username={otherUsername} avatar={otherAvatar} size="sm" />
            ) : null}
          </div>
        )}
        <div
          className={`flex items-center gap-0.5 ${message.isMine ? 'flex-row-reverse' : 'flex-row'}`}
        >
          <p className="rounded-full border border-dashed border-slate-700/60 bg-slate-900/40 px-2.5 py-0.5 text-[11px] italic leading-tight text-slate-500">
            {message.isMine ? 'You unsent a message' : 'Message unsent'}
          </p>
          <div
            ref={menuRef}
            className={`relative shrink-0 transition-opacity ${
              menuOpen ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 focus-within:opacity-100'
            }`}
          >
            <button
              ref={menuTriggerRef}
              type="button"
              onClick={toggleMenu}
              className="rounded-md p-1 text-slate-500 transition hover:bg-slate-800 hover:text-slate-200"
              aria-label="Message options"
              aria-expanded={menuOpen}
            >
              <MoreHorizontal size={15} />
            </button>
            {renderMessageMenu()}
          </div>
        </div>
        {error && (
          <p
            className={`basis-full text-[11px] text-red-400 ${message.isMine ? 'text-right' : 'pl-[2.625rem]'}`}
          >
            {error}
          </p>
        )}
      </div>
    );
  }

  const rowAlign = !message.isMine && showAvatar ? 'items-start' : 'items-end';

  return (
    <div
      className={`group flex flex-wrap gap-2.5 ${message.isMine ? 'flex-row-reverse' : 'flex-row'} ${rowAlign} ${topSpacing}`}
    >
      {!message.isMine && (
        <div className={`w-8 shrink-0 ${showAvatar ? '' : 'self-end'}`}>
          {showAvatar && otherUsername ? (
            <PlayerAvatar username={otherUsername} avatar={otherAvatar} size="sm" />
          ) : null}
        </div>
      )}

      <div
        className={`flex min-w-0 max-w-[85%] items-center gap-0.5 sm:max-w-[75%] ${
          message.isMine ? 'flex-row-reverse' : 'flex-row'
        }`}
      >
        <div
          className={`group/bubble relative min-w-0 px-3 py-1.5 text-sm leading-snug ${
            message.isMine
              ? 'rounded-2xl rounded-br-sm bg-brand-600 text-white'
              : 'rounded-2xl rounded-bl-sm border border-slate-800/80 bg-slate-900/90 text-slate-100'
          }`}
        >
          {!editing && (
            <span
              role="tooltip"
              className={`pointer-events-none absolute bottom-full z-20 mb-1.5 whitespace-nowrap rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-[10px] font-medium text-slate-300 opacity-0 shadow-lg transition-opacity duration-150 group-hover/bubble:opacity-100 ${
                message.isMine ? 'right-0' : 'left-0'
              }`}
            >
              {timeTooltip}
            </span>
          )}
          {editing ? (
            <div className="space-y-2">
              <textarea
                value={editDraft}
                onChange={(e) => setEditDraft(e.target.value)}
                rows={3}
                className="input w-full min-w-[12rem] resize-y text-slate-900"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={isPending || !editDraft.trim()}
                  onClick={() => runAction(() => editDirectMessage(message.id, editDraft))}
                  className="rounded-lg bg-white/20 px-2.5 py-1 text-xs font-semibold hover:bg-white/30 disabled:opacity-50"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditing(false);
                    setEditDraft(message.body);
                  }}
                  className="rounded-lg px-2.5 py-1 text-xs font-semibold text-white/80 hover:text-white"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              {message.imageUrl && (
                <a href={message.imageUrl} target="_blank" rel="noopener noreferrer" className="mb-1 block">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={message.imageUrl}
                    alt="Shared image"
                    className="max-h-36 max-w-[11rem] rounded-lg border border-black/10 object-cover"
                  />
                </a>
              )}
              {message.body && <p className="whitespace-pre-wrap break-words">{message.body}</p>}
            </>
          )}
        </div>

        {!editing && (
          <div
            className={`flex shrink-0 items-center gap-0.5 transition-opacity ${
              menuOpen || message.likedByMe || message.likeCount > 0
                ? 'opacity-100'
                : 'opacity-0 group-hover:opacity-100 focus-within:opacity-100'
            }`}
          >
            <button
              type="button"
              disabled={isPending}
              onClick={() => runAction(() => toggleDirectMessageLike(message.id))}
              className={`rounded-md p-1 transition hover:bg-slate-800 ${
                message.likedByMe ? 'text-brand-400' : 'text-slate-500 hover:text-slate-200'
              }`}
              aria-label={message.likedByMe ? 'Unlike message' : 'Like message'}
            >
              <span className="relative inline-flex">
                <Heart size={15} className={message.likedByMe ? 'fill-current' : ''} />
                {message.likeCount > 0 && (
                  <span className="absolute -right-1.5 -top-1.5 min-w-[0.875rem] rounded-full bg-slate-800 px-0.5 text-center text-[9px] font-bold leading-tight text-slate-300">
                    {message.likeCount}
                  </span>
                )}
              </span>
            </button>

            <div ref={menuRef} className="relative">
              <button
                ref={menuTriggerRef}
                type="button"
                onClick={toggleMenu}
                className="rounded-md p-1 text-slate-500 transition hover:bg-slate-800 hover:text-slate-200"
                aria-label="Message options"
                aria-expanded={menuOpen}
              >
                <MoreHorizontal size={15} />
              </button>
              {renderMessageMenu()}
            </div>
          </div>
        )}
      </div>

      {error && (
        <p
          className={`basis-full text-[11px] text-red-400 ${message.isMine ? 'text-right' : 'pl-[2.625rem]'}`}
        >
          {error}
        </p>
      )}

      {otherUsername && (
        <ReportMessageModal
          open={reportModalOpen}
          otherUsername={otherUsername}
          messageId={message.id}
          onClose={() => setReportModalOpen(false)}
          onReported={() => setReportModalOpen(false)}
        />
      )}
    </div>
  );
}
