# Frontend Pages Status

Complete page-by-page audit of all routes in `frontend/src/routes/`.

## Legend
- ✅ Complete — real implementation, using correct patterns
- ⚠️ Partial — exists but incomplete or uses wrong patterns
- ❌ Stub — placeholder content only, no real implementation
- 🔍 Unverified — exists but not deeply checked

---

## Public Pages

### `/` — Home Page
**File:** `routes/index.tsx`
**Status:** ✅ Complete
**Notes:** Full hero, features, benefits, CTA sections. Uses TanStack Router and i18next.

---

### `/pricing`
**File:** `routes/pricing.tsx`
**Status:** ✅ Complete
**Notes:** Has `PricingInteractive` component, FAQ accordion, CTA. Uses React Query.

---

### `/about`
**File:** `routes/about.tsx`
**Status:** ✅ Complete
**Notes:** Mission, values, team highlights, calculator expertise sections.

---

### `/contact`
**File:** `routes/contact.tsx`
**Status:** ✅ Complete
**Notes:** Full contact form with `ContactPageClient` component. Form submission to `/api/shared/contact-messages`.

---

### `/faq`
**File:** `routes/faq.tsx`
**Status:** ✅ Complete
**Notes:** FAQ with search and category filtering via `FAQPageClient`.

---

### `/features`
**File:** `routes/features.tsx`
**Status:** ✅ Complete
**Notes:** Features showcase page.

---

### `/support`
**File:** `routes/support.tsx`
**Status:** 🔍 Unverified
**Notes:** File exists. Verify it has real content, not a stub. Original had a full support center with categories.

---

### `/privacy`
**File:** `routes/privacy.tsx`
**Status:** 🔍 Unverified
**Notes:** File exists. Should contain the full privacy policy text. Verify content is present.

---

### `/terms`
**File:** `routes/terms.tsx`
**Status:** 🔍 Unverified
**Notes:** File exists. Should contain full terms of service. Verify content is present.

---

### `/cookies`
**File:** `routes/cookies.tsx`
**Status:** 🔍 Unverified
**Notes:** File exists. Should contain cookie policy. Verify content is present.

---

### `/accessibility`
**File:** `routes/accessibility.tsx`
**Status:** 🔍 Unverified
**Notes:** File exists. Should contain accessibility statement. Verify content is present.

---

### `/api-documentation`
**File:** `routes/api-documentation.tsx`
**Status:** 🔍 Unverified
**Notes:** File exists. Original had API reference docs. Verify content exists and links are updated (no Next.js-specific API route references).

---

## Auth Pages

### `/sign-in`
**File:** `routes/sign-in.tsx`
**Status:** ✅ Complete
**Notes:** Email/password + Google OAuth. Error handling and redirect after login. Uses Firebase Auth SDK.

---

### `/sign-up`
**File:** `routes/sign-up.tsx`
**Status:** ✅ Complete
**Notes:** Name, email, password form with validation. Google OAuth. Uses Firebase Auth SDK.

---

## Customer Pages (Protected Routes)

### `/account`
**File:** `routes/account.tsx`
**Status:** ✅ Complete
**Notes:** Account dashboard via `AccountInteractive` component with profile, subscription, usage, and orders tabs.

---

### `/calculator`
**File:** `routes/calculator.tsx`
**Status:** ⚠️ Partial (verify)
**Notes:** Route delegates to `CalculatorInteractive` component in the feature. The component has real logic (5 calculator types: Loan, Mortgage, Investment, Retirement, Simple). Verify that:
1. Usage tracking calls to `/api/calculator/usage` work
2. History saving to `/api/calculator/history` works
3. Export to `/api/calculator/export` works
4. The feature correctly reads auth state (not from Next.js context)

---

### `/checkout`
**File:** `routes/checkout.tsx`
**Status:** ⚠️ Partial
**Notes:** Route calls `CheckoutInteractive` component. The component exists in `features/payments/` but the checkout flow depends on Stripe — see [05-PAYMENT-FLOW.md](./05-PAYMENT-FLOW.md) for the full breakdown of what's broken here.

---

### `/payment`
**File:** `routes/payment/index.tsx`
**Status:** ❌ Stub
**Notes:** Placeholder UI only. No Stripe integration. See [05-PAYMENT-FLOW.md](./05-PAYMENT-FLOW.md).

---

### `/payment/success`
**File:** `routes/payment/success.tsx`
**Status:** ⚠️ Partial
**Notes:** File exists and calls `PaymentSuccessInteractive`. Verify:
1. Reads `session_id` from URL query params
2. Calls backend to confirm payment and get order details
3. Displays order confirmation

