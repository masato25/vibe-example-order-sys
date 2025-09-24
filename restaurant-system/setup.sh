#!/bin/bash

# Restaurant Ordering System - Quick Setup Script
# This script sets up the entire development environment

set -e

echo "🍽️  Setting up Restaurant Ordering System..."
echo "================================================"

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command -v docker &> /dev/null; then
    echo "❌ Docker is required but not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is required but not installed. Please install Docker Compose first."
    exit 1
fi

if ! command -v node &> /dev/null; then
    echo "❌ Node.js is required but not installed. Please install Node.js 18+ first."
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ npm is required but not installed. Please install npm first."
    exit 1
fi

echo "✅ All prerequisites found!"

# Create environment files
echo "📄 Creating environment files..."

# Backend environment
cat > .env << EOF
# Database Configuration
DB_HOST=postgres
DB_PORT=5432
DB_NAME=restaurant_db
DB_USER=restaurant_user
DB_PASSWORD=restaurant_pass

# Directus Configuration
KEY=your-random-key-here-change-in-production
SECRET=your-random-secret-here-change-in-production
ADMIN_EMAIL=admin@restaurant.com
ADMIN_PASSWORD=admin123

# API Configuration
DIRECTUS_URL=http://localhost:8055
API_URL=http://localhost:3000

# Redis Configuration
REDIS_URL=redis://redis:6379

# Environment
NODE_ENV=development
EOF

# Frontend environment
cat > frontend/.env << EOF
VITE_API_URL=http://localhost:8055
VITE_PRICING_API_URL=http://localhost:3001
VITE_APP_NAME=Restaurant Ordering System
VITE_APP_VERSION=1.0.0
EOF

# Pricing service environment
cat > pricing-service/.env << EOF
REDIS_URL=redis://redis:6379
DIRECTUS_URL=http://directus:8055
PORT=3001
ENVIRONMENT=development
EOF

echo "✅ Environment files created!"

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
npm install
cd ..

# Install pricing service dependencies
echo "📦 Installing pricing service dependencies..."
cd pricing-service
pip install -r requirements.txt
cd ..

# Build and start all services
echo "🐳 Starting Docker services..."
docker-compose up -d --build

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 30

# Check if Directus is ready
echo "🔍 Checking Directus health..."
max_attempts=30
attempt=1

while [ $attempt -le $max_attempts ]; do
    if curl -f http://localhost:8055/server/health > /dev/null 2>&1; then
        echo "✅ Directus is ready!"
        break
    fi
    
    if [ $attempt -eq $max_attempts ]; then
        echo "❌ Directus failed to start within expected time"
        echo "📋 Checking logs..."
        docker-compose logs directus
        exit 1
    fi
    
    echo "⏳ Attempt $attempt/$max_attempts - Waiting for Directus..."
    sleep 5
    ((attempt++))
done

# Import database schema and sample data
echo "📊 Setting up database schema and sample data..."
docker-compose exec -T postgres psql -U restaurant_user -d restaurant_db < schema.sql
docker-compose exec -T postgres psql -U restaurant_user -d restaurant_db < sample-data.sql

# Create Directus admin user
echo "👤 Creating Directus admin user..."
docker-compose exec directus npx directus bootstrap

# Run tests
echo "🧪 Running tests..."
cd frontend
npm run test:unit
cd ..

# Final status check
echo "🔍 Final status check..."
echo "Services status:"
docker-compose ps

echo ""
echo "🎉 Setup complete!"
echo "================================================"
echo ""
echo "🌐 Application URLs:"
echo "   • Frontend:      http://localhost:5173"
echo "   • Directus CMS:  http://localhost:8055"
echo "   • Pricing API:   http://localhost:3001"
echo "   • PostgreSQL:    localhost:5432"
echo "   • Redis:         localhost:6379"
echo ""
echo "🔑 Admin Login (Directus):"
echo "   • Email:    admin@restaurant.com"
echo "   • Password: admin123"
echo ""
echo "📋 Available Commands:"
echo "   • Start all services:     docker-compose up -d"
echo "   • Stop all services:      docker-compose down"
echo "   • View logs:              docker-compose logs [service]"
echo "   • Run frontend tests:     cd frontend && npm run test"
echo "   • Run dev mode:           cd frontend && npm run dev"
echo ""
echo "📚 Documentation:"
echo "   • API Docs:       http://localhost:8055/docs"
echo "   • Pricing Docs:   http://localhost:3001/docs"
echo ""
echo "Happy coding! 🚀"