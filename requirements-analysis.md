# Requirement Analysis

## Selected Project Option

**Support Ticket Management System** — backend-heavy full-stack option from the AI Capability Exercise.

## My Understanding (in your own words)

A small internal app for managing support tickets. Users create tickets with title, description, and priority. Tickets move through a defined lifecycle (open → in progress → resolved → closed, with cancellation paths). Users add comments for collaboration. The signature engineering challenge is enforcing the status state machine — invalid transitions must be rejected by the backend, not just hidden in the UI.

The exercise is not about building a large app — it is about demonstrating thoughtful AI-assisted engineering across the full lifecycle with visible artifacts.

## Functional Requirements

### Core (Mandatory)
- Create ticket with title, description, priority
- List all tickets from database
- View ticket detail
- Update ticket fields (title, description, priority, assignee)
- Change status only through valid state machine transitions
- Add comments to tickets
- Keyword search on title/description
- Filter by status
- Backend validation on all inputs
- Meaningful error states in UI
- Data persists across restarts
- Integration tests proving state machine rules

### Stretch (Implemented)
- Username/password registration and login
- JWT access tokens + Postgres session store (logout invalidation)
- Role-based access control (admin, agent, user)
- Protected frontend routes
- API authorization per role
- Filter by priority and assignee
- Sorting and pagination
- Admin user role management
- OpenAPI/Swagger documentation
- Docker Compose + CI workflow

## Non-Functional Requirements

- Scalable monorepo structure (pnpm + Turborepo)
- TypeScript throughout
- Shared validation between frontend and backend (Zod)
- No secrets in repository
- README with working setup instructions
- Latest stable library versions (Next.js 16, React 19, Fastify 5)
- Response time acceptable for local dev (no performance SLA)

## Assumptions

1. **Auth extension:** Assignment says auth is optional Stretch. User requested username/password auth with JWT + sessions — extended User entity with `username` and `password_hash`, added `sessions` table.
2. **User management UI:** Core says users are seeded only. Stretch adds admin role management page.
3. **Single-tenant:** No multi-organization support needed.
4. **Local development only:** No production deployment required.
5. **English UI:** No internationalization.
6. **Browser-only clients:** No mobile app.

## Clarifications (questions for a product owner)

1. Should regular users be able to assign tickets to others, or only agents/admins?
   - **Decision:** All authenticated users can assign on create/update; RBAC controls visibility.
2. Can a user reopen a closed ticket?
   - **Decision:** No — closed and cancelled are terminal states per assignment state machine.
3. Should comments be editable/deletable?
   - **Decision:** No — comments are append-only for audit simplicity.
4. Login with email or username?
   - **Decision:** Username (user preference during planning).

## Edge Cases

| Edge case | Handling |
|-----------|----------|
| Invalid status transition (e.g. open → closed) | Backend returns 409; UI shows error message |
| Status change via general PATCH | Rejected — status only via `/status` endpoint |
| Assignee UUID does not exist | 400 "Assignee not found" |
| User tries to access another user's ticket | 403 for `user` role; agents/admins see all |
| Empty title or description on create | 400 validation error with field details |
| Search with special characters | ILIKE pattern matching; SQL injection prevented by ORM |
| Expired JWT | Client attempts refresh; redirects to login on failure |
| Duplicate username on register | 409 conflict |
| Terminal status transition attempt | 409 with clear message |
| Ticket with no assignee | `assigned_to` nullable; displays as unassigned |
| Concurrent status updates | Last write wins (no optimistic locking — acceptable for exercise scope) |
