# Test Results

**Date:** 2026-07-16  
**Environment:** macOS, Node.js 22+, PostgreSQL 16 (Docker Compose)  
**Branch:** main

## Summary

| Package | Test Files | Tests | Passed | Failed | Duration |
|---------|-----------|-------|--------|--------|----------|
| `@repo/shared` | 1 | 3 | 3 | 0 | 363ms |
| `@repo/api` | 1 | 16 | 16 | 0 | 3.53s |
| **Total** | **2** | **19** | **19** | **0** | — |

All tests pass.

## Unit Tests — `@repo/shared`

**Command:** `pnpm --filter @repo/shared test`

```
 RUN  v3.2.6 packages/shared

 ✓ src/constants/state-machine.test.ts (3 tests) 2ms

 Test Files  1 passed (1)
      Tests  3 passed (3)
   Duration  363ms
```

**Coverage:**
- `isValidTransition()` — valid transitions return true
- `isValidTransition()` — invalid transitions return false
- `getValidNextStatuses()` — returns correct next statuses per state

**File:** `packages/shared/src/constants/state-machine.test.ts`

## Integration Tests — `@repo/api`

**Command:** `pnpm --filter @repo/api test`  
**Prerequisite:** PostgreSQL running with migrations and seed data applied

```
 RUN  v3.2.6 apps/api

 ✓ tests/integration/ticket-state-machine.test.ts (16 tests) 2476ms

 Test Files  1 passed (1)
      Tests  16 passed (16)
   Duration  3.53s
```

**Coverage:**

### Valid transitions (4 tests)
- open → in_progress
- in_progress → resolved
- resolved → closed
- open → cancelled

### Invalid transitions (5 tests)
- open → resolved (409)
- open → closed (409)
- in_progress → open (409)
- resolved → in_progress (409)
- closed → any (409)

### Auth and RBAC (7 tests)
- Login with valid credentials
- Login with invalid credentials (401)
- Protected routes reject unauthenticated requests (401)
- User role can only see own/assigned tickets
- Agent can access all tickets
- Admin can update user roles
- Logout invalidates session

**File:** `apps/api/tests/integration/ticket-state-machine.test.ts`

## CI

GitHub Actions workflow (`.github/workflows/ci.yml`) runs the same test suite against a Postgres service container on every push/PR.

## Not Covered

- Browser E2E tests (Playwright/Cypress) — manual UI verification only
- Load/performance tests — out of scope for Core exercise
