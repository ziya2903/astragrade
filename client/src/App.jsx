import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ScannerPage from './pages/ScannerPage';
import ReportViewPage from './pages/ReportViewPage';
import HistoryPage from './pages/HistoryPage';
import AdminDashboardPage from './pages/AdminDashboardPage';

function AppContent() {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const [currentView, setView] = useState('dashboard'); // 'dashboard' | 'scan' | 'report' | 'history' | 'admin'
  const [activeReport, setActiveReport] = useState(null);

  // If not authenticated, always display Login Page
  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={() => setView('dashboard')} />;
  }

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
    <div className="min-h-screen flex flex-col bg-[#faf8f5] text-stone-900 selection:bg-emerald-200">
      {/* Universal Top Header with AstraGrade Onion Logo */}
      <Navbar currentView={currentView} setView={setView} />

      {/* Main Content View Switcher */}
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

      {/* Universal Transparent Mandi Footer */}
      <footer className="border-t border-stone-200 bg-white py-6 text-stone-500 text-xs">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <span className="text-base">🧅</span>
            <span className="font-extrabold text-stone-800">AstraGrade</span>
            <span>• Mandi Transparency AI System</span>
          </div>
          <div className="font-medium">
            Built by <strong className="text-emerald-700">Team KisanAstra</strong> • Powered by Google Teachable Machine TFJS
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
