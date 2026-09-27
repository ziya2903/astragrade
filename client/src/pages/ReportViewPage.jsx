import React, { useState } from 'react';
import { generateReportPDF } from '../services/pdfGenerator';
import { deleteReport } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Download, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowLeft, 
  Printer, 
  Share2, 
  ShieldCheck, 
  ScanLine,
  Layers,
  Image as ImageIcon,
  Trash2
} from 'lucide-react';

export default function ReportViewPage({ report, setView, onNewScan }) {
  const { t } = useAuth();
  const [downloading, setDownloading] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [viewMode, setViewMode] = useState('certificate'); // 'certificate' | 'thermal'

  if (!report) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-4">
        <p className="text-stone-700 font-bold">No report selected.</p>
        <button
          onClick={() => setView('dashboard')}
          className="px-5 py-2.5 bg-[#0d3b32] text-white rounded-xl text-sm font-bold"
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
    } finally {
      setDownloading(false);
    }
  };

  const handlePrintThermal = () => {
    window.print();
  };

  const handleCopySlip = () => {
    const text = `AstraGrade Assessment Slip
ID: ${report.id}
Centre: ${report.centreName}
Farmer: ${report.farmerName}
Lot: ${report.batchNumber}
Grade A: ${report.gradeAPercent}% | URS: ${report.ursPercent}%
Verdict: ${report.verdict}
Date: ${new Date(report.timestamp).toLocaleString()}`;

    navigator.clipboard.writeText(text);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm(`Permanently delete grading report for ${report.farmerName || 'Lot'} (${report.id})?`);
    if (!confirmDelete) return;

    setIsDeleting(true);
    try {
      await deleteReport(report.id);
      setView('history');
    } catch (err) {
      console.error("Failed to delete report:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8 space-y-6 animate-fadeIn">
      
      {/* Top Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={() => setView('dashboard')}
          className="px-4 py-2.5 rounded-xl bg-white hover:bg-stone-100 border-2 border-stone-300 text-xs font-black text-stone-900 flex items-center gap-1.5 transition-colors cursor-pointer min-h-[44px]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Dashboard</span>
        </button>

        {/* View Mode Toggle: Official Certificate vs Thermal Mandi Slip */}
        <div className="flex items-center bg-stone-200 p-1 rounded-xl border border-stone-300 text-xs font-black">
          <button
            onClick={() => setViewMode('certificate')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              viewMode === 'certificate' ? 'bg-[#0d3b32] text-white shadow-xs' : 'text-stone-700 hover:text-black'
            }`}
          >
            Digital Certificate
          </button>
          <button
            onClick={() => setViewMode('thermal')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              viewMode === 'thermal' ? 'bg-amber-600 text-white shadow-xs' : 'text-stone-700 hover:text-black'
            }`}
          >
            Thermal Slip (80mm)
          </button>
        </div>

        <div className="flex items-center gap-2">
          {viewMode === 'thermal' ? (
            <button
              onClick={handlePrintThermal}
              className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs sm:text-sm font-black flex items-center gap-2 shadow-md transition-all cursor-pointer min-h-[44px]"
            >
              <Printer className="w-4 h-4" />
              <span>Print Slip</span>
            </button>
          ) : (
            <button
              onClick={handleDownloadPDF}
              disabled={downloading}
              className="px-5 py-2.5 rounded-xl bg-[#0d3b32] hover:bg-[#092c25] text-white text-xs sm:text-sm font-black flex items-center gap-2 shadow-md transition-all cursor-pointer min-h-[44px]"
            >
              <Download className="w-4 h-4 text-amber-300" />
              <span>{downloading ? 'Preparing PDF...' : t.downloadPdf}</span>
            </button>
          )}

          <button
            onClick={handleCopySlip}
            className="p-2.5 bg-white hover:bg-stone-100 border-2 border-stone-300 rounded-xl text-stone-700 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
            title="Copy Text Summary"
          >
            <Share2 className="w-4 h-4" />
          </button>

          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="p-2.5 bg-rose-50 hover:bg-rose-100 border-2 border-rose-200 text-rose-700 rounded-xl transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer disabled:opacity-50"
            title="Delete this Report"
          >
            <Trash2 className="w-4 h-4 text-rose-600" />
          </button>
        </div>
      </div>

      {/* 80mm MANDI THERMAL SLIP VIEW */}
      {viewMode === 'thermal' && (
        <div className="max-w-sm mx-auto bg-white p-6 rounded-2xl border-2 border-stone-400 font-mono text-xs shadow-xl space-y-3 print:border-none print:shadow-none print:p-0">
          <div className="text-center pb-2 border-b-2 border-dashed border-stone-400">
            <h3 className="text-lg font-black uppercase tracking-tight">ASTRA GRADE</h3>
            <p className="text-[10px] text-stone-600">APMC QUALITY ASSESSMENT SLIP</p>
            <p className="text-[10px] font-bold mt-1">{report.centreName}</p>
          </div>

          <div className="space-y-1 text-[11px] border-b-2 border-dashed border-stone-400 pb-2">
            <div className="flex justify-between">
              <span className="font-bold">SLIP ID:</span>
              <span className="font-black">{report.id}</span>
            </div>
            <div className="flex justify-between">
              <span>DATE/TIME:</span>
              <span>{new Date(report.timestamp).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>FARMER (किसान):</span>
              <span className="font-bold">{report.farmerName}</span>
            </div>
            <div className="flex justify-between">
              <span>VEHICLE/LOT (गाड़ी/लॉट):</span>
              <span className="font-bold">{report.batchNumber}</span>
            </div>
            <div className="flex justify-between">
              <span>SAMPLES:</span>
              <span>{report.sampleCount} Onions</span>
            </div>
          </div>

          <div className="py-2 border-b-2 border-dashed border-stone-400 space-y-1">
            <div className="flex justify-between font-bold">
              <span>GRADE A SHARE:</span>
              <span className="text-sm font-black">{report.gradeAPercent}%</span>
            </div>
            <div className="flex justify-between">
              <span>- Rotten:</span>
              <span>{report.breakdown?.rotten || 0}%</span>
            </div>
            <div className="flex justify-between">
              <span>- Sprouted:</span>
              <span>{report.breakdown?.sprouted || 0}%</span>
            </div>
            <div className="flex justify-between">
              <span>- Undersized:</span>
              <span>{report.breakdown?.undersized || 0}%</span>
            </div>
            <div className="flex justify-between font-bold pt-1 border-t border-dotted border-stone-300">
              <span>TOTAL URS DEFECT:</span>
              <span className="text-sm font-black">{report.ursPercent}%</span>
            </div>
          </div>

          <div className="text-center py-2 border-b-2 border-dashed border-stone-400">
            <span className="text-[10px] uppercase font-bold block">FINAL VERDICT</span>
            <span className={`text-base font-black uppercase px-2 py-0.5 rounded ${
              isGradeA ? 'bg-emerald-100 text-emerald-950' : 'bg-rose-100 text-rose-950'
            }`}>
              {report.verdict === 'Grade A' ? 'GRADE A APPROVED' : 'URS CATEGORY'}
            </span>
          </div>

          <div className="text-center pt-2 text-[9px] text-stone-500 space-y-1">
            <p>TAMPER-EVIDENT COMPUTER VISION VERIFICATION</p>
            <p>NO DISPUTES ACCEPTED WITHOUT THIS SLIP</p>
          </div>
        </div>
      )}

      {/* FULL DIGITAL CERTIFICATE VIEW */}
      {viewMode === 'certificate' && (
        <div className="bg-white rounded-3xl border-3 border-[#e6dfd1] shadow-xl overflow-hidden">
          
          {/* Header Ribbon */}
          <div className="bg-[#0d3b32] text-white p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">🧅</span>
                <span className="text-2xl font-black tracking-tight">AstraGrade</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-400 text-stone-950 uppercase tracking-widest">
                  Official Mandi Certificate
                </span>
              </div>
              <p className="text-xs sm:text-sm text-emerald-100 font-bold">
                {t.mandiSubtitle}
              </p>
            </div>

            <div className="text-left sm:text-right bg-black/20 px-4 py-2.5 rounded-2xl border border-white/20">
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-300 block">
                Certificate ID
              </span>
              <span className="text-sm sm:text-base font-mono font-black text-white">
                {report.id}
              </span>
            </div>
          </div>

          {/* Metadata Grid */}
          <div className="p-6 bg-stone-50 border-b-2 border-stone-200 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="font-black text-stone-500 uppercase tracking-wider block text-[10px]">
                Procurement Centre
              </span>
              <span className="font-black text-stone-950 text-sm mt-0.5 block">
                {report.centreName}
              </span>
            </div>

            <div>
              <span className="font-black text-stone-500 uppercase tracking-wider block text-[10px]">
                Farmer Name (किसान का नाम)
              </span>
              <span className="font-black text-stone-950 text-sm mt-0.5 block">
                {report.farmerName}
              </span>
              <span className="text-[11px] text-stone-500 font-mono">Ph: {report.farmerPhone || "N/A"}</span>
            </div>

            <div>
              <span className="font-black text-stone-500 uppercase tracking-wider block text-[10px]">
                Vehicle / Lot # (गाड़ी / लॉट नं.)
              </span>
              <span className="font-black text-stone-950 text-sm mt-0.5 block font-mono">
                {report.batchNumber}
              </span>
              <span className="text-[11px] text-stone-500 font-bold">{report.sampleCount} Samples</span>
            </div>

            <div>
              <span className="font-black text-stone-500 uppercase tracking-wider block text-[10px]">
                Timestamp
              </span>
              <span className="font-black text-stone-950 text-sm mt-0.5 block">
                {new Date(report.timestamp).toLocaleDateString()}
              </span>
              <span className="text-[11px] text-stone-500 font-mono">
                {new Date(report.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>

          {/* VERDICT HERO BANNER */}
          <div className="p-6 sm:p-8">
            <div className={`p-6 rounded-3xl border-3 flex flex-col sm:flex-row items-center justify-between gap-6 ${
              isGradeA 
                ? 'bg-emerald-50 border-emerald-600 text-emerald-950'
                : 'bg-rose-50 border-rose-600 text-rose-950'
            }`}>
              <div className="flex items-center gap-4 text-center sm:text-left">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 ${
                  isGradeA ? 'bg-[#0d3b32] text-white' : 'bg-[#e11d48] text-white'
                }`}>
                  {isGradeA ? (
                    <CheckCircle2 className="w-10 h-10 text-amber-300" />
                  ) : (
                    <AlertTriangle className="w-10 h-10" />
                  )}
                </div>
                <div>
                  <span className="text-xs font-black uppercase tracking-widest opacity-80">
                    Official Mandi Grading Verdict
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-black mt-0.5">
                    {isGradeA ? t.verdictPass : t.verdictURS}
                  </h3>
                  <p className="text-xs sm:text-sm font-bold mt-1 opacity-90 max-w-xl">
                    {report.verdictMessage}
                  </p>
                </div>
              </div>

              {/* Overall Score Box */}
              <div className="text-center sm:text-right shrink-0 bg-white px-6 py-4 rounded-2xl border-2 border-stone-300">
                <span className="text-[10px] font-black uppercase tracking-wider text-stone-600 block">
                  Grade A Confidence
                </span>
                <span className={`text-4xl font-black tracking-tight font-mono ${
                  isGradeA ? 'text-[#0d3b32]' : 'text-rose-700'
                }`}>
                  {report.gradeAPercent}%
                </span>
                <span className="text-xs font-bold text-stone-700 block mt-0.5">
                  URS Defect: <strong className="text-black">{report.ursPercent}%</strong>
                </span>
              </div>
            </div>

            {/* RETAINED PHOTO EVIDENCE */}
            {report.sampleThumbnails && report.sampleThumbnails.length > 0 && (
              <div className="mt-8 p-4 rounded-2xl bg-stone-50 border-2 border-stone-200">
                <div className="flex items-center gap-2 mb-3">
                  <ImageIcon className="w-4 h-4 text-[#0d3b32]" />
                  <h4 className="text-xs font-black uppercase tracking-wider text-stone-900">
                    Retained Visual Photo Evidence ({report.sampleThumbnails.length} photos)
                  </h4>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                  {report.sampleThumbnails.map((thumb, idx) => (
                    <div key={idx} className="aspect-square rounded-xl overflow-hidden border-2 border-stone-300 bg-stone-200">
                      <img src={thumb} alt={`Sample ${idx + 1}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Breakdown Table */}
            <div className="mt-8">
              <h4 className="text-sm font-black text-stone-950 uppercase tracking-wider mb-3">
                Class Breakdown Matrix
              </h4>

              <div className="overflow-hidden border-2 border-stone-300 rounded-2xl">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-[#f0ebe1] text-stone-900 font-black uppercase text-[10px]">
                    <tr>
                      <th className="p-3">Parameter</th>
                      <th className="p-3 text-right">Confidence</th>
                      <th className="p-3 text-right">Mandi Benchmark</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200 font-bold text-stone-900">
                    <tr className="bg-emerald-50">
                      <td className="p-3 flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#0d3b32]"></span>
                        {t.classes?.GradeA || "Grade A (Prime Quality)"}
                      </td>
                      <td className="p-3 text-right text-[#0d3b32] font-black font-mono">
                        {report.gradeAPercent}%
                      </td>
                      <td className="p-3 text-right text-stone-600">&gt;= 60%</td>
                    </tr>
                    <tr>
                      <td className="p-3 flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-600"></span>
                        {t.classes?.Rotten || "Rotten / Decayed"}
                      </td>
                      <td className="p-3 text-right text-rose-800 font-black font-mono">
                        {report.breakdown?.rotten || 0}%
                      </td>
                      <td className="p-3 text-right text-stone-600">&lt;= 10%</td>
                    </tr>
                    <tr>
                      <td className="p-3 flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-600"></span>
                        {t.classes?.Sprouted || "Sprouted / Shoots"}
                      </td>
                      <td className="p-3 text-right text-amber-900 font-black font-mono">
                        {report.breakdown?.sprouted || 0}%
                      </td>
                      <td className="p-3 text-right text-stone-600">&lt;= 15%</td>
                    </tr>
                    <tr>
                      <td className="p-3 flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
                        {t.classes?.Undersized || "Undersized (< 45mm)"}
                      </td>
                      <td className="p-3 text-right text-indigo-950 font-black font-mono">
                        {report.breakdown?.undersized || 0}%
                      </td>
                      <td className="p-3 text-right text-stone-600">&lt;= 15%</td>
                    </tr>
                    <tr className="bg-[#f0ebe1] font-black">
                      <td className="p-3">TOTAL URS DEFECT</td>
                      <td className="p-3 text-right text-rose-950 font-black font-mono">
                        {report.ursPercent}%
                      </td>
                      <td className="p-3 text-right text-stone-700">&lt;= 40%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Legal Guarantee */}
            <div className="mt-8 p-4 rounded-2xl bg-stone-100 border-2 border-stone-200 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-8 h-8 text-[#0d3b32] shrink-0" />
                <div>
                  <h5 className="text-xs font-black text-stone-900">
                    Transparent APMC Procurement Guarantee
                  </h5>
                  <p className="text-[11px] text-stone-600 font-bold">
                    Generated using impartial computer vision to protect farmer pricing and ensure objective quality classification.
                  </p>
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* Bottom CTA */}
      <div className="flex justify-center pt-2">
        <button
          onClick={onNewScan}
          className="px-8 py-4 bg-[#0d3b32] hover:bg-[#082822] text-white font-black text-base rounded-2xl shadow-xl flex items-center gap-3 cursor-pointer min-h-[56px] border-2 border-amber-400/40"
        >
          <ScanLine className="w-5 h-5 text-amber-300" />
          <span>{t.scanAnother}</span>
        </button>
      </div>

    </div>
  );
}
