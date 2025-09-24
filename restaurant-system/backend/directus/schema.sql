-- Restaurant Categories Table
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    image VARCHAR(500),
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Menu Items Table
CREATE TABLE IF NOT EXISTS menu_items (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    image VARCHAR(500),
    images JSON, -- Array of additional images
    ingredients JSON, -- Array of ingredients
    allergens JSON, -- Array of allergens
    nutritional_info JSON, -- Calories, protein, etc.
    preparation_time INTEGER, -- in minutes
    is_available BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    is_spicy BOOLEAN DEFAULT false,
    is_vegetarian BOOLEAN DEFAULT false,
    is_vegan BOOLEAN DEFAULT false,
    is_gluten_free BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Customers Table
CREATE TABLE IF NOT EXISTS customers (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    date_of_birth DATE,
    avatar VARCHAR(500),
    preferences JSON, -- Dietary preferences, favorite items, etc.
    loyalty_points INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    phone_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Customer Addresses Table
CREATE TABLE IF NOT EXISTS customer_addresses (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES customers(id) ON DELETE CASCADE,
    label VARCHAR(100), -- 'Home', 'Work', etc.
    street_address VARCHAR(255) NOT NULL,
    apartment VARCHAR(100),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    country VARCHAR(100) DEFAULT 'US',
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    is_default BOOLEAN DEFAULT false,
    delivery_instructions TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders Table
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id INTEGER REFERENCES customers(id) ON DELETE SET NULL,
    customer_email VARCHAR(255), -- For guest orders
    customer_phone VARCHAR(20),
    customer_name VARCHAR(200),
    
    -- Order type and fulfillment
    order_type VARCHAR(20) NOT NULL DEFAULT 'delivery', -- 'delivery', 'pickup', 'dine_in'
    status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'
    
    -- Address for delivery
    delivery_address_id INTEGER REFERENCES customer_addresses(id) ON DELETE SET NULL,
    delivery_address JSON, -- Full address object for guest orders
    delivery_instructions TEXT,
    
    -- Pricing
    subtotal DECIMAL(10,2) NOT NULL,
    tax_amount DECIMAL(10,2) NOT NULL,
    delivery_fee DECIMAL(10,2) DEFAULT 0,
    tip_amount DECIMAL(10,2) DEFAULT 0,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,
    
    -- Payment
    payment_method VARCHAR(50), -- 'card', 'cash', 'digital_wallet'
    payment_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'paid', 'failed', 'refunded'
    payment_id VARCHAR(255), -- External payment processor ID
    
    -- Timing
    estimated_delivery_time TIMESTAMP,
    actual_delivery_time TIMESTAMP,
    requested_delivery_time TIMESTAMP,
    
    -- Special requests
    special_instructions TEXT,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    menu_item_id INTEGER REFERENCES menu_items(id) ON DELETE SET NULL,
    menu_item_name VARCHAR(255) NOT NULL, -- Snapshot for historical data
    menu_item_price DECIMAL(10,2) NOT NULL, -- Price at time of order
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL, -- Final price after modifications
    total_price DECIMAL(10,2) NOT NULL,
    special_instructions TEXT,
    modifications JSON, -- Array of modifications/customizations
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Restaurant Settings Table
CREATE TABLE IF NOT EXISTS restaurant_settings (
    id SERIAL PRIMARY KEY,
    key VARCHAR(100) UNIQUE NOT NULL,
    value JSON NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Promotions/Discounts Table
CREATE TABLE IF NOT EXISTS promotions (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(20) NOT NULL, -- 'percentage', 'fixed_amount', 'free_item'
    value DECIMAL(10,2) NOT NULL,
    minimum_order_amount DECIMAL(10,2),
    maximum_discount_amount DECIMAL(10,2),
    usage_limit INTEGER,
    usage_count INTEGER DEFAULT 0,
    applicable_categories JSON, -- Array of category IDs
    applicable_items JSON, -- Array of menu item IDs
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reviews Table
CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    customer_id INTEGER REFERENCES customers(id) ON DELETE SET NULL,
    menu_item_id INTEGER REFERENCES menu_items(id) ON DELETE SET NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    is_verified BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inventory Tracking Table
CREATE TABLE IF NOT EXISTS inventory (
    id SERIAL PRIMARY KEY,
    menu_item_id INTEGER REFERENCES menu_items(id) ON DELETE CASCADE,
    current_stock INTEGER DEFAULT 0,
    reserved_stock INTEGER DEFAULT 0, -- Items in pending orders
    minimum_stock INTEGER DEFAULT 0,
    maximum_stock INTEGER DEFAULT 100,
    cost_per_unit DECIMAL(10,2),
    supplier VARCHAR(255),
    last_restocked TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default categories
INSERT INTO categories (name, description, sort_order) VALUES
('Appetizers', 'Start your meal with our delicious appetizers', 1),
('Main Courses', 'Hearty and satisfying main dishes', 2),
('Desserts', 'Sweet treats to end your meal', 3),
('Beverages', 'Refreshing drinks and hot beverages', 4),
('Specials', 'Chef''s special recommendations', 5)
ON CONFLICT DO NOTHING;

-- Insert default restaurant settings
INSERT INTO restaurant_settings (key, value, description) VALUES
('restaurant_info', '{
    "name": "Delicious Bites Restaurant",
    "address": "123 Food Street, Culinary City, FC 12345",
    "phone": "+1 (555) 123-4567",
    "email": "info@deliciousbites.com",
    "website": "https://deliciousbites.com",
    "hours": {
        "monday": "11:00-22:00",
        "tuesday": "11:00-22:00",
        "wednesday": "11:00-22:00",
        "thursday": "11:00-22:00",
        "friday": "11:00-23:00",
        "saturday": "10:00-23:00",
        "sunday": "10:00-21:00"
    }
}', 'Basic restaurant information'),
('delivery_settings', '{
    "delivery_radius": 10,
    "delivery_fee": 3.99,
    "free_delivery_minimum": 25.00,
    "estimated_delivery_time": 45
}', 'Delivery configuration'),
('payment_settings', '{
    "accepted_methods": ["card", "cash", "digital_wallet"],
    "tip_suggestions": [15, 18, 20, 25],
    "tax_rate": 0.0875
}', 'Payment and tax configuration')
ON CONFLICT (key) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items(category_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_available ON menu_items(is_available);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_customer_addresses_customer ON customer_addresses(customer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_menu_item ON reviews(menu_item_id);
CREATE INDEX IF NOT EXISTS idx_inventory_menu_item ON inventory(menu_item_id);