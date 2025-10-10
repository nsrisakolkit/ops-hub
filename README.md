# Ops Hub - Project Management Platform

**Getting started**
1. `git clone <repository-url>`
2. `cd ops-hub`
3. `cp backend/.env.example backend/.env` (adjust secrets as needed)
4. `docker compose up --build`
5. Open http://localhost:3001

The stack comes up with PostgreSQL, Redis, the NestJS backend, and the Next.js frontend. Press `Ctrl+C` to stop; use `docker compose down` to remove containers (volumes stay unless `--volumes` is passed).

## Project Structure

```
ops-hub/
├── backend/             # NestJS API (Prisma, Redis, JWT auth, REST + GraphQL)
├── frontend/            # Next.js 15 App Router frontend (BFF + Tailwind)
├── docker-compose.yml   # Local Docker workflow (frontend, backend, db, redis)
└── package.json         # Workspace scripts for combined tasks
```

## Quick Start

### Prerequisites
- Docker & Docker Compose v2+
- (Optional) Node.js 18+ if you want to run the apps outside Docker

### One-Click Development Environment

`docker compose up --build` orchestrates Postgres, Redis, the NestJS API (`backend`), and the BFF-style Next.js frontend (`frontend`). On first run, dependencies are installed, Prisma migrations + seed execute, and both servers start in watch mode. Named volumes cache dependencies for faster restarts.

Services will be available at:

- Frontend (Next.js): http://localhost:3001
- Backend (NestJS): http://localhost:3000
- API docs (Swagger): http://localhost:3000/api
- PostgreSQL: `localhost:5433`
- Redis: `localhost:6379`

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start backend + frontend locally (requires Node 18+) |
| `npm run dev:backend` | Start the NestJS API in watch mode |
| `npm run dev:frontend` | Start the Next.js frontend |
| `npm run build` | Build both workspaces |
| `npm run test` | Run backend + frontend test suites |
| `npm run lint` | Lint backend + frontend |
| `npm run docker:up` | Start the docker-compose stack in the background |
| `npm run docker:down` | Stop and remove compose containers |
| `npm run prisma:studio` | Open Prisma Studio against the running Postgres |

### Running Outside Docker

If you prefer to run the apps without Docker:

1. Start dependencies: `npm run docker:up`
2. Copy backend env: `cp backend/.env.example backend/.env`
3. Install deps: `npm install`
4. In one terminal `npm run dev:backend`, in another `npm run dev:frontend`

The frontend relies on BFF route handlers under `/app/api/*` that proxy requests to the backend and handle token refreshes. Set `BACKEND_API_URL` (e.g. `http://localhost:3000/api`) in `frontend/.env.local` when running outside Docker.

## Backend (NestJS)

Located in `./backend/` directory. Features:

- **Authentication**: JWT-based auth with role-based access control
- **Database**: PostgreSQL with Prisma ORM
- **Caching**: Redis for session and data caching
- **API Documentation**: Swagger/OpenAPI
- **Validation**: Class-validator with custom pipes
- **Logging**: Structured logging with Pino
- **File Upload**: Multer integration
- **Real-time**: WebSocket support for notifications
- **Queue Processing**: Bull queues for background tasks

### Backend Structure
```
backend/
├── src/
│   ├── auth/           # Authentication module
│   ├── users/          # User management
│   ├── projects/       # Project management
│   ├── tasks/          # Task management
│   ├── files/          # File upload/management
│   ├── webhooks/       # Webhook handlers
│   ├── common/         # Shared utilities
│   ├── database/       # Database configuration
│   └── main.ts         # Application entry point
├── prisma/             # Database schema and migrations
├── test/               # E2E tests
└── Dockerfile          # Container configuration
```

## Frontend

The frontend lives in `frontend/` and is a Next.js 15 App Router application with TypeScript and Tailwind CSS. All data access goes through internal `/app/api/*` route handlers (Backend-for-Frontend pattern) which proxy to the NestJS API, manage HttpOnly cookies for access/refresh tokens, and auto-refresh on 401 responses. UI routes default to server components; client components only where interactivity is required.

## Contributing

1. Create a feature branch from `main`
2. Make your changes in the appropriate workspace (`backend/` or `frontend/`)
3. Run tests: `npm run test`
4. Submit a pull request

## License

MIT License
