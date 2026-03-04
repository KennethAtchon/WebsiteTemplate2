# Migration Plan Overview

This folder documents everything still needed to complete the migration from the Next.js monolith (`project/`) to the split Vite frontend (`frontend/`) + Hono backend (`backend/`).

## Architecture Being Migrated To

```
project/ (Next.js monolith — original, reference only)
├── frontend/   (Vite + React + TanStack Router + i18next)
└── backend/    (Bun + Hono + Prisma + Firebase Admin)
```

## Overall Completion Status

| Area | Status | Severity | Doc |
|------|--------|----------|-----|
| Next.js imports in frontend code | ❌ Broken | **CRITICAL** | [02-NEXTJS-CONTAMINATION.md](./02-NEXTJS-CONTAMINATION.md) |
| App setup — missing providers | ❌ Broken | **CRITICAL** | [04-APP-SETUP-AND-PROVIDERS.md](./04-APP-SETUP-AND-PROVIDERS.md) |
| Payment/Stripe integration | ❌ Stub only | **CRITICAL** | [05-PAYMENT-FLOW.md](./05-PAYMENT-FLOW.md) |
| Environment variables (VITE_ prefix) | ❌ Wrong | **HIGH** | [03-ENV-VARS-MIGRATION.md](./03-ENV-VARS-MIGRATION.md) |
| i18n initialization | ❌ Missing | **HIGH** | [09-I18N-MIGRATION.md](./09-I18N-MIGRATION.md) |
| Admin panel — 3 stub pages | ⚠️ Incomplete | **HIGH** | [06-ADMIN-PANEL-GAPS.md](./06-ADMIN-PANEL-GAPS.md) |
| Frontend pages (stubs) | ⚠️ Partial | **MEDIUM** | [07-FRONTEND-PAGES-STATUS.md](./07-FRONTEND-PAGES-STATUS.md) |
| Backend API completeness | ✅ Done | — | [08-BACKEND-COMPLETENESS.md](./08-BACKEND-COMPLETENESS.md) |
| Testing + deployment | ❌ Not started | **HIGH** | [10-TESTING-AND-DEPLOYMENT.md](./10-TESTING-AND-DEPLOYMENT.md) |

## Priority Order (Fix This Order)

### P0 — Will crash or break the app immediately

1. **Remove `next/server` imports from frontend** — 6 files crash Vite build
2. **Add `I18nextProvider` + init to `main.tsx`** — all `useTranslation()` calls fail
3. **Fix `envUtil.ts`** — uses `process.env` and `NEXT_PUBLIC_` prefix; Vite uses `import.meta.env` and `VITE_`

### P1 — Core functionality missing

4. **Payment page** — currently a placeholder with no Stripe Elements
5. **Admin: ContactMessages page** — stub only, no component migrated
6. **Admin: Developer page** — stub only, original had schema/table browser
7. **Admin: Settings page** — stub only, original had configuration UI
8. **AppProvider / app context** — not included in provider tree in `main.tsx`

### P2 — Quality/completeness gaps

9. Convert all `useTranslations` (next-intl) → `useTranslation` (react-i18next) in migrated components
10. End-to-end tests for auth and payment flows
11. Deployment configuration (environment variables, CORS origins, Docker)

## File Structure Quick Reference

### Frontend (`frontend/src/`)
- `routes/` — TanStack Router pages
- `features/` — Feature modules (auth, calculator, payments, admin, etc.)
- `shared/` — Components, hooks, services, utils
- `translations/en.json` — All UI strings
- `main.tsx` — App entry point (missing providers — see P0)

### Backend (`backend/src/`)
- `routes/api/` — Hono API handlers (all ported ✅)
- `middleware/` — Auth, CSRF, security headers
- `infrastructure/database/prisma/` — Schema and generated types
- `services/` — Email, storage, Firebase admin, rate limiting

### Original (`project/`)
- Keep as reference until migration is verified complete
- Do **not** delete until all P0/P1 items are resolved and tested
