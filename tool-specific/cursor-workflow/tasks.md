# Tasks

## Phase 1: Foundation
- [x] Scaffold pnpm monorepo with apps/api, apps/web, packages/db, packages/shared
- [x] Docker Compose for PostgreSQL 16
- [x] Environment configuration (.env.example)
- [x] Turborepo pipeline config

## Phase 2: Database
- [x] Drizzle schema for users, sessions, tickets, comments
- [x] Generate and apply migrations
- [x] Seed script with dev users and sample tickets

## Phase 3: Shared Package
- [x] Zod validation schemas (auth, tickets, comments, queries)
- [x] State machine constants and helper functions
- [x] Unit tests for state machine logic

## Phase 4: API
- [x] Fastify app with CORS, cookies, Swagger
- [x] Auth routes (register, login, refresh, logout, me)
- [x] JWT + Postgres session management
- [x] RBAC middleware (authenticate, authorize)
- [x] Ticket CRUD routes with search/filter/pagination
- [x] Separate status endpoint with state machine enforcement
- [x] Comment routes
- [x] Admin user management routes

## Phase 5: Tests
- [x] State machine unit tests
- [x] Integration tests for valid/invalid transitions
- [x] Auth integration tests (login, logout, RBAC)

## Phase 6: Frontend
- [x] Next.js 16 App Router setup with Tailwind CSS 4
- [x] Auth provider with token management
- [x] Login and register pages
- [x] Ticket list with search, filters, sorting, pagination
- [x] Ticket create and detail pages
- [x] Status change UI with valid transitions only
- [x] Comments section
- [x] Admin user management page
- [x] Client-side route protection (AuthGuard)

## Phase 7: DevOps & Docs
- [x] GitHub Actions CI workflow
- [x] OpenAPI/Swagger at /docs
- [x] README with setup instructions
- [x] Cursor workflow artifacts
- [x] AI prompt history (ai-prompts/)

## Phase 8: Assessment Submission Artifacts
- [x] candidate-info.md, requirements-analysis.md, acceptance-criteria.md
- [x] implementation-plan.md, design-notes.md, api-contract.md
- [x] data-model.md, ui-flow.md
- [x] test-strategy.md, test-results.md
- [x] debugging-notes.md, code-review-notes.md, review-fixes.md
- [x] pr-description.md, reflection.md, final-ai-usage-summary.md
- [x] database/setup-notes.md
- [x] ai-prompts/ (planning, design, implementation, testing, debugging, code-review, documentation)
