import { BrowserRouter as Router, Routes, Route, useParams, useNavigate } from 'react-router-dom';
import Landing from './components/landing/Landing';
import AshaHome from './components/asha/AshaHome';
import DoctorDashboard from './components/doctor/DoctorDashboard';
import AdminHome from './components/admin/AdminHome';
import VoicePatientRegistration from './components/asha/forms/VoicePatientRegistration';
import SymptomChecker from './components/asha/forms/SymptomChecker';
import CameraCapture from './components/asha/CameraCapture';
import VideoCall from './components/doctor/VideoCall';
import PrescriptionWriter from './components/doctor/PrescriptionWriter';
import PatientHistory from './components/doctor/PatientHistory';

// Wrapper components to extract route params
function CameraCaptureWrapper() {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  
  return (
    <CameraCapture 
      patientId={parseInt(patientId || '0')} 
      onCancel={() => navigate('/asha')}
    />
  );
}

function VideoCallWrapper() {
  const { bookingId } = useParams<{ bookingId: string }>();
  
  return <VideoCall bookingId={parseInt(bookingId || '0')} />;
}

function PrescriptionWriterWrapper() {
  const { patientId } = useParams<{ patientId: string }>();
  
  return <PrescriptionWriter patientId={parseInt(patientId || '0')} />;
}

function PatientHistoryWrapper() {
  const { patientId } = useParams<{ patientId: string }>();
  
  return <PatientHistory patientId={parseInt(patientId || '0')} />;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/asha" element={<AshaHome />} />
        <Route path="/asha/register" element={<VoicePatientRegistration />} />
        <Route path="/asha/symptoms" element={<SymptomChecker />} />
        <Route path="/asha/camera/:patientId" element={<CameraCaptureWrapper />} />
        <Route path="/doctor" element={<DoctorDashboard />} />
        <Route path="/doctor/video/:bookingId" element={<VideoCallWrapper />} />
        <Route path="/doctor/prescribe/:patientId" element={<PrescriptionWriterWrapper />} />
        <Route path="/doctor/history/:patientId" element={<PatientHistoryWrapper />} />
        <Route path="/admin" element={<AdminHome />} />
      </Routes>
    </Router>
  );
}

export default App;
