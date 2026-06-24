'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Box,
  Flag,
  Leaf,
  Plane,
  Search,
  Smile,
  Sparkles,
  Trophy,
  Utensils,
  type LucideIcon,
} from 'lucide-react';
import { MESSAGE_EMOJI_CATEGORIES, MESSAGE_QUICK_EMOJIS } from '@/lib/message-ui';

const CATEGORY_TAB_ICONS: Record<string, LucideIcon> = {
  'smiley-people': Smile,
  'animals-nature': Leaf,
  activities: Trophy,
  'food-drink': Utensils,
  'travel-places': Plane,
  objects: Box,
  symbols: Sparkles,
  flags: Flag,
};

function filterEmojis(query: string) {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const normalized = trimmed.toLowerCase();
  const fromLabels = MESSAGE_EMOJI_CATEGORIES.filter((category) =>
    category.label.toLowerCase().includes(normalized),
  ).flatMap((category) => category.emojis);

  const fromEmoji = MESSAGE_QUICK_EMOJIS.filter((emoji) => emoji.includes(trimmed));

  return [...new Set([...fromEmoji, ...fromLabels])];
}

export function EmojiPickerDropdown({
  onSelect,
  disabled,
}: {
  onSelect: (emoji: string) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(MESSAGE_EMOJI_CATEGORIES[0].id);
  const [searchQuery, setSearchQuery] = useState('');
  const rootRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const activeCategory =
    MESSAGE_EMOJI_CATEGORIES.find((category) => category.id === activeTab) ??
    MESSAGE_EMOJI_CATEGORIES[0];

  const isSearching = searchQuery.trim().length > 0;

  const displayEmojis = useMemo(() => {
    if (isSearching) {
      return filterEmojis(searchQuery);
    }
    return activeCategory.emojis;
  }, [activeCategory.emojis, isSearching, searchQuery]);

  const sectionLabel = isSearching
    ? displayEmojis.length > 0
      ? 'Results'
      : 'No emojis found'
    : activeCategory.label;

  useEffect(() => {
    if (!open) {
      setSearchQuery('');
      return;
    }

    searchInputRef.current?.focus();

    function handlePointerDown(event: MouseEvent | TouchEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
    };
  }, [open]);

  function handleSelect(emoji: string) {
    onSelect(emoji);
  }

  function handleTabSelect(categoryId: string) {
    setSearchQuery('');
    setActiveTab(categoryId);
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((value) => !value)}
        className={`group/emoji-trigger relative inline-flex h-8 w-8 items-center justify-center rounded-lg transition disabled:opacity-50 ${
          open ? 'bg-brand-500/15 text-brand-300' : 'text-slate-500 hover:bg-slate-800 hover:text-slate-300'
        }`}
        aria-label="Insert emoji"
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        <Smile size={18} />
        <span
          role="tooltip"
          className={`pointer-events-none absolute bottom-full left-1/2 z-10 mb-1.5 -translate-x-1/2 whitespace-nowrap rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-[10px] font-medium text-slate-300 shadow-lg transition-opacity duration-150 ${
            open
              ? 'hidden'
              : 'opacity-0 group-hover/emoji-trigger:opacity-100 group-focus-visible/emoji-trigger:opacity-100'
          }`}
        >
          Emoji
        </span>
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Emoji picker"
          className="absolute bottom-full left-0 z-50 mb-2 flex w-[min(21rem,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-2xl border border-slate-700 bg-slate-950 shadow-2xl shadow-black/40"
        >
          <div className="border-b border-slate-800 bg-slate-900/80 p-2">
            <label className="relative block">
              <Search
                size={14}
                className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500"
                aria-hidden
              />
              <input
                ref={searchInputRef}
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Filter emojis…"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 py-1.5 pl-8 pr-2 text-xs text-slate-200 placeholder:text-slate-500 focus:border-brand-500/50 focus:outline-none focus:ring-1 focus:ring-brand-500/30"
                aria-label="Filter emojis"
              />
            </label>
          </div>

          <div className="max-h-52 overflow-y-auto p-2 sm:max-h-56">
            <p className="mb-1.5 px-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
              {sectionLabel}
            </p>
            {displayEmojis.length > 0 ? (
              <div className="grid grid-cols-8 gap-0.5 sm:grid-cols-9">
                {displayEmojis.map((emoji, index) => (
                  <button
                    key={`${isSearching ? 'search' : activeCategory.id}-${emoji}-${index}`}
                    type="button"
                    onClick={() => handleSelect(emoji)}
                    className="flex aspect-square items-center justify-center rounded-lg text-lg leading-none transition hover:bg-slate-800"
                    aria-label={`Insert ${emoji}`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            ) : (
              <p className="px-0.5 py-6 text-center text-xs text-slate-500">
                Try a category name like &quot;food&quot; or &quot;smiley&quot;.
              </p>
            )}
          </div>

          <div className="flex justify-center gap-0.5 overflow-x-auto border-t border-slate-800 bg-slate-900/80 p-1">
            {MESSAGE_EMOJI_CATEGORIES.map((category) => {
              const active = !isSearching && category.id === activeTab;
              const TabIcon = CATEGORY_TAB_ICONS[category.id] ?? Smile;
              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => handleTabSelect(category.id)}
                  className={`group/tab relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition ${
                    active
                      ? 'bg-brand-500/15 text-brand-200 ring-1 ring-brand-500/30'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                  aria-label={category.label}
                  aria-selected={active}
                >
                  <TabIcon size={16} strokeWidth={active ? 2.25 : 2} />
                  <span
                    role="tooltip"
                    className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1.5 -translate-x-1/2 whitespace-nowrap rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-[10px] font-medium text-slate-300 opacity-0 shadow-lg transition-opacity duration-150 group-hover/tab:opacity-100 group-focus-visible/tab:opacity-100"
                  >
                    {category.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
