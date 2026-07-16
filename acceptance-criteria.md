# Acceptance Criteria

## Core

- [x] User can create a ticket via the UI
- [x] User can view all tickets from the database
- [x] User can open a ticket detail view
- [x] User can update ticket fields and reassign
- [x] User can add comments
- [x] Status changes only through valid transitions; invalid ones rejected (HTTP 409)
- [x] Keyword search and status filter work
- [x] Data remains available after restart (PostgreSQL persistence)
- [x] Backend validation prevents invalid records
- [x] No secrets committed to the repo
- [x] State-machine integration tests pass (16/16)

## Validation

- [x] Required fields enforced on ticket create (title, description)
- [x] Zod schemas shared between frontend and backend
- [x] Invalid assignee UUID rejected with 400
- [x] Register validates username format, email, password length
- [x] Comment message length enforced (1–2000 chars)

## Error Handling

- [x] 400 for validation failures with field-level details
- [x] 401 for unauthenticated requests
- [x] 403 for RBAC violations
- [x] 404 for missing tickets/users
- [x] 409 for invalid status transitions with human-readable message
- [x] UI displays API error messages to user

## Testing

- [x] Unit tests for state machine logic (3/3 pass)
- [x] Integration tests for valid transitions (4 tests)
- [x] Integration tests for invalid transitions (5 tests)
- [x] Integration tests for auth and RBAC (7 tests)
- [x] Test results documented in `test-results.md`
- [x] CI runs tests on push/PR

## Documentation

- [x] README with setup instructions
- [x] Database setup notes (`database/setup-notes.md`)
- [x] API contract (`api-contract.md`)
- [x] Data model (`data-model.md`)
- [x] Design notes (`design-notes.md`)
- [x] UI flow (`ui-flow.md`)
- [x] Requirement analysis (`requirements-analysis.md`)
- [x] Implementation plan (`implementation-plan.md`)
- [x] AI prompt history (`ai-prompts/`)
- [x] Tool workflow (`tool-workflow.md`)
- [x] Reflection (`reflection.md`)
- [x] PR description (`pr-description.md`)

## Stretch

- [x] Username/password authentication
- [x] JWT access tokens + Postgres session store
- [x] Role-based access control (admin, agent, user)
- [x] Protected frontend routes
- [x] API authorization checks per role
- [x] Filter by priority and assignee
- [x] Sorting and pagination
- [x] Admin user role management
- [x] Unit tests for state machine
- [x] Auth integration tests
- [x] OpenAPI/Swagger at `/docs`
- [x] Docker Compose setup
- [x] GitHub Actions CI workflow
- [x] Cursor workflow artifacts (`tool-specific/cursor-workflow/`)
- [x] Reusable Cursor rules (`.cursor/rules/`)

## Cursor Tool Requirements

- [x] `tool-specific/cursor-workflow/project-context.md`
- [x] `tool-specific/cursor-workflow/spec.md`
- [x] `tool-specific/cursor-workflow/tasks.md`
- [x] `tool-specific/cursor-workflow/acceptance-criteria.md`
- [x] `tool-specific/cursor-workflow/cursor-rules-or-instructions.md`
- [x] `tool-workflow.md` (Part A)
