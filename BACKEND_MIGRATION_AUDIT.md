# Backend Migration Audit Report

Audit of the backend migration from the legacy Next.js monolith (`/project`) to the standalone Hono backend (`/backend`).

> **Session log:** Items marked ✅ Fixed were resolved in the audit session on 2026-03-05.

---

## Summary Table

| Group | Status | Coverage |
|---|---|---|
| Core Infrastructure | ✅ Fixed | `request-identity/` created; `protection.ts` rewritten with static imports + `HonoEnv` |
| API Routes | ✅ Fixed | All route files rewritten — static imports, `HonoEnv`, bug fixes; `/api/metrics` still unmounted |
| Business Logic Services | Partial | Missing payments feature, firebase config/stripe-payments, authenticated-fetch |
| Shared Utilities | Complete | All present |
| Type Definitions | Partial | Missing customers, orders, payments types + index |
| Constants | ✅ Fixed | `subscription.constants.ts` arg count bug fixed; `subscription-type-guards.ts` return type fixed |
| Scripts & Tools | Not done | All 3 scripts missing |
| Configuration Files | Mostly done | Dockerfile HEALTHCHECK bug, missing docker-compose, .env.example gaps |
| Testing Infrastructure | Complete | Full unit + integration coverage |

---

## Priority Fixes

