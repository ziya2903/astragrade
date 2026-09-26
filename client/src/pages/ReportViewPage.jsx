import React, { useState } from 'react';
import { generateReportPDF } from '../services/pdfGenerator';
import BatchSummaryChart from '../components/BatchSummaryChart';
import { 
  Download, 
  CheckCircle2, 
  AlertTriangle, 
  MapPin, 
  Calendar, 
  User, 
  Hash, 
  ArrowLeft, 
  Printer, 
  Share2, 
  ShieldCheck, 
  ScanLine,
  Layers
} from 'lucide-react';

export default function ReportViewPage({ report, setView, onNewScan }) {
  const [downloading, setDownloading] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  if (!report) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-4">
        <p className="text-stone-500 font-bold">No report selected.</p>
        <button
          onClick={() => setView('dashboard')}
          className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-bold"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const isGradeA = report.verdict === 'Grade A';

  const handleDownloadPDF = () => {
    setDownloading(true);
    try {
      generateReportPDF(report);
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert("Failed to export PDF: " + err.message);
    } finally {
      setDownloading(false);
    }
  };

  const handleCopySlip = () => {
    const text = `AstraGrade Assessment Slip
ID: ${report.id}
Centre: ${report.centreName}
Farmer: ${report.farmerName}
Batch: ${report.batchNumber}
Grade A: ${report.gradeAPercent}% | URS: ${report.ursPercent}%
Verdict: ${report.verdict}
Date: ${new Date(report.timestamp).toLocaleString()}`;

    navigator.clipboard.writeText(text);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8 space-y-6 animate-fadeIn">
      
      {/* Top Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={() => setView('dashboard')}
          className="px-3.5 py-2 rounded-xl bg-white hover:bg-stone-100 border border-stone-200 text-xs font-bold text-stone-700 flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Dashboard</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopySlip}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-stone-100 border border-stone-200 text-xs font-bold text-stone-700 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Share2 className="w-4 h-4 text-stone-500" />
            <span>{copySuccess ? 'Copied Details!' : 'Share Slip'}</span>
          </button>

          <button
            onClick={handleDownloadPDF}
            disabled={downloading}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white text-xs sm:text-sm font-extrabold flex items-center gap-2 shadow-md shadow-emerald-700/20 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>{downloading ? 'Preparing PDF...' : 'Download Official PDF'}</span>
          </button>
        </div>
      </div>

      {/* Main Digital Report Sheet (Styled as official certificate) */}
      <div className="bg-white rounded-3xl border-2 border-stone-200 shadow-xl overflow-hidden">
        
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-emerald-700 via-green-700 to-emerald-800 text-white p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">🧅</span>
              <span className="text-2xl font-black tracking-tight">AstraGrade</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-white/20 uppercase tracking-widest text-emerald-100">
                Official Certificate
              </span>
            </div>
            <p className="text-xs sm:text-sm text-emerald-100/90 font-medium">
              Transparent Mandi Quality Assessment • Team KisanAstra
            </p>
          </div>

          <div className="text-left sm:text-right bg-black/15 px-4 py-2.5 rounded-2xl border border-white/10 backdrop-blur-xs">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-200 block">
              Assessment ID
            </span>
            <span className="text-sm sm:text-base font-mono font-black text-white">
              {report.id}
            </span>
          </div>
        </div>

        {/* Verification & Metadata Sub-header */}
        <div className="p-6 bg-stone-50 border-b border-stone-200 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="font-bold text-stone-500 uppercase tracking-wider block text-[10px]">
              Procurement Centre
            </span>
            <span className="font-extrabold text-stone-800 text-sm mt-0.5 block">
              {report.centreName}
            </span>
            <span className="text-[11px] text-stone-500 font-mono">Code: {report.centreCode || "NSK-01"}</span>
          </div>

          <div>
            <span className="font-bold text-stone-500 uppercase tracking-wider block text-[10px]">
              Farmer / Lot Owner
            </span>
            <span className="font-extrabold text-stone-800 text-sm mt-0.5 block">
              {report.farmerName}
            </span>
            <span className="text-[11px] text-stone-500 font-mono">Ph: {report.farmerPhone || "N/A"}</span>
          </div>

          <div>
            <span className="font-bold text-stone-500 uppercase tracking-wider block text-[10px]">
              Batch / Lot Number
            </span>
            <span className="font-extrabold text-stone-800 text-sm mt-0.5 block font-mono">
              {report.batchNumber}
            </span>
            <span className="text-[11px] text-stone-500">{report.sampleCount || 1} image sample(s)</span>
          </div>

          <div>
            <span className="font-bold text-stone-500 uppercase tracking-wider block text-[10px]">
              Timestamp
            </span>
            <span className="font-extrabold text-stone-800 text-sm mt-0.5 block">
              {new Date(report.timestamp).toLocaleDateString(undefined, { 
                day: 'numeric', month: 'short', year: 'numeric' 
              })}
            </span>
            <span className="text-[11px] text-stone-500">
              {new Date(report.timestamp).toLocaleTimeString(undefined, { 
                hour: '2-digit', minute: '2-digit' 
              })}
            </span>
          </div>
        </div>

        {/* VERDICT HERO BANNER */}
        <div className="p-6 sm:p-8">
          <div className={`p-6 rounded-3xl border-2 flex flex-col sm:flex-row items-center justify-between gap-6 ${
            isGradeA 
              ? 'bg-emerald-50/80 border-emerald-500 text-emerald-950'
              : 'bg-rose-50/80 border-rose-500 text-rose-950'
          }`}>
            <div className="flex items-center gap-4 text-center sm:text-left">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 ${
                isGradeA ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
              }`}>
                {isGradeA ? (
                  <CheckCircle2 className="w-10 h-10" />
                ) : (
                  <AlertTriangle className="w-10 h-10" />
                )}
              </div>
              <div>
                <span className="text-xs font-black uppercase tracking-widest opacity-80">
                  Official Mandi Grading Verdict
                </span>
                <h3 className="text-2xl sm:text-3xl font-black mt-0.5">
                  {isGradeA ? 'Grade A Batch (Approved)' : 'URS Category (Under-Grade)'}
                </h3>
                <p className="text-xs sm:text-sm font-medium mt-1 opacity-90 max-w-xl">
                  {report.verdictMessage}
                </p>
              </div>
            </div>

            {/* Overall Score Dial */}
            <div className="text-center sm:text-right shrink-0 bg-white/80 backdrop-blur-xs px-6 py-4 rounded-2xl border border-stone-200">
              <span className="text-[10px] font-black uppercase tracking-wider text-stone-500 block">
                Grade A Confidence
              </span>
              <span className={`text-4xl font-black tracking-tight ${
                isGradeA ? 'text-emerald-700' : 'text-rose-700'
              }`}>
                {report.gradeAPercent}%
              </span>
              <span className="text-xs font-bold text-stone-600 block mt-0.5">
                URS Defect: <span className="font-extrabold text-stone-900">{report.ursPercent}%</span>
              </span>
            </div>
          </div>

          {/* Breakdown Table & Doughnut Chart */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            
            {/* Table */}
            <div>
              <h4 className="text-sm font-black text-stone-900 uppercase tracking-wider mb-3">
                Class Breakdown Matrix
              </h4>

              <div className="overflow-hidden border border-stone-200 rounded-2xl">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-stone-100 text-stone-700 font-extrabold uppercase text-[10px]">
                    <tr>
                      <th className="p-3">Parameter</th>
                      <th className="p-3 text-right">Confidence</th>
                      <th className="p-3 text-right">Standard</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200 font-semibold text-stone-800">
                    <tr className="bg-emerald-50/60 font-bold">
                      <td className="p-3 flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                        Grade A (Healthy)
                      </td>
                      <td className="p-3 text-right text-emerald-800 font-extrabold">
                        {report.gradeAPercent}%
                      </td>
                      <td className="p-3 text-right text-stone-500 text-xs">&gt;= 60%</td>
                    </tr>
                    <tr>
                      <td className="p-3 flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-600"></span>
                        Rotten / Decayed
                      </td>
                      <td className="p-3 text-right text-rose-700 font-extrabold">
                        {report.breakdown?.rotten || 0}%
                      </td>
                      <td className="p-3 text-right text-stone-500 text-xs">&lt;= 10%</td>
                    </tr>
                    <tr>
                      <td className="p-3 flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-600"></span>
                        Sprouted / Emergent
                      </td>
                      <td className="p-3 text-right text-amber-700 font-extrabold">
                        {report.breakdown?.sprouted || 0}%
                      </td>
                      <td className="p-3 text-right text-stone-500 text-xs">&lt;= 15%</td>
                    </tr>
                    <tr>
                      <td className="p-3 flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
                        Undersized (&lt; 45mm)
                      </td>
                      <td className="p-3 text-right text-indigo-700 font-extrabold">
                        {report.breakdown?.undersized || 0}%
                      </td>
                      <td className="p-3 text-right text-stone-500 text-xs">&lt;= 15%</td>
                    </tr>
                    <tr className="bg-stone-100/80 font-extrabold">
                      <td className="p-3 text-stone-900">Total URS (Defects)</td>
                      <td className="p-3 text-right text-rose-800 font-black">
                        {report.ursPercent}%
                      </td>
                      <td className="p-3 text-right text-stone-600 text-xs">&lt;= 40%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Visual Doughnut Chart */}
            <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-stone-600 mb-2 text-center">
                Visual Quality Proportions
              </h4>
              <BatchSummaryChart breakdown={report.breakdown || {
                gradeA: report.gradeAPercent,
                rotten: 0,
                sprouted: 0,
                undersized: report.ursPercent
              }} />
            </div>

          </div>

          {/* Signatures & Transparency Box */}
          <div className="mt-8 p-4 rounded-2xl bg-stone-50 border border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-8 h-8 text-emerald-600 shrink-0" />
              <div>
                <h5 className="text-xs font-bold text-stone-900">
                  Cryptographically Recorded in Mandi Ledger
                </h5>
                <p className="text-[11px] text-stone-500">
                  Evaluated using Teachable Machine Model (bIzzGa24O). Verified by inspector: <span className="font-bold text-stone-800">{report.inspectorName}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={handleDownloadPDF}
                className="px-4 py-2 bg-stone-900 hover:bg-black text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save PDF</span>
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* Bottom CTA: Scan Another Batch */}
      <div className="flex justify-center pt-2">
        <button
          onClick={onNewScan}
          className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-base rounded-2xl shadow-lg shadow-emerald-700/25 flex items-center gap-3 cursor-pointer"
        >
          <ScanLine className="w-5 h-5" />
          <span>Scan Another Batch</span>
        </button>
      </div>

    </div>
  );
}
