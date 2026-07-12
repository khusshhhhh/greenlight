import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  // Don't throw at import time in dev before keys are set — but warn loudly.
  console.warn("⚠️  STRIPE_SECRET_KEY is not set. Billing will not work until it is.");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "sk_missing", {
  // Pin left to the SDK default to avoid version-literal type mismatches.
  typescript: true,
  appInfo: { name: "Greenlight" },
});

/** The single subscription price id (created in the Stripe dashboard). */
export const STRIPE_PRICE_ID = process.env.STRIPE_PRICE_ID ?? "";

/** Human-readable plan details for the pricing / billing UI. */
export const PLAN = {
  name: "Greenlight Pro",
  priceLabel: "A$200",
  interval: "month",
  currency: "AUD",
  amount: 200,
  features: [
    "Unlimited projects",
    "Planning, BRC & Land Division workflows",
    "RFI tracking & lodgement gates",
    "Kanban board & calendar",
    "Contacts & consultant performance",
    "CSV export & printable reports",
    "Dark mode & priority updates",
  ],
};

export function getBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")
  );
}
