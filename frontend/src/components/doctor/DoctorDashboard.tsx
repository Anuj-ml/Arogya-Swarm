/**
 * Doctor Dashboard Component
 * Main dashboard for doctors with patient queue and quick actions
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Clock, 
  AlertTriangle, 
  Video, 
  FileText, 
  Activity,
  Home
} from 'lucide-react';
import apiClient from '../../services/apiClient';

interface Patient {
  id: number;
  name: string;
  age?: number;
  gender?: string;
  village?: string;
  phone?: string;
}

interface Stats {
  total_patients: number;
  pending_cases: number;
  critical_cases: number;
  avg_wait_time: string;
}

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [stats, setStats] = useState<Stats>({
    total_patients: 0,
    pending_cases: 0,
    critical_cases: 0,
    avg_wait_time: '0 min',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Load patient queue
      const patientsData = await apiClient.getPatients();
      setPatients((patientsData as Patient[]).slice(0, 10)); // Show first 10

      // Calculate stats from data
      setStats({
        total_patients: (patientsData as Patient[]).length,
        pending_cases: Math.floor((patientsData as Patient[]).length * 0.3), // Mock pending
        critical_cases: Math.floor((patientsData as Patient[]).length * 0.1), // Mock critical
        avg_wait_time: '15 min',
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/')}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <Home className="w-6 h-6 text-gray-600" />
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Doctor Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Dr. Rajesh Verma</span>
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-primary-700 font-semibold">RV</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Patients</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total_patients}</p>
              </div>
              <Users className="w-12 h-12 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Pending Cases</p>
                <p className="text-3xl font-bold text-orange-600">{stats.pending_cases}</p>
              </div>
              <Clock className="w-12 h-12 text-orange-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Critical Cases</p>
                <p className="text-3xl font-bold text-red-600">{stats.critical_cases}</p>
              </div>
              <AlertTriangle className="w-12 h-12 text-red-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Avg Wait Time</p>
                <p className="text-3xl font-bold text-green-600">{stats.avg_wait_time}</p>
              </div>
              <Activity className="w-12 h-12 text-green-500" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Patient Queue */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Patient Queue</h2>
                <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                  View All
                </button>
              </div>

              {patients.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-600">No patients in queue</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {patients.map((patient, index) => (
                    <div
                      key={patient.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition cursor-pointer"
                      onClick={() => alert(`Patient details for ${patient.name} - Coming soon!`)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                            <Users className="w-5 h-5 text-primary-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{patient.name}</h3>
                            <div className="text-sm text-gray-600 space-y-1">
                              {patient.age && patient.gender && (
                                <p>{patient.age} years • {patient.gender}</p>
                              )}
                              {patient.village && <p>{patient.village}</p>}
                              {patient.phone && <p>{patient.phone}</p>}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end space-y-2">
                          {index < 2 && (
                            <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded font-medium">
                              High Priority
                            </span>
                          )}
                          <span className="text-xs text-gray-500">
                            Wait: {5 + index * 2} min
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions & Recent Activity */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <button className="w-full p-4 border-2 border-blue-200 rounded-lg hover:bg-blue-50 transition flex items-center space-x-3">
                  <Video className="w-6 h-6 text-blue-600" />
                  <span className="font-medium text-gray-900">Start Video Call</span>
                </button>
                <button className="w-full p-4 border-2 border-green-200 rounded-lg hover:bg-green-50 transition flex items-center space-x-3">
                  <FileText className="w-6 h-6 text-green-600" />
                  <span className="font-medium text-gray-900">View Prescriptions</span>
                </button>
                <button className="w-full p-4 border-2 border-purple-200 rounded-lg hover:bg-purple-50 transition flex items-center space-x-3">
                  <Activity className="w-6 h-6 text-purple-600" />
                  <span className="font-medium text-gray-900">Medical Records</span>
                </button>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Consultation completed</p>
                    <p className="text-xs text-gray-600">Ramesh Kumar - 10 min ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Prescription issued</p>
                    <p className="text-xs text-gray-600">Sunita Devi - 25 min ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Follow-up scheduled</p>
                    <p className="text-xs text-gray-600">Arjun Singh - 1 hour ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
