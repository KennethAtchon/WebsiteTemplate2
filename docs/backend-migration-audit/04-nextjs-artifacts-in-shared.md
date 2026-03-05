# Issue 4: Next.js Artifacts in `shared/`

**Severity:** Medium
**Action:** Delete or rewrite without Next.js dependencies

## Problem

Several files in `backend/src/shared/` still import from `next/server` and use
Next.js-specific APIs. These were copied from the monolith but never adapted for Hono.

---

## `backend/src/middleware.ts` (root-level)

This is the Next.js `middleware.ts` that ran on the Edge runtime. It imports:
```ts
import { NextRequest, NextResponse } from "next/server";
```

The Hono server has its own middleware in `backend/src/middleware/protection.ts` and
`backend/src/middleware/security-headers.ts`. This file is dead code.

**Action:** Delete `backend/src/middleware.ts`.

---

## `backend/src/shared/middleware/api-route-protection.ts`

Imports:
```ts
import { NextRequest, NextResponse } from "next/server";
```

This was the monolith's route protection HOF (`withAdminProtection`, `withUserProtection`).
The Hono backend already uses `authMiddleware()` from `backend/src/middleware/protection.ts`.

**Action:** Delete `backend/src/shared/middleware/api-route-protection.ts`.

---

## `backend/src/shared/middleware/helper.ts`

Also imports Next.js types. It provided helpers like `validateAuthentication`,
`applyRateLimiting` for the Next.js middleware chain.

**Action:** Delete `backend/src/shared/middleware/helper.ts`.

Delete the entire `backend/src/shared/middleware/` directory.

---

## `backend/src/shared/utils/api/response-helpers.ts`

Imports:
```ts
import { NextResponse } from "hono";  // WRONG: should be "next/server"
```
(Note: this file has a typo — it imports `NextResponse` from `"hono"` instead of
`"next/server"`, which doesn't exist in Hono.)

The root-level `backend/src/utils/api/response-helpers.ts` is the correct version.

**Action:** Delete `backend/src/shared/utils/api/response-helpers.ts` (use the root version).

---

## `backend/src/features/auth/services/firebase-middleware.ts`

Imports:
```ts
import { NextRequest, NextResponse } from "next/server";
```

This was the auth middleware for Next.js API routes. The Hono backend uses
`authMiddleware()` from `backend/src/middleware/protection.ts` instead.

**Action:** Delete `backend/src/features/auth/services/firebase-middleware.ts`.
(The auth type definitions in `features/auth/types/auth.types.ts` may still be useful —
verify if referenced by Hono routes before deleting.)

---

## `backend/src/shared/services/csrf/csrf-protection.ts`

Likely uses Next.js cookie/header APIs. The Hono backend has CSRF in
`backend/src/services/csrf/csrf-protection.ts`.

**Action:** Verify imports, then delete if it contains Next.js dependencies.

---

## Summary

| File | Action |
|---|---|
| `backend/src/middleware.ts` | DELETE |
| `backend/src/shared/middleware/api-route-protection.ts` | DELETE |
| `backend/src/shared/middleware/helper.ts` | DELETE |
| `backend/src/shared/utils/api/response-helpers.ts` | DELETE (use root version) |
| `backend/src/features/auth/services/firebase-middleware.ts` | DELETE |
| `backend/src/shared/services/csrf/csrf-protection.ts` | VERIFY, likely delete |
