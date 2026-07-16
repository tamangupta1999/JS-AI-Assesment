# Review Fixes

Changes made after AI-assisted and manual code review. Each fix links to the review finding that triggered it.

## Fix 1 — AuthGuard replaces Next.js middleware

**Finding:** Cross-origin cookie auth broken — middleware on :3000 cannot read cookies from :4000.  
**Review reference:** `code-review-notes.md` → Security issue  
**Debug reference:** `debugging-notes.md` → Issue 1

**Changes:**
| File | Change |
|------|--------|
| `apps/web/src/components/auth-guard.tsx` | New — client-side route protection |
| `apps/web/src/components/auth-provider.tsx` | Stores access token in context |
| `apps/web/src/app/tickets/layout.tsx` | Wraps children with AuthGuard |
| `apps/web/src/app/admin/layout.tsx` | Wraps children with AuthGuard |
| Next.js `middleware.ts` | Removed auth logic |

**Verified:** Login flow works. Protected routes redirect when unauthenticated. Integration tests pass.

---

## Fix 2 — Root environment loader

**Finding:** `DATABASE_URL` not found when API runs from `apps/api` cwd.  
**Review reference:** Build failure during dev startup  
**Debug reference:** `debugging-notes.md` → Issue 2

**Changes:**
| File | Change |
|------|--------|
| `apps/api/src/load-env.ts` | New — loads root `.env` via `import.meta.url` |
| `apps/api/src/server.ts` | Import `load-env.js` first; remove `dotenv/config` |
| `apps/api/tests/setup.ts` | Reuse same load-env module |
| `apps/web/.env` | `NEXT_PUBLIC_API_URL` for Next.js |
| `README.md` | Document monorepo env layout |

**Verified:** API starts from any cwd. Health check OK. Tests pass.

---

## Fix 3 — Ticket list query simplification

**Finding:** Complex raw SQL join caused TypeScript errors.  
**Review reference:** `code-review-notes.md` → Code quality  
**Debug reference:** `debugging-notes.md` → Issue 3

**Changes:**
| File | Change |
|------|--------|
| `apps/api/src/routes/tickets.ts` | Two-step query: select tickets, batch-fetch users, Map enrichment |

**Verified:** List endpoint returns assigneeName/creatorName. Build passes. Search/filter work.

---

## Fix 4 — Missing drizzle-orm dependency

**Finding:** Build error — `drizzle-orm` operators imported but not in API package deps.  
**Review reference:** Build failure during `pnpm build`

**Changes:**
| File | Change |
|------|--------|
| `apps/api/package.json` | Added `drizzle-orm` dependency |

**Verified:** `pnpm build` passes for API package.

---

## Fix 5 — Assignee existence validation

**Finding:** Review noted UUID format validated but user existence not checked.  
**Review reference:** `code-review-notes.md` → Validation

**Changes:**
| File | Change |
|------|--------|
| `apps/api/src/routes/tickets.ts` | Check assignee exists in users table before insert/update |

**Verified:** POST/PATCH with non-existent assignee UUID returns 400.

---

## Fix 6 — Status endpoint documentation

**Finding:** Review confirmed correct isolation but code lacked intent comment.  
**Review reference:** `code-review-notes.md` → State machine

**Changes:**
| File | Change |
|------|--------|
| `apps/api/src/routes/tickets.ts` | Comment on status endpoint explaining intentional separation |

**Verified:** No functional change. Intent clear for future maintainers.
