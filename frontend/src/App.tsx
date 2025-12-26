import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './components/landing/Landing';
import AshaHome from './components/asha/AshaHome';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/asha" element={<AshaHome />} />
        <Route path="/doctor" element={<div className="p-8"><h1 className="text-2xl font-bold">Doctor Dashboard - Coming Soon</h1></div>} />
        <Route path="/admin" element={<div className="p-8"><h1 className="text-2xl font-bold">Admin Interface - Coming Soon</h1></div>} />
      </Routes>
    </Router>
  );
}

export default App;
