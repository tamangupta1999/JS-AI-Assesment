# AI Prompts — Planning

Activity: requirement analysis, clarification, architecture planning.

---

### Prompt 1 — Initial project request

**Prompt:** Read attached assignment docx. Build full-stack Support Ticket Management System — Next.js frontend, Node.js backend, PostgreSQL. Scalable structure, best code quality. Latest Node/Next.js versions. Username/password auth with JWT + session + roles. Ask follow-up questions if needed.

**AI Response:** Extracted docx via shell. Identified Support Ticket Management System as project option. Listed Core vs Stretch requirements. Asked structured clarification questions about login identifier and auth pattern.

**Accepted:** Project choice, tech stack (Next.js + Fastify + PostgreSQL), monorepo approach, clarification-before-coding workflow.

**Changed:** Assignment User entity has no username — extended with username field per user choice.

**Rejected:** Starting code immediately without clarifications — auth design had multiple valid patterns.

---

### Prompt 2 — Auth clarification

**Prompt:** (Structured question) Login with email or username? JWT + session pattern preference?

**AI Response:** Presented three options each for login identifier and auth strategy.

**Accepted:** Username + password login. JWT for API auth + Postgres session store for logout invalidation.

**Changed:** Nothing — user selections matched recommended options.

**Rejected:** NextAuth.js on frontend — adds framework dependency; custom JWT + session gives more control and matches backend-first design.

---

### Prompt 3 — Plan mode architecture

**Prompt:** Implement the plan as specified. Do not edit plan file. Mark todos in progress.

**AI Response:** Produced monorepo architecture plan: apps/api (Fastify), apps/web (Next.js 16), packages/db, packages/shared. Full API endpoint list, RBAC matrix, state machine rules, phase breakdown.

**Accepted:** Monorepo layout, Drizzle ORM, Zod shared validation, separate status endpoint, phase ordering.

**Changed:** Added sessions table beyond assignment minimum — needed for server-side logout.

**Rejected:** Flat single-package structure — monorepo better for shared validation and separation of concerns.

---

### Prompt 4 — Assessment artifact completion (later session)

**Prompt:** Analyse updated assessment document. Many changes around prompt history storage and submission templates. Check current structure, build remaining required details for AI reviewer scoring.

**AI Response:** Compared document requirements vs repo. Identified 18+ missing lifecycle artifacts, wrong prompt-history folder structure. Created completion plan with phased execution.

**Accepted:** Restructure to `ai-prompts/`, fill all submission templates with real content, run tests for evidence.

**Changed:** Keep monorepo layout — document mapping in README instead of moving to `src/`.

**Rejected:** Duplicating migration files into `database/` — pointer docs to `packages/db/` instead.
