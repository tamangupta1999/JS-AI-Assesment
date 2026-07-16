# Test Strategy

## Test Scope

Tests focus on the assignment's signature judgment piece — the ticket status state machine — plus authentication and RBAC. Scope matches Core mandatory test tier with Stretch additions for auth.

## Unit Tests

**Location:** `packages/shared/src/constants/state-machine.test.ts`  
**Runner:** Vitest  
**Command:** `pnpm --filter @repo/shared test`

| Test | What it verifies |
|------|-----------------|
| Valid transitions | `isValidTransition("open", "in_progress")` returns true |
| Invalid transitions | `isValidTransition("open", "resolved")` returns false |
| Next statuses | `getValidNextStatuses("open")` returns `["in_progress", "cancelled"]` |

**Rationale:** State machine rules are pure functions — unit tests give instant feedback without DB setup.

## Component Tests

Not implemented. Frontend components are thin wrappers around API calls. Manual UI verification performed for:
- Status dropdown shows only valid transitions
- Error messages display on 409
- Form validation errors display on 400

**Why not covered:** No component test framework configured. Adding React Testing Library would be a future improvement. API integration tests cover business logic.

## API / Integration Tests

**Location:** `apps/api/tests/integration/ticket-state-machine.test.ts`  
**Runner:** Vitest  
**Command:** `pnpm --filter @repo/api test`  
**Prerequisite:** PostgreSQL with migrations and seed data

### State machine tests (9)
- 4 valid transitions: open→in_progress, in_progress→resolved, resolved→closed, open→cancelled
- 5 invalid transitions: each returns HTTP 409

### Auth and RBAC tests (7)
- Login with valid/invalid credentials
- Unauthenticated access rejected (401)
- User role sees only own/assigned tickets
- Agent accesses all tickets
- Admin updates user roles
- Logout invalidates session

**Test helpers:** `apps/api/tests/helpers.ts` — `createTestApp()`, `loginAs()`, `createTicket()`, `updateTicketStatus()`

## Edge Case Tests

Covered within integration suite:
- Terminal state transitions (closed → anything = 409)
- Cross-state invalid jumps (open → resolved, in_progress → open)
- RBAC boundary (user cannot see other users' tickets)

Not covered:
- Concurrent status updates (last-write-wins acceptable)
- Very long title/description strings (Zod max length tested implicitly via schema)
- SQL injection in search query (ORM parameterization — trust Drizzle)

## Tests Not Covered (and why)

| Gap | Reason |
|-----|--------|
| Browser E2E (Playwright) | Time scope; API integration tests cover business rules |
| Frontend component tests | No RTL setup; manual verification sufficient for exercise |
| Load/performance tests | Out of scope for Core exercise |
| Email notification tests | Feature not implemented |
| Migration rollback tests | Single migration; forward-only acceptable |

## CI Integration

GitHub Actions (`.github/workflows/ci.yml`) runs both test suites against Postgres service container on every push and PR.

## Results

See [`test-results.md`](test-results.md) — 19/19 tests passing as of 2026-07-16.
