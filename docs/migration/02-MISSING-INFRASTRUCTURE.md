# Missing Infrastructure Components

## 1. Database Layer (CRITICAL - Backend Only)

### Project Has
```
infrastructure/database/
├── lib/
└── prisma/
    ├── schema.prisma
    ├── migrations/
    └── seed files
```

### Frontend Status
❌ **MISSING** - And should NOT be added

**Reason:** Frontend should never have direct database access
**Action:** Use backend API for all database operations

---

## 2. Middleware (CRITICAL - Backend Only)

### Project Has
`middleware.ts` (205 lines) with:
- CORS handling with origin validation
- Security headers (CSP, HSTS, X-Frame-Options, etc.)
- Preflight request handling
- Permission policies
- Content Security Policy

### Frontend Status
❌ **MISSING** - Cannot be directly ported

**Reason:** Middleware is Next.js edge runtime specific
**Action:** 
- Security headers should be set by reverse proxy (nginx/Apache)
- Or configure in Vite via plugin
- CORS handled by backend API

---

## 3. API Routes (CRITICAL - Backend Only)

### Project Has 44+ API Routes

#### Admin APIs (11 routes)
- `/api/admin/analytics`
- `/api/admin/customers`
- `/api/admin/database/health`
- `/api/admin/orders`
- `/api/admin/orders/[id]`
- `/api/admin/schema`
- `/api/admin/subscriptions`
- `/api/admin/subscriptions/[id]`
- `/api/admin/subscriptions/analytics`
- `/api/admin/sync-firebase`
- `/api/admin/verify`

#### Analytics APIs (4 routes)
- `/api/analytics/form-completion`
- `/api/analytics/form-progress`
- `/api/analytics/search-performance`
- `/api/analytics/web-vitals`

#### Calculator APIs (5 routes)
- `/api/calculator/calculate`
- `/api/calculator/export`
- `/api/calculator/history`
- `/api/calculator/types`
- `/api/calculator/usage`

#### Customer APIs (6 routes)
- `/api/customer/orders`
- `/api/customer/orders/[orderId]`
- `/api/customer/orders/by-session`
- `/api/customer/orders/create`
- `/api/customer/orders/total-revenue`
- `/api/customer/profile`

#### Health & Monitoring APIs (4 routes)
- `/api/health`
- `/api/health/error-monitoring`
- `/api/live`
- `/api/ready`
- `/api/metrics`

#### Shared APIs (3 routes)
- `/api/shared/contact-messages`
- `/api/shared/emails`
- `/api/shared/upload`

#### Subscription APIs (3 routes)
- `/api/subscriptions/current`
- `/api/subscriptions/portal-link`
- `/api/subscriptions/trial-eligibility`

#### User APIs (5 routes)
- `/api/users`
- `/api/users/customers-count`
- `/api/users/delete-account`
- `/api/users/export-data`
- `/api/users/object-to-processing`

#### Security APIs (1 route)
- `/api/csrf`

### Frontend Status
❌ **MISSING** - Vite doesn't support API routes

**Action:** Frontend MUST connect to backend API that provides all these endpoints

---

## 4. Scripts & DevOps

### Project Has
```
scripts/
├── README.md
├── db-reset-and-migrate.sh
├── gdpr-data-purge.ts
└── load-test.js
```

### Frontend Status
❌ **MISSING** - Not needed in frontend

**Action:** Keep scripts in backend/DevOps repository

---

## 5. Docker & Deployment

### Project Has
- `Dockerfile` (3002 bytes)
- `docker-compose.yml` (3936 bytes)
- `railway.toml` (699 bytes)
- `.lighthouserc.js` (2770 bytes)
- `playwright.config.ts` (3316 bytes)

### Frontend Status
❌ **MISSING** - Need frontend-specific configs

**Action:** Create frontend-specific deployment configs

---

## 6. Testing Infrastructure

### Project Has
- Playwright E2E tests
- Lighthouse CI
- Integration tests
- Unit tests

### Frontend Status
⚠️ **PARTIAL** - Has unit tests, missing E2E

**Action:** Port E2E tests to work with frontend + backend

---

## Summary

### Cannot Be Ported (Backend Only)
- ❌ Database infrastructure
- ❌ Prisma schema & migrations
- ❌ API routes (all 44+)
- ❌ Middleware
- ❌ Server-side utilities
- ❌ Database services

### Should Be Created (Frontend Specific)
- ⚠️ Vite security headers plugin
- ⚠️ Frontend deployment configs
- ⚠️ E2E tests for frontend
- ⚠️ API client configuration

### Can Be Shared
- ✓ Components
- ✓ Features (UI logic)
- ✓ Utilities (client-safe)
- ✓ Types
- ✓ Constants
