import { 
  Activity, 
  TrendingUp, 
  Stethoscope, 
  Package, 
  Shield, 
  Utensils, 
  Video, 
  MessageSquare, 
  Image, 
  Mic, 
  Globe, 
  Phone, 
  Pill, 
  Wifi, 
  Speaker 
} from 'lucide-react';

const features = [
  {
    icon: TrendingUp,
    title: 'Seasonal Surge Prediction',
    description: '24-48 hour forecasts using weather, AQI, festivals, and mobility data',
    color: 'text-blue-600',
    bg: 'bg-blue-100'
  },
  {
    icon: Stethoscope,
    title: 'AI-Assisted Diagnosis',
    description: 'Lightweight triage models with Gemini 2.0 for symptom analysis',
    color: 'text-red-600',
    bg: 'bg-red-100'
  },
  {
    icon: Package,
    title: 'Smart Logistics',
    description: 'Auto-reorder supplies and optimize medicine delivery routes',
    color: 'text-orange-600',
    bg: 'bg-orange-100'
  },
  {
    icon: Utensils,
    title: 'Personalized Nutrition',
    description: 'Age, gender, and region-specific meal plans with local foods',
    color: 'text-green-600',
    bg: 'bg-green-100'
  },
  {
    icon: Video,
    title: 'Telemedicine Handoff',
    description: 'Smart scheduling with AI-generated patient summaries',
    color: 'text-purple-600',
    bg: 'bg-purple-100'
  },
  {
    icon: MessageSquare,
    title: 'Multilingual Alerts',
    description: 'SMS/WhatsApp in 6 languages: Hindi, Marathi, Tamil, Telugu, Bengali, English',
    color: 'text-pink-600',
    bg: 'bg-pink-100'
  },
  {
    icon: Image,
    title: 'Image Analysis',
    description: 'Medical image triage for wounds, skin conditions, and X-rays',
    color: 'text-indigo-600',
    bg: 'bg-indigo-100'
  },
  {
    icon: Mic,
    title: 'Voice Interface',
    description: 'Speech recognition and audio instructions for ASHA workers',
    color: 'text-yellow-600',
    bg: 'bg-yellow-100'
  },
  {
    icon: Wifi,
    title: 'Offline-First',
    description: 'Full functionality without internet, auto-sync when online',
    color: 'text-teal-600',
    bg: 'bg-teal-100'
  },
  {
    icon: Shield,
    title: 'Privacy Layer',
    description: 'Federated learning and encryption for sensitive patient data',
    color: 'text-gray-600',
    bg: 'bg-gray-100'
  },
  {
    icon: Phone,
    title: 'Paid Video Calls',
    description: 'Integrated Razorpay payment for premium consultations',
    color: 'text-cyan-600',
    bg: 'bg-cyan-100'
  },
  {
    icon: Pill,
    title: 'Stock Monitoring',
    description: 'Real-time inventory alerts and automated reordering',
    color: 'text-rose-600',
    bg: 'bg-rose-100'
  },
  {
    icon: Activity,
    title: 'Real-time Analytics',
    description: 'Admin dashboard with surge warnings and performance metrics',
    color: 'text-violet-600',
    bg: 'bg-violet-100'
  },
  {
    icon: Globe,
    title: 'PWA Ready',
    description: 'Install on any device, works like a native app',
    color: 'text-emerald-600',
    bg: 'bg-emerald-100'
  },
  {
    icon: Speaker,
    title: 'Audio Guidance',
    description: 'Step-by-step audio instructions for every workflow',
    color: 'text-amber-600',
    bg: 'bg-amber-100'
  }
];

export default function Features() {
  return (
    <section id="features" className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            15 Powerful Features
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            A complete ecosystem designed specifically for rural healthcare challenges
          </p>
        </div>

        <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div 
                key={index} 
                className="group p-6 rounded-xl border-2 border-gray-100 hover:border-primary-200 hover:shadow-lg transition-all duration-300"
              >
                <div className={`w-12 h-12 ${feature.bg} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className={`w-6 h-6 ${feature.color}`} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-600">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-16 bg-primary-50 rounded-2xl p-8 border-2 border-primary-100">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-primary-600 mb-2">3 Pillars</div>
              <div className="text-gray-600">Predictive Analytics, Agentic Workflows, Diagnostic Triage</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary-600 mb-2">9 Agents</div>
              <div className="text-gray-600">Sentinel, Logistics, Triage, Privacy, Nutrition, Telemedicine, Communication, Image, ASHA</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary-600 mb-2">3 Interfaces</div>
              <div className="text-gray-600">ASHA App, Doctor Dashboard, Admin Alerts</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
