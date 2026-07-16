# Reflection

## What I Built

A Support Ticket Management System with enforced status state machine, comments, search/filter, and full authentication with RBAC. The app runs as a pnpm monorepo: Next.js frontend, Fastify API, PostgreSQL with Drizzle ORM. Core assignment requirements met; Stretch goals (auth, pagination, CI, OpenAPI) also implemented.

## How I Used AI (across the lifecycle)

| Phase | How Cursor helped |
|-------|-------------------|
| Requirements | Extracted assignment from docx, identified Core vs Stretch, asked clarifying questions |
| Planning | Plan mode produced architecture, API design, RBAC matrix before any code |
| Design | Generated spec, project-context, data model, cursor-workflow artifacts |
| Implementation | Scaffolded monorepo, routes, pages; fixed build errors iteratively |
| Testing | Generated integration test suite; verified 19/19 pass |
| Debugging | Diagnosed env loading and cross-origin auth issues |
| Review | Audited state machine bypass, RBAC, secrets |
| Documentation | Created all lifecycle artifacts and structured prompt history |

## What AI Helped With Most

1. **Speed of scaffolding** — entire monorepo structure, 15+ API endpoints, 6 frontend pages generated in one session
2. **Boilerplate consistency** — Zod schemas, route patterns, error handling all follow same structure
3. **Test generation** — 16 integration tests covering state machine and auth written quickly
4. **Debugging diagnosis** — cross-origin cookie issue identified faster than manual tracing
5. **Documentation** — lifecycle artifacts generated from actual code, not generic templates

## What AI Got Wrong

1. **Next.js middleware for auth** — AI suggested middleware reading API cookies; doesn't work cross-origin. Fixed with client-side AuthGuard.
2. **Complex SQL joins** — initial ticket list query used raw joins with type errors. Simplified to two-step drizzle query.
3. **Monorepo env loading** — `dotenv/config` default behavior doesn't work when cwd is `apps/api`. Needed explicit root loader.
4. **Missing dependency** — `drizzle-orm` used in API routes but not listed in package.json.

In each case, I validated the issue, understood the root cause, and applied a targeted fix rather than accepting the broken output.

## How I Validated AI Output

- Ran `pnpm build` after each major phase — caught TypeScript errors
- Ran unit tests (3/3) and integration tests (16/16) — caught logic errors
- Manually tested login flow after auth fix
- Reviewed state machine rules against assignment document manually
- Checked `.gitignore` and committed files for secrets
- Compared generated API against assignment entity requirements

## What I Would Improve Next

1. Add Playwright E2E tests for UI flows (status change, error display)
2. Set up React Testing Library for component-level tests
3. Add request rate limiting on auth endpoints
4. Implement ticket activity audit log
5. Create reusable Cursor rules template for future projects
6. Add pre-commit hooks for lint and test

## Reusable Workflow (prompts, rules, specs, templates)

Artifacts reusable in future projects:

| Artifact | Reuse value |
|----------|-------------|
| `tool-specific/cursor-workflow/project-context.md` | Template for project context doc |
| `tool-specific/cursor-workflow/spec.md` | Spec-driven development pattern |
| `tool-specific/cursor-workflow/tasks.md` | Phase tracking with checkboxes |
| `.cursor/rules/support-ticket-system.mdc` | Persistent IDE rules pattern |
| `packages/shared` pattern | Shared Zod validation between FE/BE |
| `ai-prompts/` structure | Activity-grouped prompt history format |
| `load-env.ts` pattern | Monorepo root env loading |
| Clarification-before-coding | Structured questions before implementation |

**Key lesson:** AI is fastest for scaffolding and boilerplate. Engineering judgment matters most for auth architecture, state machine design, and knowing when AI output is wrong. Always validate with build, tests, and manual verification.
