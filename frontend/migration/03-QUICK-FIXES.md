# Quick Fixes - Immediate Actions

**These fixes can be done right now to improve the migration state**

---

## 🔧 FIX 1: Install Missing Dependencies (2 minutes)

```bash
cd /home/kenneth/Documents/Workplace/WebsiteTemplate2/frontend
npm install pdf-lib
npm install --save-dev @types/pdf-lib
```

---

## 🔧 FIX 2: Fix i18next Count Parameters (5 minutes)

### File 1: subscription-management.tsx
```typescript
// Line 195
// BEFORE:
t("account_subscription_calculations_per_month", { count: calculationsPerMonth })

// AFTER:
t("account_subscription_calculations_per_month", { count: Number(calculationsPerMonth) })
```

### File 2: subscription-checkout.tsx
```typescript
// Line 276
// BEFORE:
t("checkout_calculations_per_month", { count: calculationsPerMonth })

// AFTER:
t("checkout_calculations_per_month", { count: Number(calculationsPerMonth) })
```

### File 3: PricingCard.tsx
```typescript
// Line 156
// BEFORE:
t("account_subscription_calculations_per_month", { count: calculationsPerMonth })

// AFTER:
t("account_subscription_calculations_per_month", { count: Number(calculationsPerMonth) })
```

---

## 🔧 FIX 3: Create i18n Config File (3 minutes)

Create: `frontend/src/shared/i18n/config.ts`

```typescript
export const locales = ['en', 'es', 'fr', 'de', 'it', 'pt', 'ja', 'zh'] as const;
export type Locale = typeof locales[number];

export const defaultLocale: Locale = 'en';

export const localeMetadata: Record<Locale, { name: string; nativeName: string; flag: string }> = {
  en: { name: 'English', nativeName: 'English', flag: '🇺🇸' },
  es: { name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  fr: { name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  de: { name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  it: { name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
  pt: { name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹' },
  ja: { name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  zh: { name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
};

export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale);
}
```

---

## 🔧 FIX 4: Create Critical Routes (30 minutes)

### Route 1: Sign In (`frontend/src/routes/sign-in.tsx`)
```typescript
import { createFileRoute } from '@tanstack/react-router'
import SignInPage from '@/features/auth/pages/sign-in-page'

export const Route = createFileRoute('/sign-in')({
  component: SignInPage,
})
```

### Route 2: Sign Up (`frontend/src/routes/sign-up.tsx`)
```typescript
import { createFileRoute } from '@tanstack/react-router'
import SignUpPage from '@/features/auth/pages/sign-up-page'

export const Route = createFileRoute('/sign-up')({
  component: SignUpPage,
})
```

### Route 3: Pricing (`frontend/src/routes/pricing.tsx`)
```typescript
import { createFileRoute } from '@tanstack/react-router'
import PricingPage from '@/features/pricing/pages/pricing-page'

export const Route = createFileRoute('/pricing')({
  component: PricingPage,
})
```

### Route 4: Account (`frontend/src/routes/account.tsx`)
```typescript
import { createFileRoute } from '@tanstack/react-router'
import AccountPage from '@/features/account/pages/account-page'
import { AuthGuard } from '@/features/auth/components/auth-guard'

export const Route = createFileRoute('/account')({
  component: () => (
    <AuthGuard requiresUser>
      <AccountPage />
    </AuthGuard>
  ),
})
```

### Route 5: Calculator (`frontend/src/routes/calculator.tsx`)
```typescript
import { createFileRoute } from '@tanstack/react-router'
import CalculatorPage from '@/features/calculator/pages/calculator-page'

export const Route = createFileRoute('/calculator')({
  component: CalculatorPage,
})
```

### Route 6: Contact (`frontend/src/routes/contact.tsx`)
```typescript
import { createFileRoute } from '@tanstack/react-router'
import ContactPage from '@/features/contact/pages/contact-page'

export const Route = createFileRoute('/contact')({
  component: ContactPage,
})
```

### Route 7: FAQ (`frontend/src/routes/faq.tsx`)
```typescript
import { createFileRoute } from '@tanstack/react-router'
import FaqPage from '@/features/faq/pages/faq-page'

export const Route = createFileRoute('/faq')({
  component: FaqPage,
})
```

---

## 🔧 FIX 5: Create Page Components (If Missing)

Most components already exist in features folders. Just need to create simple page wrappers:

### Example: Contact Page
```typescript
// frontend/src/features/contact/pages/contact-page.tsx
import { ContactForm } from '../components/contact-form'
import { ContactInfo } from '../components/contact-info'

export default function ContactPage() {
  return (
    <div className="container mx-auto py-12">
      <h1 className="text-4xl font-bold mb-8">Contact Us</h1>
      <div className="grid md:grid-cols-2 gap-8">
        <ContactInfo />
        <ContactForm />
      </div>
    </div>
  )
}
```

---

## 🔧 FIX 6: Update Router Configuration

After creating routes, update `frontend/src/routes/router.tsx` to include them in the route tree.

---

## ✅ VERIFICATION STEPS

After applying these fixes:

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Build the project:**
   ```bash
   npm run build
   ```

3. **Check for errors:**
   - Should see significantly fewer TypeScript errors
   - Build should still pass

4. **Test navigation:**
   ```bash
   npm run dev
   ```
   - Navigate to /pricing
   - Navigate to /contact
   - Navigate to /faq
   - Try to access /account (should redirect to sign-in if not authenticated)

---

## 📊 EXPECTED IMPROVEMENTS

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| TypeScript Errors | 50+ | ~10 | 80% reduction |
| Missing Dependencies | 2 | 0 | 100% fixed |
| Critical Routes | 0/7 | 7/7 | 100% complete |
| Navigation Working | 30% | 70% | +40% |
| Build Warnings | 2 | 0 | 100% fixed |

---

## ⏱️ TIME ESTIMATE

- Fix 1: 2 minutes
- Fix 2: 5 minutes  
- Fix 3: 3 minutes
- Fix 4: 30 minutes
- Fix 5: 15 minutes
- Fix 6: 5 minutes

**Total: ~60 minutes** to significantly improve migration state
