# Issue 3: Duplicate Utility and Service Directories

**Severity:** Medium
**Action:** Consolidate into one canonical location

## Problem

The backend has two parallel sets of utilities and services:

| Root-level | Shared |
|---|---|
| `backend/src/utils/` | `backend/src/shared/utils/` |
| `backend/src/services/` | `backend/src/shared/services/` |
| `backend/src/constants/subscription.constants.ts` | `backend/src/shared/constants/` |

The Hono routes in `backend/src/routes/*.ts` use **relative imports** to the root-level
directories (e.g., `import x from "../utils/config/envUtil"`).

The files in `backend/src/shared/` use `@/shared/...` path aliases — which points to
`backend/src/shared/...` given the tsconfig `"@/*": ["./src/*"]` alias.

---

## Root-level directories (used by Hono routes)

These are the **active** files — the Hono routes import them:

```
backend/src/utils/
  api/response-helpers.ts
  config/cors-constants.ts
  config/envUtil.ts                     <- slightly different from shared version
  debug/debug.ts
  debug/index.ts
  error-handling/error-handling/api-error-wrapper.ts
  error-handling/error-handling/auth-error-handler.ts
  error-handling/error-handling/global-error-handler.ts
  helpers/helpers/date.ts
  helpers/helpers/order-helpers.ts
  helpers/helpers/pagination.ts
  helpers/helpers/utils.ts
  permissions/core-feature-permissions.ts
  security/encryption.ts
  security/pii-sanitization.ts
  stripe-map-loader.ts
  system/system/app-initialization.ts
  system/system-logger.ts
  system/system/prisma-introspection.ts
  system/system/system-logger.ts
  system/system/web-vitals.ts           <- frontend only, delete
  type-guards/subscription-type-guards.ts
  validation/api-validation.ts

backend/src/services/
  csrf/csrf-protection.ts
  db/prisma.ts
  db/redis.ts
  email/email/resend.ts
  firebase/admin.ts
  observability/metrics.ts
  observability/observability/firebase-logging.ts
  observability/observability/metrics.ts
  rate-limit/rate-limit/comprehensive-rate-limiter.ts
  rate-limit/rate-limit/rate-limit-redis.ts
  session/                              <- check if used
  storage/storage/index.ts
  storage/storage/r2.ts

backend/src/constants/
  subscription.constants.ts             <- used by admin.ts Hono route
```

---

## `shared/` directory (mixed — some active, some Next.js artifacts)

The `backend/src/shared/` files that are backend-relevant (not frontend, see issue 02):

```
backend/src/shared/
  constants/
    app.constants.ts
    order.constants.ts
    rate-limit.config.ts
    stripe.constants.ts
    subscription.constants.ts           <- duplicate of constants/subscription.constants.ts
  services/
    db/performance-monitor.ts
    db/prisma.ts                        <- duplicate of services/db/prisma.ts
    db/redis.ts                         <- duplicate
    email/resend.ts                     <- duplicate
    firebase/admin.ts                   <- duplicate
    firebase/subscription-helpers.ts
    firebase/sync.ts
    observability/firebase-logging.ts   <- duplicate
    observability/metrics.ts            <- duplicate
    rate-limit/comprehensive-rate-limiter.ts  <- duplicate
    rate-limit/rate-limit-redis.ts      <- duplicate
    request-identity/index.ts
    request-identity/request-identity.ts
    storage/index.ts                    <- duplicate
    storage/r2.ts                       <- duplicate
    timezone/TimeService.ts
  utils/
    api/add-timezone-header.ts
    api/response-helpers.ts             <- duplicate
    config/cors-constants.ts            <- duplicate
    config/envUtil.ts                   <- slightly different (missing STRIPE_SECRET_KEY export)
    config/index.ts
    config/mock.ts
    debug/debug.ts                      <- duplicate
    debug/index.ts
    error-handling/api-error-wrapper.ts <- duplicate
    error-handling/auth-error-handler.ts
    error-handling/global-error-handler.ts  <- duplicate
    helpers/date.ts                     <- duplicate
    helpers/order-helpers.ts            <- duplicate
    helpers/pagination.ts               <- duplicate
    helpers/utils.ts                    <- duplicate
    permissions/calculator-permissions.ts
    permissions/core-feature-permissions.ts  <- duplicate
    security/encryption.ts              <- duplicate
    security/pii-sanitization.ts        <- duplicate
    stripe-map-loader.ts                <- duplicate
    system/app-initialization.ts        <- duplicate
    system/prisma-introspection.ts      <- duplicate
    system/system-logger.ts             <- duplicate
    system/web-vitals.ts                <- frontend only, delete
    type-guards/subscription-type-guards.ts  <- duplicate
    validation/api-validation.ts        <- duplicate
    validation/auth-validation.ts
    validation/checkout-validation.ts
    validation/contact-validation.ts
    validation/data-validation.ts
    validation/file-validation.ts
    validation/search-validation.ts
  middleware/
    api-route-protection.ts             <- Next.js middleware (see issue 04)
    helper.ts                           <- Next.js middleware helper (see issue 04)
  types/
    api.types.ts
    index.ts
```

---

## Notable Difference: `envUtil.ts`

Root version (`src/utils/config/envUtil.ts`) exports `STRIPE_SECRET_KEY`.
Shared version (`src/shared/utils/config/envUtil.ts`) does NOT.

The `backend/src/routes/webhooks.ts` imports `STRIPE_SECRET_KEY` from:
`../utils/config/envUtil` (root version).

This must not be lost during consolidation.

---

## Recommended Resolution

**Option A (simpler):** Keep root-level `src/utils/` and `src/services/` as canonical.
Delete the duplicates from `src/shared/`. Move any unique files from `src/shared/`
(e.g., `subscription-helpers.ts`, `sync.ts`, `TimeService.ts`, validation files) to
the root-level directories.

**Option B:** Keep `src/shared/` as canonical, update all imports in `src/routes/*.ts`
to use `@/shared/...` instead of relative paths.

Either way, the path alias `@/shared/...` in `src/shared/` files is a circular reference
(they're inside shared, referring to themselves). These should use relative imports.

---

## Double-nested directories (structural oddity)

Several root-level directories have an extra nesting level that mirrors the directory name:
- `src/utils/error-handling/error-handling/` (should be `src/utils/error-handling/`)
- `src/utils/helpers/helpers/` (should be `src/utils/helpers/`)
- `src/utils/system/system/` (should be `src/utils/system/`)
- `src/services/email/email/` (should be `src/services/email/`)
- `src/services/observability/observability/` (should be `src/services/observability/`)
- etc.

This double-nesting was likely caused by the migration script. These should be flattened.
