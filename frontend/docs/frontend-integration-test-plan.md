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

### Phase 1: Setup Infrastructure
1. Create `__tests__/integration/` directory
2. Update `bunfig.toml` to include integration tests
3. Create integration test setup file
4. Update CI/CD pipeline

### Phase 2: Core Integration Tests
1. **Auth Flow Integration**
   - Test login → protected route → logout flow
   - Test token refresh and error handling
   - Test route protection with different user roles

2. **Form Integration**
   - Test contact form with validation and API submission
   - Test calculator form with complex state
   - Test payment form with Stripe integration

3. **API Integration**
   - Test React Query with mocked backend
   - Test error handling and retry logic
   - Test loading states and caching

### Phase 3: Advanced Integration Tests
1. **Multi-step Flows**
   - Test complete user journeys
   - Test state persistence across routes
   - Test complex component interactions

2. **Performance Integration**
   - Test component re-rendering
   - Test memory usage in complex scenarios
   - Test bundle loading and code splitting

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
