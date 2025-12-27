-- Patients table
CREATE TABLE IF NOT EXISTS patients (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    age INTEGER,
    gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'other')),
    phone VARCHAR(15) UNIQUE,
    village VARCHAR(100),
    district VARCHAR(100),
    state VARCHAR(50) DEFAULT 'Maharashtra',
    asha_worker_id INTEGER,
    language_preference VARCHAR(5) DEFAULT 'en',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Medical records
CREATE TABLE IF NOT EXISTS medical_records (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER REFERENCES patients(id) ON DELETE CASCADE,
    symptoms TEXT[],
    diagnosis TEXT,
    prescription TEXT,
    image_url TEXT,
    image_analysis JSONB,
    severity VARCHAR(20) CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    triage_score INTEGER,
    recorded_by VARCHAR(50),
    recorded_at TIMESTAMP DEFAULT NOW()
);

-- Nutrition plans
CREATE TABLE IF NOT EXISTS nutrition_plans (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER REFERENCES patients(id) ON DELETE CASCADE,
    age INTEGER,
    gender VARCHAR(10),
    weight_kg DECIMAL(5,2),
    height_cm INTEGER,
    bmi DECIMAL(4,2),
    region VARCHAR(50),
    dietary_restrictions TEXT[],
    health_conditions TEXT[],
    meal_plan JSONB,
    calories_target INTEGER,
    created_by VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW(),
    valid_until DATE
);

-- Telemedicine bookings
CREATE TABLE IF NOT EXISTS telemedicine_bookings (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER REFERENCES patients(id) ON DELETE CASCADE,
    doctor_name VARCHAR(255),
    doctor_specialization VARCHAR(100),
    call_type VARCHAR(20) CHECK (call_type IN ('audio', 'video', 'chat')),
    scheduled_time TIMESTAMP NOT NULL,
    duration_minutes INTEGER DEFAULT 15,
    status VARCHAR(20) DEFAULT 'pending',
    payment_status VARCHAR(20) DEFAULT 'unpaid',
    amount INTEGER,
    meeting_link TEXT,
    ai_summary TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Inventory
CREATE TABLE IF NOT EXISTS inventory (
    id SERIAL PRIMARY KEY,
    item_name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    current_stock INTEGER NOT NULL,
    threshold INTEGER NOT NULL,
    unit VARCHAR(50),
    auto_reorder_enabled BOOLEAN DEFAULT true,
    supplier VARCHAR(255),
    last_reorder_date DATE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Surge predictions
CREATE TABLE IF NOT EXISTS surge_predictions (
    id SERIAL PRIMARY KEY,
    prediction_time TIMESTAMP NOT NULL,
    surge_likelihood VARCHAR(20),
    confidence_score INTEGER,
    predicted_cases INTEGER,
    factors JSONB,
    weather_data JSONB,
    aqi_data JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- SMS logs
CREATE TABLE IF NOT EXISTS sms_logs (
    id SERIAL PRIMARY KEY,
    recipient_phone VARCHAR(15) NOT NULL,
    recipient_name VARCHAR(255),
    message TEXT NOT NULL,
    language VARCHAR(5) DEFAULT 'en',
    type VARCHAR(50),
    channel VARCHAR(20) DEFAULT 'sms',
    status VARCHAR(20) DEFAULT 'pending',
    sent_at TIMESTAMP DEFAULT NOW()
);

-- Translation cache
CREATE TABLE IF NOT EXISTS translation_cache (
    id SERIAL PRIMARY KEY,
    source_text TEXT NOT NULL,
    source_lang VARCHAR(5) NOT NULL,
    target_lang VARCHAR(5) NOT NULL,
    translated_text TEXT NOT NULL,
    provider VARCHAR(50) DEFAULT 'mymemory',
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(source_text, source_lang, target_lang)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_patients_village ON patients(village);
CREATE INDEX IF NOT EXISTS idx_patients_asha ON patients(asha_worker_id);
CREATE INDEX IF NOT EXISTS idx_medical_records_patient ON medical_records(patient_id);
CREATE INDEX IF NOT EXISTS idx_medical_records_severity ON medical_records(severity);
CREATE INDEX IF NOT EXISTS idx_inventory_critical ON inventory(current_stock) WHERE current_stock < threshold;
CREATE INDEX IF NOT EXISTS idx_telemedicine_status ON telemedicine_bookings(status);
CREATE INDEX IF NOT EXISTS idx_surge_predictions_time ON surge_predictions(prediction_time DESC);
