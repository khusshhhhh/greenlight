# Greenlight

**Greenlight** is a modern, multi-tenant **SaaS** for tracking residential
development approval projects in South Australia — **Planning Approval**,
**Development Approval / BRC** and **Land Division** — in one clean dashboard.

Users **sign up with email + password**, **subscribe for A$200/month via Stripe**,
and get their own private workspace. It runs on **Supabase** (PostgreSQL) and
deploys to **Vercel**.

> 👉 New to all this? Follow **[the complete beginner's guide](#-complete-setup--go-live-guide)** below, top to bottom.

---

## ✨ What it does

- **Accounts & billing** — email/password sign-up, then a paid subscription
  (A$200/month) is required to access the app. Payments handled by Stripe.
- **Private per-user data** — every project, contact and setting is scoped to the
  account (multi-tenant). Users never see each other's data.
- **Three workflows per project** — Planning, Development / BRC, Land Division,
  with default tasks created automatically.
- **Editable task checklists**, auto-calculated due dates, overdue flags,
  repeatable variations, dependency locks.
- **Kanban board**, **calendar**, **RFI tracking**, **dashboard** with charts,
  **contacts**, **documents**, **notes**, **activity log**, **CSV export**,
  **printable reports** and **dark mode**.

## 🧱 Tech stack

Next.js 14 (App Router) · TypeScript · Tailwind · **Auth.js (NextAuth v5)** ·
**Supabase (PostgreSQL)** · Prisma · **Stripe** subscriptions · Recharts ·
date-fns · Lucide.

---

# 🚀 Complete setup & go-live guide

From **"I have the code"** to **"customers can sign up and pay"**. No prior
experience needed — copy the commands, click the buttons.

| Part | What you'll do |
| --- | --- |
| 1 | Install Node.js + Git |
| 2 | Create the Supabase database |
| 3 | Set up Stripe (the A$200 plan + keys) |
| 4 | Put your keys into the project (`.env`) |
| 5 | Install, create tables, add demo data |
| 6 | Run locally & test a real (test-mode) payment |
| 7 | Put the code on GitHub |
| 8 | Deploy to Vercel |
| 9 | Connect the Stripe webhook in production |
| 10 | Switch on real payments (go live) |

> 💡 **Running commands:** In File Explorer, open the project folder
> (`K:\MissionNew\ApprovalFlow SA`), right-click an empty area → **Open in
> Terminal**. Paste each command, press **Enter**, wait, then do the next.

---

## Part 1 — Install Node.js + Git

1. **Node.js**: https://nodejs.org → click **LTS** → run installer → Next → Next
   → Install → Finish. Check: `node -v` shows a version.
2. **Git**: https://git-scm.com/download/win → run installer → Next → Install →
   Finish. Reopen the terminal, check: `git --version`.

---

## Part 2 — Create your Supabase database

1. Go to **https://supabase.com** → **Start your project** → sign in (GitHub is
   easiest).
2. Click **New project**. Give it a name (`greenlight`), and **set a database
   password** — write this password down, you'll need it. Pick a region close to
   you (e.g. Sydney) → **Create new project**. Wait ~1 minute for it to finish.
3. At the top of the project, click the **Connect** button.
4. Choose the **ORMs** tab (or "Prisma"). You'll see two lines — `DATABASE_URL`
   and `DIRECT_URL`. They look like:

   ```
   DATABASE_URL="postgresql://postgres.abcdefgh:[YOUR-PASSWORD]@aws-0-ap-southeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true"
   DIRECT_URL="postgresql://postgres.abcdefgh:[YOUR-PASSWORD]@aws-0-ap-southeast-2.pooler.supabase.com:5432/postgres"
   ```

5. **Copy both.** Replace `[YOUR-PASSWORD]` with the database password from step 2.
   Keep them handy for Part 4.

✅ You now have a scalable Postgres database.

---

## Part 3 — Set up Stripe (the A$200 plan)

Stripe handles the payments. We'll work in **Test mode** first (fake money), and
switch to real money in Part 10.

1. Go to **https://stripe.com** → **Sign up** / **Sign in**.
2. Make sure the **Test mode** toggle (top-right) is **ON**.

### 3a. Create the product & price

1. Left menu → **Product catalog** → **+ Add product**.
2. Name: **Greenlight Pro**.
3. Under **Pricing**: Recurring · **Monthly** · Amount **200** · Currency **AUD**.
4. Click **Save**.
5. Open the product, find the **price** you just created, and copy its **Price ID**
   (starts with `price_...`). Save it for Part 4.

### 3b. Get your secret API key

1. Left menu → **Developers → API keys**.
2. Copy the **Secret key** (starts with `sk_test_...`). Save it for Part 4.

> You'll set up the **webhook secret** in Part 6 (local) and Part 9 (production).

---

## Part 4 — Put your keys into the project

