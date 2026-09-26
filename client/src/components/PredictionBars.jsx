import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info } from 'lucide-react';

const CLASS_CONFIG = {
  GradeA: {
    label: 'Grade A',
    subtitle: 'Healthy, firm & export-ready produce',
    barColor: 'bg-emerald-600',
    textColor: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    icon: CheckCircle2
  },
  Rotten: {
    label: 'Rotten',
    subtitle: 'Black mold, wet neck rot or fungal decay',
    barColor: 'bg-rose-600',
    textColor: 'text-rose-700',
    bgColor: 'bg-rose-50',
    borderColor: 'border-rose-200',
    icon: XCircle
  },
  Sprouted: {
    label: 'Sprouted',
    subtitle: 'Internal vegetative sprout / green shoot',
    barColor: 'bg-amber-600',
    textColor: 'text-amber-700',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    icon: AlertTriangle
  },
  Undersized: {
    label: 'Undersized',
    subtitle: 'Below standard diameter (< 45mm)',
    barColor: 'bg-indigo-600',
    textColor: 'text-indigo-700',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
    icon: Info
  }
};

export default function PredictionBars({ prediction, compact = false }) {
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
      {/* Grade A vs URS Summary Banner */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3.5 rounded-2xl bg-emerald-50 border-2 border-emerald-200 text-left">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
              Grade A Share
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          </div>
          <div className="mt-1 text-2xl sm:text-3xl font-extrabold text-emerald-900 tracking-tight">
            {gradeAPercent}%
          </div>
          <p className="text-[11px] font-medium text-emerald-700 mt-0.5">
            Target: &gt;= 60%
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-stone-100 border-2 border-stone-300 text-left">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-700">
              Total URS Defect
            </span>
            <span className="text-[10px] font-bold text-stone-500 bg-stone-200 px-1.5 py-0.5 rounded">
              Sum
            </span>
          </div>
          <div className="mt-1 text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            {ursPercent}%
          </div>
          <p className="text-[11px] font-medium text-stone-600 mt-0.5">
            Rotten + Sprout + Small
          </p>
        </div>
      </div>

      {/* 4-Class Breakdown Bars */}
      <div className="space-y-2.5">
        {rawClasses.map(item => {
          const cfg = CLASS_CONFIG[item.className] || CLASS_CONFIG.GradeA;
          const Icon = cfg.icon;
          const isDominant = prediction.topClass === item.className;

          return (
            <div
              key={item.className}
              className={`p-3 rounded-xl border transition-all ${
                isDominant
                  ? `${cfg.bgColor} ${cfg.borderColor} shadow-xs ring-1 ring-emerald-500/20`
                  : 'bg-white border-stone-200'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <Icon className={`w-4 h-4 ${cfg.textColor}`} />
                  <div>
                    <span className="text-sm font-bold text-stone-900">
                      {cfg.label}
                    </span>
                    {!compact && (
                      <span className="hidden sm:inline-block ml-2 text-[11px] text-stone-500 font-medium">
                        • {cfg.subtitle}
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-right flex items-center gap-2">
                  {isDominant && (
                    <span className={`text-[10px] uppercase font-extrabold px-1.5 py-0.5 rounded ${cfg.bgColor} ${cfg.textColor} border ${cfg.borderColor}`}>
                      Top
                    </span>
                  )}
                  <span className={`text-base font-extrabold ${cfg.textColor}`}>
                    {item.percentage}%
                  </span>
                </div>
              </div>

              {/* Visual Progress Meter */}
              <div className="w-full bg-stone-100 rounded-full h-3 overflow-hidden p-0.5 border border-stone-200/80">
                <div
                  className={`h-full rounded-full transition-all duration-500 ease-out ${cfg.barColor}`}
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
