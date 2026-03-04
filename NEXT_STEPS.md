# Next Steps to Complete the Migration

This document outlines the remaining steps to complete the Next.js → Vite + Hono migration.

## ✅ What's Already Done

### Backend (Hono)
- ✅ Hono server setup with middleware (CORS, security headers, logging)
- ✅ Auth middleware (Firebase Admin SDK)
- ✅ CSRF protection middleware
- ✅ Rate limiting middleware
- ✅ API routes: customer, calculator, health, admin, analytics, users, subscriptions, public, CSRF
- ✅ Services: Prisma, Firebase Admin, email, storage, rate limiting
- ✅ Infrastructure: Prisma schema and migrations
- ✅ Configuration and utilities

### Frontend (Vite + React)
- ✅ Vite configuration with TanStack Router plugin
- ✅ TypeScript configuration
- ✅ Tailwind CSS 4 setup
- ✅ Package.json with all dependencies
- ✅ i18next configuration for internationalization
- ✅ Theme provider (dark/light mode)
- ✅ Auth provider (Firebase client SDK)
- ✅ Firebase client configuration
- ✅ Root route (`__root.tsx`)
- ✅ Basic home page route (`index.tsx`)
- ✅ Environment variable types
- ✅ Global styles
- ✅ ESLint and Prettier configuration

## 🔨 What Needs to Be Done

### 1. Install Dependencies

```bash
# Frontend
cd frontend
bun install

# Backend (if not already done)
cd ../backend
bun install
```

### 2. Copy Static Assets

```bash
# From project root
cp -r project/public/* frontend/public/
cp project/app/favicon.ico frontend/public/
```

### 3. Copy Client-Side Code from Next.js Project

The following directories contain **client-side code** that can be copied with minimal changes:

```bash
# From project root

# Copy features (all client-side)
cp -r project/features frontend/src/

# Copy shared components
cp -r project/shared/components frontend/src/shared/

# Copy shared hooks
cp -r project/shared/hooks frontend/src/shared/

# Copy shared contexts
cp -r project/shared/contexts frontend/src/shared/

# Copy shared constants
cp -r project/shared/constants frontend/src/shared/

# Copy shared lib (client-side utilities)
cp -r project/shared/lib frontend/src/shared/

# Copy shared types
cp -r project/shared/types frontend/src/shared/

# Copy client-side utils
mkdir -p frontend/src/shared/utils
cp -r project/shared/utils/validation frontend/src/shared/utils/
cp -r project/shared/utils/formatting frontend/src/shared/utils/
cp -r project/shared/utils/permissions frontend/src/shared/utils/

# Copy translations
cp -r project/translations/* frontend/src/translations/
```

**Important:** Do NOT copy these server-only directories to frontend:
- `project/shared/services/db/` (Prisma - backend only)
- `project/shared/services/email/` (Resend - backend only)
- `project/shared/services/firebase/admin.ts` (Firebase Admin - backend only)
- `project/shared/middleware/` (API middleware - already in backend)
- `project/shared/utils/config/envUtil.ts` (server env - backend only)

### 4. Convert Next.js Pages to TanStack Router Routes

For each page in `project/app/`, create a corresponding route in `frontend/src/routes/`:

#### Public Pages (from `project/app/(public)/`)
- `pricing/page.tsx` → `frontend/src/routes/pricing.tsx`
- `faq/page.tsx` → `frontend/src/routes/faq.tsx`
- `contact/page.tsx` → `frontend/src/routes/contact.tsx`
- `about/page.tsx` → `frontend/src/routes/about.tsx`
- `terms/page.tsx` → `frontend/src/routes/terms.tsx`
- `privacy/page.tsx` → `frontend/src/routes/privacy.tsx`

#### Authenticated Pages (from `project/app/(customer)/`)
Create `frontend/src/routes/_auth/` directory and add:
- `calculator/page.tsx` → `frontend/src/routes/_auth/calculator.tsx`
- `account/page.tsx` → `frontend/src/routes/_auth/account.tsx`
- `checkout/page.tsx` → `frontend/src/routes/_auth/checkout.tsx`
- `usage/page.tsx` → `frontend/src/routes/_auth/usage.tsx`
- `orders/page.tsx` → `frontend/src/routes/_auth/orders.tsx`

#### Admin Pages (from `project/app/admin/`)
Create `frontend/src/routes/admin/` directory and add:
- `dashboard/page.tsx` → `frontend/src/routes/admin/dashboard.tsx`
- `customers/page.tsx` → `frontend/src/routes/admin/customers.tsx`
- `orders/page.tsx` → `frontend/src/routes/admin/orders.tsx`
- `subscriptions/page.tsx` → `frontend/src/routes/admin/subscriptions.tsx`
- `contact/page.tsx` → `frontend/src/routes/admin/contact.tsx`

#### Auth Pages
- `login/page.tsx` → `frontend/src/routes/login.tsx`
- `signup/page.tsx` → `frontend/src/routes/signup.tsx`
- `reset-password/page.tsx` → `frontend/src/routes/reset-password.tsx`

