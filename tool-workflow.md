# AI Workflow Foundation (Part A)

## Primary AI Tool

**Cursor** — used for requirement analysis, planning, implementation, testing, and documentation across the full development lifecycle.

## Project Context

- Attached the assignment document (`JS - AI_Assesment_Project.docx`) at conversation start
- Created persistent context in `tool-specific/cursor-workflow/` (project-context.md, spec.md, tasks.md)
- Used plan mode to design architecture before writing code
- Clarified auth design choices (username login, JWT + Postgres sessions) via structured questions

## Requirement Analysis

- Extracted assignment text from docx using shell tooling
- Identified mandatory Core vs optional Stretch requirements
- Mapped assignment entities to extended schema (added username, password_hash, sessions table)
- Confirmed state machine rules as the "signature judgment piece"

## Planning and Design

- Plan mode produced full architecture: monorepo structure, tech stack, API endpoints, RBAC matrix
- User confirmed auth preferences before implementation
- Mermaid diagrams for state machine and auth flow in plan document

## Code Generation

- Scaffolded monorepo, packages, API routes, and Next.js pages iteratively
- Used shared Zod schemas to keep FE/BE validation in sync
- Generated Drizzle schema and ran drizzle-kit for migrations
- Fixed build errors (missing drizzle-orm dep, TypeScript error types) in follow-up iterations

## Validation of AI-Generated Code

- Ran `pnpm build` on API and web — fixed TypeScript errors
- Ran unit tests (`pnpm --filter @repo/shared test`) — 3/3 passed
- Integration tests require PostgreSQL (Docker) — documented in README
- Reviewed state machine logic against assignment rules manually

## Testing

- Unit tests for pure state machine functions in `packages/shared`
- Integration tests for API state transitions and auth in `apps/api/tests/`
- CI workflow runs full test suite against Postgres service container

## Debugging

- Fixed cross-origin cookie issue: middleware couldn't read API-set cookies → replaced with client-side AuthGuard
- Fixed drizzle-orm missing from API dependencies
- Fixed ticket list query — simplified from raw SQL joins to separate user enrichment

## Code Review

- Verified status cannot be changed via general PATCH endpoint
- Verified RBAC on all protected routes
- Verified no secrets in committed files (.env gitignored)
- Verified separate status endpoint enforces state machine

## Information Avoided Sharing

- No real credentials, API keys, or production secrets shared with AI
- Used placeholder values in `.env.example`
- Dev passwords documented only in README for local testing

## Reuse in Real Projects

1. Start with plan mode and persistent context documents
2. Shared validation package between frontend and backend
3. Centralized business rules (state machine) in one module with tests
4. Spec-driven development with tasks.md tracking progress
5. Keep prompt history for traceability and reflection

## Related Artifacts

| Document | Link |
|----------|------|
| Requirement analysis | [requirements-analysis.md](requirements-analysis.md) |
| Implementation plan | [implementation-plan.md](implementation-plan.md) |
| Design notes | [design-notes.md](design-notes.md) |
| Prompt history | [ai-prompts/](ai-prompts/) |
| Debugging notes | [debugging-notes.md](debugging-notes.md) |
| Code review notes | [code-review-notes.md](code-review-notes.md) |
| Test results | [test-results.md](test-results.md) |
| Reflection | [reflection.md](reflection.md) |
| AI usage summary | [final-ai-usage-summary.md](final-ai-usage-summary.md) |
| Cursor workflow | [tool-specific/cursor-workflow/](tool-specific/cursor-workflow/) |
