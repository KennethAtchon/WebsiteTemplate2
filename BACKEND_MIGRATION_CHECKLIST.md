# Backend Migration Checklist

This checklist identifies all components from the legacy monolithic Next.js project (`/project`) that should be migrated to the standalone backend (`/backend`).

## ✅ Core Infrastructure

### Database & ORM
- [ ] **Prisma Schema** - `infrastructure/database/prisma/schema.prisma`
- [ ] **Prisma Migrations** - `infrastructure/database/prisma/migrations/`
- [ ] **Prisma Client Service** - `shared/services/db/prisma.ts` (with encryption, monitoring, connection pooling)
- [ ] **Redis Client** - `shared/services/db/redis.ts`
- [ ] **Database Performance Monitor** - `shared/services/db/performance-monitor.ts`

### Authentication & Authorization
- [ ] **Firebase Admin SDK** - `shared/services/firebase/admin.ts`
- [ ] **Firebase Middleware** - `features/auth/services/firebase-middleware.ts` (`requireAuth`, `requireAdmin`)
- [ ] **Auth Types** - `features/auth/types/auth.types.ts`

### Security Services
- [ ] **CSRF Protection** - `shared/services/csrf/csrf-protection.ts`
- [ ] **Rate Limiting** - `shared/services/rate-limit/comprehensive-rate-limiter.ts`
- [ ] **Rate Limit Redis** - `shared/services/rate-limit/rate-limit-redis.ts`
- [ ] **Request Identity** - `shared/services/request-identity/` (IP detection, user extraction)
- [ ] **Encryption Utils** - `shared/utils/security/encryption.ts`
- [ ] **PII Sanitization** - `shared/utils/security/pii-sanitization.ts`

### Middleware & Route Protection
- [ ] **API Route Protection** - `shared/middleware/api-route-protection.ts` (`withApiProtection`, `withUserProtection`, `withAdminProtection`)
- [ ] **Middleware Helpers** - `shared/middleware/helper.ts` (CORS, rate limiting, CSRF, auth validation)
- [ ] **Root Middleware** - `middleware.ts` (CORS preflight, security headers)

## ✅ API Routes (43 endpoints)

### Admin Routes (`/api/admin/*`)
- [ ] **Analytics** - `app/api/admin/analytics/route.ts`
- [ ] **Customers** - `app/api/admin/customers/route.ts`
- [ ] **Database Health** - `app/api/admin/database/health/route.ts`
- [ ] **Orders** - `app/api/admin/orders/route.ts`
- [ ] **Order by ID** - `app/api/admin/orders/[id]/route.ts`
- [ ] **Schema Introspection** - `app/api/admin/schema/route.ts`
- [ ] **Subscriptions** - `app/api/admin/subscriptions/route.ts`
- [ ] **Subscription by ID** - `app/api/admin/subscriptions/[id]/route.ts`
- [ ] **Subscription Analytics** - `app/api/admin/subscriptions/analytics/route.ts`
- [ ] **Firebase Sync** - `app/api/admin/sync-firebase/route.ts`
- [ ] **Admin Verification** - `app/api/admin/verify/route.ts`

### Analytics Routes (`/api/analytics/*`)
- [ ] **Form Completion** - `app/api/analytics/form-completion/route.ts`
- [ ] **Form Progress** - `app/api/analytics/form-progress/route.ts`
- [ ] **Search Performance** - `app/api/analytics/search-performance/route.ts`
- [ ] **Web Vitals** - `app/api/analytics/web-vitals/route.ts`

### Calculator Routes (`/api/calculator/*`)
- [ ] **Calculate** - `app/api/calculator/calculate/route.ts`
- [ ] **Export** - `app/api/calculator/export/route.ts`
- [ ] **History** - `app/api/calculator/history/route.ts`
- [ ] **Types** - `app/api/calculator/types/route.ts`
- [ ] **Usage** - `app/api/calculator/usage/route.ts`

### Customer Routes (`/api/customer/*`)
- [ ] **Orders** - `app/api/customer/orders/route.ts`
- [ ] **Order by ID** - `app/api/customer/orders/[orderId]/route.ts`
- [ ] **Orders by Session** - `app/api/customer/orders/by-session/route.ts`
- [ ] **Create Order** - `app/api/customer/orders/create/route.ts`
- [ ] **Total Revenue** - `app/api/customer/orders/total-revenue/route.ts`
- [ ] **Profile** - `app/api/customer/profile/route.ts`

### Subscription Routes (`/api/subscriptions/*`)
- [ ] **Current Subscription** - `app/api/subscriptions/current/route.ts`
- [ ] **Portal Link** - `app/api/subscriptions/portal-link/route.ts`
- [ ] **Trial Eligibility** - `app/api/subscriptions/trial-eligibility/route.ts`

