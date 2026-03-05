# Frontend E2E Tests Plan

## Current State

E2E tests are in `project/__tests__/e2e/` and use Playwright. They test the monolith (Next.js) app. After migration, they need to test the **frontend SPA** (Vite + React) talking to the **backend API** (Bun/Hono).

## Directory Layout

E2E tests should live in `frontend/__tests__/e2e/` (new — create this directory).

Current monolith e2e structure to migrate:
```
project/__tests__/e2e/
  admin/
  auth/
    protected-redirect.spec.ts
    sign-in.spec.ts
    sign-up.spec.ts
  customer/
  public/
  shared/
```

## Configuration Changes

The Playwright config (`project/playwright.config.ts`) points to the Next.js dev server. Create `frontend/playwright.config.ts` pointing to Vite:

```typescript
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./__tests__/e2e",
  use: {
    baseURL: "http://localhost:5173", // Vite dev server
  },
  webServer: {
    command: "bun run dev",
    url: "http://localhost:5173",
    reuseExistingServer: !process.env.CI,
  },
});
```

Note: E2E tests also need the backend running. Consider a `webServer` entry for the backend or use a test-specific docker-compose.

## Files to Migrate

### Auth Tests (`auth/`)

| File | Changes needed |
|---|---|
| `sign-in.spec.ts` | Update selectors if component structure changed (Vite vs Next.js). URL paths may differ (`/auth/signin` vs `/signin`). |
| `sign-up.spec.ts` | Same as above. Check form field selectors. |
| `protected-redirect.spec.ts` | Verify redirect URL matches frontend router config. |

### Admin Tests (`admin/`)

Review each test — admin routes exist in the frontend at `src/features/admin/`. Update:
- Base URL references
- Any Next.js-specific routing (no `_next/` paths)
- Auth cookie handling (session cookies vs Firebase token flow)

### Customer Tests (`customer/`)

Update URLs to match frontend React Router routes (check `frontend/src/router.tsx` and `frontend/src/routeTree.gen.ts`).

### Public Tests (`public/`)

These are the simplest — just landing/marketing pages. Verify URL paths match.

## New E2E Tests to Write

These cover the split-server architecture specifically.

| File | What to test |
|---|---|
| `e2e/api-connectivity.spec.ts` | Frontend can reach backend: health endpoint returns 200 from browser context |
| `e2e/auth/session-persistence.spec.ts` | After login, refresh page still authenticated |
| `e2e/auth/token-refresh.spec.ts` | Expired token triggers re-auth flow without visible interruption |
| `e2e/calculator/calculator-flow.spec.ts` | Full calculator: select type → input values → submit → see result |
| `e2e/subscriptions/upgrade-flow.spec.ts` | Upgrade tier → Stripe checkout → redirect back → new tier reflected |
| `e2e/payments/payment-history.spec.ts` | Payment list loads, pagination works |

## Seed Data

The monolith has `project/__tests__/helpers/e2e-seed.ts`. Copy/adapt to `frontend/__tests__/helpers/e2e-seed.ts` — it will now call the backend API to seed data rather than using Prisma directly (or keep direct DB access via a shared seed script).

## Running E2E Tests

```bash
cd frontend
bunx playwright test              # all e2e
bunx playwright test auth/        # specific folder
bunx playwright test --ui         # interactive mode
```

Add to `frontend/package.json`:
```json
"test:e2e": "playwright test",
"test:e2e:seed": "bun __tests__/helpers/e2e-seed.ts"
```
