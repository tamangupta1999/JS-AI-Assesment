# Acceptance Criteria

## Core (Mandatory)

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
- [x] State-machine integration tests written and pass (16/16)

## Stretch

- [x] Authentication with username/password
- [x] JWT access tokens + Postgres session store
- [x] Role-based access control (admin, agent, user)
- [x] Protected routes in frontend
- [x] API authorization checks per role
- [x] Filter by priority and assignee
- [x] Sorting and pagination
- [x] Admin user role management
- [x] Unit tests for state machine
- [x] Auth integration tests
- [x] OpenAPI/Swagger documentation
- [x] Docker Compose setup
- [x] GitHub Actions CI workflow
- [x] Cursor workflow artifacts (project-context, spec, tasks, rules)
- [x] Full prompt history in ai-prompts/
- [x] README setup instructions

## Cursor Tool Requirements

- [x] tool-specific/cursor-workflow/project-context.md
- [x] tool-specific/cursor-workflow/spec.md
- [x] tool-specific/cursor-workflow/tasks.md
- [x] tool-specific/cursor-workflow/acceptance-criteria.md
- [x] tool-specific/cursor-workflow/cursor-rules-or-instructions.md
- [x] tool-workflow.md (Part A)
- [x] ai-prompts/ directory (7 activity files)

## Root Lifecycle Artifacts

- [x] candidate-info.md
- [x] requirements-analysis.md
- [x] acceptance-criteria.md (root)
- [x] implementation-plan.md
- [x] design-notes.md
- [x] api-contract.md
- [x] data-model.md
- [x] ui-flow.md
- [x] test-strategy.md
- [x] test-results.md
- [x] debugging-notes.md
- [x] code-review-notes.md
- [x] review-fixes.md
- [x] pr-description.md
- [x] reflection.md
- [x] final-ai-usage-summary.md
- [x] database/setup-notes.md
