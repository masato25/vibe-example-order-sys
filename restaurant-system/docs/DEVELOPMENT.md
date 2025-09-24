# Development Guide

## Getting Started

This guide covers setting up the development environment, understanding the codebase architecture, and contributing to the Restaurant Ordering System.

## Development Environment Setup

### Prerequisites

Before starting development, ensure you have the following installed:

```bash
# Required
- Docker 20.10+
- Docker Compose 2.0+
- Node.js 18+
- npm 9+
- Git 2.30+

# Optional (for local development)
- Python 3.11+
- PostgreSQL 15+
- Redis 7+
```

### Quick Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/restaurant-system.git
cd restaurant-system

# Run the setup script
chmod +x setup.sh
./setup.sh

# The setup script will:
# 1. Install dependencies
# 2. Create environment files
# 3. Start Docker services
# 4. Initialize database
# 5. Run tests
```

### Manual Setup

If you prefer manual setup or need to troubleshoot:

```bash
# 1. Install frontend dependencies
cd frontend
npm install
cd ..

# 2. Install Python dependencies
cd pricing-service
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cd ..

# 3. Create environment files
cp .env.example .env
cp frontend/.env.example frontend/.env
cp pricing-service/.env.example pricing-service/.env

# 4. Start development services
docker-compose up -d postgres redis directus

# 5. Wait for services to be ready
sleep 30

# 6. Initialize database
docker-compose exec -T postgres psql -U restaurant_user -d restaurant_db < schema.sql
docker-compose exec -T postgres psql -U restaurant_user -d restaurant_db < sample-data.sql

# 7. Create Directus admin user
docker-compose exec directus npx directus bootstrap
```

## Architecture Overview

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Layer                            │
├─────────────────────────────────────────────────────────────┤
│ Vue 3 Frontend (TypeScript)                                │
│ • Components • Stores • Services • Router                  │
│ • Tailwind CSS • PWA • i18n                               │
└─────────────────┬───────────────────────────────────────────┘
                  │ HTTP/WebSocket
┌─────────────────▼───────────────────────────────────────────┐
│                  API Gateway Layer                          │
├─────────────────────────────────────────────────────────────┤
│ Nginx Reverse Proxy                                         │
│ • Load Balancing • SSL Termination • Rate Limiting         │
└─────────────────┬───────────────────────────────────────────┘
                  │
        ┌─────────┴─────────┐
        │                   │
┌───────▼────────┐  ┌──────▼──────────┐
│ Directus CMS   │  │ FastAPI Services │
│ • REST API     │  │ • Pricing       │
│ • Admin Panel  │  │ • Notifications │
│ • File Storage │  │ • Analytics     │
│ • Auth         │  │ • Integrations  │
└───────┬────────┘  └──────┬──────────┘
        │                  │
        └─────────┬────────┘
                  │
┌─────────────────▼───────────────────────────────────────────┐
│                   Data Layer                                │
├─────────────────────────────────────────────────────────────┤
│ PostgreSQL Database        Redis Cache                      │
│ • Transactional Data      • Session Storage                │
│ • User Management         • API Cache                      │
│ • Order Processing        • Real-time Data                 │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

#### Frontend (Vue 3)
- **Framework**: Vue 3 with Composition API
- **Language**: TypeScript
- **Build Tool**: Vite
- **State Management**: Pinia
- **Routing**: Vue Router 4
- **Styling**: Tailwind CSS
- **Testing**: Vitest + Vue Test Utils
- **PWA**: Vite PWA Plugin

#### Backend (Directus CMS)
- **CMS**: Directus 10.8+ (Node.js)
- **Database**: PostgreSQL 15
- **Cache**: Redis 7
- **File Storage**: Local/S3/GCS
- **Authentication**: JWT
- **API**: REST + GraphQL

#### Microservices (Python)
- **Framework**: FastAPI
- **Language**: Python 3.11+
- **Async**: asyncio + httpx
- **Validation**: Pydantic
- **Testing**: pytest
- **Documentation**: OpenAPI/Swagger

#### Infrastructure
- **Containerization**: Docker + Docker Compose
- **Reverse Proxy**: Nginx
- **Database**: PostgreSQL
- **Cache**: Redis
- **Monitoring**: Prometheus + Grafana (optional)

## Project Structure

```
restaurant-system/
├── 📁 frontend/                    # Vue 3 Frontend Application
│   ├── 📁 public/                  # Static assets
│   ├── 📁 src/
│   │   ├── 📁 components/          # Vue components
│   │   │   ├── 📁 ui/              # Base UI components
│   │   │   ├── 📁 forms/           # Form components
│   │   │   └── 📁 layout/          # Layout components
│   │   ├── 📁 stores/              # Pinia stores
│   │   │   ├── user.ts             # User authentication
│   │   │   ├── cart.ts             # Shopping cart
│   │   │   └── menu.ts             # Menu data
│   │   ├── 📁 services/            # API services
│   │   │   ├── api.ts              # Directus API client
│   │   │   ├── pricing.ts          # Pricing service client
│   │   │   └── websocket.ts        # WebSocket connection
│   │   ├── 📁 router/              # Vue Router
│   │   ├── 📁 views/               # Page components
│   │   ├── 📁 composables/         # Vue composables
│   │   ├── 📁 utils/               # Utility functions
│   │   ├── 📁 types/               # TypeScript types
│   │   └── 📁 __tests__/           # Test files
│   ├── 📄 package.json             # Dependencies
│   ├── 📄 vite.config.ts           # Vite configuration
│   ├── 📄 tailwind.config.js       # Tailwind CSS config
│   └── 📄 vitest.config.ts         # Testing configuration
├── 📁 pricing-service/             # Python FastAPI Microservice
│   ├── 📁 app/
│   │   ├── 📄 main.py              # FastAPI application
│   │   ├── 📄 pricing.py           # Pricing algorithms
│   │   ├── 📄 models.py            # Pydantic models
│   │   ├── 📄 database.py          # Database connection
│   │   └── 📄 config.py            # Configuration
│   ├── 📁 tests/                   # Python tests
│   └── 📄 requirements.txt         # Python dependencies
├── 📁 docker/                      # Docker configurations
│   ├── 📄 Dockerfile.frontend      # Frontend container
│   ├── 📄 Dockerfile.pricing       # Pricing service container
│   └── 📄 nginx.conf               # Nginx configuration
├── 📁 scripts/                     # Utility scripts
│   ├── 📄 setup.sh                 # Development setup
│   ├── 📄 run-tests.sh             # Test runner
│   └── 📄 deploy.sh                # Deployment script
├── 📁 docs/                        # Documentation
│   ├── 📄 API.md                   # API documentation
│   ├── 📄 DEPLOYMENT.md            # Deployment guide
│   └── 📄 DEVELOPMENT.md           # This file
├── 📄 schema.sql                   # Database schema
├── 📄 sample-data.sql              # Sample data
├── 📄 docker-compose.yml           # Development services
├── 📄 docker-compose.prod.yml      # Production services
└── 📄 README.md                    # Project overview
```

## Development Workflow

### 1. Feature Development

```bash
# Create feature branch
git checkout -b feature/new-menu-filter

