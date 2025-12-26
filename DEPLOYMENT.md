# Deployment Guide - Arogya-Swarm

## 🚀 Deployment Options

### Option 1: Docker Compose (Recommended for Quick Start)

#### Prerequisites
- Docker 20.10+
- Docker Compose 2.0+
- At least 2GB RAM
- 10GB disk space

#### Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/Anuj-ml/Arogya-Swarm.git
   cd Arogya-Swarm
   ```

2. **Set up environment variables**
   ```bash
   # Backend
   cp backend/.env.example backend/.env
   nano backend/.env  # Add your API keys
   
   # Frontend
   cp frontend/.env.example frontend/.env
   nano frontend/.env  # Usually default is fine
   ```

3. **Start all services**
   ```bash
   docker-compose up -d
   ```

4. **Verify deployment**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000/docs
   - Database: localhost:5432

5. **View logs**
   ```bash
   docker-compose logs -f
   ```

6. **Stop services**
   ```bash
   docker-compose down
   ```

### Option 2: Manual Deployment

#### Backend Deployment

1. **Install dependencies**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

2. **Set up database**
   ```bash
   # Install PostgreSQL
   sudo apt-get install postgresql-16
   
   # Create database
   sudo -u postgres psql
   CREATE DATABASE arogya_swarm;
   CREATE USER arogya_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE arogya_swarm TO arogya_user;
   \q
   
   # Run migrations
   psql -U arogya_user -d arogya_swarm -f scripts/init_db.sql
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   nano .env  # Add your configuration
   ```

4. **Start backend**
   ```bash
   uvicorn main:app --host 0.0.0.0 --port 8000
   ```

#### Frontend Deployment

1. **Install dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env
   echo "VITE_API_URL=http://your-backend-url:8000" > .env
   ```

3. **Build for production**
   ```bash
   npm run build
   ```

4. **Serve with nginx**
   ```bash
   sudo apt-get install nginx
   sudo cp -r dist/* /var/www/html/
   ```

### Option 3: Cloud Deployment

#### AWS Deployment

**Backend (EC2 + RDS)**

1. **Create RDS PostgreSQL instance**
   - Engine: PostgreSQL 16
   - Instance type: db.t3.micro (free tier)
   - Storage: 20GB

2. **Launch EC2 instance**
   - AMI: Ubuntu 22.04
   - Instance type: t2.micro (free tier)
   - Security group: Allow ports 22, 80, 443, 8000

3. **Deploy backend**
   ```bash
   ssh -i your-key.pem ubuntu@your-ec2-ip
   
   # Install dependencies
   sudo apt-get update
   sudo apt-get install python3.11 python3-pip nginx
   
   # Clone and setup
   git clone https://github.com/Anuj-ml/Arogya-Swarm.git
   cd Arogya-Swarm/backend
   pip3 install -r requirements.txt
   
   # Configure environment with RDS endpoint
   nano .env
   
   # Run with gunicorn
   pip3 install gunicorn
   gunicorn main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
   ```

**Frontend (S3 + CloudFront)**

1. **Build frontend**
   ```bash
   cd frontend
   npm install
   VITE_API_URL=https://your-backend-url npm run build
   ```

