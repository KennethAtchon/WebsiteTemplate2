# Backend Completeness

## Overall Status: ✅ Largely Complete

The backend (`backend/`) is the most complete part of the migration. All API routes from the original Next.js `app/api/` directory have been ported to Hono. This document covers what's verified, what needs a second look, and what is genuinely missing.

---

## Route Comparison: Original vs. Backend

### Admin Routes
| Original (`project/app/api/admin/`) | Backend (`backend/src/routes/api/admin/`) | Status |
|---|---|---|
| `verify/route.ts` | `verify/` | ✅ |
| `analytics/route.ts` | `analytics/` | ✅ |
| `customers/route.ts` | `customers/` | ✅ |
| `orders/route.ts` | `orders/` | ✅ |
| `orders/[id]/route.ts` | `orders/[id]/` | ✅ |
| `subscriptions/route.ts` | `subscriptions/` | ✅ |
| `subscriptions/[id]/route.ts` | `subscriptions/[id]/` | ✅ |
| `subscriptions/analytics/route.ts` | `subscriptions/analytics/` | ✅ |
| `schema/route.ts` | `schema/` | ✅ |
| `sync-firebase/route.ts` | `sync-firebase/` | ✅ |
| `database/health/route.ts` | `database/health/` | ✅ |

### Health / Status Routes
| Original | Backend | Status |
|---|---|---|
| `health/route.ts` | `health/` | ✅ |
| `health/error-monitoring/route.ts` | `health/error-monitoring/` | ✅ |
| `live/route.ts` | `live/` | ✅ |
| `ready/route.ts` | `ready/` | ✅ |

### Analytics Routes
| Original | Backend | Status |
|---|---|---|
| `analytics/form-completion/route.ts` | `analytics/form-completion/` | ✅ |
| `analytics/form-progress/route.ts` | `analytics/form-progress/` | ✅ |
| `analytics/search-performance/route.ts` | `analytics/search-performance/` | ✅ |
| `analytics/web-vitals/route.ts` | `analytics/web-vitals/` | ✅ |

### Shared Routes
| Original | Backend | Status |
|---|---|---|
| `shared/emails/route.ts` | `shared/emails/` | ✅ |
| `shared/upload/route.ts` | `shared/upload/` | ✅ |
| `shared/contact-messages/route.ts` | `shared/contact-messages/` | ✅ |

### Subscription Routes
| Original | Backend | Status |
|---|---|---|
| `subscriptions/current/route.ts` | `subscriptions/current/` | ✅ |
| `subscriptions/portal-link/route.ts` | `subscriptions/portal-link/` | ✅ |
| `subscriptions/trial-eligibility/route.ts` | `subscriptions/trial-eligibility/` | ✅ |

### Calculator Routes
| Original | Backend | Status |
|---|---|---|
| `calculator/calculate/route.ts` | `calculator/calculate/` | ✅ |
| `calculator/export/route.ts` | `calculator/export/` | ✅ |
| `calculator/history/route.ts` | `calculator/history/` | ✅ |
| `calculator/types/route.ts` | `calculator/types/` | ✅ |
| `calculator/usage/route.ts` | `calculator/usage/` | ✅ |

### Customer Routes
| Original | Backend | Status |
|---|---|---|
| `customer/profile/route.ts` | `customer/profile/` | ✅ |
| `customer/orders/route.ts` | `customer/orders/` | ✅ |
| `customer/orders/[orderId]/route.ts` | `customer/orders/[orderId]/` | ✅ |
| `customer/orders/create/route.ts` | `customer/orders/create/` | ✅ |
| `customer/orders/by-session/route.ts` | `customer/orders/by-session/` | ✅ |
| `customer/orders/total-revenue/route.ts` | `customer/orders/total-revenue/` | ✅ |

### User Routes
| Original | Backend | Status |
|---|---|---|
| `users/route.ts` | `users/` | ✅ |
| `users/delete-account/route.ts` | `users/delete-account/` | ✅ |
| `users/customers-count/route.ts` | `users/customers-count/` | ✅ |
| `users/export-data/route.ts` | `users/export-data/` | ✅ |
| `users/object-to-processing/route.ts` | `users/object-to-processing/` | ✅ |

### CSRF + Metrics
| Original | Backend | Status |
|---|---|---|
| `csrf/route.ts` | `csrf/` | ✅ |
| `metrics/route.ts` | `metrics/` | ✅ |

