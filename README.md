# Ops Hub - Project Management Platform

A comprehensive project management platform built with NestJS, Next.js, and modern DevOps practices.

## 🚀 Quick Start

For complete deployment and CI/CD setup, see [DEPLOYMENT.md](./DEPLOYMENT.md).

### Local Development

Follow these steps to set up and run **OpsHub** locally using Docker.

### 1. Clone the repository
```bash
git clone https://github.com/nsrisakolkit/ops-hub.git
cd ops-hub
```

### 2. Configure environment variables
Copy the example environment file and edit secrets as needed:

- **PowerShell/Git Bash**
  ```bash
  cp backend/.env.example backend/.env
  ```

- **Windows cmd**
  ```bat
  copy backend\.env.example backend\.env
  ```

### 3. Build and start the containers
```bash
docker compose up --build
```

This command builds all images (backend, frontend, database, etc.) and starts them.

Once everything is running:

- **Frontend (main app):** [http://localhost:3000](http://localhost:3000)
- **Backend API (optional):** [http://localhost:3001](http://localhost:3001)
- **API Documentation:** [http://localhost:3001/docs](http://localhost:3001/docs)

## 🚀 Production Deployment

For production deployment, use the provided deployment scripts:

### Linux/Mac
```bash
chmod +x scripts/deploy.sh
./scripts/deploy.sh deploy production
```

### Windows
```powershell
.\scripts\deploy.ps1 deploy production
```

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete deployment documentation.

---

## 🧱 Managing Containers

### Stop the containers
To gracefully stop all running services:
```bash
docker compose down
```
This shuts everything down **but keeps your data** (if volumes are defined).

### Start again (without rebuilding)
If you’ve already built once and just want to run the app again:
```bash
docker compose up
```

### Rebuild (after changing Dockerfiles or dependencies)
If you modify code that affects the Docker image (e.g., package.json, Dockerfile), rebuild:
```bash
docker compose up --build
```

> 💡 **Tip:** During active dev, use `docker compose up` (without `--build`) for quick restarts. Rebuild only when dependencies or Dockerfiles change.

The stack comes up with PostgreSQL, Redis, the NestJS backend, and the Next.js frontend. Press `Ctrl+C` to stop; use `docker compose down` to remove containers (volumes stay unless `--volumes` is passed).

---

## 🧩 Useful Commands

| Action | Command |
|--------|---------|
| View logs | `docker compose logs -f` |
| Stop all containers | `docker compose down` |
| Restart everything | `docker compose down && docker compose up` |
| Rebuild only one service | `docker compose build <service_name>` |
| List running containers | `docker ps` |

---

## Project Structure

```
ops-hub/
├── backend/             # NestJS API (Prisma, Redis, JWT auth, REST + GraphQL)
├── frontend/            # Next.js 15 App Router frontend (BFF + Tailwind)
├── docker-compose.yml   # Local Docker workflow (frontend, backend, db, redis)
└── package.json         # Workspace scripts for combined tasks
```

### Prerequisites
- Docker & Docker Compose v2+
- (Optional) Node.js 18+ if you want to run the apps outside Docker

---

## Running Outside Docker

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
