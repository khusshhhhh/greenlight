import Link from "next/link";
import { Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { PLAN } from "@/lib/stripe";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

const FAQ = [
  {
    q: "What's included?",
    a: "Everything. There are no tiers or per-seat fees — one plan unlocks every feature and unlimited projects.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. Manage or cancel your subscription from the billing page at any time; you keep access until the end of the period.",
  },
  {
    q: "How is payment handled?",
    a: "Securely by Stripe. Greenlight never sees or stores your card details.",
  },
  {
    q: "Is my data private?",
    a: "Completely. Every project, contact and note is isolated to your account — no one else can see your workspace.",
  },
];

export default async function PricingPage() {
  const session = await auth();
  const loggedIn = !!session?.user;
  const ctaHref = loggedIn ? "/billing" : "/signup";

  return (
    <div className="min-h-screen bg-background">
      <SiteNav loggedIn={loggedIn} />

      <main className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Simple, transparent pricing
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
            One plan with everything included. No per-seat fees, no surprises.
          </p>
        </div>

        <div className="mx-auto mt-14 max-w-md">
          <div className="gl-rise gl-hover-lift rounded-2xl border-2 border-teal-500/40 bg-card p-8 shadow-lg">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">{PLAN.name}</h2>
              <span className="rounded-full bg-teal-100 px-3 py-1 text-xs font-medium text-teal-700 dark:bg-teal-500/15 dark:text-teal-300">
                Everything included
              </span>
            </div>
            <div className="mt-6">
              <span className="text-5xl font-bold tracking-tight">{PLAN.priceLabel}</span>
              <span className="text-muted-foreground"> / {PLAN.interval}</span>
              <p className="mt-1 text-sm text-muted-foreground">
                Billed monthly in {PLAN.currency}. Cancel anytime.
              </p>
            </div>

            <Button asChild size="lg" className="mt-6 w-full">
              <Link href={ctaHref}>
                {loggedIn ? "Subscribe now" : "Start now"}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>

            <ul className="mt-8 space-y-3">
              {PLAN.features.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-teal-500" />
                  {f}
                </li>
              ))}
            </ul>
          </div>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Payments are securely processed by Stripe.
          </p>
        </div>

        {/* FAQ */}
        <div className="mx-auto mt-20 max-w-2xl">
          <h2 className="text-center text-2xl font-bold tracking-tight">
            Frequently asked
          </h2>
          <div className="mt-8 space-y-3">
            {FAQ.map((item) => (
              <div key={item.q} className="gl-hover-lift rounded-xl border bg-card p-5">
                <h3 className="font-semibold">{item.q}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
