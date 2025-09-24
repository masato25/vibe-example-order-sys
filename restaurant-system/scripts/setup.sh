#!/bin/bash

# Restaurant System Setup Script
set -e

echo "🍽️  Setting up Restaurant Ordering System..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if Docker Compose is available
if ! command -v docker-compose > /dev/null 2>&1; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose and try again."
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from example..."
    cp .env.example .env
    echo "✅ .env file created. Please review and update the configuration if needed."
fi

# Create necessary directories
echo "📁 Creating necessary directories..."
mkdir -p backend/directus/uploads
mkdir -p frontend/public/images
mkdir -p logs

# Set proper permissions
echo "🔐 Setting up permissions..."
chmod +x backend/directus/init.sh
chmod +x scripts/*.sh 2>/dev/null || true

# Pull required Docker images
echo "📦 Pulling Docker images..."
docker-compose -f docker/docker-compose.dev.yml pull

# Build custom images
echo "🏗️  Building custom Docker images..."
docker-compose -f docker/docker-compose.dev.yml build

echo "🚀 Setup complete! You can now start the system with:"
echo ""
echo "   npm run dev"
echo ""
echo "This will start all services and make the application available at:"
echo "   • Frontend: http://localhost:3000"
echo "   • Directus Admin: http://localhost:8055/admin"
echo "   • API Documentation: http://localhost:8001/docs"
echo ""
echo "Default admin credentials:"
echo "   Email: admin@restaurant.com"
echo "   Password: AdminPass123!"
echo ""
echo "🎉 Happy coding!"