export const RANKINGS_PAGE_SIZE = 50;
export const PLAYERS_PAGE_SIZE = 24;
export const ADMIN_TOURNAMENTS_PAGE_SIZE = 25;
export const TOURNAMENT_TEMPLATES_PAGE_SIZE = 25;

export function totalPages(itemCount: number, pageSize: number) {
  return Math.max(1, Math.ceil(itemCount / pageSize));
}

export function parsePageParam(value: string | undefined, maxPage: number) {
  const parsed = Number.parseInt(value ?? '1', 10);
  if (Number.isNaN(parsed) || parsed < 1) return 1;
  return Math.min(parsed, maxPage);
}

export function pageRange(page: number, pageSize: number, totalItems: number) {
  if (totalItems === 0) return { start: 0, end: 0 };
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems);
  return { start, end };
}
