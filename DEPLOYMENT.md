# OpsHub Deployment Guide

This guide covers the complete deployment and CI/CD setup for the OpsHub application.

## 🚀 Quick Start

### Prerequisites

- Docker and Docker Compose
- Git
- Node.js 20+ (for local development)
- PowerShell or Bash (for deployment scripts)

### Environment Setup

1. **Clone and Configure**
   ```bash
   git clone <repository-url>
   cd ops-hub
   cp .env.example .env
   # Edit .env with your configuration
   ```

2. **Deploy with Scripts**
   ```bash
   # Linux/Mac
   chmod +x scripts/deploy.sh
   ./scripts/deploy.sh deploy production

   # Windows
   .\scripts\deploy.ps1 deploy production
   ```

## 📁 Project Structure

```
ops-hub/
├── .github/workflows/          # CI/CD pipelines
│   ├── ci.yml                 # Main CI/CD workflow
│   ├── pr-quality.yml         # PR quality checks
│   ├── release.yml            # Release automation
│   └── nightly.yml            # Nightly testing
├── backend/                   # NestJS backend
├── frontend/                  # Next.js frontend
├── nginx/                     # Nginx configuration
├── monitoring/                # Monitoring setup
├── scripts/                   # Deployment scripts
├── docker-compose.ci.yml      # CI environment
├── docker-compose.prod.yml    # Production environment
├── .env.example              # Environment template
└── .env.development          # Development config
```

## 🔧 CI/CD Pipeline

### GitHub Actions Workflows

#### 1. Main CI/CD (`ci.yml`)
- **Triggers**: Push to main, PR to main
- **Jobs**: Lint, Test, Build, Security, Deploy
- **Features**: 
  - Unit & E2E testing
  - Docker multi-stage builds
  - Security scanning with Trivy
  - Automated deployment

#### 2. PR Quality (`pr-quality.yml`)
- **Triggers**: Pull requests
- **Jobs**: Size check, Coverage, Security, Performance
- **Features**:
  - PR size validation
  - Code coverage reporting
  - SonarCloud analysis
  - Performance impact assessment

#### 3. Release Management (`release.yml`)
- **Triggers**: Version tags (v*.*.*)
- **Jobs**: Build, Test, Package, Deploy
- **Features**:
  - Automated versioning
  - GitHub releases
  - Multi-environment deployment
  - Rollback capabilities

#### 4. Nightly Testing (`nightly.yml`)
- **Triggers**: Scheduled (daily)
- **Jobs**: Extended testing, Performance, Security
- **Features**:
  - Load testing with K6/Artillery
  - Security audits
  - Dependency updates
  - Migration testing

### Required GitHub Secrets

```bash
# Docker Registry
DOCKER_USERNAME=your-docker-username
DOCKER_PASSWORD=your-docker-password
DOCKER_REGISTRY=your-registry.com

# Database
DATABASE_URL=postgresql://user:pass@host:5432/db
POSTGRES_PASSWORD=your-db-password

# Application
JWT_SECRET=your-jwt-secret-32-chars-min
JWT_REFRESH_SECRET=your-refresh-secret
REDIS_PASSWORD=your-redis-password

# Monitoring
SONAR_TOKEN=your-sonarcloud-token

# Notifications
SLACK_WEBHOOK=your-slack-webhook
DISCORD_WEBHOOK=your-discord-webhook

# Deployment
SSH_PRIVATE_KEY=your-deployment-ssh-key
STAGING_HOST=staging.yourdomain.com
PRODUCTION_HOST=yourdomain.com
```

## 🐳 Docker Configuration

### Multi-Stage Builds

#### Backend Dockerfile
- **Stage 1**: Dependencies installation
- **Stage 2**: Build application
- **Stage 3**: Production runtime
- **Features**: Non-root user, health checks, minimal image

#### Frontend Dockerfile
- **Stage 1**: Dependencies and build
- **Stage 2**: Production runtime with standalone output
- **Features**: Next.js optimization, static file handling

### Docker Compose

#### CI Environment (`docker-compose.ci.yml`)
- PostgreSQL test database
- Redis cache
- Application services
- Health check configurations

#### Production Environment (`docker-compose.prod.yml`)
- PostgreSQL with persistence
- Redis with authentication
- Nginx load balancer
- Monitoring stack (Prometheus/Grafana)
- Auto-restart policies
- Resource limits

## 🚦 Deployment Options

### 1. Automated Deployment (Recommended)

**Via GitHub Actions:**
- Push to `main` branch → Deploy to staging
- Create release tag → Deploy to production
- Automatic rollback on failure

