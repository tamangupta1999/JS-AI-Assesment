# Code Review Notes

## AI-Assisted Review Summary

Used Cursor to review generated code across three focus areas:
1. State machine bypass paths
2. RBAC enforcement on all endpoints
3. Secrets and security hygiene

AI flagged one significant issue (cross-origin cookie auth) and confirmed correct patterns on state machine isolation and input validation.

## My Review Observations

### State machine (correct)
- `VALID_TRANSITIONS` centralized in `packages/shared/src/constants/index.ts`
- `updateTicketSchema` excludes `status` field — cannot bypass via general PATCH
- `PATCH /tickets/:id/status` is sole status change path
- `validateStatusTransition()` called before DB update
- HTTP 409 with human-readable error on invalid transition
- Frontend dropdown uses `getValidNextStatuses()` — defense in depth

### RBAC (correct)
- `createAuthenticate()` middleware on all protected routes
- `canAccessTicket()` on GET detail and comments
- `canModifyTicket()` on PATCH and status change
- User role filtered at SQL level in list query (not just UI)
- Admin-only routes use `authorize("admin")` middleware
- Register always assigns `user` role — no privilege escalation

### Validation (correct)
- All inputs validated via Zod `safeParse()` before DB operations
- Assignee UUID verified against users table (not just format check)
- Shared schemas in `@repo/shared` — FE/BE parity possible

### Security (one issue found)
- **Issue:** Next.js middleware cannot read API httpOnly cookies (cross-origin)
- **Severity:** High — auth completely broken for protected routes
- **Resolution:** Client-side AuthGuard with Bearer token (see review-fixes.md)

### Code quality
- Consistent error response shape: `{ error, details? }`
- ESM modules throughout
- No `any` types in route handlers
- Indexes on frequently queried columns

## Changes Made After Review

See [`review-fixes.md`](review-fixes.md) for detailed fix list.

Summary:
1. Replaced middleware auth with AuthGuard
2. Added root env loader
3. Simplified ticket list query
4. Added missing drizzle-orm dependency

## Suggestions Rejected (and why)

| AI suggestion | Why rejected |
|---------------|-------------|
| NextAuth.js for frontend auth | Adds framework dependency; custom JWT pattern already working |
| Database CHECK constraint for status transitions | API enforcement + tests is clearer and easier to change |
| GraphQL instead of REST | Assignment expects REST; integration tests simpler |
| Soft deletes on tickets | Not required; adds query complexity |
| Same-origin proxy for API | Bearer token pattern is standard and simpler |
| Skip integration tests, mock DB | Real Postgres tests catch actual issues |
