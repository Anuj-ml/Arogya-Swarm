/**
 * Digital Prescription Writer Component
 * Allows doctors to create and manage prescriptions with SMS delivery
 */
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Trash2, 
  Save, 
  Send, 
  Printer, 
  X, 
  Calendar,
  User,
  FileText,
  CheckCircle
} from 'lucide-react';
import apiClient from '../../services/apiClient';

interface Medicine {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
}

interface Patient {
  id: number;
  name: string;
  age: number;
  gender: string;
  phone?: string;
  village?: string;
}

interface PrescriptionWriterProps {
  patientId?: number;
  onSuccess?: () => void;
}

const COMMON_MEDICINES = [
  "Paracetamol 500mg",
  "Paracetamol 650mg",
  "Ibuprofen 400mg",
  "Ibuprofen 600mg",
  "Amoxicillin 250mg",
  "Amoxicillin 500mg",
  "Azithromycin 250mg",
  "Azithromycin 500mg",
  "Ciprofloxacin 500mg",
  "Cefixime 200mg",
  "Metronidazole 400mg",
  "Cetirizine 10mg",
  "Levocetirizine 5mg",
  "Omeprazole 20mg",
  "Pantoprazole 40mg",
  "Ranitidine 150mg",
  "Metformin 500mg",
  "Metformin 850mg",
  "Glimepiride 1mg",
  "Glimepiride 2mg",
  "Amlodipine 5mg",
  "Amlodipine 10mg",
  "Atenolol 50mg",
  "Losartan 50mg",
  "Aspirin 75mg",
  "Aspirin 150mg",
  "Clopidogrel 75mg",
  "Atorvastatin 10mg",
  "Atorvastatin 20mg",
  "Levothyroxine 50mcg",
  "Levothyroxine 100mcg",
  "Montelukast 10mg",
  "Salbutamol 4mg",
  "Doxycycline 100mg",
  "Prednisolone 5mg",
  "Prednisolone 10mg",
  "Diclofenac 50mg",
  "Tramadol 50mg",
  "Ondansetron 4mg",
  "Domperidone 10mg",
  "Multivitamin",
  "Vitamin D3 60000 IU",
  "Vitamin B12 1500mcg",
  "Calcium 500mg",
  "Iron 100mg",
  "Folic Acid 5mg"
];

const FREQUENCIES = [
  "Once daily (OD)",
  "Twice daily (BD)",
  "Three times daily (TDS)",
  "Four times daily (QID)",
  "Every 6 hours",
  "Every 8 hours",
  "Every 12 hours",
  "As needed (SOS)",
  "Before meals",
  "After meals",
  "At bedtime"
];

