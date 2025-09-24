-- Sample menu items data
INSERT INTO menu_items (name, description, price, category_id, image, ingredients, allergens, preparation_time, is_available, is_featured, is_vegetarian, is_vegan, is_gluten_free) VALUES

-- Appetizers
('Buffalo Wings', 'Crispy chicken wings tossed in our signature buffalo sauce, served with celery sticks and blue cheese dip', 12.99, 1, '/images/buffalo-wings.jpg', '["chicken wings", "buffalo sauce", "celery", "blue cheese", "carrots"]', '["dairy", "gluten"]', 15, true, true, false, false, false),
('Mozzarella Sticks', 'Golden fried mozzarella cheese sticks served with marinara sauce', 8.99, 1, '/images/mozzarella-sticks.jpg', '["mozzarella cheese", "breadcrumbs", "marinara sauce", "italian herbs"]', '["dairy", "gluten"]', 10, true, false, true, false, false),
('Loaded Nachos', 'Crispy tortilla chips topped with melted cheese, jalapeños, sour cream, and guacamole', 11.99, 1, '/images/loaded-nachos.jpg', '["tortilla chips", "cheddar cheese", "jalapeños", "sour cream", "guacamole", "tomatoes", "onions"]', '["dairy"]', 12, true, false, true, false, true),
('Calamari Rings', 'Tender squid rings breaded and fried, served with spicy marinara sauce', 13.99, 1, '/images/calamari-rings.jpg', '["squid", "flour", "breadcrumbs", "marinara sauce", "lemon"]', '["gluten", "seafood"]', 18, true, false, false, false, false),

-- Main Courses
('Classic Burger', 'Juicy beef patty with lettuce, tomato, onion, and pickles on a brioche bun', 14.99, 2, '/images/classic-burger.jpg', '["beef patty", "brioche bun", "lettuce", "tomato", "onion", "pickles", "special sauce"]', '["gluten", "dairy"]', 20, true, true, false, false, false),
('Grilled Salmon', 'Atlantic salmon grilled to perfection, served with roasted vegetables and rice pilaf', 22.99, 2, '/images/grilled-salmon.jpg', '["atlantic salmon", "broccoli", "carrots", "rice", "herbs", "lemon"]', '["fish"]', 25, true, true, false, false, true),
('Chicken Parmesan', 'Breaded chicken breast topped with marinara sauce and melted mozzarella, served with spaghetti', 18.99, 2, '/images/chicken-parmesan.jpg', '["chicken breast", "breadcrumbs", "marinara sauce", "mozzarella", "spaghetti", "parmesan"]', '["gluten", "dairy"]', 28, true, false, false, false, false),
('Vegetarian Pizza', 'Wood-fired pizza with fresh vegetables, mozzarella, and basil', 16.99, 2, '/images/vegetarian-pizza.jpg', '["pizza dough", "mozzarella", "bell peppers", "mushrooms", "onions", "tomatoes", "basil", "olive oil"]', '["gluten", "dairy"]', 22, true, false, true, false, false),
('Beef Tacos', 'Three soft tacos filled with seasoned ground beef, lettuce, cheese, and salsa', 13.99, 2, '/images/beef-tacos.jpg', '["ground beef", "soft tortillas", "lettuce", "cheddar cheese", "salsa", "sour cream", "lime"]', '["dairy", "gluten"]', 15, true, false, false, false, true),
('Quinoa Buddha Bowl', 'Nutritious bowl with quinoa, roasted vegetables, avocado, and tahini dressing', 15.99, 2, '/images/quinoa-bowl.jpg', '["quinoa", "sweet potato", "brussels sprouts", "avocado", "chickpeas", "tahini", "pumpkin seeds"]', '["sesame"]', 20, true, false, true, true, true),

-- Desserts
('Chocolate Lava Cake', 'Warm chocolate cake with molten center, served with vanilla ice cream', 8.99, 3, '/images/lava-cake.jpg', '["dark chocolate", "butter", "eggs", "flour", "sugar", "vanilla ice cream"]', '["dairy", "eggs", "gluten"]', 12, true, true, false, false, false),
('New York Cheesecake', 'Rich and creamy cheesecake with graham cracker crust and berry compote', 7.99, 3, '/images/cheesecake.jpg', '["cream cheese", "graham crackers", "butter", "sugar", "vanilla", "mixed berries"]', '["dairy", "eggs", "gluten"]', 5, true, false, false, false, false),
('Tiramisu', 'Classic Italian dessert with coffee-soaked ladyfingers and mascarpone cream', 8.99, 3, '/images/tiramisu.jpg', '["ladyfingers", "espresso", "mascarpone", "eggs", "sugar", "cocoa powder", "marsala wine"]', '["dairy", "eggs", "gluten", "alcohol"]', 8, true, false, false, false, false),
('Fresh Fruit Tart', 'Crispy pastry shell filled with vanilla custard and topped with seasonal fruits', 6.99, 3, '/images/fruit-tart.jpg', '["pastry shell", "vanilla custard", "strawberries", "kiwi", "blueberries", "apricot glaze"]', '["dairy", "eggs", "gluten"]', 10, true, false, false, false, false),

