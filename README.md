# UniBoard

UniBoard is a multi-platform SaaS demo that showcases clean architecture, testing strategy, and DevOps practices across interchangeable backends (.NET / Java) and frontends (React / Angular).

## Current Scope

- [ ] Backend bootstrap (.NET / Java)
- [ ] Domain and application layers
- [ ] Infrastructure setup (PostgreSQL, Redis, queues)
- [ ] Frontend (React / Angular)
- [ ] CI/CD and infrastructure as code
- [ ] Shared guidelines for commits and comments

## Backend (.NET) – authentication

- `POST /api/auth/register` creates a user (the first one becomes Admin).
- `POST /api/auth/login` returns an access token plus refresh token.
- `POST /api/auth/refresh` issues a fresh token pair when the refresh token is valid.
- Project and task endpoints require JWT; delete operations are limited to Admin.

## Frontend (React + TypeScript)

- Lives in `apps/uniboard-frontend` (Vite, React Router, Material UI, Zustand, React Query).
- Pages: Login, Register, Dashboard (lists and manages projects/tasks via the API).
- Supports creating/deleting projects, viewing project tasks, creating tasks, and updating task status.
- Tokens are persisted in `localStorage`; backend URL comes from `VITE_API_URL` (defaults to `http://localhost:5174`).
- Run locally with `npm install` followed by `npm run dev` inside the frontend directory.

## Local Development

Instructions for running the full stack will be added as the project grows. The end goal is to run everything through `docker compose -f docker-compose.dev.yml up --build`.
