/**
 * Voice-enabled Patient Registration Form
 * Uses Web Speech API for voice input in multiple languages
 */
import { useState } from 'react';
import { User, Mic, MicOff, Save, AlertCircle } from 'lucide-react';
import { useSpeechRecognition } from '../../../hooks/useSpeechRecognition';
import { useTextToSpeech } from '../../../hooks/useTextToSpeech';
import { addPatient } from '../../../db/database';
import apiClient from '../../../services/apiClient';

interface PatientFormData {
  name: string;
  age: string;
  gender: string;
  phone: string;
  village: string;
}

interface VoicePatientRegistrationProps {
  onSuccess?: (patientId: number) => void;
  onCancel?: () => void;
}

export default function VoicePatientRegistration({ 
  onSuccess, 
  onCancel 
}: VoicePatientRegistrationProps) {
  const [formData, setFormData] = useState<PatientFormData>({
    name: '',
    age: '',
    gender: '',
    phone: '',
    village: ''
  });
  
  const [currentField, setCurrentField] = useState<keyof PatientFormData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const { speak } = useTextToSpeech({ lang: 'hi-IN' });
  
  const {
    transcript,
    isListening,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition({
    lang: 'hi-IN',
    onResult: (text) => {
      if (currentField) {
        setFormData(prev => ({
          ...prev,
          [currentField]: text.trim()
        }));
        stopListening();
        setCurrentField(null);
      }
    }
  });

  const handleVoiceInput = (field: keyof PatientFormData) => {
    if (!isSupported) {
      setError('Voice input is not supported in your browser');
      return;
    }

    resetTranscript();
    setCurrentField(field);
    
    // Speak instructions in Hindi
    const instructions: Record<keyof PatientFormData, string> = {
      name: 'कृपया रोगी का नाम बोलें',
      age: 'कृपया उम्र बोलें',
      gender: 'कृपया लिंग बोलें - पुरुष या महिला',
      phone: 'कृपया फोन नंबर बोलें',
      village: 'कृपया गाँव का नाम बोलें'
    };
    
    speak(instructions[field]);
    
    setTimeout(() => {
      startListening();
    }, 1500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      // Validate form data
      if (!formData.name || !formData.age || !formData.gender) {
        throw new Error('Name, age, and gender are required');
      }

      const patientData = {
        name: formData.name,
        age: parseInt(formData.age),
        gender: formData.gender,
        phone: formData.phone || undefined,
        village: formData.village,
        syncStatus: 'pending' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Save to IndexedDB first (offline-first approach)
      const localId = await addPatient(patientData);

      // Try to sync with server if online
      if (navigator.onLine) {
        try {
          const response = await apiClient.createPatient({
            name: patientData.name,
            age: patientData.age,
            gender: patientData.gender,
            phone: patientData.phone,
            village: patientData.village
          });
          
          // Update sync status
          patientData.syncStatus = 'synced';
          
          speak('रोगी पंजीकरण सफल');
        } catch (syncError) {
          console.error('Failed to sync with server:', syncError);
          speak('रोगी स्थानीय रूप से सहेजा गया। बाद में सिंक होगा।');
        }
      } else {
        speak('रोगी ऑफ़लाइन सहेजा गया। ऑनलाइन होने पर सिंक होगा।');
      }

      setSuccess(true);
      
      if (onSuccess) {
        onSuccess(localId);
      }

      // Reset form
      setTimeout(() => {
        setFormData({
          name: '',
          age: '',
          gender: '',
          phone: '',
          village: ''
        });
        setSuccess(false);
      }, 2000);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to register patient';
      setError(errorMessage);
      speak('पंजीकरण में त्रुटि हुई');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center space-x-3 mb-6">
        <User className="w-8 h-8 text-primary-600" />
        <h2 className="text-2xl font-bold text-gray-900">
          Patient Registration / रोगी पंजीकरण
        </h2>
      </div>

      {!isSupported && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            Voice input is not supported in your browser. Please use text input.
          </p>
        </div>
      )}

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800 font-medium">
            ✓ Patient registered successfully! / रोगी सफलतापूर्वक पंजीकृत!
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Name / नाम *
          </label>
          <div className="flex space-x-2">
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Patient name"
              required
            />
            {isSupported && (
              <button
                type="button"
                onClick={() => handleVoiceInput('name')}
                className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
                  isListening && currentField === 'name'
                    ? 'bg-red-500 text-white'
                    : 'bg-primary-600 text-white hover:bg-primary-700'
                }`}
                disabled={isListening && currentField !== 'name'}
              >
                {isListening && currentField === 'name' ? (
                  <MicOff className="w-5 h-5" />
                ) : (
                  <Mic className="w-5 h-5" />
                )}
              </button>
            )}
          </div>
          {isListening && currentField === 'name' && (
            <p className="mt-1 text-sm text-gray-600">Listening: {transcript}</p>
          )}
        </div>

        {/* Age Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Age / उम्र *
          </label>
          <div className="flex space-x-2">
            <input
              type="number"
              value={formData.age}
              onChange={(e) => setFormData({ ...formData, age: e.target.value })}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Age in years"
              min="0"
              max="120"
              required
            />
            {isSupported && (
              <button
                type="button"
                onClick={() => handleVoiceInput('age')}
                className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
                  isListening && currentField === 'age'
                    ? 'bg-red-500 text-white'
                    : 'bg-primary-600 text-white hover:bg-primary-700'
                }`}
                disabled={isListening && currentField !== 'age'}
              >
                {isListening && currentField === 'age' ? (
                  <MicOff className="w-5 h-5" />
                ) : (
                  <Mic className="w-5 h-5" />
                )}
              </button>
            )}
          </div>
        </div>

        {/* Gender Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Gender / लिंग *
          </label>
          <div className="flex space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                value="male"
                checked={formData.gender === 'male'}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="text-primary-600 focus:ring-primary-500"
                required
              />
              <span>Male / पुरुष</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                value="female"
                checked={formData.gender === 'female'}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="text-primary-600 focus:ring-primary-500"
              />
              <span>Female / महिला</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                value="other"
                checked={formData.gender === 'other'}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="text-primary-600 focus:ring-primary-500"
              />
              <span>Other / अन्य</span>
            </label>
          </div>
        </div>

        {/* Phone Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone / फोन
          </label>
          <div className="flex space-x-2">
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Phone number"
            />
            {isSupported && (
              <button
                type="button"
                onClick={() => handleVoiceInput('phone')}
                className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
                  isListening && currentField === 'phone'
                    ? 'bg-red-500 text-white'
                    : 'bg-primary-600 text-white hover:bg-primary-700'
                }`}
                disabled={isListening && currentField !== 'phone'}
              >
                {isListening && currentField === 'phone' ? (
                  <MicOff className="w-5 h-5" />
                ) : (
                  <Mic className="w-5 h-5" />
                )}
              </button>
            )}
          </div>
        </div>

        {/* Village Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Village / गाँव *
          </label>
          <div className="flex space-x-2">
            <input
              type="text"
              value={formData.village}
              onChange={(e) => setFormData({ ...formData, village: e.target.value })}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Village name"
              required
            />
            {isSupported && (
              <button
                type="button"
                onClick={() => handleVoiceInput('village')}
                className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
                  isListening && currentField === 'village'
                    ? 'bg-red-500 text-white'
                    : 'bg-primary-600 text-white hover:bg-primary-700'
                }`}
                disabled={isListening && currentField !== 'village'}
              >
                {isListening && currentField === 'village' ? (
                  <MicOff className="w-5 h-5" />
                ) : (
                  <Mic className="w-5 h-5" />
                )}
              </button>
            )}
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex space-x-4 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            <Save className="w-5 h-5" />
            <span>{isSubmitting ? 'Saving...' : 'Register Patient / पंजीकृत करें'}</span>
          </button>
          
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel / रद्द करें
            </button>
          )}
        </div>
      </form>

      {/* Offline Indicator */}
      {!navigator.onLine && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            📱 Working offline. Data will sync when you're back online.
          </p>
        </div>
      )}
    </div>
  );
}
