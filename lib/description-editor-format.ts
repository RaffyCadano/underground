export type TextareaSelection = {
  value: string;
  start: number;
  end: number;
};

export function applyTextareaUpdate(
  textarea: HTMLTextAreaElement,
  nextValue: string,
  cursorStart: number,
  cursorEnd: number = cursorStart,
) {
  textarea.value = nextValue;
  textarea.focus();
  textarea.setSelectionRange(cursorStart, cursorEnd);
}

export function insertAtCursor(textarea: HTMLTextAreaElement, snippet: string) {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const before = textarea.value.slice(0, start);
  const after = textarea.value.slice(end);
  const needsLeadingBreak = before.length > 0 && !before.endsWith('\n');
  const needsTrailingBreak = after.length > 0 && !after.startsWith('\n');
  const insertion = `${needsLeadingBreak ? '\n\n' : ''}${snippet}${needsTrailingBreak ? '\n\n' : ''}`;
  const next = before + insertion + after;
  const cursor = before.length + insertion.length;
  applyTextareaUpdate(textarea, next, cursor, cursor);
  return { next, cursor };
}

export function getTextareaSelection(textarea: HTMLTextAreaElement): TextareaSelection {
  return {
    value: textarea.value,
    start: textarea.selectionStart,
    end: textarea.selectionEnd,
  };
}

export function wrapSelection(
  textarea: HTMLTextAreaElement,
  before: string,
  after: string,
  placeholder = 'text',
): string {
  const { value, start, end } = getTextareaSelection(textarea);
  const selected = value.slice(start, end);
  const inner = selected || placeholder;
  const next = value.slice(0, start) + before + inner + after + value.slice(end);
  const cursorStart = start + before.length;
  const cursorEnd = cursorStart + inner.length;
  applyTextareaUpdate(textarea, next, cursorStart, cursorEnd);
  return next;
}

export function prefixLines(textarea: HTMLTextAreaElement, prefix: string | ((index: number) => string)): string {
  const { value, start, end } = getTextareaSelection(textarea);
  const selected = value.slice(start, end);
  const block = selected || 'Item';
  const lines = block.split('\n');
  const prefixed = lines
    .map((line, index) => {
      const trimmed = line.trim();
      if (!trimmed) return line;
      const p = typeof prefix === 'function' ? prefix(index) : prefix;
      if (trimmed.startsWith(p.trim())) return line;
      return `${p}${trimmed.replace(/^([-*]|\d+\.)\s+/, '')}`;
    })
    .join('\n');

  const next = value.slice(0, start) + prefixed + value.slice(end);
  applyTextareaUpdate(textarea, next, start, start + prefixed.length);
  return next;
}

export function setLineHeading(textarea: HTMLTextAreaElement, level: 0 | 2 | 3): string {
  const { value, start, end } = getTextareaSelection(textarea);
  const lineStart = value.lastIndexOf('\n', start - 1) + 1;
  const lineEnd = value.indexOf('\n', end);
  const endIndex = lineEnd === -1 ? value.length : lineEnd;
  const line = value.slice(lineStart, endIndex);
  const stripped = line.replace(/^#{1,6}\s+/, '');
  const nextLine =
    level === 0 ? stripped : `${'#'.repeat(level)} ${stripped.trim() || 'Heading'}`;
  const next = value.slice(0, lineStart) + nextLine + value.slice(endIndex);
  applyTextareaUpdate(textarea, next, lineStart, lineStart + nextLine.length);
  return next;
}

export function insertSnippet(textarea: HTMLTextAreaElement, snippet: string): string {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const before = textarea.value.slice(0, start);
  const after = textarea.value.slice(end);
  const needsLeadingBreak = before.length > 0 && !before.endsWith('\n');
  const needsTrailingBreak = after.length > 0 && !after.startsWith('\n');
  const insertion = `${needsLeadingBreak ? '\n\n' : ''}${snippet}${needsTrailingBreak ? '\n\n' : ''}`;
  const next = before + insertion + after;
  const cursor = before.length + insertion.length;
  applyTextareaUpdate(textarea, next, cursor, cursor);
  return next;
}

export function insertLink(textarea: HTMLTextAreaElement): string | null {
  const selected = textarea.value.slice(textarea.selectionStart, textarea.selectionEnd).trim();
  const url = window.prompt('Link URL', 'https://');
  if (!url?.trim()) return null;
  const label = selected || window.prompt('Link text', url)?.trim() || url.trim();
  return wrapSelection(textarea, '[', `](${url.trim()})`, label);
}

export function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/~~([^~]+)~~/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^[-*]\s+/gm, '')
    .replace(/^\d+\.\s+/gm, '')
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
}

export function removeFormatFromSelection(textarea: HTMLTextAreaElement): string {
  const { value, start, end } = getTextareaSelection(textarea);
  const selected = value.slice(start, end);
  if (!selected) return value;
  const cleaned = stripMarkdown(selected);
  const next = value.slice(0, start) + cleaned + value.slice(end);
  applyTextareaUpdate(textarea, next, start, start + cleaned.length);
  return next;
}
