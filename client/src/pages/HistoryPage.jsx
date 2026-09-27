import React, { useState, useEffect } from 'react';
import { fetchReports, deleteReport, resetAllReportsToDefault } from '../services/api';
import { generateReportPDF } from '../services/pdfGenerator';
import { 
  History, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  CheckCircle2, 
  AlertTriangle, 
  Calendar, 
  MapPin, 
  FileText,
  ArrowUpDown,
  Trash2,
  RotateCcw
} from 'lucide-react';

export default function HistoryPage({ onViewReport, setView }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterVerdict, setFilterVerdict] = useState('ALL'); // 'ALL' | 'Grade A' | 'URS'

  useEffect(() => {
    async function loadAll() {
      try {
        const data = await fetchReports();
        setReports(data || []);
      } catch (err) {
        console.error("Failed to fetch reports:", err);
      } finally {
        setLoading(false);
      }
    }
    loadAll();
  }, []);

  const filteredReports = reports.filter(r => {
    const matchesSearch = 
      (r.id && r.id.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (r.farmerName && r.farmerName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (r.batchNumber && r.batchNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (r.centreName && r.centreName.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesVerdict = 
      filterVerdict === 'ALL' || 
      r.verdict.toLowerCase() === filterVerdict.toLowerCase();

    return matchesSearch && matchesVerdict;
  });

  const handleDownload = (e, report) => {
    e.stopPropagation();
    generateReportPDF(report);
  };

  const handleDeleteReport = async (e, report) => {
    e.stopPropagation();
    const confirmed = window.confirm(`Permanently delete grading slip for ${report.farmerName || 'Lot'} (${report.id})?`);
    if (!confirmed) return;
    
    try {
      await deleteReport(report.id);
      setReports(prev => prev.filter(r => r.id !== report.id));
    } catch (err) {
      console.error("Failed to delete report:", err);
    }
  };

  const handleResetReports = async () => {
    if (window.confirm("Clean up all duplicate test reports and reset to the 5 official Bokaro showcase batches?")) {
      const resetList = await resetAllReportsToDefault();
      setReports(resetList);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 sm:py-8 space-y-6 animate-fadeIn">
      
      {/* Header */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-stone-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-emerald-600" />
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              Procurement Audit Log
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 mt-1">
            Grading Report History
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Transparent records of all onion batches assessed across procurement centres.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {reports.length > 5 && (
            <button
              onClick={handleResetReports}
              className="px-3.5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border-2 border-rose-200 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 min-h-[44px]"
              title="Clean duplicate test batches and reset to 5 demo reports"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clean to 5 Batches</span>
            </button>
          )}

          <button
            onClick={() => setView('scan')}
            className="px-5 py-2.5 bg-[#0d3b32] hover:bg-[#092c25] text-white rounded-xl text-xs sm:text-sm font-black shadow-sm transition-all cursor-pointer min-h-[44px] flex-1 sm:flex-initial text-center"
          >
            Scan New Batch
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by ID, Farmer name, Lot #, or Mandi..."
            className="w-full pl-10 pr-4 py-2.5 bg-stone-50 rounded-xl text-sm font-semibold border border-stone-200 focus:bg-white focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-stone-500 hidden sm:block" />
          <div className="grid grid-cols-3 gap-1 bg-stone-100 p-1 rounded-xl w-full sm:w-auto text-xs font-bold">
            <button
              onClick={() => setFilterVerdict('ALL')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filterVerdict === 'ALL' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              All ({reports.length})
            </button>
            <button
              onClick={() => setFilterVerdict('Grade A')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filterVerdict === 'Grade A' ? 'bg-emerald-600 text-white shadow-xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Grade A
            </button>
            <button
              onClick={() => setFilterVerdict('URS')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filterVerdict === 'URS' ? 'bg-rose-600 text-white shadow-xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              URS
            </button>
          </div>
        </div>
      </div>

      {/* Reports Table / Card List */}
      <div>
        {loading ? (
          <div className="py-16 text-center text-stone-400 text-sm font-semibold bg-white rounded-3xl border border-stone-200">
            Fetching verified reports from database...
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="py-16 text-center text-stone-500 space-y-3 bg-white rounded-3xl border border-stone-200">
            <FileText className="w-10 h-10 mx-auto text-stone-300" />
            <p className="font-bold text-sm">No grading reports match your query.</p>
            <button
              onClick={() => { setSearchQuery(''); setFilterVerdict('ALL'); }}
              className="text-xs text-emerald-600 font-bold hover:underline"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-0 sm:bg-white sm:rounded-3xl sm:border sm:border-stone-200 sm:shadow-sm sm:overflow-hidden sm:divide-y sm:divide-stone-100">
            {filteredReports.map((report) => {
              const isGradeA = report.verdict === 'Grade A';

              return (
                <div key={report.id}>
                  {/* MOBILE VIEW: Dedicated Standalone Card for Each Batch */}
                  <div
                    onClick={() => onViewReport(report)}
                    className="block sm:hidden bg-white rounded-2xl p-4 border-2 border-stone-300 shadow-sm space-y-3 cursor-pointer hover:border-[#0d3b32] transition-all"
                  >
                    {/* Header Row: Badges & Verdict */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 font-mono text-xs font-black text-stone-900 bg-stone-100 px-2.5 py-1 rounded-lg border border-stone-200">
                        <span>{report.id}</span>
                        <span className="text-stone-300">•</span>
                        <span className="text-stone-600 truncate max-w-[120px]">{report.batchNumber || "LOT-01"}</span>
                      </div>
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                        isGradeA ? 'bg-emerald-100 text-emerald-950 border border-emerald-300' : 'bg-rose-100 text-rose-950 border border-rose-300'
                      }`}>
                        {isGradeA ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" /> : <AlertTriangle className="w-3.5 h-3.5 text-rose-700" />}
                        {report.verdict}
                      </span>
                    </div>

                    {/* Farmer & Mandi Info */}
                    <div>
                      <h4 className="text-base font-black text-stone-950 leading-snug">
                        {report.farmerName || "Grower"}
                      </h4>
                      <p className="text-xs text-stone-600 font-bold flex flex-wrap items-center gap-2 mt-1">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-amber-600" />
                          <span>{report.centreName}</span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-stone-400" />
                          <span>
                            {new Date(report.timestamp).toLocaleString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </span>
                        <span>•</span>
                        <span>{report.sampleCount || 1} sample(s)</span>
                      </p>
                    </div>

                    {/* Visual Quality Bar */}
                    <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-200 space-y-1.5">
                      <div className="flex justify-between text-xs font-black">
                        <span className="text-emerald-800">Grade A: {report.gradeAPercent}%</span>
                        <span className="text-rose-800">URS: {report.ursPercent}%</span>
                      </div>
                      <div className="w-full h-2.5 bg-rose-200 rounded-full overflow-hidden flex">
                        <div
                          className="h-full bg-emerald-600 rounded-full transition-all"
                          style={{ width: `${Math.min(100, Math.max(0, report.gradeAPercent))}%` }}
                        />
                      </div>
                    </div>

                    {/* Mobile Action Buttons */}
                    <div className="flex items-center gap-2 pt-1 border-t border-stone-100">
                      <button
                        onClick={(e) => { e.stopPropagation(); onViewReport(report); }}
                        className="flex-1 py-2.5 bg-[#0d3b32] hover:bg-[#0a2e27] text-white text-xs font-black rounded-xl flex items-center justify-center gap-1.5 shadow-sm min-h-[42px]"
                      >
                        <Eye className="w-4 h-4 text-amber-300" />
                        <span>View Report</span>
                      </button>

                      <button
                        onClick={(e) => handleDownload(e, report)}
                        title="Download PDF"
                        className="p-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl border border-stone-300 flex items-center justify-center min-h-[42px] min-w-[42px]"
                      >
                        <Download className="w-4 h-4" />
                      </button>

                      <button
                        onClick={(e) => handleDeleteReport(e, report)}
                        title="Delete Report"
                        className="p-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl border border-rose-200 flex items-center justify-center min-h-[42px] min-w-[42px]"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* DESKTOP VIEW: Sleek Table Row */}
                  <div
                    onClick={() => onViewReport(report)}
                    className="hidden sm:flex p-4 sm:p-5 hover:bg-stone-50/80 transition-all items-center justify-between gap-4 cursor-pointer group"
                  >
                    {/* Left: Info */}
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                        isGradeA ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {isGradeA ? (
                          <CheckCircle2 className="w-6 h-6" />
                        ) : (
                          <AlertTriangle className="w-6 h-6" />
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-stone-900 bg-stone-100 px-2 py-0.5 rounded-md">
                            {report.id}
                          </span>
                          <span className="text-xs text-stone-400">•</span>
                          <span className="font-mono text-xs font-semibold text-stone-600">
                            {report.batchNumber || "LOT-01"}
                          </span>
                        </div>

                        <h4 className="text-base font-black text-stone-950 group-hover:text-emerald-700 transition-colors mt-0.5">
                          {report.farmerName || "Grower"}
                        </h4>

                        <div className="flex items-center gap-3 text-xs text-stone-500 mt-0.5">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-stone-400" />
                            <span>{report.centreName}</span>
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-stone-400" />
                            <span>
                              {new Date(report.timestamp).toLocaleString(undefined, {
                                dateStyle: 'medium',
                                timeStyle: 'short'
                              })}
                            </span>
                          </span>
                          <span>•</span>
                          <span>{report.sampleCount || 1} sample(s)</span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Scores & Actions */}
                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-right">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider ${
                          isGradeA ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {report.verdict}
                        </span>
                        <div className="text-xs font-bold text-stone-700 mt-1">
                          Grade A: <span className="text-emerald-700 font-black">{report.gradeAPercent}%</span>
                          <span className="text-stone-300 mx-1">|</span>
                          URS: <span className="text-rose-700 font-black">{report.ursPercent}%</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => handleDownload(e, report)}
                          title="Download PDF Certificate"
                          className="p-2.5 bg-stone-100 hover:bg-emerald-600 hover:text-white text-stone-700 rounded-xl transition-all cursor-pointer shadow-2xs min-h-[40px] min-w-[40px] flex items-center justify-center"
                        >
                          <Download className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => onViewReport(report)}
                          className="px-3.5 py-2 bg-stone-900 hover:bg-black text-white text-xs font-black rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer min-h-[40px]"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </button>

                        <button
                          onClick={(e) => handleDeleteReport(e, report)}
                          title="Delete Report"
                          className="p-2.5 bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-600 rounded-xl transition-all cursor-pointer shadow-2xs min-h-[40px] min-w-[40px] flex items-center justify-center"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
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
