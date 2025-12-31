/**
 * Symptom Checker Component
 * AI-powered symptom analysis and triage
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, CheckCircle2, Mic, Send } from 'lucide-react';
import apiClient from '../../services/apiClient';

interface DiagnosisResult {
  severity: string;
  risk_score: number;
  recommendations: string[];
  urgency: string;
  possible_conditions?: string[];
}

const commonSymptoms = [
  'Fever',
  'Cough',
  'Cold',
  'Headache',
  'Body ache',
  'Difficulty breathing',
  'Chest pain',
  'Stomach pain',
  'Nausea',
  'Vomiting',
  'Diarrhea',
  'Fatigue',
  'Dizziness',
  'Rash',
  'Sore throat',
];

export default function SymptomChecker() {
  const navigate = useNavigate();
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [duration, setDuration] = useState('1-2 days');
  const [severity, setSeverity] = useState('mild');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DiagnosisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms(prev =>
      prev.includes(symptom)
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    );
  };

  const handleAnalyze = async () => {
    if (selectedSymptoms.length === 0) {
      setError('Please select at least one symptom');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Structure symptoms data properly for backend
      const symptomsData = {
        symptoms: selectedSymptoms.join(', '),
        duration,
        severity,
        additional_info: additionalInfo,
      };
      
      const response = await apiClient.analyzeSymptoms(symptomsData);
      setResult(response as DiagnosisResult);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to analyze symptoms');
      console.error('Error analyzing symptoms:', err);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'critical':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'high':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default:
        return 'text-green-600 bg-green-50 border-green-200';
    }
  };

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
            <h1 className="text-xl font-bold text-gray-900">AI Symptom Checker</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {!result ? (
            <div className="bg-white rounded-xl shadow-md p-6">
              {/* Voice Notice */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-start space-x-3">
                <Mic className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-blue-900 font-medium">AI-Powered Analysis</p>
                  <p className="text-xs text-blue-700 mt-1">
                    Select symptoms and get instant AI-powered triage recommendations
                  </p>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-red-900">{error}</p>
                </div>
              )}

              {/* Symptom Selection */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Select Symptoms
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {commonSymptoms.map(symptom => (
                    <button
                      key={symptom}
                      onClick={() => toggleSymptom(symptom)}
                      className={`px-4 py-2 rounded-lg border-2 transition ${
                        selectedSymptoms.includes(symptom)
                          ? 'bg-primary-100 border-primary-500 text-primary-700 font-medium'
                          : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {symptom}
                    </button>
                  ))}
                </div>
              </div>

              {/* Duration */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  How long have these symptoms been present?
                </label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="few hours">Few hours</option>
                  <option value="1-2 days">1-2 days</option>
                  <option value="3-5 days">3-5 days</option>
                  <option value="1 week">1 week</option>
                  <option value="more than 1 week">More than 1 week</option>
                </select>
              </div>

              {/* Severity */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  How severe are the symptoms?
                </label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="mild">Mild (manageable, daily activities not affected)</option>
                  <option value="moderate">Moderate (some discomfort, affects some activities)</option>
                  <option value="severe">Severe (significant discomfort, affects daily life)</option>
                </select>
              </div>

              {/* Additional Information */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Information (Optional)
                </label>
                <textarea
                  value={additionalInfo}
                  onChange={(e) => setAdditionalInfo(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Any other symptoms or relevant information..."
                />
              </div>

              {/* Analyze Button */}
              <button
                onClick={handleAnalyze}
                disabled={loading || selectedSymptoms.length === 0}
                className="w-full px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-medium flex items-center justify-center space-x-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
                <span>{loading ? 'Analyzing...' : 'Analyze Symptoms'}</span>
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Results Card */}
              <div className={`rounded-xl shadow-md p-6 border-2 ${getSeverityColor(result.severity)}`}>
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center">
                    {result.severity === 'critical' || result.severity === 'high' ? (
                      <AlertTriangle className="w-6 h-6 text-red-600" />
                    ) : (
                      <CheckCircle2 className="w-6 h-6 text-green-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold mb-2">
                      {result.severity.toUpperCase()} Priority
                    </h2>
                    <p className="text-lg mb-4">
                      Risk Score: <span className="font-bold">{result.risk_score}/100</span>
                    </p>
                    <p className="font-medium">
                      Urgency: {result.urgency}
                    </p>
                  </div>
                </div>
              </div>

              {/* Recommendations */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Recommendations
                </h3>
                <ul className="space-y-2">
                  {result.recommendations?.map((rec, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <span className="text-primary-600 font-bold">•</span>
                      <span className="text-gray-700">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Possible Conditions */}
              {result.possible_conditions && result.possible_conditions.length > 0 && (
                <div className="bg-white rounded-xl shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Possible Conditions
                  </h3>
                  <ul className="space-y-2">
                    {result.possible_conditions.map((condition, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <span className="text-primary-600 font-bold">•</span>
                        <span className="text-gray-700">{condition}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Actions */}
              <div className="flex space-x-4">
                <button
                  onClick={() => {
                    setResult(null);
                    setSelectedSymptoms([]);
                    setAdditionalInfo('');
                  }}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                >
                  Check Again
                </button>
                <button
                  onClick={() => navigate('/asha')}
                  className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-medium"
                >
                  Back to Home
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
