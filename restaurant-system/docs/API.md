# API Documentation

## Overview

The Restaurant Ordering System exposes multiple APIs for different aspects of the application:

- **Directus CMS API**: Content management and basic CRUD operations
- **Pricing Microservice API**: Dynamic pricing calculations and promotions
- **Authentication API**: User authentication and session management

## Base URLs

| Service | Development | Production |
|---------|-------------|------------|
| Directus CMS | `http://localhost:8055` | `https://api.yourrestaurant.com` |
| Pricing Service | `http://localhost:3001` | `https://pricing.yourrestaurant.com` |

## Authentication

### JWT Token Authentication

All API requests require authentication using JWT tokens obtained from the login endpoint.

```bash
# Login request
POST /auth/login
Content-Type: application/json

{
  "email": "customer@example.com",
  "password": "password123"
}

# Response
{
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires": 3600
  }
}
```

### Using Tokens

Include the JWT token in the Authorization header:

```bash
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Directus CMS API

### Menu Items

#### Get All Menu Items
```bash
GET /items/menu_items
```

**Query Parameters:**
- `filter[category][_eq]=:category_id` - Filter by category
- `filter[available][_eq]=true` - Only available items
- `fields=*` - Select specific fields
- `limit=20` - Limit results
- `offset=0` - Pagination offset

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Classic Burger",
      "description": "Beef patty with lettuce, tomato, onion",
      "price": 12.99,
      "category": "main-courses",
      "image": "burger.jpg",
      "available": true,
      "ingredients": ["beef", "lettuce", "tomato", "onion"],
      "allergens": ["gluten", "dairy"],
      "calories": 650,
      "prep_time": 15
    }
  ]
}
```

#### Get Menu Item by ID
```bash
GET /items/menu_items/:id
```

#### Update Menu Item
```bash
PATCH /items/menu_items/:id
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "price": 13.99,
  "available": false
}
```

### Categories

#### Get All Categories
```bash
GET /items/categories
```

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Main Courses",
      "slug": "main-courses",
      "description": "Hearty main dishes",
      "image": "main-courses.jpg",
      "sort_order": 1
    }
  ]
}
```

### Orders

#### Create Order
```bash
POST /items/orders
Authorization: Bearer <customer-token>
Content-Type: application/json

{
  "customer_id": "customer-uuid",
  "items": [
    {
      "menu_item_id": "item-uuid",
      "quantity": 2,
      "price": 12.99,
      "special_instructions": "No onions"
    }
  ],
  "delivery_address": "123 Main St, City, 12345",
  "phone": "+1234567890",
  "special_instructions": "Ring doorbell twice",
  "subtotal": 25.98,
  "tax": 2.08,
  "delivery_fee": 3.99,
  "total": 32.05
}
```

**Response:**
```json
{
  "data": {
    "id": "order-uuid",
    "order_number": "ORD-2025-001234",
    "status": "pending",
    "estimated_delivery": "2025-09-25T19:30:00Z",
    "created_at": "2025-09-25T18:00:00Z"
  }
}
```

#### Get Order Status
```bash
GET /items/orders/:id
Authorization: Bearer <customer-token>
```

#### Update Order Status (Admin Only)
```bash
PATCH /items/orders/:id
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "status": "preparing",
  "estimated_delivery": "2025-09-25T19:45:00Z"
}
```

**Order Status Values:**
- `pending` - Order received, awaiting confirmation
- `confirmed` - Order confirmed, preparing
- `preparing` - Kitchen is preparing the order
- `ready` - Order ready for pickup/delivery
- `out_for_delivery` - Order out for delivery
- `delivered` - Order delivered
- `cancelled` - Order cancelled

### Customers

#### Register Customer
```bash
POST /users
Content-Type: application/json

{
  "email": "customer@example.com",
  "password": "password123",
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+1234567890",
  "role": "customer"
}
```

#### Get Customer Profile
```bash
GET /users/me
Authorization: Bearer <customer-token>
```

#### Update Customer Profile
```bash
PATCH /users/me
Authorization: Bearer <customer-token>
Content-Type: application/json

{
  "first_name": "Johnny",
  "phone": "+1234567891",
  "address": "456 New St, City, 12345"
}
```

## Pricing Microservice API

### Calculate Dynamic Pricing

```bash
POST /pricing/calculate
Content-Type: application/json

{
  "items": [
    {
      "id": "item-uuid",
      "base_price": 12.99,
      "quantity": 2,
      "category": "main-courses"
    }
  ],
  "customer_type": "regular",
  "time_of_day": "peak",
  "day_of_week": "friday",
  "demand_level": "high"
}
```

**Response:**
```json
{
  "items": [
    {
      "id": "item-uuid",
      "base_price": 12.99,
      "adjusted_price": 14.29,
      "quantity": 2,
      "subtotal": 28.58,
      "adjustments": [
        {
          "type": "peak_hours",
          "amount": 1.30,
          "percentage": 10
        }
      ]
    }
  ],
  "subtotal": 28.58,
  "total_savings": 0,
  "total_adjustments": 2.60
}
```

### Apply Promo Code

```bash
POST /pricing/apply-promo
Content-Type: application/json

