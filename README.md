# Support Ticket Management System

A full-stack support ticket management application built with Next.js 16, Fastify, PostgreSQL, and Drizzle ORM. Part of the Cursor AI Capability Exercise.

## Features

### Core
- Create, list, view, and update support tickets
- Add comments to tickets
- Enforced status state machine (invalid transitions rejected)
- Keyword search and status filter
- Backend validation with meaningful UI error states
- Database persistence with migrations and seed data

### Stretch
- Username/password registration and login
- JWT access tokens + Postgres session store (logout invalidates session)
- Role-based access control (admin, agent, user)
- Filter by priority and assignee, sorting, pagination
- Admin user role management
- OpenAPI documentation at `/docs`
- GitHub Actions CI workflow

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS 4 |
| Backend | Fastify 5, TypeScript |
| Database | PostgreSQL 16 |
| ORM | Drizzle ORM |
| Validation | Zod (shared between frontend and backend) |
| Auth | JWT + bcrypt + Postgres sessions |
| Monorepo | pnpm workspaces + Turborepo |
| Tests | Vitest |

## Prerequisites

- Node.js 22+
- pnpm 10+
- Docker (for PostgreSQL)

## Quick Start

1. **Clone and install**

```bash
cd support-ticket-system
pnpm install
```

2. **Configure environment**

```bash
cp .env.example .env
```

Environment files live at the **monorepo root** (`.env`). The API loads this file explicitly via `apps/api/src/load-env.ts`, so it works when Turbo runs tasks from package directories. Next.js reads env from `apps/web/` — `apps/web/.env` is included for `NEXT_PUBLIC_API_URL`; keep it in sync with the root `.env` or symlink:

```bash
ln -sf ../../.env apps/web/.env
```

3. **Start PostgreSQL**

```bash
docker compose up -d
```

4. **Run migrations and seed**

```bash
pnpm db:migrate
pnpm db:seed
```

5. **Start development servers**

```bash
pnpm dev
```

- Frontend: http://localhost:3000
- API: http://localhost:4000
- API Docs: http://localhost:4000/docs

## Seed Users

All seed users share the password: `Password123!`

| Username | Role  | Email              |
|----------|-------|--------------------|
| admin    | admin | admin@example.com  |
| agent1   | agent | agent1@example.com |
| agent2   | agent | agent2@example.com |
| user1    | user  | user1@example.com  |
| user2    | user  | user2@example.com  |

## Status State Machine

```
Open         → In Progress
Open         → Cancelled
In Progress  → Resolved
In Progress  → Cancelled
Resolved     → Closed
```

Invalid transitions return HTTP 409 with a clear error message.

## Running Tests

```bash
# Unit tests (state machine logic)
pnpm --filter @repo/shared test

# Integration tests (requires PostgreSQL running with seed data)
pnpm --filter @repo/api test
```

## Project Structure

```
support-ticket-system/
├── apps/
│   ├── api/          # Fastify REST API
│   └── web/          # Next.js frontend
├── packages/
│   ├── db/           # Drizzle schema, migrations, seed
│   └── shared/       # Zod schemas, constants, state machine
├── database/
│   └── setup-notes.md
├── ai-prompts/       # AI prompt history by activity
├── tool-specific/cursor-workflow/
└── docker-compose.yml
```

### Assessment Structure Mapping

Assignment expects `ai-practical-assessment/` layout. This monorepo maps as follows:

| Required path | This repo |
|---------------|-----------|
| `src/` | `apps/` + `packages/` |
| `tests/` | `apps/api/tests/`, `packages/shared/src/**/*.test.ts` |
| `database/schema-or-migrations/` | `packages/db/migrations/` |
| `database/seed-data/` | `packages/db/src/seed.ts` |
| `database/setup-notes.md` | `database/setup-notes.md` |
| `ai-prompts/` | `ai-prompts/` |
| `tool-specific/cursor-workflow/` | `tool-specific/cursor-workflow/` |

## Assessment Artifacts

Lifecycle documents for AI Capability Exercise submission:

| Document | Purpose |
|----------|---------|
| [candidate-info.md](candidate-info.md) | Candidate and project metadata |
| [requirements-analysis.md](requirements-analysis.md) | Requirement breakdown |
| [acceptance-criteria.md](acceptance-criteria.md) | Completion checklist |
| [implementation-plan.md](implementation-plan.md) | Phased build plan |
| [design-notes.md](design-notes.md) | Architecture and design |
| [api-contract.md](api-contract.md) | API endpoint documentation |
| [data-model.md](data-model.md) | Database schema |
| [ui-flow.md](ui-flow.md) | Page map and user journeys |
| [test-strategy.md](test-strategy.md) | Test scope |
| [test-results.md](test-results.md) | Test run output |
| [debugging-notes.md](debugging-notes.md) | Bug investigations |
| [code-review-notes.md](code-review-notes.md) | Review findings |
| [review-fixes.md](review-fixes.md) | Post-review fixes |
| [pr-description.md](pr-description.md) | Submission summary |
| [reflection.md](reflection.md) | Lifecycle reflection |
| [final-ai-usage-summary.md](final-ai-usage-summary.md) | AI usage rollup |
| [tool-workflow.md](tool-workflow.md) | Part A AI workflow |
| [ai-prompts/](ai-prompts/) | Structured prompt history |
| [tool-specific/cursor-workflow/](tool-specific/cursor-workflow/) | Cursor tool artifacts |

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | /auth/register | Register new user |
| POST | /auth/login | Login with username/password |
| POST | /auth/refresh | Refresh access token |
| POST | /auth/logout | Logout and invalidate session |
| GET | /auth/me | Get current user |
| GET | /tickets | List tickets (search, filter, paginate) |
| POST | /tickets | Create ticket |
| GET | /tickets/:id | Get ticket details |
| PATCH | /tickets/:id | Update ticket fields |
| PATCH | /tickets/:id/status | Change ticket status |
| GET | /tickets/:id/comments | List comments |
| POST | /tickets/:id/comments | Add comment |
| GET | /users | List users (admin) |
| PATCH | /users/:id/role | Update user role (admin) |

## Environment Variables

See `.env.example` at the **monorepo root** for all required variables. Never commit `.env` to the repository.

| Location | Used by |
|----------|---------|
| `.env` (root) | API (`load-env.ts`), DB migrate/seed |
| `apps/web/.env` | Next.js (`NEXT_PUBLIC_*` vars) |

When changing API URL or secrets, update the root `.env`. For the frontend, either update `apps/web/.env` or symlink it to the root file.

## License

Internal competency exercise — not for public distribution.
