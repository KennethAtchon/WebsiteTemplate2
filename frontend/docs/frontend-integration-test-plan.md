# Frontend Integration Test Plan

## Overview

Integration tests verify that multiple components and modules work together correctly. Unlike unit tests that test isolated functions, integration tests focus on the interactions between parts of the system.

## Recommendation: **Frontend Integration Tests Belong in Frontend Repo**

### Why Frontend Integration Tests Should Live in Frontend

1. **Clear Ownership**: Frontend team owns UI/UX testing responsibilities
2. **Dependency Management**: Frontend tests need React Testing Library, Happy-DOM, browser mocks
3. **CI/CD Separation**: Frontend tests run on frontend changes, preventing false failures
4. **Focused Testing**: Each repo tests what it owns

## Test Categories & Structure

### Directory Structure
```
frontend/
├── __tests__/
│   ├── unit/           # Existing: 37 test files
│   ├── integration/   # NEW: Component & API integration tests
│   └── e2e/          # Future: Full user journey tests
└── docs/
    └── frontend-integration-test-plan.md
```

## Integration Test Types

### 1. Component Integration Tests
**Purpose**: Test multiple React components working together

**Examples**:
- `AuthGuard` + `AuthProvider` + Router integration
- Form components with validation and submission
- Data fetching components with loading/error states
- Modal components with overlays and user interactions

**Test Files**:
```
__tests__/integration/components/
├── auth-flow.integration.test.tsx
├── contact-form.integration.test.tsx
├── calculator-flow.integration.test.tsx
└── payment-flow.integration.test.tsx
```

### 2. API Integration Tests
**Purpose**: Test frontend API calls and error handling

**Examples**:
- Authenticated fetch with token refresh
- React Query caching and invalidation
- Error boundary integration with API failures
- Loading states during API calls

**Test Files**:
```
__tests__/integration/api/
├── authenticated-fetch.integration.test.tsx
├── react-query.integration.test.tsx
└── error-handling.integration.test.tsx
```

### 3. Route Integration Tests
**Purpose**: Test navigation and route protection

**Examples**:
- Protected routes with authentication
- Public route bypassing
- Route transitions with state preservation
- Navigation guards and redirects

**Test Files**:
```
__tests__/integration/routes/
├── protected-routes.integration.test.tsx
├── navigation-flow.integration.test.tsx
└── route-guards.integration.test.tsx
```

### 4. State Integration Tests
**Purpose**: Test state management across components

**Examples**:
- React Query state synchronization
- Context provider integration
- Local storage persistence
- Form state management

**Test Files**:
```
__tests__/integration/state/
├── react-query.integration.test.tsx
├── context-providers.integration.test.tsx
└── form-state.integration.test.tsx
```

## Detailed Step-by-Step Guide (Every Section)

Use this as the operational runbook when implementing and maintaining each test section.

### Section A: Component Integration Tests (Auth, Forms, Composite UI)

1. **Define the user journey first**
   - Write a short flow in plain language (example: "unauthenticated user opens protected route -> redirect to sign-in").
   - Identify all participating components/providers in that flow.

2. **Choose the integration boundary**
   - Keep real internal React logic.
   - Mock only external systems (network, SDKs, browser-only APIs).

3. **Create test harness**
   - Build a `renderWithProviders` helper if the flow needs multiple providers.
   - Inject stable mocks (`useNavigate`, context values, i18n translation function) to avoid re-render loops.

4. **Implement tests in 3-state pattern**
   - **Loading state**: assert spinner/message and hidden content.
   - **Success state**: assert expected content renders.
   - **Failure/denied state**: assert redirect/error/fallback UI.

5. **Assert side effects, not just DOM**
   - Verify redirect calls (`navigate`).
   - Verify fallback calls (e.g., API verification invoked when claims insufficient).

6. **Harden async behavior**
   - Use `findBy*` for async-rendered elements.
   - Use `waitFor` for async side effects (redirects, retries).

7. **Add regression edge cases**
   - No user session.
   - Expired/invalid role claim.
   - API verification error path.

8. **Run and isolate**
   - Run file only first.
   - Run full integration suite after local pass.

### Section B: API Integration Tests (React Query, Auth Fetch, Error Handling)

1. **List endpoints involved per feature**
   - Method, route, expected payload, expected status codes.

2. **Model API states per endpoint**
   - 2xx success
   - 4xx business validation failure
   - 5xx transient failure
   - network timeout/throw

