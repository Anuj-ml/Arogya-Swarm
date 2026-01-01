# Environment Setup Guide

## Quick Start

### For Docker (Recommended)

1. **Copy the example file:**
   ```bash
   cp .env.example .env
   ```

2. **Edit `.env` and add your credentials:**
   ```bash
   # Required: Change these values
   POSTGRES_PASSWORD=YourSecurePassword123
   DATABASE_URL=postgresql://postgres:YourSecurePassword123@db:5432/arogya
   GOOGLE_API_KEY=your_actual_gemini_key
   OPENWEATHERMAP_API_KEY=your_actual_weather_key
   ```

3. **Start the application:**
   ```bash
   docker-compose up -d
   ```

### For Local Development (Without Docker)

1. **Set up PostgreSQL locally**
   - Install PostgreSQL 15+
   - Create database: `CREATE DATABASE arogya;`

2. **Copy backend example:**
   ```bash
   cp backend/.env.example backend/.env
   ```

3. **Edit `backend/.env`:**
   ```bash
   DATABASE_URL=postgresql://postgres:your_password@localhost:5432/arogya
   GOOGLE_API_KEY=your_gemini_key
   OPENWEATHERMAP_API_KEY=your_weather_key
   ```

4. **Start backend:**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # or venv\Scripts\activate on Windows
   pip install -r requirements.txt
   uvicorn main:app --reload
   ```

5. **Start frontend (new terminal):**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## Environment Files Explained

### `.env` (Project Root)
- **Purpose:** Docker Compose configuration
- **Used by:** Docker containers
- **Hostname:** Use `db` for DATABASE_URL
- **When to use:** Running with `docker-compose up`

### `backend/.env`
- **Purpose:** Local backend development
- **Used by:** Backend application when running locally
- **Hostname:** Use `localhost` for DATABASE_URL
- **When to use:** Running backend with `uvicorn` or `python`

## Required API Keys

### Google Gemini API (Required)
- **Purpose:** AI-powered diagnosis, nutrition plans, surge prediction
- **Get key:** https://makersuite.google.com/app/apikey
- **Free tier:** 60 requests/minute
- **Variable:** `GOOGLE_API_KEY`

### OpenWeatherMap API (Required)
- **Purpose:** Weather data for surge prediction
- **Get key:** https://openweathermap.org/api
- **Free tier:** 1000 calls/day
- **Variable:** `OPENWEATHERMAP_API_KEY`

## Troubleshooting

### Backend won't start with Docker

**Error:** `Extra inputs are not permitted`
**Solution:** Make sure you're using the fixed version with `extra = "ignore"` in `backend/core/config.py`

### Database connection fails

**Error:** `could not translate host name "localhost"`
**Solution:** 
- For Docker: Use `@db:5432` in DATABASE_URL
- For local: Use `@localhost:5432` in DATABASE_URL

### Password with special characters

**Issue:** Password contains `@`, `:`, `/`, or other special characters
**Solution:** 
- In `.env` files: Use plain password (e.g., `Anuj@2028`)
- Docker and Python will handle escaping automatically
- Do NOT use URL encoding (`%40`) in `.env` files

## Security Notes

1. **Never commit `.env` files** - They're in `.gitignore`
2. **Use strong passwords** in production
3. **Rotate API keys** regularly
4. **Use environment-specific** configurations
5. **Consider Docker secrets** for production deployments