---

### `/payment/cancel`
**File:** `routes/payment/cancel.tsx`
**Status:** ⚠️ Partial
**Notes:** File exists. Verify it has a useful cancel flow with a "try again" path.

---

## Admin Pages (Protected — Admin Role Required)

See [06-ADMIN-PANEL-GAPS.md](./06-ADMIN-PANEL-GAPS.md) for detailed breakdown.

| Route | Status |
|---|---|
| `/admin` | ✅ Complete (wrapper + AuthGuard) |
| `/admin/dashboard` | ✅ Complete |
| `/admin/customers` | ✅ Complete |
| `/admin/orders` | ✅ Complete |
| `/admin/subscriptions` | ✅ Complete |
| `/admin/contactmessages` | ❌ Stub |
| `/admin/developer` | ❌ Stub |
| `/admin/settings` | ❌ Stub |

---

## Pages in Original Project NOT in Frontend

Cross-check the original's `project/app/` against `frontend/src/routes/`. The following were identified in the original:

| Original Route | Frontend Route | Status |
|---|---|---|
| `(public)/about/page.tsx` | `routes/about.tsx` | ✅ |
| `(public)/contact/page.tsx` | `routes/contact.tsx` | ✅ |
| `(public)/faq/page.tsx` | `routes/faq.tsx` | ✅ |
| `(public)/features/page.tsx` | `routes/features.tsx` | ✅ |
| `(public)/pricing/page.tsx` | `routes/pricing.tsx` | ✅ |
| `(public)/privacy/page.tsx` | `routes/privacy.tsx` | 🔍 |
| `(public)/terms/page.tsx` | `routes/terms.tsx` | 🔍 |
| `(public)/support/page.tsx` | `routes/support.tsx` | 🔍 |
| `(public)/cookies/page.tsx` | `routes/cookies.tsx` | 🔍 |
| `(public)/accessibility/page.tsx` | `routes/accessibility.tsx` | 🔍 |
| `(public)/api-documentation/page.tsx` | `routes/api-documentation.tsx` | 🔍 |
| `(customer)/(auth)/sign-in/page.tsx` | `routes/sign-in.tsx` | ✅ |
| `(customer)/(auth)/sign-up/page.tsx` | `routes/sign-up.tsx` | ✅ |
| `(customer)/(main)/account/page.tsx` | `routes/account.tsx` | ✅ |
| `(customer)/(main)/calculator/page.tsx` | `routes/calculator.tsx` | ⚠️ |
| `(customer)/(main)/checkout/page.tsx` | `routes/checkout.tsx` | ⚠️ |
| `(customer)/(main)/payment/page.tsx` | `routes/payment/index.tsx` | ❌ |
| `(customer)/(main)/payment/success/page.tsx` | `routes/payment/success.tsx` | ⚠️ |
| `(customer)/(main)/payment/cancel/page.tsx` | `routes/payment/cancel.tsx` | ⚠️ |
| `admin/dashboard/page.tsx` | `routes/admin/dashboard.tsx` | ✅ |
| `admin/customers/page.tsx` | `routes/admin/customers.tsx` | ✅ |
| `admin/orders/page.tsx` | `routes/admin/orders.tsx` | ✅ |
| `admin/subscriptions/page.tsx` | `routes/admin/subscriptions.tsx` | ✅ |
| `admin/contactmessages/page.tsx` | `routes/admin/contactmessages.tsx` | ❌ |
| `admin/developer/page.tsx` | `routes/admin/developer.tsx` | ❌ |
| `admin/settings/page.tsx` | `routes/admin/settings.tsx` | ❌ |

**No routes appear to be missing entirely** — all original routes have a corresponding file in the frontend. The issue is that several files are stubs with no real content.

---

## Component Pattern Checks to Run

For every completed page, verify these patterns are correct:

```bash
# Should find zero results — no more next/link
grep -r "from 'next/link'" frontend/src/routes --include="*.tsx"

# Should find zero results — no more next/image
grep -r "from 'next/image'" frontend/src/routes --include="*.tsx"

# Should find zero results — no more next-intl
grep -r "from 'next-intl'" frontend/src/routes --include="*.tsx"
grep -r "from 'next-intl'" frontend/src/features --include="*.tsx"

# Should find zero results — no "use client" directive
grep -r '"use client"' frontend/src/routes --include="*.tsx"
grep -r '"use client"' frontend/src/features --include="*.tsx"

# Should find zero results — no useTranslations (next-intl hook)
grep -r "useTranslations" frontend/src --include="*.tsx" --include="*.ts"
```

Any result from the above commands indicates a component that was copied from Next.js without proper adaptation.
