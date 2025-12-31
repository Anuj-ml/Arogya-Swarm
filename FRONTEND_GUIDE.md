# Frontend Components Guide

## Overview
The Arogya Swarm frontend is built with React, TypeScript, and Tailwind CSS. It provides three main interfaces: ASHA Worker Portal, Doctor Dashboard, and Admin Dashboard.

## Tech Stack
- **Framework**: React 18 with TypeScript
- **Routing**: React Router v6
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **Build Tool**: Vite
- **Offline Support**: Dexie (IndexedDB wrapper)
- **PWA**: Vite PWA Plugin

## Application Routes

### Landing Page
- **Route**: `/`
- **Component**: `Landing`
- **Description**: Home page with role selection (ASHA, Doctor, Admin)

### ASHA Worker Portal
Base route: `/asha`

| Route | Component | Description |
|-------|-----------|-------------|
| `/asha` | `AshaHome` | ASHA worker dashboard with quick actions |
| `/asha/register` | `PatientRegistration` | Register new patients with voice input support |
| `/asha/symptoms` | `SymptomChecker` | AI-powered symptom analysis and triage |
| `/asha/camera` | `CameraCapture` | Capture and analyze medical images |
| `/asha/patients` | `PatientList` | View and search patient records |

### Doctor Dashboard
- **Route**: `/doctor`
- **Component**: `DoctorDashboard`
- **Features**:
  - Patient queue with priority sorting
  - Today's stats (total patients, pending cases, critical cases)
  - Quick actions (video call, prescriptions, medical records)
  - Recent activity timeline

### Admin Dashboard
- **Route**: `/admin`
- **Component**: `AdminHome`
- **Features**:
  - Surge prediction alerts
  - Inventory status and critical items
  - Analytics charts
  - System health monitoring

## Component Structure

```
frontend/src/
├── App.tsx                    # Main app with routing
├── main.tsx                   # Entry point
├── components/
│   ├── asha/
│   │   ├── AshaHome.tsx          # ASHA dashboard
│   │   ├── PatientRegistration.tsx  # Patient registration form
│   │   ├── SymptomChecker.tsx    # Symptom analysis
│   │   ├── CameraCapture.tsx     # Image capture
│   │   └── PatientList.tsx       # Patient records
│   ├── doctor/
│   │   └── DoctorDashboard.tsx   # Doctor interface
│   ├── admin/
│   │   └── AdminHome.tsx         # Admin interface
│   └── landing/
│       ├── Landing.tsx           # Landing page
│       ├── Hero.tsx              # Hero section
│       ├── Features.tsx          # Features section
│       ├── Architecture.tsx      # System architecture
│       └── Footer.tsx            # Footer
├── services/
│   └── apiClient.ts              # Centralized API client
└── index.css                     # Global styles
```

## API Integration

All components use the centralized `apiClient` service for backend communication:

```typescript
import apiClient from '../../services/apiClient';

// Example usage
const patients = await apiClient.getPatients();
const result = await apiClient.analyzeSymptoms(data);
```

### Available API Methods

#### Patient Management
- `createPatient(data)` - Register new patient
- `getPatients()` - List all patients
- `getPatient(id)` - Get patient details

#### Diagnosis & Symptoms
- `analyzeSymptoms(data)` - AI symptom analysis
- `uploadImage(file, patientId, context)` - Medical image analysis

#### Surge & Inventory
- `getSurgeStatus(location)` - Current surge predictions
- `getCriticalStock()` - Low inventory items
- `getInventorySummary()` - Overall inventory status

#### ASHA Support
- `suggestNextAction(patientData)` - Get AI suggestions

#### Telemedicine
- `bookConsultation(data)` - Schedule video call
- `getBookings(filters)` - List bookings
- `getCaseSummary(patientId)` - Patient case summary

## Component Features

### ASHA Worker Portal

#### Patient Registration (`/asha/register`)
- **Form Fields**: name, age, gender, phone, village, district, state, language_preference, address
- **Voice Input**: Microphone icon for voice-to-text (coming soon)
- **Validation**: Required fields marked, phone format validation
- **Success**: Redirects to ASHA home after registration

