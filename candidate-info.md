# Candidate Information

Name: [YOUR NAME]  
Role: [YOUR ROLE]  
Primary Technology Stack: Next.js 16 / Node.js (Fastify) / PostgreSQL / TypeScript

Primary AI Tool Used: Cursor  
Project Option Selected: Support Ticket Management System (Backend-heavy)

Assessment Start Date: [START DATE]  
Submission Date: [SUBMISSION DATE]

## Project Summary

Full-stack Support Ticket Management System built as part of the Cursor AI Capability Exercise. Users create, update, comment on, and progress tickets through an enforced status state machine. Includes authentication, RBAC, search/filter, and comprehensive lifecycle artifacts documenting AI-assisted development.

## Tools Used

| Tool | Purpose |
|------|---------|
| Cursor | Primary AI assistant — planning, codegen, debugging, review |
| Next.js 16 | Frontend framework |
| Fastify 5 | Backend API |
| PostgreSQL 16 | Database |
| Drizzle ORM | Schema, migrations, queries |
| Zod | Shared validation |
| Vitest | Unit and integration tests |
| Docker Compose | Local PostgreSQL |
| GitHub Actions | CI pipeline |
| pnpm + Turborepo | Monorepo management |

## Setup Summary

```bash
cp .env.example .env
docker compose up -d
pnpm install
pnpm db:migrate && pnpm db:seed
pnpm dev
```

- Frontend: http://localhost:3000
- API: http://localhost:4000
- API Docs: http://localhost:4000/docs
- Seed password for all users: `Password123!`

See [`README.md`](README.md) and [`database/setup-notes.md`](database/setup-notes.md) for full instructions.
