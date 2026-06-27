import {
  Calendar,
  Compass,
  Newspaper,
  Trophy,
  UsersRound,
  type LucideIcon,
} from 'lucide-react';
import { canManageTournaments } from '@/lib/roles';
import { isDashboardSideNavActive } from '@/lib/dashboard-nav';

export type PlayerDashboardNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export function getPlayerDashboardNav(role: string | undefined): PlayerDashboardNavItem[] {
  const items: PlayerDashboardNavItem[] = [];

  if (canManageTournaments(role ?? '')) {
    items.push({ href: '/dashboard/tournaments', label: 'Your tournaments', icon: Trophy });
  }

  items.push(
    { href: '/dashboard/your-events', label: 'Your events', icon: Calendar },
    { href: '/dashboard/your-communities', label: 'Your communities', icon: UsersRound },
    { href: '/teams', label: 'Discover Communities', icon: Compass },
    { href: '/news', label: 'News', icon: Newspaper },
  );

  return items;
}

export function isPlayerDashboardNavActive(pathname: string, href: string): boolean {
  return isDashboardSideNavActive(pathname, href);
}
