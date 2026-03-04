# Migration Guide: Next.js → Vite + Hono

This guide documents the migration from the Next.js full-stack monolith to a split Vite (frontend) + Hono (backend) architecture.

## Architecture Overview

### Before (Next.js Monolith)
```
project/
├── app/              # Next.js App Router (pages + API routes)
├── features/         # Feature modules
├── shared/           # Shared code (client + server)
└── infrastructure/   # Database, Prisma
```

### After (Split Architecture)
```
WebsiteTemplate2/
├── frontend/         # Vite + React SPA
│   ├── src/
│   │   ├── routes/   # TanStack Router routes
│   │   ├── features/ # Feature modules (copied from project/)
│   │   └── shared/   # Client-side shared code
│   └── public/       # Static assets
│
└── backend/          # Hono API on Bun
    └── src/
        ├── routes/   # API routes (converted from project/app/api)
        ├── services/ # Server-only services
        └── middleware/ # Auth, CSRF, rate limiting
```

## What's Been Completed

### ✅ Backend (Hono)
- [x] Hono server setup with CORS, security headers, logging
- [x] Middleware: auth, CSRF, rate limiting
- [x] Routes: customer, calculator, health, admin, analytics, users, subscriptions
- [x] Services: Prisma, Firebase Admin, email, storage, rate limiting
- [x] Infrastructure: Prisma schema and migrations

### ✅ Frontend (Vite + React)
- [x] Vite configuration with TanStack Router plugin
- [x] TypeScript configuration
- [x] Tailwind CSS 4 setup
- [x] i18next for internationalization
- [x] Theme provider (replaces next-themes)
- [x] Auth provider (Firebase client SDK)
- [x] Root route and basic home page
- [x] Environment variable configuration

## Next Steps to Complete Migration

### 1. Copy Static Assets

```bash
# Copy public files from Next.js project to Vite frontend
cp -r project/public/* frontend/public/
cp project/app/favicon.ico frontend/public/
```

### 2. Copy Client-Side Code

The following directories contain client-side code that can be copied **unchanged**:

```bash
# From project root
cp -r project/features frontend/src/
cp -r project/shared/components frontend/src/shared/
cp -r project/shared/hooks frontend/src/shared/
cp -r project/shared/contexts frontend/src/shared/
cp -r project/shared/constants frontend/src/shared/
cp -r project/shared/lib frontend/src/shared/
cp -r project/shared/types frontend/src/shared/
cp -r project/shared/utils/validation frontend/src/shared/utils/
cp -r project/translations frontend/src/
```

**Note:** Some files in `shared/` are server-only and should NOT be copied to frontend:
- `shared/services/db/` (Prisma - backend only)
- `shared/services/email/` (Resend - backend only)
- `shared/services/firebase/admin.ts` (Firebase Admin - backend only)
- `shared/middleware/` (API middleware - already in backend)
- `shared/utils/config/envUtil.ts` (server env - backend only)

### 3. Convert Next.js Pages to TanStack Router Routes

For each page in `project/app/`, create a corresponding route in `frontend/src/routes/`:

#### Example: Public Page

**Before** (`project/app/(public)/pricing/page.tsx`):
```tsx
import { getTranslations } from 'next-intl/server';

export async function generateMetadata() {
  const t = await getTranslations('pricing');
  return {
    title: t('title'),
    description: t('description'),
  };
}

export default function PricingPage() {
  // Component code
}
```

**After** (`frontend/src/routes/pricing.tsx`):
```tsx
import { createFileRoute } from '@tanstack/react-router';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';

export const Route = createFileRoute('/pricing')({
  component: PricingPage,
});

function PricingPage() {
  const { t } = useTranslation();
  
  return (
    <>
      <Helmet>
        <title>{t('pricing.title')} | WebsiteTemplate2</title>
        <meta name="description" content={t('pricing.description')} />
      </Helmet>
      {/* Component code */}
    </>
  );
}
```

#### Example: Authenticated Route

**Before** (`project/app/(customer)/account/page.tsx`):
```tsx
export default function AccountPage() {
  // Component code
}
```

**After** (`frontend/src/routes/_auth/account.tsx`):
```tsx
import { createFileRoute, redirect } from '@tanstack/react-router';
import { useAuth } from '@/providers/auth-provider';

export const Route = createFileRoute('/_auth/account')({
  beforeLoad: ({ context }) => {
    if (!context.auth.user) {
      throw redirect({ to: '/login' });
    }
  },
  component: AccountPage,
});

function AccountPage() {
  const { user } = useAuth();
  // Component code
}
```

### 4. Update API Calls

All API calls in the frontend should use the proxy configured in Vite:

```typescript
// Before (Next.js)
const response = await fetch('/api/customer/profile');

// After (Vite) - same code, proxied to backend
const response = await fetch('/api/customer/profile');
```

The Vite dev server proxies `/api/*` requests to `http://localhost:3001` (backend).

### 5. Replace Next.js-Specific Imports

#### Images
```tsx
// Before
import Image from 'next/image';
<Image src="/logo.png" alt="Logo" width={100} height={100} />

// After
<img src="/logo.png" alt="Logo" className="w-[100px] h-[100px]" />
```

