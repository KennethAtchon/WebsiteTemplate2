# Missing Routes - Detailed Comparison

**Comparison:** `project/app/` vs `frontend/src/routes/`

---

## 📁 MISSING PUBLIC ROUTES (11 routes)

### 1. `/about` - About Page
**Source:** `project/app/(public)/about/page.tsx`  
**Status:** ❌ NOT CREATED  
**Priority:** HIGH  
**Components Needed:** AboutPage component  
**Route File:** `frontend/src/routes/about.tsx`

### 2. `/accessibility` - Accessibility Statement
**Source:** `project/app/(public)/accessibility/page.tsx`  
**Status:** ❌ NOT CREATED  
**Priority:** MEDIUM  
**Components Needed:** AccessibilityPage component  
**Route File:** `frontend/src/routes/accessibility.tsx`

### 3. `/api-documentation` - API Documentation
**Source:** `project/app/(public)/api-documentation/page.tsx`  
**Status:** ❌ NOT CREATED  
**Priority:** MEDIUM  
**Components Needed:** ApiDocsPage component  
**Route File:** `frontend/src/routes/api-documentation.tsx`

### 4. `/contact` - Contact Page
**Source:** `project/app/(public)/contact/page.tsx`  
**Status:** ❌ NOT CREATED  
**Priority:** HIGH  
**Components Needed:** ContactPage component (components exist in `features/contact/`)  
**Route File:** `frontend/src/routes/contact.tsx`

### 5. `/cookies` - Cookie Policy
**Source:** `project/app/(public)/cookies/page.tsx`  
**Status:** ❌ NOT CREATED  
**Priority:** HIGH (linked in footer)  
**Components Needed:** CookiesPage component  
**Route File:** `frontend/src/routes/cookies.tsx`

### 6. `/faq` - FAQ Page
**Source:** `project/app/(public)/faq/page.tsx`  
**Status:** ❌ NOT CREATED  
**Priority:** HIGH (linked in footer)  
**Components Needed:** FaqPage component (components exist in `features/faq/`)  
**Route File:** `frontend/src/routes/faq.tsx`

### 7. `/features` - Features Page
**Source:** `project/app/(public)/features/page.tsx`  
**Status:** ❌ NOT CREATED  
**Priority:** HIGH  
**Components Needed:** FeaturesPage component  
**Route File:** `frontend/src/routes/features.tsx`

### 8. `/pricing` - Pricing Page
**Source:** `project/app/(public)/pricing/page.tsx`  
**Status:** ❌ NOT CREATED  
**Priority:** CRITICAL (heavily linked throughout app)  
**Components Needed:** PricingPage component (PricingCard exists)  
**Route File:** `frontend/src/routes/pricing.tsx`

### 9. `/privacy` - Privacy Policy
**Source:** `project/app/(public)/privacy/page.tsx`  
**Status:** ❌ NOT CREATED  
**Priority:** HIGH (linked in footer)  
**Components Needed:** PrivacyPage component  
**Route File:** `frontend/src/routes/privacy.tsx`

### 10. `/support` - Support Page
**Source:** `project/app/(public)/support/page.tsx`  
**Status:** ❌ NOT CREATED  
**Priority:** MEDIUM  
**Components Needed:** SupportPage component  
**Route File:** `frontend/src/routes/support.tsx`

### 11. `/terms` - Terms of Service
**Source:** `project/app/(public)/terms/page.tsx`  
**Status:** ❌ NOT CREATED  
**Priority:** HIGH (linked in footer)  
**Components Needed:** TermsPage component  
**Route File:** `frontend/src/routes/terms.tsx`

---

## 🔐 MISSING CUSTOMER/AUTH ROUTES (8 routes)

### 1. `/sign-in` - Sign In Page
**Source:** `project/app/(customer)/(auth)/sign-in/page.tsx`  
**Status:** ❌ NOT CREATED  
**Priority:** CRITICAL  
**Components Needed:** SignInPage component (auth components exist)  
**Route File:** `frontend/src/routes/sign-in.tsx`

### 2. `/sign-up` - Sign Up Page
**Source:** `project/app/(customer)/(auth)/sign-up/page.tsx`  
**Status:** ❌ NOT CREATED  
**Priority:** CRITICAL  
**Components Needed:** SignUpPage component (auth components exist)  
**Route File:** `frontend/src/routes/sign-up.tsx`

### 3. `/account` - Account Dashboard
**Source:** `project/app/(customer)/(main)/account/page.tsx`  
**Status:** ❌ NOT CREATED  
**Priority:** CRITICAL  
**Components Needed:** AccountPage component (account components exist)  
**Route File:** `frontend/src/routes/account.tsx`

### 4. `/calculator` - Calculator Page
**Source:** `project/app/(customer)/(main)/calculator/page.tsx`  
**Status:** ❌ NOT CREATED  
**Priority:** CRITICAL (core feature)  
**Components Needed:** CalculatorPage component (calculator components exist)  
**Route File:** `frontend/src/routes/calculator.tsx`

### 5. `/checkout` - Checkout Page
**Source:** `project/app/(customer)/(main)/checkout/page.tsx`  
**Status:** ❌ NOT CREATED  
**Priority:** CRITICAL  
**Components Needed:** CheckoutPage component (checkout components exist)  
**Route File:** `frontend/src/routes/checkout.tsx`