### 5. Update Imports in Copied Code

After copying code, you'll need to update some imports:

#### Replace Next.js-specific imports:

```typescript
// Images
// Before:
import Image from 'next/image';
// After:
// Just use <img> tags

// Links
// Before:
import Link from 'next/link';
import { useRouter } from 'next/navigation';
// After:
import { Link, useNavigate } from '@tanstack/react-router';

// i18n
// Before:
import { useTranslations } from 'next-intl';
const t = useTranslations('namespace');
// After:
import { useTranslation } from 'react-i18next';
const { t } = useTranslation();
// Usage: t('namespace.key') instead of t('key')
```

#### Update API calls:
API calls should work as-is since Vite proxies `/api/*` to the backend. No changes needed.

### 6. Create Auth Route Guard

Create `frontend/src/routes/_auth.tsx` for protected routes:

```typescript
import { createFileRoute, redirect, Outlet } from '@tanstack/react-router';
import { useAuth } from '@/providers/auth-provider';

export const Route = createFileRoute('/_auth')({
  beforeLoad: async () => {
    const auth = useAuth();
    if (!auth.user) {
      throw redirect({ to: '/login' });
    }
  },
  component: () => <Outlet />,
});
```

### 7. Set Up Environment Variables

#### Frontend `.env`:
```bash
cd frontend
cp .env.example .env
```

Edit `frontend/.env` with:
- `VITE_API_URL=http://localhost:3001`
- Firebase configuration (from project/.env)
- Stripe publishable key

#### Backend `.env`:
```bash
cd backend
# Copy from existing project
cp ../project/.env .env
```

Verify all environment variables are set correctly.

### 8. Generate Route Tree

After creating all route files:

```bash
cd frontend
bun run dev
```

This will generate `src/routeTree.gen.ts` automatically.

### 9. Test the Application

#### Start both servers:

```bash
# Terminal 1 - Backend
cd backend
bun run dev

# Terminal 2 - Frontend
cd frontend
bun run dev
```

#### Test checklist:
- [ ] Home page loads at http://localhost:3000
- [ ] Navigation works between pages
- [ ] Authentication flow (signup/login/logout)
- [ ] Protected routes redirect to login
- [ ] API calls work (check network tab)
- [ ] Dark/light theme toggle works
- [ ] Forms submit correctly
- [ ] i18n translations display

### 10. Fix Any Import Errors

After copying code, you may encounter import errors. Common fixes:

1. **Update path aliases**: Change `@/` imports to match the new structure
2. **Remove server-only imports**: Remove any imports from server-only code
3. **Update component imports**: Ensure UI components are imported from the correct paths
4. **Fix type imports**: Update type imports to match new locations

### 11. Build and Deploy

#### Frontend build:
```bash
cd frontend
bun run build
# Output: frontend/dist/
```

#### Backend build:
```bash
cd backend
bun run build
# Output: backend/dist/
```

## 📝 Migration Checklist

- [ ] Install dependencies (frontend + backend)
- [ ] Copy static assets to frontend/public/
- [ ] Copy client-side code (features, shared, translations)
- [ ] Convert all Next.js pages to TanStack Router routes
- [ ] Create auth route guard (_auth.tsx)
- [ ] Update imports (remove Next.js-specific imports)
- [ ] Set up environment variables
- [ ] Test authentication flow
- [ ] Test all pages and routes
- [ ] Test API integration
- [ ] Fix any TypeScript errors
- [ ] Test build process
- [ ] Deploy frontend to CDN
- [ ] Deploy backend to container platform

## 🚀 Deployment

### Frontend (Cloudflare Pages)
1. Connect GitHub repo
2. Set build command: `cd frontend && bun run build`
3. Set output directory: `frontend/dist`
4. Add environment variables

### Backend (Railway)
1. Connect GitHub repo
2. Set root directory: `backend`
3. Add environment variables
4. Deploy

## 📚 Resources

- [MIGRATION_GUIDE.md](MIGRATION_GUIDE.md) - Detailed migration guide
- [frontend/README.md](frontend/README.md) - Frontend documentation
- [TanStack Router Docs](https://tanstack.com/router)
- [Hono Docs](https://hono.dev/)
- [i18next Docs](https://www.i18next.com/)

## 🆘 Getting Help

If you encounter issues:

1. Check the [MIGRATION_GUIDE.md](MIGRATION_GUIDE.md) troubleshooting section
2. Verify environment variables are set correctly
3. Check that both frontend and backend servers are running
4. Inspect browser console and network tab for errors
5. Check backend logs for API errors

## 🎯 Success Criteria

The migration is complete when:

1. ✅ All pages from Next.js project are converted to TanStack Router routes
2. ✅ Authentication works (signup, login, logout, protected routes)
3. ✅ All API calls work correctly
4. ✅ No TypeScript errors
5. ✅ Frontend builds successfully
6. ✅ Backend builds successfully
7. ✅ Application works in production deployment

Good luck with the migration! 🚀
