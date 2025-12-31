# Docker Setup Guide for Arogya-Swarm

This guide provides step-by-step instructions to run Arogya-Swarm using Docker.

## Prerequisites

- **Docker Desktop** installed on your system
  - Windows: [Download Docker Desktop for Windows](https://docs.docker.com/desktop/install/windows-install/)
  - macOS: [Download Docker Desktop for Mac](https://docs.docker.com/desktop/install/mac-install/)
  - Linux: [Install Docker Engine](https://docs.docker.com/engine/install/)
- **Docker Compose** (included with Docker Desktop)
- At least 4GB of free RAM
- At least 10GB of free disk space

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/Anuj-ml/Arogya-Swarm.git
cd Arogya-Swarm
```

### 2. Set Up Environment Variables

Copy the example environment file and add your API keys:

```bash
cp .env.example .env
```

Edit `.env` and add your API keys:
- `GOOGLE_API_KEY` - Required for AI features (Google Gemini)
- `OPENWEATHERMAP_API_KEY` - Required for weather data

### 3. Build and Start Services

```bash
docker-compose up -d --build
```

This command will:
- Build the backend and frontend Docker images
- Start PostgreSQL database with automatic schema initialization
- Start the backend API server
- Start the frontend development server

### 4. Verify Services are Running

Check that all containers are running:

```bash
docker-compose ps
```

You should see three services running:
- `arogya-db` (PostgreSQL database)
- `arogya-backend` (FastAPI backend)
- `arogya-frontend` (React frontend)

## Accessing the Application

Once all services are running, you can access:

- **Frontend Application**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Documentation (Swagger)**: http://localhost:8000/docs
- **API Documentation (ReDoc)**: http://localhost:8000/redoc

## Database Connection

The PostgreSQL database is accessible at:

- **Host**: `localhost` (from your machine) or `db` (from within Docker)
- **Port**: 5432
- **Database**: arogya
- **Username**: postgres
- **Password**: password
- **Connection String**: `postgresql://postgres:password@localhost:5432/arogya`

You can connect using any PostgreSQL client (e.g., pgAdmin, DBeaver, psql).

## Useful Docker Commands

### View Logs

View logs from all services:
```bash
docker-compose logs -f
```

View logs from a specific service:
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db
```

### Restart Services

Restart all services:
```bash
docker-compose restart
```

Restart a specific service:
```bash
docker-compose restart backend
```

### Stop Services

Stop all services (keeps containers):
```bash
docker-compose stop
```

Stop and remove all containers:
```bash
docker-compose down
```

Stop and remove all containers and volumes (WARNING: deletes database data):
```bash
docker-compose down -v
```

### Rebuild Services

If you make changes to the code or Dockerfile:
```bash
docker-compose up -d --build
```

### Access Container Shell

Access the backend container:
```bash
docker exec -it arogya-backend bash
```

Access the database container:
```bash
docker exec -it arogya-db psql -U postgres -d arogya
```

### Check Database Initialization

Verify tables were created:
```bash
docker exec -it arogya-db psql -U postgres -d arogya -c "\dt"
```

View sample data:
```bash
docker exec -it arogya-db psql -U postgres -d arogya -c "SELECT * FROM patients;"
```

## Troubleshooting

### Port Already in Use

If you get an error that a port is already in use:

1. Find the process using the port:
   ```bash
   # Windows
   netstat -ano | findstr :5432
   
   # macOS/Linux
   lsof -i :5432
   ```

2. Stop the process or change the port in `docker-compose.yml`

### Database Connection Failed

If the backend can't connect to the database:

1. Check if the database is healthy:
   ```bash
   docker-compose ps
   ```

2. Check database logs:
   ```bash
   docker-compose logs db
   ```

3. Restart the database:
   ```bash
   docker-compose restart db
   ```

### Frontend Not Loading

If the frontend doesn't load:

1. Check if the frontend is running:
   ```bash
   docker-compose logs frontend
   ```

2. Try rebuilding the frontend:
   ```bash
   docker-compose up -d --build frontend
   ```

### Backend API Errors

If you see API errors:

1. Check backend logs:
   ```bash
   docker-compose logs backend
   ```

2. Verify environment variables are set correctly in `.env`

3. Ensure API keys are valid

### Clearing Everything and Starting Fresh

To completely reset the Docker setup:

```bash
# Stop and remove all containers
docker-compose down -v

# Remove Docker images (optional)
docker-compose down --rmi all -v

# Rebuild and start
docker-compose up -d --build
```

### Database Schema Issues

If you need to reset the database schema:

```bash
# Stop and remove database volume
docker-compose down -v

# Start fresh (will reinitialize database)
docker-compose up -d
```

## Development Workflow

### Hot Reload

Both backend and frontend support hot reload:

- **Backend**: Changes to Python files will automatically reload the server
- **Frontend**: Changes to React/TypeScript files will automatically update in the browser

### Adding New Dependencies

#### Backend (Python)

1. Add the package to `backend/requirements.txt`
2. Rebuild the backend container:
   ```bash
   docker-compose up -d --build backend
   ```

#### Frontend (Node.js)

1. Add the package to `frontend/package.json` or run:
   ```bash
   docker exec -it arogya-frontend npm install <package-name>
   ```
2. Rebuild the frontend container:
   ```bash
   docker-compose up -d --build frontend
   ```

## Production Deployment

⚠️ **IMPORTANT SECURITY NOTES**

The default configuration uses development credentials that are NOT secure for production:
- Database password: `password` (weak)
- All demo users have the same password: `password123`

**Before deploying to production:**

1. Change database credentials in `docker-compose.yml`:
   - Use strong, unique passwords
   - Consider using Docker secrets or environment variables
   - Never commit production credentials to version control

2. Update the `seed_data.sql` or remove it entirely:
   - Generate unique, strong passwords for each user
   - Use proper bcrypt hashing with appropriate work factor
   - Remove or disable demo accounts

3. Additional production requirements:
   - Set up SSL/TLS certificates
   - Configure proper CORS origins
   - Enable rate limiting and authentication
   - Set up proper logging and monitoring
   - Use environment-specific configuration files
   - Consider using Docker Swarm or Kubernetes for orchestration
   - Implement proper backup and disaster recovery procedures

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Documentation](https://react.dev/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

## Support

For issues or questions:
- Open an issue on GitHub
- Check existing documentation in the repository
- Review the logs using `docker-compose logs`
