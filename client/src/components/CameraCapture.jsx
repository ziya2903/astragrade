import React, { useRef, useState, useEffect } from 'react';
import { Camera, SwitchCamera, X, Check, AlertCircle, Layers } from 'lucide-react';
import { optimizeImage } from '../services/imageOptimizer';

export default function CameraCapture({ onCaptureSample, onClose, capturedCount = 0 }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [facingMode, setFacingMode] = useState('environment'); // Default to rear camera
  const [cameraError, setCameraError] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [flashAnimation, setFlashAnimation] = useState(false);
  const [burstCount, setBurstCount] = useState(capturedCount);

  // Stop camera stream cleanly without leaving Android hardware locked
  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        try { track.stop(); } catch (e) {}
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  useEffect(() => {
    let isActive = true;

    async function startCamera() {
      setIsInitializing(true);
      setCameraError(null);
      stopStream();

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
        if (!isActive) {
          mediaStream.getTracks().forEach(t => t.stop());
          return;
        }

        streamRef.current = mediaStream;
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          await videoRef.current.play();
        }
      } catch (err) {
        console.error("Camera access error:", err);
        if (isActive) {
          setCameraError(
            err.name === 'NotAllowedError'
              ? 'Camera permission denied. Grant permission in browser settings.'
              : 'Camera hardware busy or unavailable. Switch cameras or use Gallery upload.'
          );
        }
      } finally {
        if (isActive) setIsInitializing(false);
      }
    }

    startCamera();

    return () => {
      isActive = false;
      stopStream();
    };
  }, [facingMode]);

  const toggleFacingMode = () => {
    setFacingMode(prev => prev === 'environment' ? 'user' : 'environment');
  };

  // Continuous Burst Snap: captures without terminating camera stream
  const handleSnap = async () => {
    if (!videoRef.current) return;

    // Visual shutter flash
    setFlashAnimation(true);
    setTimeout(() => setFlashAnimation(false), 200);

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Downscale and compress to prevent mobile memory bloat
    const optimizedDataUrl = await optimizeImage(canvas, 800, 0.75);

    setBurstCount(prev => prev + 1);
    onCaptureSample(optimizedDataUrl);
  };

  const handleFinish = () => {
    stopStream();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col items-center justify-between p-3 sm:p-6 animate-fadeIn select-none">
      
      {/* Top Bar */}
      <div className="w-full max-w-lg flex items-center justify-between text-white px-2 py-1">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center font-bold text-xs">
            {burstCount}
          </div>
          <div>
            <span className="font-extrabold text-sm tracking-wide block">
              Continuous Burst Mode
            </span>
            <span className="text-[11px] text-stone-400">
              Tap shutter repeatedly for each onion
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleFacingMode}
            title="Switch Camera"
            className="p-3 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-full transition-colors min-h-[48px] min-w-[48px] flex items-center justify-center cursor-pointer"
          >
            <SwitchCamera className="w-5 h-5" />
          </button>
          <button
            onClick={handleFinish}
            title="Finish / Close"
            className="p-3 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-full transition-colors min-h-[48px] min-w-[48px] flex items-center justify-center cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Camera Viewport Frame (Square 1:1 matching model expectation) */}
      <div className="relative w-full max-w-md aspect-square bg-stone-900 rounded-3xl overflow-hidden shadow-2xl border-4 border-stone-800 flex items-center justify-center">
        {cameraError ? (
          <div className="p-6 text-center text-rose-300 space-y-3">
            <AlertCircle className="w-12 h-12 mx-auto text-rose-400" />
            <p className="text-sm font-bold">{cameraError}</p>
            <button
              onClick={handleFinish}
              className="mt-3 px-5 py-3 bg-white text-stone-950 font-black rounded-xl text-sm"
            >
              Back to Upload
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

            {/* Shutter flash overlay */}
            {flashAnimation && (
              <div className="absolute inset-0 bg-white/70 pointer-events-none transition-opacity" />
            )}

            {/* Target Reticle (High-contrast yellow/emerald for outdoor glare) */}
            <div className="absolute inset-8 pointer-events-none border-2 border-dashed border-amber-400/90 rounded-2xl flex flex-col justify-between p-3">
              <div className="flex justify-between">
                <div className="w-6 h-6 border-t-4 border-l-4 border-amber-400"></div>
                <div className="w-6 h-6 border-t-4 border-r-4 border-amber-400"></div>
              </div>
              <div className="text-center">
                <span className="bg-black/75 px-3 py-1 rounded-full text-[11px] font-black text-amber-300 tracking-wide border border-amber-400/50">
                  Center single onion inside square
                </span>
              </div>
              <div className="flex justify-between">
                <div className="w-6 h-6 border-b-4 border-l-4 border-amber-400"></div>
                <div className="w-6 h-6 border-b-4 border-r-4 border-amber-400"></div>
              </div>
            </div>

            {isInitializing && (
              <div className="absolute inset-0 bg-stone-950/80 flex items-center justify-center text-white text-sm font-extrabold">
                Starting Camera Hardware...
              </div>
            )}
          </>
        )}
      </div>

      {/* Controls Bar: Shutter + Done Button */}
      {!cameraError && (
        <div className="w-full max-w-lg flex items-center justify-around py-4">
          
          {/* Photos Count Badge */}
          <div className="text-center w-20">
            <span className="text-2xl font-black text-white">{burstCount}</span>
            <span className="text-[10px] uppercase font-bold text-stone-400 block">Samples</span>
          </div>

          {/* Big Tactile Shutter Button (64x64 min tap area) */}
          <button
            onClick={handleSnap}
            disabled={isInitializing}
            className="w-20 h-20 rounded-full border-4 border-white bg-emerald-600 hover:bg-emerald-500 active:scale-95 transition-all shadow-2xl flex items-center justify-center cursor-pointer min-h-[64px] min-w-[64px]"
            aria-label="Capture onion photo"
          >
            <div className="w-14 h-14 rounded-full bg-white/30 flex items-center justify-center">
              <Camera className="w-8 h-8 text-white drop-shadow-md" />
            </div>
          </button>

          {/* Done Button */}
          <button
            onClick={handleFinish}
            className="w-20 py-3 rounded-2xl bg-white text-stone-900 hover:bg-stone-100 active:scale-95 font-black text-xs flex flex-col items-center justify-center cursor-pointer shadow-md min-h-[48px]"
          >
            <Check className="w-5 h-5 text-emerald-600 mb-0.5" />
            <span>Done</span>
          </button>

        </div>
      )}

    </div>
  );
}