1. Create your settings file:

   ```powershell
   Copy-Item .env.example .env
   ```

2. Generate a login-security secret and **copy the printed line**:

   ```powershell
   node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
   ```

3. Open the settings file:

   ```powershell
   notepad .env
   ```

4. Fill in these values (leave `STRIPE_WEBHOOK_SECRET` as-is for now):

   ```
   DATABASE_URL="...your Supabase pooler string (port 6543, ends with pgbouncer=true)..."
   DIRECT_URL="...your Supabase session string (port 5432)..."
   AUTH_SECRET="...the secret you generated in step 2..."
   STRIPE_SECRET_KEY="sk_test_...your Stripe secret key..."
   STRIPE_PRICE_ID="price_...your Greenlight Pro price id..."
   STRIPE_WEBHOOK_SECRET="whsec_xxx"
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   ```

5. **Save and close** Notepad.

---

## Part 5 — Install, create tables, add demo data

Run these one at a time:

```powershell
npm install
npx prisma migrate dev --name init
npm run db:seed
```

- ✅ `migrate` prints `Your database is now in sync with your schema.`
- ✅ `db:seed` prints a demo login: **`demo@greenlight.app`** / **`demo12345`**
  (this demo account is pre-subscribed, so it skips payment).

---

## Part 6 — Run locally & test a real (test-mode) payment

Payments rely on a **webhook** — a message Stripe sends your app when a payment
succeeds. Locally we use the free **Stripe CLI** to forward those messages.

### 6a. Install & connect the Stripe CLI

1. Download the Stripe CLI for Windows from
   **https://github.com/stripe/stripe-cli/releases/latest** (the `..._windows_x86_64.zip`).
   Unzip it and note where `stripe.exe` is.
2. In a **new** terminal, log the CLI in to your Stripe account:

   ```powershell
   stripe login
   ```

   (If `stripe` isn't recognised, run it from the folder where `stripe.exe` is,
   e.g. `.\stripe.exe login`.) Approve in the browser.

3. Start forwarding webhooks to your app (keep this terminal open):

   ```powershell
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```

   It prints a line like `Ready! ... webhook signing secret is whsec_abc123...`.
   **Copy that `whsec_...` value**, paste it into `.env` as
   `STRIPE_WEBHOOK_SECRET`, and save.

### 6b. Start the app

In your **first** terminal:

```powershell
npm run dev
```

### 6c. Try the whole flow

1. Open **http://localhost:3000** → click **Get started** → create a new account
   (any email + an 8+ character password).
2. You'll land on the **billing page** (a new account has no subscription yet).
3. Click **Subscribe — A$200/month**. You'll be sent to Stripe's secure checkout.
4. Pay with the **test card**: number **4242 4242 4242 4242**, any future expiry
   (e.g. `12/34`), any CVC (e.g. `123`), any postcode.
5. Stripe sends you back, the webhook activates your subscription, and you land
   on the **dashboard**. 🎉

✅ You just tested the full paid sign-up. To stop: **Ctrl + C** in each terminal.

---

## Part 7 — Put your code on GitHub

1. **https://github.com** → sign up / log in → **+** → **New repository** →
   name `greenlight` → **don't** add a README → **Create repository**.
2. Tell Git who you are (first time only):

   ```powershell
   git config --global user.name "Your Name"
   git config --global user.email "you@example.com"
   ```

3. Upload (replace `YOUR-USERNAME` in the 5th line):

   ```powershell
   git init
   git add .
   git commit -m "Greenlight"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/greenlight.git
   git push -u origin main
   ```

   Approve the browser sign-in if it appears.

> 🔒 Your `.env` (all your secret keys) is **not** uploaded — that's on purpose.
> You'll add the keys to Vercel privately next.

---

## Part 8 — Deploy to Vercel

1. **https://vercel.com** → **Sign Up** → **Continue with GitHub** → **Authorize**.
2. **Add New… → Project** → find **`greenlight`** → **Import**.
3. Open **Environment Variables** and add each of these (Name → Value), using the
   values from your `.env`:

   | Name | Value |
   | --- | --- |
   | `DATABASE_URL` | Supabase pooler string (port 6543) |
   | `DIRECT_URL` | Supabase session string (port 5432) |
   | `AUTH_SECRET` | your generated secret |
   | `STRIPE_SECRET_KEY` | `sk_test_...` |
   | `STRIPE_PRICE_ID` | `price_...` |
   | `STRIPE_WEBHOOK_SECRET` | leave as `whsec_xxx` for now — set in Part 9 |
   | `NEXT_PUBLIC_APP_URL` | leave blank for now — set in Part 9 |

4. Click **Deploy**. Wait 1–2 minutes.
5. You'll get a live URL like `https://greenlight-xxxx.vercel.app`. **Copy it.**

> Because you already ran the migration against Supabase in Part 5, your live site
> shares that same database — no extra database setup needed.

---

