import React, { useState, useEffect } from 'react';
import { fetchAdminStats, fetchReports } from '../services/api';
import { generateReportPDF } from '../services/pdfGenerator';
import { 
  ShieldCheck, 
  TrendingUp, 
  AlertTriangle, 
  Building2, 
  Calendar, 
  Filter, 
  Download, 
  Eye, 
  CheckCircle2, 
  Activity, 
  Layers,
  ArrowRight
} from 'lucide-react';

export default function AdminDashboardPage({ onViewReport, setView }) {
  const [stats, setStats] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCentre, setSelectedCentre] = useState('ALL');

  useEffect(() => {
    async function loadData() {
      try {
        const [statsData, reportsData] = await Promise.all([
          fetchAdminStats(),
          fetchReports()
        ]);
        setStats(statsData);
        setReports(reportsData || []);
      } catch (err) {
        console.error("Failed to load admin metrics:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredReports = reports.filter(r => {
    if (selectedCentre === 'ALL') return true;
    return r.centreName === selectedCentre || r.centreCode === selectedCentre;
  });

  const flaggedCentres = stats?.centrePerformance?.filter(c => c.flagged) || [];

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8 space-y-6 sm:space-y-8 animate-fadeIn">
      
      {/* Header */}
      <div className="bg-stone-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold mb-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Central Mandi Oversight & Quality Audit
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            State Procurement Quality Dashboard
          </h2>
          <p className="text-xs sm:text-sm text-stone-400 max-w-xl mt-1">
            Real-time multi-centre monitoring. Prevents local grading malpractice and standardizes onion procurement payouts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setView('scan')}
            className="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs sm:text-sm shadow-lg transition-all cursor-pointer"
          >
            Launch Inspector Scanner
          </button>
        </div>
      </div>

      {/* OVERVIEW STATS CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Batches</span>
            <Layers className="w-4 h-4 text-stone-400" />
          </div>
          <div className="text-3xl font-black text-stone-900">
            {stats?.totalBatches || reports.length}
          </div>
          <span className="text-[11px] text-emerald-700 font-bold mt-1 block">
            Across 6 Regional Mandis
          </span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Avg Grade A %</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-black text-emerald-700">
            {stats?.avgGradeAPercent || 62.4}%
          </div>
          <span className="text-[11px] text-stone-500 font-medium mt-1 block">
            Target benchmark: &gt;= 60%
          </span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Approved Batches</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-black text-stone-900">
            {stats?.gradeACount || 0}
          </div>
          <span className="text-[11px] text-stone-500 font-medium mt-1 block">
            Passed as Grade A
          </span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Flagged Centres</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-3xl font-black text-rose-600">
            {flaggedCentres.length}
          </div>
          <span className="text-[11px] text-rose-700 font-bold mt-1 block">
            Unusual rejection anomalies
          </span>
        </div>

      </div>

      {/* FLAGGED CENTRES ALERT BANNER */}
      {flaggedCentres.length > 0 && (
        <div className="p-5 rounded-3xl bg-rose-50 border-2 border-rose-300 text-rose-950 space-y-3">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            <h4 className="text-sm font-black uppercase tracking-wider text-rose-900">
              Oversight Alert: {flaggedCentres.length} Centre(s) Require Calibration / Audit
            </h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {flaggedCentres.map((c, i) => (
              <div key={i} className="bg-white/80 p-3.5 rounded-2xl border border-rose-200 text-xs flex items-center justify-between">
                <div>
                  <span className="font-extrabold text-stone-900 block">{c.name}</span>
                  <span className="text-stone-500">
                    Batches: {c.totalBatches} • Avg Grade A: <strong className="text-rose-600">{c.avgGradeA}%</strong>
                  </span>
                </div>
                <span className="px-2 py-1 bg-rose-100 text-rose-800 rounded-lg font-bold text-[10px] uppercase">
                  Flagged (Low Grade A)
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CENTRE PERFORMANCE COMPARISON TABLE */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-emerald-600" />
            <h3 className="text-base font-black text-stone-900">
              Procurement Centre Consistency Breakdown
            </h3>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-stone-50 text-stone-600 font-extrabold uppercase text-[10px]">
              <tr>
                <th className="p-3">Centre Name</th>
                <th className="p-3 text-center">Batches</th>
                <th className="p-3 text-center">Avg Grade A %</th>
                <th className="p-3 text-center">Approved Grade A</th>
                <th className="p-3 text-center">URS Lots</th>
                <th className="p-3 text-right">Audit Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-semibold text-stone-800">
              {(stats?.centrePerformance || [
                { name: "Nashik APMC Main Yard", totalBatches: 2, avgGradeA: 80.5, gradeACount: 2, ursCount: 0, flagged: false },
                { name: "Lasalgaon Procurement Hub", totalBatches: 1, avgGradeA: 42.0, gradeACount: 0, ursCount: 1, flagged: true },
                { name: "Pimpalgaon Baswant Centre", totalBatches: 1, avgGradeA: 65.4, gradeACount: 1, ursCount: 0, flagged: false },
                { name: "Yeola Sub-Centre", totalBatches: 1, avgGradeA: 31.8, gradeACount: 0, ursCount: 1, flagged: true }
              ]).map((c, i) => (
                <tr key={i} className="hover:bg-stone-50">
                  <td className="p-3 font-bold text-stone-900">{c.name}</td>
                  <td className="p-3 text-center font-mono">{c.totalBatches}</td>
                  <td className="p-3 text-center font-extrabold text-stone-900">{c.avgGradeA}%</td>
                  <td className="p-3 text-center text-emerald-700 font-bold">{c.gradeACount}</td>
                  <td className="p-3 text-center text-rose-700 font-bold">{c.ursCount}</td>
                  <td className="p-3 text-right">
                    {c.flagged ? (
                      <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 font-extrabold text-[10px] uppercase">
                        Review Needed
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-[10px] uppercase">
                        Consistent
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ALL BATCH REPORTS LOG */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
          <div>
            <h3 className="text-base font-black text-stone-900">
              Central Batch Ingestion Log
            </h3>
            <p className="text-xs text-stone-500">Live feed of all digital quality slips generated by field officers.</p>
          </div>

          {/* Filter dropdown */}
          <select
            value={selectedCentre}
            onChange={(e) => setSelectedCentre(e.target.value)}
            className="text-xs font-bold px-3 py-2 bg-stone-50 rounded-xl border border-stone-200"
          >
            <option value="ALL">All Centres ({reports.length})</option>
            {stats?.centrePerformance?.map(c => (
              <option key={c.name} value={c.name}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="divide-y divide-stone-100">
          {filteredReports.map((report) => (
            <div
              key={report.id}
              onClick={() => onViewReport(report)}
              className="py-3 flex items-center justify-between hover:bg-stone-50 px-2 rounded-xl transition-colors cursor-pointer text-xs"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-stone-800">{report.id}</span>
                  <span className="text-stone-400">•</span>
                  <span className="font-bold text-stone-900">{report.farmerName}</span>
                </div>
                <div className="text-stone-500 mt-0.5">
                  {report.centreName} • {new Date(report.timestamp).toLocaleDateString()}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className={`px-2 py-0.5 rounded-md font-extrabold text-[10px] uppercase ${
                  report.verdict === 'Grade A' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                }`}>
                  {report.verdict} ({report.gradeAPercent}%)
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    generateReportPDF(report);
                  }}
                  className="p-1.5 text-stone-400 hover:text-emerald-700 hover:bg-stone-100 rounded-lg"
                  title="Export PDF"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
