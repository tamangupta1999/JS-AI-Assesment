# Specification

## Entities

### User
- id (uuid), username (unique), email (unique), name, password_hash, role (admin|agent|user)
- created_at, updated_at

### Session
- id (uuid), user_id (FK), token_hash, expires_at, created_at

### Ticket
- id (uuid), title, description, priority (low|medium|high|urgent)
- status (open|in_progress|resolved|closed|cancelled)
- assigned_to (FK, nullable), created_by (FK)
- created_at, updated_at

### Comment
- id (uuid), ticket_id (FK), message, created_by (FK), created_at

## State Machine

| From | To |
|------|-----|
| open | in_progress, cancelled |
| in_progress | resolved, cancelled |
| resolved | closed |
| closed | (terminal) |
| cancelled | (terminal) |

## API Endpoints

### Auth
- POST /auth/register — { username, email, name, password }
- POST /auth/login — { username, password }
- POST /auth/refresh — refresh access token via cookie
- POST /auth/logout — invalidate session
- GET /auth/me — current user

### Tickets
- GET /tickets — list with q, status, priority, assignedTo, sort, order, page, limit
- POST /tickets — create
- GET /tickets/:id — detail
- PATCH /tickets/:id — update fields (not status)
- PATCH /tickets/:id/status — change status (state machine enforced)

### Comments
- GET /tickets/:id/comments
- POST /tickets/:id/comments — { message }

### Users (admin)
- GET /users
- PATCH /users/:id/role — { role }

## Frontend Pages

- /login, /register — public
- /tickets — list with search/filters/pagination
- /tickets/new — create form
- /tickets/[id] — detail, edit, status, comments
- /admin/users — role management (admin only)

## Auth Flow

1. Login → API returns accessToken (JSON) + sets refreshToken (httpOnly cookie)
2. API calls use Authorization: Bearer {accessToken}
3. Access token expires → client calls POST /auth/refresh
4. Logout → deletes session row + clears cookie
