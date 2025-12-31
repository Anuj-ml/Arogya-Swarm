/**
 * Patient List Component
 * View and search patient records
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, User, Phone, MapPin, Calendar } from 'lucide-react';
import apiClient from '../../services/apiClient';

interface Patient {
  id: number;
  name: string;
  age?: number;
  gender?: string;
  phone?: string;
  village?: string;
  district?: string;
  state?: string;
  language_preference?: string;
  created_at?: string;
}

export default function PatientList() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      const data = await apiClient.getPatients();
      setPatients(data as Patient[]);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load patients');
      console.error('Error loading patients:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.phone?.includes(searchTerm) ||
    patient.village?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/asha')}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
            <h1 className="text-xl font-bold text-gray-900">Patient Records</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Search Bar */}
          <div className="bg-white rounded-xl shadow-md p-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, phone, or village..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-red-900">{error}</p>
            </div>
          )}

          {loading ? (
            <div className="bg-white rounded-xl shadow-md p-8 text-center">
              <p className="text-gray-600">Loading patients...</p>
            </div>
          ) : filteredPatients.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-8 text-center">
              <User className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-600 mb-4">
                {searchTerm ? 'No patients found matching your search' : 'No patients registered yet'}
              </p>
              <button
                onClick={() => navigate('/asha/register')}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
              >
                Register First Patient
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
                <p className="text-sm text-gray-600">
                  Showing {filteredPatients.length} of {patients.length} patients
                </p>
              </div>

              {filteredPatients.map((patient) => (
                <div
                  key={patient.id}
                  className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition cursor-pointer"
                  onClick={() => {
                    // TODO: Navigate to patient detail page
                    alert(`Patient details for ${patient.name} - Coming soon!`);
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-primary-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {patient.name}
                        </h3>
                        <div className="space-y-1 text-sm text-gray-600">
                          {patient.age && patient.gender && (
                            <p className="flex items-center space-x-2">
                              <span>{patient.age} years</span>
                              <span>•</span>
                              <span className="capitalize">{patient.gender}</span>
                            </p>
                          )}
                          {patient.phone && (
                            <p className="flex items-center space-x-2">
                              <Phone className="w-4 h-4" />
                              <span>{patient.phone}</span>
                            </p>
                          )}
                          {patient.village && (
                            <p className="flex items-center space-x-2">
                              <MapPin className="w-4 h-4" />
                              <span>
                                {patient.village}
                                {patient.district && `, ${patient.district}`}
                                {patient.state && `, ${patient.state}`}
                              </span>
                            </p>
                          )}
                          {patient.created_at && (
                            <p className="flex items-center space-x-2 text-gray-500">
                              <Calendar className="w-4 h-4" />
                              <span>
                                Registered: {new Date(patient.created_at).toLocaleDateString()}
                              </span>
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      {patient.language_preference && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                          {patient.language_preference.toUpperCase()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