### User Routes (`/api/users/*`)
- [ ] **Users** - `app/api/users/route.ts`
- [ ] **Customers Count** - `app/api/users/customers-count/route.ts`
- [ ] **Delete Account** - `app/api/users/delete-account/route.ts`
- [ ] **Export Data** - `app/api/users/export-data/route.ts`
- [ ] **Object to Processing** - `app/api/users/object-to-processing/route.ts`

### Shared/Public Routes (`/api/shared/*`, `/api/*`)
- [ ] **Contact Messages** - `app/api/shared/contact-messages/route.ts`
- [ ] **Emails** - `app/api/shared/emails/route.ts`
- [ ] **Upload** - `app/api/shared/upload/route.ts`
- [ ] **CSRF Token** - `app/api/csrf/route.ts`

### Health & Monitoring Routes
- [ ] **Health Check** - `app/api/health/route.ts`
- [ ] **Error Monitoring** - `app/api/health/error-monitoring/route.ts`
- [ ] **Live** - `app/api/live/route.ts`
- [ ] **Ready** - `app/api/ready/route.ts`
- [ ] **Metrics** - `app/api/metrics/route.ts`

## ✅ Business Logic Services

### Email Service
- [ ] **Resend Email Service** - `shared/services/email/resend.ts` (email sending, templates, order confirmations)

### Storage Service
- [ ] **Cloudflare R2 Storage** - `shared/services/storage/r2.ts` (file upload, download, signed URLs)
- [ ] **Storage Index** - `shared/services/storage/index.ts`

### Firebase Services
- [ ] **Stripe Payments** - `shared/services/firebase/stripe-payments.ts`
- [ ] **Subscription Helpers** - `shared/services/firebase/subscription-helpers.ts`
- [ ] **Firebase Sync** - `shared/services/firebase/sync.ts`
- [ ] **Firebase Config** - `shared/services/firebase/config.ts`

### Observability
- [ ] **Metrics Service** - `shared/services/observability/metrics.ts` (Prometheus metrics)
- [ ] **Firebase Logging** - `shared/services/observability/firebase-logging.ts`

### Feature Services
- [ ] **Calculator Service** - `features/calculator/services/calculator-service.ts`
- [ ] **Usage Service** - `features/calculator/services/usage-service.ts`
- [ ] **Payment Service** - `features/payments/services/payment-service.ts`
- [ ] **Stripe Checkout** - `features/payments/services/stripe-checkout.ts`

### API Utilities
- [ ] **Safe Fetch** - `shared/services/api/safe-fetch.ts` (external API calls with retry)
- [ ] **Authenticated Fetch** - `shared/services/api/authenticated-fetch.ts`
- [ ] **Timezone Service** - `shared/services/timezone/TimeService.ts`

## ✅ Shared Utilities

### Configuration
- [ ] **Environment Utils** - `shared/utils/config/envUtil.ts`
- [ ] **CORS Constants** - `shared/utils/config/cors-constants.ts`
- [ ] **Config Index** - `shared/utils/config/index.ts`
- [ ] **Mock Config** - `shared/utils/config/mock.ts`

### Validation
- [ ] **API Validation** - `shared/utils/validation/api-validation.ts`
- [ ] **Auth Validation** - `shared/utils/validation/auth-validation.ts`
- [ ] **Checkout Validation** - `shared/utils/validation/checkout-validation.ts`
- [ ] **Contact Validation** - `shared/utils/validation/contact-validation.ts`
- [ ] **Data Validation** - `shared/utils/validation/data-validation.ts`
- [ ] **File Validation** - `shared/utils/validation/file-validation.ts`
- [ ] **Search Validation** - `shared/utils/validation/search-validation.ts`
- [ ] **Calculator Validation** - `features/calculator/types/calculator-validation.ts`

### Error Handling
- [ ] **API Error Wrapper** - `shared/utils/error-handling/api-error-wrapper.ts`
- [ ] **Auth Error Handler** - `shared/utils/error-handling/auth-error-handler.ts`
- [ ] **Global Error Handler** - `shared/utils/error-handling/global-error-handler.ts`

### Helpers
- [ ] **Date Helpers** - `shared/utils/helpers/date.ts`
- [ ] **Order Helpers** - `shared/utils/helpers/order-helpers.ts`
- [ ] **Pagination** - `shared/utils/helpers/pagination.ts`
- [ ] **Utils** - `shared/utils/helpers/utils.ts`

### Permissions
- [ ] **Calculator Permissions** - `shared/utils/permissions/calculator-permissions.ts`
- [ ] **Core Feature Permissions** - `shared/utils/permissions/core-feature-permissions.ts`

