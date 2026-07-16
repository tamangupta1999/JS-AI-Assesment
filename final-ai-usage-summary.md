# Final AI Usage Summary

Cross-lifecycle rollup of how Cursor was used to build this project. Detailed per-prompt history in [`ai-prompts/`](ai-prompts/).

## Lifecycle Overview

| Phase | AI tool | Key outcome | Prompt history |
|-------|---------|-------------|----------------|
| Requirements | Cursor | Docx extracted, Core/Stretch mapped, clarifications asked | [`ai-prompts/planning.md`](ai-prompts/planning.md) |
| Planning | Cursor plan mode | Monorepo architecture, API design, phase plan | [`ai-prompts/planning.md`](ai-prompts/planning.md) |
| Design | Cursor | Data model, RBAC, state machine, cursor-workflow artifacts | [`ai-prompts/design.md`](ai-prompts/design.md) |
| Implementation | Cursor agent | Full codebase scaffolded, routes, pages, migrations | [`ai-prompts/implementation.md`](ai-prompts/implementation.md) |
| Testing | Cursor | Unit + integration tests, CI workflow | [`ai-prompts/testing.md`](ai-prompts/testing.md) |
| Debugging | Cursor | Fixed auth, env loading, query simplification | [`ai-prompts/debugging.md`](ai-prompts/debugging.md) |
| Code review | Cursor | State machine bypass audit, RBAC check, secrets audit | [`ai-prompts/code-review.md`](ai-prompts/code-review.md) |
| Documentation | Cursor | README, lifecycle artifacts, prompt restructure | [`ai-prompts/documentation.md`](ai-prompts/documentation.md) |

## Context Setting Approach

1. Attached assignment docx at conversation start
2. Created persistent context in `tool-specific/cursor-workflow/`
3. Used plan mode before writing code
4. Asked structured clarification questions (auth pattern, login identifier)
5. Added `.cursor/rules/` for IDE-level persistent standards

## Iteration Examples

| Topic | Iterations | Outcome |
|-------|-----------|---------|
| Auth architecture | 3 options presented → user chose → implemented → bug found → fixed | Working AuthGuard + Bearer token |
| Ticket list query | Complex join → type errors → simplified two-step query | Clean, type-safe query |
| Env loading | dotenv default → cwd mismatch → explicit root loader | Works from any cwd |
| Assessment artifacts | Gap analysis → 23 files created → cross-linked | Submission-ready repo |

## AI Output Validation Methods

- `pnpm build` — TypeScript compile check
- `pnpm test` — 19 automated tests
- Manual login/status change flow
- Assignment doc cross-check for state machine rules
- Secrets audit on committed files
- README setup followed from scratch

## Responsible AI Judgment

**Shared with AI:**
- Assignment requirements (public exercise document)
- Architecture decisions and code structure
- Error messages and build output
- Placeholder env values (not real secrets)

**Did not share:**
- Real credentials or production secrets
- Personal data beyond exercise scope

## Reusable Assets

| Asset | Location |
|-------|----------|
| Project context template | `tool-specific/cursor-workflow/project-context.md` |
| Spec-driven development | `tool-specific/cursor-workflow/spec.md` |
| Task tracking | `tool-specific/cursor-workflow/tasks.md` |
| Cursor IDE rules | `.cursor/rules/support-ticket-system.mdc` |
| Prompt history format | `ai-prompts/` (7 activity files) |
| Workflow narrative | `tool-workflow.md` |
| Monorepo env pattern | `apps/api/src/load-env.ts` |
| Shared validation pattern | `packages/shared/src/schemas/` |

## Artifact Index

All submission documents for AI reviewer:

| Document | Purpose |
|----------|---------|
| `candidate-info.md` | Candidate and project metadata |
| `requirements-analysis.md` | Requirement breakdown |
| `acceptance-criteria.md` | Completion checklist |
| `implementation-plan.md` | Phased build plan |
| `design-notes.md` | Architecture and design decisions |
| `api-contract.md` | API endpoint documentation |
| `data-model.md` | Database schema and ER diagram |
| `ui-flow.md` | Page map and user journeys |
| `test-strategy.md` | Test scope and rationale |
| `test-results.md` | Actual test run output |
| `debugging-notes.md` | Bug investigation records |
| `code-review-notes.md` | Review findings |
| `review-fixes.md` | Fixes after review |
| `pr-description.md` | Submission summary |
| `reflection.md` | Honest lifecycle reflection |
| `tool-workflow.md` | Part A AI workflow |
| `database/setup-notes.md` | Database setup guide |
| `ai-prompts/` | Structured prompt history |
| `tool-specific/cursor-workflow/` | Cursor tool artifacts |