**Via Scripts:**
```bash
# Deploy to production
./scripts/deploy.sh deploy production v1.2.3

# Rollback if needed
./scripts/deploy.sh rollback production

# Check status
./scripts/deploy.sh status
```

### 2. Manual Deployment

```bash
# 1. Build images
docker-compose -f docker-compose.prod.yml build

# 2. Run migrations
docker-compose -f docker-compose.prod.yml run --rm backend npm run prisma:migrate:deploy

# 3. Start services
docker-compose -f docker-compose.prod.yml up -d

# 4. Check health
curl http://localhost:3000/health
```

### 3. Local Development

```bash
# Start development environment
docker-compose -f docker-compose.ci.yml up -d

# Run in development mode
cd backend && npm run start:dev
cd frontend && npm run dev
```

## 🔍 Monitoring & Observability

### Metrics Collection
- **Prometheus**: Application and infrastructure metrics
- **Grafana**: Dashboards and visualization
- **Health Checks**: Automated service monitoring

### Logging
- **Structured Logging**: JSON format with correlation IDs
- **Log Aggregation**: Centralized logging with Docker
- **Error Tracking**: Application error monitoring

### Alerting
- **Prometheus Alerts**: Service availability and performance
- **Notification Channels**: Slack, Discord, Email
- **Escalation Policies**: On-call rotation support

## 🔒 Security

### Container Security
- **Non-root Users**: All containers run as non-root
- **Image Scanning**: Trivy security scanning in CI
- **Minimal Images**: Alpine-based images
- **Secret Management**: Proper secret handling

### Application Security
- **Authentication**: JWT with refresh tokens
- **Password Hashing**: bcrypt with salt rounds
- **Rate Limiting**: Nginx-based rate limiting
- **CORS Configuration**: Proper origin restrictions

### Network Security
- **TLS/SSL**: HTTPS enforcement
- **Security Headers**: Comprehensive header set
- **Internal Networks**: Docker network isolation

## 🚨 Troubleshooting

### Common Issues

#### 1. Database Connection Failed
```bash
# Check database status
docker-compose -f docker-compose.prod.yml logs postgres

# Verify connection string
echo $DATABASE_URL

# Test connection
docker-compose -f docker-compose.prod.yml exec backend npm run prisma:studio
```

#### 2. Service Health Check Failed
```bash
# Check service logs
docker-compose -f docker-compose.prod.yml logs backend

# Test endpoint directly
curl -v http://localhost:3000/health

# Check resource usage
docker stats
```

#### 3. Frontend Not Loading
```bash
# Check frontend logs
docker-compose -f docker-compose.prod.yml logs frontend

# Verify API connection
curl http://localhost:3000/api/health

# Check Nginx configuration
docker-compose -f docker-compose.prod.yml logs nginx
```

### Debugging Commands

```bash
# View all service status
docker-compose -f docker-compose.prod.yml ps

# Follow logs for all services
docker-compose -f docker-compose.prod.yml logs -f

# Execute shell in container
docker-compose -f docker-compose.prod.yml exec backend sh

# Check resource usage
docker system df
docker system events
```

## 📈 Performance Optimization

### Application Performance
- **Database Indexing**: Optimized Prisma queries
- **Caching**: Redis for session and data caching
- **Connection Pooling**: Database connection management

### Infrastructure Performance
- **Load Balancing**: Nginx upstream configuration
- **Image Optimization**: Multi-stage builds
- **Resource Limits**: Container resource constraints

### Monitoring Performance
- **Response Time Tracking**: Application metrics
- **Load Testing**: K6 and Artillery integration
- **Performance Budgets**: CI performance checks

## 🔄 Backup & Recovery

### Database Backups
```bash
# Create backup
docker-compose -f docker-compose.prod.yml exec postgres pg_dump -U postgres opshub > backup.sql

# Restore backup
docker-compose -f docker-compose.prod.yml exec -T postgres psql -U postgres opshub < backup.sql
```

### Application Backups
- **Image Registry**: Docker images stored in registry
- **Configuration**: Environment files in secure storage
- **Data**: Regular database and volume backups

### Disaster Recovery
- **Infrastructure as Code**: Complete Docker configuration
- **Automated Deployment**: Quick environment recreation
- **Data Recovery**: Point-in-time database recovery

## 📚 Additional Resources

- [NestJS Documentation](https://nestjs.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Prometheus Monitoring](https://prometheus.io/docs/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes with tests
4. Submit a pull request
5. Ensure CI passes

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.