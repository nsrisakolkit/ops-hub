# OpsHub Deployment Script for Windows
# Usage: .\deploy.ps1 [environment] [version]

param(
    [string]$Command = "deploy",
    [string]$Environment = "production",
    [string]$Version = "latest"
)

# Colors for output
$Red = "Red"
$Green = "Green"
$Yellow = "Yellow"
$Blue = "Blue"

function Print-Status {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor $Blue
}

function Print-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor $Green
}

function Print-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor $Yellow
}

function Print-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor $Red
}

function Check-Dependencies {
    Print-Status "Checking dependencies..."
    
    if (!(Get-Command docker -ErrorAction SilentlyContinue)) {
        Print-Error "Docker is not installed or not in PATH"
        exit 1
    }
    
    if (!(Get-Command docker-compose -ErrorAction SilentlyContinue)) {
        Print-Error "Docker Compose is not installed or not in PATH"
        exit 1
    }
    
    Print-Success "All dependencies are installed"
}

function Validate-Environment {
    Print-Status "Validating environment: $Environment"
    
    switch ($Environment) {
        { $_ -in @("development", "staging", "production") } {
            Print-Success "Environment '$Environment' is valid"
            break
        }
        default {
            Print-Error "Invalid environment: $Environment"
            Print-Error "Valid environments: development, staging, production"
            exit 1
        }
    }
    
    # Set compose file based on environment
    if ($Environment -eq "development") {
        $script:ComposeFile = "docker-compose.ci.yml"
    } else {
        $script:ComposeFile = "docker-compose.prod.yml"
    }
}

function Check-EnvFile {
    if (!(Test-Path ".env")) {
        Print-Warning ".env file not found"
        if (Test-Path ".env.example") {
            Print-Status "Copying .env.example to .env"
            Copy-Item ".env.example" ".env"
            Print-Warning "Please update .env file with your configuration before proceeding"
            exit 1
        } else {
            Print-Error "No .env.example file found. Please create a .env file with required configuration"
            exit 1
        }
    }
    Print-Success ".env file found"
}

function Pull-Images {
    Print-Status "Pulling latest Docker images..."
    docker-compose -f $ComposeFile pull
    if ($LASTEXITCODE -ne 0) {
        Print-Error "Failed to pull images"
        exit 1
    }
    Print-Success "Images pulled successfully"
}

function Build-Images {
    Print-Status "Building Docker images..."
    docker-compose -f $ComposeFile build --no-cache
    if ($LASTEXITCODE -ne 0) {
        Print-Error "Failed to build images"
        exit 1
    }
    Print-Success "Images built successfully"
}

function Run-Migrations {
    Print-Status "Running database migrations..."
    
    # Start only the database to run migrations
    docker-compose -f $ComposeFile up -d postgres
    
    # Wait for database to be ready
    Print-Status "Waiting for database to be ready..."
    Start-Sleep -Seconds 10
    
    # Run migrations
    docker-compose -f $ComposeFile run --rm backend npm run prisma:migrate:deploy
    
    if ($LASTEXITCODE -ne 0) {
        Print-Error "Database migrations failed"
        exit 1
    }
    
    Print-Success "Database migrations completed"
}

function Start-Services {
    Print-Status "Starting services..."
    docker-compose -f $ComposeFile up -d
    if ($LASTEXITCODE -ne 0) {
        Print-Error "Failed to start services"
        exit 1
    }
    Print-Success "Services started successfully"
}

function Check-Health {
    Print-Status "Checking service health..."
    
    # Wait for services to start
    Start-Sleep -Seconds 30
    
    # Check backend health
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000/health" -UseBasicParsing -TimeoutSec 10
        if ($response.StatusCode -eq 200) {
            Print-Success "Backend service is healthy"
        } else {
            Print-Error "Backend service health check failed"
            return $false
        }
    } catch {
        Print-Error "Backend service health check failed: $($_.Exception.Message)"
        return $false
    }
    
    # Check frontend health
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3001" -UseBasicParsing -TimeoutSec 10
        if ($response.StatusCode -eq 200) {
            Print-Success "Frontend service is healthy"
        } else {
            Print-Error "Frontend service health check failed"
            return $false
        }
    } catch {
        Print-Error "Frontend service health check failed: $($_.Exception.Message)"
        return $false
    }
    
    Print-Success "All services are healthy"
    return $true
}

