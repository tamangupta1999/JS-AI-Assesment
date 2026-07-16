# AI Prompts — Testing

Activity: test design, test generation, CI setup.

---

### Prompt 1 — State machine unit tests

**Prompt:** (From plan) Write unit tests for state machine logic in shared package.

**AI Response:** Created `state-machine.test.ts` with 3 tests: valid transitions return true, invalid return false, getValidNextStatuses returns correct array.

**Accepted:** Pure function tests with no DB dependency. Fast execution (2ms).

**Changed:** Nothing — tests matched assignment requirements directly.

**Rejected:** Testing state machine only via integration tests — unit tests give faster feedback on rule changes.

---

### Prompt 2 — Integration test suite

**Prompt:** Write integration tests proving state machine rules — valid succeed, invalid rejected.

**AI Response:** Created `ticket-state-machine.test.ts` with 16 tests: 4 valid transitions, 5 invalid (409), 7 auth/RBAC tests. Test helpers for app creation, login, ticket creation.

**Accepted:** Full integration suite against real Postgres. Tests valid and invalid transitions plus auth flows.

**Changed:** Used shared `createTestApp()` helper and seed user credentials for consistency.

**Rejected:** Mocking database — integration tests against real Postgres catch actual SQL and constraint issues.

---

### Prompt 3 — CI workflow

**Prompt:** (From stretch goals) Set up GitHub Actions CI.

**AI Response:** Created `.github/workflows/ci.yml` with Postgres service container, pnpm install, migrate, test steps.

**Accepted:** CI runs on push/PR with same test commands as local.

**Changed:** Added build step before tests to catch compile errors early.

**Rejected:** Skipping CI — stretch goal and catches regressions on shared branches.

---

### Prompt 4 — Test verification

**Prompt:** Run all tests and confirm passing.

**AI Response:** Unit tests 3/3 pass. Integration tests 16/16 pass after Postgres available.

**Accepted:** All 19 tests green. Results captured in test-results.md.

**Changed:** Documented test prerequisites (Docker Postgres, migrate, seed) in README.

**Rejected:** Marking tests as passing without running them — actual output captured for reviewer evidence.
