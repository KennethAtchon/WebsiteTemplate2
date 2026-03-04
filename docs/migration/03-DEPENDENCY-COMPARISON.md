# Dependency Comparison

## Missing in Frontend (Should Add)

### Theme Management
```json
"next-themes": "^0.4.6"
```
**Status:** ❌ Missing
**Action:** Add for theme switching functionality

---

## Present in Frontend (Should Remove - Security Risk)

### Backend-Only Dependencies
```json
"stripe": "^20.4.0",        // ⚠️ SECURITY RISK - API keys exposed
"resend": "^6.9.3"          // ⚠️ SECURITY RISK - API keys exposed
```
**Status:** ⚠️ Present but DANGEROUS
**Action:** REMOVE immediately - these should only be in backend

---

## Framework Differences (Expected)

### Project Only (Next.js)
```json
"next": "16.0.11",
"next-intl": "^4.5.8",
"next-rate-limit": "^0.0.3",
"eslint-config-next": "16.1.6"
```

### Frontend Only (Vite + React Router)
```json
"vite": "^6.0.11",
"@vitejs/plugin-react": "^4.3.4",
"@tanstack/react-router": "^1.103.3",
"@tanstack/router-plugin": "^1.103.0",
"@tanstack/router-devtools": "^1.103.3",
"vite-plugin-sitemap": "^0.5.0"
```

---

## i18n Differences

### Project (Next.js)
```json
"next-intl": "^4.5.8"
```

### Frontend (React)
```json
"i18next": "^23.0.0",
"react-i18next": "^15.3.3",
"i18next-browser-languagedetector": "^8.1.0"
```

**Status:** Different approaches, both valid
**Action:** Keep frontend approach, ensure feature parity

---

## Font Loading Differences

### Project
Uses Next.js font optimization (built-in)

### Frontend
```json
"@fontsource/inter": "^5.1.0",
"@fontsource/lora": "^5.1.0"
```

**Status:** Different approaches, both valid
**Action:** Keep frontend approach

---

## SEO Differences

### Project
Uses Next.js built-in metadata API

### Frontend
```json
"react-helmet-async": "^2.0.5"
```

**Status:** Different approaches, both valid
**Action:** Keep frontend approach

---

## Missing Backend Dependencies (Cannot Add)

These are in project but should NOT be in frontend:

```json
"@prisma/client": "^6.19.0",
"prisma": "^6.19.0",
"bcryptjs": "^3.0.3",
"@types/bcryptjs": "^3.0.0",
"formidable": "^3.5.4",
"@types/formidable": "^3.4.6",
"dompurify": "^3.3.0",
"pdf-lib": "^1.17.1",
"prom-client": "^15.1.3",
"ioredis": "^5.8.2"
```

**Reason:** Backend-only dependencies
**Action:** None - these belong in backend

---

## Version Mismatches (Should Align)

### AWS SDK
**Project:** `^3.946.0`
**Frontend:** `^3.1001.0`
**Action:** Update frontend to match project version for consistency

### Firebase Admin
**Project:** `^13.6.0`
**Frontend:** `^13.7.0`
**Action:** Minor difference, acceptable

### IORedis
**Project:** `^5.8.2`
**Frontend:** `^5.10.0`
**Action:** Frontend should remove (backend only)

---

## Shared Dependencies (Versions Match) ✓

All Radix UI components match ✓
- `@radix-ui/react-*` packages aligned

Core React packages match ✓
```json
"react": "^19.2.1",
"react-dom": "^19.2.1"
```

TanStack Query matches ✓
```json
"@tanstack/react-query": "^5.90.20",
"@tanstack/react-query-devtools": "^5.91.3"
```

UI utilities match ✓
```json
"class-variance-authority": "^0.7.1",
"clsx": "^2.1.1",
"cmdk": "^1.1.1",
"lucide-react": "^0.556.0",
"tailwind-merge": "^3.4.0",
"tailwindcss": "^4.1.17",
"tailwindcss-animate": "^1.0.7"
```

---

## Action Items

### High Priority
1. ⚠️ **REMOVE** `stripe` and `resend` from frontend (security risk)
2. ✓ **ADD** `next-themes` for theme management
3. ⚠️ **REMOVE** `ioredis` from frontend (backend only)

### Medium Priority
4. Align AWS SDK versions
5. Verify all Radix UI components are latest
6. Ensure testing libraries match

### Low Priority
7. Document why different i18n approaches
8. Document why different font loading approaches
