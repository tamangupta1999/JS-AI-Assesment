# Debugging Notes

## Issue 1 — Cross-origin auth cookies not readable by Next.js middleware

### Problem
After login, protected pages redirected back to `/login`. Session appeared lost despite successful API authentication.

### How I Investigated
1. Confirmed API login returned 200 with accessToken in response body
2. Checked browser DevTools — refresh cookie set on `localhost:4000` domain
3. Next.js middleware runs on `localhost:3000` — different origin, cannot read API cookies
4. Asked Cursor to diagnose auth flow architecture

### How AI Helped
AI identified root cause: httpOnly refresh cookie on API origin is invisible to Next.js middleware on frontend origin. Suggested client-side AuthGuard with Bearer token instead.

### What I Validated
- Removed middleware auth check
- Added AuthGuard component wrapping protected layouts
- Confirmed login → redirect to /tickets works
- Confirmed 401 triggers refresh attempt then login redirect
- Integration tests still pass (16/16)

### Final Fix
- Removed Next.js `middleware.ts` auth logic
- Created `apps/web/src/components/auth-guard.tsx`
- Access token stored in AuthProvider context (memory)
- API client sends `Authorization: Bearer` header

---

## Issue 2 — DATABASE_URL not found on API startup

### Problem
Running `pnpm dev` failed with `DATABASE_URL` environment variable not set, despite `.env` file existing.

### How I Investigated
1. Confirmed `.env` exists at monorepo root with correct `DATABASE_URL`
2. Traced import chain: `server.ts` → `dotenv/config` → looks in `process.cwd()`
3. Turbo runs API from `apps/api` directory — dotenv looks there, not root
4. Cursor diagnosed cwd mismatch in monorepo setup

### How AI Helped
AI proposed explicit root `.env` loader using `import.meta.url` to resolve path relative to source file, independent of cwd.

### What I Validated
- Created `apps/api/src/load-env.ts`
- Imported it first in `server.ts` and `tests/setup.ts`
- Started API from `apps/api` cwd — health check returns `{"status":"ok"}`
- Integration tests pass with same env loading

### Final Fix
- `apps/api/src/load-env.ts` loads `../../../.env` from file location
- `apps/web/.env` added for `NEXT_PUBLIC_API_URL`
- README updated with monorepo env layout

---

## Issue 3 — Ticket list query type errors and complexity

### Problem
AI-generated ticket list endpoint used complex raw SQL joins causing TypeScript errors and runtime issues.

### How I Investigated
1. `pnpm build` failed on ticket route with type errors in join query
2. Reviewed generated SQL — unnecessary complexity for simple user name enrichment
3. Asked Cursor to simplify while keeping functionality

### How AI Helped
AI suggested two-step approach: fetch tickets with drizzle, collect user IDs, batch-fetch users with `inArray`, enrich in application code with Map lookup.

### What I Validated
- Ticket list returns correct data with assigneeName and creatorName
- Search, filter, pagination still work
- TypeScript build passes
- No N+1 query issue (single batch user fetch)

### Final Fix
Simplified query in `apps/api/src/routes/tickets.ts` — select tickets, then `inArray` user lookup, Map enrichment.
