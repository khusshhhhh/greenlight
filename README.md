# Greenlight

**A multi-tenant SaaS for tracking residential development approvals in South Australia.**

Greenlight replaces the paper checklist that development companies and building
designers use to shepherd a residential project through South Australia's
approval maze — **Planning Approval**, **Building Rules Consent (BRC) /
Development Approval**, and **Land Division** — from the first land papers all
the way to final titles. Every task, date, request-for-information (RFI),
consultant and document lives in one place, so nothing slips through the cracks.

Each account gets its own private workspace, subscribes for a monthly fee, and
manages an unlimited number of projects. The application is built with the
Next.js App Router, runs on a Supabase PostgreSQL database, and bills through
Stripe.

> ⚠️ **Independent project.** Greenlight is an independent workflow tool. It is
> not affiliated with, endorsed by, or connected to PlanSA, SA Water, the CITB,
> any council, or the Government of South Australia. Domain terms are used
> descriptively to model the real approval process.

---

## Table of contents

- [What it does](#what-it-does)
- [Feature overview](#feature-overview)
- [How it works](#how-it-works)
- [Tech stack](#tech-stack)
- [Project structure](#project-structure)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [Available scripts](#available-scripts)
- [Deployment](#deployment)
- [The admin console](#the-admin-console)
- [Security & privacy](#security--privacy)
- [Glossary of SA approval terms](#glossary-of-sa-approval-terms)
- [Roadmap ideas](#roadmap-ideas)
- [License](#license)

---

## What it does

Getting a residential development approved in South Australia means juggling
councils, PlanSA, architects, engineers, surveyors and private certifiers across
three overlapping workflows that can each take months. Traditionally that lives
on a paper checklist — easy to lose track of and impossible to see at a glance.

Greenlight models that entire journey as structured, editable data. When a user
creates a project, the application automatically generates every default task for
all three workflows, wires up their dependencies, and calculates due dates.
Users then update statuses, assign responsible entities, chase RFIs, attach
document records and watch a live dashboard as each approval moves toward being
"greenlit".

The product is aimed at residential development companies, building designers and
project managers who run multiple approvals in parallel.

---

## Feature overview

### Accounts & billing

- Email + password sign-up and login (Auth.js / NextAuth v5, bcrypt-hashed
  passwords, stateless JWT sessions).
- A paid subscription (A$200 / month) is required to access the app, handled by
  Stripe Checkout and the Stripe Customer Portal, kept in sync via webhooks.
- Idle session timeout with a warning prompt; configurable absolute session
  lifetime.
- Editable profile with an uploadable profile picture.

### Projects

- Create, edit, archive and delete projects, each fully isolated to its owner.
- Rich project record: client details, lot number, council, application and
  PlanSA reference numbers, schedule dates, notes, and dwelling details
  (single/double storey, bedrooms, bathrooms, showers, living areas, car spaces).
- **Responsible entities** per project — Architect, Surveyor, Engineer, Timber
  Company, Take-off Company, Certifier, Land Division and custom types.

### Three built-in workflows

Default tasks are auto-created for every new project:

- **Planning Approval** — land papers, contour survey & bore log, concept plans
  and repeatable variations, planning drawings, site & drainage plan, PlanSA
  lodgement, RFIs, and approval.
- **Development Approval / BRC** — working drawings, energy rating, footing
  report, take-offs, CITB levy, the private-certifier BRC application (with a
  live "missing documents" gate), RFIs, and approval.
- **Land Division** — from sending the job through pegging, SA Water and Open
  Space applications and payments, the SCAP plan, and final titles.

### Task management

- Editable task checklist per workflow with statuses, responsible party, linked
  contact, requested/due/completed dates, estimated days, dependency locks and
  notes.
- Automatic due-date calculation and overdue highlighting with colour coding.
- Repeatable tasks (e.g. concept-plan variations, RFI follow-ups).
- Bulk status updates and inline status changes.

### Views & tracking

- **Dashboard** — active projects, waiting-on-council, overdue tasks, open RFIs,
  approvals this month, average approval time, a workflow-status chart, consultant
  performance and overdue/upcoming lists (with count-up animations).
- **Kanban board** — drag tasks between status columns.
- **Calendar** — due dates, RFI response dates and approval milestones by month.
- **RFI management** — auto-numbered per project and workflow, with a dedicated
  cross-project RFI page.
- **Contacts** directory and per-project contact assignment, plus a printable
  report and CSV export per project.

### Platform

- Real-time, in-memory **search / filter / sort** on the projects list.
- In-app **notification** system (overdue, due-soon and RFI alerts) in a slide-in
  panel, toggleable per account.
- **Toasts** for every save/update action.
- **Dark mode**, a green brand theme, custom logo, and subtle motion (typewriter
  hero, scroll reveals, animated stats).
- Fully **responsive** layout for mobile and tablet.
- A separate **admin console** for platform-wide (privacy-safe) metrics.
- Public marketing pages: landing, pricing and about.

---

## How it works

**Workflow templates as the single source of truth.** Every default task, its
duration and its dependencies are defined once in
`src/lib/workflow-templates.ts`. Both the database seed and live project creation
read from these templates, so the workflow logic is never duplicated inside
components. When a project is created, `src/lib/project-setup.ts` materialises the
templates into `Workflow` and `Task` rows, resolving dependency references to real
task IDs and seeding due dates from the project start date. Account-specific
duration overrides (editable in Settings) are applied at creation time.

**Multi-tenancy.** Projects, contacts, councils and duration settings all carry an
`ownerId`. Every query and mutation is scoped to the signed-in user, and server
actions verify ownership before writing. Accounts can never see each other's data.

**Authentication & the paywall.** Auth.js issues a JWT session on login.
`middleware.ts` protects the app routes and bounces logged-out visitors to
`/login`. The authenticated area lives under the `src/app/(app)/` route group,
whose layout additionally checks the user's Stripe subscription status on every
request — without an active subscription the user is redirected to `/billing`.

**Billing.** `/billing` starts a Stripe Checkout session; a webhook
(`/api/stripe/webhook`) writes the resulting subscription status, price and
period-end back onto the `User`. `src/lib/billing.ts` decides whether a
subscription is currently active (with a short grace window). The Stripe Customer
Portal handles plan changes and cancellations.

**Server-first rendering.** Pages are React Server Components by default; only
interactive pieces (tables, kanban, dialogs, forms, search) are client
components. All mutations run through **Server Actions** with automatic activity
logging and cache revalidation.

---

## Tech stack

| Area | Technology |
| --- | --- |
| Framework | Next.js 14 (App Router), React 18, TypeScript |
| Styling | Tailwind CSS, shadcn/ui-style components (Radix primitives) |
| Auth | Auth.js / NextAuth v5, bcrypt |
| Database | PostgreSQL (Supabase), Prisma ORM |
| Payments | Stripe (subscriptions, Checkout, Customer Portal, webhooks) |
| Forms & validation | React Hook Form, Zod |
| Charts & dates | Recharts, date-fns |
| State / UI | Zustand (toasts), next-themes (dark mode), Lucide icons |
| Fonts | Plus Jakarta Sans (via `next/font`) |

---

## Project structure

```text
prisma/
  schema.prisma          # Data models + enums (User, Project, Task, RFI, …)
  seed.ts                # Demo account (pre-subscribed) + sample data

src/
  app/
    page.tsx             # Public landing page
    pricing/  about/     # Public marketing pages
    login/  signup/      # Authentication screens
    billing/             # Subscribe / manage plan (login required, no sub yet)
    (app)/               # Signed-in, subscription-gated application
      dashboard/         #   Overview + charts
      projects/          #   List, new, [id] detail, workflow sub-pages, print
      contacts/  rfis/  calendar/  settings/
    admin/               # Separate admin console (its own login)
    api/
      auth/[...nextauth] #   Auth.js route
      stripe/webhook     #   Stripe events → database
      projects/[id]/export  # CSV export

  components/
    ui/                  # Primitives: button, card, dialog, toast, skeleton…
    layout/              # Sidebar, topbar, mobile nav
    …                    # Task table, kanban, calendar, panels, charts, forms

  lib/
    workflow-templates.ts# Default tasks for every new project
    project-setup.ts     # Materialises templates into a project
    actions.ts           # Ownership-guarded server actions (mutations)
    queries.ts           # Dashboard + notification aggregations
    auth.ts / auth.config.ts / session.ts   # Authentication
    billing.ts / billing-actions.ts / stripe.ts  # Payments
    admin-auth.ts / admin-actions.ts / admin-data.ts  # Admin console
    business.ts / dates.ts / constants.ts    # Domain logic & labels

middleware.ts            # Route protection
```

---

## Getting started

### Prerequisites

- **Node.js 18.18+**
- A **PostgreSQL database** — the project is set up for [Supabase](https://supabase.com)
  (any Postgres works)
- A **Stripe** account (test mode is fine for development)

### 1. Install

```bash
npm install
```

### 2. Configure environment

Copy the example file and fill in the values (see
[Environment variables](#environment-variables)):

```bash
cp .env.example .env
```

### 3. Set up the database

Create the schema and load demo data:

```bash
npx prisma migrate dev --name init   # or: npm run db:push
npm run db:seed
```

The seed creates a **pre-subscribed demo account** so the paywall can be bypassed
in development:

```text
Email:    demo@greenlight.app
Password: demo12345
```

### 4. Run

```bash
npm run dev
```

The app runs at `http://localhost:3000`. (For the full Stripe subscription flow
locally, run `stripe listen --forward-to localhost:3000/api/stripe/webhook` and
put the printed signing secret in `STRIPE_WEBHOOK_SECRET`.)

---

## Environment variables

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Pooled Postgres connection (Supabase transaction pooler, port 6543, `?pgbouncer=true`) — used at runtime |
| `DIRECT_URL` | Direct Postgres connection (port 5432) — used by `prisma migrate` |
| `AUTH_SECRET` | Secret used to sign Auth.js sessions |
| `STRIPE_SECRET_KEY` | Stripe API secret key (`sk_test_…` / `sk_live_…`) |
| `STRIPE_PRICE_ID` | Price ID of the A$200/month subscription product |
| `STRIPE_WEBHOOK_SECRET` | Signing secret for the Stripe webhook endpoint |
| `NEXT_PUBLIC_APP_URL` | Public base URL, used to build Stripe return links |
| `NEXT_PUBLIC_APP_NAME` | Display name (defaults to "Greenlight") |
| `ADMIN_USERNAME` | Username for the separate admin console |
| `ADMIN_PASSWORD` | Password for the admin console |
| `ADMIN_SECRET` | Secret used to sign the admin session cookie |

Generate the two random secrets with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

## Available scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Generate the Prisma client and build for production |
| `npm run start` | Run the production build |
| `npm run lint` | Lint with ESLint |
| `npm run db:migrate` | Create and apply a Prisma migration (dev) |
| `npm run db:push` | Push the schema without a migration |
| `npm run db:seed` | Seed the demo account and sample data |
| `npm run db:studio` | Open Prisma Studio (database GUI) |
| `npm run db:reset` | Drop, re-migrate and re-seed the database |

---

## Deployment

The application deploys cleanly to **Vercel**:

1. Push the repository to GitHub and import it into Vercel.
2. Add all of the [environment variables](#environment-variables) in the project
   settings (using live Stripe keys and a production `NEXT_PUBLIC_APP_URL` for a
   real launch).
3. Run the migration against the production database once
   (`prisma migrate deploy`), then deploy.
4. Create a **production Stripe webhook** pointing at
   `https://<your-domain>/api/stripe/webhook` and subscribe to
   `checkout.session.completed` and the `customer.subscription.*` events; put its
   signing secret in `STRIPE_WEBHOOK_SECRET` and redeploy.

The `build` script runs `prisma generate` automatically.

---

## The admin console

Greenlight ships with a small **admin console** at `/admin`, protected by its own
credentials (`ADMIN_USERNAME` / `ADMIN_PASSWORD`) — completely separate from user
accounts. It surfaces platform-wide metrics: total users, active subscribers,
total projects and tasks, open RFIs, overdue tasks, new sign-ups, a
projects-by-status breakdown and a per-account table (identity + counts).

By design it shows **only aggregate, account-level information** — it never
exposes any user's project names, addresses, client details, tasks, notes or
documents.

---

## Security & privacy

- Passwords are hashed with **bcrypt**; sessions are stateless JWTs.
- Every database read and write is **scoped to the authenticated owner**; server
  actions verify ownership before mutating.
- Route protection is enforced in `middleware.ts`, and the authenticated area is
  additionally gated on an active Stripe subscription.
- The admin area uses a separate, signed-cookie authentication and only ever
  reads aggregate data.
- Secrets live in environment variables and are never committed (`.env` is
  git-ignored).

---

## Glossary of SA approval terms

| Term | Meaning |
| --- | --- |
| **PlanSA** | South Australia's online planning and development portal |
| **Planning Approval** | Consent that a proposed development is appropriate for the site |
| **BRC** | Building Rules Consent — confirms compliance with building rules |
| **Development Approval** | The combined planning + building consent to proceed |
| **Land Division** | Subdividing land into separate titles |
| **RFI** | Request for Information raised by a council or certifier |
| **CITB** | Construction Industry Training Board levy, payable on building work |
| **SCAP** | State Commission Assessment Panel (land-division assessment) |
| **SA Water** | The state water utility, involved in land-division servicing |
| **S&D** | Site & Drainage plan |
| **Take-off** | A materials/quantities estimate from working drawings |

---

## Roadmap ideas

The codebase is intentionally easy to extend. Natural next steps include:

- **Real file uploads** — `Document.fileUrl` is currently a placeholder; wire it
  to Supabase Storage, S3 or Vercel Blob.
- **Email reminders** — the overdue/upcoming data already exists; add a scheduled
  job to notify owners.
- **Teams / organisations** — extend the `ownerId` model to a shared workspace.
- **Free trials, annual pricing, or multiple plans** in Stripe.
- **PlanSA integration** — the reference-number fields are ready to sync.

---

## License

This repository does not currently include an open-source license, so all rights
are reserved by the author by default. To make it reusable, add a `LICENSE` file
(for example, the MIT License).

---

_Built with Next.js, Prisma, Supabase and Stripe._
