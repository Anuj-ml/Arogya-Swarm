# Arogya-Swarm API Documentation

## Base URL
```
Development: http://localhost:8000
Production: https://api.arogya-swarm.in
```

## Authentication
Most endpoints require authentication via JWT tokens:
```http
Authorization: Bearer <token>
```

## API Endpoints

### Health & Status

#### GET `/health`
Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "environment": "development"
}
```

#### GET `/`
Root endpoint with API information.

**Response:**
```json
{
  "message": "Welcome to Arogya-Swarm API",
  "version": "1.0.0",
  "status": "operational"
}
```

---

### Patient Management

#### POST `/api/v1/patients/`
Create a new patient.

**Request Body:**
```json
{
  "name": "Ramesh Kumar",
  "age": 45,
  "gender": "male",
  "phone": "+91-9876543210",
  "village": "Dharavi"
}
```

**Response:**
```json
{
  "id": 1,
  "name": "Ramesh Kumar",
  "age": 45,
  "gender": "male",
  "phone": "+91-9876543210",
  "village": "Dharavi",
  "created_at": "2024-12-27T06:00:00Z"
}
```

#### GET `/api/v1/patients/`
List all patients.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Results per page (default: 20)

---

### Diagnosis & Triage

#### POST `/api/v1/diagnosis/analyze`
Analyze symptoms and get AI-powered triage.

**Request Body:**
```json
{
  "symptoms": ["fever", "cough", "headache"],
  "patient_age": 45,
  "patient_gender": "male",
  "duration_days": 3
}
```

**Response:**
```json
{
  "risk_score": 65,
  "severity": "medium",
  "urgent": false,
  "triage_category": "yellow",
  "recommendations": [
    "Monitor temperature regularly",
    "Stay hydrated",
    "Rest adequately",
    "Consult doctor if symptoms worsen"
  ],
  "red_flags": [],
  "ai_summary": "Patient presents with common respiratory symptoms. Moderate risk. Standard monitoring recommended."
}
```

#### POST `/api/v1/diagnosis/triage`
Direct triage without full analysis.

---

### Nutrition Planning

#### POST `/api/v1/nutrition/plan`
Generate personalized meal plan.

**Request Body:**
```json
{
  "age": 30,
  "gender": "male",
  "height_cm": 170,
  "weight_kg": 70,
  "activity_level": "moderate",
  "dietary_preference": "vegetarian"
}
```

**Response:**
```json
{
  "bmi": 24.2,
  "bmi_category": "normal",
  "total_calories": 2200,
  "meals": {
    "breakfast": {
      "items": ["Oats", "Banana", "Milk"],
      "calories": 450
    },
    "lunch": {
      "items": ["Rice", "Dal", "Vegetables"],
      "calories": 700
    },
    "dinner": {
      "items": ["Roti", "Sabzi", "Salad"],
      "calories": 600
    },
    "snacks": {
      "items": ["Fruits", "Nuts"],
      "calories": 450
    }
  }
}
```

---

### Surge Prediction

#### POST `/api/v1/surge/predict`
Predict disease surge for a location.

**Request Body:**
```json
{
  "location": "Mumbai",
  "include_historical": false
}
```

**Response:**
```json
{
  "surge_likelihood": "high",
  "confidence_score": 82,
  "predicted_cases": 450,
  "factors": {
    "weather": "High humidity, temperature drop",
    "aqi": "Moderate air quality",
    "seasonal": "Monsoon season"
  },
  "recommended_actions": [
    "Stock up on respiratory medicines",
    "Prepare additional beds",
    "Alert ASHA workers"
  ],
  "prediction_time": "2024-12-27T06:00:00Z",
  "location": "Mumbai"
}
```

#### GET `/api/v1/surge/current-status`
Get current surge status summary.

**Query Parameters:**
- `location` (required): Location name

**Response:**
```json
{
  "location": "Mumbai",
  "alert_level": "high",
  "surge_likelihood": "high",
  "confidence": 82,
  "predicted_cases": 450,
  "status_message": "HIGH risk: 450 cases predicted",
  "top_action": "Stock up on respiratory medicines",
  "checked_at": "2024-12-27T06:00:00Z"
}
```

---

### Inventory Management

#### GET `/api/v1/inventory/critical`
Get critical stock items.

**Response:**
```json
{
  "summary": {
    "total_items": 45,
    "out_of_stock": 2,
    "critical_items": 5,
    "health_score": 72
  },
  "critical_items": [
    {
      "id": 1,
      "item_name": "Paracetamol 500mg",
      "current_stock": 50,
      "threshold": 200,
      "severity": "high",
      "reorder_recommended": true
    }
  ],
  "total_alerts": 5,
  "checked_at": "2024-12-27T06:00:00Z"
}
```

#### GET `/api/v1/inventory/summary`
Get inventory health summary.

**Response:**
```json
{
  "total_items": 45,
  "out_of_stock": 2,
  "critical_items": 5,
  "health_score": 72
}
```

#### POST `/api/v1/inventory/reorder`
Create reorder request.

**Request Body:**
```json
{
  "item_id": 1,
  "item_name": "Paracetamol 500mg",
  "quantity": 500,
  "supplier": "MediSupply Co."
}
```

---

### Telemedicine

#### POST `/api/v1/telemedicine/book`
Book a consultation.

**Request Body:**
```json
{
  "patient_id": 1,
  "patient_name": "Ramesh Kumar",
  "doctor_name": "Dr. Sharma",
  "scheduled_time": "2024-12-28T10:00:00Z",
  "call_type": "video",
  "duration_minutes": 15
}
```

**Response:**
```json
{
  "status": "success",
  "booking": {
    "booking_id": 1001,
    "meeting_link": "https://meet.jit.si/arogya-1001",
    "payment_order": {
      "order_id": "order_xyz",
      "amount": 200,
      "currency": "INR"
    }
  },
  "message": "Consultation booked successfully. Please complete payment."
}
```

#### GET `/api/v1/telemedicine/bookings`
Get bookings with filters.

**Query Parameters:**
- `patient_id` (optional): Filter by patient
- `doctor_name` (optional): Filter by doctor
- `status` (optional): Filter by status

---

### Prescriptions

#### POST `/api/v1/prescriptions/`
Create a prescription.

**Request Body:**
```json
{
  "patient_id": 1,
  "patient_name": "Ramesh Kumar",
  "doctor_name": "Dr. Sharma",
  "medications": [
    {
      "name": "Paracetamol 500mg",
      "dosage": "1 tablet",
      "frequency": "3 times daily",
      "duration": "5 days",
      "instructions": "Take after meals"
    }
  ],
  "diagnosis": "Fever and body ache",
  "notes": "Rest and stay hydrated"
}
```

**Response:**
```json
{
  "id": 1001,
  "patient_id": 1,
  "patient_name": "Ramesh Kumar",
  "doctor_name": "Dr. Sharma",
  "medications": [...],
  "diagnosis": "Fever and body ache",
  "notes": "Rest and stay hydrated",
  "created_at": "2024-12-27T06:00:00Z",
  "status": "active"
}
```

#### GET `/api/v1/prescriptions/`
List prescriptions.

**Query Parameters:**
- `patient_id` (optional): Filter by patient
- `doctor_name` (optional): Filter by doctor
- `status` (optional): Filter by status (default: "active")

---

### Analytics

#### GET `/api/v1/analytics/dashboard`
Get comprehensive dashboard analytics.

**Response:**
```json
{
  "overview": {
    "total_patients": 1247,
    "patients_today": 42,
    "active_consultations": 8,
    "pending_prescriptions": 15,
    "surge_alerts": 2,
    "inventory_alerts": 5
  },
  "trends": {
    "patient_registrations_7d": [...],
    "consultations_7d": [...],
    "prescription_compliance": 87.5,
    "average_wait_time_minutes": 12.3
  },
  "alerts": {...},
  "performance": {...}
}
```

#### GET `/api/v1/analytics/patients`
Get patient analytics.

**Query Parameters:**
- `days` (optional): Number of days (default: 7, max: 90)

---

### Staff Management

#### GET `/api/v1/staff/`
List staff members.

**Query Parameters:**
- `role` (optional): Filter by role (asha, doctor, nurse, admin)
- `location` (optional): Filter by location
- `status` (optional): Filter by status (active, on_leave, off_duty)

**Response:**
```json
[
  {
    "id": 1,
    "name": "Sunita Devi",
    "role": "asha",
    "location": "Village A",
    "status": "active",
    "phone": "+91-9876543210",
    "email": "sunita@example.com"
  }
]
```

#### GET `/api/v1/staff/availability/summary`
Get staff availability summary.

---

### Image Analysis

#### POST `/api/v1/images/upload`
Upload medical image.

**Request:** Multipart form data
- `file`: Image file
- `patient_id` (optional): Patient ID
- `context` (optional): Context description

**Response:**
```json
{
  "image_id": 1,
  "image_url": "https://cloudinary.com/...",
  "status": "uploaded"
}
```

#### POST `/api/v1/images/analyze`
Analyze uploaded image with AI.

**Request Body:**
```json
{
  "image_url": "https://cloudinary.com/...",
  "context": "wound on left arm",
  "patient_id": 1
}
```

**Response:**
```json
{
  "analysis": {
    "findings": "Minor wound, no signs of infection",
    "severity": "low",
    "recommendations": [
      "Clean wound daily",
      "Apply antibiotic ointment",
      "Cover with sterile bandage"
    ],
    "requires_doctor": false
  }
}
```

---

## Error Responses

All endpoints may return error responses in this format:

```json
{
  "detail": "Error message describing what went wrong"
}
```

### Common Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized
- `404` - Not Found
- `500` - Internal Server Error

---

## Rate Limiting

- Default: 100 requests per minute per IP
- Authenticated: 1000 requests per minute per user

Headers in response:
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640000000
```

---

## Pagination

List endpoints support pagination:

**Query Parameters:**
- `page`: Page number (min: 1)
- `per_page` or `limit`: Results per page (min: 1, max: 100)

**Response includes:**
```json
{
  "items": [...],
  "total": 150,
  "page": 1,
  "per_page": 20,
  "pages": 8
}
```

---

## Swagger Documentation

Interactive API documentation available at:
```
http://localhost:8000/docs
```

ReDoc documentation available at:
```
http://localhost:8000/redoc
```

---

## Support

For API support:
- GitHub Issues: https://github.com/Anuj-ml/Arogya-Swarm/issues
- Email: api@arogya-swarm.in
