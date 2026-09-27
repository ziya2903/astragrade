import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { subscribeSyncStatus } from '../services/cloudSync';
import SyncModal from './SyncModal';
import { 
  ScanLine, 
  History, 
  MapPin, 
  Menu, 
  X, 
  Globe,
  BarChart3,
  Cloud,
  RefreshCw
} from 'lucide-react';

export default function Navbar({ currentView, setView }) {
  const { activeCentre, lang, setLang, t } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [syncModalOpen, setSyncModalOpen] = useState(false);
  const [syncStatus, setSyncStatus] = useState({ state: 'idle', lastSyncTime: null });

  useEffect(() => {
    const unsub = subscribeSyncStatus(status => setSyncStatus(status));
    return () => unsub();
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-[#0d3b32] text-white shadow-md border-b-2 border-[#164e43]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 sm:h-18">
          
          {/* Logo & Brand */}
          <button 
            onClick={() => { setView('dashboard'); setMobileMenuOpen(false); }}
            className="flex items-center gap-3 text-left focus:outline-hidden group cursor-pointer"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-amber-400 flex items-center justify-center text-stone-950 shadow-md group-hover:scale-105 transition-transform font-black text-2xl">
              🧅
            </div>
            <div>
              <span className="text-xl sm:text-2xl font-black tracking-tight text-white group-hover:text-amber-300 transition-colors">
                Astra<span className="text-amber-400">Grade</span>
              </span>
              <p className="text-[11px] font-bold text-emerald-200/80 hidden sm:block">
                {t.mandiSubtitle}
              </p>
            </div>
          </button>

          {/* Clean Location Tag: Bokaro Mandi, Jharkhand */}
          <div className="hidden md:flex items-center gap-2 bg-[#13493e] px-3.5 py-1.5 rounded-full border border-emerald-500/30 text-xs font-black text-emerald-100">
            <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>{activeCentre?.name || "Bokaro Mandi"}, Jharkhand</span>
          </div>

          {/* Right Controls: Language + Cloud Sync + Primary Navigation */}
          <div className="flex items-center gap-2">
            
            {/* Hybrid Cloud Sync Pill (Option C) */}
            <button
              onClick={() => setSyncModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#13493e] hover:bg-[#18594c] border border-emerald-500/30 text-xs font-bold text-emerald-100 transition-colors cursor-pointer min-h-[36px]"
              title="Mandi Cloud & Device Sync"
            >
              <Cloud className="w-3.5 h-3.5 text-amber-300 shrink-0" />
              <span className="hidden sm:inline">
                {syncStatus.state === 'synced' ? 'Synced' : syncStatus.state === 'syncing' ? 'Syncing...' : 'Sync'}
              </span>
              <span className={`w-2 h-2 rounded-full ${
                syncStatus.state === 'synced' 
                  ? 'bg-emerald-400' 
                  : syncStatus.state === 'syncing' 
                    ? 'bg-amber-400 animate-pulse' 
                    : 'bg-stone-400'
              }`} />
            </button>

            {/* Language Switcher (English | हिंदी only) */}
            <div className="flex items-center bg-[#13493e] rounded-xl p-1 border border-emerald-500/30">
              <Globe className="w-3.5 h-3.5 text-emerald-300 ml-1.5 mr-1 hidden sm:block" />
              <button
                onClick={() => setLang('en')}
                className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                  lang === 'en' ? 'bg-amber-400 text-stone-950 shadow-xs' : 'text-emerald-100 hover:text-white'
                }`}
              >
                English
              </button>
              <button
                onClick={() => setLang('hi')}
                className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                  lang === 'hi' ? 'bg-amber-400 text-stone-950 shadow-xs' : 'text-emerald-100 hover:text-white'
                }`}
              >
                हिंदी
              </button>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden sm:flex items-center gap-2">
              <button
                onClick={() => setView('scan')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black flex items-center gap-1.5 transition-all cursor-pointer min-h-[40px] ${
                  currentView === 'scan'
                    ? 'bg-amber-400 text-stone-950 shadow-sm'
                    : 'bg-emerald-600/50 hover:bg-emerald-600 text-white'
                }`}
              >
                <ScanLine className="w-4 h-4" />
                <span>{t.scanOnionsBtn}</span>
              </button>

              <button
                onClick={() => setView('history')}
                className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-black flex items-center gap-1.5 transition-all cursor-pointer min-h-[40px] ${
                  currentView === 'history'
                    ? 'bg-amber-400 text-stone-950 shadow-sm'
                    : 'text-emerald-100 hover:bg-[#13493e]'
                }`}
              >
                <History className="w-4 h-4" />
                <span>Reports</span>
              </button>

              <button
                onClick={() => setView('admin')}
                title="Mandi Analytics"
                className={`p-2 rounded-xl text-xs font-black flex items-center gap-1 transition-all cursor-pointer min-h-[40px] ${
                  currentView === 'admin'
                    ? 'bg-amber-400 text-stone-950 shadow-sm'
                    : 'text-emerald-200 hover:bg-[#13493e]'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
              </button>
            </nav>

            {/* Mobile Menu Trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="sm:hidden p-2 rounded-xl text-white hover:bg-[#13493e] focus:outline-hidden min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

          </div>

        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-[#164e43] bg-[#0c352d] px-4 pt-3 pb-5 space-y-2 shadow-2xl">
          <div className="flex items-center gap-2 p-2.5 bg-[#13493e] rounded-xl text-xs font-black text-amber-300">
            <MapPin className="w-4 h-4" />
            <span>{activeCentre?.name || "Bokaro Mandi, Jharkhand"}</span>
          </div>

          <button
            onClick={() => { setView('scan'); setMobileMenuOpen(false); }}
            className={`w-full text-left px-4 py-3 rounded-xl font-black flex items-center gap-3 text-base min-h-[48px] ${
              currentView === 'scan' ? 'bg-amber-400 text-stone-950' : 'text-white hover:bg-[#13493e]'
            }`}
          >
            <ScanLine className="w-5 h-5 text-amber-400" />
            {t.scanOnionsBtn}
          </button>

          <button
            onClick={() => { setView('dashboard'); setMobileMenuOpen(false); }}
            className={`w-full text-left px-4 py-3 rounded-xl font-black flex items-center gap-3 text-base min-h-[48px] ${
              currentView === 'dashboard' ? 'bg-amber-400 text-stone-950' : 'text-white hover:bg-[#13493e]'
            }`}
          >
            Dashboard
          </button>

          <button
            onClick={() => { setView('history'); setMobileMenuOpen(false); }}
            className={`w-full text-left px-4 py-3 rounded-xl font-black flex items-center gap-3 text-base min-h-[48px] ${
              currentView === 'history' ? 'bg-amber-400 text-stone-950' : 'text-white hover:bg-[#13493e]'
            }`}
          >
            <History className="w-5 h-5" />
            {t.historyTitle}
          </button>

          <button
            onClick={() => { setView('admin'); setMobileMenuOpen(false); }}
            className={`w-full text-left px-4 py-3 rounded-xl font-black flex items-center gap-3 text-base min-h-[48px] ${
              currentView === 'admin' ? 'bg-amber-400 text-stone-950' : 'text-white hover:bg-[#13493e]'
            }`}
          >
            <BarChart3 className="w-5 h-5" />
            {t.adminTitle}
          </button>

          <button
            onClick={() => { setSyncModalOpen(true); setMobileMenuOpen(false); }}
            className="w-full text-left px-4 py-3 rounded-xl font-black flex items-center justify-between text-base min-h-[48px] text-emerald-200 hover:bg-[#13493e]"
          >
            <div className="flex items-center gap-3">
              <Cloud className="w-5 h-5 text-amber-400" />
              <span>Mandi Cloud Sync</span>
            </div>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-900/80 text-emerald-200 font-mono">
              {syncStatus.state === 'synced' ? '✓ Synced' : syncStatus.state}
            </span>
          </button>
        </div>
      )}

      {/* Cloud & Device Sync Modal */}
      <SyncModal
        isOpen={syncModalOpen}
        onClose={() => setSyncModalOpen(false)}
        onSyncComplete={() => {}}
      />

    </header>
  );
}
