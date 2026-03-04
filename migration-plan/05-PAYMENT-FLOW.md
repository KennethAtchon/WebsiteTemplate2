# Payment Flow Gaps

## Current State

The payment integration is **non-functional**. The `/payment` page is a UI placeholder with no actual Stripe implementation.

### What the Payment Page Currently Shows

`frontend/src/routes/payment/index.tsx` (lines 83–89):
```tsx
<div className="rounded-lg border-2 border-dashed bg-muted/30 p-12 text-center">
  <Sparkles className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
  <p className="mb-2 font-medium">{t('common_payment_processing')}</p>
  <p className="text-sm text-muted-foreground">
    {t('common_payment_form_will_be_integrated_here_with_stripe_elements')}
  </p>
</div>
```

This is literally a "coming soon" placeholder. No Stripe Elements, no payment form, no checkout initiation.

---

## The Two Payment Flows That Need to Work

### Flow A: Stripe Checkout (Redirect-based)
Used for one-time purchases (orders). The user is redirected to Stripe-hosted checkout.

1. User selects a product → clicks "Buy"
2. Frontend calls backend: `POST /api/customer/orders/create`
3. Backend creates a Stripe Checkout Session, returns `{ url: string }`
4. Frontend redirects user to the Stripe-hosted URL
5. Stripe redirects back to `/payment/success?session_id=...`
6. Backend webhook (`payment_intent.succeeded` / `checkout.session.completed`) creates the Order record in DB

### Flow B: Stripe Elements (Embedded form)
Used if the current `/payment` page is meant to embed a Stripe form directly (not redirect).

1. Frontend calls backend to create a `PaymentIntent`
2. Backend returns `{ clientSecret: string }`
3. Frontend renders Stripe Elements with the client secret
4. User fills card details → Stripe confirms payment client-side
5. On success, frontend redirects to `/payment/success`
6. Backend webhook finalizes the order

**Clarification needed:** Decide which flow the `/payment` route uses. Given there's already `/checkout` → Stripe redirect logic in the feature module, `/payment` may be intended as the embedded Elements flow. Look at `project/app/payment/page.tsx` in the original to understand the intent.

---

## Original Project Payment Implementation

The original `project/features/payments/` had:
- `stripe-checkout.ts` — Creates Firestore checkout session (Firebase Cloud Functions approach)
- The Cloud Function would then create the Stripe session and write back the URL

**Problem with the Firebase Cloud Functions approach:**
- The Cloud Functions code is **not in this repository**
- There is no `functions/` directory anywhere in the project
- The frontend currently waits up to 30 seconds for the Cloud Function to respond to a Firestore doc
- If Cloud Functions aren't deployed, this entire flow silently times out

---

## What Needs to Be Built / Fixed

### 1. Backend: Stripe Checkout Session Endpoint

The backend needs an endpoint to create a Stripe Checkout Session for one-time orders:

```
POST /api/checkout/create
Body: { priceId: string, quantity?: number }
Returns: { url: string }  (Stripe hosted checkout URL)
```

Check if this already exists in `backend/src/routes/api/customer/` — the `orders/create` route may already handle this. If so, document the exact endpoint and update the frontend to call it.

### 2. Backend: Stripe Webhook Handler

**Critical gap.** There is no webhook handler visible in `backend/src/routes/api/` for:
- `checkout.session.completed` — triggered when a Stripe Checkout session is paid
- `payment_intent.succeeded` — triggered when a payment intent succeeds
- `invoice.payment_succeeded` — triggered for subscription renewals
- `customer.subscription.deleted` — triggered on subscription cancellation

Without webhooks:
- Orders are never created in the database after payment
- Subscriptions are not updated when they renew or cancel
- Data will be permanently out of sync with Stripe

**Fix:** Create `backend/src/routes/api/webhooks/stripe.ts` with proper Stripe webhook signature verification and event handling.

### 3. Frontend: Payment Page Implementation

Replace the placeholder in `frontend/src/routes/payment/index.tsx` with actual implementation.

**Option A (Stripe Redirect — simpler):** Remove `/payment` route entirely if checkout is handled by Stripe's hosted page. The flow is: `/checkout` → Stripe hosted → `/payment/success`.

**Option B (Stripe Elements — embedded):**
1. On page load, call backend to create a PaymentIntent
2. Render `<Elements>` from `@stripe/react-stripe-js`
3. Render `<PaymentElement />` inside the Elements wrapper
4. Handle form submission and confirmation

Install required packages if not present:
```bash
bun add @stripe/stripe-js @stripe/react-stripe-js
```

### 4. Frontend: Payment Success Page

`frontend/src/routes/payment/success.tsx` needs to:
1. Read `session_id` from URL search params
2. Call backend to verify payment and fetch order details
3. Display order confirmation with order number, items, total
4. Clear cart state

### 5. Frontend: Payment Cancel Page

`frontend/src/routes/payment/cancel.tsx` needs to:
1. Show a clear "Payment cancelled" message
2. Offer a "Try again" button that returns to checkout
3. Preserve cart state so user doesn't have to re-add items

### 6. Subscription Payment Flow

The subscription checkout flow (`/checkout` → subscription) is handled via `feature/payments/services/stripe-checkout.ts`. This currently uses the Firebase Cloud Functions approach. It needs to be updated to call the backend directly:

```
POST /api/subscriptions/checkout
Body: { priceId: string }
Returns: { url: string }
```

The backend already has `/api/subscriptions/portal-link` — a similar checkout session creation endpoint likely needs to be added.

---

## Stripe Environment Variables

Verify these are set correctly in both environments:

**Frontend** (public key only — safe to expose):
```
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_... (or pk_test_...)
```

**Backend** (secret keys — never expose):
```
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

Check that the frontend is NOT importing `STRIPE_SECRET_KEY` anywhere. The secret key must only ever exist in the backend.

---

## Summary of Gaps

| Gap | Severity | Notes |
|---|---|---|
| Payment page is a placeholder | Critical | Must implement Stripe Elements or redirect flow |
| No Stripe webhook handler in backend | Critical | Orders/subscriptions never finalized without this |
| Firebase Cloud Functions not in repo | Critical | Current checkout flow won't work without them |
| Payment success page incomplete | High | No order confirmation displayed |
| Subscription checkout needs backend endpoint | High | Cannot subscribe without backend creating session |
| Stripe packages may not be installed in frontend | Medium | Check `frontend/package.json` for `@stripe/stripe-js` |
