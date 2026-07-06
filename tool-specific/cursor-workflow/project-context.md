# Project Context

## Overview

Support Ticket Management System — a full-stack application for creating, tracking, and managing support tickets with an enforced status state machine.

## Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4
- **Backend**: Fastify 5, TypeScript
- **Database**: PostgreSQL 16 via Docker Compose
- **ORM**: Drizzle ORM with drizzle-kit migrations
- **Validation**: Zod schemas in `@repo/shared` (shared between FE/BE)
- **Auth**: JWT access tokens (15m) + Postgres session store for refresh/logout
- **Monorepo**: pnpm workspaces + Turborepo

## Folder Structure

```
apps/api/       → Fastify REST API (port 4000)
apps/web/       → Next.js frontend (port 3000)
packages/db/    → Drizzle schema, migrations, seed
packages/shared/→ Zod schemas, constants, state machine rules
```

## Conventions

- ESM modules throughout (`"type": "module"`)
- Zod for all input validation — schemas live in `packages/shared`
- State machine logic centralized in `packages/shared` constants and `apps/api/src/services/ticket-state-machine.ts`
- Status changes only via `PATCH /tickets/:id/status` — never through general update endpoint
- RBAC enforced at API middleware level
- No secrets in repository — use `.env` (gitignored)

## Roles

| Role  | Permissions |
|-------|------------|
| admin | Full access, user management |
| agent | All tickets, create/update/comment |
| user  | Own tickets + assigned tickets only |

## Key Design Decisions

1. Username + password auth (extended from assignment's email-only User entity)
2. JWT for stateless API auth + Postgres sessions for logout invalidation
3. Separate status endpoint prevents state machine bypass
4. Shared Zod schemas ensure FE/BE validation parity
