# App Setup and Provider Gaps

## Current State of `frontend/src/main.tsx`

```tsx
root.render(
  <React.StrictMode>
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </HelmetProvider>
  </React.StrictMode>
);
```

## What Is Missing

### 1. i18next Is Not Initialized

**Impact:** Every call to `useTranslation()` in the app will either throw or return raw keys instead of translated strings. All pages that use translations (which is every page) will be broken.

**What exists:**
- `frontend/src/shared/i18n/config.ts` — i18next configuration file (exists but not invoked)
- `frontend/src/translations/en.json` — translation strings (complete)

**What is missing:** The config is never imported or initialized. `i18next.init()` (or the equivalent via `i18next-react` / `initReactI18next`) must be called before the app renders.

**Fix:** Import and initialize i18next before `ReactDOM.createRoot`, then wrap the app with `I18nextProvider`:

```tsx
// main.tsx
import i18n from "@/shared/i18n/config";  // triggers init
import { I18nextProvider } from "react-i18next";

root.render(
  <React.StrictMode>
    <I18nextProvider i18n={i18n}>
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
        </QueryClientProvider>
      </HelmetProvider>
    </I18nextProvider>
  </React.StrictMode>
);
```

Check `config.ts` to ensure it calls `i18n.use(initReactI18next).init(...)` and exports the `i18n` instance.

---

### 2. AppProvider / App Context Is Not in the Tree

**File:** `frontend/src/shared/contexts/app-context.tsx`

**Impact:** Any component that calls `useApp()` or `useAppContext()` will throw "context not available" because the provider is never mounted.

**What the context likely provides:** Firebase auth state, current user profile, loading states — the core data every authenticated page depends on.

**Fix:** Wrap the app with `AppProvider` inside `main.tsx`:

```tsx
import { AppProvider } from "@/shared/contexts/app-context";

root.render(
  <React.StrictMode>
    <I18nextProvider i18n={i18n}>
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <AppProvider>
            <RouterProvider router={router} />
          </AppProvider>
        </QueryClientProvider>
      </HelmetProvider>
    </I18nextProvider>
  </React.StrictMode>
);
```

---

### 3. Auth Provider

**File:** `frontend/src/shared/providers/auth-provider.tsx`

**Status:** Exists but not included in `main.tsx`.

**Impact:** Firebase auth state is not initialized at the app root. Routes using `useAuth()` may work if auth is initialized inside `AppProvider`, but this needs to be verified. If `AuthProvider` is separate from `AppProvider`, it also needs to be added.

**Fix:** Confirm whether `AppProvider` already wraps auth state (check `app-context.tsx`). If not, add `AuthProvider` to the provider chain in `main.tsx`.

---

### 4. Theme Provider

**File:** `frontend/src/shared/providers/theme-provider.tsx`

**Status:** Exists but not included in `main.tsx`.

**Impact:** Dark/light mode switching will not work. The `useTheme()` hook will throw or return defaults.

**Fix:** Add `ThemeProvider` to `main.tsx`:

```tsx
import { ThemeProvider } from "@/shared/providers/theme-provider";

// wrap RouterProvider with ThemeProvider
<ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
  <RouterProvider router={router} />
</ThemeProvider>
```

---

## Correct Final Provider Order in `main.tsx`

Provider order matters — outer providers must be available before inner ones that depend on them:

```tsx
<React.StrictMode>
  <I18nextProvider i18n={i18n}>          {/* Translations — needed by everything */}
    <HelmetProvider>                      {/* SEO meta tags */}
      <QueryClientProvider client={queryClient}>   {/* Data fetching */}
        <ThemeProvider>                   {/* Theme (dark/light) */}
          <AppProvider>                   {/* Auth + user state */}
            <RouterProvider router={router} />
            <ReactQueryDevtools initialIsOpen={false} />
          </AppProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </HelmetProvider>
  </I18nextProvider>
</React.StrictMode>
```

---

## Files to Check / Update

| File | Action |
|---|---|
| `frontend/src/main.tsx` | Add all missing providers |
| `frontend/src/shared/i18n/config.ts` | Verify it exports initialized `i18n` instance |
| `frontend/src/shared/contexts/app-context.tsx` | Check what it provides and whether it wraps auth |
| `frontend/src/shared/providers/auth-provider.tsx` | Determine if needed separately from AppProvider |
| `frontend/src/shared/providers/theme-provider.tsx` | Confirm API and add to main.tsx |

---

## Original Next.js Equivalent

In the Next.js project, providers were set up in `project/app/layout.tsx` as a root layout. The equivalent in Vite is `main.tsx` + potentially `__root.tsx` (the TanStack Router root route). Make sure providers that need to wrap the entire app (i18n, auth, query) are in `main.tsx`, not buried inside route components.