## Part 9 — Connect the Stripe webhook in production

Your live site needs its own webhook (the Stripe CLI was only for local testing).

1. **Set the app URL:** in Vercel → your project → **Settings → Environment
   Variables** → edit **`NEXT_PUBLIC_APP_URL`** to your live URL from Part 8
   (e.g. `https://greenlight-xxxx.vercel.app`). Save.
2. In **Stripe** (Test mode) → **Developers → Webhooks** → **Add endpoint**.
   - **Endpoint URL:** `https://YOUR-LIVE-URL/api/stripe/webhook`
   - **Select events:** add `checkout.session.completed`,
     `customer.subscription.created`, `customer.subscription.updated`,
     `customer.subscription.deleted`.
   - Click **Add endpoint**.
3. On the new endpoint, click **Reveal** under **Signing secret** and copy the
   `whsec_...` value.
4. Back in Vercel → **Environment Variables** → set **`STRIPE_WEBHOOK_SECRET`**
   to that value. Save.
5. **Redeploy** so the new settings take effect: Vercel → **Deployments** →
   the latest one → **⋯ → Redeploy**.

✅ Now visit your live URL, sign up, and subscribe with the test card
(4242 4242 4242 4242). It should activate and open the dashboard.

---

## Part 10 — Switch on real payments (go live)

When you're ready to charge real money:

1. In Stripe, complete **Activate account** (business & bank details).
2. Flip Stripe to **Live mode** (top-right toggle).
3. Re-create the **Greenlight Pro** A$200/month product **in Live mode** and copy
   the new **live** `price_...`.
4. Get your **live** secret key (`sk_live_...`) from **Developers → API keys**.
5. Create a **live** webhook (Part 9, but in Live mode) and copy its `whsec_...`.
6. In Vercel, update these env vars to the **live** values, then **Redeploy**:
   `STRIPE_SECRET_KEY`, `STRIPE_PRICE_ID`, `STRIPE_WEBHOOK_SECRET`.

Your customers can now sign up and pay for real. 💳

---

## 🔁 Updating your site later

```powershell
git add .
git commit -m "Describe what changed"
git push
```

Vercel redeploys automatically. If a change alters the database structure, run
once locally: `npx prisma migrate deploy`.

---

## 🆘 Troubleshooting

| You see… | Do this |
| --- | --- |
| `prisma migrate` can't connect | Check `DIRECT_URL` — Supabase **port 5432** string, with your real password (no brackets). |
| App error `Can't reach database` | Check `DATABASE_URL` — Supabase **port 6543** string, must include `?pgbouncer=true`. |
| After paying I'm stuck on the billing page | The webhook didn't reach the app. Locally: is `stripe listen` still running, and is its `whsec_` in `.env`? In production: is the Vercel `STRIPE_WEBHOOK_SECRET` correct and did you redeploy (Part 9)? |
| Checkout says "No such price" | `STRIPE_PRICE_ID` doesn't match the mode. Test price for test keys, live price for live keys. |
| Vercel build fails | A missing env var — confirm all of them (Part 8) and redeploy. |
| Login says invalid password | Passwords must be 8+ characters. Or use demo `demo@greenlight.app` / `demo12345`. |

---

## 📖 How billing & access work (reference)

- **Sign-up** hashes the password (bcrypt) and creates a `User`. Sessions are
  JWTs — no session table.
- **`middleware.ts`** redirects logged-out visitors to `/login`. Public pages:
  landing `/`, `/pricing`, `/login`, `/signup`.
- **The app is subscription-gated:** `src/app/(app)/layout.tsx` checks the user's
  Stripe status on every visit; without an active subscription you're sent to
  `/billing`.
- **Stripe flow:** `/billing` → `startCheckout()` (`src/lib/billing-actions.ts`)
  → Stripe Checkout → back to the app. The webhook
  (`src/app/api/stripe/webhook/route.ts`) writes the subscription status onto the
  `User`. `src/lib/billing.ts` decides if it's active. "Manage billing" opens the
  Stripe Customer Portal.
- **Multi-tenant:** every Project/Contact/Council/Setting has an `ownerId`; all
  reads and writes are scoped to the signed-in user.

## Project structure (key files)

```
prisma/schema.prisma        # Models (User has Stripe fields) + enums
prisma/seed.ts              # Demo account (pre-subscribed) + sample data
src/app/
  page.tsx  pricing/  login/  signup/   # public
  billing/                              # subscribe / manage (login required)
  (app)/                                # the gated app (needs a subscription)
  api/stripe/webhook/                   # Stripe events → DB
  api/auth/[...nextauth]/               # Auth.js
src/lib/
  stripe.ts  billing.ts  billing-actions.ts   # payments
  auth.ts  auth.config.ts  session.ts          # authentication
  actions.ts                                   # ownership-guarded mutations
  workflow-templates.ts                        # default project tasks
middleware.ts               # route protection
```
