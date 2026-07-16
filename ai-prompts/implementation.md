# AI Prompts — Implementation

Activity: code generation, scaffolding, build fixes.

---

### Prompt 1 — Monorepo scaffold

**Prompt:** Implement plan — start monorepo scaffold.

**AI Response:** Created root package.json, pnpm-workspace.yaml, turbo.json, tsconfig.base.json. Scaffolded apps/api, apps/web, packages/db, packages/shared with package.json and tsconfig files.

**Accepted:** Full monorepo structure with ESM modules throughout.

**Changed:** Added `fastify-plugin` dependency for db plugin encapsulation.

**Rejected:** npm instead of pnpm — pnpm better for monorepo workspace deduplication.

---

### Prompt 2 — Database schema generation

**Prompt:** Create Drizzle schema for users, sessions, tickets, comments.

**AI Response:** Generated schema files with pgEnum types, foreign keys, indexes. Ran drizzle-kit generate for migration SQL.

**Accepted:** All four tables with proper FK constraints and indexes on query columns.

**Changed:** Added `onDelete: set null` for assigned_to — ticket survives assignee deletion.

**Rejected:** Soft deletes — not required by assignment; adds query complexity.

---

### Prompt 3 — API routes generation

**Prompt:** Build Fastify routes for auth, tickets, comments, users.

**AI Response:** Generated route modules with Zod validation, RBAC checks, state machine enforcement on status endpoint. Swagger plugin configured.

**Accepted:** All endpoints from spec.md implemented with proper error codes.

**Changed:** Ticket list query simplified from raw SQL joins to drizzle select + separate user enrichment — cleaner and easier to maintain.

**Rejected:** GraphQL API — REST matches assignment and is simpler for integration tests.

---

### Prompt 4 — Frontend pages

**Prompt:** Scaffold Next.js 16 App Router pages for all routes.

**AI Response:** Created login, register, ticket list/create/detail, admin users pages. AuthProvider for token management. Tailwind CSS 4 styling.

**Accepted:** All pages with form validation and API error display.

**Changed:** Replaced Next.js middleware auth with client-side AuthGuard — see debugging.md for reason.

**Rejected:** Server Components for all data fetching — client-side fetch simpler with JWT Bearer token pattern.

---

### Prompt 5 — Build error fixes

**Prompt:** (Implicit from build failures) Fix TypeScript and dependency errors.

**AI Response:** Added missing `drizzle-orm` to API dependencies. Fixed error handler type annotations. Fixed ticket list query types.

**Accepted:** All fixes applied; `pnpm build` passes for api and web.

**Changed:** Error handler uses proper Fastify error types instead of `any`.

**Rejected:** Disabling strict TypeScript — masks real issues.

---

### Prompt 6 — Env loading fix

**Prompt:** Why are env variables not loading? DATABASE_URL missing.

**AI Response:** Diagnosed: `dotenv/config` looks in `apps/api` cwd but `.env` is at monorepo root. Created `load-env.ts` with explicit path resolution from file location.

**Accepted:** Root `.env` loader imported first in server.ts and test setup.

**Changed:** Added `apps/web/.env` for Next.js `NEXT_PUBLIC_*` vars with README symlink instructions.

**Rejected:** Copying `.env` into each app directory — single source of truth at root is cleaner.
