/**
 * Camera Capture Component
 * Capture and analyze medical images
 */
import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, Upload, Image as ImageIcon, Send } from 'lucide-react';
import apiClient from '../../services/apiClient';

export default function CameraCapture() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select an image first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.uploadImage(selectedFile, undefined, 'Medical condition assessment');
      setResult(response);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to analyze image');
      console.error('Error uploading image:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/asha')}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
            <h1 className="text-xl font-bold text-gray-900">Medical Image Capture</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-md p-6">
            {/* Info Notice */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6 flex items-start space-x-3">
              <Camera className="w-5 h-5 text-purple-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-purple-900 font-medium">AI-Powered Image Analysis</p>
                <p className="text-xs text-purple-700 mt-1">
                  Capture wounds, rashes, or skin conditions for AI-assisted preliminary analysis
                </p>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-red-900">{error}</p>
              </div>
            )}

            {/* Upload Section */}
            {!previewUrl ? (
              <div className="space-y-4">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-primary-500 hover:bg-primary-50 transition cursor-pointer"
                >
                  <ImageIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg font-medium text-gray-700 mb-2">
                    Click to select an image
                  </p>
                  <p className="text-sm text-gray-500">
                    or use your camera to take a photo
                  </p>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-6 py-3 border-2 border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 transition font-medium flex items-center justify-center space-x-2"
                  >
                    <Camera className="w-5 h-5" />
                    <span>Take Photo</span>
                  </button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium flex items-center justify-center space-x-2"
                  >
                    <Upload className="w-5 h-5" />
                    <span>Upload Image</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Image Preview */}
                <div className="rounded-lg overflow-hidden border-2 border-gray-200">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-auto"
                  />
                </div>

                {/* Analysis Result */}
                {result && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-blue-900 mb-2">
                      Analysis Results
                    </h3>
                    <div className="text-sm text-blue-800 space-y-2">
                      {result.analysis && (
                        <p><strong>Analysis:</strong> {result.analysis}</p>
                      )}
                      {result.confidence && (
                        <p><strong>Confidence:</strong> {result.confidence}%</p>
                      )}
                      {result.recommendations && (
                        <div>
                          <strong>Recommendations:</strong>
                          <ul className="list-disc list-inside ml-4 mt-1">
                            {result.recommendations.map((rec: string, idx: number) => (
                              <li key={idx}>{rec}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex space-x-4">
                  <button
                    onClick={() => {
                      setSelectedFile(null);
                      setPreviewUrl(null);
                      setResult(null);
                      setError(null);
                    }}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                  >
                    Choose Another
                  </button>
                  {!result && (
                    <button
                      onClick={handleUpload}
                      disabled={loading}
                      className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-medium flex items-center justify-center space-x-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      <Send className="w-5 h-5" />
                      <span>{loading ? 'Analyzing...' : 'Analyze Image'}</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