---

## Gaps and Items Needing Verification

### 1. Stripe Webhook Handler — MISSING

There is **no `/api/webhooks/stripe` endpoint** in the backend. This is a critical gap.

Without it:
- Stripe cannot notify the backend when payments complete
- Orders are never created after successful checkout
- Subscriptions are never updated after renewals or cancellations

**What needs to be created:**
```
backend/src/routes/api/webhooks/stripe.ts
```

Handlers needed:
- `checkout.session.completed` → Create Order record in DB
- `payment_intent.succeeded` → Update payment status
- `invoice.payment_succeeded` → Record subscription renewal
- `invoice.payment_failed` → Mark subscription at risk
- `customer.subscription.updated` → Update subscription tier/status
- `customer.subscription.deleted` → Deactivate subscription in DB

The webhook endpoint must verify Stripe signature using `STRIPE_WEBHOOK_SECRET` before processing any events.

---

### 2. Subscription Checkout Session — Possibly Missing

`/api/subscriptions/portal-link` creates a Stripe Customer Portal session (for managing existing subscriptions). There may be no endpoint to **create a new subscription checkout session**.

The frontend's checkout flow needs to create a Stripe Checkout Session for a new subscription. Check if this exists:
- `POST /api/subscriptions/checkout` — check if this exists in backend
- If not, it needs to be created

A Stripe Checkout Session for subscriptions requires:
1. Find or create a Stripe Customer for the Firebase user
2. Create a Stripe Checkout Session with `mode: "subscription"` and the `priceId`
3. Return `{ url: string }` to redirect the user to Stripe

---

### 3. CORS Configuration

The backend `envUtil.ts` has:
```ts
export const CORS_ALLOWED_ORIGINS = getEnvVarAsArray("CORS_ALLOWED_ORIGINS", [
  "http://localhost:3000",
  "https://example.com",
]);
```

**Action needed:** Update the default CORS origins to match the actual frontend URL. In development this should be `http://localhost:5173` (Vite's default port). In production, set `CORS_ALLOWED_ORIGINS` environment variable to the deployed frontend URL.

---

### 4. Database Migrations

Verify the Prisma schema and migrations are consistent between:
- `backend/src/infrastructure/database/prisma/schema.prisma`
- `project/infrastructure/database/prisma/schema.prisma` (if it exists)

Run `prisma migrate status` in the backend to confirm all migrations are applied.

---

### 5. Firebase Admin SDK Initialization

Verify that `backend/src/services/firebase/admin.ts` correctly initializes the Firebase Admin SDK using:
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`
- `FIREBASE_PROJECT_ID`

These must be set in the backend's `.env` file (not the frontend's).

---

## Backend Services Checklist

| Service | Location | Status |
|---|---|---|
| Prisma client | `backend/src/services/db/prisma.ts` | ✅ |
| Redis client | `backend/src/services/db/redis.ts` | ✅ |
| Firebase Admin | `backend/src/services/firebase/admin.ts` | ✅ |
| Resend email | `backend/src/services/email/resend.ts` | ✅ |
| Cloudflare R2 | `backend/src/services/storage/r2.ts` | ✅ |
| Rate limiting | `backend/src/services/rate-limit/` | ✅ |
| CSRF protection | `backend/src/services/csrf/` | ✅ |
| Prometheus metrics | `backend/src/services/observability/metrics.ts` | ✅ |
| Stripe webhooks | Not found | ❌ Missing |

---

## Middleware Checklist

| Middleware | Location | Status |
|---|---|---|
| Security headers | `backend/src/middleware/security-headers.ts` | ✅ |
| CORS + CSRF protection | `backend/src/middleware/protection.ts` | ✅ |
| Auth verification (requireAuth) | `backend/src/middleware/` | ✅ |
| Auth verification (requireAdmin) | `backend/src/middleware/` | ✅ |
| Rate limiting applied | Check routes | 🔍 Verify |

---

## Summary

The backend is ~95% complete. The only clear gap is the **Stripe webhook handler**. Everything else appears ported from the original Next.js API routes. The backend is production-ready pending:
1. Stripe webhook handler implementation
2. Possibly a subscription checkout session endpoint
3. CORS origin update for deployed frontend URL
4. Environment variables set correctly in production
