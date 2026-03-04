# Frontend Mirroring Research Plan

This plan outlines the research and analysis needed to create a mirrored frontend implementation where the frontend folder becomes a standalone client-side equivalent of the project folder's frontend functionality.

## Current State Analysis

### Tech Stack Comparison
- **Project (Next.js)**: Full-stack with server-side rendering, next-intl for i18n, app router structure
- **Frontend (Vite + TanStack Router)**: Client-side only, react-i18next for i18n, file-based routing

### Key Structural Differences
1. **Entry Points**: 
   - Project: `app/page.tsx` (Next.js App Router)
   - Frontend: `src/routes/index.tsx` (TanStack Router)
2. **Internationalization**:
   - Project: `next-intl` with server-side translations
   - Frontend: `react-i18next` with client-side translations
3. **Routing**:
   - Project: Next.js App Router with nested layouts
   - Frontend: TanStack Router with file-based routing

## Research Tasks

### 1. Page Structure Mapping
**Objective**: Identify all client-side pages in project and map to frontend equivalents

**Research Steps**:
- Catalog all pages in `project/app/(customer)/(main)` (account, calculator, checkout, payment)
- Catalog all pages in `project/app/(public)` (about, accessibility, api-documentation, contact, cookies, faq, features, pricing, privacy, support, terms)
- Catalog admin pages in `project/app/admin`
- Identify which pages are purely client-side vs server-side rendered
- Map existing frontend routes to project pages
- Identify missing pages in frontend

### 2. Component Architecture Analysis
**Objective**: Understand component sharing and differences

**Research Steps**:
- Compare `project/shared/components` vs `frontend/src/shared/components`
- Identify missing components in frontend
- Analyze component dependencies and imports
- Check for Next.js-specific components that need adaptation
- Identify components that use server-side features

### 3. Feature Module Mapping
**Objective**: Map feature-based organization between folders

**Research Steps**:
- Analyze `project/features/` structure (account, auth, calculator, contact, customers, faq, orders, payments)
- Identify equivalent functionality in frontend routes
- Determine which features are client-side only
- Map feature-specific components and hooks

### 4. Internationalization Migration
**Objective**: Plan i18n system alignment

**Research Steps**:
- Analyze `project/translations/` structure
- Compare translation keys usage between project and frontend
- Identify missing translations in frontend
- Plan translation key synchronization strategy

### 5. Dependencies and Services Analysis
**Objective**: Ensure service compatibility

**Research Steps**:
- Compare API service layers between project and frontend
- Identify Firebase/Stripe integration differences
- Analyze state management (React Query) setup differences
- Check for Next.js-specific dependencies that need alternatives

### 6. Build and Configuration Comparison
**Objective**: Align build systems and configurations

**Research Steps**:
- Compare Tailwind configurations
- Analyze TypeScript configurations
- Compare ESLint/Prettier setups
- Identify environment variable differences

## Client-Side Classification Criteria

**Clearly Client-Side**:
- Interactive calculators
- User account management
- Shopping cart/checkout
- Admin dashboards
- Form submissions

**Clearly Server-Side**:
- API routes
- Server components
- Database operations
- Authentication middleware

**Hybrid (Need Analysis)**:
- Page layouts (partially server-rendered)
- SEO pages (need client-side hydration)
- Static marketing pages

## Expected Outcomes

1. **Complete page mapping matrix** showing which project pages exist in frontend
2. **Component inventory** with missing components identified
3. **Migration checklist** for each missing piece
4. **Dependency alignment plan** for tech stack differences
5. **Implementation priority** based on client-side functionality importance

## Next Steps After Research

1. Create implementation plan for missing pages
2. Plan component migration/adaptation strategy
3. Design i18n synchronization process
4. Establish service layer compatibility
5. Create testing strategy for mirrored functionality