-- Beverages
('Fresh Orange Juice', 'Freshly squeezed orange juice', 4.99, 4, '/images/orange-juice.jpg', '["fresh oranges"]', '[]', 3, true, false, true, true, true),
('Craft Beer Selection', 'Local craft beer on tap - ask your server for today''s selection', 5.99, 4, '/images/craft-beer.jpg', '["varies by selection"]', '["gluten", "alcohol"]', 2, true, false, false, false, false),
('Artisan Coffee', 'Freshly roasted single-origin coffee beans', 3.99, 4, '/images/artisan-coffee.jpg', '["coffee beans", "filtered water"]', '[]', 5, true, false, true, true, true),
('Homemade Lemonade', 'Fresh lemonade made with real lemons and mint', 3.99, 4, '/images/lemonade.jpg', '["fresh lemons", "sugar", "water", "fresh mint"]', '[]', 3, true, false, true, true, true),
('Red Wine Glass', 'House red wine selection', 7.99, 4, '/images/red-wine.jpg', '["red wine"]', '["alcohol", "sulfites"]', 2, true, false, false, false, true),

-- Specials
('Chef''s Signature Steak', 'Premium ribeye steak cooked to your preference with truffle butter and seasonal vegetables', 32.99, 5, '/images/signature-steak.jpg', '["ribeye steak", "truffle butter", "asparagus", "baby potatoes", "garlic", "thyme"]', '["dairy"]', 30, true, true, false, false, true),
('Seafood Paella', 'Traditional Spanish rice dish with shrimp, mussels, clams, and saffron', 28.99, 5, '/images/seafood-paella.jpg', '["arborio rice", "shrimp", "mussels", "clams", "saffron", "bell peppers", "peas", "garlic"]', '["shellfish", "fish"]', 35, true, true, false, false, true),
('Duck Confit', 'Slow-cooked duck leg with cherry sauce and roasted root vegetables', 26.99, 5, '/images/duck-confit.jpg', '["duck leg", "cherry sauce", "carrots", "parsnips", "rosemary", "red wine"]', '["alcohol"]', 40, true, false, false, false, true)

ON CONFLICT DO NOTHING;

-- Sample customers (for testing)
INSERT INTO customers (email, first_name, last_name, phone, preferences, loyalty_points) VALUES
('john.doe@email.com', 'John', 'Doe', '+1-555-0101', '{"dietary": ["vegetarian"], "spice_level": "medium", "favorite_categories": [1, 3]}', 150),
('jane.smith@email.com', 'Jane', 'Smith', '+1-555-0102', '{"dietary": ["gluten_free"], "spice_level": "mild", "favorite_categories": [2, 4]}', 280),
('mike.johnson@email.com', 'Mike', 'Johnson', '+1-555-0103', '{"dietary": [], "spice_level": "hot", "favorite_categories": [1, 2, 5]}', 420)
ON CONFLICT DO NOTHING;

-- Sample addresses
INSERT INTO customer_addresses (customer_id, label, street_address, city, state, postal_code, is_default) VALUES
(1, 'Home', '123 Main Street', 'Anytown', 'CA', '90210', true),
(1, 'Work', '456 Business Ave', 'Anytown', 'CA', '90211', false),
(2, 'Home', '789 Oak Drive', 'Somewhere', 'CA', '90212', true),
(3, 'Home', '321 Pine Road', 'Elsewhere', 'CA', '90213', true)
ON CONFLICT DO NOTHING;

-- Sample inventory data
INSERT INTO inventory (menu_item_id, current_stock, minimum_stock, maximum_stock, cost_per_unit) VALUES
(1, 50, 10, 100, 6.50),  -- Buffalo Wings
(2, 30, 5, 50, 4.25),    -- Mozzarella Sticks
(3, 25, 5, 40, 5.75),    -- Loaded Nachos
(4, 20, 3, 30, 7.00),    -- Calamari Rings
(5, 40, 8, 60, 8.25),    -- Classic Burger
(6, 15, 3, 25, 12.50),   -- Grilled Salmon
(7, 25, 5, 40, 9.75),    -- Chicken Parmesan
(8, 20, 4, 35, 8.50),    -- Vegetarian Pizza
(9, 35, 8, 50, 6.25),    -- Beef Tacos
(10, 20, 4, 30, 7.75),   -- Quinoa Buddha Bowl
(11, 15, 3, 25, 3.50),   -- Chocolate Lava Cake
(12, 12, 2, 20, 4.25),   -- New York Cheesecake
(13, 10, 2, 18, 4.75),   -- Tiramisu
(14, 18, 3, 25, 3.25),   -- Fresh Fruit Tart
(15, 100, 20, 150, 1.50), -- Fresh Orange Juice
(16, 24, 6, 48, 2.75),   -- Craft Beer Selection
(17, 80, 15, 120, 1.25), -- Artisan Coffee
(18, 60, 12, 100, 1.00), -- Homemade Lemonade
(19, 36, 8, 60, 3.50),   -- Red Wine Glass
(20, 8, 2, 15, 18.75),   -- Chef's Signature Steak
(21, 6, 1, 12, 16.25),   -- Seafood Paella
(22, 5, 1, 10, 15.50)    -- Duck Confit
ON CONFLICT DO NOTHING;