2. **Create S3 bucket**
   - Enable static website hosting
   - Upload dist/* files

3. **Create CloudFront distribution**
   - Origin: S3 bucket
   - Enable HTTPS
   - Add custom domain (optional)

#### Google Cloud Platform

**Backend (Cloud Run + Cloud SQL)**

1. **Create Cloud SQL instance**
   ```bash
   gcloud sql instances create arogya-db \
     --database-version=POSTGRES_16 \
     --tier=db-f1-micro \
     --region=us-central1
   ```

2. **Build and deploy**
   ```bash
   cd backend
   
   # Create Dockerfile.prod
   cat > Dockerfile.prod << 'EOF'
   FROM python:3.11-slim
   WORKDIR /app
   COPY requirements.txt .
   RUN pip install -r requirements.txt
   COPY . .
   CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]
   EOF
   
   # Deploy to Cloud Run
   gcloud run deploy arogya-backend \
     --source . \
     --region us-central1 \
     --allow-unauthenticated
   ```

**Frontend (Firebase Hosting)**

```bash
cd frontend
npm install -g firebase-tools
firebase login
firebase init hosting
npm run build
firebase deploy
```

#### Heroku Deployment

**Backend**

1. **Create Heroku app**
   ```bash
   heroku create arogya-swarm-backend
   heroku addons:create heroku-postgresql:hobby-dev
   ```

2. **Deploy**
   ```bash
   cd backend
   echo "web: uvicorn main:app --host 0.0.0.0 --port \$PORT" > Procfile
   git add .
   git commit -m "Deploy to Heroku"
   git push heroku main
   ```

**Frontend**

```bash
cd frontend
npm run build
# Deploy to Netlify or Vercel
```

## 🔒 Production Configuration

### Environment Variables

**Backend (.env)**
```bash
# Production mode
APP_ENV=production
DEBUG=false

# Database (use production credentials)
DATABASE_URL=postgresql://user:pass@host:5432/db

# Security (generate strong keys)
SECRET_KEY=$(openssl rand -hex 32)

# API Keys (production keys)
GEMINI_API_KEY=your_production_key
OPENWEATHER_API_KEY=your_production_key
# ... other keys
```

**Frontend (.env)**
```bash
VITE_API_URL=https://your-production-backend-url
```

### Security Checklist

- [ ] Use HTTPS everywhere
- [ ] Set strong SECRET_KEY
- [ ] Enable CORS only for your domains
- [ ] Use environment variables for secrets
- [ ] Enable database SSL
- [ ] Set up firewall rules
- [ ] Enable rate limiting
- [ ] Regular security updates
- [ ] Backup database regularly
- [ ] Monitor logs

### Performance Optimization

**Backend**
```python
# Use production ASGI server
pip install gunicorn uvicorn[standard]
gunicorn main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker
```

**Frontend**
```bash
# Build with optimizations
npm run build

# Use CDN for static assets
# Enable gzip compression
# Implement caching headers
```

### Monitoring

**Application Monitoring**
- Set up error tracking (Sentry)
- Enable application logs
- Monitor API response times
- Track user analytics

**Infrastructure Monitoring**
- CPU and memory usage
- Database performance
- API endpoint health
- Disk space

### Backup Strategy

**Database Backups**
```bash
# Automated daily backups
pg_dump -U arogya_user arogya_swarm > backup_$(date +%Y%m%d).sql

# Restore from backup
psql -U arogya_user arogya_swarm < backup_20241226.sql
```

**Code Backups**
- Use Git for version control
- Tag releases
- Keep production branch separate

## 🔄 CI/CD Pipeline

### GitHub Actions Example

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build and deploy
        run: |
          # Add deployment commands
          
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build and deploy
        run: |
          cd frontend
          npm install
          npm run build
          # Deploy to hosting
```

## 📊 Scaling

### Horizontal Scaling

**Backend**
- Deploy multiple instances behind load balancer
- Use connection pooling for database
- Implement caching (Redis)

**Frontend**
- Use CDN for static assets
- Enable browser caching
- Implement service worker

### Database Scaling

- Read replicas for read-heavy operations
- Connection pooling
- Query optimization
- Regular VACUUM and ANALYZE

## 🆘 Troubleshooting

### Common Issues

**Backend won't start**
```bash
# Check logs
docker-compose logs backend

# Check environment variables
cat backend/.env

# Test database connection
psql -U arogya_user -d arogya_swarm -h localhost
```

**Frontend can't connect to backend**
```bash
# Check CORS settings
# Verify API URL in frontend/.env
# Check network requests in browser console
```

**Database connection errors**
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Check connection string
# Verify firewall rules
```

## 📞 Support

For deployment issues:
- Check logs first
- Search existing issues
- Create new issue with details
- Email: contact@arogya-swarm.in

---

**Built with ❤️ for Rural India** 🇮🇳
