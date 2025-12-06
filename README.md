# Ops Hub - Project Management Platform
#### Video Demo: https://youtu.be/pYogxJw61VU

#### Description:

**Ops Hub** is a modern task and project management platform designed for teams to collaborate efficiently. Built with a robust full-stack architecture, it provides real-time project tracking, task management, and team collaboration features.

**Tech Stack:**
- **Backend**: NestJS with REST APIs
- **Frontend**: Next.js 15 with App Router
- **Database**: PostgreSQL with Prisma ORM
- **Caching**: Redis for session management and data caching
- **Authentication**: JWT-based with role-based access control

##### Feature:
- User Management - Register, login, and account management
- Projects - Create, edit, and delete projects with team members
- Tasks - Full task lifecycle management (create, edit, delete, assign)
- Team Collaboration - Invite members and manage team roles
- Access Control - Project owners can manage member permissions
- Multiple Views - Switch between table and Kanban board views
- API Documentation - Auto-generated Swagger/OpenAPI documentation


## 🚀 Getting Started

Follow these steps to set up and run **OpsHub** locally using Docker.

### 1. Clone the repository
```bash
git clone https://github.com/nsrisakolkit/ops-hub.git
cd ops-hub
```

### 2. Configure environment variables
Copy the example environment file and edit secrets as needed:

### 3. Build and start the containers
```bash
docker compose up --build
```

This command builds all images (backend, frontend, database, etc.) and starts them.

Once everything is running:

- **Frontend (main app):** [http://localhost:3000](http://localhost:3000)
- **Backend API (optional):** [http://localhost:3001](http://localhost:3001)
- **API Documentation:** [http://localhost:3001/docs](http://localhost:3001/docs)
(url may change if port number in setting changes)
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


## License

MIT License
