# Phase 02 — User UI Migration (After Admin)

## Goal
Migrate all non-admin user-facing UI after admin UI is stable.

## Scope (what to migrate)

### A) Customer/auth app pages (source)
From `project/app/(customer)/` migrate:
- `(auth)/layout.tsx`
- `(auth)/sign-in/page.tsx`
- `(auth)/sign-up/page.tsx`
- `(main)/layout.tsx`
- `(main)/account/page.tsx`
- `(main)/account/account-interactive.tsx`
- `(main)/calculator/page.tsx`
- `(main)/calculator/calculator-interactive.tsx`
- `(main)/checkout/page.tsx`
- `(main)/checkout/checkout-interactive.tsx`
- `(main)/payment/page.tsx`
- `(main)/payment/cancel/page.tsx`
- `(main)/payment/success/page.tsx`
- `(main)/payment/success/payment-success-interactive.tsx`
- `(customer)/layout.tsx`

### B) Public pages (source)
From `project/app/(public)/` migrate:
- `about/page.tsx`
- `accessibility/page.tsx`
- `api-documentation/page.tsx`
- `contact/page.tsx`
- `cookies/page.tsx`
- `faq/page.tsx`
- `features/page.tsx`
- `pricing/page.tsx`
- `pricing/pricing-interactive.tsx`
- `privacy/page.tsx`
- `support/page.tsx`
- `terms/page.tsx`

### C) User feature modules (source)
Migrate these feature folders completely:
- `project/features/account/`
- `project/features/auth/`
- `project/features/calculator/`
- `project/features/contact/`
- `project/features/faq/`
- `project/features/customers/`
- `project/features/orders/`
- `project/features/payments/`
- `project/features/subscriptions/`

## Destination structure
- `frontend/src/routes/` (create if missing)
- `frontend/src/routes/_auth/` (or your auth-protected convention)
- `frontend/src/features/{account,auth,calculator,contact,faq,customers,orders,payments,subscriptions}`

## Exact migration order inside this phase

1. **Auth entry points first**
   - Sign-in and sign-up routes.
   - Ensure redirects and auth-guard wiring are valid.

2. **Core signed-in flows**
   - Account → Calculator → Checkout → Payment success/cancel.

3. **Public marketing/legal pages**
   - Pricing/FAQ/Contact/About first, then legal docs.

4. **Feature module parity pass**
   - Copy each user feature folder and fix imports immediately.

5. **Next.js API replacement pass**
   - Replace `next/link`, `next/navigation`, `next/image`, `next-intl` usage.

## Exit criteria (must pass before Phase 03)
- [ ] All customer/auth/public pages are represented in `frontend/src/routes/`.
- [ ] User feature modules exist in `frontend/src/features/` with fixed imports.
- [ ] No `next/*` imports remain in user UI files.
- [ ] Auth and payment flows render without missing-module/runtime failures.

## Out of scope for this phase
- Shared service layer cleanup
- API route consumption contract verification
- Final test suite completion
