# Backend Migration Audit

**Date:** 2026-03-04
**Status:** Frontend migration complete. Backend cleanup required.

## Overview

The backend Hono server (`backend/`) is functional — all routes are properly implemented
in `backend/src/routes/*.ts` and served via `backend/src/index.ts`. However, the migration
left behind significant structural issues that need to be resolved before the backend is
considered clean.

## Issues Found

| Category | Severity | File |
|---|---|---|
| Dead Next.js route copies | High | `01-dead-routes-api-directory.md` |
| Frontend code in backend | High | `02-frontend-code-to-remove.md` |
| Duplicate utility/service directories | Medium | `03-duplicate-directories.md` |
| Next.js artifacts in shared/ | Medium | `04-nextjs-artifacts-in-shared.md` |
| Empty/orphaned infrastructure | Low | `05-orphaned-infrastructure.md` |

## Quick Summary

### What works correctly
- `backend/src/routes/*.ts` — Proper Hono routes for all endpoints
- `backend/src/middleware/` — Hono middleware (auth, security headers)
- `backend/src/services/` — Backend services (db, firebase, email, etc.)
- `backend/src/index.ts` — Server entry point

### What needs to be cleaned
1. **Delete** `backend/src/routes/api/` entirely (copied Next.js files, never used)
2. **Delete** `backend/src/middleware.ts` (Next.js middleware file)
3. **Delete** all React hooks, React components, and Next.js-specific code from `backend/src/`
4. **Consolidate** `backend/src/utils/` into `backend/src/shared/utils/` (or vice versa)
5. **Consolidate** `backend/src/services/` into `backend/src/shared/services/` (or vice versa)
6. **Fix** `@/shared/...` path alias references inside `backend/src/shared/` files
