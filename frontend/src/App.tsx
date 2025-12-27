import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './components/landing/Landing';
import AshaHome from './components/asha/AshaHome';
import DoctorDashboard from './components/doctor/DoctorDashboard';
import AdminHome from './components/admin/AdminHome';
import VoicePatientRegistration from './components/asha/forms/VoicePatientRegistration';
import SymptomChecker from './components/asha/forms/SymptomChecker';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/asha" element={<AshaHome />} />
        <Route path="/asha/register" element={<VoicePatientRegistration />} />
        <Route path="/asha/symptoms" element={<SymptomChecker />} />
        <Route path="/doctor" element={<DoctorDashboard />} />
        <Route path="/admin" element={<AdminHome />} />
      </Routes>
    </Router>
  );
}

export default App;
