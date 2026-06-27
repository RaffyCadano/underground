/** Active-state matching for dashboard side nav links (admin + player). */
export function isDashboardSideNavActive(pathname: string, href: string): boolean {
  if (!pathname) return false;

  if (href === '/dashboard/tournaments') {
    return pathname === '/dashboard/tournaments' || pathname.startsWith('/dashboard/tournaments/');
  }

  if (href === '/dashboard/overview') {
    return pathname === '/dashboard/overview' || pathname === '/dashboard';
  }

  if (href === '/profile') {
    return pathname === '/profile';
  }

  if (href === '/profile/password') {
    return pathname === '/profile/password';
  }

  if (href === '/tournaments') {
    return pathname === '/tournaments' || pathname.startsWith('/tournaments/');
  }

  if (href === '/dashboard') {
    return pathname === '/dashboard';
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}
