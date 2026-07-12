import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET ?? "";

/** Pull the latest state of a subscription and write it onto the owning user. */
async function syncSubscription(subscriptionId: string, fallbackUserId?: string | null) {
  const sub = await stripe.subscriptions.retrieve(subscriptionId);
  const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
  const item = sub.items.data[0];
  // In current Stripe API versions the billing period lives on the item.
  const periodEnd = item?.current_period_end ?? null;
  const data = {
    stripeCustomerId: customerId,
    stripeSubscriptionId: sub.id,
    stripePriceId: item?.price.id ?? null,
    stripeStatus: sub.status,
    stripeCurrentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : null,
  };

  // Match by customer id first; fall back to the userId in metadata.
  const byCustomer = await prisma.user.updateMany({
    where: { stripeCustomerId: customerId },
    data,
  });
  const userId = fallbackUserId ?? (sub.metadata?.userId as string | undefined);
  if (byCustomer.count === 0 && userId) {
    await prisma.user.update({ where: { id: userId }, data }).catch(() => {});
  }
}

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");
  if (!signature || !webhookSecret) {
    return new Response("Missing signature or webhook secret", { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("Stripe webhook signature verification failed:", err);
    return new Response("Invalid signature", { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.subscription) {
          await syncSubscription(
            session.subscription as string,
            session.client_reference_id
          );
        }
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        await syncSubscription(sub.id);
        break;
      }
      default:
        break;
    }
  } catch (err) {
    console.error("Stripe webhook handler error:", err);
    return new Response("Handler error", { status: 500 });
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
