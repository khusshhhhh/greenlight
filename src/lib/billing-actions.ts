"use server";

import { redirect } from "next/navigation";
import { prisma } from "./prisma";
import { requireUserId } from "./session";
import { stripe, STRIPE_PRICE_ID, getBaseUrl } from "./stripe";

/**
 * Start (or resume) a paid subscription via Stripe Checkout.
 * Redirects the browser to the hosted Stripe Checkout page.
 */
export async function startCheckout() {
  const userId = await requireUserId();
  if (!STRIPE_PRICE_ID) throw new Error("STRIPE_PRICE_ID is not configured.");

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) redirect("/login");

  // Ensure the user has a Stripe customer record.
  let customerId = user.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name,
      metadata: { userId },
    });
    customerId = customer.id;
    await prisma.user.update({
      where: { id: userId },
      data: { stripeCustomerId: customerId },
    });
  }

  const baseUrl = getBaseUrl();
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: STRIPE_PRICE_ID, quantity: 1 }],
    client_reference_id: userId,
    subscription_data: { metadata: { userId } },
    allow_promotion_codes: true,
    billing_address_collection: "auto",
    success_url: `${baseUrl}/dashboard?checkout=success`,
    cancel_url: `${baseUrl}/billing?checkout=cancelled`,
  });

  if (!session.url) throw new Error("Could not create checkout session.");
  redirect(session.url);
}

/**
 * Open the Stripe Customer Portal so the user can update/cancel their plan.
 */
export async function openBillingPortal() {
  const userId = await requireUserId();
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user?.stripeCustomerId) redirect("/billing");

  const portal = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${getBaseUrl()}/billing`,
  });
  redirect(portal.url);
}
