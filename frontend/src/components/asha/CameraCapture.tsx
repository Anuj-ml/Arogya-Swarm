/**
 * Medical Image Capture with AI Analysis
 * Captures photos using device camera and uploads to backend for AI analysis
 */
import { useState, useRef, useEffect } from 'react';
import { Camera, X, RotateCcw, Check, AlertCircle, Upload, Loader } from 'lucide-react';
import apiClient from '../../services/apiClient';
import { addMedicalImage } from '../../db/database';

interface ImageAnalysis {
  findings: string[];
  urgency: 'low' | 'medium' | 'high' | 'critical';
  recommendations: string[];
  confidence_score: number;
}

interface CameraCaptureProps {
  patientId: number;
  onSuccess?: (analysisResult: ImageAnalysis) => void;
  onCancel?: () => void;
}

export default function CameraCapture({ patientId, onSuccess, onCancel }: CameraCaptureProps) {
  const [cameraActive, setCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<ImageAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [context, setContext] = useState('');
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    // Monitor online/offline status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: 1280, height: 720 },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setCameraActive(true);
      }
    } catch (err) {
      console.error('Camera access error:', err);
      setError('Unable to access camera. Please check permissions.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Set canvas size to video size
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Get image data as base64
    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    setCapturedImage(imageData);
    stopCamera();
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    setAnalysisResult(null);
    setError(null);
    startCamera();
  };

  const confirmAndUpload = async () => {
    if (!capturedImage) return;

    setIsUploading(true);
    setError(null);

    try {
      // Convert base64 to blob
      const response = await fetch(capturedImage);
      const blob = await response.blob();
      const file = new File([blob], `medical_image_${Date.now()}.jpg`, { type: 'image/jpeg' });

      if (!isOnline) {
        // Save to IndexedDB for later sync
        await addMedicalImage({
          patientId,
          imageData: capturedImage,
          context: context || 'Medical image',
          syncStatus: 'pending',
          createdAt: new Date().toISOString(),
        });

        setError('Offline: Image saved locally. Will sync when online.');
        setIsUploading(false);
        return;
      }

      // Upload to backend
      const result = await apiClient.uploadImage(file, patientId, context) as {
        analysis?: {
          findings?: string[];
          urgency?: 'low' | 'medium' | 'high' | 'critical';
          recommendations?: string[];
          confidence_score?: number;
        };
      };

      if (result.analysis) {
        const analysis: ImageAnalysis = {
          findings: result.analysis.findings || [],
          urgency: result.analysis.urgency || 'low',
          recommendations: result.analysis.recommendations || [],
          confidence_score: result.analysis.confidence_score || 0,
        };

        setAnalysisResult(analysis);

        // Save to IndexedDB
        await addMedicalImage({
          patientId,
          imageData: capturedImage,
          context: context || 'Medical image',
          analysis: JSON.stringify(analysis),
          syncStatus: 'synced',
          createdAt: new Date().toISOString(),
        });

        if (onSuccess) {
          onSuccess(analysis);
        }
      }
    } catch (err) {
      console.error('Upload error:', err);
      const error = err as { response?: { data?: { detail?: string } } };
      setError(error.response?.data?.detail || 'Failed to upload image. Please try again.');

      // Save to IndexedDB on error
      await addMedicalImage({
        patientId,
        imageData: capturedImage,
        context: context || 'Medical image',
        syncStatus: 'error',
        createdAt: new Date().toISOString(),
      });
    } finally {
      setIsUploading(false);
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical':
        return 'bg-red-600';
      case 'high':
        return 'bg-orange-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Camera className="w-6 h-6" />
          Medical Image Capture
        </h2>
        {onCancel && (
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>
        )}
      </div>

      {!isOnline && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-yellow-600" />
          <span className="text-sm text-yellow-800">
            You are offline. Images will be saved locally and synced later.
          </span>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <span className="text-sm text-red-800">{error}</span>
        </div>
      )}

      {/* Context Input */}
      {!cameraActive && !capturedImage && (
        <div className="mb-4">
          <label htmlFor="context" className="block text-sm font-medium text-gray-700 mb-2">
            Image Context (Optional)
          </label>
          <input
            type="text"
            id="context"
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder="e.g., Wound on left arm, Rash on back"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      )}

      {/* Camera View */}
      {!capturedImage && (
        <div className="mb-4">
          <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video">
            {cameraActive ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-gray-400">
                  <Camera className="w-16 h-16 mx-auto mb-4" />
                  <p>Camera not active</p>
                </div>
              </div>
            )}
            <canvas ref={canvasRef} className="hidden" />
          </div>

          <div className="flex gap-3 mt-4">
            {!cameraActive ? (
              <button
                onClick={startCamera}
                className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 font-medium"
              >
                <Camera className="w-5 h-5" />
                Start Camera
              </button>
            ) : (
              <>
                <button
                  onClick={capturePhoto}
                  className="flex-1 bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2 font-medium"
                >
                  <Camera className="w-5 h-5" />
                  Capture Photo
                </button>
                <button
                  onClick={stopCamera}
                  className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Image Preview */}
      {capturedImage && !analysisResult && (
        <div className="mb-4">
          <div className="relative rounded-lg overflow-hidden border border-gray-300">
            <img src={capturedImage} alt="Captured" className="w-full" />
          </div>

          <div className="flex gap-3 mt-4">
            <button
              onClick={retakePhoto}
              className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center gap-2"
            >
              <RotateCcw className="w-5 h-5" />
              Retake
            </button>
            <button
              onClick={confirmAndUpload}
              disabled={isUploading}
              className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isUploading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Uploading & Analyzing...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  Upload & Analyze
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Analysis Results */}
      {analysisResult && (
        <div className="space-y-4">
          <div className="rounded-lg overflow-hidden border border-gray-300">
            <img src={capturedImage!} alt="Analyzed" className="w-full" />
          </div>

          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-800">AI Analysis Results</h3>
              <span
                className={`${getUrgencyColor(
                  analysisResult.urgency
                )} text-white px-3 py-1 rounded-full text-sm font-medium uppercase`}
              >
                {analysisResult.urgency}
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-1">Findings:</h4>
                <ul className="list-disc list-inside space-y-1">
                  {analysisResult.findings.map((finding, index) => (
                    <li key={index} className="text-sm text-gray-600">
                      {finding}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-1">Recommendations:</h4>
                <ul className="list-disc list-inside space-y-1">
                  {analysisResult.recommendations.map((rec, index) => (
                    <li key={index} className="text-sm text-gray-600">
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>

              {analysisResult.confidence_score > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Confidence:</h4>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${analysisResult.confidence_score}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600">
                      {analysisResult.confidence_score.toFixed(0)}%
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={retakePhoto}
              className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center gap-2"
            >
              <Camera className="w-5 h-5" />
              Capture Another
            </button>
            <button
              onClick={() => {
                setCapturedImage(null);
                setAnalysisResult(null);
                if (onCancel) onCancel();
              }}
              className="flex-1 bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2 font-medium"
            >
              <Check className="w-5 h-5" />
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
