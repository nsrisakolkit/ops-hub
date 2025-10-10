# Ops Hub Frontend

Next.js 15 App Router frontend for Ops Hub. The app follows a Backend-for-Frontend pattern: UI pages call internal `/app/api/*` route handlers that proxy to the NestJS API, manage HttpOnly access/refresh cookies, and retry requests after token refresh.

## Quick Start

The easiest way to run the frontend is via the root docker-compose stack:

```bash
cp backend/.env.example backend/.env
docker compose up --build
```

This launches PostgreSQL, Redis, the NestJS backend, and the Next.js frontend on http://localhost:3001.

## Running Locally Without Docker

```bash
cd frontend
echo "BACKEND_API_URL=http://localhost:3000/api" > .env.local
npm install
npm run dev
```

Keep the backend running separately (either via `npm run dev:backend` from the repo root or by running the backend service inside Docker). The BFF route handlers require `BACKEND_API_URL` to resolve outbound requests.

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start the Next.js development server |
| `npm run build` | Create a production build |
| `npm run start` | Run the production server |
| `npm run lint` | Lint the codebase with ESLint |

## Tech Notes

- Server Components by default; opt into client components with `"use client"` when interactivity is required.
- Styling via Tailwind CSS + `tailwind-merge` for variant handling.
- Auth tokens remain in HttpOnly cookies; client components never read tokens directly.
- All network calls should go through shared fetch utilities under `src/app` or `src/lib/server` to ensure refresh + cookie handling stays consistent.
