import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchReports } from '../services/api';
import { generateReportPDF } from '../services/pdfGenerator';
import { 
  ScanLine, 
  History, 
  MapPin, 
  FileText, 
  ChevronRight, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp, 
  Camera, 
  Calendar,
  Sparkles,
  Printer,
  Layers,
  ArrowRight
} from 'lucide-react';

export default function DashboardPage({ setView, onViewReport }) {
  const { user, activeCentre, t } = useAuth();
  const [recentReports, setRecentReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRecent() {
      try {
        const reports = await fetchReports({ limit: 5 });
        setRecentReports(reports || []);
      } catch (err) {
        console.error("Failed to load dashboard reports:", err);
      } finally {
        setLoading(false);
      }
    }
    loadRecent();
  }, []);

  const totalScans = recentReports.length;
  const gradeACount = recentReports.filter(r => r.verdict === 'Grade A').length;
  const gradeAPercent = totalScans > 0 ? Math.round((gradeACount / totalScans) * 100) : 0;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 sm:py-8 space-y-6 sm:space-y-8 animate-fadeIn">
      
      {/* Mandi Gate Desk Banner (Warm Harvest & Pine Palette) */}
      <div className="bg-gradient-to-r from-[#0d3b32] to-[#12493e] text-white rounded-3xl p-6 sm:p-7 shadow-lg border-2 border-[#165a4c] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-400 text-stone-950 flex items-center justify-center shrink-0 shadow-md font-black text-2xl">
            🧅
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-[11px] font-black uppercase tracking-wider text-amber-300">
                Gate Inspection Terminal • Ready
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white mt-0.5">
              {activeCentre?.name}
            </h2>
            <p className="text-xs text-emerald-100 font-bold mt-0.5">
              Officer On Duty: <strong className="text-white">{user?.name}</strong> • Immediate lot evaluation
            </p>
          </div>
        </div>

        {/* Quick Rate Metric Box */}
        <div className="flex items-center gap-3 bg-[#082923] px-4 py-3 rounded-2xl border border-emerald-500/30">
          <TrendingUp className="w-5 h-5 text-amber-400" />
          <div className="text-right">
            <span className="text-[10px] font-black uppercase text-emerald-200 block">{t.gradeARate}</span>
            <span className="text-xl font-black text-amber-300 font-mono">{gradeAPercent}%</span>
          </div>
        </div>
      </div>

      {/* CORE ACTION CARDS (Friendly, tactile, instant access) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Main Card: Instant 5-Shot Burst Scan */}
        <div className="md:col-span-2 relative group">
          <button
            onClick={() => setView('scan')}
            className="w-full h-full bg-gradient-to-br from-[#0d3b32] via-[#10483d] to-[#145649] hover:from-[#0a312a] hover:to-[#0f443a] text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col justify-between transition-all text-left cursor-pointer border-3 border-amber-400/60 min-h-[220px]"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-amber-400 text-stone-950 flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-transform">
                  <Camera className="w-9 h-9" />
                </div>
                <div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-black uppercase tracking-wider mb-1 border border-amber-400/40">
                    <Sparkles className="w-3.5 h-3.5" />
                    Zero Wait • Sub-10s Burst
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-black text-white">
                    {t.scanOnionsBtn}
                  </h3>
                  <p className="text-emerald-100 text-xs sm:text-sm mt-1 font-bold max-w-md">
                    Point camera at farmer's tray $\to$ snap 5 photos $\to$ instant Grade A vs URS calculation.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between pt-4 border-t border-emerald-600/40">
              <span className="text-xs text-amber-200 font-bold">
                Mandi Gate Speed: 25 seconds per trolley
              </span>
              <div className="px-5 py-2.5 bg-amber-400 text-stone-950 font-black rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-md group-hover:bg-amber-300">
                <span>{t.startScan}</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          </button>
        </div>

        {/* Secondary Card: Demo / Past Audits */}
        <div className="flex flex-col gap-4">
          <button
            onClick={() => setView('scan')}
            className="flex-1 bg-white hover:bg-stone-50 text-stone-900 rounded-3xl p-5 border-2 border-[#e6dfd1] shadow-md flex flex-col justify-between transition-all text-left cursor-pointer"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center mb-2 font-black">
                <Sparkles className="w-5 h-5 text-amber-700" />
              </div>
              <h4 className="text-base font-black text-stone-900">
                Demo Onion Specimens
              </h4>
              <p className="text-xs text-stone-600 font-bold mt-1">
                Load 5-sample mixed lot to demo without physical onions.
              </p>
            </div>
            <div className="mt-3 flex items-center gap-1.5 text-xs font-black text-amber-700">
              <span>Open Presets</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </button>

          <button
            onClick={() => setView('history')}
            className="flex-1 bg-white hover:bg-stone-50 text-stone-900 rounded-3xl p-5 border-2 border-[#e6dfd1] shadow-md flex flex-col justify-between transition-all text-left cursor-pointer"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-2 font-black">
                <History className="w-5 h-5 text-emerald-700" />
              </div>
              <h4 className="text-base font-black text-stone-900">
                Print Past Slips
              </h4>
              <p className="text-xs text-stone-600 font-bold mt-1">
                Search previous batches by farmer name or token ID.
              </p>
            </div>
            <div className="mt-3 flex items-center gap-1.5 text-xs font-black text-emerald-800">
              <span>View History</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </button>
        </div>

      </div>

      {/* RECENT MANDI SLIPS (FEED) */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-md border-2 border-[#e6dfd1] space-y-4">
        <div className="flex items-center justify-between pb-3 border-b-2 border-stone-200">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-black">
              <History className="w-4 h-4" />
            </div>
            <h3 className="text-lg font-black text-stone-950">
              {t.recentScans} (Last 5)
            </h3>
          </div>
          <button
            onClick={() => setView('history')}
            className="text-xs font-black text-emerald-800 hover:text-emerald-950 hover:underline flex items-center gap-1 p-2"
          >
            <span>{t.viewAll}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-center text-stone-600 font-bold text-sm">
            Loading recent mandi assessments...
          </div>
        ) : recentReports.length === 0 ? (
          <div className="py-12 text-center text-stone-600 space-y-3">
            <FileText className="w-10 h-10 mx-auto text-stone-400" />
            <p className="font-bold text-sm">No quality scans recorded yet.</p>
            <button
              onClick={() => setView('scan')}
              className="px-5 py-2.5 bg-[#0d3b32] text-white rounded-xl text-xs font-black"
            >
              Scan First Trolley
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {recentReports.map((report) => {
              const isGradeA = report.verdict === 'Grade A';
              return (
                <div
                  key={report.id}
                  onClick={() => onViewReport(report)}
                  className="group p-4 rounded-2xl border-2 border-stone-300 hover:border-emerald-700 hover:shadow-md transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 cursor-pointer bg-[#fcfbf9] hover:bg-white"
                >
                  <div className="flex items-center gap-3.5">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-black text-sm shrink-0 border ${
                      isGradeA ? 'bg-emerald-100 text-emerald-950 border-emerald-400' : 'bg-rose-100 text-rose-950 border-rose-400'
                    }`}>
                      {isGradeA ? (
                        <CheckCircle2 className="w-6 h-6 text-emerald-700" />
                      ) : (
                        <AlertTriangle className="w-6 h-6 text-rose-700" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-black text-stone-950">
                          {report.id}
                        </span>
                        <span className="text-xs text-stone-400">•</span>
                        <span className="text-xs font-bold text-stone-700">
                          {report.batchNumber || "LOT-01"}
                        </span>
                      </div>
                      <h4 className="text-sm font-black text-stone-950 group-hover:text-emerald-800 transition-colors">
                        {report.farmerName || "Grower"} • {report.centreName}
                      </h4>
                      <p className="text-[11px] text-stone-600 font-bold flex items-center gap-2 mt-0.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(report.timestamp).toLocaleString(undefined, { 
                          month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                        })}
                        <span>•</span>
                        <span>{report.sampleCount || 1} {t.samples}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-200">
                    <div className="text-left sm:text-right">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider ${
                        isGradeA ? 'bg-emerald-200 text-emerald-950' : 'bg-rose-200 text-rose-950'
                      }`}>
                        {report.verdict}
                      </span>
                      <div className="text-xs font-bold text-stone-800 mt-1">
                        Grade A: <span className="text-emerald-800 font-black font-mono">{report.gradeAPercent}%</span> | URS: <span className="text-rose-800 font-black font-mono">{report.ursPercent}%</span>
                      </div>
                    </div>

                    <ChevronRight className="w-5 h-5 text-stone-500 group-hover:text-emerald-700 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
