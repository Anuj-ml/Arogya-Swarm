import Hero from './Hero';
import Features from './Features';
import Architecture from './Architecture';
import Footer from './Footer';

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <Hero />
      <Features />
      <Architecture />
      <Footer />
    </div>
  );
}
