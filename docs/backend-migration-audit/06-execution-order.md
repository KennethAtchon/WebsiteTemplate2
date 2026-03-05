# Execution Order: How to Clean the Backend

Follow this order to avoid breaking imports while cleaning up.

## Step 1: Delete dead Next.js route copies (safe, nothing imports these)

```bash
rm -rf backend/src/routes/api/
```

Verify nothing broke:
```bash
cd backend && bun run build
```

---

## Step 2: Delete frontend code (safe, nothing in Hono routes imports these)

```bash
# React hooks in features/
rm -rf backend/src/features/auth/hooks/
rm -rf backend/src/features/calculator/hooks/
rm -rf backend/src/features/subscriptions/hooks/
rm -rf backend/src/features/faq/
rm    backend/src/features/calculator/components/index.ts

# React components (.tsx files)
rm -rf backend/src/features/account/components/
rm -rf backend/src/features/admin/components/
rm -rf backend/src/features/contact/components/

# Shared hooks / i18n / query / seo
rm -rf backend/src/shared/hooks/
rm -rf backend/src/shared/i18n/
rm -rf backend/src/shared/lib/
rm -rf backend/src/shared/services/seo/
rm -rf backend/src/shared/services/api/

# Shared frontend firebase (client SDK)
rm  backend/src/shared/services/firebase/config.ts
rm  backend/src/shared/services/firebase/stripe-payments.ts

# Web vitals
rm  backend/src/shared/utils/system/web-vitals.ts
rm  backend/src/utils/system/system/web-vitals.ts
```

Verify:
```bash
cd backend && bun run build
```

---

## Step 3: Delete Next.js middleware artifacts

```bash
rm  backend/src/middleware.ts
rm  backend/src/shared/middleware/api-route-protection.ts
rm  backend/src/shared/middleware/helper.ts
rmdir backend/src/shared/middleware/  # only if empty

rm  backend/src/features/auth/services/firebase-middleware.ts

# Check if auth types are still needed before deleting
grep -r "auth.types" backend/src/routes --include="*.ts"
# If no results: rm backend/src/features/auth/types/auth.types.ts
```

---

## Step 4: Resolve duplicate directories

This requires deciding on a canonical location. Recommended approach:

**Keep root-level `src/utils/` and `src/services/` as canonical** (they're what Hono
routes use). Update any `src/shared/` files that are still valid backend code to use
relative imports instead of `@/shared/...`.

Files in `src/shared/` that are genuinely useful and NOT duplicated elsewhere:
- `shared/constants/app.constants.ts`
- `shared/constants/order.constants.ts`
- `shared/constants/rate-limit.config.ts`
- `shared/constants/stripe.constants.ts`
- `shared/services/db/performance-monitor.ts`
- `shared/services/firebase/subscription-helpers.ts`
- `shared/services/firebase/sync.ts`
- `shared/services/request-identity/request-identity.ts`
- `shared/services/timezone/TimeService.ts`
- `shared/types/api.types.ts`
- `shared/utils/api/add-timezone-header.ts`
- `shared/utils/config/index.ts`
- `shared/utils/config/mock.ts`
- `shared/utils/error-handling/auth-error-handler.ts`
- `shared/utils/permissions/calculator-permissions.ts`
- `shared/utils/validation/auth-validation.ts`
- `shared/utils/validation/checkout-validation.ts`
- `shared/utils/validation/contact-validation.ts`
- `shared/utils/validation/data-validation.ts`
- `shared/utils/validation/file-validation.ts`
- `shared/utils/validation/search-validation.ts`

**Migration path for each:**
1. Move to root-level `src/utils/` or `src/services/`
2. Update their `@/shared/...` imports to relative paths
3. Delete from `src/shared/`
4. Update any routes that import from `../shared/...`

After consolidation, `backend/src/shared/` should be empty and can be deleted.

---

## Step 5: Fix double-nested directory structure

Flatten the double-nested directories:
```
src/utils/error-handling/error-handling/  -> src/utils/error-handling/
src/utils/helpers/helpers/                -> src/utils/helpers/
src/utils/system/system/                  -> src/utils/system/
src/services/email/email/                 -> src/services/email/
src/services/observability/observability/ -> src/services/observability/
src/services/rate-limit/rate-limit/       -> src/services/rate-limit/
src/services/storage/storage/             -> src/services/storage/
```

Update all imports in `src/routes/*.ts` accordingly.

---

## Final Verification

```bash
cd backend

# No Next.js imports remaining
grep -r "from \"next/" src --include="*.ts" -l

# No @/shared imports in routes
grep -r "@/shared" src/routes --include="*.ts"

# Server starts
bun run dev
```