{
  "code": "SAVE20",
  "order_total": 50.00,
  "customer_id": "customer-uuid",
  "items": [
    {
      "id": "item-uuid",
      "price": 25.00,
      "quantity": 2
    }
  ]
}
```

**Response:**
```json
{
  "valid": true,
  "discount_type": "percentage",
  "discount_value": 20,
  "discount_amount": 10.00,
  "new_total": 40.00,
  "message": "20% discount applied successfully"
}
```

### Get Available Promotions

```bash
GET /pricing/promotions
```

**Query Parameters:**
- `customer_type=regular` - Filter by customer type
- `active_only=true` - Only active promotions

**Response:**
```json
{
  "promotions": [
    {
      "id": "promo-uuid",
      "code": "WELCOME10",
      "description": "10% off first order",
      "discount_type": "percentage",
      "discount_value": 10,
      "min_order_amount": 25.00,
      "max_discount": 5.00,
      "valid_from": "2025-01-01T00:00:00Z",
      "valid_until": "2025-12-31T23:59:59Z",
      "usage_limit": 1,
      "customer_restrictions": ["new_customers"]
    }
  ]
}
```

## Error Handling

All APIs use consistent error response format:

```json
{
  "errors": [
    {
      "message": "Validation failed",
      "extensions": {
        "code": "RECORD_NOT_UNIQUE",
        "field": "email"
      }
    }
  ]
}
```

### Common Error Codes

| Code | Description |
|------|-------------|
| `INVALID_CREDENTIALS` | Invalid login credentials |
| `TOKEN_EXPIRED` | JWT token has expired |
| `FORBIDDEN` | Insufficient permissions |
| `RECORD_NOT_FOUND` | Requested resource not found |
| `VALIDATION_FAILED` | Request validation failed |
| `RATE_LIMIT_EXCEEDED` | Too many requests |

## Rate Limiting

| Endpoint | Limit | Window |
|----------|-------|--------|
| Authentication | 5 requests | 1 minute |
| Menu Items | 100 requests | 1 minute |
| Orders | 20 requests | 1 minute |
| Pricing | 50 requests | 1 minute |

## Webhooks

### Order Status Updates

Configure webhooks to receive real-time order status updates:

```bash
POST /webhooks
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "url": "https://your-app.com/webhooks/order-status",
  "events": ["order.created", "order.status_changed"],
  "secret": "your-webhook-secret"
}
```

**Webhook Payload:**
```json
{
  "event": "order.status_changed",
  "data": {
    "id": "order-uuid",
    "status": "preparing",
    "previous_status": "confirmed",
    "timestamp": "2025-09-25T18:30:00Z"
  },
  "signature": "sha256=..."
}
```

## SDK Examples

### JavaScript/TypeScript

```typescript
import { RestaurantAPI } from '@restaurant/api-sdk';

const api = new RestaurantAPI({
  baseURL: 'http://localhost:8055',
  pricingURL: 'http://localhost:3001'
});

// Login
const { token } = await api.auth.login({
  email: 'customer@example.com',
  password: 'password123'
});

// Get menu items
const menuItems = await api.menu.getItems({
  category: 'main-courses',
  available: true
});

// Create order
const order = await api.orders.create({
  items: [
    {
      menu_item_id: 'item-uuid',
      quantity: 2,
      special_instructions: 'Extra spicy'
    }
  ],
  delivery_address: '123 Main St'
});
```

### Python

```python
from restaurant_api import RestaurantClient

client = RestaurantClient(
    base_url='http://localhost:8055',
    pricing_url='http://localhost:3001'
)

# Login
token = client.auth.login(
    email='customer@example.com',
    password='password123'
)

# Get menu items
menu_items = client.menu.get_items(
    category='main-courses',
    available=True
)

# Create order
order = client.orders.create(
    items=[
        {
            'menu_item_id': 'item-uuid',
            'quantity': 2,
            'special_instructions': 'Extra spicy'
        }
    ],
    delivery_address='123 Main St'
)
```

## Testing the API

### Using curl

```bash
# Login
curl -X POST http://localhost:8055/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@restaurant.com","password":"admin123"}'

# Get menu items
curl -X GET http://localhost:8055/items/menu_items \
  -H "Authorization: Bearer <token>"

# Create order
curl -X POST http://localhost:8055/items/orders \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d @order.json
```

### Using Postman

Import the Postman collection:
```bash
# Download collection
curl -o restaurant-api.postman_collection.json \
  http://localhost:8055/admin/collections/export

# Import into Postman
```

### API Testing with Jest

```javascript
describe('Restaurant API', () => {
  let token;

  beforeAll(async () => {
    const response = await request(app)
      .post('/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });
    
    token = response.body.data.access_token;
  });

  test('should get menu items', async () => {
    const response = await request(app)
      .get('/items/menu_items')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    
    expect(response.body.data).toBeInstanceOf(Array);
  });
});
```