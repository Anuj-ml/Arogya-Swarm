/**
 * Doctor Dashboard - Patient Queue
 * Shows patients sorted by severity with AI summaries
 */
import { useState, useEffect } from 'react';
import { Users, Clock, AlertCircle, ChevronRight, FileText, History } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

interface Patient {
  id: number;
  name: string;
  age: number;
  gender: string;
  severity: string;
  symptoms: string[];
  waitTime: number;
  aiSummary: string;
  riskScore: number;
}

export default function DoctorDashboard() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const navigate = useNavigate();

  useEffect(() => {
    loadPatientQueue();
  }, []);

  const loadPatientQueue = async () => {
    try {
      // Mock patient data sorted by severity
      const mockPatients: Patient[] = [
        {
          id: 1,
          name: 'Ramesh Kumar',
          age: 45,
          gender: 'male',
          severity: 'critical',
          symptoms: ['chest pain', 'shortness of breath', 'sweating'],
          waitTime: 5,
          aiSummary: 'Possible cardiac event. Requires immediate attention.',
          riskScore: 92
        },
        {
          id: 2,
          name: 'Sunita Devi',
          age: 32,
          gender: 'female',
          severity: 'high',
          symptoms: ['severe headache', 'vomiting', 'fever'],
          waitTime: 15,
          aiSummary: 'Possible infection or migraine. Needs urgent evaluation.',
          riskScore: 78
        },
        {
          id: 3,
          name: 'Raj Singh',
          age: 28,
          gender: 'male',
          severity: 'medium',
          symptoms: ['cough', 'fever', 'body ache'],
          waitTime: 25,
          aiSummary: 'Likely upper respiratory infection. Standard consultation.',
          riskScore: 45
        },
        {
          id: 4,
          name: 'Priya Sharma',
          age: 55,
          gender: 'female',
          severity: 'medium',
          symptoms: ['joint pain', 'stiffness'],
          waitTime: 30,
          aiSummary: 'Chronic condition follow-up. Routine check recommended.',
          riskScore: 35
        },
        {
          id: 5,
          name: 'Amit Patel',
          age: 19,
          gender: 'male',
          severity: 'low',
          symptoms: ['minor cold', 'sore throat'],
          waitTime: 40,
          aiSummary: 'Common cold. Can be managed with basic medication.',
          riskScore: 15
        }
      ];

      setPatients(mockPatients);
    } catch (error) {
      console.error('Error loading patient queue:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    const colors: Record<string, string> = {
      critical: 'bg-red-100 border-red-500 text-red-900',
      high: 'bg-orange-100 border-orange-500 text-orange-900',
      medium: 'bg-yellow-100 border-yellow-500 text-yellow-900',
      low: 'bg-green-100 border-green-500 text-green-900'
    };
    return colors[severity] || colors.medium;
  };

  const getSeverityBadge = (severity: string) => {
    const badges: Record<string, string> = {
      critical: 'bg-red-600 text-white',
      high: 'bg-orange-600 text-white',
      medium: 'bg-yellow-600 text-white',
      low: 'bg-green-600 text-white'
    };
    return badges[severity] || badges.medium;
  };

  const filteredPatients = filter === 'all' 
    ? patients 
    : patients.filter(p => p.severity === filter);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading patient queue...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Doctor Dashboard</h1>
          <p className="text-gray-600">Patient queue sorted by severity</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Patients</p>
                <p className="text-3xl font-bold text-gray-900">{patients.length}</p>
              </div>
              <Users className="w-12 h-12 text-blue-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Critical</p>
                <p className="text-3xl font-bold text-red-600">
                  {patients.filter(p => p.severity === 'critical').length}
                </p>
              </div>
              <AlertCircle className="w-12 h-12 text-red-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">High Priority</p>
                <p className="text-3xl font-bold text-orange-600">
                  {patients.filter(p => p.severity === 'high').length}
                </p>
              </div>
              <AlertCircle className="w-12 h-12 text-orange-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Avg Wait Time</p>
                <p className="text-3xl font-bold text-gray-900">
                  {Math.round(patients.reduce((sum, p) => sum + p.waitTime, 0) / patients.length)} min
                </p>
              </div>
              <Clock className="w-12 h-12 text-blue-500" />
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex space-x-4">
            {['all', 'critical', 'high', 'medium', 'low'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === f
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
                {f !== 'all' && (
                  <span className="ml-2 text-sm">
                    ({patients.filter(p => p.severity === f).length})
                  </span>
                )}
                {f === 'all' && <span className="ml-2 text-sm">({patients.length})</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Patient Queue */}
        <div className="space-y-4">
          {filteredPatients.map(patient => (
            <div
              key={patient.id}
              className={`bg-white rounded-lg shadow-md border-l-4 ${getSeverityColor(patient.severity)}`}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {patient.name}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getSeverityBadge(patient.severity)}`}>
                        {patient.severity.toUpperCase()}
                      </span>
                      {patient.riskScore >= 70 && (
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                          Risk: {patient.riskScore}%
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      {patient.age} years • {patient.gender} • Waiting: {patient.waitTime} min
                    </p>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => navigate(`/doctor/history/${patient.id}`)}
                      className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                    >
                      <History className="w-4 h-4" />
                      <span>History</span>
                    </button>
                    <button
                      onClick={() => navigate(`/doctor/prescribe/${patient.id}`)}
                      className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      <FileText className="w-4 h-4" />
                      <span>Prescribe</span>
                    </button>
                    <Link
                      to={`/doctor/patient/${patient.id}`}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      <span>View Case</span>
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Symptoms:</h4>
                  <div className="flex flex-wrap gap-2">
                    {patient.symptoms.map((symptom, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                      >
                        {symptom}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-blue-900 mb-2 flex items-center">
                    <span className="mr-2">🤖</span>
                    AI Summary:
                  </h4>
                  <p className="text-sm text-blue-800">{patient.aiSummary}</p>
                </div>
              </div>
            </div>
          ))}

          {filteredPatients.length === 0 && (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Patients</h3>
              <p className="text-gray-600">No patients in the queue with the selected filter.</p>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/doctor/prescriptions"
              className="p-4 border-2 border-blue-200 rounded-lg hover:bg-blue-50 transition text-center"
            >
              <div className="text-blue-600 font-medium">View Prescriptions</div>
            </Link>
            <Link
              to="/doctor/appointments"
              className="p-4 border-2 border-green-200 rounded-lg hover:bg-green-50 transition text-center"
            >
              <div className="text-green-600 font-medium">Today's Appointments</div>
            </Link>
            <Link
              to="/doctor/video/12345"
              className="p-4 border-2 border-purple-200 rounded-lg hover:bg-purple-50 transition text-center"
            >
              <div className="text-purple-600 font-medium">Join Video Call (Demo)</div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
