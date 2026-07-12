import Link from "next/link";
import {
  Target,
  Compass,
  HeartHandshake,
  ShieldCheck,
  Zap,
  ClipboardCheck,
  Building2,
  Map,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { LogoMark } from "@/components/logo";
import { Reveal } from "@/components/reveal";
import { CountUp } from "@/components/count-up";
import { auth } from "@/lib/auth";

const VALUES = [
  { icon: Zap, title: "Clarity over chaos", body: "Every task, date and RFI in one place — no more spreadsheets, sticky notes or lost emails." },
  { icon: ShieldCheck, title: "Trust & privacy", body: "Your workspace is yours alone. Data is isolated per account and never shared." },
  { icon: HeartHandshake, title: "Built for the trade", body: "Designed around how SA builders and developers actually work — not generic project software." },
  { icon: Compass, title: "Always improving", body: "The workflow templates evolve as council and PlanSA processes change." },
];

const PROCESS = [
  { icon: ClipboardCheck, title: "1 · Planning Approval", body: "It starts with land papers and a contour survey, then concept plans (and their variations), planning drawings and a site & drainage plan. Once those are ready, the application is lodged in PlanSA and any council RFIs are tracked through to approval." },
  { icon: Building2, title: "2 · Development Approval / BRC", body: "After planning approval, working drawings, an energy rating, a footing report, take-offs and the CITB levy come together. Greenlight shows exactly which documents are still missing before the private certifier can lodge the Building Rules Consent." },
  { icon: Map, title: "3 · Land Division", body: "Running in parallel: sending the job, draft plans and internal approval, PlanSA lodgement, pegging, SA Water and Open Space applications and payments, the SCAP plan — all the way to final titles." },
];

const STATS = [
  { value: 3, suffix: "", label: "Workflows tracked end-to-end" },
  { value: 40, suffix: "+", label: "Default tasks per project, auto-created" },
  { value: 1, suffix: "", label: "Dashboard for everything" },
  { value: 0, suffix: "", label: "Sticky notes required" },
];

export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const session = await auth();
  const loggedIn = !!session?.user;

  return (
    <div className="min-h-screen bg-background">
      <SiteNav loggedIn={loggedIn} />

      {/* Hero */}
      <section className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6">
        <div className="gl-rise mx-auto mb-6 w-fit">
          <LogoMark animated className="h-14 w-14" />
        </div>
        <h1 className="gl-rise text-4xl font-bold tracking-tight sm:text-5xl" style={{ animationDelay: "0.05s" }}>
          We clear the path to approval
        </h1>
        <p className="gl-rise mx-auto mt-5 max-w-2xl text-lg text-muted-foreground" style={{ animationDelay: "0.1s" }}>
          Greenlight is a project tracker built specifically for residential
          development approvals in South Australia — Planning, Building Rules
          Consent and Land Division, from the first land papers to final titles.
        </p>
      </section>

      {/* Mission */}
      <section id="mission" className="border-t bg-muted/20 py-20">
        <Reveal className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-4 sm:px-6 lg:grid-cols-2">
          <div>
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500 text-white">
              <Target className="h-5 w-5" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight">Our goal</h2>
            <p className="mt-4 text-muted-foreground">
              Getting a residential development approved in South Australia means
              juggling councils, PlanSA, architects, engineers, surveyors and
              certifiers — across three overlapping workflows that can each take
              months. Traditionally that lived on a paper checklist, easy to lose
              track of and impossible to see at a glance.
            </p>
            <p className="mt-4 text-muted-foreground">
              Our goal is simple: make the entire approval journey{" "}
              <span className="font-medium text-foreground">visible and predictable</span>
              , so teams spend less time chasing paperwork and more time building.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {STATS.map((s) => (
              <div key={s.label} className="gl-hover-lift rounded-xl border bg-card p-6">
                <p className="text-3xl font-bold tracking-tight text-emerald-500">
                  <CountUp value={s.value} suffix={s.suffix} />
                </p>
                <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* Process */}
      <section id="process" className="py-20">
        <Reveal className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="text-center">
            <span className="text-sm font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
              The process
            </span>
            <h2 className="mt-2 text-3xl font-bold tracking-tight">
              How an approval actually works
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
              Greenlight models the real South Australian approval pathway. Here&apos;s
              the journey it tracks for every project.
            </p>
          </div>

          <div className="mt-12 space-y-6">
            {PROCESS.map((p) => {
              const Icon = p.icon;
              return (
                <div key={p.title} className="gl-hover-lift flex gap-5 rounded-2xl border bg-card p-6">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{p.title}</h3>
                    <p className="mt-1.5 text-muted-foreground">{p.body}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Reveal>
      </section>

      {/* Values */}
      <section className="border-t bg-muted/20 py-20">
        <Reveal className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="text-center text-3xl font-bold tracking-tight">What we believe</h2>
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map((v) => {
              const Icon = v.icon;
              return (
                <div key={v.title} className="gl-hover-lift rounded-xl border bg-card p-6">
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold">{v.title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">{v.body}</p>
                </div>
              );
            })}
          </div>
        </Reveal>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h2 className="text-3xl font-bold tracking-tight">See it on your own projects</h2>
          <p className="mt-3 text-muted-foreground">
            Create your account and add your first project in minutes.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href={loggedIn ? "/dashboard" : "/signup"}>
                {loggedIn ? "Open dashboard" : "Get started"}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/pricing">View pricing</Link>
            </Button>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
