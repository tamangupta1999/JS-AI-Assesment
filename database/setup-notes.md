# Database Setup Notes

## Choice

**PostgreSQL 16** via Docker Compose. ORM: Drizzle with SQL migrations.

## Monorepo Mapping

Assessment doc expects a `database/` folder. This project uses a monorepo — actual schema and migrations live in `packages/db/`:

| Assessment path | Actual location |
|----------------|-----------------|
| `database/schema-or-migrations/` | `packages/db/migrations/` |
| `database/seed-data/` | `packages/db/src/seed.ts` |
| `database/setup-notes.md` | This file |

## Prerequisites

- Docker (for PostgreSQL container)
- Node.js 22+
- pnpm 10+

## Environment Variables

Copy `.env.example` to `.env` at the **monorepo root**:

```bash
cp .env.example .env
```

Required variable:

```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/tickets
```

Other secrets (`JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`) also live in root `.env`. Never commit `.env`.

## Start PostgreSQL

```bash
docker compose up -d
```

`docker-compose.yml` starts PostgreSQL 16 on port 5432 with:
- User: `postgres`
- Password: `postgres`
- Database: `tickets`

## Run Migrations

```bash
pnpm db:migrate
```

Applies SQL from `packages/db/migrations/0000_optimal_lady_bullseye.sql`.

Migration creates:
- Enums: `user_role`, `ticket_status`, `ticket_priority`
- Tables: `users`, `sessions`, `tickets`, `comments`
- Indexes on frequently queried columns

## Seed Data

```bash
pnpm db:seed
```

Seed script (`packages/db/src/seed.ts`) inserts:

**Users (5)** — all passwords: `Password123!`

| Username | Role  | Email              |
|----------|-------|--------------------|
| admin    | admin | admin@example.com  |
| agent1   | agent | agent1@example.com |
| agent2   | agent | agent2@example.com |
| user1    | user  | user1@example.com  |
| user2    | user  | user2@example.com  |

**Tickets (8)** — mix of statuses (open, in_progress, resolved, closed, cancelled) and priorities.

**Comments** — sample comments on select tickets.

## Schema Overview

See [`data-model.md`](../data-model.md) for full entity relationships.

## Generate New Migrations

After schema changes in `packages/db/src/schema/`:

```bash
pnpm db:generate
pnpm db:migrate
```

## Verify Persistence

1. Create a ticket via UI or API
2. Restart PostgreSQL: `docker compose restart`
3. Confirm ticket still exists

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `DATABASE_URL` not found | Ensure `.env` at monorepo root; API loads via `apps/api/src/load-env.ts` |
| Connection refused | Run `docker compose up -d` and wait for healthy status |
| Migration already applied | Safe to re-run; drizzle tracks applied migrations in `__drizzle_migrations` |
| Seed duplicate key errors | Drop and recreate DB, or truncate tables before re-seeding |
