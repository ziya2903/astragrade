import React, { useRef, useState, useEffect } from 'react';
import { Camera, SwitchCamera, X, AlertCircle } from 'lucide-react';

export default function CameraCapture({ onCapture, onClose }) {
  const videoRef = useRef(null);
  const [facingMode, setFacingMode] = useState('environment'); // Default to rear camera on phones
  const [stream, setStream] = useState(null);
  const [cameraError, setCameraError] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    let currentStream = null;

    async function startCamera() {
      setIsInitializing(true);
      setCameraError(null);

      // Stop any existing tracks
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      try {
        const constraints = {
          video: {
            facingMode: { ideal: facingMode },
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false
        };

        const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
        currentStream = mediaStream;
        setStream(mediaStream);

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          await videoRef.current.play();
        }
      } catch (err) {
        console.error("Camera access error:", err);
        setCameraError(
          err.name === 'NotAllowedError'
            ? 'Camera access denied. Please grant camera permissions in your browser.'
            : 'Unable to access camera on this device. You can still use Image Upload.'
        );
      } finally {
        setIsInitializing(false);
      }
    }

    startCamera();

    return () => {
      if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [facingMode]);

  const toggleFacingMode = () => {
    setFacingMode(prev => prev === 'environment' ? 'user' : 'environment');
  };

  const handleCapture = () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);

    // Stop camera before closing
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }

    onCapture(dataUrl);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-3 sm:p-6 animate-fadeIn">
      {/* Top Bar */}
      <div className="w-full max-w-lg flex items-center justify-between text-white mb-3 px-2">
        <div className="flex items-center gap-2">
          <Camera className="w-5 h-5 text-emerald-400" />
          <span className="font-bold text-sm tracking-wide">Live Onion Scanner</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleFacingMode}
            title="Switch Front/Rear Camera"
            className="p-2 bg-stone-800/80 hover:bg-stone-700 text-stone-200 rounded-full transition-colors"
          >
            <SwitchCamera className="w-5 h-5" />
          </button>
          <button
            onClick={onClose}
            title="Close Camera"
            className="p-2 bg-stone-800/80 hover:bg-stone-700 text-stone-200 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Viewport Frame */}
      <div className="relative w-full max-w-lg aspect-4/3 sm:aspect-square bg-stone-900 rounded-3xl overflow-hidden shadow-2xl border-2 border-stone-700 flex items-center justify-center">
        {cameraError ? (
          <div className="p-6 text-center text-rose-300 space-y-3">
            <AlertCircle className="w-12 h-12 mx-auto text-rose-400" />
            <p className="text-sm font-semibold">{cameraError}</p>
            <button
              onClick={onClose}
              className="mt-3 px-5 py-2.5 bg-white text-stone-900 font-bold rounded-xl text-sm"
            >
              Use Gallery / File Upload Instead
            </button>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              playsInline
              muted
              className="w-full h-full object-cover"
            />

            {/* Target Reticle Overlay */}
            <div className="absolute inset-8 sm:inset-12 pointer-events-none border-2 border-dashed border-emerald-400/70 rounded-3xl flex flex-col justify-between p-4">
              <div className="flex justify-between">
                <div className="w-6 h-6 border-t-4 border-l-4 border-emerald-400 -mt-1 -ml-1"></div>
                <div className="w-6 h-6 border-t-4 border-r-4 border-emerald-400 -mt-1 -mr-1"></div>
              </div>
              <div className="text-center">
                <span className="bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-emerald-300">
                  Center single onion or batch inside frame
                </span>
              </div>
              <div className="flex justify-between">
                <div className="w-6 h-6 border-b-4 border-l-4 border-emerald-400 -mb-1 -ml-1"></div>
                <div className="w-6 h-6 border-b-4 border-r-4 border-emerald-400 -mb-1 -mr-1"></div>
              </div>
            </div>

            {isInitializing && (
              <div className="absolute inset-0 bg-stone-900/80 flex items-center justify-center text-white text-sm font-bold">
                Starting Camera...
              </div>
            )}
          </>
        )}
      </div>

      {/* Shutter Button */}
      {!cameraError && (
        <div className="mt-5 flex items-center justify-center gap-6">
          <button
            onClick={handleCapture}
            disabled={isInitializing}
            className="w-20 h-20 rounded-full border-4 border-white bg-emerald-600 hover:bg-emerald-500 active:scale-95 transition-all shadow-lg flex items-center justify-center text-white group cursor-pointer disabled:opacity-50"
            aria-label="Capture onion photo"
          >
            <div className="w-14 h-14 rounded-full bg-white/30 group-hover:bg-white/40 transition-colors flex items-center justify-center">
              <Camera className="w-8 h-8 text-white drop-shadow-md" />
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
