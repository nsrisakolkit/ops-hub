# Ops Hub - Project Management Platform

A full-stack project management application built with NestJS (backend) and modern frontend framework.

## Project Structure

```
ops-hub/
├── backend/          # NestJS API server
├── frontend/         # Frontend application (to be added)
├── docker-compose.yml # Development services
└── package.json      # Workspace configuration
```

## Quick Start

### Prerequisites
- Docker & Docker Compose v2+
- (Optional) Node.js 18+ if you want to run the apps outside Docker

### One-Click Development Environment

Everything (Postgres, Redis, NestJS API, Next.js frontend) is orchestrated via Docker Compose:

```bash
git clone <repository-url>
cd ops-hub
docker compose up --build
```

On the first run the containers will install dependencies, run migrations, seed sample data, and start both servers in watch mode. Named volumes keep `node_modules` cached, so subsequent restarts are fast.

Services will be available at:

- Frontend (Next.js): http://localhost:3001
- Backend (NestJS): http://localhost:3000
- API docs (Swagger): http://localhost:3000/api
- PostgreSQL: `localhost:5433`
- Redis: `localhost:6379`

Press `Ctrl+C` to stop the stack, or `docker compose down` to stop and remove the containers.

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start both backend and frontend in development mode |
| `npm run dev:backend` | Start only backend development server |
| `npm run dev:frontend` | Start only frontend development server |
| `npm run build` | Build both applications for production |
| `npm run test` | Run tests for both applications |
| `npm run lint` | Lint both applications |
| `npm run docker:up` | Start development databases (PostgreSQL, Redis) |
| `npm run docker:down` | Stop development databases |
| `npm run prisma:studio` | Open Prisma Studio for database management |

### Development URLs

- **Backend API**: http://localhost:3000
- **API Documentation**: http://localhost:3000/api
- **Prisma Studio**: http://localhost:5555
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379

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

*Frontend application will be added here*

## Contributing

1. Create a feature branch from `main`
2. Make your changes in the appropriate workspace (`backend/` or `frontend/`)
3. Run tests: `npm run test`
4. Submit a pull request

## License

MIT License
