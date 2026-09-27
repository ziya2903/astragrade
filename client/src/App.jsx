import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import DashboardPage from './pages/DashboardPage';
import ScannerPage from './pages/ScannerPage';
import ReportViewPage from './pages/ReportViewPage';
import HistoryPage from './pages/HistoryPage';
import AdminDashboardPage from './pages/AdminDashboardPage';

function AppContent() {
  const [currentView, setView] = useState('dashboard'); // 'dashboard' | 'scan' | 'report' | 'history' | 'admin'
  const [activeReport, setActiveReport] = useState(null);

  const handleViewReport = (report) => {
    setActiveReport(report);
    setView('report');
  };

  const handleReportGenerated = (savedReport) => {
    setActiveReport(savedReport);
    setView('report');
  };

  const handleNewScan = () => {
    setActiveReport(null);
    setView('scan');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#faf6f0] text-stone-950 selection:bg-amber-300">
      {/* Universal Top Header with Mandi Desk Controls */}
      <Navbar currentView={currentView} setView={setView} />

      {/* Main Content View Switcher (Zero login barrier!) */}
      <main className="flex-1 pb-16">
        {currentView === 'dashboard' && (
          <DashboardPage
            setView={setView}
            onViewReport={handleViewReport}
          />
        )}

        {currentView === 'scan' && (
          <ScannerPage
            onReportGenerated={handleReportGenerated}
            setView={setView}
          />
        )}

        {currentView === 'report' && (
          <ReportViewPage
            report={activeReport}
            setView={setView}
            onNewScan={handleNewScan}
          />
        )}

        {currentView === 'history' && (
          <HistoryPage
            onViewReport={handleViewReport}
            setView={setView}
          />
        )}

        {currentView === 'admin' && (
          <AdminDashboardPage
            onViewReport={handleViewReport}
            setView={setView}
          />
        )}
      </main>

      {/* Universal Mandi Gate Terminal Footer */}
      <footer className="border-t-2 border-[#e6dfd1] bg-white py-6 text-stone-600 text-xs">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <span className="text-xl">🧅</span>
            <span className="font-black text-stone-900">AstraGrade</span>
            <span className="text-stone-500">• APMC Mandi Inspection Desk</span>
          </div>
          <div className="font-bold text-stone-700">
            Built by <strong className="text-[#0d3b32]">Team KisanAstra</strong> • Powered by Google Teachable Machine TFJS
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
