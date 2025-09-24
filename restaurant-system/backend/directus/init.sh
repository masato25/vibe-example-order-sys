#!/bin/bash

# Directus initialization script
set -e

echo "🚀 Initializing Directus for Restaurant System..."

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
while ! nc -z db 5432; do
  sleep 1
done
echo "✅ Database is ready!"

# Run initial setup if not already done
if [ ! -f "/directus/database-initialized" ]; then
  echo "📊 Running initial database setup..."
  
  # Run schema creation
  PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -U $DB_USER -d $DB_DATABASE -f /directus/schema.sql || echo "Schema already exists"
  
  # Run sample data insertion
  PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -U $DB_USER -d $DB_DATABASE -f /directus/sample-data.sql || echo "Sample data might already exist"
  
  echo "🎯 Database schema and sample data ready!"
  
  # Bootstrap Directus
  echo "🔧 Bootstrapping Directus..."
  npx directus bootstrap
  
  # Create admin user
  echo "👤 Creating admin user..."
  npx directus users create --email $ADMIN_EMAIL --password $ADMIN_PASSWORD --role administrator || echo "Admin user might already exist"
  
  # Apply Directus configuration
  if [ -f "/directus/directus-config.json" ]; then
    echo "⚙️ Applying Directus configuration..."
    # Note: In a real setup, you'd use Directus schema import/export
    # For now, we'll rely on the manual setup through the admin panel
  fi
  
  # Mark as initialized
  touch /directus/database-initialized
  echo "✅ Directus initialization complete!"
else
  echo "ℹ️ Directus already initialized, skipping setup..."
fi

# Start Directus
echo "🌟 Starting Directus server..."
exec npx directus start