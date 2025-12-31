-- Migration: Add missing columns to existing tables
-- Date: 2025-12-31
-- Purpose: Fix schema mismatch between backend models and database

-- Add missing columns to patients table
ALTER TABLE patients ADD COLUMN IF NOT EXISTS district VARCHAR(100);
ALTER TABLE patients ADD COLUMN IF NOT EXISTS state VARCHAR(50) DEFAULT 'Maharashtra';
ALTER TABLE patients ADD COLUMN IF NOT EXISTS asha_worker_id UUID;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS language_preference VARCHAR(5) DEFAULT 'en';

-- Add indexes for new columns
CREATE INDEX IF NOT EXISTS idx_patients_district ON patients(district);
CREATE INDEX IF NOT EXISTS idx_patients_state ON patients(state);
CREATE INDEX IF NOT EXISTS idx_patients_asha_worker ON patients(asha_worker_id);

-- Update existing records to have default values
UPDATE patients 
SET 
    district = 'Mumbai',
    state = 'Maharashtra',
    language_preference = 'hi'
WHERE district IS NULL;

-- Optional: Add foreign key constraint if asha_worker references users table
-- Uncomment the following line if you want to enforce referential integrity:
-- ALTER TABLE patients ADD CONSTRAINT fk_patients_asha_worker 
-- FOREIGN KEY (asha_worker_id) REFERENCES users(id) ON DELETE SET NULL;
