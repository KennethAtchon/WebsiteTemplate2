# Docker Setup for WebsiteTemplate2

This directory contains Docker configuration for running WebsiteTemplate2 with Docker Compose.

## Quick Start

1. **Copy environment files:**
   ```bash
   # Infrastructure environment
   cp .env.example .env
   
   # Service-specific environments
   cp frontend/.env.example frontend/.env
   cp backend/.env.example backend/.env
   # Edit all .env files with your actual configuration values
   ```

2. **Start all services:**
   ```bash
   docker-compose up -d
   ```

3. **Run database migrations:**
   ```bash
   docker-compose exec backend bun run db:migrate
   ```

4. **Access your applications:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001
   - Database: localhost:5432
   - Redis: localhost:6379

## Development vs Production

### Development
```bash
# Start with development configuration
NODE_ENV=development docker-compose up -d
```

### Production
```bash
# Start with production configuration (includes nginx)
NODE_ENV=production docker-compose --profile production up -d
```

## Services

- **frontend**: Vite/React application (port 3000)
- **backend**: Hono API server (port 3001)
- **postgres**: PostgreSQL database (port 5432)
- **redis**: Redis cache (port 6379)
- **nginx**: Reverse proxy (ports 80, 443) - production only

## Common Commands

### View logs
```bash
# View all logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f frontend
docker-compose logs -f backend
```

### Restart services
```bash
# Restart all services
docker-compose restart

# Restart specific service
docker-compose restart frontend
```

### Stop and remove
```bash
# Stop all services
docker-compose down

# Stop and remove volumes (WARNING: deletes data)
docker-compose down -v
```

### Database operations
```bash
# Run migrations
docker-compose exec backend bun run db:migrate

# Generate Prisma client
docker-compose exec backend bun run db:generate

# Open Prisma Studio
docker-compose exec backend bun run db:studio
```

### Build and rebuild
```bash
# Rebuild specific service
docker-compose build frontend

# Rebuild all services
docker-compose build
```

## Environment Variables

### Root (.env) - Infrastructure Only
- `NODE_ENV`: Environment (development/production)
- `POSTGRES_*`: PostgreSQL database configuration
- `FRONTEND_URL`: Frontend service URL
- `BACKEND_URL`: Backend service URL
- `DOMAIN_NAME`: Production domain name
- `SSL_*`: SSL certificate paths

### Frontend (frontend/.env) - Application Specific
- `VITE_API_URL`: Backend API URL
- `VITE_FIREBASE_*`: Firebase configuration
- `VITE_STRIPE_PUBLISHABLE_KEY`: Stripe public key
- `VITE_APP_NAME`: Application name
- `VITE_APP_URL`: Frontend URL

### Backend (backend/.env) - Application Specific
- `DATABASE_URL`: PostgreSQL connection string
- `REDIS_URL`: Redis connection string
- `FIREBASE_*`: Firebase configuration
- `R2_*`: Cloudflare R2/AWS S3 configuration
- `STRIPE_SECRET_KEY`: Stripe secret key
- `RESEND_API_KEY`: Email service API key
- `ENCRYPTION_KEY`: Application encryption key
- `ADMIN_SPECIAL_CODE_HASH`: Admin access hash

## Health Checks

All services include health checks. Check status with:
```bash
docker-compose ps
```

Or test endpoints:
- Frontend: http://localhost:3000
- Backend health: http://localhost:3001/health
- Database: `docker-compose exec postgres pg_isready`

## Production Deployment

For production deployment:

1. Set `NODE_ENV=production` in your `.env`
2. Configure SSL certificates in `nginx/ssl/`
3. Uncomment HTTPS configuration in `nginx/nginx.conf`
4. Run with production profile:
   ```bash
   NODE_ENV=production docker-compose --profile production up -d
   ```

## Troubleshooting

### Port conflicts
If ports are already in use, modify them in `docker-compose.yml`:
```yaml
ports:
  - "3001:3001"  # Change to "3002:3001" etc.
```

### Permission issues
If you encounter permission issues, ensure your user has Docker permissions:
```bash
sudo usermod -aG docker $USER
# Then log out and back in
```

### Database connection issues
1. Ensure PostgreSQL is healthy: `docker-compose ps`
2. Check DATABASE_URL in `backend/.env`
3. Verify network connectivity: `docker-compose exec backend ping postgres`
