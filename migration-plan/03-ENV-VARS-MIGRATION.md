# Environment Variables Migration

## The Problem

`frontend/src/shared/utils/config/envUtil.ts` was copied from the Next.js project without being updated for Vite. It uses:

- `process.env[name]` — **Vite does NOT support `process.env` by default**
- `NEXT_PUBLIC_` prefix — **Vite uses `VITE_` prefix for public variables**
- `typeof window !== "undefined"` checks — unnecessary in a pure SPA

At runtime in Vite, `process.env` is either `undefined` or an empty object, meaning **every environment variable read through `envUtil.ts` in the frontend returns an empty string or throws**.

---

## Affected Variables in `envUtil.ts`

### Variables That Should Move to Backend Only

These are server secrets. They must be **removed entirely from the frontend** `envUtil.ts`. They should never be exposed to the browser.

| Variable | Reason |
|---|---|
| `DATABASE_URL` | Database credential — backend only |
| `REDIS_URL` | Cache credential — backend only |
| `FIREBASE_CLIENT_EMAIL` | Firebase Admin credential — backend only |
| `FIREBASE_PRIVATE_KEY` | Firebase Admin credential — backend only |
| `CSRF_SECRET` | CSRF signing key — backend only |
| `ENCRYPTION_KEY` | Encryption key — backend only |
| `ADMIN_SPECIAL_CODE_HASH` | Admin secret — backend only |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret — backend only |
| `RESEND_API_KEY` | Email API key — backend only |
| `RESEND_FROM_EMAIL` | Email config — backend only |
| `RESEND_REPLY_TO_EMAIL` | Email config — backend only |
| `R2_ACCOUNT_ID` | Storage credential — backend only |
| `R2_ACCESS_KEY_ID` | Storage credential — backend only |
| `R2_SECRET_ACCESS_KEY` | Storage credential — backend only |
| `R2_BUCKET_NAME` | Storage config — backend only |
| `R2_PUBLIC_URL` | Can stay frontend if needed for public asset URLs |
| `METRICS_ENABLED` | Backend observability config |
| `METRICS_SECRET` | Backend observability secret |
| `IS_RAILWAY` | Deployment platform detection — backend only |

### Variables That Should Stay in Frontend (Rename to `VITE_`)

These are safe to expose to the browser. Each `NEXT_PUBLIC_*` variable needs to be renamed to `VITE_*` in both the `.env` file and the code.

| Old Variable | New Variable | Notes |
|---|---|---|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | `VITE_FIREBASE_API_KEY` | Firebase client config |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | `VITE_FIREBASE_AUTH_DOMAIN` | Firebase client config |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | `VITE_FIREBASE_PROJECT_ID` | Firebase client config |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | `VITE_FIREBASE_STORAGE_BUCKET` | Firebase client config |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase client config |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | `VITE_FIREBASE_APP_ID` | Firebase client config |
| `NEXT_PUBLIC_BASE_URL` | `VITE_BASE_URL` | App base URL for SEO/links |
| `NEXT_PUBLIC_DEBUG` | `VITE_DEBUG` | Debug flag |
| `NEXT_PUBLIC_LOG_LEVEL` | `VITE_LOG_LEVEL` | Log verbosity |
| `APP_ENV` | `VITE_APP_ENV` | Environment name |

---

## Required Code Changes

### 1. Update `getEnvVar` to use `import.meta.env`

```ts
// ❌ Current (Next.js / Node.js style)
function getEnvVar(name: string, ...): string {
  const envValue = process.env[name];
  const isPublicVar = name.startsWith("NEXT_PUBLIC_");
  // ...
}

// ✅ Fixed (Vite style)
function getEnvVar(name: string, ...): string {
  const envValue = import.meta.env[name];
  // No need for NEXT_PUBLIC_ check — all Vite client vars use VITE_ prefix
  // and are automatically inlined at build time
  // ...
}
```

### 2. Update every `process.env.NEXT_PUBLIC_*` call site

There are direct `process.env.NEXT_PUBLIC_FIREBASE_*` calls used as the `value` parameter to `getEnvVar`. These need to change:

```ts
// ❌ Current
export const FIREBASE_API_KEY = getEnvVar(
  "NEXT_PUBLIC_FIREBASE_API_KEY",
  true,
  undefined,
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY  // ← this is undefined in Vite
);

// ✅ Fixed
export const FIREBASE_API_KEY = import.meta.env.VITE_FIREBASE_API_KEY ?? "";
```

### 3. Remove the client/server split logic

The `typeof window !== "undefined"` check is a Next.js SSR pattern. Vite builds a pure SPA — there is no server rendering, so this check is always `true` (always on client). Remove this logic entirely from the frontend `envUtil.ts`.

### 4. Update `.env.example` in frontend

```bash
# ❌ Old (Next.js naming)
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# ✅ New (Vite naming)
VITE_FIREBASE_API_KEY=your-api-key
VITE_BASE_URL=http://localhost:3000
```

---

## The Two `envUtil.ts` Files Going Forward

After migration, there should be **two separate files**:

### `frontend/src/shared/utils/config/envUtil.ts` (client-safe only)
- Uses `import.meta.env.*`
- Only exports `VITE_*` variables
- No secrets, no server-only config
- No `process.env` anywhere

### `backend/src/utils/config/envUtil.ts` (server-only)
- Uses `process.env.*` (fine for Bun/Node)
- Exports all secrets and server config
- Already exists and is correct

---

## How to Verify After Fix

```bash
# Should find zero results
grep -r "process\.env" frontend/src --include="*.ts" --include="*.tsx"
grep -r "NEXT_PUBLIC_" frontend/src --include="*.ts" --include="*.tsx"

# Verify Vite can read the vars (run dev server and check console)
bun run dev
```

Also check `frontend/.env.example` to ensure all documented variables use the `VITE_` prefix.
