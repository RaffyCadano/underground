import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
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

/** Server-side check for whether the current viewer should see Adcash ads. */
export async function getViewerShowAds() {
  const session = await getServerSession(authOptions);
  if (session?.user?.id == null) return true;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      optOutPersonalizedAds: true,
      subscriptionPlan: true,
      subscriptionStatus: true,
    },
  });

  return shouldShowAds(user, session.user.role);
}
