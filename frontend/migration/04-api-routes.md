# Phase 04 — API Route Migration & Contract Parity (After Services)

## Goal
Finalize frontend-side migration for API integrations by mapping every legacy Next.js API route to the split backend and validating contract parity.

## Scope
Source API routes are in `project/app/api/**/route.ts` (43 files).

This phase is about the **frontend contract layer** (clients, endpoints, request/response expectations), not backend implementation.

## API route inventory to verify (exact)

### Admin
- `admin/analytics/route.ts`
- `admin/customers/route.ts`
- `admin/database/health/route.ts`
- `admin/orders/route.ts`
- `admin/orders/[id]/route.ts`
- `admin/schema/route.ts`
- `admin/subscriptions/route.ts`
- `admin/subscriptions/[id]/route.ts`
- `admin/subscriptions/analytics/route.ts`
- `admin/sync-firebase/route.ts`
- `admin/verify/route.ts`

### Analytics
- `analytics/form-completion/route.ts`
- `analytics/form-progress/route.ts`
- `analytics/search-performance/route.ts`
- `analytics/web-vitals/route.ts`

### Calculator
- `calculator/calculate/route.ts`
- `calculator/export/route.ts`
- `calculator/history/route.ts`
- `calculator/types/route.ts`
- `calculator/usage/route.ts`

### Customer
- `customer/orders/route.ts`
- `customer/orders/[orderId]/route.ts`
- `customer/orders/by-session/route.ts`
- `customer/orders/create/route.ts`
- `customer/orders/total-revenue/route.ts`
- `customer/profile/route.ts`

### Shared / Platform
- `csrf/route.ts`
- `health/route.ts`
- `health/error-monitoring/route.ts`
- `live/route.ts`
- `metrics/route.ts`
- `ready/route.ts`
- `shared/contact-messages/route.ts`
- `shared/emails/route.ts`
- `shared/upload/route.ts`

### Subscriptions
- `subscriptions/current/route.ts`
- `subscriptions/portal-link/route.ts`
- `subscriptions/trial-eligibility/route.ts`

### Users
- `users/route.ts`
- `users/customers-count/route.ts`
- `users/delete-account/route.ts`
- `users/export-data/route.ts`
- `users/object-to-processing/route.ts`

## Destination areas to update in frontend
- `frontend/src/shared/services/api/`
- feature-level API hooks/services under `frontend/src/features/**/`
- any route loaders/actions that call API

## Exact migration order inside this phase

1. **Build endpoint parity sheet first**
   - Track each legacy endpoint path + HTTP method + expected status codes.

2. **Migrate admin API consumers first**
   - Because admin UI was migrated first in Phase 01.

3. **Migrate user/customer/subscription consumers**
   - Align with Phase 02 flows (account/calculator/checkout/payments).

4. **Migrate shared utility endpoints**
   - CSRF, health, upload, emails, observability endpoints.

5. **Normalize error handling and auth token injection**
   - Ensure all consumers use common fetch wrappers (`safe-fetch`, `authenticated-fetch`).

6. **Contract validation pass**
   - Verify request payload schemas and response shapes expected by UI.

## Exit criteria (must pass before Phase 05)
- [ ] Every legacy API route has a mapped frontend consumer or an explicit “unused/deprecated” decision.
- [ ] No hardcoded Next.js route-handler assumptions remain in frontend code.
- [ ] Shared API wrappers are used consistently.
- [ ] Admin and user API-dependent screens function with backend responses.

## Out of scope for this phase
- Writing/fixing backend route handlers
- Full test completion (reserved for Phase 05)
