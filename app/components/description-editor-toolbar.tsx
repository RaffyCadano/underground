'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import {
  Bold,
  ChevronDown,
  Code2,
  Heading2,
  Heading3,
  ImagePlus,
  Italic,
  Link2,
  List,
  ListOrdered,
  Loader2,
  Minus,
  Pilcrow,
  RemoveFormatting,
  Sparkles,
  Strikethrough,
} from 'lucide-react';
import {
  insertLink,
  insertSnippet,
  prefixLines,
  removeFormatFromSelection,
  setLineHeading,
  wrapSelection,
} from '@/lib/description-editor-format';

type Props = {
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  onChange: (value: string) => void;
  onUploadImage: () => void;
  uploadEnabled: boolean;
  uploading: boolean;
  sourceMode: boolean;
  onToggleSource: () => void;
  onBeforeFormat?: () => void;
  onGenerate?: () => void;
  canGenerate?: boolean;
};

function ToolbarButton({
  title,
  onClick,
  disabled,
  active,
  children,
}: {
  title: string;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      tabIndex={-1}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-800 hover:text-slate-100 disabled:cursor-not-allowed disabled:opacity-40 ${
        active ? 'bg-slate-800 text-white' : ''
      }`}
    >
      {children}
    </button>
  );
}

function ToolbarDivider() {
  return <div className="mx-0.5 h-5 w-px shrink-0 bg-slate-700/80" aria-hidden />;
}

function FormatDropdownMenu({
  open,
  anchorRef,
  menuRef,
  children,
}: {
  open: boolean;
  anchorRef: React.RefObject<HTMLButtonElement | null>;
  menuRef: React.RefObject<HTMLDivElement | null>;
  children: ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;

    function updatePosition() {
      const anchor = anchorRef.current;
      if (!anchor) return;
      const rect = anchor.getBoundingClientRect();
      setPosition({ top: rect.bottom + 4, left: rect.left });
    }

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [open, anchorRef]);

  if (!open || !mounted) return null;

  return createPortal(
    <div
      ref={menuRef}
      className="fixed z-[200] min-w-[9rem] overflow-hidden rounded-lg border border-slate-700 bg-slate-900 py-1 shadow-xl shadow-black/40"
      style={{ top: position.top, left: position.left }}
    >
      {children}
    </div>,
    document.body,
  );
}

export function DescriptionEditorToolbar({
  textareaRef,
  onChange,
  onUploadImage,
  uploadEnabled,
  uploading,
  sourceMode,
  onToggleSource,
  onBeforeFormat,
  onGenerate,
  canGenerate = false,
}: Props) {
  const [formatOpen, setFormatOpen] = useState(false);
  const formatButtonRef = useRef<HTMLButtonElement>(null);
  const formatMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!formatOpen) return;

    function onDocClick(e: MouseEvent) {
      const target = e.target as Node;
      if (formatButtonRef.current?.contains(target) || formatMenuRef.current?.contains(target)) {
        return;
      }
      setFormatOpen(false);
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setFormatOpen(false);
    }

    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [formatOpen]);

  function apply(action: () => string | null | undefined) {
    const run = () => {
      const textarea = textareaRef.current;
      if (!textarea) return;
      const result = action();
      if (typeof result === 'string') onChange(result);
    };

    if (!sourceMode) {
      onBeforeFormat?.();
      window.setTimeout(run, 0);
      return;
    }

    run();
  }

  return (
    <div className="flex items-stretch border-b border-slate-700 bg-slate-900/90">
      <div className="flex min-w-0 flex-1 items-center gap-0.5 overflow-x-auto px-1.5 py-1.5">
      <div className="relative shrink-0">
        <button
          ref={formatButtonRef}
          type="button"
          title="Formatting"
          tabIndex={-1}
          aria-expanded={formatOpen}
          aria-haspopup="menu"
          onClick={() => setFormatOpen((open) => !open)}
          className={`inline-flex h-8 items-center gap-0.5 rounded-md px-2 text-slate-400 transition hover:bg-slate-800 hover:text-slate-100 ${
            formatOpen ? 'bg-slate-800 text-white' : ''
          }`}
        >
          <Pilcrow size={15} />
          <ChevronDown size={12} className={formatOpen ? 'rotate-180 transition' : 'transition'} />
        </button>
        <FormatDropdownMenu open={formatOpen} anchorRef={formatButtonRef} menuRef={formatMenuRef}>
          <button
            type="button"
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-slate-300 hover:bg-slate-800"
            onClick={() => {
              apply(() => textareaRef.current && setLineHeading(textareaRef.current, 2));
              setFormatOpen(false);
            }}
          >
            <Heading2 size={14} />
            Heading 2
          </button>
          <button
            type="button"
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-slate-300 hover:bg-slate-800"
            onClick={() => {
              apply(() => textareaRef.current && setLineHeading(textareaRef.current, 3));
              setFormatOpen(false);
            }}
          >
            <Heading3 size={14} />
            Heading 3
          </button>
          <button
            type="button"
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-slate-300 hover:bg-slate-800"
            onClick={() => {
              apply(() => textareaRef.current && setLineHeading(textareaRef.current, 0));
              setFormatOpen(false);
            }}
          >
            <Pilcrow size={14} />
            Paragraph
          </button>
        </FormatDropdownMenu>
      </div>

      <ToolbarDivider />

      <ToolbarButton
        title="Strong (Ctrl + B)"
        onClick={() => apply(() => textareaRef.current && wrapSelection(textareaRef.current, '**', '**'))}
      >
        <Bold size={15} />
      </ToolbarButton>
      <ToolbarButton
        title="Emphasis (Ctrl + I)"
        onClick={() => apply(() => textareaRef.current && wrapSelection(textareaRef.current, '*', '*'))}
      >
        <Italic size={15} />
      </ToolbarButton>
      <ToolbarButton
        title="Strikethrough"
        onClick={() => apply(() => textareaRef.current && wrapSelection(textareaRef.current, '~~', '~~'))}
      >
        <Strikethrough size={15} />
      </ToolbarButton>

      <ToolbarDivider />

      <ToolbarButton
        title="Unordered list"
        onClick={() => apply(() => textareaRef.current && prefixLines(textareaRef.current, '- '))}
      >
        <List size={15} />
      </ToolbarButton>
      <ToolbarButton
        title="Ordered list"
        onClick={() =>
          apply(() => textareaRef.current && prefixLines(textareaRef.current, (i) => `${i + 1}. `))
        }
      >
        <ListOrdered size={15} />
      </ToolbarButton>

      <ToolbarDivider />

      <ToolbarButton
        title="Link"
        onClick={() => apply(() => textareaRef.current && insertLink(textareaRef.current))}
      >
        <Link2 size={15} />
      </ToolbarButton>
      <ToolbarButton
        title="Insert image"
        disabled={!uploadEnabled || uploading}
        onClick={onUploadImage}
      >
        {uploading ? <Loader2 size={15} className="animate-spin" /> : <ImagePlus size={15} />}
      </ToolbarButton>

      <ToolbarDivider />

      <ToolbarButton
        title="Horizontal rule"
        onClick={() => apply(() => textareaRef.current && insertSnippet(textareaRef.current, '---'))}
      >
        <Minus size={15} />
      </ToolbarButton>

      <ToolbarDivider />

      <ToolbarButton
        title="Remove format"
        onClick={() => apply(() => textareaRef.current && removeFormatFromSelection(textareaRef.current))}
      >
        <RemoveFormatting size={15} />
      </ToolbarButton>

      <ToolbarButton
        title={sourceMode ? 'Visual preview' : 'View markdown source'}
        active={sourceMode}
        onClick={onToggleSource}
      >
        <Code2 size={15} />
      </ToolbarButton>
      </div>

      {onGenerate && (
        <div className="flex shrink-0 items-center border-l border-slate-700 px-1.5 py-1.5">
          <button
            type="button"
            onClick={onGenerate}
            disabled={!canGenerate}
            title={
              canGenerate
                ? 'Generate description from form details'
                : 'Enter a name and date first'
            }
            tabIndex={-1}
            className="inline-flex h-8 items-center gap-1.5 whitespace-nowrap rounded-md border border-brand-500/30 bg-brand-500/10 px-2.5 text-xs font-semibold text-brand-300 transition hover:border-brand-400/40 hover:bg-brand-500/15 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Sparkles size={13} />
            Generate
          </button>
        </div>
      )}
    </div>
  );
}
