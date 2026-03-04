# i18n Migration: next-intl → react-i18next

## The Problem

The original Next.js project used `next-intl` for internationalization. The new frontend uses `react-i18next`. These two libraries have different APIs and the migration is **incomplete** — many components still use the `next-intl` API.

---

## API Differences

| Feature | next-intl (old) | react-i18next (new) |
|---|---|---|
| Client hook | `useTranslations('namespace')` | `useTranslation('namespace')` |
| Server function | `getTranslations('namespace')` | N/A (not needed in Vite) |
| Translate function | `t('key')` | `t('key')` |
| Translate with args | `t('key', { count: 5 })` | `t('key', { count: 5 })` |
| Provider | `NextIntlClientProvider` | `I18nextProvider` |
| Config | `next-intl.config.ts` | `i18next.init(...)` |
| Locale routing | Built into Next.js | Manual or none |

The function call syntax (`t('key')`) is identical, so the main work is:
1. Replacing import statements
2. Replacing hook calls
3. Removing namespace patterns if different

---

## Finding All Incomplete Migrations

Run these to find every file that still uses next-intl:

```bash
# Files with next-intl imports
grep -r "from 'next-intl'" frontend/src --include="*.ts" --include="*.tsx" -l
grep -r 'from "next-intl"' frontend/src --include="*.ts" --include="*.tsx" -l

# Files using useTranslations (next-intl hook name)
grep -r "useTranslations" frontend/src --include="*.ts" --include="*.tsx"

# Files using getTranslations (server-side next-intl — should not exist in frontend)
grep -r "getTranslations" frontend/src --include="*.ts" --include="*.tsx"
```

The `useTranslations` calls are especially important — they need to become `useTranslation`.

---

## Conversion Pattern

### Before (next-intl)
```tsx
import { useTranslations } from "next-intl";

function MyComponent() {
  const t = useTranslations("common");
  return <h1>{t("title")}</h1>;
}
```

### After (react-i18next)
```tsx
import { useTranslation } from "react-i18next";

function MyComponent() {
  const { t } = useTranslation("common");
  return <h1>{t("title")}</h1>;
}
```

Key differences:
- `useTranslation` returns `{ t, i18n }` — destructure `t`
- `useTranslations` returns `t` directly — no destructuring needed

---

## Known Files with `useTranslations` (from original project)

These were in the original Next.js project and may have been copied into the frontend without updating the import:

- `project/app/admin/contactmessages/contact-messages-interactive.tsx` — uses `useTranslations`
- `project/app/admin/developer/developer-interactive.tsx` — uses `useTranslations`
- `project/app/admin/settings/settings-interactive.tsx` — likely uses `useTranslations`
- Various components in `project/features/` — check all before copying to frontend

When migrating any component from `project/` to `frontend/`, always update i18n imports as part of the migration step.

---

## Translation Key Structure

The translation file `frontend/src/translations/en.json` should mirror the original `project/translations/en.json`. Verify:

1. All keys used in frontend components exist in `frontend/src/translations/en.json`
2. No keys reference Next.js-specific strings (e.g., error page messages)
3. Keys for the 3 stub admin pages exist (contactmessages, developer, settings)

To find keys used in the frontend but not in the translation file:

```bash
# Extract all t('key') and t("key") calls from frontend
grep -roh "t('[^']*')\|t(\"[^\"]*\")" frontend/src --include="*.tsx" | sort | uniq
```

Then manually cross-check against `frontend/src/translations/en.json`.

---

## i18next Configuration Setup

**File:** `frontend/src/shared/i18n/config.ts`

This file must:
1. Import `i18next` and `initReactI18next`
2. Import the translation JSON files
3. Call `i18next.use(initReactI18next).init({...})`
4. Export the configured `i18n` instance

Expected shape:

```ts
import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import en from "../../translations/en.json";

const i18n = i18next.use(initReactI18next);
i18n.init({
  lng: "en",
  fallbackLng: "en",
  resources: {
    en: { translation: en },
  },
  interpolation: {
    escapeValue: false, // React already escapes
  },
});

export default i18n;
```

Verify `config.ts` matches this pattern. If it's not calling `.init()`, translations will never load.

---

## Multi-language Support

The original project supported 8 locales: `en, es, fr, de, it, pt, ja, zh`.

The current frontend `translations/` directory likely only has `en.json`. Determine the scope:

**Option A — English only for now:**
- Configure i18next with only `en`
- Add other languages later
- This is fine for initial migration

**Option B — All languages from day one:**
- Need translation files for all 8 languages
- These may need to be created or copied from the original project if they existed there
- Check `project/translations/` for other locale files

For the migration, **Option A is recommended** — get English working first, add languages later.

---

## Locale URL Routing

In the original Next.js project, locale was part of the URL (e.g., `/en/pricing`, `/fr/pricing`) via `next-intl`'s routing.

In the new Vite app with TanStack Router:
- There are no locale-prefixed routes in `frontend/src/routes/`
- The current setup appears to be single-locale (English only)

**Decision needed:** Should the new app have locale-prefixed URLs (`/en/pricing`)? This requires TanStack Router locale configuration. For initial migration, skip locale routing and serve the app in English only.

---

## Checklist

- [ ] Verify `frontend/src/shared/i18n/config.ts` calls `i18n.init()`
- [ ] Add `I18nextProvider` to `main.tsx` (see [04-APP-SETUP-AND-PROVIDERS.md](./04-APP-SETUP-AND-PROVIDERS.md))
- [ ] Run grep to find all `useTranslations` calls in frontend code
- [ ] Convert each `useTranslations` → `useTranslation` with destructuring
- [ ] Run grep to find all `from 'next-intl'` imports
- [ ] Remove all `next-intl` imports
- [ ] Verify `en.json` has all keys needed by frontend components
- [ ] Verify `next-intl` package is removed from `frontend/package.json`

```bash
# Verify next-intl is not a dependency
grep "next-intl" frontend/package.json
# Should return nothing (or show it's been removed)
```
