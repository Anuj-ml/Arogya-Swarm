import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './components/landing/Landing';
import AshaHome from './components/asha/AshaHome';
import PatientRegistration from './components/asha/PatientRegistration';
import SymptomChecker from './components/asha/SymptomChecker';
import CameraCapture from './components/asha/CameraCapture';
import PatientList from './components/asha/PatientList';
import DoctorDashboard from './components/doctor/DoctorDashboard';
import AdminHome from './components/admin/AdminHome';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/asha" element={<AshaHome />} />
        <Route path="/asha/register" element={<PatientRegistration />} />
        <Route path="/asha/symptoms" element={<SymptomChecker />} />
        <Route path="/asha/camera" element={<CameraCapture />} />
        <Route path="/asha/patients" element={<PatientList />} />
        <Route path="/doctor" element={<DoctorDashboard />} />
        <Route path="/admin" element={<AdminHome />} />
      </Routes>
    </Router>
  );
}

export default App;
