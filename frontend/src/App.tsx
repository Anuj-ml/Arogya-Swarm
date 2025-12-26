import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './components/landing/Landing';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/asha" element={<div className="p-8"><h1 className="text-2xl font-bold">ASHA Interface - Coming Soon</h1></div>} />
        <Route path="/doctor" element={<div className="p-8"><h1 className="text-2xl font-bold">Doctor Dashboard - Coming Soon</h1></div>} />
        <Route path="/admin" element={<div className="p-8"><h1 className="text-2xl font-bold">Admin Interface - Coming Soon</h1></div>} />
      </Routes>
    </Router>
  );
}

export default App;
