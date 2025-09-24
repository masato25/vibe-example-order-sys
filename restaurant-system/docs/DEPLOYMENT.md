# Deployment Guide

## Overview

This guide covers deploying the Restaurant Ordering System to various environments, from local development to production cloud deployment.

## Deployment Options

- **Local Development**: Docker Compose
- **Staging/Testing**: Single server with Docker Compose
- **Production**: Cloud deployment (AWS, GCP, Azure, DigitalOcean)
- **Enterprise**: Kubernetes cluster

## Prerequisites

### Required Software
- Docker 20.10+
- Docker Compose 2.0+
- Git 2.30+
- SSL certificates (production)

### System Requirements

| Environment | CPU | RAM | Storage | Network |
|-------------|-----|-----|---------|---------|
| Development | 2 cores | 4GB | 20GB | - |
| Staging | 2 cores | 8GB | 50GB | 1Gbps |
| Production | 4+ cores | 16GB+ | 100GB+ | 1Gbps+ |

## Local Development Deployment

### Quick Setup
```bash
# Clone repository
git clone https://github.com/yourusername/restaurant-system.git
cd restaurant-system

# Run setup script
chmod +x setup.sh
./setup.sh
```

### Manual Setup
```bash
# Create environment files
cp .env.example .env
cp frontend/.env.example frontend/.env

# Start services
docker-compose up -d --build

# Initialize database
docker-compose exec -T postgres psql -U restaurant_user -d restaurant_db < schema.sql
docker-compose exec -T postgres psql -U restaurant_user -d restaurant_db < sample-data.sql

# Create admin user
docker-compose exec directus npx directus bootstrap
```

## Staging Deployment

### Environment Setup
```bash
# Create staging environment file
cp .env.example .env.staging

# Edit staging configuration
nano .env.staging
```

**Staging Environment Variables:**
```bash
NODE_ENV=staging
DB_HOST=staging-db.internal
DIRECTUS_URL=https://staging-api.yourrestaurant.com
CORS_ENABLED=true
RATE_LIMIT_ENABLED=true
LOG_LEVEL=info
```

### Deploy to Staging
```bash
# Build and deploy
docker-compose -f docker-compose.staging.yml up -d --build

# Run database migrations
./scripts/migrate-database.sh staging

# Run smoke tests
./scripts/smoke-tests.sh staging
```

## Production Deployment

### Security Checklist

- [ ] SSL/TLS certificates configured
- [ ] Database passwords rotated
- [ ] API keys secured
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Monitoring configured
- [ ] Backup strategy implemented
- [ ] Security headers configured

### Environment Configuration

**Production Environment (.env.production):**
```bash
NODE_ENV=production
DB_HOST=prod-db.internal
DB_PASSWORD=<secure-random-password>
KEY=<32-character-random-key>
SECRET=<64-character-random-secret>

# Security
CORS_ENABLED=true
CORS_ORIGIN=https://yourrestaurant.com
RATE_LIMIT_ENABLED=true
HTTPS_ONLY=true

# Monitoring
LOG_LEVEL=warn
SENTRY_DSN=https://your-sentry-dsn
ANALYTICS_ENABLED=true

# Performance
CACHE_TTL=3600
CDN_URL=https://cdn.yourrestaurant.com
```

### SSL/TLS Setup

#### Let's Encrypt (Recommended)
```bash
# Install Certbot
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx

# Generate certificates
sudo certbot --nginx -d yourrestaurant.com -d api.yourrestaurant.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

#### Custom Certificates
```bash
# Copy certificates
mkdir -p ssl/
cp your-domain.crt ssl/
cp your-domain.key ssl/

# Update docker-compose.prod.yml
volumes:
  - ./ssl:/etc/ssl/certs
```

### Production Deployment
```bash
# Pull latest code
git pull origin main

# Build production images
docker-compose -f docker-compose.prod.yml build

# Deploy with zero downtime
./scripts/deploy-production.sh

# Verify deployment
./scripts/health-check.sh production
```

## Cloud Deployment

### AWS ECS Deployment

#### Prerequisites
```bash
# Install AWS CLI
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Configure AWS CLI
aws configure
```

#### ECS Task Definition
```json
{
  "family": "restaurant-system",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "1024",
  "memory": "2048",
  "containerDefinitions": [
    {
      "name": "frontend",
      "image": "your-ecr-repo/restaurant-frontend:latest",
      "portMappings": [
        {
          "containerPort": 80,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "VITE_API_URL",
          "value": "https://api.yourrestaurant.com"
        }
      ]
    }
  ]
}
```

#### Deploy to ECS
```bash
# Build and push images
./scripts/build-aws.sh