# Make changes
# ... code changes ...

# Run tests
npm run test
./scripts/run-tests.sh

# Commit changes
git add .
git commit -m "feat: add advanced menu filtering"

# Push and create PR
git push origin feature/new-menu-filter
```

### 2. Frontend Development

#### Starting Development Server
```bash
cd frontend

# Start dev server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

#### Component Development
```vue
<!-- components/MenuItem.vue -->
<template>
  <div class="menu-item" :class="{ 'unavailable': !item.available }">
    <img :src="item.image" :alt="item.name" class="menu-item__image" />
    <div class="menu-item__content">
      <h3 class="menu-item__name">{{ item.name }}</h3>
      <p class="menu-item__description">{{ item.description }}</p>
      <div class="menu-item__price">${{ item.price.toFixed(2) }}</div>
      <button 
        @click="addToCart" 
        :disabled="!item.available"
        class="menu-item__add-btn"
      >
        Add to Cart
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCartStore } from '@/stores/cart'

interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  image: string
  available: boolean
}

defineProps<{
  item: MenuItem
}>()

const cartStore = useCartStore()

const addToCart = () => {
  cartStore.addItem(props.item)
}
</script>
```

#### Store Development
```typescript
// stores/cart.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  special_instructions?: string
}

export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>([])

  const itemCount = computed(() => 
    items.value.reduce((sum, item) => sum + item.quantity, 0)
  )

  const total = computed(() =>
    items.value.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  )

  const addItem = (menuItem: MenuItem) => {
    const existingItem = items.value.find(item => item.id === menuItem.id)
    
    if (existingItem) {
      existingItem.quantity++
    } else {
      items.value.push({
        id: menuItem.id,
        name: menuItem.name,
        price: menuItem.price,
        quantity: 1
      })
    }
  }

  const removeItem = (itemId: string) => {
    const index = items.value.findIndex(item => item.id === itemId)
    if (index > -1) {
      items.value.splice(index, 1)
    }
  }

  const updateQuantity = (itemId: string, quantity: number) => {
    const item = items.value.find(item => item.id === itemId)
    if (item) {
      if (quantity <= 0) {
        removeItem(itemId)
      } else {
        item.quantity = quantity
      }
    }
  }

  const clearCart = () => {
    items.value = []
  }

  return {
    items,
    itemCount,
    total,
    addItem,
    removeItem,
    updateQuantity,
    clearCart
  }
})
```

