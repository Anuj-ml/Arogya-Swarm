/**
 * Patient History Viewer Component
 * Comprehensive medical history timeline with filtering and export
 */
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  User,
  Clock,
  Search,
  Download,
  ChevronDown,
  ChevronUp,
  X,
  Activity,
  Pill,
  Camera,
  Phone,
  Utensils,
  Calendar,
  MapPin,
  FileText
} from 'lucide-react';

interface Patient {
  id: number;
  name: string;
  age: number;
  gender: string;
  village?: string;
  phone?: string;
  bloodType?: string;
}

interface HistoryEvent {
  id: string;
  type: 'diagnosis' | 'prescription' | 'image' | 'consultation' | 'nutrition';
  date: Date;
  title: string;
  description: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  metadata?: Record<string, unknown>;
}

interface PatientHistoryProps {
  patientId?: number;
}

export default function PatientHistory({ patientId: propPatientId }: PatientHistoryProps) {
  const { patientId: paramPatientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const patientId = propPatientId || parseInt(paramPatientId || '0');

  const [patient, setPatient] = useState<Patient | null>(null);
  const [events, setEvents] = useState<HistoryEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<HistoryEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set());
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    loadPatientData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientId]);

  useEffect(() => {
    filterEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [events, selectedFilter, searchQuery]);

  const loadPatientData = async () => {
    try {
      setLoading(true);
      
      // Mock patient data
      const mockPatient: Patient = {
        id: patientId,
        name: 'Ramesh Kumar',
        age: 45,
        gender: 'Male',
        village: 'Shirdi',
        phone: '+91-9876543210',
        bloodType: 'O+'
      };
      setPatient(mockPatient);

      // Mock history events
      const mockEvents: HistoryEvent[] = [
        {
          id: '1',
          type: 'diagnosis',
          date: new Date('2024-01-15'),
          title: 'Acute Respiratory Infection',
          description: 'Patient presented with fever, cough, and shortness of breath',
          severity: 'high',
          metadata: {
            symptoms: ['fever', 'cough', 'shortness of breath', 'fatigue'],
            riskScore: 75,
            aiAnalysis: 'Possible upper respiratory tract infection. Recommend antibiotics and rest.',
            recommendations: [
              'Complete course of antibiotics',
              'Rest for 5-7 days',
              'Monitor temperature',
              'Follow up if symptoms worsen'
            ],
            doctorNotes: 'Started on Azithromycin 500mg. Monitor closely.'
          }
        },
        {
          id: '2',
          type: 'prescription',
          date: new Date('2024-01-15'),
          title: 'Prescription for Respiratory Infection',
          description: 'Antibiotics and supportive medication prescribed',
          metadata: {
            medicines: [
              { name: 'Azithromycin 500mg', dosage: '1 tablet', frequency: 'Once daily', duration: '5 days' },
              { name: 'Paracetamol 650mg', dosage: '1 tablet', frequency: 'Three times daily', duration: '5 days' },
              { name: 'Cetirizine 10mg', dosage: '1 tablet', frequency: 'At bedtime', duration: '5 days' }
            ],
            instructions: 'Take all medications with food. Complete the antibiotic course even if feeling better.',
            doctorName: 'Dr. Sharma',
            followUpDate: '2024-01-22'
          }
        },
        {
          id: '3',
          type: 'image',
          date: new Date('2024-01-10'),
          title: 'Chest X-Ray',
          description: 'Medical imaging for respiratory assessment',
          severity: 'medium',
          metadata: {
            imageUrl: 'https://via.placeholder.com/400x400?text=Chest+X-Ray',
            aiFindings: 'Mild infiltrates in lower right lobe. No significant abnormalities.',
            urgency: 'medium',
            ashaWorker: 'Sunita Devi'
          }
        },
        {
          id: '4',
          type: 'consultation',
          date: new Date('2024-01-08'),
          title: 'Video Consultation',
          description: 'Initial consultation for respiratory symptoms',
          metadata: {
            consultationType: 'Video Call',
            doctorName: 'Dr. Sharma',
            duration: '15 minutes',
            chiefComplaint: 'Fever and cough for 3 days',
            notes: 'Patient reports fever up to 101°F, productive cough, mild chest discomfort. Advised diagnostic tests.'
          }
        },
        {
          id: '5',
          type: 'nutrition',
          date: new Date('2023-12-20'),
          title: 'Nutrition Plan for Weight Management',
          description: 'Customized diet plan created',
          metadata: {
            targetCalories: 1800,
            mealBreakdown: {
              breakfast: '400 cal',
              lunch: '600 cal',
              dinner: '500 cal',
              snacks: '300 cal'
            },
            recommendations: [
              'Increase vegetable intake',
              'Reduce sugar consumption',
              'Include whole grains',
              'Stay hydrated (8 glasses water)'
            ],
            duration: '3 months'
          }
        },
        {
          id: '6',
          type: 'diagnosis',
          date: new Date('2023-11-05'),
          title: 'Routine Health Checkup',
          description: 'Annual health assessment',
          severity: 'low',
          metadata: {
            symptoms: [],
            riskScore: 25,
            aiAnalysis: 'Overall health is good. Blood pressure slightly elevated. Monitor and maintain healthy lifestyle.',
            recommendations: [
              'Continue regular exercise',
              'Monitor blood pressure weekly',
              'Reduce salt intake',
              'Annual checkup recommended'
            ],
            doctorNotes: 'BP: 135/85. Weight: 75kg. BMI: 24.5. Good overall health.'
          }
        }
      ];

      setEvents(mockEvents);
    } catch (error) {
      console.error('Error loading patient data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterEvents = () => {
    let filtered = events;

    // Filter by type
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(event => event.type === selectedFilter);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredEvents(filtered);
  };

  const toggleEventExpansion = (eventId: string) => {
    const newExpanded = new Set(expandedEvents);
    if (newExpanded.has(eventId)) {
      newExpanded.delete(eventId);
    } else {
      newExpanded.add(eventId);
    }
    setExpandedEvents(newExpanded);
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'diagnosis':
        return <Activity className="w-6 h-6 text-red-500" />;
      case 'prescription':
        return <Pill className="w-6 h-6 text-blue-500" />;
      case 'image':
        return <Camera className="w-6 h-6 text-purple-500" />;
      case 'consultation':
        return <Phone className="w-6 h-6 text-green-500" />;
      case 'nutrition':
        return <Utensils className="w-6 h-6 text-orange-500" />;
      default:
        return <FileText className="w-6 h-6 text-gray-500" />;
    }
  };

  const getSeverityBadge = (severity?: string) => {
    if (!severity) return null;
    
    const colors = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colors[severity as keyof typeof colors]}`}>
        {severity.toUpperCase()}
      </span>
    );
  };

  const exportToPDF = () => {
    // In a real implementation, this would generate a PDF
    alert('Export to PDF functionality would be implemented here');
  };

  const renderEventDetails = (event: HistoryEvent) => {
    switch (event.type) {
      case 'diagnosis':
        return (
          <div className="mt-4 space-y-3">
            {event.metadata?.symptoms?.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm mb-2">Symptoms:</h4>
                <div className="flex flex-wrap gap-2">
                  {event.metadata.symptoms.map((symptom: string, idx: number) => (
                    <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                      {symptom}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {event.metadata?.riskScore && (
              <div>
                <h4 className="font-semibold text-sm mb-2">Risk Score:</h4>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full ${
                        event.metadata.riskScore > 70 ? 'bg-red-500' :
                        event.metadata.riskScore > 50 ? 'bg-orange-500' :
                        event.metadata.riskScore > 30 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${event.metadata.riskScore}%` }}
                    />
                  </div>
                  <span className="font-semibold">{event.metadata.riskScore}%</span>
                </div>
              </div>
            )}
            {event.metadata?.aiAnalysis && (
              <div>
                <h4 className="font-semibold text-sm mb-2">AI Analysis:</h4>
                <p className="text-gray-700 text-sm bg-blue-50 p-3 rounded">{event.metadata.aiAnalysis}</p>
              </div>
            )}
            {event.metadata?.recommendations?.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm mb-2">Recommendations:</h4>
                <ul className="list-disc list-inside space-y-1">
                  {event.metadata.recommendations.map((rec: string, idx: number) => (
                    <li key={idx} className="text-gray-700 text-sm">{rec}</li>
                  ))}
                </ul>
              </div>
            )}
            {event.metadata?.doctorNotes && (
              <div>
                <h4 className="font-semibold text-sm mb-2">Doctor Notes:</h4>
                <p className="text-gray-700 text-sm italic">{event.metadata.doctorNotes}</p>
              </div>
            )}
          </div>
        );

      case 'prescription':
        return (
          <div className="mt-4 space-y-3">
            {event.metadata?.medicines?.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm mb-2">Medicines:</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left py-2 px-3">Medicine</th>
                        <th className="text-left py-2 px-3">Dosage</th>
                        <th className="text-left py-2 px-3">Frequency</th>
                        <th className="text-left py-2 px-3">Duration</th>
                      </tr>
                    </thead>
                    <tbody>
                      {event.metadata.medicines.map((med: { name: string; dosage: string; frequency: string; duration: string }, idx: number) => (
                        <tr key={idx} className="border-t">
                          <td className="py-2 px-3">{med.name}</td>
                          <td className="py-2 px-3">{med.dosage}</td>
                          <td className="py-2 px-3">{med.frequency}</td>
                          <td className="py-2 px-3">{med.duration}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            {event.metadata?.instructions && (
              <div>
                <h4 className="font-semibold text-sm mb-2">Instructions:</h4>
                <p className="text-gray-700 text-sm bg-yellow-50 p-3 rounded">{event.metadata.instructions}</p>
              </div>
            )}
            {event.metadata?.doctorName && (
              <div>
                <h4 className="font-semibold text-sm mb-2">Prescribing Doctor:</h4>
                <p className="text-gray-700 text-sm">{event.metadata.doctorName}</p>
              </div>
            )}
            {event.metadata?.followUpDate && (
              <div>
                <h4 className="font-semibold text-sm mb-2">Follow-up Date:</h4>
                <p className="text-gray-700 text-sm flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  {new Date(event.metadata.followUpDate).toLocaleDateString('en-IN')}
                </p>
              </div>
            )}
          </div>
        );

      case 'image':
        return (
          <div className="mt-4 space-y-3">
            {event.metadata?.imageUrl && (
              <div>
                <h4 className="font-semibold text-sm mb-2">Image:</h4>
                <img
                  src={event.metadata.imageUrl as string}
                  alt="Medical Image"
                  className="w-48 h-48 object-cover rounded-lg cursor-pointer hover:opacity-90"
                  onClick={() => setSelectedImage(event.metadata?.imageUrl as string)}
                />
              </div>
            )}
            {event.metadata?.aiFindings && (
              <div>
                <h4 className="font-semibold text-sm mb-2">AI Findings:</h4>
                <p className="text-gray-700 text-sm bg-purple-50 p-3 rounded">{event.metadata.aiFindings}</p>
              </div>
            )}
            {event.metadata?.urgency && (
              <div>
                <h4 className="font-semibold text-sm mb-2">Urgency Level:</h4>
                {getSeverityBadge(event.metadata.urgency)}
              </div>
            )}
            {event.metadata?.ashaWorker && (
              <div>
                <h4 className="font-semibold text-sm mb-2">Captured By:</h4>
                <p className="text-gray-700 text-sm">{event.metadata.ashaWorker}</p>
              </div>
            )}
          </div>
        );

      case 'consultation':
        return (
          <div className="mt-4 space-y-3">
            {event.metadata?.consultationType && (
              <div>
                <h4 className="font-semibold text-sm mb-2">Type:</h4>
                <p className="text-gray-700 text-sm">{event.metadata.consultationType}</p>
              </div>
            )}
            {event.metadata?.doctorName && (
              <div>
                <h4 className="font-semibold text-sm mb-2">Doctor:</h4>
                <p className="text-gray-700 text-sm">{event.metadata.doctorName}</p>
              </div>
            )}
            {event.metadata?.duration && (
              <div>
                <h4 className="font-semibold text-sm mb-2">Duration:</h4>
                <p className="text-gray-700 text-sm flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  {event.metadata.duration}
                </p>
              </div>
            )}
            {event.metadata?.chiefComplaint && (
              <div>
                <h4 className="font-semibold text-sm mb-2">Chief Complaint:</h4>
                <p className="text-gray-700 text-sm">{event.metadata.chiefComplaint}</p>
              </div>
            )}
            {event.metadata?.notes && (
              <div>
                <h4 className="font-semibold text-sm mb-2">Consultation Notes:</h4>
                <p className="text-gray-700 text-sm bg-green-50 p-3 rounded">{event.metadata.notes}</p>
              </div>
            )}
          </div>
        );

      case 'nutrition':
        return (
          <div className="mt-4 space-y-3">
            {event.metadata?.targetCalories && (
              <div>
                <h4 className="font-semibold text-sm mb-2">Target Calories:</h4>
                <p className="text-gray-700 text-sm">{event.metadata.targetCalories} calories/day</p>
              </div>
            )}
            {event.metadata?.mealBreakdown && (
              <div>
                <h4 className="font-semibold text-sm mb-2">Meal Breakdown:</h4>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(event.metadata.mealBreakdown).map(([meal, cal]) => (
                    <div key={meal} className="bg-orange-50 p-2 rounded">
                      <span className="font-medium capitalize">{meal}:</span> {String(cal)}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {event.metadata?.recommendations?.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm mb-2">Dietary Recommendations:</h4>
                <ul className="list-disc list-inside space-y-1">
                  {event.metadata.recommendations.map((rec: string, idx: number) => (
                    <li key={idx} className="text-gray-700 text-sm">{rec}</li>
                  ))}
                </ul>
              </div>
            )}
            {event.metadata?.duration && (
              <div>
                <h4 className="font-semibold text-sm mb-2">Duration:</h4>
                <p className="text-gray-700 text-sm">{event.metadata.duration}</p>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading patient history...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Patient Medical History</h1>
            <p className="text-gray-600 mt-1">Complete medical records and timeline</p>
          </div>
          <button
            onClick={() => navigate('/doctor')}
            className="text-gray-600 hover:text-gray-900"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Patient Header Card */}
        {patient && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-10 h-10 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{patient.name}</h2>
                  <p className="text-gray-600">
                    {patient.age} years • {patient.gender}
                    {patient.bloodType && ` • Blood Type: ${patient.bloodType}`}
                  </p>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                    {patient.village && (
                      <span className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {patient.village}
                      </span>
                    )}
                    {patient.phone && (
                      <span className="flex items-center">
                        <Phone className="w-4 h-4 mr-1" />
                        {patient.phone}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Summary Stats */}
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-blue-600">{events.length}</p>
                  <p className="text-sm text-gray-600">Total Records</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">
                    {events.filter(e => e.type === 'prescription').length}
                  </p>
                  <p className="text-sm text-gray-600">Prescriptions</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-orange-600">
                    {events.filter(e => e.type === 'consultation').length}
                  </p>
                  <p className="text-sm text-gray-600">Consultations</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filter Bar */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            {/* Filter Buttons */}
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'all', label: 'All Events', icon: FileText },
                { key: 'diagnosis', label: 'Diagnoses', icon: Activity },
                { key: 'prescription', label: 'Prescriptions', icon: Pill },
                { key: 'image', label: 'Images', icon: Camera },
                { key: 'consultation', label: 'Consultations', icon: Phone },
                { key: 'nutrition', label: 'Nutrition', icon: Utensils }
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setSelectedFilter(key)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    selectedFilter === key
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{label}</span>
                  <span className="text-xs">
                    ({key === 'all' ? events.length : events.filter(e => e.type === key).length})
                  </span>
                </button>
              ))}
            </div>

            {/* Search & Export */}
            <div className="flex space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search history..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={exportToPDF}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
            </div>
          </div>
        </div>

        {/* Timeline */}
        {filteredEvents.length > 0 ? (
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-300" />

            {/* Events */}
            <div className="space-y-6">
              {filteredEvents.map((event) => {
                const isExpanded = expandedEvents.has(event.id);
                
                return (
                  <div key={event.id} className="relative pl-20">
                    {/* Timeline Icon */}
                    <div className="absolute left-4 top-4 w-8 h-8 bg-white rounded-full border-4 border-gray-300 flex items-center justify-center">
                      {getEventIcon(event.type)}
                    </div>

                    {/* Event Card */}
                    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
                      <div
                        className="p-6 cursor-pointer"
                        onClick={() => toggleEventExpansion(event.id)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
                              {event.severity && getSeverityBadge(event.severity)}
                            </div>
                            <p className="text-gray-600 text-sm mb-2">{event.description}</p>
                            <div className="flex items-center text-sm text-gray-500">
                              <Clock className="w-4 h-4 mr-1" />
                              {event.date.toLocaleDateString('en-IN', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </div>
                          </div>
                          <button className="text-gray-400 hover:text-gray-600">
                            {isExpanded ? (
                              <ChevronUp className="w-6 h-6" />
                            ) : (
                              <ChevronDown className="w-6 h-6" />
                            )}
                          </button>
                        </div>

                        {/* Expanded Details */}
                        {isExpanded && (
                          <div className="border-t pt-4 mt-4">
                            {renderEventDetails(event)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No History Found</h3>
            <p className="text-gray-600">
              {searchQuery
                ? 'No records match your search criteria.'
                : 'No medical history available for this patient.'}
            </p>
          </div>
        )}
      </div>

      {/* Image Lightbox */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl w-full">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 text-white hover:text-gray-300"
            >
              <X className="w-8 h-8" />
            </button>
            <img
              src={selectedImage}
              alt="Medical Image"
              className="w-full h-auto rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
}
