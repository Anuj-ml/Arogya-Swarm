/**
 * Tests for IndexedDB database functions
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { 
  db, 
  addPatient, 
  getPatient, 
  getAllPatients,
  getPendingPatients,
  addDiagnosis,
  getDatabaseStats,
  clearAllData 
} from '../db/database';

describe('IndexedDB Database', () => {
  beforeEach(async () => {
    // Clear database before each test
    await clearAllData();
  });

  describe('Patient operations', () => {
    it('should add a patient', async () => {
      const patientData = {
        name: 'Test Patient',
        age: 30,
        gender: 'male',
        village: 'Test Village',
        syncStatus: 'pending' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const id = await addPatient(patientData);
      expect(id).toBeGreaterThan(0);
    });

    it('should get a patient by ID', async () => {
      const patientData = {
        name: 'Test Patient',
        age: 30,
        gender: 'male',
        village: 'Test Village',
        syncStatus: 'pending' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const id = await addPatient(patientData);
      const patient = await getPatient(id);

      expect(patient).toBeDefined();
      expect(patient?.name).toBe('Test Patient');
      expect(patient?.age).toBe(30);
    });

    it('should get all patients', async () => {
      const patient1 = {
        name: 'Patient 1',
        age: 30,
        gender: 'male',
        village: 'Village 1',
        syncStatus: 'pending' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const patient2 = {
        name: 'Patient 2',
        age: 25,
        gender: 'female',
        village: 'Village 2',
        syncStatus: 'synced' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await addPatient(patient1);
      await addPatient(patient2);

      const patients = await getAllPatients();
      expect(patients.length).toBe(2);
    });

    it('should get pending patients', async () => {
      const pendingPatient = {
        name: 'Pending Patient',
        age: 30,
        gender: 'male',
        village: 'Test Village',
        syncStatus: 'pending' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const syncedPatient = {
        name: 'Synced Patient',
        age: 25,
        gender: 'female',
        village: 'Test Village',
        syncStatus: 'synced' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await addPatient(pendingPatient);
      await addPatient(syncedPatient);

      const pending = await getPendingPatients();
      expect(pending.length).toBe(1);
      expect(pending[0].name).toBe('Pending Patient');
    });
  });

  describe('Diagnosis operations', () => {
    it('should add a diagnosis', async () => {
      const diagnosisData = {
        patientId: 1,
        symptoms: ['fever', 'cough'],
        severity: 'medium',
        recommendations: ['Rest', 'Fluids'],
        syncStatus: 'pending' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const id = await addDiagnosis(diagnosisData);
      expect(id).toBeGreaterThan(0);
    });
  });

  describe('Database statistics', () => {
    it('should return correct database stats', async () => {
      // Add some test data
      await addPatient({
        name: 'Test Patient',
        age: 30,
        gender: 'male',
        village: 'Test Village',
        syncStatus: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      await addDiagnosis({
        patientId: 1,
        symptoms: ['fever'],
        severity: 'low',
        recommendations: ['Rest'],
        syncStatus: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      const stats = await getDatabaseStats();
      
      expect(stats.patients).toBe(1);
      expect(stats.diagnoses).toBe(1);
      expect(stats.images).toBe(0);
      expect(stats.prescriptions).toBe(0);
    });
  });

  describe('Clear all data', () => {
    it('should clear all database tables', async () => {
      // Add some data
      await addPatient({
        name: 'Test Patient',
        age: 30,
        gender: 'male',
        village: 'Test Village',
        syncStatus: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      // Clear all data
      await clearAllData();

      const stats = await getDatabaseStats();
      expect(stats.patients).toBe(0);
      expect(stats.diagnoses).toBe(0);
      expect(stats.images).toBe(0);
      expect(stats.prescriptions).toBe(0);
      expect(stats.pendingSync).toBe(0);
    });
  });
});
