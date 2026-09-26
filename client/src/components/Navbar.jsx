import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  ScanLine, 
  History, 
  ShieldCheck, 
  LogOut, 
  MapPin, 
  Menu, 
  X, 
  Globe
} from 'lucide-react';

export default function Navbar({ currentView, setView }) {
  const { user, activeCentre, logout, isAdmin, lang, setLang, t } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/98 backdrop-blur-md border-b-2 border-stone-300 shadow-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo & Brand */}
          <button 
            onClick={() => { setView('dashboard'); setMobileMenuOpen(false); }}
            className="flex items-center gap-3 text-left focus:outline-hidden group cursor-pointer"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-emerald-700 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
              <span className="text-2xl sm:text-3xl" role="img" aria-label="onion">🧅</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-stone-950 group-hover:text-emerald-800 transition-colors">
                  Astra<span className="text-emerald-700">Grade</span>
                </span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-black bg-emerald-100 text-emerald-900 border border-emerald-300">
                  AI
                </span>
              </div>
              <p className="text-[11px] font-bold text-stone-600 hidden sm:block">
                {t.mandiSubtitle}
              </p>
            </div>
          </button>

          {/* Language Switcher (EN | मराठी | हिंदी) */}
          <div className="flex items-center bg-stone-100 rounded-xl p-1 border-2 border-stone-300">
            <Globe className="w-3.5 h-3.5 text-stone-600 ml-1.5 mr-1 hidden sm:block" />
            <button
              onClick={() => setLang('en')}
              className={`px-2 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                lang === 'en' ? 'bg-emerald-700 text-white shadow-xs' : 'text-stone-700 hover:text-black'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLang('mr')}
              className={`px-2 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                lang === 'mr' ? 'bg-emerald-700 text-white shadow-xs' : 'text-stone-700 hover:text-black'
              }`}
            >
              मराठी
            </button>
            <button
              onClick={() => setLang('hi')}
              className={`px-2 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                lang === 'hi' ? 'bg-emerald-700 text-white shadow-xs' : 'text-stone-700 hover:text-black'
              }`}
            >
              हिंदी
            </button>
          </div>

          {/* Centre Badge for Staff/Farmer */}
          {user && (
            <div className="hidden lg:flex items-center gap-2 bg-stone-100 px-3.5 py-1.5 rounded-full border border-stone-300 text-xs font-bold text-stone-900">
              <MapPin className="w-3.5 h-3.5 text-emerald-700" />
              <span className="truncate max-w-[180px]">{activeCentre?.name || "Nashik Yard"}</span>
            </div>
          )}

          {/* Desktop Nav Controls */}
          {user ? (
            <nav className="hidden sm:flex items-center gap-2">
              <button
                onClick={() => setView('dashboard')}
                className={`px-3.5 py-2 rounded-xl text-sm font-extrabold flex items-center gap-2 transition-all cursor-pointer min-h-[44px] ${
                  currentView === 'dashboard'
                    ? 'bg-emerald-700 text-white shadow-sm'
                    : 'text-stone-900 hover:bg-stone-100'
                }`}
              >
                Dashboard
              </button>

              <button
                onClick={() => setView('scan')}
                className={`px-3.5 py-2 rounded-xl text-sm font-extrabold flex items-center gap-2 transition-all cursor-pointer min-h-[44px] ${
                  currentView === 'scan'
                    ? 'bg-emerald-700 text-white shadow-sm'
                    : 'text-stone-900 hover:bg-stone-100'
                }`}
              >
                <ScanLine className="w-4 h-4" />
                <span>Scan</span>
              </button>

              <button
                onClick={() => setView('history')}
                className={`px-3.5 py-2 rounded-xl text-sm font-extrabold flex items-center gap-2 transition-all cursor-pointer min-h-[44px] ${
                  currentView === 'history'
                    ? 'bg-emerald-700 text-white shadow-sm'
                    : 'text-stone-900 hover:bg-stone-100'
                }`}
              >
                <History className="w-4 h-4" />
                <span>Reports</span>
              </button>

              <button
                onClick={() => setView('admin')}
                className={`px-3.5 py-2 rounded-xl text-sm font-extrabold flex items-center gap-2 transition-all cursor-pointer min-h-[44px] ${
                  currentView === 'admin'
                    ? 'bg-emerald-700 text-white shadow-sm'
                    : 'text-stone-900 hover:bg-stone-100'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-emerald-800" />
                <span>Admin</span>
              </button>

              <button
                onClick={logout}
                title="Log Out"
                className="p-2.5 ml-1 text-stone-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </nav>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs font-black px-2.5 py-1 bg-amber-100 text-amber-950 rounded-md border border-amber-300">
                Mandi Demo
              </span>
            </div>
          )}

          {/* Mobile Menu Trigger */}
          {user && (
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="sm:hidden p-2.5 rounded-xl text-stone-900 hover:bg-stone-100 focus:outline-hidden min-h-[48px] min-w-[48px] flex items-center justify-center"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          )}

        </div>
      </div>

      {/* Mobile Drawer */}
      {user && mobileMenuOpen && (
        <div className="sm:hidden border-t-2 border-stone-200 bg-white px-4 pt-3 pb-6 space-y-2 shadow-xl">
          <div className="p-3 bg-stone-100 rounded-xl mb-3 flex items-center gap-2 text-xs font-bold text-stone-900 border border-stone-300">
            <MapPin className="w-4 h-4 text-emerald-700 shrink-0" />
            <span className="truncate">{activeCentre?.name}</span>
          </div>

          <button
            onClick={() => { setView('dashboard'); setMobileMenuOpen(false); }}
            className={`w-full text-left px-4 py-3 rounded-xl font-black flex items-center gap-3 text-base min-h-[48px] ${
              currentView === 'dashboard' ? 'bg-emerald-700 text-white' : 'text-stone-900 hover:bg-stone-100'
            }`}
          >
            Dashboard
          </button>

          <button
            onClick={() => { setView('scan'); setMobileMenuOpen(false); }}
            className={`w-full text-left px-4 py-3 rounded-xl font-black flex items-center gap-3 text-base min-h-[48px] ${
              currentView === 'scan' ? 'bg-emerald-700 text-white' : 'text-stone-900 hover:bg-stone-100'
            }`}
          >
            <ScanLine className="w-5 h-5" />
            {t.scanOnionsBtn}
          </button>

          <button
            onClick={() => { setView('history'); setMobileMenuOpen(false); }}
            className={`w-full text-left px-4 py-3 rounded-xl font-black flex items-center gap-3 text-base min-h-[48px] ${
              currentView === 'history' ? 'bg-emerald-700 text-white' : 'text-stone-900 hover:bg-stone-100'
            }`}
          >
            <History className="w-5 h-5" />
            {t.historyTitle}
          </button>

          <button
            onClick={() => { setView('admin'); setMobileMenuOpen(false); }}
            className={`w-full text-left px-4 py-3 rounded-xl font-black flex items-center gap-3 text-base min-h-[48px] ${
              currentView === 'admin' ? 'bg-emerald-700 text-white' : 'text-stone-900 hover:bg-stone-100'
            }`}
          >
            <ShieldCheck className="w-5 h-5 text-emerald-700" />
            {t.adminTitle}
          </button>

          <button
            onClick={() => { logout(); setMobileMenuOpen(false); }}
            className="w-full text-left px-4 py-3 rounded-xl font-black flex items-center gap-3 text-base text-rose-700 hover:bg-rose-50 min-h-[48px]"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      )}
    </header>
  );
}
