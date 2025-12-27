/**
 * IndexedDB database configuration for offline data storage
 * Uses Dexie.js for easier IndexedDB management
 */
import Dexie, { Table } from 'dexie';

// Patient data interface
export interface Patient {
  id?: number;
  name: string;
  age: number;
  gender: string;
  phone?: string;
  village: string;
  syncStatus: 'pending' | 'synced' | 'error';
  createdAt: string;
  updatedAt: string;
}

// Diagnosis data interface
export interface Diagnosis {
  id?: number;
  patientId: number;
  symptoms: string[];
  severity: string;
  recommendations: string[];
  aiSummary?: string;
  syncStatus: 'pending' | 'synced' | 'error';
  createdAt: string;
  updatedAt: string;
}

// Medical image interface
export interface MedicalImage {
  id?: number;
  patientId: number;
  imageData: string; // Base64 encoded image
  context: string;
  analysis?: string;
  syncStatus: 'pending' | 'synced' | 'error';
  createdAt: string;
}

// Prescription interface
export interface Prescription {
  id?: number;
  patientId: number;
  patientName: string;
  medications: Array<{
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
  }>;
  diagnosis: string;
  syncStatus: 'pending' | 'synced' | 'error';
  createdAt: string;
}

// Sync queue interface for offline operations
export interface SyncQueue {
  id?: number;
  operation: 'create' | 'update' | 'delete';
  entity: 'patient' | 'diagnosis' | 'image' | 'prescription';
  entityId: number;
  data: any;
  retryCount: number;
  error?: string;
  createdAt: string;
}

// Define the database schema
export class ArogyaSwarmDB extends Dexie {
  patients!: Table<Patient>;
  diagnoses!: Table<Diagnosis>;
  images!: Table<MedicalImage>;
  prescriptions!: Table<Prescription>;
  syncQueue!: Table<SyncQueue>;

  constructor() {
    super('ArogyaSwarmDB');
    
    // Define schema version 1
    this.version(1).stores({
      patients: '++id, name, phone, village, syncStatus, createdAt',
      diagnoses: '++id, patientId, severity, syncStatus, createdAt',
      images: '++id, patientId, syncStatus, createdAt',
      prescriptions: '++id, patientId, syncStatus, createdAt',
      syncQueue: '++id, entity, entityId, operation, retryCount, createdAt'
    });
  }
}

// Create database instance
export const db = new ArogyaSwarmDB();

// Helper functions for common operations

/**
 * Add patient to local database
 */
export async function addPatient(patient: Omit<Patient, 'id'>): Promise<number> {
  return await db.patients.add(patient);
}

/**
 * Get patient by ID
 */
export async function getPatient(id: number): Promise<Patient | undefined> {
  return await db.patients.get(id);
}

/**
 * Get all patients
 */
export async function getAllPatients(): Promise<Patient[]> {
  return await db.patients.toArray();
}

/**
 * Get patients pending sync
 */
export async function getPendingPatients(): Promise<Patient[]> {
  return await db.patients.where('syncStatus').equals('pending').toArray();
}

/**
 * Update patient sync status
 */
export async function updatePatientSyncStatus(
  id: number, 
  status: 'pending' | 'synced' | 'error'
): Promise<number> {
  return await db.patients.update(id, { 
    syncStatus: status, 
    updatedAt: new Date().toISOString() 
  });
}

/**
 * Add diagnosis to local database
 */
export async function addDiagnosis(diagnosis: Omit<Diagnosis, 'id'>): Promise<number> {
  return await db.diagnoses.add(diagnosis);
}

/**
 * Get diagnoses for a patient
 */
export async function getPatientDiagnoses(patientId: number): Promise<Diagnosis[]> {
  return await db.diagnoses.where('patientId').equals(patientId).toArray();
}

/**
 * Add medical image to local database
 */
export async function addMedicalImage(image: Omit<MedicalImage, 'id'>): Promise<number> {
  return await db.images.add(image);
}

/**
 * Get images for a patient
 */
export async function getPatientImages(patientId: number): Promise<MedicalImage[]> {
  return await db.images.where('patientId').equals(patientId).toArray();
}

/**
 * Add prescription to local database
 */
export async function addPrescription(prescription: Omit<Prescription, 'id'>): Promise<number> {
  return await db.prescriptions.add(prescription);
}

/**
 * Get prescriptions for a patient
 */
export async function getPatientPrescriptions(patientId: number): Promise<Prescription[]> {
  return await db.prescriptions.where('patientId').equals(patientId).toArray();
}

/**
 * Add item to sync queue
 */
export async function addToSyncQueue(item: Omit<SyncQueue, 'id'>): Promise<number> {
  return await db.syncQueue.add(item);
}

/**
 * Get all pending sync items
 */
export async function getPendingSyncItems(): Promise<SyncQueue[]> {
  return await db.syncQueue.toArray();
}

/**
 * Remove item from sync queue
 */
export async function removeSyncQueueItem(id: number): Promise<void> {
  await db.syncQueue.delete(id);
}

/**
 * Update sync queue item retry count
 */
export async function updateSyncQueueRetry(id: number, error: string): Promise<number> {
  const item = await db.syncQueue.get(id);
  if (item) {
    return await db.syncQueue.update(id, {
      retryCount: item.retryCount + 1,
      error: error
    });
  }
  return 0;
}

/**
 * Clear all data (for testing or reset)
 */
export async function clearAllData(): Promise<void> {
  await db.patients.clear();
  await db.diagnoses.clear();
  await db.images.clear();
  await db.prescriptions.clear();
  await db.syncQueue.clear();
}

/**
 * Get database statistics
 */
export async function getDatabaseStats(): Promise<{
  patients: number;
  diagnoses: number;
  images: number;
  prescriptions: number;
  pendingSync: number;
}> {
  const [patients, diagnoses, images, prescriptions, pendingSync] = await Promise.all([
    db.patients.count(),
    db.diagnoses.count(),
    db.images.count(),
    db.prescriptions.count(),
    db.syncQueue.count()
  ]);

  return {
    patients,
    diagnoses,
    images,
    prescriptions,
    pendingSync
  };
}
