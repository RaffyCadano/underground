import {
  Calendar,
  Compass,
  Newspaper,
  Trophy,
  UsersRound,
  type LucideIcon,
} from 'lucide-react';

export type PlayerDashboardNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export function getPlayerDashboardNav(_role: string | undefined): PlayerDashboardNavItem[] {
  return [
    { href: '/dashboard', label: 'Your tournaments', icon: Trophy },
    { href: '/dashboard/your-events', label: 'Your events', icon: Calendar },
    { href: '/dashboard/your-communities', label: 'Your communities', icon: UsersRound },
    { href: '/teams', label: 'Discover Communities', icon: Compass },
    { href: '/news', label: 'News', icon: Newspaper },
  ];
}

export function isPlayerDashboardNavActive(pathname: string, href: string): boolean {
  if (href === '/dashboard') {
    return pathname === '/dashboard';
  }
  if (href === '/dashboard/tournaments') {
    return pathname === '/dashboard/tournaments' || pathname.startsWith('/dashboard/tournaments/');
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}
