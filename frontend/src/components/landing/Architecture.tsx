import { Cloud, Database, Zap, Lock } from 'lucide-react';

export default function Architecture() {
  return (
    <section id="architecture" className="py-20 bg-gray-50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            System Architecture
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Built on modern, scalable technology stack
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          {/* Architecture Diagram */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-gray-100">
            <div className="grid md:grid-cols-3 gap-8">
              {/* Frontend */}
              <div className="space-y-4">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Cloud className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Frontend</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="font-semibold text-blue-900">React 18</div>
                    <div className="text-blue-600">UI Framework</div>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="font-semibold text-blue-900">TypeScript</div>
                    <div className="text-blue-600">Type Safety</div>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="font-semibold text-blue-900">Vite 5</div>
                    <div className="text-blue-600">Build Tool</div>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="font-semibold text-blue-900">Tailwind CSS</div>
                    <div className="text-blue-600">Styling</div>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="font-semibold text-blue-900">PWA</div>
                    <div className="text-blue-600">Offline Support</div>
                  </div>
                </div>
              </div>

              {/* Backend */}
              <div className="space-y-4">
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Zap className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Backend</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="p-3 bg-green-50 rounded-lg">
                    <div className="font-semibold text-green-900">FastAPI</div>
                    <div className="text-green-600">API Framework</div>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <div className="font-semibold text-green-900">Python 3.11+</div>
                    <div className="text-green-600">Runtime</div>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <div className="font-semibold text-green-900">LangGraph</div>
                    <div className="text-green-600">Agent Orchestration</div>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <div className="font-semibold text-green-900">Prophet</div>
                    <div className="text-green-600">Time Series</div>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <div className="font-semibold text-green-900">TensorFlow Lite</div>
                    <div className="text-green-600">ML Models</div>
                  </div>
                </div>
              </div>

              {/* Data & AI */}
              <div className="space-y-4">
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Database className="w-8 h-8 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Data & AI</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <div className="font-semibold text-purple-900">PostgreSQL</div>
                    <div className="text-purple-600">Database</div>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <div className="font-semibold text-purple-900">Gemini 2.0</div>
                    <div className="text-purple-600">AI Reasoning</div>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <div className="font-semibold text-purple-900">Cloudinary</div>
                    <div className="text-purple-600">Image Storage</div>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <div className="font-semibold text-purple-900">Docker</div>
                    <div className="text-purple-600">Containerization</div>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <div className="font-semibold text-purple-900">IndexedDB</div>
                    <div className="text-purple-600">Offline Storage</div>
                  </div>
                </div>
              </div>
            </div>

            {/* APIs */}
            <div className="mt-8 pt-8 border-t-2 border-gray-100">
              <div className="flex items-center justify-center mb-4">
                <Lock className="w-6 h-6 text-gray-600 mr-2" />
                <h4 className="text-lg font-bold text-gray-900">External APIs (All Free Tier)</h4>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-center">
                <div className="p-3 bg-gray-50 rounded-lg">OpenWeatherMap</div>
                <div className="p-3 bg-gray-50 rounded-lg">SAFAR AQI</div>
                <div className="p-3 bg-gray-50 rounded-lg">USDA FoodData</div>
                <div className="p-3 bg-gray-50 rounded-lg">Edamam Recipe</div>
                <div className="p-3 bg-gray-50 rounded-lg">MyMemory Translate</div>
                <div className="p-3 bg-gray-50 rounded-lg">Jitsi Meet</div>
                <div className="p-3 bg-gray-50 rounded-lg">Razorpay</div>
                <div className="p-3 bg-gray-50 rounded-lg">MSG91/Twilio</div>
              </div>
            </div>
          </div>

          {/* Key Principles */}
          <div className="mt-8 grid md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl border-2 border-primary-100">
              <h4 className="text-lg font-bold text-gray-900 mb-2">⭐ Holistic Ecosystem</h4>
              <p className="text-gray-600">End-to-end solution covering prediction, diagnosis, nutrition, and logistics</p>
            </div>
            <div className="bg-white p-6 rounded-xl border-2 border-primary-100">
              <h4 className="text-lg font-bold text-gray-900 mb-2">🌾 Context-Aware</h4>
              <p className="text-gray-600">Built specifically for rural Indian healthcare challenges and constraints</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