3. **Mock at transport boundary**
   - Prefer MSW-style handlers (or equivalent centralized mock layer).
   - Keep service/hook logic real.

4. **Validate request correctness**
   - Assert path, query params, headers, and body shape.
   - Assert auth headers/token behavior where required.

5. **Validate response behavior**
   - Success: cache update/render update.
   - Error: error UI/toast/retry behavior.
   - Retry: expected number of attempts and final state.

6. **React Query-specific checks**
   - Query enters `isLoading` before data.
   - Cache is reused when expected.
   - Invalidations trigger refetch when expected.

7. **Token/auth-specific checks**
   - Token refresh path executes once on 401.
   - Request replays after refresh when expected.
   - Hard failure results in logout/redirect path.

8. **Run matrix**
   - Run each endpoint scenario in table-driven tests.

### Section C: Route Integration Tests (Protection, Redirects, Transitions)

1. **Build a route map for tests**
   - Public routes
   - Protected user routes
   - Protected admin routes
   - Auth pages

2. **Define expected routing outcomes**
   - Who can enter route X?
   - Where should disallowed users be redirected?
   - Which query params (`redirect_url`) should be preserved?

3. **Test entry paths**
   - Direct URL entry.
   - In-app navigation.
   - Post-login return flow.

4. **Test permission transitions**
   - No session -> user session.
   - user role -> admin role.
   - admin role removed.

5. **Assert both UI and router effects**
   - Target screen appears/disappears.
   - Router navigation function called with exact target.

6. **Stability checks**
   - Ensure no infinite redirect loops.
   - Ensure guards settle from loading to final state.

### Section D: State Integration Tests (Context + Query + Form + Storage)

1. **Enumerate state owners**
   - Context providers
   - React Query cache
   - Local component state
   - Local/session storage

2. **Pick a cross-component scenario**
   - One action updates at least two state owners.

3. **Test synchronization**
   - Trigger action in Component A.
   - Assert Component B reflects change.
   - Assert stale values are not shown.

4. **Test persistence rules**
   - Reload/remount behavior.
   - Route transition behavior.
   - Storage restore behavior.

5. **Test rollback/error behavior**
   - Failed mutation restores previous state.
   - Pending state indicator clears correctly.

6. **Test concurrency edge cases**
   - Rapid sequential updates.
   - Out-of-order async responses.

7. **Add anti-flake guardrails**
   - Reset storage and mocks per test.
   - Reset query client cache between tests.

## Mock Strategy

### Unit Tests (Current)
- Mock all external dependencies
- Test pure logic in isolation

### Integration Tests (New)
- Mock external APIs (backend calls)
- Test internal component interactions
- Use real React rendering and state management

### E2E Tests (Future)
- No mocking
- Test against real backend
- Full browser automation (Playwright)

## Implementation Plan

### Phase 1: Setup Infrastructure (Step-by-Step)
1. Create/confirm test directories
   - `__tests__/integration/components`
   - `__tests__/integration/api`
   - `__tests__/integration/routes`
   - `__tests__/integration/state`

2. Configure runtime
   - Verify `bunfig.toml` includes preload setup.
   - Ensure aliases resolve in tests (`@/...`).

3. Build shared test utilities
   - `__tests__/setup/integration-setup.ts`
   - `renderWithProviders` helper
   - shared mock factories for auth user roles and API responses

4. Configure CI
   - Add integration test command as a separate job/stage.
   - Fail build if integration tests fail.

5. Baseline smoke test
   - Add one trivial integration test to confirm environment stability.

### Phase 2: Core Integration Tests (Step-by-Step)
1. Auth Flow Integration
   - Implement unauthenticated redirect scenario.
   - Implement authenticated success scenario.
   - Implement admin claim success + fallback API verification scenario.
   - Implement denied/error redirect scenarios.

2. Form Integration
   - Validate empty submit behavior.
   - Validate field-level errors.
   - Validate successful API submission and success UI.
   - Validate API failure and retry path.

3. API Integration
   - Add tests for query success/loading/error.
   - Add tests for retry logic and terminal failure UI.
   - Add tests for cache hit/miss and invalidation.

4. Gate criteria before moving forward
   - No flaky retries needed locally.
   - All core flows green in CI.

### Phase 3: Advanced Integration Tests (Step-by-Step)
1. Multi-step Flows
   - Define 2-3 high-value end-to-end frontend journeys.
   - Test step transitions, preserved state, and expected side effects at each step.

