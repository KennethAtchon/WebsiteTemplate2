# Test Migration & Writing Plan — Overview

## Context

The monolith (`project/`) has been split into:
- `backend/` — Bun/Hono API server
- `frontend/` — Vite/React SPA

The monolith had a comprehensive test suite. We need to migrate those tests to the correct target and write new tests for code that didn't exist in the monolith or wasn't tested.

## Current State

### Monolith (`project/__tests__/`) — Source of Truth
- **Unit**: components, config, constants, error-handling, features (calculator, payments), hooks, lib, middleware, permissions, services (api, csrf, db, email, observability, rate-limit, request-identity, seo), utils (12 categories), validation (7 files)
- **Integration**: 13 API test files covering all routes
- **E2E**: admin, auth, customer, public, shared flows

### Backend (`backend/__tests__/`) — Partially Migrated
- Unit: `services/api/` only (2 files — authenticated-fetch, safe-fetch) ✅
- Integration: All 13 API test files (copied) — need adaptation for Hono ⚠️

### Frontend (`frontend/__tests__/`) — Partially Migrated
- Unit: `features/calculator/` (3 files), `features/payments/` (1 file), `components/query-provider`, `hooks/use-query-fetcher` ✅
- Missing: ~25+ test files from monolith unit suite ❌

## Plan Documents

| File | Scope |
|------|-------|
| `01-backend-unit-tests.md` | All backend unit tests to migrate/write |
| `02-backend-integration-tests.md` | Adapting integration tests for Hono |
| `03-frontend-unit-tests.md` | All frontend unit tests to migrate/write |
| `04-frontend-e2e-tests.md` | E2E tests (currently in monolith, need new home) |
| `05-execution-order.md` | Recommended order to run migrations |

## Guiding Principles

1. **Migrate first, then adapt** — Copy monolith test as base, adjust imports and API shapes for new target.
2. **Don't duplicate** — A test belongs in either backend or frontend, never both.
3. **Run tests after each batch** — Use `bun test` to verify before moving on.
4. **Integration tests over E2E where possible** — Backend Hono route tests are faster than Playwright.
5. **Use bun:test** — Both backend and frontend use `bun test`. No jest/vitest.

## Test Framework

Both `backend/` and `frontend/` use `bun:test`:
```bash
# Backend
cd backend && bun test
cd backend && bun run test:unit
cd backend && bun run test:ci

# Frontend
cd frontend && bun test
cd frontend && bun run test:unit
cd frontend && bun run test:ci
```
