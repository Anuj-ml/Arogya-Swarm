/**
 * API Client Service
 * Centralized HTTP client for all API requests
 */
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Add auth token if available
        const token = localStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Handle unauthorized
          localStorage.removeItem('authToken');
          window.location.href = '/';
        }
        return Promise.reject(error);
      }
    );
  }

  // Generic request method
  async request<T>(config: AxiosRequestConfig): Promise<T> {
    const response = await this.client.request<T>(config);
    return response.data;
  }

  // Surge prediction APIs
  async predictSurge(location: string) {
    return this.request({
      method: 'POST',
      url: '/api/v1/surge/predict',
      data: { location, include_historical: false },
    });
  }

  async getSurgeStatus(location: string) {
    return this.request({
      method: 'GET',
      url: '/api/v1/surge/current-status',
      params: { location },
    });
  }

  // Inventory APIs
  async getCriticalStock() {
    return this.request({
      method: 'GET',
      url: '/api/v1/inventory/critical',
    });
  }

  async getInventorySummary() {
    return this.request({
      method: 'GET',
      url: '/api/v1/inventory/summary',
    });
  }

  // Telemedicine APIs
  async bookConsultation(data: any) {
    return this.request({
      method: 'POST',
      url: '/api/v1/telemedicine/book',
      data,
    });
  }

  async getBookings(filters?: any) {
    return this.request({
      method: 'GET',
      url: '/api/v1/telemedicine/bookings',
      params: filters,
    });
  }

  async getCaseSummary(patientId: number) {
    return this.request({
      method: 'GET',
      url: `/api/v1/telemedicine/summary/${patientId}`,
    });
  }

  // Image analysis APIs
  async uploadImage(file: File, patientId?: number, context?: string) {
    const formData = new FormData();
    formData.append('file', file);
    if (patientId) formData.append('patient_id', patientId.toString());
    if (context) formData.append('context', context);

    return this.request({
      method: 'POST',
      url: '/api/v1/images/upload-and-analyze',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  // ASHA support APIs
  async suggestNextAction(patientData: any) {
    return this.request({
      method: 'POST',
      url: '/api/v1/asha/suggest-action',
      data: { patient_data: patientData },
    });
  }

  // Patient APIs
  async getPatients() {
    return this.request({
      method: 'GET',
      url: '/api/v1/patients/',
    });
  }

  async createPatient(data: any) {
    return this.request({
      method: 'POST',
      url: '/api/v1/patients/',
      data,
    });
  }

  // Diagnosis APIs
  async analyzeSymptoms(data: any) {
    return this.request({
      method: 'POST',
      url: '/api/v1/diagnosis/analyze',
      data,
    });
  }

  async analyzeDiagnosis(data: any) {
    return this.request({
      method: 'POST',
      url: '/api/v1/diagnosis/analyze',
      data,
    });
  }

  // Prescription APIs
  async createPrescription(data: any) {
    return this.request({
      method: 'POST',
      url: '/api/v1/prescriptions/',
      data,
    });
  }

  async getPrescriptions(filters?: any) {
    return this.request({
      method: 'GET',
      url: '/api/v1/prescriptions/',
      params: filters,
    });
  }

  // Analytics APIs
  async getDashboardAnalytics() {
    return this.request({
      method: 'GET',
      url: '/api/v1/analytics/dashboard',
    });
  }

  async getPatientAnalytics(days: number = 7) {
    return this.request({
      method: 'GET',
      url: '/api/v1/analytics/patients',
      params: { days },
    });
  }

  // Staff APIs
  async getStaff(filters?: any) {
    return this.request({
      method: 'GET',
      url: '/api/v1/staff/',
      params: filters,
    });
  }

  async getStaffAvailability() {
    return this.request({
      method: 'GET',
      url: '/api/v1/staff/availability/summary',
    });
  }
}

export const apiClient = new ApiClient();
export default apiClient;
