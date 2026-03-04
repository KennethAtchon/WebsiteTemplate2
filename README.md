# WebsiteTemplate

A **Next.js SaaS template** with auth, subscriptions, payments, and admin already set up. Use it as a base for your product and focus on your **core feature** and branding.

---

## Using this template

### 1. Clone

```bash
git clone <this-repo> your-project
cd your-project/project
```

### 2. Environment

Copy the example env file and fill in your values:

```bash
cp .env.example .env
```

Edit `.env` with your database URL, Firebase config, Stripe keys, and other required variables. See `.env.example` for comments.

### 3. Product identity (change these first)

Set your app name, tagline, and support email in one place:

**File:** `project/shared/constants/app.constants.ts`

- `APP_NAME` — Your product name (used in UI, SEO, manifest, GDPR export).
- `APP_DESCRIPTION` / `APP_TAGLINE` — Short description.
- `SUPPORT_EMAIL` — Contact email.
- `CORE_FEATURE_SLUG` — URL slug for your main app feature (default `"calculator"`). Change to `"tools"`, `"documents"`, etc. if you build something else.

### 4. Copy and marketing text

All user-facing strings are in one file:

**File:** `project/translations/en.json`

Search-replace `CalcPro` and `calcpro.com` with your app name and domain. This covers landing page copy, FAQ, footer, legal pages, and email templates. You can also update descriptions and taglines here.

### 5. Environment variables

Copy `project/example.env` to `project/.env` and fill in your values. Key things to change:

- `DATABASE_URL` / `POSTGRES_DB` — Replace `your_app` with your database name.
- `CORS_ALLOWED_ORIGINS` — Replace `your-app.com` with your actual domain(s).
- `PROD_URL` — Set this in your shell or CI to use `bun run load-test:prod`.

### 6. Install and run

```bash
cd project
bun install
bun run db:generate
bun run db:migrate
bun run dev
```

Open [http://localhost:3000](http://localhost:3000). You should see the app with the default (calculator) implementation.

**Note:** If you have an existing database, the migration renames the usage table from `calculator_usage` to `feature_usage` (and related columns). Run `bun run db:migrate` so the schema stays in sync.

### 7. Where to build your feature

- **Product identity:** `project/shared/constants/app.constants.ts`
- **Core feature (default: calculators):** `project/features/calculator/`  
  - Add or edit ?feature types? via config, services, and components here.  
  - To replace with a different product (e.g. document tools), implement your logic in a feature module and point routes/config to it. See [Where to start coding](docs/where-to-start-coding.md).
- **Copy and marketing:** `project/translations/en.json` and public pages (landing, pricing, FAQ, etc.).

---

## What?s included (common stuff)

You don?t need to build these; they?re already in the template:

| Area | What?s there |
|------|------------------|
| **Auth** | Firebase Auth, sign-in/sign-up, session, roles (user/admin) |
| **Subscriptions** | Stripe + Firebase Extension, tiers, checkout, customer portal |
| **Payments** | Stripe Checkout (subscriptions and one-time), webhooks |
| **Orders** | One-time orders in PostgreSQL, admin order list |
| **Admin** | Dashboard, customers, orders, subscriptions, contact messages, dev tools |
| **Public** | Landing, pricing, FAQ, contact, about, terms, privacy |
| **Usage & limits** | Per-user usage tracking, tier-based limits, usage dashboard |
| **Infra** | PostgreSQL (Prisma), Redis, env config, CSRF, rate limiting, error handling |

Configure via env and Stripe/Firebase; customize branding and copy.

---

## Documentation

- [Template Guide](docs/TEMPLATE_GUIDE.md) — **Master reference:** full project map, where everything lives, and how to make it your own.
- [Where to start coding](docs/where-to-start-coding.md) ? Core feature module, config, and how to add or replace feature types.
- [Template roadmap](docs/template-roadmap.md) ? Full plan for making the project topic-agnostic and adopter-friendly.
- [AI_Orchestrator](docs/AI_Orchestrator/index.md) ? Architecture, domain docs, and guides.

---

## Scripts (from `project/`)

| Command | Description |
|---------|-------------|
| `bun run dev` | Start dev server |
| `bun run build` | Production build |
| `bun run db:generate` | Generate Prisma client |
| `bun run db:migrate` | Run migrations |
| `bun run db:studio` | Open Prisma Studio |
| `bun run lint` | Run ESLint |
| `bun run test` | Run tests |

---

## Tech stack

Next.js 15 (App Router), React 19, TypeScript, Prisma, PostgreSQL, Firebase Auth, Stripe, Tailwind CSS, next-intl.
