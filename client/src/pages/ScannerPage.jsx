import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { loadModel, predictImage, aggregateBatchPredictions } from '../services/teachableMachine';
import { optimizeImage } from '../services/imageOptimizer';
import { saveReport } from '../services/api';
import CameraCapture from '../components/CameraCapture';
import PredictionBars from '../components/PredictionBars';
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
  Building2, 
  User, 
  Hash
} from 'lucide-react';

export default function ScannerPage({ onReportGenerated, setView }) {
  const { user, activeCentre, t, lang } = useAuth();

  // Model & State
  const [modelStatus, setModelStatus] = useState('initializing');
  const [modelStatusText, setModelStatusText] = useState('Checking AI Model...');
  const [isProcessing, setIsProcessing] = useState(false);

  // Batch Form Data (Auto-filled for rapid gate throughput)
  const [farmerName, setFarmerName] = useState('Farmer Lot');
  const [farmerPhone, setFarmerPhone] = useState('');
  const [batchNumber, setBatchNumber] = useState(`TOKEN-${Math.floor(100 + Math.random() * 900)}`);

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
          setModelStatusText('AI Model Ready (Offline)');
        }
      } catch (err) {
        console.error("Model load error:", err);
        if (isMounted) {
          setModelStatus('error');
          setModelStatusText('Model failed to load. Check storage permissions.');
        }
      }
    }
    init();
    return () => { isMounted = false; };
  }, []);

  // Process image source
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
      img.onerror = () => reject(new Error("Image failed to load for inference"));
      img.src = imgSrc;
    });
  };

  // Add captured sample (downscaled)
  const handleAddSample = async (optimizedImgSrc) => {
    setIsProcessing(true);
    try {
      const prediction = await processImageSrc(optimizedImgSrc);
      const newSample = {
        id: `sample-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        imageSrc: optimizedImgSrc,
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
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle multi-image upload
  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsProcessing(true);
    for (const file of files) {
      try {
        const rawDataUrl = await readFileAsDataURL(file);
        const optimizedUrl = await optimizeImage(rawDataUrl, 800, 0.75);
        const prediction = await processImageSrc(optimizedUrl);
        const newSample = {
          id: `sample-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          imageSrc: optimizedUrl,
          prediction,
          timestamp: new Date().toISOString()
        };
        setSamples(prev => [...prev, newSample]);
      } catch (err) {
        console.error("Error processing upload:", err);
      }
    }
    setIsProcessing(false);
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

  const handleRemoveSample = (indexToRemove) => {
    setSamples(prev => {
      const next = prev.filter((_, idx) => idx !== indexToRemove);
      if (selectedSampleIndex >= next.length) {
        setSelectedSampleIndex(Math.max(0, next.length - 1));
      }
      return next;
    });
  };

  const handleLoadMixedBatch = async (batchImages) => {
    setIsProcessing(true);
    const newItems = [];
    for (const imgSrc of batchImages) {
      try {
        const optimizedUrl = await optimizeImage(imgSrc, 800, 0.75);
        const prediction = await processImageSrc(optimizedUrl);
        newItems.push({
          id: `sample-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          imageSrc: optimizedUrl,
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

  const batchSummary = aggregateBatchPredictions(samples, lang);
  const activeSample = samples[selectedSampleIndex] || null;

  const handleGenerateReport = async () => {
    if (samples.length === 0) return;

    setIsSaving(true);
    try {
      const reportPayload = {
        centreName: activeCentre?.name || "Nashik APMC Main Yard",
        centreCode: activeCentre?.code || "NSK-01",
        farmerName: farmerName || `Grower (${batchNumber})`,
        farmerPhone: farmerPhone || "N/A",
        batchNumber,
        sampleCount: batchSummary.sampleCount,
        gradeAPercent: batchSummary.overallGradeA,
        ursPercent: batchSummary.overallURS,
        breakdown: batchSummary.breakdown,
        dominantClass: batchSummary.dominantClass,
        verdict: batchSummary.verdict,
        verdictMessage: batchSummary.verdictMessage,
        inspectorName: user?.name || "Gate Officer",
        sampleThumbnails: samples.slice(0, 5).map(s => s.imageSrc),
        imagesData: samples.map(s => ({
          topClass: s.prediction.topClass,
          confidence: s.prediction.confidence
        }))
      };

      const savedReport = await saveReport(reportPayload);
      onReportGenerated(savedReport);
    } catch (err) {
      console.error("Report generation error:", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 sm:py-8 space-y-6 animate-fadeIn">
      
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/*"
        multiple
        className="hidden"
      />

      {/* Continuous Burst Camera Capture Modal */}
      {isCameraOpen && (
        <CameraCapture
          capturedCount={samples.length}
          onCaptureSample={(dataUrl) => handleAddSample(dataUrl)}
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
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border-2 border-[#e6dfd1] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-600 animate-pulse"></span>
            <span className="text-xs font-black text-emerald-900 uppercase tracking-wider">
              {modelStatusText}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-stone-950 mt-1">
            {t.overallGrade}
          </h2>
          <p className="text-xs font-bold text-stone-600 mt-0.5">
            {t.scanSubtitle}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <button
            onClick={() => setIsSampleModalOpen(true)}
            className="px-3.5 py-2.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-950 border-2 border-amber-400 text-xs font-black flex items-center gap-1.5 transition-colors cursor-pointer min-h-[44px]"
          >
            <Sparkles className="w-4 h-4 text-amber-700" />
            <span>{t.demoSamples}</span>
          </button>

          <button
            onClick={() => setSamples([])}
            disabled={samples.length === 0}
            className="px-3.5 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-black flex items-center gap-1.5 transition-colors disabled:opacity-40 border border-stone-300 min-h-[44px]"
            title="Clear Current Batch"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t.resetBatch}</span>
          </button>
        </div>
      </div>

      {/* Batch Metadata Fields (Token & Lot info) */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border-2 border-[#e6dfd1] shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="text-[11px] font-black uppercase tracking-wider text-stone-600 flex items-center gap-1 mb-1">
            <Building2 className="w-3.5 h-3.5 text-[#0d3b32]" />
            Mandi Centre
          </label>
          <div className="text-sm font-black text-stone-900 truncate">
            {activeCentre?.name}
          </div>
        </div>

        <div>
          <label className="text-[11px] font-black uppercase tracking-wider text-stone-600 flex items-center gap-1 mb-1">
            <User className="w-3.5 h-3.5 text-[#0d3b32]" />
            Farmer / Vehicle Slip
          </label>
          <input
            type="text"
            value={farmerName}
            onChange={(e) => setFarmerName(e.target.value)}
            className="w-full text-sm font-bold text-stone-950 bg-stone-50 rounded-xl px-3 py-2 border-2 border-stone-300 focus:bg-white focus:outline-hidden"
          />
        </div>

        <div>
          <label className="text-[11px] font-black uppercase tracking-wider text-stone-600 flex items-center gap-1 mb-1">
            <Hash className="w-3.5 h-3.5 text-[#0d3b32]" />
            Gate Token #
          </label>
          <input
            type="text"
            value={batchNumber}
            onChange={(e) => setBatchNumber(e.target.value)}
            className="w-full text-sm font-black text-stone-950 bg-stone-50 rounded-xl px-3 py-2 border-2 border-stone-300 focus:bg-white focus:outline-hidden font-mono"
          />
        </div>
      </div>

      {/* PRIMARY BURST SCAN & UPLOAD BUTTONS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        
        {/* Continuous Burst Camera Button */}
        <button
          onClick={() => setIsCameraOpen(true)}
          disabled={modelStatus !== 'ready' || isProcessing}
          className="p-5 sm:p-6 rounded-3xl bg-[#0d3b32] hover:bg-[#092c25] active:scale-98 text-white shadow-xl flex items-center justify-between transition-all cursor-pointer disabled:opacity-50 min-h-[76px] border-2 border-amber-400/40"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-400 text-stone-950 flex items-center justify-center shrink-0 font-black">
              <Camera className="w-8 h-8" />
            </div>
            <div className="text-left">
              <span className="text-lg sm:text-xl font-black block">{t.takePhoto}</span>
              <span className="text-xs text-amber-200 font-bold">
                Rapid continuous burst • 5 shots in 10s
              </span>
            </div>
          </div>
          <Plus className="w-7 h-7 text-amber-300 shrink-0" />
        </button>

        {/* Upload Button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={modelStatus !== 'ready' || isProcessing}
          className="p-5 sm:p-6 rounded-3xl bg-[#2a241e] hover:bg-black active:scale-98 text-white shadow-xl flex items-center justify-between transition-all cursor-pointer disabled:opacity-50 min-h-[76px] border-2 border-stone-600"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center shrink-0">
              <Upload className="w-8 h-8 text-amber-400" />
            </div>
            <div className="text-left">
              <span className="text-lg sm:text-xl font-black block">{t.uploadGallery}</span>
              <span className="text-xs text-stone-300 font-bold">
                Pick 1 or multiple batch photos
              </span>
            </div>
          </div>
          <Plus className="w-7 h-7 text-stone-400 shrink-0" />
        </button>

      </div>

      {/* Processing indicator */}
      {isProcessing && (
        <div className="p-4 rounded-2xl bg-amber-100 border-2 border-amber-400 flex items-center justify-center gap-3">
          <div className="w-5 h-5 border-3 border-amber-700 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-black text-amber-950">
            Evaluating onion image with AI model...
          </span>
        </div>
      )}

      {/* SAMPLES GALLERY BAR */}
      {samples.length > 0 && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-[#e6dfd1] shadow-sm space-y-4">
          
          <div className="flex items-center justify-between pb-2 border-b border-stone-200">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#0d3b32]" />
              <h3 className="text-base font-black text-stone-950">
                {t.batchSamples} ({samples.length})
              </h3>
            </div>
            <span className="text-xs font-black text-stone-600">
              Tap photo to inspect
            </span>
          </div>

          {/* Sample Thumbnails with 48px Tap Targets */}
          <div className="flex items-center gap-3 overflow-x-auto pb-3 pt-1">
            {samples.map((sample, idx) => {
              const isSelected = idx === selectedSampleIndex;
              const isGradeA = sample.prediction.topClass.toLowerCase() === 'gradea';

              return (
                <div
                  key={sample.id}
                  onClick={() => setSelectedSampleIndex(idx)}
                  className={`relative shrink-0 w-28 h-32 rounded-2xl overflow-hidden border-3 cursor-pointer transition-all ${
                    isSelected
                      ? 'border-[#0d3b32] ring-4 ring-amber-400/40 scale-105 shadow-lg'
                      : 'border-stone-300 hover:border-stone-500'
                  }`}
                >
                  <img
                    src={sample.imageSrc}
                    alt={`Sample ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />

                  {/* Top class badge */}
                  <div className={`absolute bottom-0 inset-x-0 py-1 text-center text-[10px] font-black uppercase text-white ${
                    isGradeA ? 'bg-[#0d3b32]' : 'bg-[#e11d48]'
                  }`}>
                    {sample.prediction.topClass} ({sample.prediction.confidence}%)
                  </div>

                  {/* 48px Delete Target */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveSample(idx);
                    }}
                    title="Remove sample"
                    className="absolute top-1 right-1 w-10 h-10 bg-black/80 hover:bg-rose-700 text-white rounded-full flex items-center justify-center transition-colors min-h-[40px] min-w-[40px] cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4 text-white" />
                  </button>

                  <span className="absolute top-1 left-1 px-2 py-0.5 rounded bg-black/80 text-white font-mono text-[10px] font-black">
                    #{idx + 1}
                  </span>
                </div>
              );
            })}

            {/* Quick Add Button */}
            <button
              onClick={() => setIsCameraOpen(true)}
              className="shrink-0 w-28 h-32 rounded-2xl border-3 border-dashed border-stone-400 hover:border-[#0d3b32] hover:bg-amber-50/50 flex flex-col items-center justify-center text-stone-700 hover:text-[#0d3b32] transition-all cursor-pointer"
            >
              <Plus className="w-8 h-8 mb-1" />
              <span className="text-xs font-black">Add More</span>
            </button>
          </div>

          {/* ACTIVE SAMPLE BREAKDOWN */}
          {activeSample && (
            <div className="mt-4 p-4 rounded-2xl bg-stone-50 border-2 border-stone-200 flex flex-col md:flex-row items-center gap-6">
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
                    <span className="text-xs font-mono font-black text-stone-800">
                      Sample #{selectedSampleIndex + 1} of {samples.length}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-black uppercase ${
                      activeSample.prediction.topClass.toLowerCase() === 'gradea'
                        ? 'bg-emerald-100 text-emerald-950 border border-emerald-400'
                        : 'bg-rose-100 text-rose-950 border border-rose-400'
                    }`}>
                      {activeSample.prediction.topClass}
                    </span>
                  </div>
                </div>

                <PredictionBars prediction={activeSample.prediction} compact={true} />
              </div>
            </div>
          )}

        </div>
      )}

      {/* AGGREGATED BATCH RESULT SECTION */}
      {samples.length > 0 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-3 border-[#0d3b32] shadow-xl space-y-6">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b-2 border-stone-200">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-amber-900 bg-amber-100 px-3 py-1 rounded-md border border-amber-300">
                Multi-Sample Batch Result
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-stone-950 mt-1">
                {t.overallGrade}
              </h3>
            </div>

            {/* Verdict Stamp */}
            <div className={`px-5 py-3 rounded-2xl font-black text-base sm:text-lg flex items-center gap-2.5 border-3 ${
              batchSummary.verdict === 'Grade A'
                ? 'bg-emerald-100 text-emerald-950 border-emerald-600'
                : 'bg-rose-100 text-rose-950 border-rose-600'
            }`}>
              {batchSummary.verdict === 'Grade A' ? (
                <CheckCircle2 className="w-7 h-7 text-emerald-700" />
              ) : (
                <AlertCircle className="w-7 h-7 text-rose-700" />
              )}
              <span>VERDICT: {batchSummary.verdict}</span>
            </div>
          </div>

          {/* Verdict Message Bar */}
          <div className={`p-4 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-3 border-2 ${
            batchSummary.verdict === 'Grade A'
              ? 'bg-emerald-50 text-emerald-950 border-emerald-400'
              : 'bg-amber-50 text-amber-950 border-amber-400'
          }`}>
            <Sparkles className="w-5 h-5 shrink-0 text-amber-600" />
            <span>{batchSummary.verdictMessage}</span>
          </div>

          {/* Batch Aggregated Percentage Bars */}
          <div className="space-y-4">
            <PredictionBars
              prediction={{
                gradeAPercent: batchSummary.overallGradeA,
                ursPercent: batchSummary.overallURS,
                dominantClass: batchSummary.dominantClass,
                raw: [
                  { className: 'GradeA', percentage: batchSummary.breakdown.gradeA },
                  { className: 'Rotten', percentage: batchSummary.breakdown.rotten },
                  { className: 'Sprouted', percentage: batchSummary.breakdown.sprouted },
                  { className: 'Undersized', percentage: batchSummary.breakdown.undersized }
                ],
                topClass: batchSummary.dominantClass
              }}
            />
          </div>

          {/* Sticky/Prominent Action Button */}
          <div className="pt-4 border-t-2 border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xs text-stone-700 font-bold text-center sm:text-left">
              Locks transparent quality record in Mandi database.
            </span>

            <button
              onClick={handleGenerateReport}
              disabled={isSaving}
              className="w-full sm:w-auto px-8 py-4 bg-[#0d3b32] hover:bg-[#082822] active:scale-98 text-white font-black rounded-2xl shadow-xl flex items-center justify-center gap-3 transition-all cursor-pointer text-base sm:text-lg disabled:opacity-50 min-h-[56px] border-2 border-amber-400/40"
            >
              <FileCheck2 className="w-6 h-6 text-amber-400" />
              <span>{isSaving ? 'Generating...' : t.generateReport}</span>
            </button>
          </div>

        </div>
      )}

      {/* Empty State */}
      {samples.length === 0 && (
        <div className="p-8 sm:p-12 text-center rounded-3xl border-3 border-dashed border-[#d8cebc] bg-white space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-900 flex items-center justify-center mx-auto">
            <Camera className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-black text-stone-950">
              No Onion Samples Added Yet
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 font-bold max-w-md mx-auto mt-1">
              Start by taking rapid continuous photos, picking images from your gallery, or loading demo specimens.
            </p>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => setIsCameraOpen(true)}
              className="px-6 py-3.5 rounded-xl bg-[#0d3b32] text-white font-black text-sm shadow-md hover:bg-[#092c25] cursor-pointer min-h-[48px]"
            >
              Open Camera (Burst)
            </button>
            <button
              onClick={() => setIsSampleModalOpen(true)}
              className="px-6 py-3.5 rounded-xl bg-amber-100 text-amber-950 font-black text-sm hover:bg-amber-200 cursor-pointer border border-amber-300 min-h-[48px]"
            >
              Load Demo Presets
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
