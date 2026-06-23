import { isAdminRole } from '@/lib/roles';
import { userHasActivePremier } from '@/lib/sync-stripe-subscription';

type AdUser = {
  subscriptionPlan: string;
  subscriptionStatus?: string | null;
  optOutPersonalizedAds: boolean;
} | null | undefined;

/** Whether Adcash display ads should load for this viewer. */
export function shouldShowAds(user: AdUser, role?: string | null): boolean {
  if (isAdminRole(role ?? '')) return false;
  if (!user) return true;
  if (userHasActivePremier(user.subscriptionPlan, user.subscriptionStatus)) return false;
  if (user.optOutPersonalizedAds) return false;
  return true;
}