### 6. `/payment` - Payment Processing Page
**Source:** `project/app/(customer)/(main)/payment/page.tsx`  
**Status:** ❌ NOT CREATED  
**Priority:** CRITICAL  
**Components Needed:** PaymentPage component  
**Route File:** `frontend/src/routes/payment/index.tsx`

### 7. `/payment/success` - Payment Success Page
**Source:** `project/app/(customer)/(main)/payment/success/page.tsx`  
**Status:** ❌ NOT CREATED  
**Priority:** CRITICAL  
**Components Needed:** PaymentSuccessPage (success components exist)  
**Route File:** `frontend/src/routes/payment/success.tsx`

### 8. `/payment/cancel` - Payment Cancel Page
**Source:** `project/app/(customer)/(main)/payment/cancel/page.tsx`  
**Status:** ❌ NOT CREATED  
**Priority:** HIGH  
**Components Needed:** PaymentCancelPage component  
**Route File:** `frontend/src/routes/payment/cancel.tsx`

---

## ✅ EXISTING ADMIN ROUTES (8 routes)

### Created Routes:
1. ✅ `/admin` - Admin index
2. ✅ `/admin/dashboard` - Admin dashboard
3. ✅ `/admin/contactmessages` - Contact messages management
4. ✅ `/admin/customers` - Customer management
5. ✅ `/admin/orders` - Order management
6. ✅ `/admin/subscriptions` - Subscription management
7. ✅ `/admin/developer` - Developer tools
8. ✅ `/admin/settings` - Admin settings

---

## 📊 ROUTE CREATION SUMMARY

| Category | Total Routes | Created | Missing | % Complete |
|----------|-------------|---------|---------|------------|
| Public Routes | 11 | 0 | 11 | 0% |
| Auth Routes | 2 | 0 | 2 | 0% |
| Customer Routes | 6 | 0 | 6 | 0% |
| Admin Routes | 8 | 8 | 0 | 100% |
| **TOTAL** | **27** | **8** | **19** | **30%** |

---

## 🎯 PRIORITY ORDER FOR ROUTE CREATION

### Phase 1: Critical Routes (Must Have)
1. `/sign-in` - Authentication required
2. `/sign-up` - User registration
3. `/pricing` - Heavily linked throughout app
4. `/account` - User dashboard
5. `/calculator` - Core feature
6. `/payment/success` - Payment flow completion

### Phase 2: High Priority Routes
7. `/checkout` - Payment flow
8. `/payment` - Payment processing
9. `/contact` - User communication
10. `/faq` - User support
11. `/cookies` - Legal compliance
12. `/privacy` - Legal compliance
13. `/terms` - Legal compliance
14. `/features` - Product information

### Phase 3: Medium Priority Routes
15. `/payment/cancel` - Payment flow
16. `/about` - Company information
17. `/support` - User support
18. `/accessibility` - Accessibility statement
19. `/api-documentation` - Developer resources

---

## 📝 ROUTE CREATION TEMPLATE

Each route file should follow this structure:

```typescript
import { createFileRoute } from '@tanstack/react-router'
import { ComponentName } from '@/features/[feature]/components/[component]'

export const Route = createFileRoute('/route-path')({
  component: ComponentName,
})
```

For routes requiring authentication:
```typescript
export const Route = createFileRoute('/route-path')({
  component: ComponentName,
  beforeLoad: ({ context }) => {
    // Add auth checks if needed
  },
})
```

---

## 🔗 EXISTING COMPONENTS TO USE

### Contact Route
- `ContactForm` - `features/contact/components/contact-form.tsx`
- `ContactInfo` - `features/contact/components/contact-info.tsx`

### FAQ Route
- `FaqPageClient` - `features/faq/components/faq-page-client.tsx`
- `FaqHero` - `features/faq/components/faq-hero.tsx`

### Calculator Route
- `MortgageCalculator` - `features/calculator/components/mortgage-calculator.tsx`
- `LoanCalculator` - `features/calculator/components/loan-calculator.tsx`
- `InvestmentCalculator` - `features/calculator/components/investment-calculator.tsx`
- `RetirementCalculator` - `features/calculator/components/retirement-calculator.tsx`

### Account Route
- `ProfileEditor` - `features/account/components/profile-editor.tsx`
- `SubscriptionManagement` - `features/account/components/subscription-management.tsx`
- `UsageDashboard` - `features/account/components/usage-dashboard.tsx`
- `OrderDetailModal` - `features/account/components/order-detail-modal.tsx`

### Checkout Route
- `SubscriptionCheckout` - `features/payments/components/checkout/subscription-checkout.tsx`
- `OrderCheckout` - `features/payments/components/checkout/order-checkout.tsx`

### Payment Success Route
- `OrderSuccess` - `features/payments/components/success/order-success.tsx`
- `SubscriptionSuccess` - `features/payments/components/success/subscription-success.tsx`
- `OrderConfirmation` - `features/payments/components/success/order-confirmation.tsx`
- `OrderCreator` - `features/payments/components/success/order-creator.tsx`

### Pricing Route
- `PricingCard` - `shared/components/saas/PricingCard.tsx`

---

## ⚠️ NOTES

1. All routes need to be registered in the router configuration
2. Route types will be auto-generated after routes are created
3. This will fix all the TypeScript route type errors
4. Each route should include proper SEO metadata using `react-helmet-async`
5. Protected routes need AuthGuard wrapper or beforeLoad checks
