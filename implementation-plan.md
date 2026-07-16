# Implementation Plan

## Overview

Build a full-stack Support Ticket Management System in a pnpm monorepo using Cursor AI for planning, implementation, testing, and documentation. Deliver Core features first, then Stretch (auth, RBAC, advanced filters, CI). Prioritize lifecycle artifacts alongside code — the exercise values visible AI workflow over app size.

## Task Breakdown

### Phase 1: Foundation
- Scaffold pnpm monorepo: `apps/api`, `apps/web`, `packages/db`, `packages/shared`
- Docker Compose for PostgreSQL 16
- Environment configuration (`.env.example`)
- Turborepo pipeline

### Phase 2: Database
- Drizzle schema: users, sessions, tickets, comments
- Generate and apply migrations
- Seed script with dev users and sample tickets

### Phase 3: Shared Package
- Zod validation schemas (auth, tickets, comments, queries)
- State machine constants and helper functions
- Unit tests for state machine

### Phase 4: API
- Fastify app with CORS, cookies, Swagger
- Auth routes (register, login, refresh, logout, me)
- JWT + Postgres session management
- RBAC middleware
- Ticket CRUD with search/filter/pagination
- Separate status endpoint with state machine enforcement
- Comment routes
- Admin user management

### Phase 5: Tests
- State machine unit tests
- Integration tests for valid/invalid transitions
- Auth and RBAC integration tests

### Phase 6: Frontend
- Next.js 16 App Router with Tailwind CSS 4
- Auth provider with token management
- Login, register, ticket list, create, detail pages
- Status change UI showing valid transitions only
- Comments section
- Admin user management
- Client-side route protection (AuthGuard)

### Phase 7: DevOps and Docs
- GitHub Actions CI
- OpenAPI at `/docs`
- README setup guide
- Cursor workflow artifacts
- AI prompt history
- All lifecycle submission documents

## Milestones

| Milestone | Deliverable | Status |
|-----------|-------------|--------|
| M1 | Monorepo scaffold + DB running | Done |
| M2 | API with tickets + state machine | Done |
| M3 | Frontend with all pages | Done |
| M4 | Auth + RBAC | Done |
| M5 | Tests passing (19/19) | Done |
| M6 | CI pipeline | Done |
| M7 | All assessment artifacts | Done |

## AI Usage Plan

| Phase | AI role |
|-------|---------|
| Requirements | Extract docx, identify Core vs Stretch, ask clarifying questions |
| Planning | Plan mode for architecture, monorepo layout, API design |
| Design | Generate spec.md, project-context.md, data model |
| Implementation | Scaffold code, iterate on build errors |
| Testing | Generate integration test suite, run and fix failures |
| Debugging | Diagnose env loading, cross-origin cookie, missing deps |
| Review | Verify state machine bypass, RBAC, no secrets |
| Documentation | Generate README, lifecycle artifacts, prompt history |

## Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Cross-origin auth cookies | Login state lost between API and Next.js | Use client-side AuthGuard + Bearer token instead of middleware cookies |
| Monorepo env loading | API can't find DATABASE_URL | Explicit root `.env` loader in `load-env.ts` |
| AI generates incorrect state machine | Invalid transitions allowed | Centralize rules in shared package with unit + integration tests |
| Over-scoping Stretch | Less time for artifacts | Core works first; Stretch added incrementally |
| Shallow prompt history | Weak AI reviewer score | Restructure into `ai-prompts/` with accept/change/reject per prompt |
| Test DB dependency | Integration tests fail without Postgres | Document in README; CI uses service container |

## Mitigation

- Lock design decisions via structured questions before coding
- Run `pnpm build` and tests after each major phase
- Keep state machine in one tested module
- Document every bug fix in `debugging-notes.md`
- Capture real test output in `test-results.md`