# Create ECS cluster
aws ecs create-cluster --cluster-name restaurant-cluster

# Register task definition
aws ecs register-task-definition --cli-input-json file://ecs-task-def.json

# Create service
aws ecs create-service \
  --cluster restaurant-cluster \
  --service-name restaurant-service \
  --task-definition restaurant-system:1 \
  --desired-count 2
```

### Google Cloud Run

#### Setup
```bash
# Install gcloud CLI
curl https://sdk.cloud.google.com | bash
gcloud init

# Enable APIs
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
```

#### Deploy Services
```bash
# Build and deploy frontend
gcloud run deploy restaurant-frontend \
  --source ./frontend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated

# Build and deploy API
gcloud run deploy restaurant-api \
  --source ./directus \
  --platform managed \
  --region us-central1 \
  --set-env-vars "DB_CLIENT=pg,DB_HOST=db-host"

# Build and deploy pricing service
gcloud run deploy pricing-service \
  --source ./pricing-service \
  --platform managed \
  --region us-central1
```

### DigitalOcean App Platform

#### App Spec (app.yaml)
```yaml
name: restaurant-system
services:
- name: frontend
  source_dir: /frontend
  github:
    repo: yourusername/restaurant-system
    branch: main
  run_command: npm start
  environment: production
  instance_count: 2
  instance_size_slug: basic-xxs
  http_port: 80
  routes:
  - path: /
  envs:
  - key: VITE_API_URL
    value: ${api.PUBLIC_URL}

- name: api
  source_dir: /
  github:
    repo: yourusername/restaurant-system
    branch: main
  dockerfile_path: Dockerfile.directus
  http_port: 8055
  instance_count: 1
  instance_size_slug: basic-xs
  envs:
  - key: DB_HOST
    value: ${db.HOSTNAME}
  - key: DB_PASSWORD
    value: ${db.PASSWORD}

databases:
- name: db
  engine: PG
  version: "13"
  size: basic
```

#### Deploy to DigitalOcean
```bash
# Install doctl
curl -sL https://github.com/digitalocean/doctl/releases/download/v1.94.0/doctl-1.94.0-linux-amd64.tar.gz | tar -xzv
sudo mv doctl /usr/local/bin

# Authenticate
doctl auth init

# Create app
doctl apps create --spec app.yaml

# Monitor deployment
doctl apps list
```

### Azure Container Instances

#### Setup
```bash
# Install Azure CLI
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash

# Login
az login

# Create resource group
az group create --name restaurant-rg --location eastus
```

#### Deploy Container Group
```bash
# Deploy multi-container group
az container create \
  --resource-group restaurant-rg \
  --name restaurant-system \
  --image your-registry/restaurant-frontend:latest \
  --dns-name-label restaurant-app \
  --ports 80 443 \
  --environment-variables \
    VITE_API_URL=https://restaurant-api.eastus.azurecontainer.io
```

## Kubernetes Deployment

### Prerequisites
```bash
# Install kubectl
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl

# Install Helm
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash
```

### Kubernetes Manifests

#### Namespace
```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: restaurant-system
```

#### ConfigMap
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: restaurant-config
  namespace: restaurant-system
data:
  VITE_API_URL: "https://api.yourrestaurant.com"
  NODE_ENV: "production"
```

#### Secret
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: restaurant-secrets
  namespace: restaurant-system
type: Opaque
data:
  DB_PASSWORD: <base64-encoded-password>
  SECRET_KEY: <base64-encoded-secret>
```

#### Deployment
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: restaurant-frontend
  namespace: restaurant-system
spec:
  replicas: 3
  selector:
    matchLabels:
      app: restaurant-frontend
  template:
    metadata:
      labels:
        app: restaurant-frontend
    spec:
      containers:
      - name: frontend
        image: your-registry/restaurant-frontend:latest
        ports:
        - containerPort: 80
        envFrom:
        - configMapRef:
            name: restaurant-config
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "256Mi"
            cpu: "200m"
```

#### Service
```yaml
apiVersion: v1
kind: Service
metadata:
  name: restaurant-frontend-service
  namespace: restaurant-system
spec:
  selector:
    app: restaurant-frontend
  ports:
  - protocol: TCP
    port: 80
    targetPort: 80
  type: LoadBalancer
```

