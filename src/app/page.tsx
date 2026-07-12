import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  LayoutDashboard,
  FileWarning,
  CalendarDays,
  KanbanSquare,
  Users,
  ShieldCheck,
  UserPlus,
  FolderPlus,
  ListChecks,
  ClipboardCheck,
  Building2,
  Map,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { HeroGraphic } from "@/components/hero-graphic";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

const STEPS = [
  {
    icon: UserPlus,
    title: "Create your account",
    body: "Sign up in seconds and subscribe. Your workspace is private to you.",
  },
  {
    icon: FolderPlus,
    title: "Add a project",
    body: "Enter the property, client and council. Every Planning, BRC and Land Division task is generated automatically.",
  },
  {
    icon: ListChecks,
    title: "Track & assign",
    body: "Update statuses, assign consultants, chase RFIs and watch auto-calculated due dates.",
  },
  {
    icon: CheckCircle2,
    title: "Get greenlit",
    body: "See every approval through to final titles — nothing slips through the cracks.",
  },
];

const WORKFLOWS = [
  {
    icon: ClipboardCheck,
    title: "Planning Approval",
    body: "Land papers, contour survey, concept plans & variations, planning drawings, S&D, PlanSA lodgement and RFIs — through to approval.",
  },
  {
    icon: Building2,
    title: "Development / BRC",
    body: "Working drawings, energy rating, footing report, take-offs, CITB levy and the private certifier BRC application, with a live missing-documents gate.",
  },
  {
    icon: Map,
    title: "Land Division",
    body: "From sending the job through pegging, SA Water, Open Space and SCAP — all the way to final titles.",
  },
];

const FEATURES = [
  { icon: LayoutDashboard, title: "One live dashboard", body: "Active projects, overdue tasks, open RFIs, approvals this month and average approval time at a glance." },
  { icon: FileWarning, title: "RFI tracking that scales", body: "Auto-numbered RFIs per project and workflow, with due dates, owners and a clear open/closed view." },
  { icon: KanbanSquare, title: "Kanban & calendar", body: "Drag tasks between statuses, or see every due date and milestone on a monthly calendar." },
  { icon: Users, title: "Contacts, organised", body: "Architects, engineers, surveyors, certifiers and councils — assigned per project, with performance tracking." },
  { icon: CalendarDays, title: "Never miss a date", body: "Due dates auto-calculate from requested dates and estimated durations; overdue work is flagged in red." },
  { icon: ShieldCheck, title: "Private to your account", body: "Every project, contact and note is isolated to your login. Your data is yours." },
];

export default async function LandingPage() {
  const session = await auth();
  const loggedIn = !!session?.user;
  const ctaHref = loggedIn ? "/dashboard" : "/signup";

  return (
    <div className="min-h-screen bg-background">
      <SiteNav loggedIn={loggedIn} />

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 pb-8 pt-20 text-center sm:px-6 sm:pt-24">
        <div className="gl-rise mx-auto mb-5 inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          Built for South Australian residential development
        </div>
        <h1 className="gl-rise mx-auto max-w-3xl text-4xl font-bold tracking-tight sm:text-6xl" style={{ animationDelay: "0.05s" }}>
          Get every approval{" "}
          <span className="text-emerald-500">greenlit</span> — on time.
        </h1>
        <p className="gl-rise mx-auto mt-6 max-w-2xl text-lg text-muted-foreground" style={{ animationDelay: "0.1s" }}>
          Greenlight replaces the paper checklist with a modern tracker for
          Planning, Building Rules Consent and Land Division. Assign consultants,
          chase RFIs, watch due dates — and never lose a project in the pile again.
        </p>
        <div className="gl-rise mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row" style={{ animationDelay: "0.15s" }}>
          <Button asChild size="lg">
            <Link href={ctaHref}>
              {loggedIn ? "Open dashboard" : "Get started"}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/about">How it works</Link>
          </Button>
        </div>

        <HeroGraphic />
      </section>

      {/* How it works */}
      <section id="how" className="border-t bg-muted/20 py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center">
            <span className="text-sm font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
              How it works
            </span>
            <h2 className="mt-2 text-3xl font-bold tracking-tight">
              From land papers to final titles
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
              Four simple steps — the workflows and due dates are built for you.
            </p>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={s.title} className="relative rounded-xl border bg-card p-6">
                  <span className="absolute right-4 top-4 text-3xl font-bold text-muted/40">
                    {i + 1}
                  </span>
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold">{s.title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">{s.body}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Workflows */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight">Three workflows, one place</h2>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
              Every default task is created automatically for each new project.
            </p>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
            {WORKFLOWS.map((w) => {
              const Icon = w.icon;
              return (
                <div key={w.title} className="rounded-xl border bg-card p-6">
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-semibold">{w.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{w.body}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t bg-muted/20 py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="text-center text-3xl font-bold tracking-tight">
            Everything an approvals office needs
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-muted-foreground">
            From the first land papers to final titles — one place for the whole journey.
          </p>
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="rounded-xl border bg-card p-6">
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold">{f.title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">{f.body}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Mission band */}
      <section className="py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="rounded-2xl border bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 p-10 text-center">
            <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500 text-white">
              <Target className="h-5 w-5" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight">Our goal</h2>
            <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
              Residential approvals in South Australia are slow, paper-based and
              easy to lose track of. Greenlight exists to make the whole journey
              visible and predictable — so builders and developers spend less time
              chasing paperwork and more time building.
            </p>
            <Button asChild variant="outline" className="mt-6">
              <Link href="/about">Read our story</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t py-20">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h2 className="text-3xl font-bold tracking-tight">Ready to clear your approvals?</h2>
          <p className="mt-3 text-muted-foreground">
            Create your account and add your first project in minutes. A$200/month, cancel anytime.
          </p>
          <Button asChild size="lg" className="mt-8">
            <Link href={ctaHref}>
              {loggedIn ? "Open dashboard" : "Create your account"}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