### 3. Backend Development

#### Directus Schema Management
```bash
# Apply schema changes
docker-compose exec directus npx directus schema apply --yes

# Snapshot current schema
docker-compose exec directus npx directus schema snapshot --yes

# Generate TypeScript types
docker-compose exec directus npx directus-typescript-gen
```

#### Custom Endpoints
```javascript
// directus/extensions/endpoints/custom-orders/index.js
export default (router, { services, exceptions }) => {
  const { ItemsService } = services;
  const { InvalidPayloadException } = exceptions;

  router.post('/calculate-total', async (req, res) => {
    const { items } = req.body;
    
    if (!items || !Array.isArray(items)) {
      throw new InvalidPayloadException('Items array is required');
    }

    const ordersService = new ItemsService('orders', {
      schema: req.schema,
      accountability: req.accountability
    });

    // Calculate order total with tax and fees
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.08; // 8% tax
    const deliveryFee = subtotal > 25 ? 0 : 3.99;
    const total = subtotal + tax + deliveryFee;

    res.json({
      subtotal: subtotal.toFixed(2),
      tax: tax.toFixed(2),
      delivery_fee: deliveryFee.toFixed(2),
      total: total.toFixed(2)
    });
  });
};
```

### 4. Microservice Development

#### Pricing Service Development
```python
# pricing-service/app/main.py
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import redis
import json
from datetime import datetime, time

app = FastAPI(title="Restaurant Pricing Service")
redis_client = redis.Redis(host='redis', port=6379, decode_responses=True)

class PricingItem(BaseModel):
    id: str
    base_price: float
    quantity: int
    category: str

class PricingRequest(BaseModel):
    items: List[PricingItem]
    customer_type: str = "regular"
    time_of_day: Optional[str] = None

class PricingResponse(BaseModel):
    items: List[dict]
    subtotal: float
    total_adjustments: float

@app.post("/pricing/calculate", response_model=PricingResponse)
async def calculate_pricing(request: PricingRequest):
    """Calculate dynamic pricing based on demand, time, and customer type"""
    
    current_time = datetime.now().time()
    is_peak_hour = time(11, 30) <= current_time <= time(13, 30) or time(18, 0) <= current_time <= time(20, 0)
    
    processed_items = []
    total_adjustments = 0
    
    for item in request.items:
        adjusted_price = item.base_price
        adjustments = []
        
        # Peak hour pricing
        if is_peak_hour:
            peak_adjustment = item.base_price * 0.1
            adjusted_price += peak_adjustment
            adjustments.append({
                "type": "peak_hours",
                "amount": peak_adjustment,
                "percentage": 10
            })
            total_adjustments += peak_adjustment * item.quantity
        
        # Customer type discount
        if request.customer_type == "vip":
            vip_discount = adjusted_price * 0.05
            adjusted_price -= vip_discount
            adjustments.append({
                "type": "vip_discount",
                "amount": -vip_discount,
                "percentage": -5
            })
            total_adjustments -= vip_discount * item.quantity
        
        processed_items.append({
            "id": item.id,
            "base_price": item.base_price,
            "adjusted_price": round(adjusted_price, 2),
            "quantity": item.quantity,
            "subtotal": round(adjusted_price * item.quantity, 2),
            "adjustments": adjustments
        })
    
    subtotal = sum(item["subtotal"] for item in processed_items)
    
    return PricingResponse(
        items=processed_items,
        subtotal=round(subtotal, 2),
        total_adjustments=round(total_adjustments, 2)
    )

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}
```

## Testing

### Frontend Testing

