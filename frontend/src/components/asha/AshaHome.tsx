import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Home, User, Stethoscope, Camera, Wifi, WifiOff, Mic, Volume2 } from 'lucide-react';

export default function AshaHome() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    // Listen for online/offline events
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Cleanup listeners
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <Home className="w-6 h-6 text-primary-600" />
              <h1 className="text-xl font-bold text-gray-900">ASHA Worker Portal</h1>
            </Link>
            <div className="flex items-center space-x-4">
              {/* Online/Offline Status */}
              <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${
                isOnline ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {isOnline ? (
                  <>
                    <Wifi className="w-4 h-4" />
                    <span className="text-sm font-medium">Online</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-4 h-4" />
                    <span className="text-sm font-medium">Offline</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Welcome Message */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              नमस्ते ASHA Worker 👋
            </h2>
            <p className="text-gray-600">
              Welcome to your digital health assistant. Choose an action below to get started.
            </p>
          </div>

          {/* Quick Actions Grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Register New Patient */}
            <button className="bg-white hover:bg-primary-50 transition-colors rounded-xl shadow-md p-6 text-left group">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <User className="w-6 h-6 text-primary-600" />
                </div>
                <Mic className="w-5 h-5 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Register New Patient
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                Use voice or text to add a new patient to the system
              </p>
              <div className="flex items-center space-x-2 text-xs text-primary-600">
                <Volume2 className="w-4 h-4" />
                <span>Voice enabled</span>
              </div>
            </button>

            {/* Symptom Checker */}
            <button className="bg-white hover:bg-primary-50 transition-colors rounded-xl shadow-md p-6 text-left group">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Stethoscope className="w-6 h-6 text-blue-600" />
                </div>
                <Mic className="w-5 h-5 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Check Symptoms
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                AI-guided triage and risk assessment for patients
              </p>
              <div className="flex items-center space-x-2 text-xs text-blue-600">
                <Volume2 className="w-4 h-4" />
                <span>AI Assistant</span>
              </div>
            </button>

            {/* Capture Medical Image */}
            <button className="bg-white hover:bg-primary-50 transition-colors rounded-xl shadow-md p-6 text-left group">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Camera className="w-6 h-6 text-purple-600" />
                </div>
                <span className="text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded">New</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Capture Medical Image
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                Take photos of wounds, rashes, or conditions for doctor review
              </p>
              <div className="flex items-center space-x-2 text-xs text-purple-600">
                <span>AI Analysis</span>
              </div>
            </button>

            {/* Patient History */}
            <button className="bg-white hover:bg-primary-50 transition-colors rounded-xl shadow-md p-6 text-left group">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <User className="w-6 h-6 text-orange-600" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                View Patient History
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                Access previous visits and medical records
              </p>
              <div className="flex items-center space-x-2 text-xs text-orange-600">
                <span>Offline available</span>
              </div>
            </button>
          </div>

          {/* Alerts Section */}
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-xl p-6">
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-xl">⚠️</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Surge Alert</h4>
                <p className="text-sm text-gray-700 mb-2">
                  High likelihood of respiratory illness surge in next 24-48 hours due to weather conditions.
                </p>
                <p className="text-xs text-gray-600">
                  Recommended: Stock check on cold/flu medicines and masks
                </p>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="mt-6 grid grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4 text-center shadow-sm">
              <div className="text-2xl font-bold text-primary-600">12</div>
              <div className="text-sm text-gray-600">Patients Today</div>
            </div>
            <div className="bg-white rounded-lg p-4 text-center shadow-sm">
              <div className="text-2xl font-bold text-blue-600">3</div>
              <div className="text-sm text-gray-600">High Priority</div>
            </div>
            <div className="bg-white rounded-lg p-4 text-center shadow-sm">
              <div className="text-2xl font-bold text-green-600">95%</div>
              <div className="text-sm text-gray-600">Sync Status</div>
            </div>
          </div>

          {/* Help Text */}
          <div className="mt-6 text-center text-sm text-gray-500">
            <p>🎤 Tap the microphone icon to use voice commands in your preferred language</p>
            <p className="mt-1">📱 This app works offline - your data will sync when you're online</p>
          </div>
        </div>
      </main>
    </div>
  );
}