function Show-Status {
    Print-Status "Service status:"
    docker-compose -f $ComposeFile ps
    
    Print-Status "Service logs (last 20 lines):"
    docker-compose -f $ComposeFile logs --tail=20
}

function Cleanup {
    Print-Status "Cleaning up old Docker images..."
    docker image prune -f
    docker volume prune -f
    Print-Success "Cleanup completed"
}

function Deploy {
    Print-Status "Starting deployment for environment: $Environment, version: $Version"
    
    Check-Dependencies
    Validate-Environment
    Check-EnvFile
    
    # Set version in environment
    $env:VERSION = $Version
    
    if ($Environment -eq "production") {
        Pull-Images
    } else {
        Build-Images
    }
    
    # Stop existing services
    Print-Status "Stopping existing services..."
    docker-compose -f $ComposeFile down
    
    Run-Migrations
    Start-Services
    
    if (Check-Health) {
        Print-Success "Deployment completed successfully!"
        Show-Status
    } else {
        Print-Error "Deployment failed - health checks failed"
        Print-Status "Showing logs for debugging:"
        docker-compose -f $ComposeFile logs
        exit 1
    }
    
    Cleanup
}

function Rollback {
    Print-Status "Rolling back deployment..."
    
    # Get previous version from git
    try {
        $PreviousVersion = (git describe --tags --abbrev=0 HEAD~1 2>$null)
        if (!$PreviousVersion) {
            $PreviousVersion = "previous"
        }
    } catch {
        $PreviousVersion = "previous"
    }
    
    Print-Status "Rolling back to version: $PreviousVersion"
    
    $env:VERSION = $PreviousVersion
    Pull-Images
    
    docker-compose -f $ComposeFile down
    Start-Services
    
    if (Check-Health) {
        Print-Success "Rollback completed successfully!"
    } else {
        Print-Error "Rollback failed"
        exit 1
    }
}

function Show-Help {
    Write-Host "OpsHub Deployment Script for Windows"
    Write-Host ""
    Write-Host "Usage: .\deploy.ps1 [COMMAND] [ENVIRONMENT] [VERSION]"
    Write-Host ""
    Write-Host "Commands:"
    Write-Host "  deploy    Deploy the application (default)"
    Write-Host "  rollback  Rollback to previous version"
    Write-Host "  status    Show current service status"
    Write-Host "  logs      Show service logs"
    Write-Host "  stop      Stop all services"
    Write-Host "  help      Show this help message"
    Write-Host ""
    Write-Host "Environments:"
    Write-Host "  development (default compose file: docker-compose.ci.yml)"
    Write-Host "  staging"
    Write-Host "  production (default compose file: docker-compose.prod.yml)"
    Write-Host ""
    Write-Host "Examples:"
    Write-Host "  .\deploy.ps1 deploy production v1.2.3"
    Write-Host "  .\deploy.ps1 rollback production"
    Write-Host "  .\deploy.ps1 status"
}

# Main script logic
switch ($Command) {
    "deploy" {
        Deploy
    }
    "rollback" {
        Rollback
    }
    "status" {
        Validate-Environment
        Show-Status
    }
    "logs" {
        Validate-Environment
        docker-compose -f $ComposeFile logs -f
    }
    "stop" {
        Validate-Environment
        Print-Status "Stopping all services..."
        docker-compose -f $ComposeFile down
        Print-Success "All services stopped"
    }
    "help" {
        Show-Help
    }
    default {
        Print-Error "Unknown command: $Command"
        Show-Help
        exit 1
    }
}