#### Unit Tests with Vitest
```typescript
// __tests__/components/MenuItem.test.ts
import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import MenuItem from '@/components/MenuItem.vue'

describe('MenuItem', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  const mockItem = {
    id: '1',
    name: 'Test Burger',
    description: 'A test burger',
    price: 12.99,
    image: 'test.jpg',
    available: true
  }

  it('renders item information correctly', () => {
    const wrapper = mount(MenuItem, {
      props: { item: mockItem }
    })

    expect(wrapper.find('.menu-item__name').text()).toBe('Test Burger')
    expect(wrapper.find('.menu-item__price').text()).toBe('$12.99')
    expect(wrapper.find('.menu-item__description').text()).toBe('A test burger')
  })

  it('disables add button when item is unavailable', () => {
    const unavailableItem = { ...mockItem, available: false }
    const wrapper = mount(MenuItem, {
      props: { item: unavailableItem }
    })

    const addButton = wrapper.find('.menu-item__add-btn')
    expect(addButton.attributes('disabled')).toBeDefined()
  })
})
```

#### Integration Tests
```typescript
// __tests__/integration/ordering-flow.test.ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebMemoryHistory } from 'vue-router'
import { createPinia } from 'pinia'
import App from '@/App.vue'
import { routes } from '@/router'

describe('Ordering Flow Integration', () => {
  it('completes full ordering flow', async () => {
    const router = createRouter({
      history: createWebMemoryHistory(),
      routes
    })
    
    const wrapper = mount(App, {
      global: {
        plugins: [router, createPinia()]
      }
    })

    // Navigate to menu
    await router.push('/menu')
    await wrapper.vm.$nextTick()

    // Add item to cart
    const menuItem = wrapper.find('[data-testid="menu-item-1"]')
    await menuItem.find('.add-to-cart').trigger('click')

    // Check cart
    expect(wrapper.find('.cart-count').text()).toBe('1')

    // Navigate to checkout
    await router.push('/checkout')
    await wrapper.vm.$nextTick()

    // Fill checkout form
    await wrapper.find('input[name="email"]').setValue('test@example.com')
    await wrapper.find('input[name="address"]').setValue('123 Test St')

    // Submit order
    await wrapper.find('form').trigger('submit')
    
    // Verify success
    expect(wrapper.find('.order-success').exists()).toBe(true)
  })
})
```

### Backend Testing

#### Python Service Tests
```python
# pricing-service/tests/test_pricing.py
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_calculate_pricing():
    """Test basic pricing calculation"""
    request_data = {
        "items": [
            {
                "id": "item-1",
                "base_price": 10.00,
                "quantity": 2,
                "category": "main"
            }
        ],
        "customer_type": "regular"
    }
    
    response = client.post("/pricing/calculate", json=request_data)
    assert response.status_code == 200
    
    data = response.json()
    assert len(data["items"]) == 1
    assert data["subtotal"] > 0

def test_vip_discount():
    """Test VIP customer discount"""
    request_data = {
        "items": [
            {
                "id": "item-1",
                "base_price": 20.00,
                "quantity": 1,
                "category": "main"
            }
        ],
        "customer_type": "vip"
    }
    
    response = client.post("/pricing/calculate", json=request_data)
    data = response.json()
    
    # Should have VIP discount applied
    assert any(adj["type"] == "vip_discount" for adj in data["items"][0]["adjustments"])
    assert data["items"][0]["adjusted_price"] < 20.00

@pytest.mark.asyncio
async def test_health_check():
    """Test health check endpoint"""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"
```

### API Testing
```bash
# Run API tests with Newman (Postman CLI)
npm install -g newman

# Export Postman collection and run tests
newman run postman/restaurant-api.postman_collection.json \
  --environment postman/dev-environment.json \
  --reporters cli,html \
  --reporter-html-export api-test-results.html
```

### E2E Testing with Cypress
```typescript
// cypress/e2e/ordering-flow.cy.ts
describe('Restaurant Ordering Flow', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('should complete full ordering process', () => {
    // Browse menu
    cy.get('[data-cy=menu-link]').click()
    cy.url().should('include', '/menu')

    // Add item to cart
    cy.get('[data-cy=menu-item]').first().within(() => {
      cy.get('[data-cy=add-to-cart]').click()
    })

    // Verify cart updated
    cy.get('[data-cy=cart-count]').should('contain', '1')

    // Go to checkout
    cy.get('[data-cy=cart-icon]').click()
    cy.get('[data-cy=checkout-btn]').click()

    // Fill checkout form
    cy.get('[data-cy=email-input]').type('test@example.com')
    cy.get('[data-cy=address-input]').type('123 Test Street')
    cy.get('[data-cy=phone-input]').type('+1234567890')

    // Submit order
    cy.get('[data-cy=place-order-btn]').click()

    // Verify success
    cy.get('[data-cy=order-success]').should('be.visible')
    cy.get('[data-cy=order-number]').should('contain', 'ORD-')
  })

  it('should handle cart operations', () => {
    cy.visit('/menu')

    // Add multiple items
    cy.get('[data-cy=menu-item]').each(($item, index) => {
      if (index < 3) {
        cy.wrap($item).find('[data-cy=add-to-cart]').click()
      }
    })

    // Open cart
    cy.get('[data-cy=cart-icon]').click()

    // Verify items in cart
    cy.get('[data-cy=cart-item]').should('have.length', 3)

    // Update quantity
    cy.get('[data-cy=cart-item]').first().within(() => {
      cy.get('[data-cy=quantity-increase]').click()
      cy.get('[data-cy=quantity]').should('contain', '2')
    })

    // Remove item
    cy.get('[data-cy=cart-item]').last().within(() => {
      cy.get('[data-cy=remove-item]').click()
    })

    cy.get('[data-cy=cart-item]').should('have.length', 2)
  })
})
```

