# Code Structure & Organization - Core Architecture

## Overview

Feature-based organization with clear separation between business domains (features), shared utilities, and application routes.

**Organization Principles:**
- Feature modules (self-contained business logic)
- Shared components and utilities (reusable across features)
- Next.js App Router for routing
- Co-location of related code
- Clear naming conventions

---

## Table of Contents

1. [Project Structure](#project-structure)
2. [Directory Organization](#directory-organization)
3. [Component Architecture](#component-architecture)
4. [File Naming Conventions](#file-naming-conventions)
5. [Import Patterns](#import-patterns)
6. [Best Practices](#best-practices)

---

## Project Structure

### High-Level Overview

```
project/
├── app/                    # Next.js routes (presentation layer)
│   ├── (public)/          # Public routes (landing, pricing)
│   ├── (customer)/        # Customer routes (account, calculator)
│   ├── admin/             # Admin routes (dashboard, users)
│   └── api/               # API routes (organized by feature)
│
├── features/              # Feature modules (domain logic)
│   ├── account/           # Account management (profile, usage, subscriptions)
│   ├── admin/             # Admin components (dashboard, customers, orders)
│   ├── auth/              # Authentication feature
│   ├── calculator/        # Calculator feature
│   ├── contact/           # Contact form feature
│   ├── customers/         # Customer types
│   ├── faq/               # FAQ feature
│   ├── orders/            # Order types
│   ├── payments/          # Payment feature
│   └── subscriptions/     # Subscription feature
│
├── shared/                # Shared/reusable code
│   ├── components/        # Shared UI components
│   ├── utils/             # Utility functions
│   ├── services/          # Shared services (DB, Firebase, etc.)
│   ├── middleware/        # Route protection, security
│   └── constants/         # App-wide constants
│
├── infrastructure/        # Infrastructure code
│   └── database/          # Prisma schema, migrations
│
└── public/                # Static assets
```

---

## Directory Organization

### App Directory (Routes)

```
app/
├── (public)/              # Public route group (no auth required)
│   ├── page.tsx           # Landing page
│   ├── pricing/           # Pricing page
│   ├── contact/           # Contact page
│   ├── faq/               # FAQ page
│   ├── about/             # About page
│   ├── features/          # Features page
│   ├── privacy/           # Privacy policy
│   ├── terms/             # Terms of service
│   ├── cookies/           # Cookie policy
│   ├── accessibility/     # Accessibility statement (WCAG 2.1 AA)
│   ├── api-documentation/ # REST API reference
│   └── support/           # Support center (getting started, FAQ, troubleshooting)
│
├── (customer)/            # Customer route group (auth required)
│   ├── (main)/            # Main customer layout
│   │   ├── account/       # Account management
│   │   ├── calculator/    # Calculator interface
│   │   ├── checkout/       # Checkout flow
│   │   └── payment/       # Payment success pages
│   └── (auth)/            # Auth pages
│       ├── sign-in/       # Sign in page
│       └── sign-up/       # Sign up page
│
├── admin/                 # Admin section (admin auth required)
│   ├── contactmessages/   # Contact message management
│   ├── customers/         # Customer management
│   ├── dashboard/         # Admin dashboard
│   ├── developer/         # Developer tools
│   ├── orders/            # Order management
│   ├── settings/          # Admin settings
│   └── subscriptions/      # Subscription management
│
└── api/                   # API routes (organized by domain)
    ├── admin/             # Admin APIs (analytics, customers, orders, subscriptions)
    ├── analytics/         # Analytics APIs (web vitals, form completion)
    ├── calculator/        # Calculator APIs (calculate, usage, history, export)
    ├── customer/          # Customer APIs (profile, orders)
    ├── public/            # Public APIs (system info)
    ├── shared/            # Shared APIs (contact messages, emails, upload)
    ├── subscriptions/     # Subscription APIs (checkout, portal, current)
    └── users/             # User APIs (customers count, delete account)
```

### Features Directory (Business Logic)

```
features/
├── account/               # Account management feature
│   └── components/        # Profile editor, usage dashboard, subscription management
│
├── admin/                 # Admin feature components
│   └── components/        # Dashboard, customers, orders, subscriptions
│
├── auth/                  # Authentication feature
│   ├── components/        # Auth guard, user button
│   ├── hooks/             # use-authenticated-fetch
│   ├── services/          # Firebase middleware
│   └── types/             # Auth types
│
├── calculator/            # Calculator feature
│   ├── components/        # Calculator components (mortgage, loan, investment, retirement)
│   ├── constants/         # Calculator constants
│   ├── hooks/             # use-calculator hook
│   ├── services/          # Calculator service
│   └── types/             # Calculator types and validation
│
├── contact/               # Contact feature
│   └── components/        # Contact form, thank you dialog
│
├── customers/              # Customer types
│   └── types/             # Customer type definitions
│
├── faq/                   # FAQ feature
│   ├── components/        # FAQ accordion, search, categories
│   └── data/              # FAQ data
│
├── orders/                # Order types
│   └── types/             # Order type definitions
│
├── payments/              # Payment feature
│   ├── components/        # Checkout, success components
│   ├── services/          # Stripe integration, payment service
│   └── types/             # Payment types
│
└── subscriptions/         # Subscription feature
    ├── components/        # Subscription UI components
    ├── hooks/             # use-subscription hook
    └── types/             # Subscription types
```

### Shared Directory (Reusable Code)

```
shared/
├── components/            # Shared UI components
│   ├── analytics/         # Web vitals reporter
│   ├── custom-ui/         # Custom UI components (empty state, error alert)
│   ├── forms/             # Form components
│   ├── layout/            # Layout components (navbar, footer, error boundary)
│   ├── marketing/         # Marketing components (structured data, cookie consent banner)
│   ├── navigation/        # Navigation components (breadcrumb)
│   ├── saas/              # SaaS-specific components (pricing, usage meter)
│   └── ui/                # Base UI (shadcn/ui components)
│
├── constants/             # App-wide constants
│   ├── app.constants.ts
│   ├── order.constants.ts
│   ├── rate-limit.config.ts
│   ├── stripe.constants.ts
│   └── subscription.constants.ts
│
├── contexts/              # React contexts
│   └── app-context.tsx     # App-wide context (auth, profile)
│
├── hooks/                 # Shared React hooks
│   ├── use-mobile.ts
│   ├── use-paginated-data.ts
│   └── use-swr-fetcher.ts
│
├── i18n/                  # Internationalization
│   ├── config.ts
│   └── navigation.ts
│
├── middleware/            # Protection middleware
│   └── api-route-protection.ts
│
├── providers/             # React providers
│   └── swr-provider.tsx   # SWR configuration provider
│
├── services/              # Shared services
│   ├── api/               # API services (authenticated-fetch, safe-fetch)
│   ├── csrf/              # CSRF protection
│   ├── db/                # Database (Prisma, Redis, performance monitor)
│   ├── email/             # Email service (Resend)
│   ├── firebase/          # Firebase config & admin
│   ├── observability/     # Logging and monitoring
│   ├── rate-limit/        # Rate limiting (uses request-identity for keys)
│   ├── request-identity/ # IP resolution, security IP, IP blocking, token→UID (not rate-limit logic)
│   ├── seo/               # SEO services (metadata, structured data)
│   ├── session/           # Session management
│   ├── storage/           # Storage services (R2)
│   └── timezone/           # Timezone service
│
├── types/                 # Shared TypeScript types
│   ├── api.types.ts
│   └── index.ts
│
└── utils/                 # Utility functions
    ├── api/               # API helpers (response formatting, timezone headers)
    ├── config/            # Configuration utilities
    ├── debug/             # Debug logging
    ├── error-handling/     # Error handling utilities
    ├── helpers/           # General helpers
    ├── permissions/        # Permission utilities
    ├── security/          # Security utilities (PII sanitization)
    ├── system/            # System utilities
    ├── type-guards/        # Type guard functions
    └── validation/        # Zod schemas and validation
```

---

## Component Architecture

### Server vs Client Components

**Server Components (default):**
- Data fetching
- Database queries
- Server-side logic
- No interactivity

```typescript
// app/admin/users/page.tsx
export default async function UsersPage() {
  // Server-side data fetching
  const users = await prisma.user.findMany();
  
  return <UsersView users={users} />;
}
```

**Client Components:**
- Interactivity (useState, useEffect)
- Event handlers
- Browser APIs
- Third-party libraries (charts, etc.)

```typescript
// features/admin/components/users/users-view.tsx
'use client'

import { useState } from 'react'

export function UsersView({ users }) {
  const [search, setSearch] = useState('')
  // Interactive logic
}
```

### Component Organization

```
features/[feature]/components/
├── [feature]-interface.tsx    # Main interactive component
├── [feature]-form.tsx         # Form component
├── [feature]-list.tsx         # List component
├── [feature]-detail.tsx       # Detail view
└── [feature]-[action].tsx     # Action-specific components (e.g., order-form.tsx)
```

**Note:** Some features also have:
- `hooks/` - Feature-specific hooks (e.g., `use-calculator.ts`)
- `services/` - Feature-specific services (e.g., `calculator-service.ts`)
- `types/` - Feature-specific types (e.g., `calculator.types.ts`)
- `constants/` - Feature-specific constants (e.g., `calculator.constants.ts`)

### Props Pattern

```typescript
// Define props interface
interface ComponentProps {
  required: string
  optional?: number
  children?: React.ReactNode
}

export function Component({ required, optional = 10, children }: ComponentProps) {
  return <div>...</div>
}
```

---

## File Naming Conventions

### Files

- **Components:** `kebab-case.tsx` (e.g., `user-profile.tsx`)
- **Hooks:** `use-kebab-case.ts` (e.g., `use-calculator.ts`)
- **Utils:** `kebab-case.ts` (e.g., `date-helpers.ts`)
- **Types:** `feature.types.ts` (e.g., `calculator.types.ts`)
- **Next.js files:** `page.tsx`, `layout.tsx`, `route.ts`, `loading.tsx`, `error.tsx`

### Components/Functions

- **Components:** `PascalCase` (e.g., `UserProfile`)
- **Functions:** `camelCase` (e.g., `calculateTotal`)
- **Constants:** `UPPER_SNAKE_CASE` (e.g., `MAX_RETRIES`)
- **Types/Interfaces:** `PascalCase` (e.g., `UserProfile`, `CalculatorInput`)

---

## Import Patterns

### Import Order

```typescript
// 1. External packages
import { useState, useEffect } from 'react'
import { NextRequest, NextResponse } from 'next/server'

// 2. Features (domain logic)
import { requireAuth } from '@/features/auth/services/firebase-middleware'
import { CalculatorService } from '@/features/calculator/services/calculator-service'

// 3. Shared (reusable code)
import { Button } from '@/shared/components/ui/button'
import { debugLog } from '@/shared/utils/debug'
import prisma from '@/shared/services/db/prisma'

// 4. Types
import type { User } from '@/shared/types'
import type { CalculatorInput } from '@/features/calculator/types/calculator.types'

// 5. Relative imports (avoid when possible)
import { helperFunction } from './helper'
```

### Path Aliases

```typescript
// tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./"]
    }
  }
}

// Usage
import { Button } from '@/shared/components/ui/button'  // ✅
import { Button } from '../../../shared/components/ui/button'  // ❌
```

---

## Best Practices

### Feature Isolation

- ✅ Features are self-contained (no cross-feature imports)
- ✅ Shared code only for truly reusable logic
- ✅ Clear feature boundaries

### Co-location

- ✅ Related code lives together
- ✅ Component-specific types near component
- ✅ Feature logic in feature directory

### Naming

- ✅ Descriptive, unambiguous names
- ✅ Consistent conventions (kebab-case for files)
- ✅ Avoid abbreviations unless widely understood

### Organization

- ✅ Small, focused files (<500 lines)
- ✅ Single responsibility per module
- ✅ Clear separation of concerns (UI vs logic)

---

## Related Documentation

- [API Architecture](./api.md) - API routes and protection
- [Authentication](./authentication.md) - Auth patterns
- [Database](./database.md) - Database patterns

---

*Last Updated: January 2026*
