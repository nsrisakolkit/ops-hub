# Ops Hub

A comprehensive operations management platform built with NestJS, featuring project management, task tracking, file handling, and webhook integrations.

## 🚀 Features

- **Project Management**: Create and manage projects with team members
- **Task Tracking**: Comprehensive task management with priorities and due dates
- **User Authentication**: JWT-based authentication with refresh tokens
- **Role-based Access Control**: Fine-grained permissions system
- **Caching**: Redis-based caching for improved performance
- **Health Checks**: Comprehensive monitoring and health endpoints
- **Logging**: Structured logging with Pino
- **Docker Support**: Full containerization with Docker Compose

## 🏗️ Architecture

```
ops-hub/
├─ docker-compose.yml
├─ prisma/
│  ├─ schema.prisma
│  └─ seed.ts
├─ src/
│  ├─ main.ts
│  ├─ app.module.ts
│  ├─ config/            # Dynamic module + schema validation
│  ├─ common/
│  │  ├─ middleware/     # request-logger, request-id
│  │  ├─ filters/        # AllExceptionsFilter, HttpExceptionFilter
│  │  ├─ pipes/          # ValidationPipe config, custom pipes
│  │  ├─ guards/         # JwtAuthGuard, RolesGuard
│  │  ├─ interceptors/   # Logging, Transform, Timeout, Cache
│  │  ├─ decorators/     # @Roles, @Public, etc.
│  │  └─ utils/
│  ├─ database/          # PrismaService, DatabaseModule (dynamic)
│  ├─ auth/              # JWT, refresh, OAuth2 (optional)
│  ├─ users/
│  ├─ projects/
│  ├─ tasks/
│  ├─ cache/             # CacheModule wrapper (redis)
│  ├─ logging/           # nestjs-pino setup
│  └─ metrics/           # healthchecks, /metrics, readiness/liveness
└─ tsconfig.json
```

## 🛠️ Tech Stack

- **Framework**: NestJS
- **Database**: PostgreSQL with Prisma ORM
- **Cache**: Redis
- **Authentication**: JWT with Passport
- **API**: REST
- **Logging**: Pino
- **Validation**: class-validator + class-transformer
- **Documentation**: Swagger/OpenAPI
- **Testing**: Jest
- **Containerization**: Docker + Docker Compose

## 📋 Prerequisites

- Node.js 18+
- Docker and Docker Compose
- PostgreSQL (or use Docker)
- Redis (or use Docker)

## 🚀 Quick Start

### Running with Docker Compose (recommended)

From the repository root:

```bash
cp backend/.env.example backend/.env
docker compose up --build
```

The backend boots alongside the Next.js frontend, PostgreSQL, and Redis. Swagger docs live at http://localhost:3000/api while the frontend proxies through `/app/api/*` route handlers.

### Running the backend standalone

```bash
# Clone and install (from repo root)
git clone <repository-url>
cd ops-hub/backend
npm install

# Environment
cp .env.example .env
# edit values as needed

# Ensure Postgres + Redis are running locally or via `npm run docker:up` from repo root

# Prepare database
npm run db:generate
npm run db:push
npm run db:seed

# Start the NestJS dev server
npm run start:dev
```

Key endpoints:
- API: http://localhost:3000/api
- Health: http://localhost:3000/health
- Metrics: http://localhost:3000/metrics

## 📝 Available Scripts

### Development
```bash
npm run start:dev      # Start development server with hot reload
npm run start:debug    # Start with debug mode
npm run build          # Build for production
npm run start:prod     # Start production server
```

### Database
```bash
npm run db:generate    # Generate Prisma client
npm run db:push        # Push schema to database
npm run db:migrate     # Create and run migrations
npm run db:seed        # Seed database with test data
npm run db:studio      # Open Prisma Studio
```

### Docker
```bash
npm run docker:up      # Start all services
npm run docker:down    # Stop all services
npm run docker:logs    # View logs
```

### Testing
```bash
npm run test           # Run unit tests
npm run test:watch     # Run tests in watch mode
npm run test:cov       # Run tests with coverage
npm run test:e2e       # Run end-to-end tests
```

### Code Quality
```bash
npm run lint           # Run ESLint
npm run format         # Format code with Prettier
```

## 🔑 API Authentication

The API uses JWT tokens for authentication. To access protected endpoints:

1. **Login** to get tokens:
```bash
POST /api/auth/login
{
  "email": "admin@opshub.com",
  "password": "password"
}
```

2. **Use the access token** in subsequent requests:
```bash
Authorization: Bearer <access_token>
```

3. **Refresh tokens** when expired:
```bash
POST /api/auth/refresh
{
  "refreshToken": "<refresh_token>"
}
```

## 🏥 Health Checks

The application provides several health check endpoints:

- `GET /health` - Comprehensive health check including database
- `GET /health/ready` - Readiness probe for Kubernetes
- `GET /health/live` - Liveness probe for Kubernetes

## 📊 Monitoring

- **Metrics**: Available at `/metrics` endpoint
- **Logs**: Structured JSON logs with correlation IDs
- **Tracing**: Request tracing with unique request IDs

## 🐳 Docker Deployment

### Development with Docker Compose

```bash
# Start all services
docker compose up -d

# View logs
docker compose logs -f backend

# Stop services
docker compose down
```

### Production Deployment

```bash
# Build production image
docker build -t ops-hub:latest .

# Run with environment variables
docker run -d \
  --name ops-hub \
  -p 3000:3000 \
  -e DATABASE_URL="postgresql://..." \
  -e REDIS_URL="redis://..." \
  ops-hub:latest
```

## 🔧 Configuration

Key environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Application port | `3000` |
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `REDIS_URL` | Redis connection string | Optional |
| `JWT_SECRET` | JWT signing secret | Required |
| `JWT_EXPIRATION_TIME` | Access token expiry (seconds) | `3600` |
| `UPLOAD_PATH` | File upload directory | `./uploads` |
| `MAX_FILE_SIZE` | Max file size in bytes | `10485760` |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the [MIT License](LICENSE).

## 🆘 Support

For support and questions:

- Create an [Issue](../../issues)
- Check [Documentation](docs/)
- Contact the development team
