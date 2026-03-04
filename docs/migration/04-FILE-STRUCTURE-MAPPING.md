# File Structure Mapping

## Current Structure Comparison

### Project Structure
```
project/
├── app/                    # Next.js pages + API routes
│   ├── (customer)/        # Customer routes (auth, main)
│   ├── (public)/          # Public routes
│   ├── admin/             # Admin routes
│   ├── api/               # 44+ API routes
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── features/              # Feature modules (10 features)
├── shared/                # Shared code
│   ├── components/
│   ├── constants/
│   ├── contexts/
│   ├── hooks/
│   ├── i18n/
│   ├── lib/
│   ├── middleware/
│   ├── providers/
│   ├── services/
│   ├── types/
│   └── utils/
├── infrastructure/        # Database, configs
├── middleware.ts
├── scripts/
└── translations/
```

### Frontend Structure
```
frontend/
└── src/
    ├── components/        # ⚠️ Should be shared/components/
    ├── constants/         # ⚠️ Should be shared/constants/
    ├── contexts/          # ⚠️ Should be shared/contexts/
    ├── features/          # ✓ Correct
    ├── hooks/             # ⚠️ Should be shared/hooks/
    ├── lib/               # ⚠️ Should be shared/lib/
    ├── providers/         # ⚠️ Should be shared/providers/
    ├── services/          # ⚠️ Should be shared/services/
    ├── styles/            # ✓ Correct (replaces app/globals.css)
    ├── translations/      # ✓ Correct
    ├── types/             # ⚠️ Should be shared/types/
    ├── utils/             # ⚠️ Should be shared/utils/
    ├── App.tsx            # ✓ Correct (replaces app/layout.tsx)
    └── main.tsx           # ✓ Correct (entry point)
```

---

## Proposed Reorganization

### Target Frontend Structure
```
frontend/
└── src/
    ├── features/          # Feature modules (keep as-is)
    ├── shared/            # NEW: Shared code
    │   ├── components/    # Move from src/components/
    │   ├── constants/     # Move from src/constants/
    │   ├── contexts/      # Move from src/contexts/
    │   ├── hooks/         # Move from src/hooks/
    │   ├── i18n/          # NEW: i18n config
    │   ├── lib/           # Move from src/lib/
    │   ├── providers/     # Move from src/providers/
    │   ├── services/      # Move from src/services/
    │   ├── types/         # Move from src/types/
    │   └── utils/         # Move from src/utils/
    ├── styles/            # Keep as-is
    ├── translations/      # Keep as-is
    ├── App.tsx            # Keep as-is
    └── main.tsx           # Keep as-is
```

---

## Component Count Comparison

### Shared Components

| Category | Project | Frontend | Status |
|----------|---------|----------|--------|
| UI Components | 42 files | 43 files | ✓ Match (+1 extra) |
| Custom UI | 4 files | 4 files | ✓ Match |
| Layout | 7 files | 7 files | ✓ Match |
| Forms | 1 file | 1 file | ✓ Match |
| Analytics | 1 file | 1 file | ✓ Match |
| Marketing | 2 files | 2 files | ✓ Match |
| Navigation | 1 file | 1 file | ✓ Match |
| SaaS | 5 files | 5 files | ✓ Match |
| Other | 1 file | 3 files | ⚠️ +2 extra |

**Extra files in frontend:**
- `SimpleCalculator.tsx` (should be in features/calculator)
- `SimpleContactForm.tsx` (should be in features/contact)

---

## Feature Count Comparison

| Feature | Project Files | Frontend Files | Status |
|---------|---------------|----------------|--------|
| account | 5 | 5 | ✓ Match |
| admin | 15 | 15 | ✓ Match |
| auth | 5 | 5 | ✓ Match |
| calculator | 13 | 13 | ✓ Match |
| contact | 4 | 4 | ✓ Match |
| customers | 1 | 1 | ✓ Match |
| faq | 6 | 6 | ✓ Match |
| orders | 1 | 1 | ✓ Match |
| payments | 10 | 10 | ✓ Match |
| subscriptions | 5 | 5 | ✓ Match |

**Total:** 65 files each ✓

---

## Route Mapping

### Authentication Routes
| Next.js Route | React Router Route | Status |
|---------------|-------------------|--------|
| `/sign-in` | `/sign-in` | ? |
| `/sign-up` | `/sign-up` | ? |

### Customer Routes
| Next.js Route | React Router Route | Status |
|---------------|-------------------|--------|
| `/account` | `/account` | ? |
| `/calculator` | `/calculator` | ? |
| `/checkout` | `/checkout` | ? |
| `/payment` | `/payment` | ? |
| `/payment/success` | `/payment/success` | ? |
| `/payment/cancel` | `/payment/cancel` | ? |

### Public Routes
| Next.js Route | React Router Route | Status |
|---------------|-------------------|--------|
| `/` | `/` | ? |
| `/about` | `/about` | ? |
| `/accessibility` | `/accessibility` | ? |
| `/api-documentation` | `/api-documentation` | ? |
| `/contact` | `/contact` | ? |
| `/cookies` | `/cookies` | ? |
| `/faq` | `/faq` | ? |
| `/features` | `/features` | ? |
| `/pricing` | `/pricing` | ? |
| `/privacy` | `/privacy` | ? |
| `/support` | `/support` | ? |
| `/terms` | `/terms` | ? |

### Admin Routes
| Next.js Route | React Router Route | Status |
|---------------|-------------------|--------|
| `/admin/dashboard` | `/admin/dashboard` | ? |
| `/admin/contactmessages` | `/admin/contactmessages` | ? |
| `/admin/customers` | `/admin/customers` | ? |
| `/admin/developer` | `/admin/developer` | ? |
| `/admin/orders` | `/admin/orders` | ? |
| `/admin/settings` | `/admin/settings` | ? |
| `/admin/subscriptions` | `/admin/subscriptions` | ? |

**Total Routes:** 27 routes to verify

---

## Import Path Migration

### Before (Current Frontend)
```typescript
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"
import { api } from "@/lib/api"
```

### After (Proposed)
```typescript
import { Button } from "@/shared/components/ui/button"
import { useAuth } from "@/shared/hooks/use-auth"
import { api } from "@/shared/lib/api"
```

### tsconfig.json Update
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@/shared/*": ["./src/shared/*"],
      "@/features/*": ["./src/features/*"]
    }
  }
}
```

---

## Files to Move

### Phase 1: Create shared/ directory
```bash
mkdir -p src/shared
```

### Phase 2: Move directories
```bash
mv src/components src/shared/
mv src/constants src/shared/
mv src/contexts src/shared/
mv src/hooks src/shared/
mv src/lib src/shared/
mv src/providers src/shared/
mv src/services src/shared/
mv src/types src/shared/
mv src/utils src/shared/
```

### Phase 3: Create i18n directory
```bash
mkdir -p src/shared/i18n
# Move i18n configuration files here
```

### Phase 4: Update all imports
Run automated script to update import paths

---

## Summary

### File Counts
- ✓ Components: Match (with 2 extras to relocate)
- ✓ Features: Perfect match (65 files each)
- ⚠️ Structure: Needs reorganization
- ? Routes: Need to verify all 27 routes exist

### Action Items
1. Reorganize to shared/ structure
2. Update tsconfig.json paths
3. Run import path migration script
4. Move SimpleCalculator and SimpleContactForm to features
5. Verify all 27 routes are implemented
6. Update all import statements
