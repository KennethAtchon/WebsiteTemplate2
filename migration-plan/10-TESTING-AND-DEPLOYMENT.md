# Testing and Deployment

## What Needs to Be Tested Before Launch

This document covers the manual verification steps and deployment configuration required before the migrated app can go live.

---

## Manual Smoke Tests (Do These First)

Once P0 issues are fixed (providers, env vars, Next.js contamination), walk through these flows in order:

### 1. Auth Flow
- [ ] Sign up with email/password → user created in Firebase AND in Postgres DB
- [ ] Sign in with email/password → redirects to `/account`
- [ ] Sign in with Google OAuth → redirects to `/account`
- [ ] Sign out → redirects to `/`
- [ ] Access `/account` without being signed in → redirects to `/sign-in`
- [ ] Access `/admin/dashboard` as non-admin → denied (403 or redirect)
- [ ] Access `/admin/dashboard` as admin → loads dashboard

### 2. Calculator Flow
- [ ] Navigate to `/calculator` while signed in
- [ ] Select "Simple Calculator" — verify it calculates
- [ ] Select "Loan Calculator" — verify it calculates with correct fields
- [ ] Check that usage is tracked (call to `/api/calculator/usage` appears in Network tab)
- [ ] Save a calculation — verify it appears in history (`GET /api/calculator/history`)
- [ ] Export a calculation — verify file downloads from `/api/calculator/export`

### 3. Contact Form Flow
- [ ] Navigate to `/contact`
- [ ] Submit the form with valid data
- [ ] Verify `POST /api/shared/contact-messages` returns 200
- [ ] Verify the message appears in `/admin/contactmessages` (after admin page is migrated)
- [ ] Verify confirmation email is sent (check Resend dashboard)

### 4. Subscription Flow
- [ ] Navigate to `/pricing` — verify plans display correctly
- [ ] Click "Subscribe" on a plan — verify checkout flow initiates
- [ ] Complete Stripe test checkout (use card `4242 4242 4242 4242`)
- [ ] Verify redirect to `/payment/success`
- [ ] Verify subscription appears in Postgres DB
- [ ] Verify subscription shows in `/account` (subscription tab)
- [ ] Navigate to `/account` → Manage Subscription → verify Stripe portal opens

### 5. Admin Panel Flow
- [ ] Log in as admin
- [ ] Navigate to `/admin/dashboard` — verify stats load
- [ ] Navigate to `/admin/customers` — verify customer list loads
- [ ] Navigate to `/admin/orders` — verify order list loads, create a test order
- [ ] Navigate to `/admin/subscriptions` — verify subscription list loads
- [ ] Navigate to `/admin/contactmessages` — verify messages load (after migration)
- [ ] Navigate to `/admin/developer` — verify DB schema browser loads (after migration)

### 6. Payment Webhook Test
- [ ] Use Stripe CLI to replay webhook: `stripe trigger checkout.session.completed`
- [ ] Verify backend receives and processes the event
- [ ] Verify Order is created in DB after webhook fires

---

## Automated Test Coverage

### What Currently Exists
Check `backend/tests/` and `frontend/` for existing test files.

### What Should Be Added

**Backend — Integration Tests**
- Auth middleware: `requireAuth` rejects invalid tokens, accepts valid ones
- Admin middleware: `requireAdmin` rejects non-admin users
- Calculator: `POST /api/calculator/calculate` returns correct result for each calculator type
- Orders: `POST /api/customer/orders/create` creates an order in DB
- Webhooks: `POST /api/webhooks/stripe` with valid signature creates order/updates subscription

**Frontend — Component Tests**
- Sign-in form: submits with valid creds, shows error with invalid
- Contact form: validates required fields, shows success state
- Calculator: renders correct fields per calculator type

**End-to-End (Playwright)**
- Full signup → verify email → sign in flow
- Full purchase flow (Stripe test mode)

---

## Deployment Configuration

### Environment Variables

**Frontend** — must be set at build time (Vite inlines them):

```bash
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_BASE_URL=https://yourdomain.com
VITE_APP_ENV=production
```

**Backend** — must be set in the hosting environment (Railway, Fly.io, etc.):

```bash
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=  # Note: include quotes around the full key value
CSRF_SECRET=           # Generate: openssl rand -hex 32
ENCRYPTION_KEY=        # Generate: openssl rand -hex 32
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=hello@yourdomain.com
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
R2_PUBLIC_URL=
CORS_ALLOWED_ORIGINS=https://yourdomain.com
METRICS_SECRET=        # Generate: openssl rand -hex 32
```

---

### Frontend Build and Serve

The frontend is a static SPA built with Vite:

```bash
cd frontend
bun run build       # outputs to frontend/dist/
```

Serve `frontend/dist/` with any static host (Netlify, Vercel static, Cloudflare Pages, nginx, etc.).

**Important:** Configure the host to serve `index.html` for ALL routes (SPA fallback). Without this, direct navigation to `/pricing` or `/account` will return a 404.

**nginx example:**
```nginx
location / {
  root /var/www/frontend/dist;
  try_files $uri $uri/ /index.html;
}
```

---

### Backend Build and Run

The backend runs on Bun:

```bash
cd backend
bun run start       # or bun src/index.ts
```

The backend listens on `PORT` (default 3001 or configured via env).

**Docker:** A `Dockerfile` exists in `backend/`. Build and run:
```bash
docker build -t backend ./backend
docker run -p 3001:3001 --env-file .env backend
```

---

### CORS Configuration

The backend must allow requests from the frontend domain. Set `CORS_ALLOWED_ORIGINS` to the exact frontend URL (no trailing slash):

```bash
# Development
CORS_ALLOWED_ORIGINS=http://localhost:5173

# Production
CORS_ALLOWED_ORIGINS=https://yourdomain.com
```

If the frontend is on a different subdomain than the backend (e.g., `app.yourdomain.com` vs `api.yourdomain.com`), make sure the backend CORS config includes the exact frontend origin.

---

### Stripe Webhook Registration

After deploying the backend, register the webhook endpoint in Stripe Dashboard:

1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://api.yourdomain.com/api/webhooks/stripe`
3. Select events:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Copy the signing secret → set as `STRIPE_WEBHOOK_SECRET` in backend env

For local development, use Stripe CLI:
```bash
stripe listen --forward-to localhost:3001/api/webhooks/stripe
```

---

### Firebase Configuration

Ensure the Firebase project has:
1. **Authentication** enabled with Email/Password and Google providers
2. **Firestore** — if still used for checkout sessions (verify and potentially remove this dependency)
3. **Custom claims** — Firebase Admin SDK must have permission to set custom claims (it does by default with a service account)
4. Service account credentials in `FIREBASE_CLIENT_EMAIL` and `FIREBASE_PRIVATE_KEY`

---

### Database Setup

```bash
cd backend
bunx prisma migrate deploy   # Apply all pending migrations
bunx prisma generate         # Generate Prisma client (if needed)
```

Run this against the production database before deploying the backend.

---

## Pre-Launch Checklist

```
[ ] All P0 issues resolved (see 00-OVERVIEW.md)
[ ] All P1 issues resolved (admin stubs, payment page)
[ ] Manual smoke tests pass for all flows listed above
[ ] Backend environment variables set in production
[ ] Frontend environment variables set at build time
[ ] Frontend dist/ deployed with SPA fallback configured
[ ] Backend deployed and reachable
[ ] CORS configured correctly
[ ] Stripe webhooks registered and STRIPE_WEBHOOK_SECRET set
[ ] Database migrations applied to production DB
[ ] Stripe test checkout verified end-to-end
[ ] project/ directory removed or archived (after migration verified)
```
