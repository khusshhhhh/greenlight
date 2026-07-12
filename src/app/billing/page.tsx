import Link from "next/link";
import { Check, ArrowRight, ShieldCheck } from "lucide-react";
import { requireUserId } from "@/lib/session";
import { getSubscription } from "@/lib/billing";
import { startCheckout, openBillingPortal } from "@/lib/billing-actions";
import { logout } from "@/lib/auth-actions";
import { PLAN } from "@/lib/stripe";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { fmtDate } from "@/lib/dates";

export const dynamic = "force-dynamic";

export default async function BillingPage({
  searchParams,
}: {
  searchParams: { checkout?: string };
}) {
  const userId = await requireUserId();
  const sub = await getSubscription(userId);

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-background">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
          <Link href="/">
            <Logo />
          </Link>
          <form action={logout}>
            <Button variant="ghost" size="sm" type="submit">
              Sign out
            </Button>
          </form>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
        {searchParams.checkout === "cancelled" && (
          <div className="mb-6 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-500/10 dark:text-amber-200">
            Checkout was cancelled — you can subscribe whenever you&apos;re ready.
          </div>
        )}

        {sub.active ? (
          <div className="rounded-2xl border bg-card p-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-semibold">You&apos;re subscribed 🎉</h1>
            <p className="mt-2 text-muted-foreground">
              {PLAN.name} · {PLAN.priceLabel}/{PLAN.interval}
              {sub.currentPeriodEnd && (
                <> · renews {fmtDate(sub.currentPeriodEnd)}</>
              )}
            </p>
            <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/dashboard">
                  Go to dashboard <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <form action={openBillingPortal}>
                <Button variant="outline" size="lg" type="submit" className="w-full">
                  Manage billing
                </Button>
              </form>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border bg-card p-8">
            <div className="text-center">
              <h1 className="text-2xl font-semibold tracking-tight">
                Subscribe to Greenlight
              </h1>
              <p className="mt-2 text-muted-foreground">
                Full access to every approval workflow — cancel anytime.
              </p>
            </div>

            <div className="my-8 text-center">
              <span className="text-5xl font-bold tracking-tight">{PLAN.priceLabel}</span>
              <span className="text-muted-foreground"> / {PLAN.interval}</span>
              <p className="mt-1 text-xs text-muted-foreground">
                Billed monthly in {PLAN.currency}. Includes GST where applicable.
              </p>
            </div>

            <ul className="mx-auto max-w-sm space-y-2.5">
              {PLAN.features.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                  {f}
                </li>
              ))}
            </ul>

            <form action={startCheckout} className="mt-8">
              <Button type="submit" size="lg" className="w-full">
                Subscribe — {PLAN.priceLabel}/{PLAN.interval}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              Secure payment by Stripe. You&apos;ll be redirected to Stripe to enter
              card details — Greenlight never sees your card.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
