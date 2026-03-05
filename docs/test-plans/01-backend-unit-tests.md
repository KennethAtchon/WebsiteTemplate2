# Backend Unit Tests Plan

Target directory: `backend/__tests__/unit/`

## Already Migrated

| File | Status |
|------|--------|
| `services/api/00-authenticated-fetch.test.ts` | Done ✅ |
| `services/api/safe-fetch.test.ts` | Done ✅ |

## To Migrate from Monolith

These files exist in `project/__tests__/unit/` and belong in the backend. Copy and update imports from `@/shared/...` to the new backend paths.

### Services

| Monolith source | Target in `backend/__tests__/unit/` | Notes |
|---|---|---|
| `services/csrf/csrf-protection.test.ts` | `services/csrf/csrf-protection.test.ts` | Imports from `backend/src/services/csrf` |
| `services/db/performance-monitor.test.ts` | `services/db/performance-monitor.test.ts` | Prisma performance monitoring |
| `services/db/prisma.test.ts` | `services/db/prisma.test.ts` | Prisma client singleton |
| `services/email/resend.test.ts` | `services/email/resend.test.ts` | Resend email service |
| `services/observability/metrics.test.ts` | `services/observability/metrics.test.ts` | Metrics service |
| `services/rate-limit/rate-limit-config.test.ts` | `services/rate-limit/rate-limit-config.test.ts` | Rate limit configuration |
| `services/request-identity/request-identity.test.ts` | `services/request-identity/request-identity.test.ts` | Request identity helpers |

### Constants & Config

| Monolith source | Target in `backend/__tests__/unit/` | Notes |
|---|---|---|
| `config/envUtil.test.ts` | `config/envUtil.test.ts` | Env var utility |
| `constants/subscription-constants.test.ts` | `constants/subscription-constants.test.ts` | Subscription tier constants |
| `constants/mock.test.ts` | `constants/mock.test.ts` | Test mock constants |

### Middleware

| Monolith source | Target in `backend/__tests__/unit/` | Notes |
|---|---|---|
| `middleware/helper.test.ts` | `middleware/helper.test.ts` | Middleware helpers |
| `middleware/api-route-protection.test.ts` | `middleware/api-route-protection.test.ts` | Route protection logic |

### Permissions

| Monolith source | Target in `backend/__tests__/unit/` | Notes |
|---|---|---|
| `permissions/calculator-permissions.test.ts` | `permissions/calculator-permissions.test.ts` | Calculator tier gating |
| `permissions/core-feature-permissions.test.ts` | `permissions/core-feature-permissions.test.ts` | Feature flag/tier logic |

### Error Handling

| Monolith source | Target in `backend/__tests__/unit/` | Notes |
|---|---|---|
| `error-handling/api-error-wrapper.test.ts` | `error-handling/api-error-wrapper.test.ts` | API error wrapping |
| `error-handling/auth-error-handler.test.ts` | `error-handling/auth-error-handler.test.ts` | Auth error handling |
| `error-handling/global-error-handler.test.ts` | `error-handling/global-error-handler.test.ts` | Global error handler |

### Utils

| Monolith source | Target in `backend/__tests__/unit/` | Notes |
|---|---|---|
| `utils/add-timezone-header.test.ts` | `utils/add-timezone-header.test.ts` | Timezone header middleware |
| `utils/date.test.ts` | `utils/date.test.ts` | Date utilities |
| `utils/encryption.test.ts` | `utils/encryption.test.ts` | Encryption utilities |
| `utils/encryption-key-length.test.ts` | `utils/encryption-key-length.test.ts` | Key length validation |
| `utils/encryption-key-validation.test.ts` | `utils/encryption-key-validation.test.ts` | Key validation |
| `utils/pagination.test.ts` | `utils/pagination.test.ts` | Pagination helpers |
| `utils/response-helpers.test.ts` | `utils/response-helpers.test.ts` | Response formatting |
| `utils/stripe-map-loader.test.ts` | `utils/stripe-map-loader.test.ts` | Stripe product map |
| `utils/subscription-type-guards.test.ts` | `utils/subscription-type-guards.test.ts` | Subscription type guards |
| `utils/security/` (folder) | `utils/security/` | Security utils |
| `utils/system/` (folder) | `utils/system/` | System utils |

