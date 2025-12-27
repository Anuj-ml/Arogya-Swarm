import { Heart, Github, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <Heart className="w-8 h-8 text-primary-500" />
              <span className="text-2xl font-bold">Arogya-Swarm</span>
            </div>
            <p className="text-gray-400 mb-4">
              Predictive, preventive, and resilient AI system for rural healthcare.
              Bridging the gap in diagnosis, supply chain, and nutrition.
            </p>
            <div className="flex space-x-4">
              <a href="https://github.com" className="text-gray-400 hover:text-white transition-colors">
                <Github className="w-6 h-6" />
              </a>
              <a href="mailto:contact@arogya-swarm.in" className="text-gray-400 hover:text-white transition-colors">
                <Mail className="w-6 h-6" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><a href="#features" className="text-gray-400 hover:text-white transition-colors">Features</a></li>
              <li><a href="#architecture" className="text-gray-400 hover:text-white transition-colors">Architecture</a></li>
              <li><a href="/asha" className="text-gray-400 hover:text-white transition-colors">ASHA App</a></li>
              <li><a href="/doctor" className="text-gray-400 hover:text-white transition-colors">Doctor Portal</a></li>
              <li><a href="/admin" className="text-gray-400 hover:text-white transition-colors">Admin Panel</a></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Resources</h4>
            <ul className="space-y-2">
              <li><span className="text-gray-400">Documentation</span></li>
              <li><span className="text-gray-400">API Reference</span></li>
              <li><span className="text-gray-400">Privacy Policy</span></li>
              <li><span className="text-gray-400">Terms of Service</span></li>
              <li><span className="text-gray-400">Support</span></li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-gray-800 text-center text-gray-400">
          <p>&copy; 2024 Arogya-Swarm. Built with ❤️ for Rural India.</p>
          <p className="text-sm mt-2">Powered by Google Gemini 2.0 • FastAPI • React 18</p>
        </div>
      </div>
    </footer>
  );
}
