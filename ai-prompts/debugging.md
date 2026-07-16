# AI Prompts — Debugging

Activity: diagnosing and fixing runtime/build issues with AI assistance.

---

### Prompt 1 — Cross-origin cookie auth failure

**Prompt:** (Discovered during testing) Auth not persisting between API (:4000) and Next.js (:3000).

**AI Response:** Identified root cause: Next.js middleware cannot read httpOnly cookies set by API on different origin/port. Refresh cookie is httpOnly (correct for security) but inaccessible to Next.js middleware for route protection.

**Accepted:** Replace Next.js middleware auth with client-side `AuthGuard` component. Access token stored in AuthProvider memory. API calls use Bearer header.

**Changed:** Removed `middleware.ts` auth check. Added `AuthGuard` wrapping protected layouts.

**Rejected:** Same-origin proxy setup — adds complexity; Bearer token pattern is standard for SPA + API.

---

### Prompt 2 — DATABASE_URL not found

**Prompt:** Env variables not loading — DATABASE_URL missing when starting API.

**AI Response:** Traced env loading: `dotenv/config` resolves `.env` relative to `process.cwd()` which is `apps/api` when Turbo runs the dev task. Actual `.env` is at monorepo root.

**Accepted:** Created `apps/api/src/load-env.ts` that resolves root `.env` via `import.meta.url` path traversal. Imported first in server.ts and test setup.

**Changed:** Updated README with monorepo env layout documentation.

**Rejected:** Setting DATABASE_URL in shell profile — not portable across team members.

---

### Prompt 3 — Ticket list query failure

**Prompt:** (Build/runtime error) Ticket list endpoint failing with complex join query.

**AI Response:** Original AI-generated query used raw SQL joins that caused type errors and complexity. Simplified to: select tickets with drizzle, collect user IDs, batch-fetch users, enrich in application code.

**Accepted:** Two-step query pattern — simpler, type-safe, adequate performance for exercise scale.

**Changed:** Replaced raw SQL join with `inArray` user lookup + Map enrichment.

**Rejected:** Keeping complex join — harder to maintain, no performance benefit at this data volume.

---

### Prompt 4 — Missing drizzle-orm dependency

**Prompt:** (Build error) drizzle-orm module not found in API package.

**AI Response:** API package imported from `@repo/db` which re-exports drizzle, but `drizzle-orm` operators (eq, and, or) used directly in route files needed explicit dependency.

**Accepted:** Added `drizzle-orm` to `apps/api/package.json` dependencies.

**Changed:** Nothing else — straightforward missing dep.

**Rejected:** Moving all query logic to db package — route-level queries are fine with proper deps.