### Validation

| Monolith source | Target in `backend/__tests__/unit/` | Notes |
|---|---|---|
| `validation/api-validation.test.ts` | `validation/api-validation.test.ts` | API input validation |
| `validation/auth-validation.test.ts` | `validation/auth-validation.test.ts` | Auth input validation |
| `validation/checkout-validation.test.ts` | `validation/checkout-validation.test.ts` | Checkout validation |
| `validation/contact-validation.test.ts` | `validation/contact-validation.test.ts` | Contact form validation |
| `validation/file-validation.test.ts` | `validation/file-validation.test.ts` | File upload validation |
| `validation/input-validation.test.ts` | `validation/input-validation.test.ts` | General input validation |
| `validation/search-validation.test.ts` | `validation/search-validation.test.ts` | Search query validation |

### Features (Backend)

| Monolith source | Target in `backend/__tests__/unit/` | Notes |
|---|---|---|
| `features/calculator/calculator-constants.test.ts` | `features/calculator/calculator-constants.test.ts` | Calculator config constants |
| `features/calculator/calculator-service.test.ts` | `features/calculator/calculator-service.test.ts` | Calculator business logic |
| `features/calculator/calculator-validation.test.ts` | `features/calculator/calculator-validation.test.ts` | Calculator input validation |
| `features/payments/payment-service.test.ts` | `features/payments/payment-service.test.ts` | Payment service logic |

## New Tests to Write (No Monolith Source)

These cover backend-only code that was new or not tested in the monolith.

### Backend Features

| Test file | What to test |
|---|---|
| `features/auth/firebase-middleware.test.ts` | `requireAuth` middleware — valid token, expired token, missing token |
| `features/auth/session-service.test.ts` | Session creation, verification, revocation |
| `features/subscriptions/subscription-service.test.ts` | Tier resolution, upgrade/downgrade logic |

### Backend Routes (Unit — mocked handlers)

| Test file | What to test |
|---|---|
| `routes/health.test.ts` | `/health`, `/live`, `/ready` responses |
| `routes/csrf.test.ts` | CSRF token generation endpoint |
| `routes/webhooks.test.ts` | Stripe webhook signature validation, event routing |

### Backend Services (New)

| Test file | What to test |
|---|---|
| `services/firebase/admin.test.ts` | Firebase admin initialization, token verification mock |
| `services/session/session-store.test.ts` | Session storage get/set/delete |
| `services/storage/s3-client.test.ts` | S3 upload, presigned URL generation |
| `services/timezone/timezone-service.test.ts` | Timezone parsing and validation |

## Import Path Migration Guide

When migrating from monolith (`project/`), update imports:

```typescript
// Monolith (project/)
import { foo } from "@/shared/services/csrf/csrf-protection";
import { bar } from "@/features/calculator/constants/calculator.constants";

// Backend (backend/)
import { foo } from "../../src/services/csrf/csrf-protection";
// or with path alias if configured in tsconfig:
import { foo } from "@/services/csrf/csrf-protection";
import { bar } from "@/features/calculator/constants/calculator.constants";
```

Check `backend/tsconfig.json` for configured path aliases before migrating.

## Setup File

The backend unit tests need a preload/setup file. Check `project/__tests__/setup/bun-preload.ts` for the pattern and create `backend/__tests__/setup/bun-preload.ts` if it doesn't exist.

Verify `backend/package.json` has:
```json
"preload": ["__tests__/setup/bun-preload.ts"]
```
or the equivalent in `bunfig.toml`.
