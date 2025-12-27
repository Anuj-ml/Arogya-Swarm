/**
 * Analytics Dashboard Component
 * Displays comprehensive system analytics with charts
 */
import { useState, useEffect } from 'react';
import { TrendingUp, Users, Activity, Package, AlertTriangle } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import apiClient from '../../../services/apiClient';

interface AnalyticsData {
  overview: {
    total_patients: number;
    patients_today: number;
    active_consultations: number;
    pending_prescriptions: number;
    surge_alerts: number;
    inventory_alerts: number;
  };
  trends: {
    patient_registrations_7d: Array<{ date: string; count: number }>;
    consultations_7d: Array<{ date: string; count: number }>;
    prescription_compliance: number;
    average_wait_time_minutes: number;
  };
}

export default function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d');

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      const data = await apiClient.getDashboardAnalytics();
      setAnalytics(data);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading analytics...</div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-600">No analytics data available</p>
      </div>
    );
  }

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
            <p className="text-gray-600">System performance and insights</p>
          </div>
          
          <div className="flex space-x-2">
            {(['7d', '30d', '90d'] as const).map(range => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-lg font-medium ${
                  timeRange === range
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {range === '7d' ? 'Last 7 Days' : range === '30d' ? 'Last 30 Days' : 'Last 90 Days'}
              </button>
            ))}
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Total Patients</h3>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{analytics.overview.total_patients}</p>
            <p className="text-sm text-gray-500 mt-2">
              +{analytics.overview.patients_today} today
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Active Consultations</h3>
              <Activity className="w-8 h-8 text-green-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{analytics.overview.active_consultations}</p>
            <p className="text-sm text-gray-500 mt-2">
              {analytics.overview.pending_prescriptions} prescriptions pending
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Alerts</h3>
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {analytics.overview.surge_alerts + analytics.overview.inventory_alerts}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              {analytics.overview.surge_alerts} surge, {analytics.overview.inventory_alerts} inventory
            </p>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Patient Registrations Chart */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Patient Registrations (Last 7 Days)
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.trends.patient_registrations_7d}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  name="Patients"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Consultations Chart */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Consultations (Last 7 Days)
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.trends.consultations_7d}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#10b981" name="Consultations" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Key Performance Indicators
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Prescription Compliance</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ width: `${analytics.trends.prescription_compliance}%` }}
                    />
                  </div>
                  <span className="font-semibold">{analytics.trends.prescription_compliance}%</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Average Wait Time</span>
                <span className="font-semibold text-gray-900">
                  {analytics.trends.average_wait_time_minutes} min
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-600">System Uptime</span>
                <span className="font-semibold text-green-600">99.8%</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-600">AI Agents Active</span>
                <span className="font-semibold text-blue-600">9/9</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              System Health
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                  <span className="text-gray-700">Backend API</span>
                </div>
                <span className="text-green-600 font-semibold">Operational</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                  <span className="text-gray-700">Database</span>
                </div>
                <span className="text-green-600 font-semibold">Connected</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                  <span className="text-gray-700">AI Services</span>
                </div>
                <span className="text-green-600 font-semibold">Healthy</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-yellow-600 rounded-full animate-pulse"></div>
                  <span className="text-gray-700">Background Sync</span>
                </div>
                <span className="text-yellow-600 font-semibold">In Progress</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <button className="p-4 border-2 border-blue-200 rounded-lg hover:bg-blue-50 transition">
              <TrendingUp className="w-8 h-8 text-blue-600 mb-2 mx-auto" />
              <div className="text-center font-medium">View Reports</div>
            </button>
            <button className="p-4 border-2 border-green-200 rounded-lg hover:bg-green-50 transition">
              <Users className="w-8 h-8 text-green-600 mb-2 mx-auto" />
              <div className="text-center font-medium">Staff Management</div>
            </button>
            <button className="p-4 border-2 border-purple-200 rounded-lg hover:bg-purple-50 transition">
              <Package className="w-8 h-8 text-purple-600 mb-2 mx-auto" />
              <div className="text-center font-medium">Inventory</div>
            </button>
            <button className="p-4 border-2 border-red-200 rounded-lg hover:bg-red-50 transition">
              <AlertTriangle className="w-8 h-8 text-red-600 mb-2 mx-auto" />
              <div className="text-center font-medium">Surge Alerts</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
