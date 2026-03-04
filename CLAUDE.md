# Claude AI Assistant Rules

## Code Patterns & Best Practices

### API Calls & Data Fetching

**NEVER use `fetch` directly.** Always follow the codebase patterns:

- **For GET requests with caching:** Use React Query (TanStack Query) with `useQuery` and `useQueryFetcher` hook
  ```typescript
  const fetcher = useQueryFetcher();
  const { data } = useQuery({
    queryKey: queryKeys.api.someResource(),
    queryFn: () => fetcher("/api/some-resource"),
    enabled: !!user,
  });
  ```
  Use `queryKeys` from `@/shared/lib/query-keys` for consistent cache keys. See [React Query Migration Guide](docs/AI_Orchastrator/consider/react-query-migration-guide.md).

- **For authenticated API calls:** Use `useAuthenticatedFetch` hook
  ```typescript
  const { authenticatedFetch, authenticatedFetchJson } = useAuthenticatedFetch();
  const data = await authenticatedFetchJson<Type>(url);
  ```

- **For server-side API calls:** Use `authenticatedFetchJson` from `@/shared/services/api/authenticated-fetch`

**Look at existing code** to learn how to make changes to the codebase. Check similar components/files to see the patterns used.

### Internationalization (i18n)

**ALWAYS use translations.** Never hardcode strings.

- Use `useTranslations()` hook from `next-intl` in client components
- Use `getTranslations()` from `next-intl/server` in server components
- All user-facing text must use translation keys from `translations/en.json`
- Check existing translation keys before creating new ones

### Environment Variables

**NEVER use `process.env` directly.** Always use `envUtil` from `@/shared/utils/config/envUtil`.

- All environment variable access must go through `envUtil`
- If an environment variable is needed, add it to `envUtil.ts` first
- For constants (like trial days), use regular `const` declarations, NOT environment variables
- Only use environment variables when the value actually needs to vary by environment

**Example:**
```typescript
// ❌ WRONG
const trialDays = parseInt(process.env.NEXT_PUBLIC_TRIAL_DAYS || "14");

// ✅ CORRECT - Use a constant
export const SUBSCRIPTION_TRIAL_DAYS = 14;

// ✅ CORRECT - If it needs to be an env var, use envUtil
import { BASE_URL } from "@/shared/utils/config/envUtil";
```

### General Principles

- **Follow existing patterns** - Look at similar code in the codebase before writing new code
- **Use TypeScript properly** - Leverage types and avoid `any` when possible
- **Keep code organized** - Follow the feature-based organization structure
- **Update AI_Orchastrator docs** - When making code changes, update relevant documentation