| Priority | Issue | Resolution |
|---|---|---|
| ~~CRITICAL~~ | ~~`routes/csrf.ts` import path bug — causes runtime error at `GET /api/csrf`~~ | ✅ Fixed — rewritten with static import |
| ~~CRITICAL~~ | ~~`services/request-identity/` missing — `comprehensive-rate-limiter.ts` broken~~ | ✅ Fixed — module created |
| ~~CRITICAL~~ | ~~`comprehensive-rate-limiter.ts` uses `NextRequest`/`NextResponse`~~ | ✅ Fixed — rewritten with standard `Request`/`Response` |
| ~~CRITICAL~~ | ~~`protection.ts` CSRF middleware calls `requireCSRFToken(string)` instead of `validateCSRFToken`~~ | ✅ Fixed |
| ~~HIGH~~ | ~~All route files use `new Hono()` — `c.get("auth")` returns `unknown`~~ | ✅ Fixed — all routes now use `new Hono<HonoEnv>()` |
| ~~HIGH~~ | ~~All route files use `await import()` inside handlers~~ | ✅ Fixed — all imports moved to top-level |
| ~~HIGH~~ | ~~`admin/index.ts` MRR uses `config.prices?.monthly` (field doesn't exist)~~ | ✅ Fixed — changed to `config.price` |
| ~~HIGH~~ | ~~`customer/index.ts` `_sum: { amount }` — field is `totalAmount` in schema~~ | ✅ Fixed |
| ~~HIGH~~ | ~~`customer/index.ts` `stripeCustomerId` update — field not in Prisma schema~~ | ✅ Fixed — endpoint made a no-op |
| ~~HIGH~~ | ~~`public/index.ts` calls `storage.upload()` — method is `uploadFile()`~~ | ✅ Fixed |
| ~~HIGH~~ | ~~`subscriptions/index.ts` Stripe API version `2024-12-18.acacia` (outdated)~~ | ✅ Fixed — updated to `2025-02-24.acacia` |
| ~~HIGH~~ | ~~`subscription.constants.ts` passes 2 args to 1-arg functions~~ | ✅ Fixed |
| ~~HIGH~~ | ~~`subscription-type-guards.ts` `toSubscriptionTier` returns `string` instead of `SubscriptionTier`~~ | ✅ Fixed |
| ~~MEDIUM~~ | ~~`metrics.ts` missing `getErrorMetrics()` export~~ | ✅ Fixed — export added |
| HIGH | `/api/metrics` route not mounted — Prometheus scraping is broken | Open |
| HIGH | `Dockerfile` HEALTHCHECK uses `/health` instead of `/api/health` | Open |
| MEDIUM | `scripts/gdpr-data-purge.ts` missing — compliance-critical | Open |
| MEDIUM | `.env.example` missing several required vars — could cause silent failures | Open |

---

## Group 1: Core Infrastructure

### Database & ORM — Complete

| Item | Status | Path |
|---|---|---|
| Prisma Schema | Done | `src/infrastructure/database/prisma/schema.prisma` |
| Prisma Migrations | Done | `src/infrastructure/database/prisma/migrations/` |
| Prisma Client Service | Done | `src/services/db/prisma.ts` (encryption, monitoring, connection pooling) |
| Redis Client | Done | `src/services/db/redis.ts` |
| Database Performance Monitor | Done | `src/services/db/performance-monitor.ts` |

### Authentication & Authorization — Complete

| Item | Status | Path |
|---|---|---|
| Firebase Admin SDK | Done | `src/services/firebase/admin.ts` |
| Firebase Middleware | ✅ Fixed | `src/middleware/protection.ts` — rewritten with static imports, `HonoEnv`/`Variables` exports, fixed CSRF validation |
| Auth Types | Done | `src/features/auth/types/auth.types.ts` |

### Security Services — Complete

| Item | Status | Path |
|---|---|---|
| CSRF Protection | Done | `src/services/csrf/csrf-protection.ts` |
| Rate Limiting | ✅ Fixed | `src/services/rate-limit/comprehensive-rate-limiter.ts` — rewritten (removed Next.js deps) |
| Rate Limit Redis | Done | `src/services/rate-limit/rate-limit-redis.ts` |
| Request Identity | ✅ Fixed | `src/services/request-identity/index.ts` — created from scratch |
| Encryption Utils | Done | `src/utils/security/encryption.ts` |
| PII Sanitization | Done | `src/utils/security/pii-sanitization.ts` |

### Middleware & Route Protection — Complete

| Item | Status | Path |
|---|---|---|
| API Route Protection | ✅ Fixed | `src/middleware/protection.ts` — exports `HonoEnv`, `Variables`; all dynamic imports made static |
| Security Headers | Done | `src/middleware/security-headers.ts` |
| Root Middleware (CORS, security) | Done | `src/index.ts` (Hono CORS + secureHeaders middleware) |

---

## Group 2: API Routes

> All route files were rewritten on 2026-03-05: `new Hono<HonoEnv>()`, static top-level imports, and file-specific bug fixes.

### Admin Routes (`/api/admin/*`) — ✅ Fixed

| Endpoint | Status | Notes |
|---|---|---|
| `GET /api/admin/analytics` | ✅ Fixed | Static imports |
| `GET /api/admin/customers` | ✅ Fixed | Static imports |
| `GET /api/admin/database/health` | ✅ Fixed | Static imports |
| `GET /api/admin/orders` | ✅ Fixed | Static imports |
| `POST /api/admin/orders` | ✅ Fixed | Static imports |
| `PUT /api/admin/orders` | ✅ Fixed | Static imports |
| `DELETE /api/admin/orders` | ✅ Fixed | Static imports |
| `GET /api/admin/orders/:id` | ✅ Fixed | Static imports |
| `GET /api/admin/schema` | ✅ Fixed | Static imports |
| `GET /api/admin/subscriptions` | ✅ Fixed | Static imports |
| `GET /api/admin/subscriptions/analytics` | ✅ Fixed | `config.prices?.monthly` → `config.price` |
| `GET /api/admin/subscriptions/:id` | ✅ Fixed | Static imports |
| `POST /api/admin/sync-firebase` | ✅ Fixed | Static imports |
| `GET /api/admin/verify` | ✅ Fixed | `c.get("auth")` now typed via `HonoEnv` |
| `POST /api/admin/verify` | ✅ Fixed | Static imports |

### Analytics Routes (`/api/analytics/*`) — Complete (not touched)

All 4 endpoints implemented in `src/routes/analytics/index.ts`.

### Calculator Routes (`/api/calculator/*`) — ✅ Fixed

| Endpoint | Status | Notes |
|---|---|---|
| `POST /api/calculator/calculate` | ✅ Fixed | Removed `type: CalculationType` runtime destructure; cast `type` to `FeatureType` |
| `GET /api/calculator/export` | ✅ Fixed | Static imports |
| `GET /api/calculator/history` | ✅ Fixed | Static imports |
| `GET /api/calculator/types` | ✅ Fixed | Static imports; `FeatureType` cast |
| `GET /api/calculator/usage` | ✅ Fixed | Static imports |

### Customer Routes (`/api/customer/*`) — ✅ Fixed

| Endpoint | Status | Notes |
|---|---|---|
| `GET /api/customer/orders` | ✅ Fixed | Static imports |
| `POST /api/customer/orders` | ✅ Fixed | Static imports |
| `GET /api/customer/orders/:orderId` | ✅ Fixed | Static imports |
| `GET /api/customer/orders/by-session` | ✅ Fixed | Static imports |
| `GET /api/customer/orders/total-revenue` | ✅ Fixed | `_sum: { amount }` → `_sum: { totalAmount }` |
| `GET /api/customer/profile` | ✅ Fixed | Static imports |
| `PUT /api/customer/profile` | ✅ Fixed | Static imports |
| `POST /api/customer/fix-stripe-customer` | ✅ Fixed | Removed invalid `stripeCustomerId` Prisma update (field not in schema); now a no-op |

### Subscription Routes (`/api/subscriptions/*`) — ✅ Fixed

| Endpoint | Status | Notes |
|---|---|---|
| `GET /api/subscriptions/current` | ✅ Fixed | Static imports |
| `POST /api/subscriptions/portal-link` | ✅ Fixed | Static imports |
| `GET /api/subscriptions/trial-eligibility` | ✅ Fixed | Static imports |
| `POST /api/subscriptions/checkout` | ✅ Fixed | Static Stripe import; API version `2025-02-24.acacia` |

### User Routes (`/api/users/*`) — ✅ Fixed

| Endpoint | Status | Notes |
|---|---|---|
| `GET /api/users` | ✅ Fixed | Static imports |
| `POST /api/users` | ✅ Fixed | Static imports |
| `PATCH /api/users` | ✅ Fixed | Static imports |
| `DELETE /api/users` | ✅ Fixed | Static imports |
| `GET /api/users/customers-count` | ✅ Fixed | Static imports |
| `DELETE /api/users/delete-account` | ✅ Fixed | Static imports |
| `GET /api/users/export-data` | ✅ Fixed | Static imports |
| `POST /api/users/object-to-processing` | ✅ Fixed | Static imports |

### Shared/Public Routes — ✅ Fixed

| Endpoint | Status | Notes |
|---|---|---|
| `GET /api/shared/contact-messages` | ✅ Fixed | Static imports |
| `POST /api/shared/contact-messages` | ✅ Fixed | Static imports |
| `POST /api/shared/emails` | ✅ Fixed | Static imports |
| `POST /api/shared/upload` | ✅ Fixed | `storage.upload()` → `storage.uploadFile()` |
| `GET /api/csrf` | ✅ Fixed | Static import; correct path `../services/csrf/csrf-protection` |

### Health & Monitoring Routes — ✅ Fixed (partial)

| Endpoint | Status | Notes |
|---|---|---|
| `GET /api/health` | ✅ Fixed | Static imports |
| `GET /api/health/error-monitoring` | ✅ Fixed | Static `getErrorMetrics` import (export was also added to `metrics.ts`) |
| `GET /api/live` | Done | `src/index.ts` |
| `GET /api/ready` | Done | `src/index.ts` |
| `GET /api/metrics` | Open | `metrics.ts` exists but endpoint not mounted |

---

## Group 3: Business Logic Services

### Email Service — Complete

| Item | Status | Path |
|---|---|---|
| Resend Email Service | Done | `src/services/email/resend.ts` |

### Storage Service — Complete

| Item | Status | Path |
|---|---|---|
| Cloudflare R2 Storage | Done | `src/services/storage/r2.ts` |
| Storage Index | Done | `src/services/storage/index.ts` |

### Firebase Services — Partial

| Item | Status | Path |
|---|---|---|
| Subscription Helpers | Done | `src/services/firebase/subscription-helpers.ts` |
| Firebase Sync | Done | `src/services/firebase/sync.ts` |
| Stripe Payments | MISSING | `src/services/firebase/stripe-payments.ts` — not migrated |
| Firebase Config | MISSING | `src/services/firebase/config.ts` — not migrated |

### Observability — ✅ Fixed

| Item | Status | Path |
|---|---|---|
| Metrics Service | ✅ Fixed | `src/services/observability/metrics.ts` — added `getErrorMetrics()` export |
| Firebase Logging | Done | `src/services/observability/firebase-logging.ts` |

Note: `metrics.ts` exists and is used internally, but the `/api/metrics` Prometheus endpoint is not mounted.

### Feature Services — Partial

| Item | Status | Path |
|---|---|---|
| Calculator Service | Done | `src/features/calculator/services/calculator-service.ts` |
| Usage Service | Done | `src/features/calculator/services/usage-service.ts` |
| Payment Service | MISSING | `src/features/payments/services/payment-service.ts` — entire `features/payments/` directory absent |
| Stripe Checkout | MISSING | `src/features/payments/services/stripe-checkout.ts` — logic is inlined in `routes/subscriptions/index.ts` (functional but not modularized) |

### API Utilities — Partial

| Item | Status | Path |
|---|---|---|
| Safe Fetch | Done | `src/services/api/safe-fetch.ts` |
| Authenticated Fetch | MISSING | `src/services/api/authenticated-fetch.ts` — not migrated |
| Timezone Service | Done | `src/services/timezone/TimeService.ts` |

---

## Group 4: Shared Utilities — Complete

All utilities are present.

### Configuration

| Item | Status | Path |
|---|---|---|
| Environment Utils | Done | `src/utils/config/envUtil.ts` |
| CORS Constants | Done | `src/utils/config/cors-constants.ts` |
| Config Index | Done | `src/utils/config/index.ts` |
| Mock Config | Done | `src/utils/config/mock.ts` |

### Validation

| Item | Status | Path |
|---|---|---|
| API Validation | Done | `src/utils/validation/api-validation.ts` |
| Auth Validation | Done | `src/utils/validation/auth-validation.ts` |
| Checkout Validation | Done | `src/utils/validation/checkout-validation.ts` |
| Contact Validation | Done | `src/utils/validation/contact-validation.ts` |
| Data Validation | Done | `src/utils/validation/data-validation.ts` |
| File Validation | Done | `src/utils/validation/file-validation.ts` |
| Search Validation | Done | `src/utils/validation/search-validation.ts` |
| Calculator Validation | Done | `src/features/calculator/types/calculator-validation.ts` |

### Error Handling

| Item | Status | Path |
|---|---|---|
| API Error Wrapper | Done | `src/utils/error-handling/api-error-wrapper.ts` |
| Auth Error Handler | Done | `src/utils/error-handling/auth-error-handler.ts` |
| Global Error Handler | Done | `src/utils/error-handling/global-error-handler.ts` |

### Helpers

| Item | Status | Path |
|---|---|---|
| Date Helpers | Done | `src/utils/helpers/date.ts` |
| Order Helpers | Done | `src/utils/helpers/order-helpers.ts` |
| Pagination | Done | `src/utils/helpers/pagination.ts` |
| Utils | Done | `src/utils/helpers/utils.ts` |

### Permissions

| Item | Status | Path |
|---|---|---|
| Calculator Permissions | Done | `src/utils/permissions/calculator-permissions.ts` |
| Core Feature Permissions | Done | `src/utils/permissions/core-feature-permissions.ts` |

### System Utilities

| Item | Status | Path |
|---|---|---|
| System Logger | Done | `src/utils/system/system-logger.ts` |
| Prisma Introspection | Done | `src/utils/system/prisma-introspection.ts` |
| App Initialization | Done | `src/utils/system/app-initialization.ts` |
| Debug Utils | Done | `src/utils/debug/debug.ts` |
| Debug Index | Done | `src/utils/debug/index.ts` |

### API Utilities

| Item | Status | Path |
|---|---|---|
| Response Helpers | Done | `src/utils/api/response-helpers.ts` |
| Add Timezone Header | Done | `src/utils/api/add-timezone-header.ts` |
| Stripe Map Loader | Done | `src/utils/stripe-map-loader.ts` |

### Type Guards

| Item | Status | Path |
|---|---|---|
| Subscription Type Guards | ✅ Fixed | `src/utils/type-guards/subscription-type-guards.ts` — `toSubscriptionTier` return type narrowed to `SubscriptionTier \| null` |

---

## Group 5: Type Definitions — Partial

### Shared Types

| Item | Status | Path |
|---|---|---|
| API Types | Done | `src/types/api.types.ts` |
| Type Index | MISSING | `src/types/index.ts` — barrel export file not created |

### Feature Types

| Item | Status | Path |
|---|---|---|
| Auth Types | Done | `src/features/auth/types/auth.types.ts` |
| Calculator Types | Done | `src/features/calculator/types/calculator.types.ts` |
| Subscription Types | Done | `src/features/subscriptions/types/subscription.types.ts` |
| Customer Types | MISSING | `src/features/customers/types/customer.types.ts` — `features/customers/` directory absent |
| Order Types | MISSING | `src/features/orders/types/order.types.ts` — `features/orders/` directory absent |
| Payment Types | MISSING | `src/features/payments/types/payment.types.ts` — `features/payments/` directory absent |

---

## Group 6: Constants — ✅ Fixed

| Item | Status | Path |
|---|---|---|
| App Constants | Done | `src/constants/app.constants.ts` |
| Rate Limit Config | Done | `src/constants/rate-limit.config.ts` |
| Calculator Constants | Done | `src/features/calculator/constants/calculator.constants.ts` |
| Stripe Constants | Done | `src/constants/stripe.constants.ts` |
| Order Constants | Done | `src/constants/order.constants.ts` |
| Subscription Constants | ✅ Fixed | `src/constants/subscription.constants.ts` — removed extra `billingCycle` arg from `getStripePriceId`/`getStripePriceAmount` |

---

## Group 7: Scripts & Tools — Not Migrated

The `backend/scripts/` directory does not exist. All three scripts are missing.

| Item | Status | Notes |
|---|---|---|
| `scripts/db-reset-and-migrate.sh` | MISSING | Database reset utility |
| `scripts/gdpr-data-purge.ts` | MISSING | Compliance-critical — required for GDPR right-to-erasure |
| `scripts/load-test.js` | MISSING | Performance testing tool |

---

## Group 8: Configuration Files — Mostly Complete

### Present Files

| Item | Status | Path |
|---|---|---|
| TypeScript Config | Done | `backend/tsconfig.json` |
| Package Dependencies | Done | `backend/package.json` |
| Dockerfile | Done (with bug) | `backend/Dockerfile` — see bug below |
| `.env.example` | Done (with gaps) | `backend/.env.example` — see gaps below |

### Docker Compose — Missing

`backend/docker-compose.yml` does not exist. A `docker-compose.yml` exists at the repo root but is not backend-specific.

### Dockerfile Bug

The `HEALTHCHECK` directive uses the wrong path:

```dockerfile
# Current (WRONG)
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/health || exit 1

# Should be
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/api/health || exit 1
```

### `.env.example` Missing Variables

The following variables are used in the backend code but are not documented in `.env.example`:

| Variable | Used In |
|---|---|
| `RESEND_FROM_EMAIL` | `src/services/email/resend.ts` |
| `RESEND_REPLY_TO_EMAIL` | `src/services/email/resend.ts` |
| `FIREBASE_PROJECT_ID_SERVER` | `src/routes/subscriptions/index.ts` |
| `METRICS_ENABLED` | `src/services/observability/metrics.ts` |
| `CORS_ALLOWED_ORIGINS` | `src/utils/config/envUtil.ts` |
| `BASE_URL` | `src/routes/subscriptions/index.ts` |
| `APP_ENV` | `src/services/db/prisma.ts`, `src/utils/config/envUtil.ts` |
| `ENABLE_DB_HEALTH_CHECKS` | `src/services/db/prisma.ts` |

---

## Group 9: Testing Infrastructure — Complete

Comprehensive test coverage exists across unit and integration tests.

| Item | Status | Path |
|---|---|---|
| Test Helpers | Done | `__tests__/helpers/create-test-app.ts` |
| Test Setup | Done | `__tests__/setup/bun-preload.ts` |
| Integration Tests | Done | `__tests__/integration/` (12 test files covering all route groups) |
| Unit Tests | Done | `__tests__/unit/` (30+ test files covering services, utils, features, validation) |

### Integration Test Coverage

- `api-admin.test.ts`
- `api-analytics.test.ts`
- `api-calculator.test.ts`
- `api-csrf.test.ts`
- `api-customer-orders.test.ts`
- `api-health-and-calculator.test.ts`
- `api-health-ready.test.ts`
- `api-security.test.ts`
- `api-shared.test.ts`
- `api-subscriptions.test.ts`
- `api-users.test.ts`
- `middleware.test.ts`
- `00-middleware-production.test.ts`
