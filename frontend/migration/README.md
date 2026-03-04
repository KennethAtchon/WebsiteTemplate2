# Frontend Migration Packet (Project ➜ `frontend`)

This folder defines a **strict, digestible migration sequence** for moving UI and client code from `project/` into `frontend/`.

> Required order (as requested):
> 1. Admin UI
> 2. User UI
> 3. Service files
> 4. API route layer
> 5. Tests (last)

## How to use this packet

1. Execute phases in numeric order.
2. Do **not** start the next phase until the current phase exit criteria are met.
3. Use one PR per phase:
   - `migration/frontend-phase-01-admin-ui`
   - `migration/frontend-phase-02-user-ui`
   - ...
4. Keep migrations mechanical first (copy/move + import fixes), then refine.

## Phase files

- `01-admin-ui.md` — migrate admin routes/pages and admin feature components first.
- `02-user-ui.md` — migrate customer/public/auth UI flows after admin is stable.
- `03-service-files.md` — migrate shared client-side services and utilities.
- `04-api-routes.md` — migrate API contract consumption and route parity mapping.
- `05-tests-last.md` — run and finalize migration tests only after all code migration phases.

## Ground rules

- Source of truth for migration source files: `project/`
- Destination for frontend code: `frontend/src/`
- Do not migrate server-only code into frontend (`db`, admin SDK, backend middleware).
- Keep import aliasing consistent with frontend config (`@/` paths if configured).

## Definition of done (overall)

- `frontend/src/` contains migrated UI + client services for all listed phases.
- App runs without runtime import errors.
- Admin and user flows render.
- API clients point to the split backend URL.
- Tests pass (phase 05).
