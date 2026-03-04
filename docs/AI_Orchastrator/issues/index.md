# AI Orchestrator Issues Index

## Resolved

| Date | Issue | Resolution |
|------|-------|------------|
| Feb 21, 2026 | Bun `mock.module` isolation bug causing test failures in combined run | Documented in `testing.md`; `test:ci` runs unit/integration separately; tracked [oven-sh/bun#25712](https://github.com/oven-sh/bun/issues/25712) |
| Feb 21, 2026 | E2E spec files being picked up by `bun test` runner | Added `exclude = ["**/__tests__/e2e/**"]` to `bunfig.toml` |
| Feb 21, 2026 | Preload mock for `global-error-handler` / `api-error-wrapper` blocking unit tests from testing real implementations | Removed from `bun-preload.ts`; integration tests that need these mocks register them at file level |
| Feb 21, 2026 | `metrics.ts` missing `registry` named export expected by unit test | Added `registry` getter object export |
| Feb 21, 2026 | `api-shared.test.ts` file-validation mock bleeding into unit tests | Moved `mock.module` to `beforeAll`/`afterAll` (partial fix — Bun ES module live binding issue remains; running tests separately is the full fix) |

| Feb 21, 2026 | `next` 16.0.7 had 4 HIGH CVEs (DoS, source code exposure) | Upgraded to 16.0.9; also upgraded `eslint-config-next` to match |
| Feb 21, 2026 | `verifyIdToken` missing `checkRevoked: true` in `delete-account`, `helper.ts` (CSRF), `requireAuth`, `requireAdmin` | Added `checkRevoked: true` to all four call sites |
| Feb 21, 2026 | Missing Content-Security-Policy header on page responses | CSP header added to `middleware.ts` |
| Feb 21, 2026 | Public rate limit set to 500/min (development artifact) | Reverted to 100/min in `rate-limit.config.ts` |

## Open

| Priority | Issue | Status |
|----------|-------|--------|
| HIGH | `fast-xml-parser` critical CVE via firebase-admin/aws-sdk transitive dependency | Pending (upstream fix required — track `firebase-admin` releases) |
| MEDIUM | `bun test` combined run has known failures (Bun mock isolation bug) | Documented; `test:ci` workaround in place |
| MEDIUM | `/api/health/error-monitoring` is public — exposes internal diagnostics without auth | Acceptable for now; protect behind bearer token before public launch |
| LOW | `contact-messages` GET calls `requireAdmin` manually inside handler instead of via `withAdminProtection` | Low risk; refactor for consistency |
| LOW | No at-rest encryption of PII fields (email, phone, address) in PostgreSQL | Low risk if DB access is restricted; evaluate encryption for highly sensitive deployments |
