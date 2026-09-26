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
  Layers, 
  TrendingUp, 
  Camera, 
  Calendar,
  Sparkles
} from 'lucide-react';

export default function DashboardPage({ setView, onViewReport }) {
  const { user, activeCentre } = useAuth();
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
      
      {/* Centre Status Header */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-stone-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              Active Procurement Gate
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-stone-900 mt-1">
              {activeCentre?.name || "Nashik APMC Main Yard"}
            </h2>
            <p className="text-xs text-stone-500 font-medium">
              Operator: <span className="text-stone-800 font-bold">{user?.farmerName || user?.name || "Centre Inspector"}</span> • Phone: {user?.phone || 'N/A'}
            </p>
          </div>
        </div>

        {/* Quick Rate Badge */}
        <div className="hidden sm:flex items-center gap-3 bg-stone-50 px-4 py-2.5 rounded-2xl border border-stone-200">
          <TrendingUp className="w-5 h-5 text-emerald-600" />
          <div className="text-right">
            <span className="text-xs font-bold text-stone-500 block">Recent Grade A Rate</span>
            <span className="text-lg font-black text-emerald-700">{gradeAPercent}%</span>
          </div>
        </div>
      </div>

      {/* CORE ACTION: ONE BIG CLEAR BUTTON (As specified in requirement B) */}
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-emerald-600 to-green-500 rounded-4xl blur-md opacity-40 group-hover:opacity-75 transition duration-300"></div>
        
        <button
          onClick={() => setView('scan')}
          className="relative w-full bg-gradient-to-br from-emerald-600 via-emerald-700 to-green-800 hover:from-emerald-500 hover:to-green-700 active:scale-99 text-white rounded-3xl p-6 sm:p-10 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6 transition-all text-left cursor-pointer border border-emerald-400/30"
          aria-label="Scan Onions and Check Quality"
        >
          <div className="flex items-center gap-5 sm:gap-6">
            <div className="w-18 h-18 sm:w-22 sm:h-22 rounded-3xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shrink-0 shadow-inner group-hover:scale-105 transition-transform">
              <Camera className="w-9 h-9 sm:w-11 sm:h-11" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-black tracking-wide uppercase mb-2">
                <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
                AI Vision Model Active
              </div>
              <h3 className="text-2xl sm:text-4xl font-black tracking-tight text-white drop-shadow-xs">
                Check Onion Quality
              </h3>
              <p className="text-emerald-100 text-sm sm:text-base mt-1 font-medium max-w-md">
                Scan batch samples using camera or upload photos for instant AI Grade A vs URS grading.
              </p>
            </div>
          </div>

          <div className="w-full sm:w-auto px-6 py-4 bg-white text-emerald-800 font-black rounded-2xl text-base sm:text-lg flex items-center justify-center gap-3 shadow-lg group-hover:bg-emerald-50 shrink-0">
            <span>Start Scan</span>
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>
      </div>

      {/* RECENT SCAN HISTORY (LAST 5 REPORTS) */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-stone-200 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div className="flex items-center gap-2.5">
            <History className="w-5 h-5 text-emerald-600" />
            <h3 className="text-lg font-black text-stone-900">
              Recent Scan History (Last 5)
            </h3>
          </div>
          <button
            onClick={() => setView('history')}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline flex items-center gap-1"
          >
            <span>View All Reports</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-center text-stone-400 font-semibold text-sm">
            Loading recent mandi assessments...
          </div>
        ) : recentReports.length === 0 ? (
          <div className="py-12 text-center text-stone-500 space-y-3">
            <FileText className="w-10 h-10 mx-auto text-stone-300" />
            <p className="font-semibold text-sm">No quality scans recorded yet.</p>
            <button
              onClick={() => setView('scan')}
              className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold"
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
                  className="group p-4 rounded-2xl border border-stone-200 hover:border-emerald-500 hover:shadow-md transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 cursor-pointer bg-stone-50/50 hover:bg-white"
                >
                  <div className="flex items-center gap-3.5">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0 ${
                      isGradeA ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {isGradeA ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        <AlertTriangle className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-stone-800">
                          {report.id}
                        </span>
                        <span className="text-xs text-stone-400">•</span>
                        <span className="text-xs font-semibold text-stone-600">
                          {report.batchNumber || "LOT-01"}
                        </span>
                      </div>
                      <h4 className="text-sm font-extrabold text-stone-900 group-hover:text-emerald-700 transition-colors">
                        {report.farmerName || "Grower"} • {report.centreName}
                      </h4>
                      <p className="text-[11px] text-stone-500 flex items-center gap-2 mt-0.5">
                        <Calendar className="w-3 h-3" />
                        {new Date(report.timestamp).toLocaleString(undefined, { 
                          month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                        })}
                        <span>•</span>
                        <span>{report.sampleCount || 1} image sample(s)</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-200">
                    <div className="text-left sm:text-right">
                      <div className="flex items-center gap-2 sm:justify-end">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold uppercase tracking-wider ${
                          isGradeA ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {report.verdict}
                        </span>
                      </div>
                      <div className="text-xs font-bold text-stone-700 mt-1">
                        Grade A: <span className="text-emerald-700 font-extrabold">{report.gradeAPercent}%</span> | URS: <span className="text-rose-700 font-extrabold">{report.ursPercent}%</span>
                      </div>
                    </div>

                    <ChevronRight className="w-5 h-5 text-stone-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Information card on transparency */}
      <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-amber-900 text-xs sm:text-sm flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Why AstraGrade?</span> Onion grading at procurement centres is often questioned by farmers due to manual bias. With AstraGrade, every batch is graded by the pre-trained Google Teachable Machine model with instant digital PDF receipt generation.
        </div>
      </div>

    </div>
  );
}
