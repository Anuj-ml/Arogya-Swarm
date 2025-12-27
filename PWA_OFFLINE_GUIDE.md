# PWA Offline Guide for Arogya-Swarm

## Overview
Arogya-Swarm is built as a Progressive Web App (PWA) to ensure ASHA workers can continue their work even without internet connectivity. This guide explains how the offline functionality works and how to use it.

## PWA Features

### 1. **Install as App**
The application can be installed on mobile devices and desktops:

#### On Mobile (Android/iOS)
1. Open the app in Chrome/Safari
2. Tap the menu (three dots)
3. Select "Add to Home Screen"
4. The app icon will appear on your home screen

#### On Desktop
1. Open the app in Chrome/Edge
2. Click the install icon in the address bar
3. Click "Install" in the popup
4. The app will open in its own window

### 2. **Offline Storage (IndexedDB)**
All patient data, diagnoses, and images are stored locally using IndexedDB.

#### What Gets Stored Offline:
- Patient registrations
- Symptom assessments
- Diagnosis results
- Medical images
- Prescriptions
- Sync queue for pending operations

### 3. **Background Sync**
When you come back online, all pending changes automatically sync to the server.

#### How It Works:
1. You make changes offline (register patient, record symptoms)
2. Changes are saved locally with status: "pending"
3. When internet connection is restored
4. Background sync automatically uploads all pending data
5. Local data is marked as "synced"

### 4. **Service Worker**
A service worker runs in the background handling:
- Caching of static assets (HTML, CSS, JS)
- API response caching
- Offline fallback pages
- Background synchronization

---

## Offline Functionality by Feature

### ASHA Worker Interface

#### ✅ Patient Registration (Fully Offline)
```typescript
// Works offline - data saved to IndexedDB
const registerPatient = async (patientData) => {
  // Save to local database
  const localId = await addPatient({
    ...patientData,
    syncStatus: 'pending',
    createdAt: new Date().toISOString()
  });
  
  // Will sync automatically when online
  return localId;
};
```

**What happens:**
1. Patient data saved locally immediately
2. Confirmation shown to ASHA worker
3. Data queued for sync when online
4. Automatic upload when connection restored

#### ⚠️ Symptom Checker (Limited Offline)
```typescript
// Basic offline triage
const checkSymptoms = async (symptoms) => {
  if (navigator.onLine) {
    // Full AI analysis with Gemini
    return await api.analyzeDiagnosis(symptoms);
  } else {
    // Basic offline triage
    return {
      risk_score: calculateBasicRisk(symptoms),
      severity: 'medium',
      recommendations: getBasicRecommendations(symptoms),
      note: 'Limited offline analysis. Connect for full AI assessment.'
    };
  }
};
```

**Offline Limitations:**
- No AI-powered analysis
- Basic risk calculation only
- Standard recommendations
- Full analysis available when online

#### ✅ Medical Images (Fully Offline)
```typescript
// Images stored as base64 in IndexedDB
const captureImage = async (imageData, patientId) => {
  await addMedicalImage({
    patientId,
    imageData: base64Image,
    context: 'wound on left arm',
    syncStatus: 'pending',
    createdAt: new Date().toISOString()
  });
  
  // Will upload and analyze when online
};
```

### Doctor Dashboard

#### ⚠️ Patient Queue (Requires Online)
The patient queue requires real-time data from the server.

**Offline Behavior:**
- Shows cached data from last online session
- "Working Offline" indicator displayed
- No real-time updates
- Cannot start new consultations

#### ✅ Prescriptions (Fully Offline)
```typescript
// Prescriptions can be written offline
const createPrescription = async (prescriptionData) => {
  await addPrescription({
    ...prescriptionData,
    syncStatus: 'pending',
    createdAt: new Date().toISOString()
  });
  
  // Syncs when online
};
```

### Admin Dashboard

#### ⚠️ Analytics (Requires Online)
Real-time analytics require server connection.

**Offline Behavior:**
- Shows last cached data
- Timestamp indicates data age
- "Offline Mode" banner displayed

---

## How to Use Offline Mode

### For ASHA Workers

#### Before Going to Remote Location:
1. **Open the app while online**
2. **Wait for "Ready for Offline Use" indicator**
3. **Check sync status** - ensure all pending items are synced
4. **Download required resources** if prompted

#### While Offline:
1. **Register patients normally** - data saves locally
2. **Record symptoms** - basic assessment available
3. **Capture medical images** - stored locally
4. **View patient history** - from local database

#### When Back Online:
1. **Open the app**
2. **Background sync starts automatically**
3. **Check sync status** - ensure all data uploaded
4. **Green checkmark** indicates successful sync

### Sync Status Indicators

```
🟢 Synced - All data uploaded to server
🟡 Pending - Waiting for internet connection
🔴 Error - Sync failed, will retry
```

### Checking Sync Status
```typescript
import { getDatabaseStats } from './db/database';

const stats = await getDatabaseStats();
console.log(`Pending sync: ${stats.pendingSync} items`);
```