#### Symptom Checker (`/asha/symptoms`)
- **Symptom Selection**: Pre-defined common symptoms
- **Duration & Severity**: Dropdown selections
- **AI Analysis**: Real-time diagnosis with risk score
- **Results**: Severity level, recommendations, possible conditions
- **Urgency Indicator**: Color-coded priority (critical/high/medium/low)

#### Camera Capture (`/asha/camera`)
- **Image Upload**: File picker or camera capture
- **Preview**: Image preview before analysis
- **AI Analysis**: Automated image assessment
- **Results**: Confidence score, recommendations

#### Patient List (`/asha/patients`)
- **Search**: Filter by name, phone, or village
- **Patient Cards**: Display key information
- **Click to View**: Patient detail page (coming soon)

### Doctor Dashboard (`/doctor`)

#### Stats Cards
- Total patients today
- Pending cases requiring attention
- Critical priority cases
- Average patient wait time

#### Patient Queue
- Sorted by priority (critical first)
- Shows wait time for each patient
- Click for detailed patient view

#### Quick Actions
- Start video consultation
- View pending prescriptions
- Access medical records

#### Recent Activity
- Last consultations completed
- Recent prescriptions issued
- Follow-ups scheduled

### Admin Dashboard (`/admin`)

#### Surge Alerts
- Real-time disease outbreak predictions
- 48-hour forecast
- Alert levels: critical, high, elevated, normal
- Predicted case counts

#### Inventory Status
- Total items in stock
- Critical low-stock items
- Out-of-stock items
- Overall health score

#### Quick Actions
- View detailed surge predictions
- Manage inventory
- Staff allocation

#### System Health
- All 9 AI agents status
- Backend API health
- Database connection status

## Styling & Themes

### Tailwind CSS Configuration
- **Primary Color**: Blue (`primary-*`)
- **Responsive**: Mobile-first approach
- **Dark Mode**: Not yet implemented

### Design Patterns
- Card-based layouts
- Shadow on hover for interactivity
- Color-coded severity levels:
  - 🔴 Red: Critical/High
  - 🟠 Orange: Medium
  - 🟢 Green: Low/Normal
  - 🔵 Blue: Informational

## Development

### Running Locally
```bash
cd frontend
npm install
npm run dev
```

### Building for Production
```bash
npm run build
```

### Linting
```bash
npm run lint
```

## Environment Variables

Create `.env` file in frontend directory:

```env
VITE_API_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000/ws
```

## Offline Support (Coming Soon)

The app uses Dexie for IndexedDB storage to enable:
- Offline patient registration
- Cached patient records
- Sync when online

## Progressive Web App (PWA)

The app is configured as a PWA with:
- Service worker for offline caching
- Installable on mobile devices
- App manifest for home screen icon

## Accessibility

### Current Features
- Semantic HTML
- Keyboard navigation support
- Screen reader-friendly labels
- Color contrast compliance

### Future Enhancements
- ARIA labels
- Focus management
- Reduced motion support

## Performance

### Optimization Strategies
- Code splitting by route
- Lazy loading components
- Image optimization
- Minimal bundle size

### Build Output
- CSS: ~26 KB (gzipped: 5 KB)
- JavaScript: ~278 KB (gzipped: 83 KB)

## Testing

### Manual Testing Checklist
- [ ] All routes navigate correctly
- [ ] Forms submit successfully
- [ ] API calls handle errors gracefully
- [ ] Responsive design works on mobile
- [ ] Loading states display properly
- [ ] Success/error messages show

### Future: Automated Testing
- Unit tests with Vitest
- Integration tests with Testing Library
- E2E tests with Playwright

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Known Issues & Future Enhancements

### Known Issues
- Voice input not yet implemented
- Patient detail pages pending
- Video call functionality placeholder
- No authentication/authorization yet

### Planned Features
- Voice-to-text for Hindi/Marathi
- Real-time notifications
- Dark mode
- Offline sync
- Push notifications
- Multi-language support (i18n)
- User authentication

## Contributing

When adding new components:
1. Follow the existing component structure
2. Use TypeScript for type safety
3. Integrate with apiClient for API calls
4. Add proper error handling
5. Implement loading states
6. Make responsive (mobile-first)
7. Update this documentation

## Support

For frontend issues:
- Check browser console for errors
- Verify API is running at http://localhost:8000
- Check network tab for failed requests
- Ensure environment variables are set
