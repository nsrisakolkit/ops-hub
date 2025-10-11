# OpsHub CI/CD Configuration

This directory contains GitHub Actions workflows for comprehensive CI/CD pipeline.

## Workflows Overview

### 1. `ci.yml` - Main CI/CD Pipeline
**Triggers:** Push to main/develop, Pull Requests
**Jobs:**
- ✅ Lint & Format Check
- ✅ Backend Unit Tests (with PostgreSQL & Redis)
- ✅ Backend E2E Tests 
- ✅ Frontend Tests
- ✅ Build Applications (Backend & Frontend)
- ✅ Security Audit
- ✅ Docker Build & Push
- ✅ Production Deployment
- ✅ Notifications

### 2. `pr-quality.yml` - Pull Request Quality Checks
**Triggers:** Pull Request events
**Jobs:**
- ✅ PR Size Check
- ✅ Code Quality Analysis (SonarCloud)
- ✅ Test Coverage Check (80% threshold)
- ✅ Security Vulnerability Check (Trivy)
- ✅ Dependency Vulnerability Check
- ✅ Performance Impact Check
- ✅ API Breaking Changes Check

### 3. `release.yml` - Release Management
**Triggers:** Release published, Manual workflow dispatch
**Jobs:**
- ✅ Version Bumping & Tagging
- ✅ Build Release Artifacts
- ✅ Docker Image Build & Push
- ✅ Security Scan Release Images
- ✅ Staging Deployment
- ✅ Production Deployment
- ✅ GitHub Release Creation
- ✅ Post-deployment Tasks

### 4. `nightly.yml` - Nightly Comprehensive Tests
**Triggers:** Scheduled (2 AM UTC daily), Manual
**Jobs:**
- ✅ Extended Integration Tests
- ✅ Performance Tests (K6)
- ✅ Load Tests (Artillery)
- ✅ Database Migration Tests
- ✅ Security Audit
- ✅ Dependency Updates Check
- ✅ Results Notification

## Required Secrets

Add these secrets to your GitHub repository settings:

### Docker Registry
```
DOCKER_USERNAME=your-docker-username
DOCKER_PASSWORD=your-docker-password
```

### Code Quality
```
SONAR_TOKEN=your-sonarcloud-token
```

### Notifications (Optional)
```
SLACK_WEBHOOK_URL=your-slack-webhook
DISCORD_WEBHOOK_URL=your-discord-webhook
```

## Environment Setup

### Database Services
- **PostgreSQL 15** for backend tests
- **Redis 7** for caching tests
- Automatically provisioned in CI

### Node.js Version
- **Node.js 20** (LTS) across all workflows
- npm cache optimization enabled

## Coverage Requirements

### Test Coverage Thresholds
- **Unit Tests:** 80% minimum coverage
- **E2E Tests:** Critical path coverage
- **Integration Tests:** Extended scenarios

### Quality Gates
- All linting checks must pass
- Security vulnerabilities must be resolved
- Performance regression checks
- API breaking change detection

## Deployment Environments

### Staging
- Automatic deployment on main branch
- Smoke tests execution
- Environment: `staging`

### Production  
- Manual approval required
- Health checks mandatory
- Environment: `production`

## Monitoring & Notifications

### Success Notifications
- ✅ Deployment successful
- ✅ All tests passed
- ✅ Security scans clean

### Failure Notifications
- ❌ Test failures
- ❌ Security vulnerabilities
- ❌ Deployment issues
- ❌ Performance regressions

## Usage Examples

### Manual Release
```bash
# Trigger release workflow manually
gh workflow run release.yml -f version=minor
```

### Run Nightly Tests
```bash
# Trigger nightly tests manually
gh workflow run nightly.yml
```

### Check Workflow Status
```bash
# View recent workflow runs
gh run list --workflow=ci.yml
```

## Best Practices

### Branch Protection
Configure these branch protection rules:
- Require PR reviews
- Require status checks to pass
- Require up-to-date branches
- Include administrators

### Security
- Regular dependency updates
- Vulnerability scanning
- Secret scanning enabled
- SARIF security reports

### Performance
- Bundle size monitoring
- Performance regression detection
- Load testing in nightly runs

## Customization

### Adding New Jobs
1. Create job in appropriate workflow file
2. Add required secrets/environment variables
3. Update documentation
4. Test with workflow dispatch

### Environment-Specific Configuration
- Use environment-specific secrets
- Configure deployment targets
- Set up monitoring endpoints

## Troubleshooting

### Common Issues

**Database Connection Failures:**
```yaml
services:
  postgres:
    options: >-
      --health-cmd pg_isready
      --health-interval 10s
      --health-timeout 5s
      --health-retries 5
```

**Node.js Cache Issues:**
```yaml
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    cache: 'npm'
    cache-dependency-path: '**/package-lock.json'
```

**Docker Build Failures:**
```yaml
- name: Set up Docker Buildx
  uses: docker/setup-buildx-action@v3
```

### Debug Mode
Add these steps for debugging:
```yaml
- name: Debug Environment
  run: |
    echo "Node version: $(node --version)"
    echo "NPM version: $(npm --version)"
    env | sort
```

## Metrics & Analytics

### Tracked Metrics
- Build duration
- Test coverage percentage  
- Deployment frequency
- Lead time for changes
- Mean time to recovery

### Reports Generated
- Test coverage reports
- Security scan results
- Performance benchmarks
- Dependency updates
- Bundle size analysis