# Issue 2: Frontend Code in Backend

**Severity:** High
**Action:** Delete all files listed below (they belong in `frontend/` or are already there)

## Problem

During migration, many frontend-only files were copied into `backend/src/`. These include
React hooks, React components (.tsx), next-intl config, TanStack Query clients, Next.js
SEO metadata helpers, and Web Vitals reporters. None of these belong in a Hono API server.

---

## React Hooks (use-* files)

These use React APIs (`useState`, `useEffect`, `useCallback`, etc.) and have no place
in a Node/Bun backend.

### `backend/src/features/`
| File | Reason |
|---|---|
| `features/auth/hooks/use-authenticated-fetch.ts` | React hook, uses `useApp` context |
| `features/calculator/hooks/use-calculator.ts` | React hook, uses TanStack Query |
| `features/subscriptions/hooks/use-subscription.ts` | React hook (`"use client"` directive) |

### `backend/src/shared/hooks/`
| File | Reason |
|---|---|
| `shared/hooks/use-mobile.ts` | React hook (`useState`, `useEffect`) |
| `shared/hooks/use-paginated-data.ts` | React hook |
| `shared/hooks/use-portal-link.ts` | React hook |
| `shared/hooks/use-query-fetcher.ts` | React hook |

Delete the entire `backend/src/shared/hooks/` directory.

---

## React Components (.tsx files)

These are React UI components — they import JSX and Tailwind/shadcn/UI libraries.
They should live in `frontend/` only.

### `backend/src/features/account/components/`
- `calculator-interface.tsx`
- `order-detail-modal.tsx`
- `profile-editor.tsx`
- `subscription-management.tsx`
- `usage-dashboard.tsx`

### `backend/src/features/admin/components/`
- `customers/customers-view.tsx`
- `customers/customers-list.tsx`
- `customers/edit-customer-modal.tsx`
- `dashboard/dashboard-layout.tsx`
- `dashboard/dashboard-view.tsx`
- `dashboard/help-modal.tsx`
- `orders/orders-view.tsx`
- `orders/orders-list.tsx`
- `orders/order-form.tsx`
- `orders/recent-orders-list.tsx`
- `orders/helper/order-products-button.tsx`
- `orders/helper/order-products-modal.tsx`
- `subscriptions/subscriptions-view.tsx`
- `subscriptions/subscriptions-list.tsx`
- `subscriptions/subscription-analytics.tsx`

### `backend/src/features/contact/components/`
- `contact-form.tsx`
- `contact-info.tsx`
- `contact-page-client.tsx`
- `thank-you-dialog.tsx`

### `backend/src/features/calculator/components/`
- `index.ts` (exports non-existent .tsx files like `CalculatorInput`, `MortgageCalculator`, etc.)

---

## i18n / next-intl Config

These configure `next-intl` routing and middleware — a Next.js-only library.

Delete the entire `backend/src/shared/i18n/` directory:
- `shared/i18n/config.ts`
- `shared/i18n/navigation.ts`

---

## TanStack Query (React Query)

Used for client-side data fetching in React apps, not a server.

Delete `backend/src/shared/lib/`:
- `shared/lib/query-client.ts`
- `shared/lib/query-keys.ts`

---

## Next.js SEO / Metadata Helpers

These use `import { Metadata } from "next"` — a Next.js-only type.

Delete the entire `backend/src/shared/services/seo/` directory:
- `shared/services/seo/metadata.ts`
- `shared/services/seo/page-metadata.ts`
- `shared/services/seo/structured-data.ts`

---

## Web Vitals

Uses the `web-vitals` browser library and `onCLS`, `onINP`, etc.

- Delete: `backend/src/shared/utils/system/web-vitals.ts`

---

## Client-Side Firebase Config

Uses `firebase/auth`, `firebase/firestore`, `getAuth` — the client SDK, not Admin SDK.

- `backend/src/shared/services/firebase/config.ts` — client SDK init (DELETE)
- `backend/src/shared/services/firebase/stripe-payments.ts` — uses `getApp()` from client SDK (DELETE)

The backend should only use `firebase-admin`, which is already in:
`backend/src/services/firebase/admin.ts`

---

## Client-Side Fetch Utilities

These wrap `fetch()` with client-side auth (Firebase Auth token from the browser).

- `backend/src/shared/services/api/authenticated-fetch.ts` — imports from firebase/config (client)
- `backend/src/shared/services/api/safe-fetch.ts` — fetch wrapper for browser context

---

## FAQ Data (Frontend Content)

Uses translation functions that only work in a Next.js/React context.

- Delete: `backend/src/features/faq/data/faq-data.ts`

---

## Summary: Directories to delete entirely

```
backend/src/shared/hooks/
backend/src/shared/i18n/
backend/src/shared/lib/
backend/src/shared/services/seo/
backend/src/shared/services/api/
backend/src/shared/services/firebase/config.ts
backend/src/shared/services/firebase/stripe-payments.ts
backend/src/shared/utils/system/web-vitals.ts
backend/src/features/account/components/
backend/src/features/admin/components/
backend/src/features/contact/components/
backend/src/features/calculator/components/
backend/src/features/auth/hooks/
backend/src/features/calculator/hooks/
backend/src/features/subscriptions/hooks/
backend/src/features/faq/
```
