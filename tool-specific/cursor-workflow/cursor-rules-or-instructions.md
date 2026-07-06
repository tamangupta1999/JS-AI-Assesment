# Cursor Rules and Instructions

These rules were used as persistent project context during development with Cursor AI.

## Project Rules

### Stack
- Use Next.js 16 App Router for frontend, Fastify 5 for backend
- PostgreSQL with Drizzle ORM — no raw SQL unless necessary
- Zod schemas in `packages/shared` — never duplicate validation logic
- pnpm workspaces monorepo structure

### Code Quality
- TypeScript strict mode everywhere
- ESM imports with `.js` extensions in backend packages
- Match existing naming: camelCase for variables, PascalCase for types
- Minimal comments — code should be self-explanatory
- No unnecessary abstractions or over-engineering

### Auth
- JWT access token in Authorization header (15 min expiry)
- Refresh token in httpOnly cookie, hashed in Postgres sessions table
- Never store raw tokens in database
- RBAC checked at API middleware, not just frontend

### State Machine
- Status transitions ONLY via `PATCH /tickets/:id/status`
- General `PATCH /tickets/:id` must NOT accept status field
- Use `isValidTransition()` from `@repo/shared` — single source of truth
- Return HTTP 409 with clear message on invalid transitions

### Security
- No secrets in code or git — use `.env`
- bcrypt with cost factor 12 for password hashing
- Validate all inputs with Zod at API boundary
- Parameterized queries via Drizzle (no SQL injection)

### Testing
- State machine integration tests are mandatory
- Test both valid transitions (200) and invalid transitions (409)
- Test terminal states reject all further changes

### Frontend
- Client-side AuthGuard for protected routes
- Display API validation errors in UI
- Status dropdown shows only valid next states from `getValidNextStatuses()`

## How to Provide Context to Cursor

1. Attach the assignment document for requirement analysis
2. Reference `tool-specific/cursor-workflow/project-context.md` for stack decisions
3. Reference `spec.md` for entity and API contracts
4. Use plan mode for architecture before implementation
5. Point to `packages/shared` when adding new validation rules
