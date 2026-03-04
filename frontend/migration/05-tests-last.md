# Phase 05 — Tests Last (Finalization)

## Goal
Run migration verification and test stabilization **only after** phases 01–04 are complete.

## Why tests are last
During migration, paths/imports/contracts shift frequently. Running full tests too early creates churn and false failures.

## Prerequisite gate
Do not start this phase until:
- [ ] Phase 01 complete
- [ ] Phase 02 complete
- [ ] Phase 03 complete
- [ ] Phase 04 complete

## Test execution order

1. **Migration structure checks**
   - Run migration verification script(s), including:
     - `frontend/scripts/verify-migration.ts`
   - Confirm expected folders/files exist for migrated frontend code.

2. **Unit tests (frontend only)**
   - Run frontend unit tests in `frontend/__tests__/unit/`.
   - Fix import path breakages first, then behavioral failures.

3. **UI/component smoke tests**
   - Validate critical pages render:
     - Admin dashboard/customers/orders/subscriptions
     - Sign-in/sign-up
     - Calculator/account/checkout/payment flows

4. **API integration sanity**
   - Validate frontend calls succeed against backend for key workflows.

5. **Regression sweep**
   - Re-run full frontend test suite after fixes.

## Existing test folders to use
- Frontend: `frontend/__tests__/helpers/`, `frontend/__tests__/setup/`, `frontend/__tests__/unit/`
- Legacy reference (if parity checks needed): `project/__tests__/unit/`, `project/__tests__/integration/`, `project/__tests__/e2e/`

## Failure triage rules
1. Fix infra/import/setup failures first.
2. Then fix API-contract failures.
3. Then fix UI behavioral regressions.
4. Defer non-migration refactors.

## Final exit criteria
- [ ] Frontend migration verification script passes.
- [ ] Frontend test suite passes (or approved skip list documented).
- [ ] Critical admin + user journeys pass manual smoke checks.
- [ ] Migration packet checklist marked complete in all phase files.