### System Utilities
- [ ] **System Logger** - `shared/utils/system/system-logger.ts`
- [ ] **Prisma Introspection** - `shared/utils/system/prisma-introspection.ts`
- [ ] **App Initialization** - `shared/utils/system/app-initialization.ts`
- [ ] **Debug Utils** - `shared/utils/debug/debug.ts`
- [ ] **Debug Index** - `shared/utils/debug/index.ts`

### API Utilities
- [ ] **Response Helpers** - `shared/utils/api/response-helpers.ts`
- [ ] **Add Timezone Header** - `shared/utils/api/add-timezone-header.ts`
- [ ] **Stripe Map Loader** - `shared/utils/stripe-map-loader.ts`

### Type Guards
- [ ] **Subscription Type Guards** - `shared/utils/type-guards/subscription-type-guards.ts`

## ✅ Type Definitions

### Shared Types
- [ ] **API Types** - `shared/types/api.types.ts`
- [ ] **Type Index** - `shared/types/index.ts`

### Feature Types
- [ ] **Auth Types** - `features/auth/types/auth.types.ts`
- [ ] **Calculator Types** - `features/calculator/types/calculator.types.ts`
- [ ] **Customer Types** - `features/customers/types/customer.types.ts`
- [ ] **Order Types** - `features/orders/types/order.types.ts`
- [ ] **Payment Types** - `features/payments/types/payment.types.ts`
- [ ] **Subscription Types** - `features/subscriptions/types/subscription.types.ts`

## ✅ Constants

### Application Constants
- [ ] **App Constants** - `shared/constants/app.constants.ts` (if exists)
- [ ] **Rate Limit Config** - `shared/constants/rate-limit.config.ts` (if exists)
- [ ] **Calculator Constants** - `features/calculator/constants/calculator.constants.ts`

## ✅ Scripts & Tools

### Database Scripts
- [ ] **DB Reset & Migrate** - `scripts/db-reset-and-migrate.sh`
- [ ] **GDPR Data Purge** - `scripts/gdpr-data-purge.ts`
- [ ] **Load Test** - `scripts/load-test.js`

## ✅ Configuration Files

### Environment & Build
- [ ] **Environment Variables** - `.env.example` (backend-specific vars)
- [ ] **TypeScript Config** - `tsconfig.json` (adjust for backend)
- [ ] **Package Dependencies** - `package.json` (backend dependencies only)

### Docker & Deployment
- [ ] **Dockerfile** - `Dockerfile` (backend-specific)
- [ ] **Docker Compose** - `docker-compose.yml` (backend services)

## ✅ Testing Infrastructure

### Test Setup
- [ ] **Test Helpers** - `__tests__/helpers/` (backend test utilities)
- [ ] **Integration Tests** - `__tests__/integration/` (API route tests)
- [ ] **Test Setup** - `__tests__/setup/` (test configuration)

## 📋 Migration Notes

### Critical Dependencies
- Firebase Admin SDK
- Prisma ORM
- Redis (ioredis)
- Resend (email)
- AWS SDK (S3/R2)
- prom-client (metrics)
- zod (validation)
- crypto (Node.js built-in)

### Environment Variables Required
- `DATABASE_URL`
- `REDIS_URL`
- `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`
- `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `RESEND_REPLY_TO_EMAIL`
- `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `R2_PUBLIC_URL`
- `CSRF_SECRET`
- `ENCRYPTION_KEY`
- `METRICS_ENABLED`
- `CORS_ALLOWED_ORIGINS`

### Architecture Changes
1. **Remove Next.js dependencies** - Convert from Next.js API routes to Express/Fastify routes
2. **Adjust imports** - Change `@/` aliases to backend structure
3. **Remove Edge Runtime** - All code runs in Node.js runtime
4. **Separate CORS handling** - Backend handles all CORS (no middleware.ts split)
5. **Consolidate security** - All security middleware in one place
6. **Update response format** - Use standard HTTP responses instead of NextResponse

### DO NOT Migrate (Frontend-Only)
- React components (`shared/components/`, `features/*/components/`)
- Client hooks (`shared/hooks/`, `features/*/hooks/`)
- UI providers (`shared/providers/`)
- Client contexts (`shared/contexts/`)
- Page routes (`app/(customer)/`, `app/(public)/`, `app/admin/`)
- Client-side utilities (`shared/utils/helpers/utils.ts` - only client parts)
- Web Vitals client code
- i18n client code
- SEO metadata generators (server-side rendering specific)

---

**Total Items to Migrate:** ~150+ files/components
**Estimated Effort:** High - requires careful refactoring and testing
**Priority:** Complete infrastructure first, then API routes, then business logic
