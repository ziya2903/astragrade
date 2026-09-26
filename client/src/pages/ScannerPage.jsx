import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { loadModel, predictImage, aggregateBatchPredictions } from '../services/teachableMachine';
import { saveReport } from '../services/api';
import CameraCapture from '../components/CameraCapture';
import PredictionBars from '../components/PredictionBars';
import BatchSummaryChart from '../components/BatchSummaryChart';
import SampleImagesModal from '../components/SampleImagesModal';
import { 
  Camera, 
  Upload, 
  Plus, 
  Trash2, 
  FileCheck2, 
  Sparkles, 
  Layers, 
  AlertCircle, 
  RotateCcw, 
  CheckCircle2, 
  TrendingUp, 
  Building2, 
  User, 
  Hash,
  Eye
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function ScannerPage({ onReportGenerated, setView }) {
  const { user, activeCentre } = useAuth();

  // Model & State
  const [modelStatus, setModelStatus] = useState('initializing'); // 'initializing' | 'ready' | 'error'
  const [modelStatusText, setModelStatusText] = useState('Loading Google AI Model...');
  const [isProcessing, setIsProcessing] = useState(false);

  // Batch Form Data
  const [farmerName, setFarmerName] = useState(user?.farmerName || 'Rameshwar Patil');
  const [farmerPhone, setFarmerPhone] = useState(user?.phone || '9822012345');
  const [batchNumber, setBatchNumber] = useState(`LOT-ON-${Math.floor(1000 + Math.random() * 9000)}`);

  // Scanned Samples: array of { id, imageSrc, prediction, timestamp }
  const [samples, setSamples] = useState([]);
  const [selectedSampleIndex, setSelectedSampleIndex] = useState(0);

  // Modals & UI Toggles
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isSampleModalOpen, setIsSampleModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const fileInputRef = useRef(null);

  // Pre-load model on mount
  useEffect(() => {
    let isMounted = true;
    async function init() {
      try {
        await loadModel((msg) => {
          if (isMounted) setModelStatusText(msg);
        });
        if (isMounted) {
          setModelStatus('ready');
          setModelStatusText('AI Model Ready (Teachable Machine TFJS)');
        }
      } catch (err) {
        console.error("Model load error:", err);
        if (isMounted) {
          setModelStatus('error');
          setModelStatusText('Failed to load online model weights. Check internet connection.');
        }
      }
    }
    init();
    return () => { isMounted = false; };
  }, []);

  // Process an image source (dataUrl / blob)
  const processImageSrc = async (imgSrc) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = async () => {
        try {
          const prediction = await predictImage(img);
          resolve(prediction);
        } catch (err) {
          reject(err);
        }
      };
      img.onerror = (e) => reject(new Error("Image failed to load for inference"));
      img.src = imgSrc;
    });
  };

  // Add single captured/uploaded image to batch
  const handleAddSample = async (imgSrc) => {
    setIsProcessing(true);
    try {
      const prediction = await processImageSrc(imgSrc);
      const newSample = {
        id: `sample-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        imageSrc: imgSrc,
        prediction,
        timestamp: new Date().toISOString()
      };
      setSamples(prev => {
        const next = [...prev, newSample];
        setSelectedSampleIndex(next.length - 1);
        return next;
      });
    } catch (err) {
      console.error("Inference error:", err);
      alert("Error evaluating onion image. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle multi-image upload from file picker
  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsProcessing(true);
    for (const file of files) {
      try {
        const dataUrl = await readFileAsDataURL(file);
        const prediction = await processImageSrc(dataUrl);
        const newSample = {
          id: `sample-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          imageSrc: dataUrl,
          prediction,
          timestamp: new Date().toISOString()
        };
        setSamples(prev => [...prev, newSample]);
      } catch (err) {
        console.error("Error processing uploaded file:", err);
      }
    }
    setIsProcessing(false);
    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const readFileAsDataURL = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Remove a sample
  const handleRemoveSample = (indexToRemove) => {
    setSamples(prev => {
      const next = prev.filter((_, idx) => idx !== indexToRemove);
      if (selectedSampleIndex >= next.length) {
        setSelectedSampleIndex(Math.max(0, next.length - 1));
      }
      return next;
    });
  };

  // Handle Batch Load from Demo Presets
  const handleLoadMixedBatch = async (batchImages) => {
    setIsProcessing(true);
    const newItems = [];
    for (const imgSrc of batchImages) {
      try {
        const prediction = await processImageSrc(imgSrc);
        newItems.push({
          id: `sample-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          imageSrc: imgSrc,
          prediction,
          timestamp: new Date().toISOString()
        });
      } catch (e) {
        console.error(e);
      }
    }
    setSamples(prev => [...prev, ...newItems]);
    setIsProcessing(false);
  };

  // Calculate Batch Aggregation
  const batchSummary = aggregateBatchPredictions(samples);
  const activeSample = samples[selectedSampleIndex] || null;

  // Handle Generate Digital Report
  const handleGenerateReport = async () => {
    if (samples.length === 0) return;

    setIsSaving(true);
    try {
      const reportPayload = {
        centreName: activeCentre?.name || "Nashik APMC Main Yard",
        centreCode: activeCentre?.code || "NSK-01",
        farmerName,
        farmerPhone,
        batchNumber,
        sampleCount: batchSummary.sampleCount,
        gradeAPercent: batchSummary.overallGradeA,
        ursPercent: batchSummary.overallURS,
        breakdown: batchSummary.breakdown,
        verdict: batchSummary.verdict,
        verdictMessage: batchSummary.verdictMessage,
        inspectorName: user?.name || "Procurement Officer",
        imagesData: samples.map(s => ({
          topClass: s.prediction.topClass,
          confidence: s.prediction.confidence
        }))
      };

      const savedReport = await saveReport(reportPayload);

      // Trigger celebratory confetti if Grade A passes!
      if (savedReport.verdict === 'Grade A') {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      }

      onReportGenerated(savedReport);
    } catch (err) {
      console.error("Report generation error:", err);
      alert("Failed to save report to backend. Proceeding with client report.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 sm:py-8 space-y-6 animate-fadeIn">
      
      {/* Hidden file input for gallery upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/*"
        multiple
        className="hidden"
      />

      {/* Camera Capture Modal */}
      {isCameraOpen && (
        <CameraCapture
          onCapture={(dataUrl) => {
            setIsCameraOpen(false);
            handleAddSample(dataUrl);
          }}
          onClose={() => setIsCameraOpen(false)}
        />
      )}

      {/* Preset Samples Modal */}
      {isSampleModalOpen && (
        <SampleImagesModal
          onSelectSample={(dataUrl) => handleAddSample(dataUrl)}
          onSelectMixedBatch={(batch) => handleLoadMixedBatch(batch)}
          onClose={() => setIsSampleModalOpen(false)}
        />
      )}

      {/* Top Banner: Status & Quick Info */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-stone-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
              {modelStatusText}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 mt-1">
            Batch Quality Assessment
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Capture multiple sample onions from the bag/crate. The AI evaluates each and computes aggregate Grade A vs URS.
          </p>
        </div>

        {/* Quick Batch Details */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <button
            onClick={() => setIsSampleModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>Demo Onion Samples</span>
          </button>

          <button
            onClick={() => setSamples([])}
            disabled={samples.length === 0}
            className="px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-600 text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-40"
            title="Clear Current Batch"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Batch</span>
          </button>
        </div>
      </div>

      {/* Batch Metadata Fields (Collapsible / Compact) */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-stone-200 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="text-[11px] font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1 mb-1">
            <Building2 className="w-3.5 h-3.5 text-emerald-600" />
            Procurement Centre
          </label>
          <div className="text-sm font-extrabold text-stone-800 truncate">
            {activeCentre?.name || "Nashik APMC Main Yard"}
          </div>
        </div>

        <div>
          <label className="text-[11px] font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1 mb-1">
            <User className="w-3.5 h-3.5 text-emerald-600" />
            Farmer / Lot Owner
          </label>
          <input
            type="text"
            value={farmerName}
            onChange={(e) => setFarmerName(e.target.value)}
            className="w-full text-sm font-bold text-stone-900 bg-stone-50 rounded-xl px-3 py-1.5 border border-stone-200 focus:bg-white focus:outline-hidden"
          />
        </div>

        <div>
          <label className="text-[11px] font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1 mb-1">
            <Hash className="w-3.5 h-3.5 text-emerald-600" />
            Lot / Bag Number
          </label>
          <input
            type="text"
            value={batchNumber}
            onChange={(e) => setBatchNumber(e.target.value)}
            className="w-full text-sm font-bold text-stone-900 bg-stone-50 rounded-xl px-3 py-1.5 border border-stone-200 focus:bg-white focus:outline-hidden font-mono"
          />
        </div>
      </div>

      {/* CORE SCAN ACTION BUTTONS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        
        {/* Button 1: Device Camera Capture */}
        <button
          onClick={() => setIsCameraOpen(true)}
          disabled={modelStatus !== 'ready' || isProcessing}
          className="p-5 sm:p-6 rounded-3xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white shadow-lg shadow-emerald-700/20 flex items-center justify-between transition-all cursor-pointer disabled:opacity-50"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
              <Camera className="w-7 h-7 text-white" />
            </div>
            <div className="text-left">
              <span className="text-lg sm:text-xl font-black block">Take Camera Photo</span>
              <span className="text-xs text-emerald-100 font-medium">
                Live mobile / webcam inspection
              </span>
            </div>
          </div>
          <Plus className="w-6 h-6 text-emerald-200 shrink-0" />
        </button>

        {/* Button 2: Upload Image From Gallery */}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={modelStatus !== 'ready' || isProcessing}
          className="p-5 sm:p-6 rounded-3xl bg-stone-900 hover:bg-black active:scale-98 text-white shadow-lg flex items-center justify-between transition-all cursor-pointer disabled:opacity-50"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
              <Upload className="w-7 h-7 text-white" />
            </div>
            <div className="text-left">
              <span className="text-lg sm:text-xl font-black block">Upload From Gallery</span>
              <span className="text-xs text-stone-400 font-medium">
                Select 1 or multiple onion photos
              </span>
            </div>
          </div>
          <Plus className="w-6 h-6 text-stone-400 shrink-0" />
        </button>

      </div>

      {/* INFERENCE PROGRESS INDICATOR */}
      {isProcessing && (
        <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-300 flex items-center justify-center gap-3 animate-pulse">
          <div className="w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-extrabold text-emerald-900">
            Running Teachable Machine AI Vision Model...
          </span>
        </div>
      )}

      {/* SAMPLES GALLERY BAR & MULTI-SAMPLE INSPECTOR */}
      {samples.length > 0 && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200 shadow-sm space-y-4">
          
          <div className="flex items-center justify-between pb-2 border-b border-stone-100">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-600" />
              <h3 className="text-base font-black text-stone-900">
                Batch Samples ({samples.length} scanned)
              </h3>
            </div>
            <span className="text-xs font-bold text-stone-500">
              Tap any photo to view individual confidence
            </span>
          </div>

          {/* Horizontal Scroller of Sample Thumbnails */}
          <div className="flex items-center gap-3 overflow-x-auto pb-2 pt-1">
            {samples.map((sample, idx) => {
              const isSelected = idx === selectedSampleIndex;
              const isGradeA = sample.prediction.topClass.toLowerCase() === 'gradea';

              return (
                <div
                  key={sample.id}
                  onClick={() => setSelectedSampleIndex(idx)}
                  className={`relative shrink-0 w-24 h-28 rounded-2xl overflow-hidden border-2 cursor-pointer transition-all ${
                    isSelected
                      ? 'border-emerald-600 ring-4 ring-emerald-500/20 scale-105 shadow-md'
                      : 'border-stone-200 hover:border-stone-400 opacity-80 hover:opacity-100'
                  }`}
                >
                  <img
                    src={sample.imageSrc}
                    alt={`Sample ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />

                  {/* Top class badge */}
                  <div className={`absolute bottom-0 inset-x-0 py-1 text-center text-[10px] font-black uppercase text-white ${
                    isGradeA ? 'bg-emerald-600/90' : 'bg-rose-600/90'
                  }`}>
                    {sample.prediction.topClass} ({sample.prediction.confidence}%)
                  </div>

                  {/* Delete button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveSample(idx);
                    }}
                    title="Remove sample"
                    className="absolute top-1 right-1 p-1 bg-black/60 hover:bg-rose-600 text-white rounded-full transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>

                  {/* Sample index pin */}
                  <span className="absolute top-1 left-1 px-1.5 py-0.2 rounded bg-black/60 text-white font-mono text-[9px] font-bold">
                    #{idx + 1}
                  </span>
                </div>
              );
            })}

            {/* Quick Add Button at end of scroll */}
            <button
              onClick={() => setIsCameraOpen(true)}
              className="shrink-0 w-24 h-28 rounded-2xl border-2 border-dashed border-stone-300 hover:border-emerald-500 hover:bg-emerald-50/50 flex flex-col items-center justify-center text-stone-500 hover:text-emerald-700 transition-all cursor-pointer"
            >
              <Plus className="w-6 h-6 mb-1" />
              <span className="text-[11px] font-bold">Add More</span>
            </button>
          </div>

          {/* ACTIVE SAMPLE BREAKDOWN VIEW */}
          {activeSample && (
            <div className="mt-4 p-4 rounded-2xl bg-stone-50 border border-stone-200 flex flex-col md:flex-row items-center gap-6">
              <div className="w-32 h-32 rounded-2xl overflow-hidden shadow-md shrink-0 border-2 border-stone-300 bg-stone-200">
                <img
                  src={activeSample.imageSrc}
                  alt="Inspected Sample"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="w-full flex-1">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-stone-500">
                      Sample #{selectedSampleIndex + 1} of {samples.length}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-extrabold uppercase ${
                      activeSample.prediction.topClass.toLowerCase() === 'gradea'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}>
                      {activeSample.prediction.topClass}
                    </span>
                  </div>
                  <span className="text-xs text-stone-500">
                    Live Model Confidence
                  </span>
                </div>

                <PredictionBars prediction={activeSample.prediction} compact={true} />
              </div>
            </div>
          )}

        </div>
      )}

      {/* AGGREGATED BATCH RESULT SECTION (IMPORTANT LOGIC from prompt) */}
      {samples.length > 0 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-emerald-500/50 shadow-lg space-y-6">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-stone-200">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-md">
                Aggregated Multi-Sample Analysis
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-stone-900 mt-1">
                Overall Batch Grade
              </h3>
              <p className="text-xs text-stone-500">
                Synthesized across all {samples.length} onion images to prevent single-onion dispute bias.
              </p>
            </div>

            {/* Verdict Stamp */}
            <div className={`px-5 py-2.5 rounded-2xl font-black text-base sm:text-lg flex items-center gap-2.5 border-2 ${
              batchSummary.verdict === 'Grade A'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-500'
                : 'bg-rose-50 text-rose-800 border-rose-500'
            }`}>
              {batchSummary.verdict === 'Grade A' ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              ) : (
                <AlertCircle className="w-6 h-6 text-rose-600" />
              )}
              <span>VERDICT: {batchSummary.verdict}</span>
            </div>
          </div>

          {/* Verdict Message Bar */}
          <div className={`p-4 rounded-2xl text-xs sm:text-sm font-semibold flex items-center gap-3 ${
            batchSummary.verdict === 'Grade A'
              ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
              : 'bg-amber-50 text-amber-900 border border-amber-200'
          }`}>
            <Sparkles className="w-5 h-5 shrink-0" />
            <span>{batchSummary.verdictMessage}</span>
          </div>

          {/* Two-Column Grid: Visual Chart.js + Breakdown Bars */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            
            {/* Chart.js Visual Pie/Doughnut Chart */}
            <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-stone-600 mb-2 text-center">
                Grade Distribution Chart (Chart.js)
              </h4>
              <BatchSummaryChart breakdown={batchSummary.breakdown} />
            </div>

            {/* Batch Aggregated Percentage Bars */}
            <div className="space-y-4">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-stone-600">
                Aggregated Batch Parameters
              </h4>
              <PredictionBars
                prediction={{
                  gradeAPercent: batchSummary.overallGradeA,
                  ursPercent: batchSummary.overallURS,
                  raw: [
                    { className: 'GradeA', percentage: batchSummary.breakdown.gradeA },
                    { className: 'Rotten', percentage: batchSummary.breakdown.rotten },
                    { className: 'Sprouted', percentage: batchSummary.breakdown.sprouted },
                    { className: 'Undersized', percentage: batchSummary.breakdown.undersized }
                  ],
                  topClass: batchSummary.overallGradeA >= 60 ? 'GradeA' : 'Rotten'
                }}
              />
            </div>

          </div>

          {/* GENERATE DIGITAL REPORT BUTTON */}
          <div className="pt-4 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-stone-500 font-medium text-center sm:text-left">
              Report will be permanently timestamped and saved to the mandi database.
            </div>

            <button
              onClick={handleGenerateReport}
              disabled={isSaving}
              className="w-full sm:w-auto px-8 py-4 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-extrabold rounded-2xl shadow-xl shadow-emerald-700/25 flex items-center justify-center gap-3 transition-all cursor-pointer text-base sm:text-lg disabled:opacity-50"
            >
              <FileCheck2 className="w-6 h-6" />
              <span>{isSaving ? 'Saving & Generating...' : 'Generate Official Digital Report'}</span>
            </button>
          </div>

        </div>
      )}

      {/* EMPTY STATE PROMPT */}
      {samples.length === 0 && (
        <div className="p-8 sm:p-12 text-center rounded-3xl border-2 border-dashed border-stone-300 bg-white/70 space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto shadow-xs">
            <Camera className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-black text-stone-900">
              No Onion Samples Added Yet
            </h3>
            <p className="text-xs sm:text-sm text-stone-500 max-w-md mx-auto mt-1">
              Start by taking a live photo through your camera, picking photos from your gallery, or loading the built-in demo onion specimens.
            </p>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => setIsCameraOpen(true)}
              className="px-5 py-3 rounded-xl bg-emerald-600 text-white font-bold text-xs sm:text-sm shadow-sm hover:bg-emerald-700 cursor-pointer"
            >
              Open Camera
            </button>
            <button
              onClick={() => setIsSampleModalOpen(true)}
              className="px-5 py-3 rounded-xl bg-amber-100 text-amber-900 font-bold text-xs sm:text-sm hover:bg-amber-200 cursor-pointer"
            >
              Load Demo Presets
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
