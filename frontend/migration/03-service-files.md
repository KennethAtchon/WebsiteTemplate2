# Phase 03 — Service Files Migration (After UI)

## Goal
Migrate and sanitize **client-safe service/util files** used by migrated UI.

## Scope (source to evaluate)
Primary source folder:
- `project/shared/services/`

Current service subfolders observed:
- `api/`
- `csrf/`
- `db/`
- `email/`
- `firebase/`
- `observability/`
- `rate-limit/`
- `request-identity/`
- `seo/`
- `storage/`
- `timezone/`

## Client-safe vs server-only rule

### Usually client-safe (migrate to frontend)
- `shared/services/api/*`
- `shared/services/csrf/*` (if browser token handling only)
- `shared/services/firebase/config.ts` (client SDK config only)
- `shared/services/seo/*` (frontend metadata helpers)
- `shared/services/timezone/*`

### Usually server-only (do NOT keep in frontend)
- `shared/services/db/*`
- `shared/services/email/*`
- `shared/services/firebase/admin.ts`
- any Redis/R2 direct server integration

## Destination
- `frontend/src/shared/services/` (keep only browser-safe services)

## Exact migration order inside this phase

1. **Audit each service file by runtime requirements**
   - If it needs server secrets, Node APIs, Prisma, Firebase Admin, or Redis → mark server-only.

2. **Migrate API and auth fetch helpers first**
   - `project/shared/services/api/authenticated-fetch.ts`
   - `project/shared/services/api/safe-fetch.ts`

3. **Migrate remaining client-safe services in this order**
   1) `csrf/`
   2) `firebase/` (client-only files)
   3) `seo/`
   4) `observability/` (if browser-safe)
   5) `timezone/`

4. **Remove/replace accidental server imports**
   - Remove references to server env utilities, Node-only packages, or admin SDK.

5. **Run service usage check**
   - Confirm user/admin UI imports resolve against `frontend/src/shared/services/*`.

## Exit criteria (must pass before Phase 04)
- [ ] `frontend/src/shared/services/` contains only client-safe modules.
- [ ] No DB/admin/email/server-only service imports remain in frontend source.
- [ ] All migrated UI service imports resolve and compile.

## Out of scope for this phase
- API route file migration itself
- Full test campaign
