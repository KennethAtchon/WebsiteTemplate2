# Issue 1: Dead `routes/api/` Directory

**Severity:** High
**Action:** Delete entirely

## Problem

`backend/src/routes/api/` is a direct copy of `project/app/api/` — the Next.js route
handlers. These files use:
- `NextRequest` / `NextResponse` from `next/server`
- `@/shared/...` path aliases pointing to the Next.js monolith
- Next.js `export async function GET/POST/PUT/DELETE` patterns

They are **not used anywhere** by the Hono server. The actual Hono routes that serve
the same endpoints already exist in `backend/src/routes/*.ts`.

## Evidence

`backend/src/index.ts` imports routes from:
```ts
import adminRoutes from "./routes/admin";       // <-- Hono route
import healthRoutes from "./routes/health";     // <-- Hono route
// etc.
```

No file imports from `./routes/api/`.

## Files to Delete

The entire directory: `backend/src/routes/api/`

```
backend/src/routes/api/
  admin/analytics/route.ts           (copy of project/app/api/admin/analytics/route.ts)
  admin/customers/route.ts
  admin/database/health/route.ts
  admin/orders/[id]/route.ts
  admin/orders/route.ts
  admin/schema/route.ts
  admin/subscriptions/analytics/route.ts
  admin/subscriptions/[id]/route.ts
  admin/subscriptions/route.ts
  admin/sync-firebase/route.ts
  admin/verify/route.ts
  analytics/form-completion/route.ts
  analytics/form-progress/route.ts
  analytics/search-performance/route.ts
  analytics/web-vitals/route.ts
  calculator/calculate/route.ts
  calculator/export/route.ts
  calculator/history/route.ts
  calculator/types/route.ts
  calculator/usage/route.ts
  csrf/route.ts
  customer/orders/by-session/route.ts
  customer/orders/create/route.ts
  customer/orders/[orderId]/route.ts
  customer/orders/route.ts
  customer/orders/total-revenue/route.ts
  customer/profile/route.ts
  health/error-monitoring/route.ts
  health/route.ts
  live/route.ts
  metrics/route.ts
  ready/route.ts
  shared/contact-messages/route.ts
  shared/emails/route.ts
  shared/upload/route.ts
  subscriptions/current/route.ts
  subscriptions/portal-link/route.ts
  subscriptions/trial-eligibility/route.ts
  users/customers-count/route.ts
  users/delete-account/route.ts
  users/export-data/route.ts
  users/object-to-processing/route.ts
  users/route.ts
```

## Verification Before Deleting

Run this to confirm nothing imports from this directory:
```bash
grep -r "routes/api" backend/src --include="*.ts" -l
```
Expected: no output.
