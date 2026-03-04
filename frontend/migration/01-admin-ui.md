# Phase 01 — Admin UI Migration (Do First)

## Goal
Migrate **all admin-facing UI** from `project/` into `frontend/src/` before touching user flows.

## Scope (what to migrate in this phase)

### A) Admin app pages (source)
- `project/app/admin/layout.tsx`
- `project/app/admin/dashboard/page.tsx`
- `project/app/admin/customers/page.tsx`
- `project/app/admin/orders/page.tsx`
- `project/app/admin/subscriptions/page.tsx`
- `project/app/admin/contactmessages/page.tsx`
- `project/app/admin/developer/page.tsx`
- `project/app/admin/settings/page.tsx`
- Interactive subfiles:
  - `project/app/admin/contactmessages/contact-messages-interactive.tsx`
  - `project/app/admin/developer/developer-interactive.tsx`
  - `project/app/admin/settings/settings-interactive.tsx`

### B) Admin feature components (source)
Migrate all files in:
- `project/features/admin/components/customers/`
- `project/features/admin/components/dashboard/`
- `project/features/admin/components/orders/`
- `project/features/admin/components/subscriptions/`

## Destination structure (create if missing)
- `frontend/src/routes/admin/`
- `frontend/src/features/admin/`
- `frontend/src/shared/components/` (only if admin pages depend on missing shared UI)

## Exact migration order inside this phase

1. **Create admin route shell first**
   - Create `frontend/src/routes/admin/`.
   - Add route entry files for: dashboard, customers, orders, subscriptions, contactmessages, developer, settings.

2. **Move page-level admin containers**
   - Port each `project/app/admin/**/page.tsx` to matching route files.
   - Remove Next.js-only APIs (`generateMetadata`, `next/navigation`, etc.).

3. **Move interactive admin files**
   - Port the 3 `*-interactive.tsx` files and wire them to route files.

4. **Move admin feature components**
   - Copy folder-by-folder in this order:
     1) `dashboard/`
     2) `customers/`
     3) `orders/`
     4) `subscriptions/`

5. **Fix imports after each folder**
   - Replace Next imports with frontend equivalents.
   - Normalize aliases (`@/features/...`, `@/shared/...`).

6. **Smoke-check admin screens only**
   - Verify each admin route renders.

## Exit criteria (must pass before Phase 02)
- [ ] `frontend/src/routes/admin/` exists and contains all admin route files.
- [ ] All admin feature components are under `frontend/src/features/admin/`.
- [ ] No `next/*` imports remain in admin files.
- [ ] Admin pages compile and render without runtime import crashes.

## Out of scope for this phase
- Customer/public/auth pages
- Shared service migration
- API route contract migration
- Test finalization
