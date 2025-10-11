#!/bin/bash

# OpsHub Deployment Script
# Usage: ./deploy.sh [environment] [version]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
ENVIRONMENT=${1:-production}
VERSION=${2:-latest}
COMPOSE_FILE="docker-compose.prod.yml"

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if required tools are installed
check_dependencies() {
    print_status "Checking dependencies..."
    
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed or not in PATH"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed or not in PATH"
        exit 1
    fi
    
    print_success "All dependencies are installed"
}

# Function to validate environment
validate_environment() {
    print_status "Validating environment: $ENVIRONMENT"
    
    case $ENVIRONMENT in
        development|staging|production)
            print_success "Environment '$ENVIRONMENT' is valid"
            ;;
        *)
            print_error "Invalid environment: $ENVIRONMENT"
            print_error "Valid environments: development, staging, production"
            exit 1
            ;;
    esac
    
    # Set compose file based on environment
    if [ "$ENVIRONMENT" = "development" ]; then
        COMPOSE_FILE="docker-compose.ci.yml"
    fi
}

# Function to check if .env file exists
check_env_file() {
    if [ ! -f .env ]; then
        print_warning ".env file not found"
        if [ -f .env.example ]; then
            print_status "Copying .env.example to .env"
            cp .env.example .env
            print_warning "Please update .env file with your configuration before proceeding"
            exit 1
        else
            print_error "No .env.example file found. Please create a .env file with required configuration"
            exit 1
        fi
    fi
    print_success ".env file found"
}

# Function to pull latest images
pull_images() {
    print_status "Pulling latest Docker images..."
    docker-compose -f $COMPOSE_FILE pull
    print_success "Images pulled successfully"
}

# Function to build images
build_images() {
    print_status "Building Docker images..."
    docker-compose -f $COMPOSE_FILE build --no-cache
    print_success "Images built successfully"
}

# Function to run database migrations
run_migrations() {
    print_status "Running database migrations..."
    
    # Start only the database to run migrations
    docker-compose -f $COMPOSE_FILE up -d postgres
    
    # Wait for database to be ready
    print_status "Waiting for database to be ready..."
    sleep 10
    
    # Run migrations
    docker-compose -f $COMPOSE_FILE run --rm backend npm run prisma:migrate:deploy
    
    print_success "Database migrations completed"
}

# Function to start services
start_services() {
    print_status "Starting services..."
    docker-compose -f $COMPOSE_FILE up -d
    print_success "Services started successfully"
}

# Function to check service health
check_health() {
    print_status "Checking service health..."
    
    # Wait for services to start
    sleep 30
    
    # Check backend health
    if curl -f http://localhost:3000/health &> /dev/null; then
        print_success "Backend service is healthy"
    else
        print_error "Backend service health check failed"
        return 1
    fi
    
    # Check frontend health
    if curl -f http://localhost:3001 &> /dev/null; then
        print_success "Frontend service is healthy"
    else
        print_error "Frontend service health check failed"
        return 1
    fi
    
    print_success "All services are healthy"
}

# Function to show service status
show_status() {
    print_status "Service status:"
    docker-compose -f $COMPOSE_FILE ps
    
    print_status "Service logs (last 20 lines):"
    docker-compose -f $COMPOSE_FILE logs --tail=20
}

# Function to cleanup old images
cleanup() {
    print_status "Cleaning up old Docker images..."
    docker image prune -f
    docker volume prune -f
    print_success "Cleanup completed"
}

# Main deployment function
deploy() {
    print_status "Starting deployment for environment: $ENVIRONMENT, version: $VERSION"
    
    check_dependencies
    validate_environment
    check_env_file
    
    # Set version in environment
    export VERSION=$VERSION
    
    if [ "$ENVIRONMENT" = "production" ]; then
        pull_images
    else
        build_images
    fi
    
    # Stop existing services
    print_status "Stopping existing services..."
    docker-compose -f $COMPOSE_FILE down
    
    run_migrations
    start_services
    
    if check_health; then
        print_success "Deployment completed successfully!"
        show_status
    else
        print_error "Deployment failed - health checks failed"
        print_status "Showing logs for debugging:"
        docker-compose -f $COMPOSE_FILE logs
        exit 1
    fi
    
    cleanup
}

# Function to rollback deployment
rollback() {
    print_status "Rolling back deployment..."
    
    # Get previous version from git
    PREVIOUS_VERSION=$(git describe --tags --abbrev=0 HEAD~1 2>/dev/null || echo "previous")
    
    print_status "Rolling back to version: $PREVIOUS_VERSION"
    
    export VERSION=$PREVIOUS_VERSION
    pull_images
    
    docker-compose -f $COMPOSE_FILE down
    start_services
    
    if check_health; then
        print_success "Rollback completed successfully!"
    else
        print_error "Rollback failed"
        exit 1
    fi
}

# Function to show help
show_help() {
    echo "OpsHub Deployment Script"
    echo ""
    echo "Usage: $0 [COMMAND] [ENVIRONMENT] [VERSION]"
    echo ""
    echo "Commands:"
    echo "  deploy    Deploy the application (default)"
    echo "  rollback  Rollback to previous version"
    echo "  status    Show current service status"
    echo "  logs      Show service logs"
    echo "  stop      Stop all services"
    echo "  help      Show this help message"
    echo ""
    echo "Environments:"
    echo "  development (default compose file: docker-compose.ci.yml)"
    echo "  staging"
    echo "  production (default compose file: docker-compose.prod.yml)"
    echo ""
    echo "Examples:"
    echo "  $0 deploy production v1.2.3"
    echo "  $0 rollback production"
    echo "  $0 status"
}

# Parse command line arguments
COMMAND=${1:-deploy}

case $COMMAND in
    deploy)
        shift
        ENVIRONMENT=${1:-production}
        VERSION=${2:-latest}
        deploy
        ;;
    rollback)
        shift
        ENVIRONMENT=${1:-production}
        rollback
        ;;
    status)
        validate_environment
        show_status
        ;;
    logs)
        validate_environment
        docker-compose -f $COMPOSE_FILE logs -f
        ;;
    stop)
        validate_environment
        print_status "Stopping all services..."
        docker-compose -f $COMPOSE_FILE down
        print_success "All services stopped"
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        print_error "Unknown command: $COMMAND"
        show_help
        exit 1
        ;;
esac