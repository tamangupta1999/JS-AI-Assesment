# AI Prompts — Design

Activity: architecture decisions, data model, API contract, RBAC design.

---

### Prompt 1 — Monorepo structure design

**Prompt:** (From plan mode) Design scalable project structure for ticket system with shared validation.

**AI Response:** Proposed pnpm workspaces + Turborepo with four packages: api, web, db, shared. Shared package holds Zod schemas and state machine constants.

**Accepted:** Four-package split. Zod in shared package for FE/BE parity.

**Changed:** Named backend Fastify instead of plain Express — better TypeScript support and plugin ecosystem.

**Rejected:** Duplicating validation schemas in frontend and backend — single source of truth in shared package.

---

### Prompt 2 — State machine design

**Prompt:** (From assignment analysis) Enforce status transitions per assignment rules.

**AI Response:** Defined `VALID_TRANSITIONS` map in shared constants. Separate `PATCH /tickets/:id/status` endpoint. General PATCH excludes status field.

**Accepted:** Centralized transition map, dedicated status endpoint, HTTP 409 on invalid transitions.

**Changed:** Added `getValidNextStatuses()` helper for frontend dropdown population.

**Rejected:** Database-level CHECK constraint for transitions — harder to test and maintain; API layer enforcement with tests is clearer.

---

### Prompt 3 — Auth flow design

**Prompt:** JWT + Postgres session store — how should tokens work?

**AI Response:** Access token (15min) in Authorization header. Refresh token in httpOnly cookie. Session row in Postgres with hashed token for logout invalidation.

**Accepted:** Dual-token pattern with server-side session invalidation on logout.

**Changed:** bcrypt cost factor 12 for password hashing.

**Rejected:** Storing refresh token in localStorage — XSS risk; httpOnly cookie is safer.

---

### Prompt 4 — RBAC matrix

**Prompt:** (From spec generation) Define role permissions for tickets and users.

**AI Response:** Three roles: admin (full access), agent (all tickets), user (own + assigned only). Admin-only user management.

**Accepted:** Role matrix with `canAccessTicket()` and `canModifyTicket()` helpers in route handlers.

**Changed:** Agents can modify all tickets but cannot manage user roles.

**Rejected:** Per-ticket permission ACLs — over-engineered for exercise scope.

---

### Prompt 5 — Cursor workflow artifacts

**Prompt:** Create persistent project context for Cursor spec-driven development.

**AI Response:** Generated `tool-specific/cursor-workflow/` with project-context.md, spec.md, tasks.md, acceptance-criteria.md, cursor-rules-or-instructions.md.

**Accepted:** Full cursor-workflow folder as required by assessment for Cursor tool choice.

**Changed:** Added `.cursor/rules/support-ticket-system.mdc` for IDE-level persistent rules.

**Rejected:** Keeping specs only in chat history — not reusable across sessions.
