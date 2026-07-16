# AI Prompts — Code Review

Activity: AI-assisted and manual code review of generated code.

---

### Prompt 1 — State machine bypass review

**Prompt:** Verify status cannot be changed through general PATCH endpoint.

**AI Response:** Reviewed `updateTicketSchema` — does not include `status` field. `PATCH /tickets/:id` only accepts title, description, priority, assignedTo. Status changes isolated to `PATCH /tickets/:id/status` with `validateStatusTransition()`.

**Accepted:** Confirmed no bypass path. Schema-level exclusion is correct defense.

**Changed:** Added explicit comment in route file documenting intentional exclusion.

**Rejected:** Adding status to updateTicketSchema with validation — separate endpoint is clearer API design.

---

### Prompt 2 — RBAC audit

**Prompt:** Review all protected routes for proper authorization checks.

**AI Response:** Audited auth middleware on all ticket/user routes. Verified `canAccessTicket()` on GET detail and comments. Verified `canModifyTicket()` on PATCH and status. Admin-only guard on user routes.

**Accepted:** RBAC consistent across all endpoints.

**Changed:** User role list query filtered to own + assigned tickets at SQL level — not just UI hiding.

**Rejected:** Relying on frontend-only access control — backend must enforce all permissions.

---

### Prompt 3 — Secrets audit

**Prompt:** Verify no secrets committed to repository.

**AI Response:** Checked `.gitignore` includes `.env`. Only `.env.example` with placeholder values in repo. JWT secrets use `change-me-*` placeholders. Seed passwords documented in README for local dev only.

**Accepted:** No real secrets in committed files.

**Changed:** Added note in README that seed passwords are dev-only.

**Rejected:** Committing `.env` with dev secrets — security risk even for exercise repos.

---

### Prompt 4 — AI mistake review

**Prompt:** Review AI-generated auth middleware approach for security issues.

**AI Response:** Found cross-origin cookie issue (see debugging.md). AI initially suggested Next.js middleware for auth — incorrect for separate API origin.

**Accepted:** Identified and fixed AuthGuard approach.

**Changed:** Replaced middleware pattern entirely.

**Rejected:** Keeping middleware with `@fastify/cookie` proxy hack — fragile and non-standard.

---

### Prompt 5 — Input validation review

**Prompt:** Check all API inputs validated before database operations.

**AI Response:** All route handlers use `safeParse()` on Zod schemas before DB calls. Query params validated via `ticketQuerySchema`. Assignee UUID verified against users table before insert/update.

**Accepted:** Validation pattern consistent across all endpoints.

**Changed:** Added assignee existence check (not just UUID format validation).

**Rejected:** Trusting frontend validation alone — backend validation is mandatory.
