import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const CLASS_CONFIG = {
  GradeA: {
    key: 'GradeA',
    barColor: 'bg-emerald-700',
    textColor: 'text-emerald-900',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-500',
    icon: CheckCircle2
  },
  Rotten: {
    key: 'Rotten',
    barColor: 'bg-rose-700',
    textColor: 'text-rose-900',
    bgColor: 'bg-rose-50',
    borderColor: 'border-rose-500',
    icon: XCircle
  },
  Sprouted: {
    key: 'Sprouted',
    barColor: 'bg-amber-600',
    textColor: 'text-amber-950',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-500',
    icon: AlertTriangle
  },
  Undersized: {
    key: 'Undersized',
    barColor: 'bg-indigo-700',
    textColor: 'text-indigo-950',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-500',
    icon: Info
  }
};

export default function PredictionBars({ prediction, compact = false }) {
  const { t } = useAuth();
  if (!prediction) return null;

  const rawClasses = prediction.raw || [
    { className: 'GradeA', percentage: prediction.breakdown?.gradeA || 0 },
    { className: 'Rotten', percentage: prediction.breakdown?.rotten || 0 },
    { className: 'Sprouted', percentage: prediction.breakdown?.sprouted || 0 },
    { className: 'Undersized', percentage: prediction.breakdown?.undersized || 0 }
  ];

  const gradeAPercent = prediction.gradeAPercent ?? prediction.breakdown?.gradeA ?? 0;
  const ursPercent = prediction.ursPercent ?? (100 - gradeAPercent);

  return (
    <div className="space-y-4">
      {/* Grade A vs URS Summary Split (High Sunlight Contrast) */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 rounded-2xl bg-emerald-50 border-3 border-emerald-600 text-left shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-emerald-950">
              {t.gradeAShare}
            </span>
            <span className="w-3 h-3 rounded-full bg-emerald-600"></span>
          </div>
          <div className="mt-1 text-3xl sm:text-4xl font-black text-emerald-950 tracking-tight font-mono">
            {gradeAPercent}%
          </div>
          <p className="text-xs font-black text-emerald-800 mt-0.5">
            Standard: &gt;= 60%
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-stone-100 border-3 border-stone-400 text-left shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-stone-950">
              {t.ursDefect}
            </span>
            <span className="text-[10px] font-black text-stone-900 bg-stone-300 px-1.5 py-0.5 rounded">
              Sum
            </span>
          </div>
          <div className="mt-1 text-3xl sm:text-4xl font-black text-stone-950 tracking-tight font-mono">
            {ursPercent}%
          </div>
          <p className="text-xs font-bold text-stone-700 mt-0.5">
            Rotten + Sprout + Small
          </p>
        </div>
      </div>

      {/* 4-Class Breakdown Bars */}
      <div className="space-y-2.5">
        {rawClasses.map(item => {
          const cfg = CLASS_CONFIG[item.className] || CLASS_CONFIG.GradeA;
          const Icon = cfg.icon;
          const isDominant = prediction.topClass === item.className || prediction.dominantClass === item.className;
          const translatedLabel = t.classes?.[item.className] || item.className;

          return (
            <div
              key={item.className}
              className={`p-3.5 rounded-xl border-2 transition-all ${
                isDominant
                  ? `${cfg.bgColor} ${cfg.borderColor} shadow-xs ring-2 ring-stone-900/10`
                  : 'bg-white border-stone-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <Icon className={`w-4 h-4 ${cfg.textColor}`} />
                  <span className="text-sm font-black text-stone-950">
                    {translatedLabel}
                  </span>
                </div>

                <div className="text-right flex items-center gap-2">
                  {isDominant && (
                    <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded bg-black text-white">
                      TOP
                    </span>
                  )}
                  <span className={`text-base font-black font-mono ${cfg.textColor}`}>
                    {item.percentage}%
                  </span>
                </div>
              </div>

              {/* Progress Meter */}
              <div className="w-full bg-stone-200 rounded-full h-3.5 overflow-hidden p-0.5 border border-stone-400">
                <div
                  className={`h-full rounded-full transition-all duration-300 ease-out ${cfg.barColor}`}
                  style={{ width: `${Math.min(100, Math.max(0, item.percentage))}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