#### Ingress
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: restaurant-ingress
  namespace: restaurant-system
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
spec:
  tls:
  - hosts:
    - yourrestaurant.com
    secretName: restaurant-tls
  rules:
  - host: yourrestaurant.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: restaurant-frontend-service
            port:
              number: 80
```

### Deploy to Kubernetes
```bash
# Apply manifests
kubectl apply -f k8s/

# Monitor deployment
kubectl get pods -n restaurant-system
kubectl logs -f deployment/restaurant-frontend -n restaurant-system

# Port forwarding for testing
kubectl port-forward service/restaurant-frontend-service 8080:80 -n restaurant-system
```

## Database Setup

### PostgreSQL Production Setup

#### Configuration
```sql
-- postgresql.conf
max_connections = 200
shared_buffers = 256MB
effective_cache_size = 1GB
maintenance_work_mem = 64MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
random_page_cost = 1.1
effective_io_concurrency = 200
```

#### Security
```sql
-- Create read-only user
CREATE USER restaurant_readonly WITH PASSWORD 'secure_password';
GRANT CONNECT ON DATABASE restaurant_db TO restaurant_readonly;
GRANT USAGE ON SCHEMA public TO restaurant_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO restaurant_readonly;

-- Create backup user
CREATE USER restaurant_backup WITH PASSWORD 'backup_password';
GRANT CONNECT ON DATABASE restaurant_db TO restaurant_backup;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO restaurant_backup;
```

### Database Migrations

#### Migration Script
```bash
#!/bin/bash
# migrate-database.sh

ENVIRONMENT=${1:-development}
BACKUP_DIR="backups/$(date +%Y%m%d_%H%M%S)"

echo "🗄️  Database Migration - $ENVIRONMENT"

# Create backup
mkdir -p $BACKUP_DIR
docker-compose exec postgres pg_dump -U restaurant_user restaurant_db > $BACKUP_DIR/pre_migration.sql

# Run migrations
docker-compose exec -T postgres psql -U restaurant_user -d restaurant_db < migrations/001_initial_schema.sql
docker-compose exec -T postgres psql -U restaurant_user -d restaurant_db < migrations/002_add_indexes.sql

# Verify migration
docker-compose exec postgres psql -U restaurant_user -d restaurant_db -c "\d+"

echo "✅ Migration completed"
```

## Monitoring & Logging

### Health Checks

#### Application Health Check
```bash
#!/bin/bash
# health-check.sh

ENVIRONMENT=${1:-development}

case $ENVIRONMENT in
  "development")
    FRONTEND_URL="http://localhost:5173"
    API_URL="http://localhost:8055"
    ;;
  "production")
    FRONTEND_URL="https://yourrestaurant.com"
    API_URL="https://api.yourrestaurant.com"
    ;;
esac

echo "🔍 Health Check - $ENVIRONMENT"

# Check frontend
if curl -f $FRONTEND_URL > /dev/null 2>&1; then
  echo "✅ Frontend: OK"
else
  echo "❌ Frontend: FAILED"
  exit 1
fi

# Check API
if curl -f $API_URL/server/health > /dev/null 2>&1; then
  echo "✅ API: OK"
else
  echo "❌ API: FAILED"
  exit 1
fi

echo "🎉 All services healthy"
```

### Logging Configuration

#### Docker Compose Logging
```yaml
services:
  frontend:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
        
  directus:
    logging:
      driver: "json-file"
      options:
        max-size: "50m"
        max-file: "5"
```

#### Centralized Logging (ELK Stack)
```yaml
# docker-compose.logging.yml
version: '3.8'
services:
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.5.0
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
    ports:
      - "9200:9200"
    
  kibana:
    image: docker.elastic.co/kibana/kibana:8.5.0
    ports:
      - "5601:5601"
    depends_on:
      - elasticsearch
    
  logstash:
    image: docker.elastic.co/logstash/logstash:8.5.0
    volumes:
      - ./logstash.conf:/usr/share/logstash/pipeline/logstash.conf
    depends_on:
      - elasticsearch
```

## Backup & Recovery

### Database Backup

#### Automated Backup Script
```bash
#!/bin/bash
# backup-database.sh

BACKUP_DIR="/backups/$(date +%Y/%m/%d)"
RETENTION_DAYS=30

# Create backup directory
mkdir -p $BACKUP_DIR

# Perform backup
docker-compose exec postgres pg_dump -U restaurant_user restaurant_db | gzip > $BACKUP_DIR/restaurant_db_$(date +%H%M%S).sql.gz

# Upload to cloud storage (AWS S3)
aws s3 cp $BACKUP_DIR/ s3://your-backup-bucket/database-backups/ --recursive

