# Next.js Contamination in Frontend Code

## Summary

Six files inside `frontend/src/` still import from `"next/server"` or use Next.js-specific APIs. These will crash the Vite build or silently fail at runtime because `next` is not a dependency of the frontend package.

## Affected Files

### 1. `frontend/src/features/auth/services/firebase-middleware.ts`

**Imports:**
```ts
import { NextRequest, NextResponse } from "next/server";
```

**What it does:** This is the server-side auth middleware that verifies Firebase tokens, creates DB users, and returns `NextResponse` error objects. It uses Prisma and Firebase Admin SDK — both server-only dependencies.

**Problem:** This file should **never be in the frontend**. It is a backend concern. The backend already has its own equivalent auth middleware at `backend/src/middleware/protection.ts`.

**Fix:** Delete this file from `frontend/`. Any component that imported it needs to be updated to use the API instead (via `useAuthenticatedFetch`). Do NOT port it client-side — auth verification must stay server-side.

---

### 2. `frontend/src/shared/services/csrf/csrf-protection.ts`

**Imports:**
```ts
import { NextRequest } from "next/server";
```

**What it does:** Server-side CSRF token extraction and validation using `NextRequest.headers`.

**Problem:** CSRF protection in a Vite SPA works differently — the CSRF token is fetched from the backend (`/api/csrf`) and sent as a header with mutating requests. There is no server-side request object on the frontend.

**Fix:** Delete or completely rewrite this file for the frontend context. The frontend's role is only to:
1. Fetch a CSRF token from `GET /api/csrf`
2. Attach it as `X-CSRF-Token` header on POST/PUT/DELETE requests

The backend handles all CSRF validation server-side. The backend already has `backend/src/services/csrf/csrf-protection.ts`.

---

### 3. `frontend/src/shared/services/rate-limit/comprehensive-rate-limiter.ts`

**Imports:**
```ts
import { NextRequest, NextResponse } from "next/server";
```

**What it does:** Server-side Redis-based rate limiting middleware that reads `NextRequest` to identify callers and returns `NextResponse` with 429 status.

**Problem:** Rate limiting is entirely a backend concern. The frontend cannot and should not run Redis queries.

**Fix:** Delete this file from `frontend/`. Rate limiting already exists in the backend at `backend/src/services/rate-limit/`. The frontend never needs to rate-limit itself.

---

### 4. `frontend/src/shared/services/request-identity/request-identity.ts`

**Imports:**
```ts
import { NextRequest } from "next/server";
```

**What it does:** Extracts caller identity (IP address, user agent, fingerprint) from a `NextRequest` object for use in rate limiting and analytics.

**Problem:** Request identity extraction from server-side request objects is a backend concern. The frontend does not have access to raw HTTP request objects.

**Fix:** Delete this file from `frontend/`. The backend has this handled. If the frontend needs to send identity-related data, it should be passed as headers from the client (e.g., `X-Timezone`), which the backend already reads.

---

### 5. `frontend/src/shared/utils/api/response-helpers.ts`

**Imports:** Uses Next.js response patterns.

**What it does:** Utility functions for building API responses (`NextResponse.json(...)` wrappers, status code helpers).

**Problem:** API response helpers are backend utilities. The frontend only consumes responses; it never constructs them.

**Fix:** Delete this file from `frontend/`. The backend has its own response helpers at `backend/src/utils/api/`. Any frontend code that uses this file should use `fetch` responses directly (via `useAuthenticatedFetch` or React Query).

---

### 6. `frontend/src/shared/utils/error-handling/api-error-wrapper.ts`

**Imports:** Uses Next.js server patterns.

**What it does:** Wraps API route handlers with try/catch and returns `NextResponse` error objects.

**Problem:** API route handler wrappers are a backend pattern. The frontend handles errors via React Query's `onError`, try/catch in hooks, or error boundaries.

**Fix:** Delete this file from `frontend/`. Error handling in the frontend should use:
- React Query's built-in error state for data fetching
- `try/catch` inside async event handlers
- Error boundaries for component-level errors

---

## How to Find All Remaining Contamination

Run this from the repo root to verify no `next/` imports remain after fixes:

```bash
grep -r "from 'next/" frontend/src --include="*.ts" --include="*.tsx"
grep -r 'from "next/' frontend/src --include="*.ts" --include="*.tsx"
```

Both should return **zero results** after cleanup.

Also check for `"use client"` and `"use server"` directives — these are Next.js App Router conventions that have no meaning in Vite:

```bash
grep -r '"use client"' frontend/src --include="*.tsx" --include="*.ts"
grep -r '"use server"' frontend/src --include="*.tsx" --include="*.ts"
```

Any file with `"use client"` is a Next.js component that was copied without adaptation. These directives should simply be removed (they're no-ops in Vite, but they indicate the file was not actually ported).

---

## Backend Already Has These Covered

| Frontend file (delete) | Backend equivalent (keep) |
|---|---|
| `features/auth/services/firebase-middleware.ts` | `backend/src/middleware/protection.ts` |
| `shared/services/csrf/csrf-protection.ts` | `backend/src/services/csrf/csrf-protection.ts` |
| `shared/services/rate-limit/comprehensive-rate-limiter.ts` | `backend/src/services/rate-limit/` |
| `shared/services/request-identity/request-identity.ts` | `backend/src/` (inline in middleware) |
| `shared/utils/api/response-helpers.ts` | `backend/src/utils/api/` |
| `shared/utils/error-handling/api-error-wrapper.ts` | `backend/src/utils/error-handling/` |
