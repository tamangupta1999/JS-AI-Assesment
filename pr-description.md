# PR Description

## Summary

Full-stack Support Ticket Management System for Cursor AI Capability Exercise. Monorepo with Next.js 16 frontend, Fastify 5 API, PostgreSQL database. Core ticket lifecycle with enforced state machine plus Stretch features: auth, RBAC, advanced filters, CI.

## Features Implemented

### Core
- Ticket CRUD (create, list, view, update)
- Comments on tickets
- Status state machine with backend enforcement (409 on invalid)
- Keyword search and status filter
- Backend Zod validation with UI error states
- PostgreSQL persistence with migrations and seed data
- State machine integration tests (16 tests)

### Stretch
- Username/password registration and login
- JWT access tokens + Postgres session store
- RBAC: admin, agent, user roles
- Protected frontend routes (AuthGuard)
- Filter by priority and assignee, sorting, pagination
- Admin user role management
- OpenAPI/Swagger at `/docs`
- Docker Compose + GitHub Actions CI

## Technical Changes

- **Monorepo:** pnpm workspaces + Turborepo with apps/api, apps/web, packages/db, packages/shared
- **Shared validation:** Zod schemas in `@repo/shared` used by API routes
- **State machine:** Centralized in shared constants; enforced only via `PATCH /tickets/:id/status`
- **Auth:** JWT Bearer + httpOnly refresh cookie; sessions table for logout invalidation
- **Env loading:** Root `.env` loader for monorepo cwd independence

## Database Changes

- New tables: users, sessions, tickets, comments
- Enums: user_role, ticket_status, ticket_priority
- Migration: `packages/db/migrations/0000_optimal_lady_bullseye.sql`
- Seed: 5 users, 8 tickets, sample comments

## Testing Done

| Suite | Tests | Result |
|-------|-------|--------|
| Unit (state machine) | 3 | Pass |
| Integration (API) | 16 | Pass |
| **Total** | **19** | **Pass** |

See [`test-results.md`](test-results.md).

## AI Usage Summary

- **Planning:** Cursor plan mode for architecture; structured clarification questions before coding
- **Implementation:** AI scaffolded monorepo, routes, pages; iterated on build errors
- **Debugging:** AI diagnosed cross-origin cookie issue and env loading bug
- **Review:** AI-assisted RBAC and state machine bypass audit
- **Documentation:** AI generated lifecycle artifacts and prompt history

Full prompt history: [`ai-prompts/`](ai-prompts/)

## Screenshots / Demo Notes

Run locally:
```bash
cp .env.example .env && docker compose up -d
pnpm install && pnpm db:migrate && pnpm db:seed && pnpm dev
```

Login as `admin` / `Password123!` at http://localhost:3000

Key flows to demo:
1. Create ticket → change status through valid transitions
2. Attempt invalid transition → see 409 error in UI
3. Search tickets by keyword, filter by status
4. Add comment on ticket detail page
5. Admin: change user role at `/admin/users`

## Known Limitations

- No browser E2E tests (API integration tests cover business rules)
- No optimistic locking on concurrent status updates
- Comments are append-only (no edit/delete)
- English UI only, no i18n
- Local development only (no production deployment)

## Future Improvements

- Playwright E2E tests for critical UI flows
- React Testing Library for component tests
- Email notifications on ticket assignment
- Ticket activity audit log
- Rate limiting on auth endpoints
- Production deployment guide (Docker multi-stage, env secrets management)
