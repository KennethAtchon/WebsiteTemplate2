# Architectural Differences: Project vs Frontend

## Framework Comparison

### Project Folder (Next.js)
- **Framework:** Next.js 16.0.11
- **Routing:** App Router (file-based)
- **Rendering:** SSR/SSG/ISR built-in
- **API Routes:** Built-in (`app/api/`)
- **i18n:** next-intl 4.5.8
- **Build:** Next.js with Turbopack

### Frontend Folder (Vite + React)
- **Framework:** Vite 6.0.11 + React 19.2.1
- **Routing:** @tanstack/react-router 1.103.3
- **Rendering:** Client-side only
- **API Routes:** None (requires separate backend)
- **i18n:** i18next 23.0.0 + react-i18next 15.3.3
- **Build:** Vite

## Key Architectural Implications

### 1. Backend Requirement (CRITICAL)
**Project:** Self-contained with 44+ API routes in `app/api/`
**Frontend:** Requires separate backend API server

**Impact:** Frontend CANNOT function without backend API deployment

### 2. Routing Paradigm
**Project:** File-based routing with layouts
```
app/
├── (customer)/(auth)/sign-in/page.tsx
├── (public)/about/page.tsx
└── admin/dashboard/page.tsx
```

**Frontend:** Code-based routing
```typescript
// Routes defined in App.tsx or router config
```

### 3. Server-Side Features
**Project has:**
- Middleware (security headers, CORS)
- API routes (database access, business logic)
- Server components
- Server actions

**Frontend has:**
- None of the above
- All logic must be client-side or via API calls

### 4. Import Path Strategy
**Project:**
```typescript
"@/*": ["./*"]                    // Root
"@/shared/*": ["./shared/*"]      // Shared code
"@/features/*": ["./features/*"]  // Features
"@/infrastructure/*": ["./infrastructure/*"]
```

**Frontend:**
```typescript
"@/*": ["./src/*"]  // Everything from src/
```

## Compatibility Matrix

| Feature | Project | Frontend | Compatible? |
|---------|---------|----------|-------------|
| Components | ✓ | ✓ | ✓ Yes |
| Features | ✓ | ✓ | ✓ Yes |
| Utilities | ✓ | ✓ | ✓ Yes |
| Services | ✓ | ✓ | ⚠️ Partial (no DB) |
| API Routes | ✓ | ✗ | ✗ No |
| Middleware | ✓ | ✗ | ✗ No |
| Database | ✓ | ✗ | ✗ No |
| SSR/SSG | ✓ | ✗ | ✗ No |

## Decision Points

### 1. Backend Strategy
**Options:**
- A) Deploy project folder as backend (recommended)
- B) Create new backend from scratch
- C) Use existing backend service

**Recommendation:** Option A - Deploy project as backend API

### 2. SEO Strategy
**Options:**
- A) Accept client-side only (simpler)
- B) Add Vite SSR plugin (complex)
- C) Use react-helmet-async + pre-rendering (balanced)

**Recommendation:** Option C - Already have react-helmet-async

### 3. Folder Structure
**Options:**
- A) Keep frontend flat structure
- B) Reorganize to match project structure

**Recommendation:** Option B - Better organization and clearer imports
