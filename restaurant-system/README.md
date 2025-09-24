# Restaurant Ordering System

A complete restaurant ordering system built with modern technologies:
- **Backend**: Directus (headless CMS) + Python FastAPI microservices
- **Frontend**: Vue 3 + TypeScript + Pinia
- **Infrastructure**: Docker + PostgreSQL
- **Architecture**: Hybrid approach with CRUD operations in Directus and complex business logic in microservices

## Quick Start

```bash
# Clone and setup
git clone <repo-url>
cd restaurant-system
npm install

# Start development environment
npm run dev

# Access the application
# Frontend: http://localhost:3000
# Directus Admin: http://localhost:8055
# API Documentation: http://localhost:8000/docs
```

## Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Vue Frontend  │    │   Directus CMS  │    │  Microservices  │
│                 │    │                 │    │                 │
│ • Menu Display  │◄──►│ • Menu Items    │◄──►│ • Pricing       │
│ • Cart System   │    │ • Categories    │    │ • Inventory     │
│ • Order Flow    │    │ • Orders        │    │ • Notifications │
│ • User Auth     │    │ • Customers     │    │ • Analytics     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Features

### Core Functionality
- 📱 Mobile & Desktop responsive design
- 🍽️ Dynamic menu display with categories
- 🛒 Real-time cart management
- 💳 Order processing workflow
- 👤 Customer authentication
- 📊 Admin dashboard (Directus)

### Advanced Features
- 💰 Dynamic pricing based on demand/inventory
- 📦 Real-time inventory tracking
- 🔔 Order notifications (SMS/Email)
- 📈 Analytics and reporting
- 🏪 Multi-restaurant support
- 🎯 Personalized recommendations

## Technology Stack

### Frontend (Vue 3)
- **Framework**: Vue 3 + Composition API
- **Language**: TypeScript
- **State**: Pinia
- **Styling**: Tailwind CSS
- **Build**: Vite
- **PWA**: Service Workers

### Backend (Directus)
- **CMS**: Directus v10
- **Database**: PostgreSQL
- **Storage**: Local/S3 compatible
- **Auth**: JWT + OAuth
- **API**: GraphQL + REST

### Microservices (Python)
- **Framework**: FastAPI
- **Database**: PostgreSQL
- **Cache**: Redis
- **Queue**: Celery
- **Testing**: Pytest
- **Documentation**: OpenAPI

### Infrastructure
- **Containerization**: Docker + Docker Compose
- **Proxy**: Nginx
- **SSL**: Let's Encrypt
- **Monitoring**: Health checks
- **Logging**: Structured JSON logs

## Development

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- Python 3.11+

### Setup Development
```bash
# Install dependencies
npm install

# Start all services
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

### Environment Variables
```bash
# Copy example environment
cp .env.example .env

# Edit configuration
vim .env
```

## Deployment

### Production Deployment
```bash
# Build and deploy
npm run prod

# Scale services
docker-compose -f docker/docker-compose.prod.yml up -d --scale pricing-service=3
```

### Health Monitoring
- Frontend: http://localhost:3000/health
- Directus: http://localhost:8055/server/health
- Microservices: http://localhost:8000/health

## API Documentation

### Directus API
- REST: http://localhost:8055/items/
- GraphQL: http://localhost:8055/graphql

### Microservices API
- Interactive Docs: http://localhost:8000/docs
- OpenAPI Spec: http://localhost:8000/openapi.json

## Testing

### Frontend Tests
```bash
cd frontend
npm test              # Unit tests
npm run test:e2e      # End-to-end tests
npm run test:coverage # Coverage report
```

### Backend Tests
```bash
cd microservices
python -m pytest                    # Unit tests
python -m pytest --cov=app         # Coverage
python -m pytest tests/integration # Integration tests
```

## Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email support@restaurant-system.com or join our Slack channel.