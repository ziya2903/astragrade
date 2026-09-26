import React from 'react';
import { PRESET_SAMPLES, generateSyntheticOnionImage } from '../services/sampleImages';
import { Sparkles, X, Layers } from 'lucide-react';

export default function SampleImagesModal({ onSelectSample, onSelectMixedBatch, onClose }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-stone-200 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-stone-900">
                Demo Onion Presets
              </h3>
              <p className="text-xs text-stone-500">
                Click any specimen to evaluate via Google Teachable Machine AI
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1-Click Multi Batch Button */}
        <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-md flex items-center justify-between">
          <div>
            <span className="text-xs uppercase tracking-wider font-extrabold text-emerald-100">
              Instant Hackathon Demo
            </span>
            <h4 className="text-base font-bold">Load 5-Sample Mixed Onion Batch</h4>
            <p className="text-xs text-emerald-100/90 mt-0.5">
              Adds 3 Grade A + 1 Rotten + 1 Sprouted onion for batch aggregation
            </p>
          </div>
          <button
            onClick={() => {
              const batch = [
                generateSyntheticOnionImage('GradeA'),
                generateSyntheticOnionImage('GradeA'),
                generateSyntheticOnionImage('Sprouted'),
                generateSyntheticOnionImage('GradeA'),
                generateSyntheticOnionImage('Rotten')
              ];
              onSelectMixedBatch(batch);
              onClose();
            }}
            className="px-4 py-2.5 bg-white text-emerald-800 hover:bg-emerald-50 active:scale-95 font-extrabold rounded-xl text-xs sm:text-sm shadow-sm transition-all shrink-0 cursor-pointer"
          >
            Load 5 Samples
          </button>
        </div>

        {/* Grid of 4 Presets */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          {PRESET_SAMPLES.map(sample => {
            const dataUrl = generateSyntheticOnionImage(sample.class);
            return (
              <button
                key={sample.id}
                onClick={() => {
                  onSelectSample(dataUrl, sample.class);
                  onClose();
                }}
                className="group p-3 rounded-2xl border-2 border-stone-200 hover:border-emerald-500 hover:shadow-md transition-all text-left bg-stone-50/60 hover:bg-white flex flex-col cursor-pointer"
              >
                <div className="w-full aspect-square rounded-xl overflow-hidden bg-stone-200 mb-2 relative">
                  <img
                    src={dataUrl}
                    alt={sample.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <span className="absolute bottom-1.5 left-1.5 text-[10px] font-bold px-2 py-0.5 rounded-md bg-black/70 text-white backdrop-blur-xs">
                    {sample.class}
                  </span>
                </div>
                <span className="text-sm font-bold text-stone-900 group-hover:text-emerald-700">
                  {sample.title}
                </span>
                <span className="text-[11px] text-stone-500 line-clamp-2 mt-0.5 leading-snug">
                  {sample.description}
                </span>
              </button>
            );
          })}
        </div>

      </div>
    </div>
  );
}