#### Links
```tsx
// Before
import Link from 'next/link';
<Link href="/pricing">Pricing</Link>

// After
import { Link } from '@tanstack/react-router';
<Link to="/pricing">Pricing</Link>
```

#### Fonts
```tsx
// Before (in layout.tsx)
import { Inter, Lora } from 'next/font/google';

// After (in main.tsx)
import '@fontsource/inter/400.css';
import '@fontsource/lora/400.css';
// Already configured in frontend/src/main.tsx
```

### 6. Install Dependencies

```bash
# Frontend
cd frontend
bun install

# Backend (if not already done)
cd ../backend
bun install
```

### 7. Set Up Environment Variables

```bash
# Frontend
cd frontend
cp .env.example .env
# Edit .env with your values

# Backend
cd ../backend
cp ../project/.env .env
# Adjust paths and values as needed
```

### 8. Run Both Services

```bash
# Terminal 1 - Backend
cd backend
bun run dev
# Runs on http://localhost:3001

# Terminal 2 - Frontend
cd frontend
bun run dev
# Runs on http://localhost:3000
```

## Key Differences

### Routing

| Aspect | Next.js | Vite + TanStack Router |
|--------|---------|------------------------|
| **File location** | `app/` | `src/routes/` |
| **Route groups** | `(public)/` | `_public/` (underscore prefix) |
| **Dynamic routes** | `[id]/` | `$id/` |
| **Layouts** | `layout.tsx` | `__root.tsx` or route-level layouts |
| **Loading states** | `loading.tsx` | `pendingComponent` in route config |

### Data Fetching

| Aspect | Next.js | Vite + TanStack Router |
|--------|---------|------------------------|
| **Server data** | `async` components, `fetch` | TanStack Query in `loader` |
| **Client data** | `useEffect` + state | TanStack Query hooks |
| **Caching** | Next.js cache | TanStack Query cache |

### Internationalization

| Aspect | next-intl | i18next |
|--------|-----------|---------|
| **Hook** | `useTranslations('namespace')` | `useTranslation()` |
| **Usage** | `t('key')` | `t('namespace.key')` |
| **Server** | `getTranslations()` | N/A (client-only) |
| **Files** | `translations/en.json` | `src/translations/en.json` |

### SEO

| Aspect | Next.js | Vite + react-helmet-async |
|--------|---------|---------------------------|
| **Meta tags** | `generateMetadata()` | `<Helmet>` component |
| **Sitemap** | `sitemap.ts` | Vite plugin or build script |
| **Robots** | `robots.ts` | Static `public/robots.txt` |

## Testing the Migration

### 1. Verify Backend
```bash
cd backend
bun run dev

# Test health endpoint
curl http://localhost:3001/api/health
```

### 2. Verify Frontend
```bash
cd frontend
bun run dev

# Open http://localhost:3000
# Check that the home page loads
# Check that API calls are proxied to backend
```

### 3. Test Authentication Flow
1. Sign up / sign in
2. Verify Firebase Auth works
3. Check that authenticated routes redirect properly
4. Test logout

### 4. Test API Integration
1. Make API calls from frontend
2. Verify CORS headers
3. Check CSRF token handling
4. Test rate limiting

## Deployment

### Frontend (Static SPA)
Deploy `frontend/dist/` to:
- **Cloudflare Pages**: `bun run build` → deploy `dist/`
- **Vercel**: Connect repo, set root to `frontend/`
- **Netlify**: Same as Vercel
- **AWS S3 + CloudFront**: Upload `dist/` to S3 bucket

### Backend (Hono on Bun)
Deploy `backend/` to:
- **Railway**: Connect repo, set root to `backend/`
- **Fly.io**: Use Dockerfile in `backend/`
- **AWS ECS/Fargate**: Containerize with Docker
- **DigitalOcean App Platform**: Connect repo

## Rollback Plan

If issues arise, the original Next.js project is still in `project/` and can be used:

```bash
cd project
bun run dev
```

Once the migration is verified and stable, you can remove the `project/` directory.

## Performance Improvements

Expected improvements after migration:

1. **Build time**: Vite builds in ~10s vs Next.js ~30-60s
2. **Dev server**: HMR in <50ms vs Next.js ~200-500ms
3. **Bundle size**: Smaller due to tree-shaking and code splitting
4. **Deployment**: Frontend on CDN = instant global delivery
5. **Scalability**: Backend can scale independently of frontend

## Troubleshooting

### Issue: CORS errors
**Solution**: Check `CORS_ALLOWED_ORIGINS` in backend `.env` includes `http://localhost:3000`

### Issue: API calls fail with 404
**Solution**: Verify Vite proxy is configured in `vite.config.ts` and backend is running

### Issue: Firebase Auth not working
**Solution**: Check Firebase config in frontend `.env` matches your Firebase project

### Issue: Translations not loading
**Solution**: Verify `frontend/src/translations/en.json` exists and is imported in `i18n.ts`

### Issue: Routes not found
**Solution**: Run `bun run dev` to generate `routeTree.gen.ts` from route files

## Resources

- [TanStack Router Docs](https://tanstack.com/router)
- [TanStack Query Docs](https://tanstack.com/query)
- [Hono Docs](https://hono.dev/)
- [i18next Docs](https://www.i18next.com/)
- [Vite Docs](https://vitejs.dev/)
