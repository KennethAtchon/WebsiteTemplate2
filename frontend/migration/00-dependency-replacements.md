# Next.js Dependency Replacements for Vite + React Router Migration

## Overview
This document maps Next.js-specific dependencies to their Vite/React Router equivalents for the frontend migration.

## Dependencies to Remove

### 1. Next.js Core (REMOVE)
- `next` - Framework itself
- `@next/bundle-analyzer` - Already replaced with vite bundle analyzer

### 2. Next.js Internationalization (REMOVE)
- `next-intl` - Next.js i18n library

## Replacement Mapping

### Navigation & Routing
| Next.js | Replacement | Status |
|---------|-------------|--------|
| `next/link` | `@tanstack/react-router` Link component | ✅ Already installed |
| `next/navigation` (useRouter, usePathname, etc.) | `@tanstack/react-router` hooks | ✅ Already installed |
| `next/headers` | Standard Request/Response APIs | N/A (server-only) |

### Image Optimization
| Next.js | Replacement | Status |
|---------|-------------|--------|
| `next/image` | Standard `<img>` tag with lazy loading | ✅ Native browser support |
| | OR `react-lazy-load-image-component` | Optional enhancement |

### Internationalization (i18n)
| Next.js | Replacement | Status |
|---------|-------------|--------|
| `next-intl` | `i18next` + `react-i18next` | ✅ Already installed |
| | `i18next-browser-languagedetector` | ✅ Already installed |

### Metadata & SEO
| Next.js | Replacement | Status |
|---------|-------------|--------|
| `next/head` or `generateMetadata` | `react-helmet-async` | ✅ Already installed |

### Theming
| Next.js | Replacement | Status |
|---------|-------------|--------|
| `next-themes` | Keep as-is (framework agnostic) | ✅ Already installed |

### Fonts
| Next.js | Replacement | Status |
|---------|-------------|--------|
| `next/font` | `@fontsource/*` packages | ✅ Already installed |

## Import Pattern Replacements

### 1. Link Component
```tsx
// Before (Next.js)
import Link from 'next/link'
<Link href="/about">About</Link>

// After (React Router)
import { Link } from '@tanstack/react-router'
<Link to="/about">About</Link>
```

### 2. Navigation Hooks
```tsx
// Before (Next.js)
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
const router = useRouter()
router.push('/dashboard')
const pathname = usePathname()

// After (React Router)
import { useNavigate, useLocation, useSearch } from '@tanstack/react-router'
const navigate = useNavigate()
navigate({ to: '/dashboard' })
const location = useLocation()
const pathname = location.pathname
```

### 3. Images
```tsx
// Before (Next.js)
import Image from 'next/image'
<Image src="/logo.png" alt="Logo" width={100} height={100} />

// After (Standard HTML)
<img src="/logo.png" alt="Logo" width={100} height={100} loading="lazy" />
```

### 4. Internationalization
```tsx
// Before (Next.js)
import { useTranslations } from 'next-intl'
const t = useTranslations('namespace')

// After (i18next)
import { useTranslation } from 'react-i18next'
const { t } = useTranslation('namespace')
```

### 5. Metadata
```tsx
// Before (Next.js)
export const metadata = {
  title: 'Page Title',
  description: 'Page description'
}

// After (React Helmet)
import { Helmet } from 'react-helmet-async'
<Helmet>
  <title>Page Title</title>
  <meta name="description" content="Page description" />
</Helmet>
```

## Server-Only APIs to Remove

These Next.js APIs are server-only and should be removed from client code:
- `cookies()` from `next/headers`
- `headers()` from `next/headers`
- `redirect()` from `next/navigation` (server-side)
- `notFound()` from `next/navigation`
- Any `generateMetadata`, `generateStaticParams`, etc.

## Package.json Changes Required

### Remove
```json
{
  "dependencies": {
    // Remove if present (not currently in package.json)
  },
  "devDependencies": {
    "@next/bundle-analyzer": "^16.1.6"  // Remove - using vite analyzer
  }
}
```

### Keep (Already Correct)
All current dependencies in `frontend/package.json` are compatible with Vite + React Router setup.

## Migration Checklist

- [ ] Remove `@next/bundle-analyzer` from devDependencies
- [ ] Replace all `next/link` imports with `@tanstack/react-router`
- [ ] Replace all `next/navigation` imports with `@tanstack/react-router`
- [ ] Replace all `next/image` imports with standard `<img>` tags
- [ ] Replace all `next-intl` imports with `react-i18next`
- [ ] Replace metadata exports with `react-helmet-async`
- [ ] Remove server-only API usage
- [ ] Update path references from `href` to `to` for Link components
- [ ] Test all navigation flows
- [ ] Test all i18n functionality

## Notes

1. **next-themes**: This package is framework-agnostic and works perfectly with Vite. No replacement needed.

2. **Bundle Analysis**: Use `ANALYZE=true bun run build` which is already configured in package.json scripts.

3. **Environment Variables**: 
   - Next.js: `process.env.NEXT_PUBLIC_*`
   - Vite: `import.meta.env.VITE_*`

4. **Public Assets**:
   - Next.js: `/public/image.png` → `/image.png`
   - Vite: `/public/image.png` → `/image.png` (same)

5. **API Routes**: Next.js API routes (`/app/api/*`) should be migrated to the backend Express server.