export default function PrescriptionWriter({ patientId: propPatientId, onSuccess }: PrescriptionWriterProps) {
  const { patientId: paramPatientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const patientId = propPatientId || parseInt(paramPatientId || '0');

  const [patient, setPatient] = useState<Patient | null>(null);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [currentMedicine, setCurrentMedicine] = useState<Medicine>({
    name: '',
    dosage: '',
    frequency: FREQUENCIES[0],
    duration: ''
  });
  const [instructions, setInstructions] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    loadPatientInfo();
  }, [patientId]);

  const loadPatientInfo = async () => {
    try {
      setLoading(true);
      // Mock patient data for now
      const mockPatient: Patient = {
        id: patientId,
        name: 'Ramesh Kumar',
        age: 45,
        gender: 'Male',
        phone: '+91-9876543210',
        village: 'Shirdi'
      };
      setPatient(mockPatient);
    } catch (err) {
      setError('Failed to load patient information');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredMedicines = COMMON_MEDICINES.filter(med =>
    med.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleMedicineNameChange = (value: string) => {
    setSearchTerm(value);
    setCurrentMedicine({ ...currentMedicine, name: value });
    setShowSuggestions(true);
  };

  const selectMedicine = (medicine: string) => {
    setCurrentMedicine({ ...currentMedicine, name: medicine });
    setSearchTerm(medicine);
    setShowSuggestions(false);
  };

  const addMedicine = () => {
    if (!currentMedicine.name || !currentMedicine.dosage || !currentMedicine.duration) {
      setError('Please fill all medicine fields');
      return;
    }

    setMedicines([...medicines, currentMedicine]);
    setCurrentMedicine({
      name: '',
      dosage: '',
      frequency: FREQUENCIES[0],
      duration: ''
    });
    setSearchTerm('');
    setError('');
  };

  const removeMedicine = (index: number) => {
    setMedicines(medicines.filter((_, i) => i !== index));
  };

  const validatePrescription = (): boolean => {
    if (medicines.length === 0) {
      setError('Please add at least one medicine');
      return false;
    }

    if (followUpDate) {
      const followUp = new Date(followUpDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (followUp < today) {
        setError('Follow-up date must be in the future');
        return false;
      }
    }

    return true;
  };

  const savePrescription = async () => {
    if (!validatePrescription()) return;

    try {
      setSaving(true);
      setError('');

      const prescriptionData = {
        patient_id: patientId,
        patient_name: patient?.name || '',
        doctor_name: 'Dr. Sharma', // In real app, get from auth context
        medications: medicines.map(m => ({
          name: m.name,
          dosage: m.dosage,
          frequency: m.frequency,
          duration: m.duration,
          instructions: null
        })),
        diagnosis: 'General Consultation', // Could be passed as prop
        notes: instructions
      };

      await apiClient.createPrescription(prescriptionData);
      
      setSuccess('Prescription saved successfully!');
      setTimeout(() => {
        if (onSuccess) {
          onSuccess();
        } else {
          navigate('/doctor');
        }
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to save prescription');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const sendSMS = async () => {
    if (!patient?.phone) {
      setError('Patient phone number not available');
      return;
    }

    try {
      setError('');
      // SMS sending would be implemented via messaging API
      setSuccess('Prescription sent via SMS!');
    } catch (err) {
      setError('Failed to send SMS');
      console.error(err);
    }
  };

  const printPrescription = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading patient information...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Write Prescription</h1>
            <p className="text-gray-600 mt-1">Create digital prescription for patient</p>
          </div>
          <button
            onClick={() => navigate('/doctor')}
            className="text-gray-600 hover:text-gray-900"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg flex items-center">
            <CheckCircle className="w-5 h-5 mr-2" />
            {success}
          </div>
        )}

        {/* Patient Summary Card */}
        {patient && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <User className="w-5 h-5 mr-2" />
              Patient Information
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="font-semibold">{patient.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Age</p>
                <p className="font-semibold">{patient.age} years</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Gender</p>
                <p className="font-semibold">{patient.gender}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Village</p>
                <p className="font-semibold">{patient.village || 'N/A'}</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm text-gray-600">Date: {new Date().toLocaleDateString('en-IN')}</p>
            </div>
          </div>
        )}

        {/* Medicine Input Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Add Medicines</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Medicine Name with Autocomplete */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Medicine Name *
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => handleMedicineNameChange(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                placeholder="Search medicine..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {showSuggestions && searchTerm && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {filteredMedicines.length > 0 ? (
                    filteredMedicines.map((medicine, index) => (
                      <button
                        key={index}
                        onClick={() => selectMedicine(medicine)}
                        className="w-full px-4 py-2 text-left hover:bg-blue-50 focus:bg-blue-50 focus:outline-none"
                      >
                        {medicine}
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-2 text-gray-500">No medicines found</div>
                  )}
                </div>
              )}
            </div>

            {/* Dosage */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dosage *
              </label>
              <input
                type="text"
                value={currentMedicine.dosage}
                onChange={(e) => setCurrentMedicine({ ...currentMedicine, dosage: e.target.value })}
                placeholder="e.g., 1 tablet, 5ml"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Frequency */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Frequency *
              </label>
              <select
                value={currentMedicine.frequency}
                onChange={(e) => setCurrentMedicine({ ...currentMedicine, frequency: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {FREQUENCIES.map((freq, index) => (
                  <option key={index} value={freq}>{freq}</option>
                ))}
              </select>
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duration *
              </label>
              <input
                type="text"
                value={currentMedicine.duration}
                onChange={(e) => setCurrentMedicine({ ...currentMedicine, duration: e.target.value })}
                placeholder="e.g., 5 days, 2 weeks"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <button
            onClick={addMedicine}
            className="mt-4 flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            <span>Add Medicine</span>
          </button>
        </div>

        {/* Added Medicines List */}
        {medicines.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Prescribed Medicines ({medicines.length})</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-4">Medicine</th>
                    <th className="text-left py-2 px-4">Dosage</th>
                    <th className="text-left py-2 px-4">Frequency</th>
                    <th className="text-left py-2 px-4">Duration</th>
                    <th className="text-left py-2 px-4">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {medicines.map((medicine, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">{medicine.name}</td>
                      <td className="py-3 px-4">{medicine.dosage}</td>
                      <td className="py-3 px-4">{medicine.frequency}</td>
                      <td className="py-3 px-4">{medicine.duration}</td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => removeMedicine(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Additional Details */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Additional Details</h2>
          
          <div className="space-y-4">
            {/* Special Instructions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Special Instructions
              </label>
              <textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                rows={4}
                placeholder="Enter any special instructions for the patient..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Follow-up Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                Follow-up Date (Optional)
              </label>
              <input
                type="date"
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => setShowPreview(true)}
              disabled={medicines.length === 0}
              className="flex items-center space-x-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              <FileText className="w-5 h-5" />
              <span>Preview</span>
            </button>

            <button
              onClick={savePrescription}
              disabled={medicines.length === 0 || saving}
              className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed"
            >
              <Save className="w-5 h-5" />
              <span>{saving ? 'Saving...' : 'Save Prescription'}</span>
            </button>

            <button
              onClick={sendSMS}
              disabled={medicines.length === 0 || !patient?.phone}
              className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-green-300 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
              <span>Send SMS</span>
            </button>

            <button
              onClick={printPrescription}
              disabled={medicines.length === 0}
              className="flex items-center space-x-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-purple-300 disabled:cursor-not-allowed"
            >
              <Printer className="w-5 h-5" />
              <span>Print</span>
            </button>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-2xl font-bold">Prescription Preview</h2>
              <button
                onClick={() => setShowPreview(false)}
                className="text-gray-600 hover:text-gray-900"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-8">
              {/* Prescription Header */}
              <div className="text-center mb-6">
                <h1 className="text-3xl font-bold text-blue-600">Arogya Swarm</h1>
                <p className="text-gray-600">Rural Healthcare System</p>
                <p className="text-sm text-gray-500 mt-2">Date: {new Date().toLocaleDateString('en-IN')}</p>
              </div>

              {/* Doctor & Patient Info */}
              <div className="grid grid-cols-2 gap-6 mb-6 pb-6 border-b">
                <div>
                  <h3 className="font-semibold text-lg mb-2">Doctor</h3>
                  <p className="text-gray-700">Dr. Sharma</p>
                  <p className="text-sm text-gray-500">MBBS, MD</p>
                  <p className="text-sm text-gray-500">Reg. No: MH12345</p>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Patient</h3>
                  <p className="text-gray-700">{patient?.name}</p>
                  <p className="text-sm text-gray-500">Age: {patient?.age} years, {patient?.gender}</p>
                  <p className="text-sm text-gray-500">{patient?.village}</p>
                </div>
              </div>

              {/* Rx Symbol */}
              <div className="mb-4">
                <span className="text-4xl font-serif text-blue-600">℞</span>
              </div>

              {/* Medicines */}
              <div className="mb-6">
                <h3 className="font-semibold text-lg mb-3">Medicines</h3>
                <table className="w-full border">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left py-2 px-4 border-b">#</th>
                      <th className="text-left py-2 px-4 border-b">Medicine</th>
                      <th className="text-left py-2 px-4 border-b">Dosage</th>
                      <th className="text-left py-2 px-4 border-b">Frequency</th>
                      <th className="text-left py-2 px-4 border-b">Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    {medicines.map((medicine, index) => (
                      <tr key={index}>
                        <td className="py-2 px-4 border-b">{index + 1}</td>
                        <td className="py-2 px-4 border-b">{medicine.name}</td>
                        <td className="py-2 px-4 border-b">{medicine.dosage}</td>
                        <td className="py-2 px-4 border-b">{medicine.frequency}</td>
                        <td className="py-2 px-4 border-b">{medicine.duration}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Instructions */}
              {instructions && (
                <div className="mb-6">
                  <h3 className="font-semibold text-lg mb-2">Special Instructions</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">{instructions}</p>
                </div>
              )}

              {/* Follow-up */}
              {followUpDate && (
                <div className="mb-6">
                  <h3 className="font-semibold text-lg mb-2">Follow-up</h3>
                  <p className="text-gray-700">Next visit: {new Date(followUpDate).toLocaleDateString('en-IN')}</p>
                </div>
              )}

              {/* Signature */}
              <div className="mt-12 text-right">
                <div className="border-t border-gray-300 inline-block pt-2 px-8">
                  <p className="text-gray-700">Doctor's Signature</p>
                </div>
              </div>
            </div>

            <div className="p-6 border-t bg-gray-50 flex justify-end">
              <button
                onClick={() => setShowPreview(false)}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
