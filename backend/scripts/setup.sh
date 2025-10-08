#!/bin/bash

echo "🚀 Setting up Ops Hub Development Environment..."

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Start database services
echo "📦 Starting database services..."
npm run docker:up

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 10

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npm run db:generate

# Push database schema
echo "📊 Setting up database schema..."
npm run db:push

# Seed database
echo "🌱 Seeding database with initial data..."
npm run db:seed

echo "✅ Setup complete! You can now run:"
echo "   npm run start:dev    # Start development server"
echo "   npm run db:studio    # Open Prisma Studio"
echo ""
echo "🌐 Application will be available at:"
echo "   API: http://localhost:3000/api"
echo "   Health: http://localhost:3000/health"
echo "   Metrics: http://localhost:3000/metrics"