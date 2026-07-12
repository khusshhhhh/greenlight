import { prisma } from "./prisma";

export interface SubscriptionInfo {
  status: string | null;
  priceId: string | null;
  currentPeriodEnd: Date | null;
  active: boolean;
}

const ACTIVE_STATUSES = ["active", "trialing"];
// A short grace window so a slightly-late webhook doesn't lock a paying user out.
const GRACE_MS = 24 * 60 * 60 * 1000;

export function isSubscriptionActive(user: {
  stripeStatus: string | null;
  stripeCurrentPeriodEnd: Date | null;
}): boolean {
  if (!user.stripeStatus || !ACTIVE_STATUSES.includes(user.stripeStatus)) return false;
  if (!user.stripeCurrentPeriodEnd) return true;
  return user.stripeCurrentPeriodEnd.getTime() + GRACE_MS > Date.now();
}

export async function getSubscription(userId: string): Promise<SubscriptionInfo> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      stripeStatus: true,
      stripePriceId: true,
      stripeCurrentPeriodEnd: true,
    },
  });
  if (!user) {
    return { status: null, priceId: null, currentPeriodEnd: null, active: false };
  }
  return {
    status: user.stripeStatus,
    priceId: user.stripePriceId,
    currentPeriodEnd: user.stripeCurrentPeriodEnd,
    active: isSubscriptionActive(user),
  };
}