# Cleanup old backups
find /backups -type f -mtime +$RETENTION_DAYS -delete

echo "✅ Backup completed: $BACKUP_DIR"
```

#### Cron Job Setup
```bash
# Add to crontab
0 2 * * * /path/to/backup-database.sh >> /var/log/backup.log 2>&1
```

### Disaster Recovery

#### Recovery Procedure
```bash
#!/bin/bash
# restore-database.sh

BACKUP_FILE=$1

if [ -z "$BACKUP_FILE" ]; then
  echo "Usage: $0 <backup_file>"
  exit 1
fi

echo "🔄 Restoring database from: $BACKUP_FILE"

# Stop applications
docker-compose stop frontend directus pricing-service

# Restore database
zcat $BACKUP_FILE | docker-compose exec -T postgres psql -U restaurant_user -d restaurant_db

# Start applications
docker-compose start frontend directus pricing-service

echo "✅ Database restored successfully"
```

## Performance Optimization

### Frontend Optimization

#### Build Optimization
```javascript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue', 'vue-router', 'pinia'],
          ui: ['@headlessui/vue', '@heroicons/vue']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
})
```

#### CDN Configuration
```nginx
# nginx.conf
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
  expires 1y;
  add_header Cache-Control "public, immutable";
}
```

### Database Optimization

#### Indexes
```sql
-- Add performance indexes
CREATE INDEX idx_menu_items_category ON menu_items(category);
CREATE INDEX idx_menu_items_available ON menu_items(available);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_order_items_menu_item ON order_items(menu_item_id);
```

#### Connection Pooling
```yaml
# docker-compose.yml
services:
  postgres:
    environment:
      - POSTGRES_MAX_CONNECTIONS=200
  
  pgbouncer:
    image: pgbouncer/pgbouncer:latest
    environment:
      - DATABASES_HOST=postgres
      - DATABASES_USER=restaurant_user
      - DATABASES_PASSWORD=restaurant_pass
      - POOL_MODE=transaction
      - MAX_CLIENT_CONN=100
      - DEFAULT_POOL_SIZE=20
```

## Troubleshooting

### Common Issues

#### Database Connection Issues
```bash
# Check database connectivity
docker-compose exec postgres pg_isready -U restaurant_user

# View database logs
docker-compose logs postgres

# Reset database
docker-compose down -v
docker-compose up -d postgres
```

#### Frontend Build Issues
```bash
# Clear build cache
cd frontend
rm -rf node_modules dist .vite
npm install
npm run build
```

#### Memory Issues
```bash
# Check container memory usage
docker stats

# Increase memory limits
# In docker-compose.yml:
services:
  directus:
    mem_limit: 2g
    mem_reservation: 1g
```

### Log Analysis

#### Common Log Patterns
```bash
# Database connection errors
grep "connection" docker-compose logs

# API errors
grep "ERROR" docker-compose logs directus

# Performance issues
grep "slow" docker-compose logs
```

## Security Considerations

### SSL/TLS Configuration

#### Nginx SSL Configuration
```nginx
server {
    listen 443 ssl http2;
    server_name yourrestaurant.com;
    
    ssl_certificate /etc/ssl/certs/yourrestaurant.com.crt;
    ssl_certificate_key /etc/ssl/private/yourrestaurant.com.key;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;
    
    add_header Strict-Transport-Security "max-age=63072000" always;
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
}
```

### Environment Security

#### Secrets Management
```bash
# Use Docker secrets
echo "secret_password" | docker secret create db_password -

# Reference in compose file
services:
  postgres:
    secrets:
      - db_password
    environment:
      - POSTGRES_PASSWORD_FILE=/run/secrets/db_password
```

#### Firewall Configuration
```bash
# UFW configuration
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw deny 5432/tcp  # Block direct database access
sudo ufw enable
```

## Cost Optimization

### Cloud Cost Management

#### AWS Cost Optimization
- Use Reserved Instances for predictable workloads
- Enable auto-scaling for variable traffic
- Use S3 lifecycle policies for backups
- Monitor with AWS Cost Explorer

#### Resource Optimization
```yaml
# docker-compose.prod.yml
services:
  frontend:
    cpus: "0.5"
    mem_limit: 512M
    
  directus:
    cpus: "1.0"
    mem_limit: 1G
    
  postgres:
    cpus: "2.0"
    mem_limit: 2G
```

This deployment guide provides comprehensive instructions for deploying the Restaurant Ordering System across various environments and platforms. Choose the deployment method that best fits your requirements and infrastructure.