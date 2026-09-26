import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchReports } from '../services/api';
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
  Sparkles
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
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8 space-y-6 sm:space-y-8 animate-fadeIn">
      
      {/* Centre Status Header (High Outdoor Contrast) */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border-2 border-stone-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 border border-emerald-300">
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-emerald-900 bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-300">
              Active Procurement Gate
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-stone-950 mt-1">
              {activeCentre?.name || "Nashik APMC Main Yard"}
            </h2>
            <p className="text-xs text-stone-700 font-bold">
              Operator: <span className="text-black">{user?.farmerName || user?.name || "Gate Officer"}</span> • {user?.phone || 'N/A'}
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-3 bg-stone-100 px-4 py-2.5 rounded-2xl border-2 border-stone-300">
          <TrendingUp className="w-5 h-5 text-emerald-700" />
          <div className="text-right">
            <span className="text-xs font-black text-stone-700 block">{t.gradeARate}</span>
            <span className="text-xl font-black text-emerald-900 font-mono">{gradeAPercent}%</span>
          </div>
        </div>
      </div>

      {/* CORE ACTION: ONE GIANT BUTTON FOR QUICK SCAN */}
      <div className="relative group">
        <button
          onClick={() => setView('scan')}
          className="relative w-full bg-emerald-700 hover:bg-emerald-800 active:scale-99 text-white rounded-3xl p-6 sm:p-10 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6 transition-all text-left cursor-pointer border-3 border-emerald-500 min-h-[140px]"
          aria-label="Scan Onions and Check Quality"
        >
          <div className="flex items-center gap-5 sm:gap-6">
            <div className="w-18 h-18 sm:w-22 sm:h-22 rounded-3xl bg-white/20 flex items-center justify-center text-white shrink-0 group-hover:scale-105 transition-transform">
              <Camera className="w-10 h-10 sm:w-12 sm:h-12" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-black tracking-wide uppercase mb-2">
                <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
                Continuous Burst Mode Active
              </div>
              <h3 className="text-2xl sm:text-4xl font-black tracking-tight text-white drop-shadow-xs">
                {t.scanOnionsBtn}
              </h3>
              <p className="text-emerald-100 text-xs sm:text-sm mt-1 font-bold max-w-md">
                {t.scanSubtitle}
              </p>
            </div>
          </div>

          <div className="w-full sm:w-auto px-8 py-4 bg-white text-emerald-900 font-black rounded-2xl text-base sm:text-lg flex items-center justify-center gap-3 shadow-lg group-hover:bg-emerald-50 shrink-0 min-h-[56px]">
            <span>{t.startScan}</span>
            <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>
      </div>

      {/* RECENT SCAN HISTORY */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border-2 border-stone-300 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b-2 border-stone-200">
          <div className="flex items-center gap-2.5">
            <History className="w-5 h-5 text-emerald-700" />
            <h3 className="text-lg font-black text-stone-950">
              {t.recentScans} (Last 5)
            </h3>
          </div>
          <button
            onClick={() => setView('history')}
            className="text-xs font-black text-emerald-800 hover:text-emerald-950 hover:underline flex items-center gap-1 p-2 min-h-[44px]"
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
              className="px-5 py-2.5 bg-emerald-700 text-white rounded-xl text-xs font-black"
            >
              Scan Your First Onion Batch
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
                  className="group p-4 rounded-2xl border-2 border-stone-300 hover:border-emerald-700 hover:shadow-md transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 cursor-pointer bg-stone-50 hover:bg-white"
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
                      <div className="flex items-center gap-2 sm:justify-end">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider ${
                          isGradeA ? 'bg-emerald-200 text-emerald-950' : 'bg-rose-200 text-rose-950'
                        }`}>
                          {report.verdict}
                        </span>
                      </div>
                      <div className="text-xs font-bold text-stone-800 mt-1">
                        Grade A: <span className="text-emerald-800 font-black">{report.gradeAPercent}%</span> | URS: <span className="text-rose-800 font-black">{report.ursPercent}%</span>
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