## Code Style & Standards

### TypeScript Configuration
```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "node",
    "strict": true,
    "jsx": "preserve",
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src/**/*", "tests/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### ESLint Configuration
```javascript
// .eslintrc.js
module.exports = {
  extends: [
    '@vue/typescript/recommended',
    '@vue/eslint-config-typescript',
    'plugin:vue/vue3-recommended'
  ],
  rules: {
    // Vue specific
    'vue/multi-word-component-names': 'off',
    'vue/no-v-html': 'warn',
    
    // TypeScript specific
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    
    // General
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'warn'
  }
}
```

### Prettier Configuration
```json
// .prettierrc
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 80,
  "bracketSpacing": true,
  "arrowParens": "avoid"
}
```

### Commit Convention
```bash
# Commit message format: type(scope): description

# Types:
feat: new feature
fix: bug fix
docs: documentation
style: formatting
refactor: code restructuring
test: adding tests
chore: maintenance

# Examples:
git commit -m "feat(cart): add quantity controls to cart items"
git commit -m "fix(api): handle network timeout errors"
git commit -m "docs(readme): update installation instructions"
```

## Debugging

### Frontend Debugging

#### Vue DevTools
```bash
# Install Vue DevTools browser extension
# Chrome: https://chrome.google.com/webstore/detail/vuejs-devtools/
# Firefox: https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/
```

#### Console Debugging
```typescript
// Use Vue's built-in debugging
import { getCurrentInstance } from 'vue'

export default {
  setup() {
    if (process.env.NODE_ENV === 'development') {
      const instance = getCurrentInstance()
      console.log('Component instance:', instance)
    }
  }
}
```

### Backend Debugging

#### Directus Debugging
```bash
# Enable debug logging
docker-compose exec directus sh
export LOG_LEVEL=debug
npm start

# View logs
docker-compose logs -f directus
```

#### Database Debugging
```bash
# Connect to database
docker-compose exec postgres psql -U restaurant_user -d restaurant_db

# View slow queries
SELECT query, mean_time, calls 
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;

# Monitor active connections
SELECT * FROM pg_stat_activity;
```

### Performance Debugging

#### Frontend Performance
```javascript
// Performance monitoring
if (process.env.NODE_ENV === 'development') {
  import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
    getCLS(console.log)
    getFID(console.log)
    getFCP(console.log)
    getLCP(console.log)
    getTTFB(console.log)
  })
}
```

#### API Performance
```python
# Add timing middleware
import time
from fastapi import Request

@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    return response
```

## Contributing

### Pull Request Process

1. **Fork the repository**
2. **Create a feature branch**
3. **Make your changes**
4. **Write/update tests**
5. **Run the test suite**
6. **Update documentation**
7. **Submit pull request**

### Code Review Checklist

- [ ] Code follows style guidelines
- [ ] Tests are included and passing
- [ ] Documentation is updated
- [ ] No breaking changes (or properly documented)
- [ ] Performance impact considered
- [ ] Security implications reviewed
- [ ] Accessibility standards met

### Release Process

```bash
# 1. Update version
npm version patch  # or minor, major

# 2. Update CHANGELOG.md

# 3. Create release branch
git checkout -b release/v1.2.3

# 4. Final testing
./scripts/run-tests.sh

# 5. Merge to main
git checkout main
git merge release/v1.2.3

# 6. Tag release
git tag v1.2.3
git push origin v1.2.3

# 7. Deploy to production
./scripts/deploy-production.sh
```

This development guide provides comprehensive information for developers working on the Restaurant Ordering System. Follow these guidelines to maintain code quality and consistency across the project.