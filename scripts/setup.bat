@echo off
echo 🚀 Setting up Ops Hub Development Environment...

REM Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not running. Please start Docker and try again.
    exit /b 1
)

REM Start database services
echo 📦 Starting database services...
call npm run docker:up

REM Wait for services to be ready
echo ⏳ Waiting for services to be ready...
timeout /t 10 /nobreak >nul

REM Generate Prisma client
echo 🔧 Generating Prisma client...
call npm run db:generate

REM Push database schema
echo 📊 Setting up database schema...
call npm run db:push

REM Seed database
echo 🌱 Seeding database with initial data...
call npm run db:seed

echo ✅ Setup complete! You can now run:
echo    npm run start:dev    # Start development server
echo    npm run db:studio    # Open Prisma Studio
echo.
echo 🌐 Application will be available at:
echo    API: http://localhost:3000/api
echo    Health: http://localhost:3000/health
echo    Metrics: http://localhost:3000/metrics

pause