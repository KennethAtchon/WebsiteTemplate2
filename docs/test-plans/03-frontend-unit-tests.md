# Frontend Unit Tests Plan

Target directory: `frontend/__tests__/unit/`

## Already Migrated

| File | Status |
|---|---|
| `features/calculator/calculator-constants.test.ts` | Done ✅ |
| `features/calculator/calculator-service.test.ts` | Done ✅ |
| `features/calculator/calculator-validation.test.ts` | Done ✅ |
| `features/payments/payment-service.test.ts` | Done ✅ |
| `components/query-provider.test.tsx` | Done ✅ |
| `hooks/use-query-fetcher.test.tsx` | Done ✅ |

## To Migrate from Monolith

These live in `project/__tests__/unit/` and contain frontend-relevant logic.

### Config

| Monolith source | Target in `frontend/__tests__/unit/` | Notes |
|---|---|---|
| `config/envUtil.test.ts` | `config/envUtil.test.ts` | Check `frontend/src/shared/utils/config/envUtil.ts` exists |

### Constants

| Monolith source | Target in `frontend/__tests__/unit/` | Notes |
|---|---|---|
| `constants/subscription-constants.test.ts` | `constants/subscription-constants.test.ts` | From `frontend/src/shared/constants/subscription.constants.ts` |
| `constants/mock.test.ts` | `constants/mock.test.ts` | If mock constants are frontend-specific |

### Error Handling

| Monolith source | Target in `frontend/__tests__/unit/` | Notes |
|---|---|---|
| `error-handling/auth-error-handler.test.ts` | `error-handling/auth-error-handler.test.ts` | `frontend/src/shared/utils/error-handling/auth-error-handler.ts` |
| `error-handling/global-error-handler.test.ts` | `error-handling/global-error-handler.test.ts` | `frontend/src/shared/utils/error-handling/global-error-handler.ts` |

### Permissions

| Monolith source | Target in `frontend/__tests__/unit/` | Notes |
|---|---|---|
| `permissions/calculator-permissions.test.ts` | `permissions/calculator-permissions.test.ts` | `frontend/src/shared/utils/permissions/calculator-permissions.ts` |
| `permissions/core-feature-permissions.test.ts` | `permissions/core-feature-permissions.test.ts` | `frontend/src/shared/utils/permissions/core-feature-permissions.ts` |

### Lib

| Monolith source | Target in `frontend/__tests__/unit/` | Notes |
|---|---|---|
| `lib/query-client.test.ts` | `lib/query-client.test.ts` | `frontend/src/shared/lib/query-client.ts` |
| `lib/query-keys.test.ts` | `lib/query-keys.test.ts` | `frontend/src/shared/lib/query-keys.ts` |

### Utils

| Monolith source | Target in `frontend/__tests__/unit/` | Notes |
|---|---|---|
| `utils/cn.test.ts` | `utils/cn.test.ts` | `cn` classname utility |
| `utils/data-validation.test.ts` | `utils/data-validation.test.ts` | Data validation helpers |
| `utils/date.test.ts` | `utils/date.test.ts` | Date utilities (if used in frontend) |
| `utils/pagination.test.ts` | `utils/pagination.test.ts` | Pagination helpers |
| `utils/stripe-map-loader.test.ts` | `utils/stripe-map-loader.test.ts` | Stripe product map |
| `utils/subscription-type-guards.test.ts` | `utils/subscription-type-guards.test.ts` | Subscription type guards |
| `utils/security/` | `utils/security/` | Security utils (frontend-relevant only) |
| `utils/system/` | `utils/system/` | System utils |

### Validation

