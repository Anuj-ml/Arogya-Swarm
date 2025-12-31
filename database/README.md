# Database Schema Documentation

## Overview
Arogya Swarm uses PostgreSQL as its primary database with UUID-based primary keys for scalability and distributed systems support.

## Schema Structure

### Patients Table
Stores patient demographic and contact information.

```sql
CREATE TABLE IF NOT EXISTS patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    age INTEGER,
    gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'other')),
    phone VARCHAR(15) UNIQUE,
    village VARCHAR(100),
    district VARCHAR(100),          -- Added for location tracking
    state VARCHAR(50) DEFAULT 'Maharashtra',  -- Added for state-level analytics
    asha_worker_id UUID,             -- Links to assigned ASHA worker
    language_preference VARCHAR(5) DEFAULT 'en',  -- User's preferred language
    address TEXT,
    medical_history JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

**Indexes:**
- `idx_patients_phone` - Fast phone lookup
- `idx_patients_village` - Village-based queries
- `idx_patients_district` - District-level analytics
- `idx_patients_state` - State-level reporting
- `idx_patients_asha_worker` - ASHA worker assignment queries

### Health Records Table
Stores medical diagnoses and health assessments.

```sql
CREATE TABLE IF NOT EXISTS health_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    symptoms TEXT,
    diagnosis TEXT,
    severity VARCHAR(20) CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    risk_score INTEGER CHECK (risk_score >= 0 AND risk_score <= 100),
    temperature DECIMAL(4,2),
    blood_pressure VARCHAR(20),
    notes TEXT,
    ai_analysis JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### Prescriptions Table
Stores medication prescriptions and follow-up schedules.

```sql
CREATE TABLE IF NOT EXISTS prescriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    doctor_name VARCHAR(255),
    medicines JSONB DEFAULT '[]',
    instructions TEXT,
    follow_up_date DATE,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### Appointments Table
Manages scheduled consultations.

```sql
CREATE TABLE IF NOT EXISTS appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    doctor_name VARCHAR(255),
    appointment_date TIMESTAMP NOT NULL,
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled')),
    reason TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### Users Table
Authentication and role-based access control.

```sql
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'doctor', 'asha_worker', 'staff')),
    full_name VARCHAR(255),
    phone VARCHAR(15),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

## Migrations

### Running Migrations

#### For New Installations
The schema is automatically applied when you start the database using docker-compose:

```bash
docker-compose up -d db
```

The schema files are mounted as init scripts:
- `database/schema.sql` - Table definitions
- `database/seed_data.sql` - Sample data

#### For Existing Databases
To add missing columns to existing installations:

```bash
# Using docker-compose
docker-compose exec db psql -U postgres -d arogya -f /path/to/migrations/add_missing_columns.sql

# Or from host
psql -h localhost -U postgres -d arogya -f database/migrations/add_missing_columns.sql
```

### Migration History

#### 2025-12-31: Add Missing Patient Columns
**File:** `migrations/add_missing_columns.sql`

**Changes:**
- Added `district` column to patients table
- Added `state` column to patients table (default: 'Maharashtra')
- Added `asha_worker_id` column to patients table
- Added `language_preference` column to patients table (default: 'en')
- Added indexes for new columns
- Backfilled existing records with default values

**Reason:** Backend models expected these columns but they were missing from the initial schema, causing API failures.

## Data Types

### JSONB Columns
Used for flexible, schema-less data storage:

- `patients.medical_history` - Patient allergies, chronic conditions, etc.
- `health_records.ai_analysis` - AI-generated diagnostic information
- `prescriptions.medicines` - Array of medication details

Example medical_history:
```json
{
  "allergies": ["penicillin", "peanuts"],
  "chronic_conditions": ["diabetes", "hypertension"],
  "family_history": ["heart_disease"]
}
```

### UUID vs Integer IDs
We use UUIDs for:
- Better scalability for distributed systems
- No auto-increment collisions
- Harder to enumerate/guess
- Offline-first mobile app support

## Connection Details

### Development
```
Host: localhost
Port: 5432
Database: arogya
User: postgres
Password: password
```

### Production
Use environment variables:
```
DATABASE_URL=postgresql://user:pass@host:5432/dbname
```

## Backup and Restore

### Backup
```bash
docker-compose exec db pg_dump -U postgres arogya > backup_$(date +%Y%m%d).sql
```

### Restore
```bash
docker-compose exec -T db psql -U postgres arogya < backup_20251231.sql
```

## Performance Considerations

### Indexes
All foreign keys and commonly queried columns are indexed for optimal performance.

### Query Optimization
- Use EXPLAIN ANALYZE for slow queries
- Consider adding partial indexes for specific use cases
- Use JSONB indexes for frequently queried JSON fields

### Connection Pooling
The backend uses SQLAlchemy's connection pooling. Default settings:
- Pool size: 5
- Max overflow: 10
- Pool timeout: 30s

## Security

### Password Hashing
User passwords are hashed using bcrypt with cost factor 12.

### Sample Credentials (Development Only)
```
Username: asha_worker / doctor / admin
Password: password123
```

**⚠️ NEVER use these credentials in production!**

## Monitoring

### Health Check
```bash
docker-compose exec db pg_isready -U postgres
```

### Active Connections
```sql
SELECT count(*) FROM pg_stat_activity WHERE datname = 'arogya';
```

### Table Sizes
```sql
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```
