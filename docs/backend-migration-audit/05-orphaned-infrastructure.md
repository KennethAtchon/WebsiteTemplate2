# Issue 5: Orphaned Infrastructure

**Severity:** Low
**Action:** Verify and clean up

## `backend/src/infrastructure/database/`

This directory contains only Prisma-generated type declaration files (`.d.ts`), not the
actual runtime client. The real Prisma schema and generated client are configured via:

```json
// backend/package.json
"prisma": {
  "schema": "src/infrastructure/database/prisma/schema.prisma"
}
```

### Contents

```
backend/src/infrastructure/database/lib/generated/prisma/
  client.d.ts
  default.d.ts
  edge.d.ts
  index.d.ts
  runtime/binary.d.ts
  runtime/index-browser.d.ts
  runtime/index.d.ts   (missing — only .d.ts files present)
  runtime/library.d.ts
  wasm.d.ts
```

### Check

Run `prisma generate` and verify whether these files are regenerated into
`node_modules/@prisma/client` or into this path. If they regenerate to `node_modules`,
this directory is stale output that can be deleted.

```bash
# From backend/
bun run db:generate
ls src/infrastructure/database/lib/generated/prisma/
```

If the files are regenerated here, they should be in `.gitignore`.
If not regenerated here, delete the directory.

---

## `backend/src/constants/subscription.constants.ts` (root-level)

This file is separate from `backend/src/shared/constants/subscription.constants.ts`.
The Hono `admin.ts` route imports it via:
```ts
import { getTierConfig } from "../constants/subscription.constants";
```

The shared version uses `@/shared/utils/stripe-map-loader` while the root version uses
`@/utils/stripe-map-loader`. They are functionally identical aside from import paths.

**Action:** As part of the consolidation in issue 03, pick one and remove the other.
Update the `admin.ts` import accordingly.

---

## `backend/src/__tests__/`

Check that all integration tests reference the correct Hono routes (not Next.js routes).

```bash
grep -r "routes/api" backend/__tests__ --include="*.ts"
grep -r "NextRequest\|NextResponse" backend/__tests__ --include="*.ts"
```

Any tests that test Next.js route handlers instead of Hono routes need to be rewritten
or deleted.