2. Performance-Oriented Integration Checks
   - Add render count assertions for critical components.
   - Add regression checks for unnecessary rerenders on state changes.
   - Validate lazy-loaded route/component fallback behavior.

3. Hardening and maintenance
   - Track flaky tests and root-cause them weekly.
   - Refactor duplicated setup into shared helpers.
   - Keep mock contracts aligned with backend API changes.

## Debugging Guide (How to Diagnose Failing Integration Tests)

### 1) First triage (2-5 minutes)
1. Run only the failing file.
2. Identify failure class:
   - element not found
   - wrong redirect/navigation
   - unexpected loading state stuck
   - mock not invoked
   - timeout/flaky async wait
3. Copy exact stack location and failing assertion.

### 2) Determine root cause category
1. **Setup issue**: provider/mocks not initialized as expected.
2. **Async issue**: assertion occurs before effect/state settles.
3. **State leak**: previous test mutated shared state/mocks.
4. **Behavior change**: component logic changed and test is stale.

### 3) Debugging checklist by symptom

#### Symptom: "Unable to find element"
- Confirm if content is synchronous or async.
- Switch from `getBy*` to `findBy*` if async by design.
- Print DOM (`screen.debug()`) immediately before assertion.
- Verify guard/loading branch conditions in test setup.

#### Symptom: Redirect assertion fails
- Assert `navigate` with exact expected payload.
- Check user/auth role state in the test fixture.
- Verify pathname/public route inputs used by guard/router.
- Use `waitFor` if redirect happens inside async effect.

#### Symptom: Test stuck in loading
- Check `authLoading`/query loading mocks are reset.
- Verify async path reaches terminal state in mocked responses.
- Ensure unresolved promises are not left pending.

#### Symptom: Flaky pass/fail behavior
- Clear all mocks and shared mutable objects in `afterEach`.
- Reset storage/query cache between tests.
- Remove timing assumptions; assert eventual behavior with `waitFor`.

### 4) Instrumentation guidance
1. Add temporary logs around branch decisions in the component/hook.
2. Log mock call arguments (`mock.calls`) for redirects/API calls.
3. Remove temporary logs before merge.

### 5) Recovery workflow when a test still fails
1. Create minimal reproduction test with one assertion.
2. Make it pass.
3. Reintroduce assertions one by one.
4. Keep only behavior assertions that represent true user-facing contracts.

### 6) Definition of done for a fix
1. Failing test passes in isolation.
2. Entire relevant suite passes.
3. No new flakes across at least 2 reruns.
4. Test names/descriptions clearly explain expected behavior.

## Test Configuration

### Integration Test Setup (`__tests__/setup/integration-setup.ts`)
```typescript
import { GlobalRegistrator } from "@happy-dom/global-registrator";
import { setupServer } from "msw/node";
import { rest } from "msw";

// Setup Happy-DOM
GlobalRegistrator.register();

// Mock API server
const server = setupServer(
  rest.post("/api/contact", (req, res, ctx) => {
    return res(ctx.json({ success: true }));
  }),
  rest.get("/api/user/profile", (req, res, ctx) => {
    return res(ctx.json({ user: { id: "test", email: "test@example.com" } }));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

### Bun Configuration Update
```toml
[test]
preload = ["./__tests__/setup/bun-preload.ts"]
testMatch = ["**/__tests__/**/*.test.ts", "**/__tests__/**/*.test.tsx"]
testIgnore = ["**/node_modules/**"]
```

## Success Metrics

1. **Coverage**: Integration tests cover critical user flows
2. **Reliability**: Tests are stable and don't flake
3. **Speed**: Integration tests run in reasonable time (< 30s total)
4. **Maintainability**: Tests are easy to understand and modify

## Tools & Dependencies

### Required Packages
```json
{
  "devDependencies": {
    "msw": "^2.0.0",           // API mocking
    "@testing-library/user-event": "^14.0.0", // User interactions
    "wait-for-expect": "^3.0.0" // Async test utilities
  }
}
```

### Test Utilities
- Custom render functions with providers
- Mock data factories
- Test helper functions
- API response builders

## Next Steps

1. **Create integration directory structure**
2. **Set up API mocking with MSW**
3. **Write first integration test (auth flow)**
4. **Update CI/CD pipeline**
5. **Document testing patterns for team**

This plan provides a comprehensive approach to frontend integration testing while maintaining clear separation of concerns and ownership.
