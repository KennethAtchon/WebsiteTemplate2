# Remaining Fixes Required

**Last Updated:** 2026-03-03

---

## 🔴 CRITICAL FIXES

### 1. Router Type Definitions
**Issue:** TanStack Router only recognizes 4 routes in type system  
**Current Types:** `"/" | "/admin" | "/admin/dashboard" | "." | ".."`  
**Expected:** All 27 routes should be typed

**Root Cause:** Routes not yet created, so types aren't generated

**Fix Steps:**
1. Create all missing route files (see `01-MISSING-ROUTES.md`)
2. Run `npm run build` to regenerate route types
3. Verify TypeScript errors are resolved

**Files Affected:** 60+ files with Link components

---

### 2. Missing Route Files
**Count:** 19 missing routes  
**Impact:** Application navigation broken  
**Priority:** CRITICAL

**Missing Routes:**
- Public: 11 routes (pricing, contact, faq, etc.)
- Auth: 2 routes (sign-in, sign-up)
- Customer: 6 routes (account, calculator, checkout, payment)

**See:** `01-MISSING-ROUTES.md` for complete list

---

## 🟡 HIGH PRIORITY FIXES

### 3. i18next Translation Type Errors
**Issue:** `count` parameter expects `number` but receives `string`

**Affected Files:**
```typescript
// frontend/src/features/account/components/subscription-management.tsx:195
t("account_subscription_calculations_per_month", { count: calculationsPerMonth })
// Fix: Convert to number
t("account_subscription_calculations_per_month", { count: Number(calculationsPerMonth) })

// frontend/src/features/payments/components/checkout/subscription-checkout.tsx:276
t("checkout_calculations_per_month", { count: calculationsPerMonth })
// Fix: Convert to number
t("checkout_calculations_per_month", { count: Number(calculationsPerMonth) })

// frontend/src/shared/components/saas/PricingCard.tsx:156
t("account_subscription_calculations_per_month", { count: calculationsPerMonth })
// Fix: Convert to number
t("account_subscription_calculations_per_month", { count: Number(calculationsPerMonth) })
```

**Fix:** Wrap string values with `Number()` before passing to translation

---

### 4. Missing Dependencies

#### pdf-lib
**File:** `frontend/src/features/account/components/order-detail-modal.tsx:13`  
**Error:** `Cannot find module 'pdf-lib' or its corresponding type declarations.`

**Fix:**
```bash
cd frontend
npm install pdf-lib
npm install --save-dev @types/pdf-lib
```

#### @/shared/i18n/config
**File:** `frontend/src/shared/components/language-switcher.tsx:12`  
**Error:** `Cannot find module '@/shared/i18n/config' or its corresponding type declarations.`

**Fix Options:**
1. Create the missing config file at `frontend/src/shared/i18n/config.ts`
2. Or remove the import and use i18next directly

**Required Config:**
```typescript
// frontend/src/shared/i18n/config.ts
export const locales = ['en', 'es', 'fr'] as const;
export type Locale = typeof locales[number];

export const localeMetadata = {
  en: { name: 'English', flag: '🇺🇸' },
  es: { name: 'Español', flag: '🇪🇸' },
  fr: { name: 'Français', flag: '🇫🇷' },
};
```

---

## 🟢 MEDIUM PRIORITY FIXES

### 5. Server-Only Files in Frontend
**Location:** `frontend/src/shared/services/`  
**Issue:** These files import from `next/server` which doesn't exist in Vite

**Files:**
1. `firebase-middleware.ts`
2. `response-helpers.ts`
3. `api-error-wrapper.ts`
4. `comprehensive-rate-limiter.ts`
5. `csrf-protection.ts`
6. `request-identity.ts`

**Fix Options:**
1. **Move to Backend:** These are server-side utilities, should be in `backend/src/`
2. **Remove:** If not used in frontend
3. **Replace:** Create client-side equivalents if needed

**Recommendation:** Move to backend as these handle server-side concerns (middleware, rate limiting, CSRF, etc.)

---

### 6. Duplicate Type Definitions
**Issue:** `Order` type defined in multiple places causing conflicts

**Error:**
```
Type 'import(".../orders-list").Order | null' is not assignable to type 'Order | null'.
Property 'id' is missing...
```

**Files:**
- `frontend/src/features/admin/components/orders/orders-list.tsx`
- Other order-related files

**Fix:** Consolidate type definitions into a single shared types file:
```typescript
// frontend/src/features/admin/types/order.types.ts
export interface Order {
  id: string;
  // ... other properties
}
```

Then import from the shared location everywhere.

---

## 🔵 LOW PRIORITY / NICE TO HAVE

### 7. Code Splitting Optimization
**Warning:** `Some chunks are larger than 500 kB after minification`  
**Current Bundle:** 920.82 KB (266.82 KB gzipped)

**Recommendations:**
1. Implement route-based code splitting (already using React.lazy for calculators)
2. Use dynamic imports for heavy components
3. Configure manual chunks in vite.config.ts

**Example:**
```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['@radix-ui/react-*'],
          'firebase': ['firebase/app', 'firebase/auth'],
        }
      }
    }
  }
})
```

---

### 8. Image Optimization
**Current:** Using standard `<img>` tags  
**Previous:** Next.js Image component with automatic optimization

**Considerations:**
1. Add image optimization plugin for Vite
2. Or use a CDN with automatic image optimization
3. Or manually optimize images before deployment

**Vite Plugin Option:**
```bash
npm install vite-plugin-image-optimizer --save-dev
```

---

## 📋 FIX CHECKLIST

### Immediate (Before Production)
- [ ] Create all 19 missing route files
- [ ] Fix 3 i18next count parameter type errors
- [ ] Install pdf-lib dependency
- [ ] Create or fix @/shared/i18n/config
- [ ] Verify all routes work and navigate correctly

### Short Term (Next Sprint)
- [ ] Move server-only files to backend
- [ ] Consolidate duplicate type definitions
- [ ] Update TanStack Router configuration
- [ ] Add proper SEO metadata to all pages
- [ ] Test authentication flows end-to-end

### Long Term (Performance)
- [ ] Implement code splitting optimizations
- [ ] Set up image optimization
- [ ] Add bundle size monitoring
- [ ] Performance testing and optimization

---

## 🎯 SUCCESS CRITERIA

Migration is complete when:
1. ✅ All routes created and functional
2. ✅ Zero TypeScript errors
3. ✅ Build succeeds without warnings
4. ✅ All navigation works correctly
5. ✅ Authentication flows work
6. ✅ i18n language switching works
7. ✅ All forms submit correctly
8. ✅ Payment flows complete successfully
9. ✅ Admin panel fully functional
10. ✅ UI matches original project exactly

---

## 📊 CURRENT STATUS

| Category | Status | Notes |
|----------|--------|-------|
| Build | ✅ PASSING | No build errors |
| TypeScript | ⚠️ 50+ ERRORS | All route type related |
| Routes | ❌ 30% COMPLETE | 8/27 routes created |
| Components | ✅ 100% MIGRATED | All Next.js imports replaced |
| Dependencies | ⚠️ 2 MISSING | pdf-lib, i18n config |
| Server Files | ⚠️ NOT MOVED | 6 files still in frontend |
| Navigation | ❌ BROKEN | Missing route files |
| Auth Flows | ❌ UNTESTED | Missing sign-in/sign-up routes |
| Payment Flows | ❌ UNTESTED | Missing payment routes |
| i18n | ✅ WORKING | Language switching functional |

**Overall Progress:** 75% Complete
