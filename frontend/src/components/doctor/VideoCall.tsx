/**
 * Video Call Interface with Jitsi Meet
 * Embedded video consultation with patient info sidebar
 */
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Video, Phone, Clock, User, AlertCircle, FileText, Loader } from 'lucide-react';
import { JitsiMeeting } from '@jitsi/react-sdk';
import apiClient from '../../services/apiClient';

interface Booking {
  booking_id: number;
  patient_id: number;
  patient_name: string;
  doctor_name: string;
  scheduled_time: string;
  meeting_link: string;
  status: string;
}

interface VideoCallProps {
  bookingId: number;
}

export default function VideoCall({ bookingId }: VideoCallProps) {
  const [booking, setBooking] = useState<Booking | null>(null);
  const [caseSummary, setCaseSummary] = useState<string>('');
  const [quickNotes, setQuickNotes] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [callDuration, setCallDuration] = useState(0);
  const [callStarted, setCallStarted] = useState(false);

  const navigate = useNavigate();
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    loadBooking();

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [bookingId]);

  useEffect(() => {
    if (callStarted && !timerRef.current) {
      timerRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [callStarted]);

  const loadBooking = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch booking details
      const response: any = await apiClient.getBookings();
      const bookings = response.bookings || [];

      // Find the specific booking
      const bookingData = bookings.find((b: Booking) => b.booking_id === bookingId);

      if (!bookingData) {
        setError('Booking not found');
        setLoading(false);
        return;
      }

      if (!bookingData.meeting_link) {
        setError('Meeting link not available. Please contact support.');
        setLoading(false);
        return;
      }

      setBooking(bookingData);

      // Load case summary
      try {
        const summaryResponse: any = await apiClient.getCaseSummary(bookingData.patient_id);
        setCaseSummary(summaryResponse.summary || 'No case summary available.');
      } catch (err) {
        console.error('Failed to load case summary:', err);
        setCaseSummary('Unable to load case summary.');
      }

      setLoading(false);
    } catch (err: any) {
      console.error('Error loading booking:', err);
      setError(err.response?.data?.detail || 'Failed to load booking details.');
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEndCall = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    // Navigate to prescription form
    if (booking) {
      navigate(`/doctor/prescribe/${booking.patient_id}`, {
        state: {
          patientName: booking.patient_name,
          notes: quickNotes,
          caseSummary,
        },
      });
    }
  };

  const extractRoomName = (meetingLink: string): string => {
    // Extract room name from Jitsi URL
    // Example: https://meet.jit.si/arogya-1-1735286400-abc123
    try {
      const url = new URL(meetingLink);
      const pathParts = url.pathname.split('/');
      return pathParts[pathParts.length - 1] || 'unknown-room';
    } catch (err) {
      return 'unknown-room';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading video call...</p>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <div className="flex items-center gap-3 text-red-600 mb-4">
            <AlertCircle className="w-8 h-8" />
            <h2 className="text-xl font-bold">Error</h2>
          </div>
          <p className="text-gray-600 mb-6">{error || 'Unable to load video call.'}</p>
          <button
            onClick={() => navigate('/doctor')}
            className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex flex-col lg:flex-row h-screen">
        {/* Main Video Area */}
        <div className="flex-1 bg-black relative">
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/70 to-transparent p-4 z-10">
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                <Video className="w-6 h-6" />
                <div>
                  <h1 className="text-lg font-semibold">Video Consultation</h1>
                  <p className="text-sm text-gray-300">{booking.patient_name}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-red-600 px-3 py-1 rounded-full">
                <Clock className="w-4 h-4" />
                <span className="text-sm font-mono">{formatDuration(callDuration)}</span>
              </div>
            </div>
          </div>

          {/* Jitsi Meeting */}
          <JitsiMeeting
            domain="meet.jit.si"
            roomName={extractRoomName(booking.meeting_link)}
            configOverwrite={{
              startWithAudioMuted: false,
              startWithVideoMuted: false,
              disableModeratorIndicator: false,
              enableWelcomePage: false,
              prejoinPageEnabled: false,
              hideConferenceSubject: false,
            }}
            interfaceConfigOverwrite={{
              DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
              SHOW_JITSI_WATERMARK: false,
              SHOW_WATERMARK_FOR_GUESTS: false,
              TOOLBAR_BUTTONS: [
                'microphone',
                'camera',
                'closedcaptions',
                'desktop',
                'fullscreen',
                'fodeviceselection',
                'hangup',
                'chat',
                'settings',
                'videoquality',
                'filmstrip',
                'shortcuts',
                'tileview',
              ],
            }}
            userInfo={{
              displayName: booking.doctor_name,
              email: 'doctor@arogya.in',
            }}
            onApiReady={(externalApi) => {
              setCallStarted(true);
              console.log('Jitsi API ready');

              // Listen for hangup event using addEventListener
              externalApi.addEventListener('videoConferenceLeft', () => {
                handleEndCall();
              });
            }}
            getIFrameRef={(iframeRef) => {
              iframeRef.style.height = '100%';
              iframeRef.style.width = '100%';
            }}
          />

          {/* End Call Button (Overlay) */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
            <button
              onClick={handleEndCall}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2 font-medium transition"
            >
              <Phone className="w-5 h-5" />
              End Call & Prescribe
            </button>
          </div>
        </div>

        {/* Patient Info Sidebar */}
        <div className="w-full lg:w-96 bg-white p-6 overflow-y-auto">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <User className="w-5 h-5" />
            Patient Information
          </h2>

          {/* Patient Details */}
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="space-y-2">
              <div>
                <span className="text-sm text-gray-600">Name:</span>
                <p className="font-medium text-gray-800">{booking.patient_name}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Patient ID:</span>
                <p className="font-medium text-gray-800">#{booking.patient_id}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Scheduled:</span>
                <p className="font-medium text-gray-800">
                  {new Date(booking.scheduled_time).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Case Summary */}
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              AI Case Summary
            </h3>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-gray-700 whitespace-pre-line">{caseSummary}</p>
            </div>
          </div>

          {/* Quick Notes */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Quick Notes</h3>
            <textarea
              value={quickNotes}
              onChange={(e) => setQuickNotes(e.target.value)}
              placeholder="Type notes during the consultation..."
              rows={8}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">
              These notes will be available when creating the prescription.
            </p>
          </div>

          {/* Call Info */}
          <div className="mt-6 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 text-green-700">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-medium">
                Call Duration: {formatDuration(callDuration)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
