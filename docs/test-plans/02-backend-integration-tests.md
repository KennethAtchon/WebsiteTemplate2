# Backend Integration Tests Plan

Target directory: `backend/__tests__/integration/`

## Current State

The integration test files were **copied from the monolith** but still import Next.js route handlers (`@/app/api/.../route`). They need to be adapted to test Hono route handlers directly.

## Files Requiring Adaptation

| File | Monolith route(s) tested | Backend equivalent |
|---|---|---|
| `api-health-and-calculator.test.ts` | `/api/live`, `/api/calculator/calculate` | `src/routes/health.ts`, `src/routes/calculator.ts` |
| `api-health-ready.test.ts` | `/api/ready` | `src/routes/health.ts` |
| `api-admin.test.ts` | `/api/admin/*` | `src/routes/admin/` |
| `api-analytics.test.ts` | `/api/analytics/*` | `src/routes/analytics/` |
| `api-calculator.test.ts` | `/api/calculator/*` | `src/routes/calculator.ts` |
| `api-csrf.test.ts` | `/api/csrf` | `src/routes/csrf.ts` |
| `api-customer-orders.test.ts` | `/api/customer/orders` | `src/routes/customer/` |
| `api-security.test.ts` | Security headers on all routes | `src/middleware/security-headers.ts` |
| `api-shared.test.ts` | Shared API behavior | General Hono app behavior |
| `api-subscriptions.test.ts` | `/api/subscriptions/*` | `src/routes/subscriptions.ts` |
| `api-users.test.ts` | `/api/users/*` | `src/routes/users.ts` |
| `middleware.test.ts` | Next.js middleware | `src/middleware/protection.ts` |
| `00-middleware-production.test.ts` | Next.js middleware in prod mode | `src/middleware/protection.ts` |

## Adaptation Strategy

### Step 1: Understand Hono App Structure

Instead of importing individual Next.js route handlers, import the Hono app and use `app.request()`:

```typescript
// Monolith pattern (DO NOT USE in backend)
import { POST as CalculatorPOST } from "@/app/api/calculator/calculate/route";
const response = await CalculatorPOST(request);

// Hono pattern (use this in backend)
import { app } from "../../src/index";
const response = await app.request("/api/calculator/calculate", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ type: "mortgage", ... }),
});
```

### Step 2: Mock Strategy

The monolith mocked Firebase and Prisma via bun module mocking. Keep the same approach:

```typescript
import { mock } from "bun:test";

mock.module("../../src/services/firebase/admin", () => ({
  adminAuth: {
    verifyIdToken: mock(() => Promise.resolve({ uid: "test-uid" })),
  },
}));

mock.module("../../src/infrastructure/database/prisma-client", () => ({
  prisma: mockPrismaClient,
}));
```

### Step 3: Auth Bypass Pattern

```typescript
// Mock the requireAuth middleware
mock.module("../../src/features/auth/firebase-middleware", () => ({
  requireAuth: mock(() => Promise.resolve(mockAuthResult)),
}));
```

## New Integration Tests to Write

These cover backend-specific endpoints that had no equivalent in the monolith.

| File | What to test |
|---|---|
| `api-webhooks.test.ts` | Stripe webhook events — subscription created/updated/deleted, payment succeeded/failed. Test signature validation rejects invalid requests. |
| `api-session.test.ts` | Session set/get/delete cookie endpoints |
| `api-storage.test.ts` | S3 presigned URL endpoint — auth required, correct response shape |

## File-by-File Adaptation Notes

### `api-health-and-calculator.test.ts`

Key changes:
- Replace `new NextRequest(...)` with plain `Request` or use `app.request()`
- Remove Next.js-specific response parsing if needed
- Keep the same test assertions (status codes, response body shape)

### `api-security.test.ts`

- Check that Hono middleware adds the same security headers (`X-Content-Type-Options`, `X-Frame-Options`, `Strict-Transport-Security`, etc.)
- Test that CORS headers are set correctly for the frontend origin

### `middleware.test.ts` / `00-middleware-production.test.ts`

- The Hono protection middleware (`src/middleware/protection.ts`) works differently from Next.js middleware
- Test: unauthenticated requests to protected routes get 401
- Test: authenticated requests pass through
- Test: public routes don't require auth

## Shared Test Helpers

Create `backend/__tests__/helpers/` with:

```
helpers/
  create-test-app.ts    # Creates a Hono app instance with mocks pre-wired
  mock-auth.ts          # Standard auth mock result
  mock-prisma.ts        # Standard Prisma mock
  request-helpers.ts    # Typed wrappers around app.request()
```

These reduce boilerplate across all integration test files.

## Running Integration Tests

```bash
cd backend
bun test __tests__/integration
```

Note: Integration tests need environment variables. Create `backend/__tests__/setup/.env.test` or use the `example.env` as base.
