/**
 * AI-Powered Symptom Checker Component
 * Uses voice input and AI agent for diagnosis triage
 */
import { useState } from 'react';
import { Stethoscope, Mic, MicOff, AlertCircle, CheckCircle, Send } from 'lucide-react';
import { useSpeechRecognition } from '../../../hooks/useSpeechRecognition';
import { useTextToSpeech } from '../../../hooks/useTextToSpeech';
import { addDiagnosis } from '../../../db/database';
import apiClient from '../../../services/apiClient';

interface SymptomData {
  symptoms: string[];
  duration: string;
  severity: string;
}

interface DiagnosisResult {
  risk_score: number;
  severity: string;
  urgent: boolean;
  triage_category: string;
  recommendations: string[];
  red_flags: string[];
  ai_summary: string;
}

interface SymptomCheckerProps {
  patientId?: number;
  onComplete?: (result: DiagnosisResult) => void;
}

export default function SymptomChecker({ patientId, onComplete }: SymptomCheckerProps) {
  const [symptomData, setSymptomData] = useState<SymptomData>({
    symptoms: [],
    duration: '',
    severity: 'medium'
  });
  const [currentSymptom, setCurrentSymptom] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<DiagnosisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { speak, isSpeaking } = useTextToSpeech({ lang: 'hi-IN' });
  
  const {
    transcript,
    isListening,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition({
    lang: 'hi-IN',
    continuous: true,
    onResult: (text) => {
      setCurrentSymptom(prev => prev + ' ' + text);
    }
  });

  const handleVoiceInput = () => {
    if (isListening) {
      stopListening();
      if (currentSymptom.trim()) {
        addSymptom(currentSymptom.trim());
        setCurrentSymptom('');
        resetTranscript();
      }
    } else {
      resetTranscript();
      setCurrentSymptom('');
      speak('कृपया लक्षण बताएं');
      setTimeout(() => {
        startListening();
      }, 1500);
    }
  };

  const addSymptom = (symptom: string) => {
    if (symptom && !symptomData.symptoms.includes(symptom)) {
      setSymptomData(prev => ({
        ...prev,
        symptoms: [...prev.symptoms, symptom]
      }));
    }
  };

  const removeSymptom = (index: number) => {
    setSymptomData(prev => ({
      ...prev,
      symptoms: prev.symptoms.filter((_, i) => i !== index)
    }));
  };

  const handleAnalyze = async () => {
    if (symptomData.symptoms.length === 0) {
      setError('Please add at least one symptom');
      speak('कृपया कम से कम एक लक्षण जोड़ें');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      // Try online analysis first
      if (navigator.onLine) {
        const response = await apiClient.analyzeDiagnosis({
          symptoms: symptomData.symptoms,
          patient_age: 30, // TODO: Get from patient data
          patient_gender: 'male', // TODO: Get from patient data
          duration_days: parseInt(symptomData.duration) || 1
        });

        setResult(response);

        // Save to IndexedDB
        if (patientId) {
          await addDiagnosis({
            patientId,
            symptoms: symptomData.symptoms,
            severity: response.severity,
            recommendations: response.recommendations,
            aiSummary: response.ai_summary,
            syncStatus: 'synced',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
        }

        // Speak result in Hindi
        const hindiMessages: Record<string, string> = {
          low: 'कम जोखिम। घर पर आराम करें।',
          medium: 'मध्यम जोखिम। डॉक्टर से परामर्श लें।',
          high: 'उच्च जोखिम। जल्द से जल्द डॉक्टर से मिलें।',
          critical: 'गंभीर स्थिति। तुरंत अस्पताल जाएं!'
        };
        speak(hindiMessages[response.severity] || 'विश्लेषण पूर्ण');

        if (onComplete) {
          onComplete(response);
        }
      } else {
        // Offline mode: Basic triage
        const offlineResult: DiagnosisResult = {
          risk_score: 50,
          severity: 'medium',
          urgent: false,
          triage_category: 'yellow',
          recommendations: [
            'Monitor symptoms',
            'Keep patient comfortable',
            'Sync with server when online for detailed analysis'
          ],
          red_flags: [],
          ai_summary: 'Offline mode: Basic assessment only. Connect to internet for AI analysis.'
        };

        setResult(offlineResult);
        speak('ऑफ़लाइन मोड। ऑनलाइन होने पर पूर्ण विश्लेषण उपलब्ध होगा।');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Analysis failed';
      setError(errorMessage);
      speak('विश्लेषण में त्रुटि हुई');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    const colors: Record<string, string> = {
      low: 'bg-green-100 text-green-800 border-green-300',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      high: 'bg-orange-100 text-orange-800 border-orange-300',
      critical: 'bg-red-100 text-red-800 border-red-300'
    };
    return colors[severity] || colors.medium;
  };

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center space-x-3 mb-6">
        <Stethoscope className="w-8 h-8 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-900">
          Symptom Checker / लक्षण जांच
        </h2>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Voice Input Section */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Add Symptoms / लक्षण जोड़ें
        </label>
        
        <div className="flex space-x-2">
          <input
            type="text"
            value={currentSymptom || transcript}
            onChange={(e) => setCurrentSymptom(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && currentSymptom.trim()) {
                addSymptom(currentSymptom.trim());
                setCurrentSymptom('');
              }
            }}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Type or speak symptoms..."
          />
          
          {isSupported && (
            <button
              onClick={handleVoiceInput}
              className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
                isListening
                  ? 'bg-red-500 text-white'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isListening ? (
                <>
                  <MicOff className="w-5 h-5" />
                  <span>Stop</span>
                </>
              ) : (
                <>
                  <Mic className="w-5 h-5" />
                  <span>Voice</span>
                </>
              )}
            </button>
          )}
          
          <button
            onClick={() => {
              if (currentSymptom.trim()) {
                addSymptom(currentSymptom.trim());
                setCurrentSymptom('');
              }
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>

        {isListening && (
          <p className="mt-2 text-sm text-blue-600 animate-pulse">
            🎤 Listening... Speak now
          </p>
        )}
      </div>

      {/* Symptoms List */}
      {symptomData.symptoms.length > 0 && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Current Symptoms ({symptomData.symptoms.length})
          </label>
          <div className="flex flex-wrap gap-2">
            {symptomData.symptoms.map((symptom, index) => (
              <div
                key={index}
                className="flex items-center space-x-2 bg-blue-50 px-3 py-2 rounded-lg border border-blue-200"
              >
                <span className="text-sm text-blue-900">{symptom}</span>
                <button
                  onClick={() => removeSymptom(index)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Duration */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Duration (days) / अवधि (दिन)
        </label>
        <input
          type="number"
          value={symptomData.duration}
          onChange={(e) => setSymptomData({ ...symptomData, duration: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="How many days?"
          min="0"
        />
      </div>

      {/* Analyze Button */}
      <button
        onClick={handleAnalyze}
        disabled={isAnalyzing || symptomData.symptoms.length === 0}
        className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2 mb-6"
      >
        {isAnalyzing ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            <span>Analyzing... / विश्लेषण जारी...</span>
          </>
        ) : (
          <>
            <Stethoscope className="w-5 h-5" />
            <span>Analyze Symptoms / लक्षणों का विश्लेषण करें</span>
          </>
        )}
      </button>

      {/* Results */}
      {result && (
        <div className="space-y-4">
          <div className={`p-6 rounded-lg border-2 ${getSeverityColor(result.severity)}`}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold mb-1">
                  Assessment Result / मूल्यांकन परिणाम
                </h3>
                <p className="text-sm opacity-80">Severity: {result.severity.toUpperCase()}</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">{result.risk_score}%</div>
                <div className="text-sm">Risk Score</div>
              </div>
            </div>

            {result.urgent && (
              <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded">
                <p className="text-sm font-semibold text-red-900">
                  ⚠️ URGENT: Immediate medical attention required!
                </p>
              </div>
            )}

            <div className="mb-4">
              <h4 className="font-semibold mb-2">AI Summary:</h4>
              <p className="text-sm">{result.ai_summary}</p>
            </div>

            {result.recommendations.length > 0 && (
              <div className="mb-4">
                <h4 className="font-semibold mb-2 flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Recommendations:
                </h4>
                <ul className="list-disc list-inside space-y-1">
                  {result.recommendations.map((rec, index) => (
                    <li key={index} className="text-sm">{rec}</li>
                  ))}
                </ul>
              </div>
            )}

            {result.red_flags.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2 flex items-center text-red-800">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Warning Signs:
                </h4>
                <ul className="list-disc list-inside space-y-1">
                  {result.red_flags.map((flag, index) => (
                    <li key={index} className="text-sm text-red-800">{flag}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="flex space-x-4">
            <button
              onClick={() => {
                setResult(null);
                setSymptomData({ symptoms: [], duration: '', severity: 'medium' });
                setCurrentSymptom('');
              }}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              New Assessment / नया मूल्यांकन
            </button>
            
            {result.urgent && (
              <button
                onClick={() => speak('तुरंत अस्पताल जाएं! यह गंभीर स्थिति है!')}
                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                🔊 Speak Alert / अलर्ट बोलें
              </button>
            )}
          </div>
        </div>
      )}

      {/* Offline Indicator */}
      {!navigator.onLine && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            📱 Working offline. Basic assessment only. Connect for AI analysis.
          </p>
        </div>
      )}
    </div>
  );
}
