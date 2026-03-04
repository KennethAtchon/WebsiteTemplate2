# Admin Panel Gaps

## Overview

The admin panel has 8 routes. 5 of them have real feature components. 3 are stubs with no implementation.

## Admin Routes Status

| Route | File | Status | Feature Component |
|---|---|---|---|
| `/admin` | `routes/admin/index.tsx` | ✅ Wrapper + AuthGuard | `DashboardLayout` |
| `/admin/dashboard` | `routes/admin/dashboard.tsx` | ✅ Real implementation | `DashboardView` |
| `/admin/customers` | `routes/admin/customers.tsx` | ✅ Real implementation | `CustomersView` |
| `/admin/orders` | `routes/admin/orders.tsx` | ✅ Real implementation | `OrdersView` |
| `/admin/subscriptions` | `routes/admin/subscriptions.tsx` | ✅ Real implementation | `SubscriptionsView` |
| `/admin/contactmessages` | `routes/admin/contactmessages.tsx` | ❌ STUB | None migrated |
| `/admin/developer` | `routes/admin/developer.tsx` | ❌ STUB | None migrated |
| `/admin/settings` | `routes/admin/settings.tsx` | ❌ STUB | None migrated |

---

## Stub Route Details

### 1. Contact Messages (`/admin/contactmessages`)

**Current frontend file:**
```tsx
function ContactMessagesPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Contact Messages</h1>
      <p className="text-muted-foreground">
        Manage contact form submissions from users.
      </p>
    </div>
  );
}
```

**What the original had:** `project/app/admin/contactmessages/contact-messages-interactive.tsx`

A full data table with:
- List of all contact form submissions from users
- Columns: sender name, email, message preview, date, read/unread status
- Dropdown menu per row: mark as read, reply, delete
- Pagination (ChevronLeft/ChevronRight navigation)
- Search/filter functionality
- Uses `useAuthenticatedFetch` to call `GET /api/shared/contact-messages`

**What needs to be created:**
- `frontend/src/features/admin/components/contactmessages/contact-messages-view.tsx` — migrate from original
- Update `frontend/src/routes/admin/contactmessages.tsx` to use it

**API endpoint:** `GET /api/shared/contact-messages` — already exists in backend ✅

**i18n note:** Original uses `useTranslations` (next-intl). Must convert all translation calls to `useTranslation` (react-i18next).

---

### 2. Developer Tools (`/admin/developer`)

**Current frontend file:**
```tsx
function DeveloperPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Developer</h1>
      <p className="text-muted-foreground">
        Developer tools and debugging information.
      </p>
    </div>
  );
}
```

**What the original had:** `project/app/admin/developer/developer-interactive.tsx`

A database inspection and administration tool with:
- Table selector (dropdown showing all Prisma tables)
- JSON editor for raw data manipulation
- Table visualization with sortable columns
- Uses `getTableConfigs` and `generateExpectedParams` from `@/shared/utils/system/prisma-introspection`
- Calls `GET /api/admin/schema` to fetch database schema
- Calls table-specific endpoints to fetch and update data
- Uses `useAuthenticatedFetch` for all API calls

**Dependencies to check:**
- `frontend/src/shared/utils/system/prisma-introspection.ts` — does this exist in frontend? It was in original `project/shared/utils/system/`.
- `GET /api/admin/schema` endpoint — verify in backend ✅

**What needs to be created:**
- `frontend/src/features/admin/components/developer/developer-view.tsx` — migrate from original
- Verify `prisma-introspection.ts` is in `frontend/src/shared/utils/system/`
- Update `frontend/src/routes/admin/developer.tsx` to use it

**Note:** This tool accesses raw database tables. Ensure the AuthGuard on this route enforces admin role.

---

### 3. Settings (`/admin/settings`)

**Current frontend file:**
```tsx
function SettingsPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Settings</h1>
      <p className="text-muted-foreground">
        Application settings and configuration.
      </p>
    </div>
  );
}
```

**What the original had:** `project/app/admin/settings/settings-interactive.tsx`

Application configuration UI with (verify by reading the original file):
- Business settings (company name, contact info)
- Feature flags management
- Email configuration
- Subscription plan management
- API keys display (redacted for security)

**What needs to be created:**
- Read `project/app/admin/settings/settings-interactive.tsx` to understand full scope
- `frontend/src/features/admin/components/settings/settings-view.tsx` — migrate from original
- Update `frontend/src/routes/admin/settings.tsx` to use it

---

## Missing Feature Components vs. Original

The original project's admin feature had these components in `project/features/admin/components/`:

```
✅ customers/customers-view.tsx
✅ customers/customers-list.tsx
✅ customers/edit-customer-modal.tsx
✅ dashboard/dashboard-layout.tsx
✅ dashboard/dashboard-view.tsx
✅ dashboard/help-modal.tsx
✅ orders/orders-view.tsx
✅ orders/orders-list.tsx
✅ orders/order-form.tsx
✅ orders/recent-orders-list.tsx
✅ orders/helper/order-products-modal.tsx
✅ orders/helper/order-products-button.tsx
✅ subscriptions/subscriptions-view.tsx
✅ subscriptions/subscriptions-list.tsx
✅ subscriptions/subscription-analytics.tsx
❌ contactmessages/ (not migrated)
❌ developer/ (not migrated)
❌ settings/ (not migrated)
```

---

## Admin Auth Guard

The current `routes/admin/index.tsx` wraps children with an `AuthGuard`. Verify:

1. The `AuthGuard` checks for admin role (not just "any authenticated user")
2. It redirects non-admins to `/` or shows a 403, not just to sign-in
3. The guard works with the new Firebase auth setup (no Next.js middleware)

In the original project, admin protection was handled by both:
- Next.js middleware (`project/middleware.ts`) — server-side route protection
- Client-side `AuthGuard` component

In the new Vite app, there is no server-side middleware for routes. The `AuthGuard` component is the **only** protection mechanism. Ensure it actually verifies the admin Firebase custom claim before rendering admin content.

---

## Migration Steps for Each Stub

1. Read the original file in `project/app/admin/[page]/[page]-interactive.tsx`
2. Remove `"use client"` directive
3. Convert `useTranslations` (next-intl) → `useTranslation` (react-i18next)
4. Convert any `next/image` → `<img>` or shadcn `Avatar`
5. Convert any `next/link` → TanStack Router `<Link>`
6. Remove any server-only imports
7. Place in `frontend/src/features/admin/components/[page]/`
8. Update route file to import and render the new component