---

## Technical Implementation

### IndexedDB Schema
```typescript
// Database structure
{
  patients: {
    id: number,
    name: string,
    age: number,
    syncStatus: 'pending' | 'synced' | 'error'
  },
  diagnoses: {
    id: number,
    patientId: number,
    symptoms: string[],
    syncStatus: 'pending' | 'synced' | 'error'
  },
  images: {
    id: number,
    patientId: number,
    imageData: string, // base64
    syncStatus: 'pending' | 'synced' | 'error'
  },
  syncQueue: {
    id: number,
    operation: 'create' | 'update' | 'delete',
    entity: string,
    data: any,
    retryCount: number
  }
}
```

### Service Worker Caching Strategy

#### Static Assets (Cache First)
```javascript
// Cache HTML, CSS, JS files
self.addEventListener('fetch', (event) => {
  if (event.request.destination === 'document' || 
      event.request.destination === 'script' ||
      event.request.destination === 'style') {
    event.respondWith(
      caches.match(event.request)
        .then(response => response || fetch(event.request))
    );
  }
});
```

#### API Requests (Network First)
```javascript
// Try network, fallback to cache
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request)
        .catch(() => caches.match(event.request))
    );
  }
});
```

### Background Sync
```javascript
// Register sync event
self.addEventListener('sync', async (event) => {
  if (event.tag === 'sync-patients') {
    event.waitUntil(syncPendingData());
  }
});

async function syncPendingData() {
  const pendingItems = await getPendingSyncItems();
  
  for (const item of pendingItems) {
    try {
      await uploadToServer(item);
      await markAsSynced(item.id);
    } catch (error) {
      await incrementRetryCount(item.id);
    }
  }
}
```

---

## Storage Limits

### Browser Storage Quotas
Different browsers have different storage limits:

- **Chrome**: 60% of available disk space
- **Firefox**: 50% of available disk space
- **Safari**: ~1GB (with prompt for more)

### Monitoring Storage
```typescript
const checkStorageQuota = async () => {
  if (navigator.storage && navigator.storage.estimate) {
    const estimate = await navigator.storage.estimate();
    const percentUsed = (estimate.usage / estimate.quota) * 100;
    
    console.log(`Storage used: ${percentUsed.toFixed(2)}%`);
    
    if (percentUsed > 80) {
      alert('Storage almost full. Please sync and clear old data.');
    }
  }
};
```

---

## Troubleshooting

### Problem: Data Not Syncing
**Solutions:**
1. Check internet connection
2. Open browser DevTools > Application > Service Workers
3. Click "Update" to refresh service worker
4. Check IndexedDB for pending items
5. Manually trigger sync from settings

### Problem: App Not Working Offline
**Solutions:**
1. Ensure you've visited the app while online first
2. Check if service worker is registered
3. Clear cache and reload while online
4. Check browser console for errors

### Problem: Storage Full
**Solutions:**
1. Sync all pending data
2. Clear old synced data
3. Remove cached images
4. Clear browser cache

### Clearing Local Data
```typescript
import { clearAllData } from './db/database';

// Warning: This deletes all local data
await clearAllData();
```

---

## Best Practices

### For Developers

1. **Always set syncStatus** when saving data offline
2. **Implement retry logic** for failed syncs
3. **Show sync status** to users
4. **Handle conflicts** when syncing
5. **Test offline mode** thoroughly

### For ASHA Workers

1. **Sync regularly** when you have internet
2. **Don't rely on offline mode** for critical cases
3. **Check sync status** before closing app
4. **Clear old data** periodically
5. **Report sync errors** immediately

---

## Testing Offline Mode

### In Chrome DevTools:
1. Open DevTools (F12)
2. Go to "Network" tab
3. Select "Offline" from dropdown
4. Test app functionality

### Using Lighthouse:
```bash
# Audit PWA capabilities
lighthouse https://your-app.com --view
```

### Manual Testing Checklist:
- [ ] App installs successfully
- [ ] Works offline after first visit
- [ ] Patient registration saves offline
- [ ] Data syncs when back online
- [ ] Sync status updates correctly
- [ ] Images captured offline
- [ ] No data loss during offline period

---

## Updates & Cache Management

### App Updates
Service worker automatically checks for updates:
```javascript
// User prompted when update available
self.addEventListener('message', (event) => {
  if (event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});
```

### Cache Versioning
```javascript
const CACHE_VERSION = 'v1.0.0';
const CACHE_NAME = `arogya-swarm-${CACHE_VERSION}`;

// Clear old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys => 
      Promise.all(
        keys.filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  );
});
```

---

## Resources

- [MDN: Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [MDN: IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [PWA Best Practices](https://web.dev/pwa-checklist/)
- [Workbox (Service Worker Library)](https://developers.google.com/web/tools/workbox)

---

## Support

For offline functionality issues:
- GitHub Issues: https://github.com/Anuj-ml/Arogya-Swarm/issues
- Email: support@arogya-swarm.in
- Documentation: README.md
