import { Link } from 'react-router-dom';
import { Activity, Brain, Heart } from 'lucide-react';

export default function Hero() {
  return (
    <div className="relative overflow-hidden">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Heart className="w-8 h-8 text-primary-600" />
            <span className="text-2xl font-bold text-gray-900">Arogya-Swarm</span>
          </div>
          <div className="hidden md:flex space-x-6">
            <a href="#features" className="text-gray-600 hover:text-primary-600">Features</a>
            <a href="#architecture" className="text-gray-600 hover:text-primary-600">Architecture</a>
            <Link to="/asha" className="text-gray-600 hover:text-primary-600">ASHA App</Link>
            <Link to="/doctor" className="text-gray-600 hover:text-primary-600">Doctor</Link>
            <Link to="/admin" className="text-gray-600 hover:text-primary-600">Admin</Link>
          </div>
        </div>
      </nav>

      {/* Hero Content */}
      <div className="container mx-auto px-6 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center px-4 py-2 bg-primary-100 rounded-full text-primary-700 text-sm font-medium mb-6">
              <Activity className="w-4 h-4 mr-2" />
              AI-Powered Rural Healthcare
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Complete Rural Health{' '}
              <span className="text-primary-600">Agentic Assistant</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Predictive, preventive, and resilient AI system to bridge the gap in rural healthcare 
              diagnosis, supply chain, and nutrition.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link 
                to="/asha" 
                className="px-8 py-4 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
              >
                ASHA Worker Portal
              </Link>
              <Link 
                to="/doctor" 
                className="px-8 py-4 bg-white text-primary-600 border-2 border-primary-600 rounded-lg font-medium hover:bg-primary-50 transition-colors"
              >
                Doctor Dashboard
              </Link>
            </div>
          </div>
          <div className="relative">
            <div className="bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl p-8 shadow-2xl">
              <div className="flex items-center justify-center mb-6">
                <Brain className="w-24 h-24 text-white" />
              </div>
              <div className="grid grid-cols-2 gap-4 text-white">
                <div className="bg-white/10 p-4 rounded-lg">
                  <div className="text-3xl font-bold">24-48h</div>
                  <div className="text-sm">Surge Prediction</div>
                </div>
                <div className="bg-white/10 p-4 rounded-lg">
                  <div className="text-3xl font-bold">9</div>
                  <div className="text-sm">AI Agents</div>
                </div>
                <div className="bg-white/10 p-4 rounded-lg">
                  <div className="text-3xl font-bold">6</div>
                  <div className="text-sm">Languages</div>
                </div>
                <div className="bg-white/10 p-4 rounded-lg">
                  <div className="text-3xl font-bold">100%</div>
                  <div className="text-sm">Offline Ready</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Background decoration */}
      <div className="absolute top-0 right-0 -z-10 opacity-10">
        <svg width="404" height="404" fill="none" viewBox="0 0 404 404">
          <defs>
            <pattern id="pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
              <rect x="0" y="0" width="4" height="4" fill="currentColor" className="text-primary-600" />
            </pattern>
          </defs>
          <rect width="404" height="404" fill="url(#pattern)" />
        </svg>
      </div>
    </div>
  );
}