| Monolith source | Target in `frontend/__tests__/unit/` | Notes |
|---|---|---|
| `validation/auth-validation.test.ts` | `validation/auth-validation.test.ts` | `frontend/src/shared/utils/validation/auth-validation.ts` |
| `validation/checkout-validation.test.ts` | `validation/checkout-validation.test.ts` | `frontend/src/shared/utils/validation/checkout-validation.ts` |
| `validation/contact-validation.test.ts` | `validation/contact-validation.test.ts` | `frontend/src/shared/utils/validation/contact-validation.ts` |
| `validation/data-validation.test.ts` | `validation/data-validation.test.ts` | `frontend/src/shared/utils/validation/data-validation.ts` |
| `validation/file-validation.test.ts` | `validation/file-validation.test.ts` | `frontend/src/shared/utils/validation/file-validation.ts` |
| `validation/search-validation.test.ts` | `validation/search-validation.test.ts` | `frontend/src/shared/utils/validation/search-validation.ts` |

### SEO

| Monolith source | Target in `frontend/__tests__/unit/` | Notes |
|---|---|---|
| `services/seo/metadata.test.ts` | `services/seo/metadata.test.ts` | SEO metadata helpers |
| `services/seo/page-metadata.test.ts` | `services/seo/page-metadata.test.ts` | Page-level metadata |
| `services/seo/structured-data.test.ts` | `services/seo/structured-data.test.ts` | JSON-LD structured data |

## New Tests to Write (Frontend-Specific)

These cover frontend code that didn't exist in the monolith (Vite/React SPA).

### Hooks

| Test file | What to test |
|---|---|
| `hooks/use-mobile.test.ts` | `useMobile` — mocks `window.innerWidth`, tests breakpoint detection |
| `hooks/use-paginated-data.test.tsx` | Pagination state, page increment/decrement, reset |
| `hooks/use-portal-link.test.tsx` | Stripe portal link fetch, loading/error states |

### Features

| Test file | What to test |
|---|---|
| `features/auth/auth-service.test.ts` | Firebase sign-in, sign-out, token refresh logic |
| `features/auth/use-auth-context.test.tsx` | Auth context values, user state changes |
| `features/account/account-service.test.ts` | Account update API calls, response handling |
| `features/subscriptions/subscription-hooks.test.tsx` | useSubscription — correct tier returned, loading state |
| `features/calculator/use-calculator.test.tsx` | Calculator hook — input changes, calculation trigger, result handling |
| `features/orders/order-service.test.ts` | Order list fetching, pagination |
| `features/contact/contact-form.test.tsx` | Form validation, submission, error display |

### Shared Components

| Test file | What to test |
|---|---|
| `components/providers/auth-provider.test.tsx` | Auth provider wraps children, exposes context |
| `components/providers/query-provider.test.tsx` | Already done ✅ |
| `components/error-boundary.test.tsx` | Renders fallback on error |

### Router / Routes

| Test file | What to test |
|---|---|
| `routes/protected-route.test.tsx` | Unauthenticated user redirected to login |
| `routes/public-route.test.tsx` | Authenticated user redirected away from login |

## Import Path Migration Guide

```typescript
// Monolith (project/)
import { foo } from "@/shared/utils/validation/auth-validation";
import { bar } from "@/features/calculator/constants/calculator.constants";

// Frontend (frontend/)
import { foo } from "../../src/shared/utils/validation/auth-validation";
// or with alias:
import { foo } from "@/shared/utils/validation/auth-validation";
```

Check `frontend/tsconfig.json` for the `@` alias configuration.

## Setup / Test Environment

Frontend tests run in bun:test but may need jsdom for React component testing. Check `frontend/__tests__/setup/bun-preload.ts` and configure:

```typescript
// bun-preload.ts
import { GlobalRegistrator } from "@happy-dom/global-registrator";
GlobalRegistrator.register();
```

Or use `happy-dom` / `jsdom` depending on what's already configured. Look at `frontend/package.json` devDependencies for what's installed.

## Running Frontend Tests

```bash
cd frontend
bun test                          # all tests
bun run test:unit                 # unit only
bun run test:coverage             # with coverage
```
