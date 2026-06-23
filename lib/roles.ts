export const ASSIGNABLE_ROLES = [
  { value: 'player', label: 'Player' },
  { value: 'organizer', label: 'Organizer' },
  { value: 'admin', label: 'Admin' },
] as const;

export type AssignableRole = (typeof ASSIGNABLE_ROLES)[number]['value'];

export const ACCOUNT_ROLE_FILTER_OPTIONS = [
  { value: 'all', label: 'All roles' },
  ...ASSIGNABLE_ROLES,
  { value: 'guest', label: 'Walk-ins (internal)' },
];

export function parseAssignableRole(value: string): AssignableRole {
  if (value === 'admin' || value === 'organizer' || value === 'player') return value;
  return 'player';
}

export function roleLabel(role: string): string {
  const match = ASSIGNABLE_ROLES.find((r) => r.value === role);
  if (match) return match.label;
  if (role === 'guest') return 'Guest';
  return role.charAt(0).toUpperCase() + role.slice(1);
}

export function roleBadgeClass(role: string): string {
  if (role === 'admin') {
    return 'border-brand-500/40 bg-brand-500/10 text-brand-300';
  }
  if (role === 'organizer') {
    return 'border-sky-500/40 bg-sky-500/10 text-sky-300';
  }
  if (role === 'guest') {
    return 'border-slate-600 bg-slate-800/40 text-slate-500';
  }
  return 'border-slate-700 bg-slate-800/60 text-slate-400';
}

export function isAdminRole(role: string): boolean {
  return role === 'admin';
}

export function isOrganizerRole(role: string): boolean {
  return role === 'organizer';
}

/** Circuit members (not guests) can create and host tournaments. */
export function canManageTournaments(role: string): boolean {
  return role === 'admin' || role === 'organizer' || role === 'player';
}

export function dashboardHrefForRole(role: string): string {
  if (role === 'admin') return '/dashboard/overview';
  if (role === 'organizer') return '/dashboard/tournaments';
  return '/dashboard';
}

/** Primary site owner account — cannot be deleted or modified by other admins. */
export const MAIN_ADMIN_USERNAME = 'TheVandaminator';

export function isMainAdminUsername(username: string): boolean {
  return username.toLowerCase() === MAIN_ADMIN_USERNAME.toLowerCase();
}

export function isProtectedAdminAccount(user: { username: string }): boolean {
  return isMainAdminUsername(user.username);
}

export function canManageProtectedAdminAccount(
  actor: { username: string },
  target: { username: string },
): boolean {
  if (!isProtectedAdminAccount(target)) return true;
  return isMainAdminUsername(actor.username);
}
