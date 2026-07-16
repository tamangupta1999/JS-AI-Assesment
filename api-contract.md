# API Contract

Base URL: `http://localhost:4000`  
Auth: `Authorization: Bearer <accessToken>` on protected routes  
OpenAPI: `GET /docs`

---

## Auth Endpoints

### POST /auth/register

**Purpose:** Register new user (role defaults to `user`)

**Request:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "name": "John Doe",
  "password": "Password123!"
}
```

**Validation:**
- username: 3–50 chars, alphanumeric + underscore
- email: valid email format
- name: 1–100 chars
- password: 8–128 chars

**Response (201):**
```json
{
  "accessToken": "<jwt>",
  "user": { "id": "uuid", "username": "johndoe", "email": "...", "name": "...", "role": "user" }
}
```

**Errors:** 400 validation, 409 username/email exists

---

### POST /auth/login

**Purpose:** Authenticate and receive tokens

**Request:**
```json
{ "username": "admin", "password": "Password123!" }
```

**Response (200):**
```json
{
  "accessToken": "<jwt>",
  "user": { "id": "uuid", "username": "admin", "email": "...", "name": "...", "role": "admin" }
}
```

Sets `refreshToken` httpOnly cookie.

**Errors:** 400 validation, 401 invalid credentials

---

### POST /auth/refresh

**Purpose:** Refresh access token using refresh cookie

**Response (200):** Same shape as login

**Errors:** 401 missing/expired refresh token

---

### POST /auth/logout

**Purpose:** Invalidate session and clear cookie  
**Auth:** Required

**Response (200):**
```json
{ "message": "Logged out successfully" }
```

---

### GET /auth/me

**Purpose:** Get current authenticated user  
**Auth:** Required

**Response (200):**
```json
{ "user": { "id": "uuid", "username": "...", "role": "..." } }
```

---

## Ticket Endpoints

### GET /tickets

**Purpose:** List tickets with search, filter, sort, pagination  
**Auth:** Required

**Query params:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| q | string | — | Keyword search (title, description) |
| status | enum | — | open, in_progress, resolved, closed, cancelled |
| priority | enum | — | low, medium, high, urgent |
| assignedTo | uuid | — | Filter by assignee |
| sort | enum | createdAt | createdAt, updatedAt, priority, status |
| order | enum | desc | asc, desc |
| page | int | 1 | Page number |
| limit | int | 20 | Items per page (max 100) |

**Response (200):**
```json
{
  "tickets": [{ "id": "uuid", "title": "...", "status": "open", "assigneeName": "...", "creatorName": "..." }],
  "pagination": { "page": 1, "limit": 20, "total": 8, "totalPages": 1 }
}
```

RBAC: `user` role sees only own + assigned tickets.

---

### POST /tickets

**Purpose:** Create ticket  
**Auth:** Required

**Request:**
```json
{
  "title": "Login page broken",
  "description": "Users cannot log in on mobile",
  "priority": "high",
  "assignedTo": "uuid-or-null"
}
```

**Validation:** title 1–200 chars, description 1–5000 chars, priority enum, assignedTo valid UUID

**Response (201):**
```json
{ "ticket": { "id": "uuid", "title": "...", "status": "open", "createdBy": "uuid", ... } }
```

**Errors:** 400 validation/assignee not found

---

### GET /tickets/:id

**Purpose:** Ticket detail with assignee and creator info  
**Auth:** Required

**Response (200):**
```json
{
  "ticket": {
    "id": "uuid", "title": "...", "status": "open",
    "assignee": { "id": "uuid", "name": "...", "username": "..." },
    "creator": { "id": "uuid", "name": "...", "username": "..." }
  }
}
```

**Errors:** 404 not found, 403 access denied

---

### PATCH /tickets/:id

**Purpose:** Update ticket fields (NOT status)  
**Auth:** Required

**Request:**
```json
{
  "title": "Updated title",
  "description": "Updated description",
  "priority": "urgent",
  "assignedTo": "uuid"
}
```

All fields optional. Status field is NOT accepted here.

**Response (200):**
```json
{ "ticket": { ... } }
```

**Errors:** 400 validation, 403 access denied, 404 not found

---

### PATCH /tickets/:id/status

**Purpose:** Change ticket status via state machine  
**Auth:** Required

**Request:**
```json
{ "status": "in_progress" }
```

**Valid transitions:**
- open → in_progress, cancelled
- in_progress → resolved, cancelled
- resolved → closed

**Response (200):**
```json
{ "ticket": { "id": "uuid", "status": "in_progress", ... } }
```

**Errors:** 409 invalid transition with message like `"Cannot transition from open to resolved"`

---

### GET /tickets/:id/comments

**Purpose:** List comments on ticket  
**Auth:** Required

**Response (200):**
```json
{
  "comments": [
    { "id": "uuid", "message": "...", "authorName": "...", "createdAt": "..." }
  ]
}
```

---

### POST /tickets/:id/comments

**Purpose:** Add comment to ticket  
**Auth:** Required

**Request:**
```json
{ "message": "Investigating this issue now." }
```

**Validation:** message 1–2000 chars

**Response (201):**
```json
{ "comment": { "id": "uuid", "ticketId": "uuid", "message": "...", "createdBy": "uuid" } }
```

---

## User Endpoints (Admin Only)

### GET /users

**Purpose:** List all users  
**Auth:** Admin required

**Response (200):**
```json
{ "users": [{ "id": "uuid", "username": "...", "role": "agent", ... }] }
```

---

### PATCH /users/:id/role

**Purpose:** Update user role  
**Auth:** Admin required

**Request:**
```json
{ "role": "agent" }
```

**Response (200):**
```json
{ "user": { "id": "uuid", "role": "agent", ... } }
```

---

## Health

### GET /health

**Response (200):**
```json
{ "status": "ok" }
```
