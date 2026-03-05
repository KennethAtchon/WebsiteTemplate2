# Test Migration Execution Order

Work through this in order. Each batch should pass `bun test` before starting the next.

## Phase 1 — Backend Unit Tests (Low Risk, High Value)

Start here: these are pure unit tests with no external dependencies.

### Batch 1A: Migrate service/util/validation tests (1:1 from monolith)

Copy files, update import paths, run tests. These should pass with minimal changes.

1. `backend/__tests__/unit/services/csrf/csrf-protection.test.ts`
2. `backend/__tests__/unit/services/db/prisma.test.ts`
3. `backend/__tests__/unit/services/db/performance-monitor.test.ts`
4. `backend/__tests__/unit/services/email/resend.test.ts`
5. `backend/__tests__/unit/services/observability/metrics.test.ts`
6. `backend/__tests__/unit/services/rate-limit/rate-limit-config.test.ts`
7. `backend/__tests__/unit/services/request-identity/request-identity.test.ts`

Verify: `cd backend && bun run test:unit`

### Batch 1B: Config, constants, middleware, permissions

8. `backend/__tests__/unit/config/envUtil.test.ts`
9. `backend/__tests__/unit/constants/subscription-constants.test.ts`
10. `backend/__tests__/unit/middleware/helper.test.ts`
11. `backend/__tests__/unit/middleware/api-route-protection.test.ts`
12. `backend/__tests__/unit/permissions/calculator-permissions.test.ts`
13. `backend/__tests__/unit/permissions/core-feature-permissions.test.ts`

### Batch 1C: Error handling and utils

14. `backend/__tests__/unit/error-handling/api-error-wrapper.test.ts`
15. `backend/__tests__/unit/error-handling/auth-error-handler.test.ts`
16. `backend/__tests__/unit/error-handling/global-error-handler.test.ts`
17. `backend/__tests__/unit/utils/*.test.ts` (bulk migrate all util tests)

### Batch 1D: Validation and features

18. `backend/__tests__/unit/validation/*.test.ts` (bulk migrate all 7 validation tests)
19. `backend/__tests__/unit/features/calculator/*.test.ts`
20. `backend/__tests__/unit/features/payments/payment-service.test.ts`

---

## Phase 2 — Frontend Unit Tests (Medium Effort)

### Batch 2A: Migrate shared utils (1:1 from monolith)

1. `frontend/__tests__/unit/config/envUtil.test.ts`
2. `frontend/__tests__/unit/constants/subscription-constants.test.ts`
3. `frontend/__tests__/unit/error-handling/auth-error-handler.test.ts`
4. `frontend/__tests__/unit/error-handling/global-error-handler.test.ts`
5. `frontend/__tests__/unit/permissions/calculator-permissions.test.ts`
6. `frontend/__tests__/unit/permissions/core-feature-permissions.test.ts`
7. `frontend/__tests__/unit/lib/query-client.test.ts`
8. `frontend/__tests__/unit/lib/query-keys.test.ts`

Verify: `cd frontend && bun run test:unit`

### Batch 2B: Utils and validation

9. `frontend/__tests__/unit/utils/cn.test.ts`
10. `frontend/__tests__/unit/utils/data-validation.test.ts`
11. `frontend/__tests__/unit/utils/pagination.test.ts`
12. `frontend/__tests__/unit/utils/stripe-map-loader.test.ts`
13. `frontend/__tests__/unit/utils/subscription-type-guards.test.ts`
14. `frontend/__tests__/unit/validation/*.test.ts` (bulk migrate)
15. `frontend/__tests__/unit/services/seo/*.test.ts`

### Batch 2C: New frontend-specific tests (hooks and features)

16. `frontend/__tests__/unit/hooks/use-mobile.test.ts`
17. `frontend/__tests__/unit/hooks/use-paginated-data.test.tsx`
18. `frontend/__tests__/unit/features/auth/auth-service.test.ts`
19. `frontend/__tests__/unit/features/subscriptions/subscription-hooks.test.tsx`
20. `frontend/__tests__/unit/features/calculator/use-calculator.test.tsx`

---

## Phase 3 — Backend Integration Tests (Needs Hono Adaptation)

This phase requires understanding the Hono route structure. Do after all unit tests pass.

### Batch 3A: Health and simple routes

1. Adapt `api-health-ready.test.ts` for Hono `app.request()`
2. Adapt `api-health-and-calculator.test.ts`
3. Write `api-webhooks.test.ts` (new)

### Batch 3B: Auth-protected routes

4. Adapt `api-calculator.test.ts`
5. Adapt `api-subscriptions.test.ts`
6. Adapt `api-users.test.ts`
7. Adapt `api-customer-orders.test.ts`

### Batch 3C: Admin and security

8. Adapt `api-admin.test.ts`
9. Adapt `api-analytics.test.ts`
10. Adapt `api-security.test.ts`
11. Adapt `api-csrf.test.ts`

### Batch 3D: Middleware tests

12. Adapt `middleware.test.ts` for Hono protection middleware
13. Adapt `00-middleware-production.test.ts`

Verify: `cd backend && bun test __tests__/integration`

---

## Phase 4 — E2E Tests (Highest Effort, Requires Both Servers Running)

Do last — depends on phases 1-3 being complete and stable.

1. Set up `frontend/playwright.config.ts`
2. Migrate `auth/sign-in.spec.ts`
3. Migrate `auth/sign-up.spec.ts`
4. Migrate `auth/protected-redirect.spec.ts`
5. Migrate `public/` tests
6. Migrate `customer/` tests
7. Migrate `admin/` tests
8. Write new: `e2e/calculator/calculator-flow.spec.ts`
9. Write new: `e2e/subscriptions/upgrade-flow.spec.ts`

---

## Checklist Before Each Phase

- [ ] All tests in previous phase pass (`bun test` exits 0)
- [ ] No TypeScript errors (`bunx tsc --noEmit`)
- [ ] Imports resolve to actual files in the correct server (backend or frontend)
- [ ] No cross-server imports (frontend tests must not import backend code and vice versa)

## Coverage Targets

| Area | Target |
|---|---|
| Backend services | > 80% line coverage |
| Backend routes (integration) | All happy paths + auth rejection |
| Frontend utils/validation | > 85% line coverage |
| Frontend hooks | > 70% branch coverage |
| E2E | All critical user flows: login, calculator, upgrade, payment |
