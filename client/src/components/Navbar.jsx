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
  User, 
  Sparkles,
  ChevronDown
} from 'lucide-react';

export default function Navbar({ currentView, setView }) {
  const { user, activeCentre, logout, isAdmin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo & Brand */}
          <button 
            onClick={() => { setView('dashboard'); setMobileMenuOpen(false); }}
            className="flex items-center gap-3 text-left focus:outline-hidden group"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-green-700 flex items-center justify-center text-white shadow-md shadow-emerald-700/20 group-hover:scale-105 transition-transform">
              <span className="text-2xl sm:text-3xl filter drop-shadow-xs" role="img" aria-label="onion">🧅</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-stone-900 group-hover:text-emerald-700 transition-colors">
                  Astra<span className="text-emerald-600">Grade</span>
                </span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  AI
                </span>
              </div>
              <p className="text-[11px] font-medium text-stone-500 hidden sm:block">
                By Team KisanAstra • Transparent APMC Grading
              </p>
            </div>
          </button>

          {/* Centre Badge for Staff/Farmer */}
          {user && (
            <div className="hidden md:flex items-center gap-2 bg-stone-100 px-3 py-1.5 rounded-full border border-stone-200 text-xs font-semibold text-stone-700">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              <span>{activeCentre?.name || "Nashik Yard"}</span>
            </div>
          )}

          {/* Desktop Nav Controls */}
          {user ? (
            <nav className="hidden sm:flex items-center gap-2">
              <button
                onClick={() => setView('dashboard')}
                className={`px-3.5 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${
                  currentView === 'dashboard'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-stone-700 hover:bg-stone-100'
                }`}
              >
                Dashboard
              </button>

              <button
                onClick={() => setView('scan')}
                className={`px-3.5 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${
                  currentView === 'scan'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-stone-700 hover:bg-stone-100'
                }`}
              >
                <ScanLine className="w-4 h-4" />
                <span>Scan Onions</span>
              </button>

              <button
                onClick={() => setView('history')}
                className={`px-3.5 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${
                  currentView === 'history'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-stone-700 hover:bg-stone-100'
                }`}
              >
                <History className="w-4 h-4" />
                <span>Reports</span>
              </button>

              <button
                onClick={() => setView('admin')}
                className={`px-3.5 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${
                  currentView === 'admin'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-stone-700 hover:bg-stone-100'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <span>Admin View</span>
              </button>

              <button
                onClick={logout}
                title="Log Out"
                className="p-2 ml-1 text-stone-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </nav>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-1 bg-amber-100 text-amber-800 rounded-md">
                Demo Mode
              </span>
            </div>
          )}

          {/* Mobile Menu Trigger */}
          {user && (
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="sm:hidden p-2 rounded-xl text-stone-700 hover:bg-stone-100 focus:outline-hidden"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          )}

        </div>
      </div>

      {/* Mobile Drawer */}
      {user && mobileMenuOpen && (
        <div className="sm:hidden border-t border-stone-200 bg-white px-4 pt-3 pb-5 space-y-2 shadow-lg">
          <div className="p-3 bg-stone-50 rounded-xl mb-3 flex items-center gap-2 text-xs font-semibold text-stone-700 border border-stone-200">
            <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="truncate">{activeCentre?.name}</span>
          </div>

          <button
            onClick={() => { setView('dashboard'); setMobileMenuOpen(false); }}
            className={`w-full text-left px-4 py-3 rounded-xl font-bold flex items-center gap-3 text-base ${
              currentView === 'dashboard' ? 'bg-emerald-600 text-white' : 'text-stone-800 hover:bg-stone-100'
            }`}
          >
            Dashboard
          </button>

          <button
            onClick={() => { setView('scan'); setMobileMenuOpen(false); }}
            className={`w-full text-left px-4 py-3 rounded-xl font-bold flex items-center gap-3 text-base ${
              currentView === 'scan' ? 'bg-emerald-600 text-white' : 'text-stone-800 hover:bg-stone-100'
            }`}
          >
            <ScanLine className="w-5 h-5" />
            Check Onion Quality
          </button>

          <button
            onClick={() => { setView('history'); setMobileMenuOpen(false); }}
            className={`w-full text-left px-4 py-3 rounded-xl font-bold flex items-center gap-3 text-base ${
              currentView === 'history' ? 'bg-emerald-600 text-white' : 'text-stone-800 hover:bg-stone-100'
            }`}
          >
            <History className="w-5 h-5" />
            Report History
          </button>

          <button
            onClick={() => { setView('admin'); setMobileMenuOpen(false); }}
            className={`w-full text-left px-4 py-3 rounded-xl font-bold flex items-center gap-3 text-base ${
              currentView === 'admin' ? 'bg-emerald-600 text-white' : 'text-stone-800 hover:bg-stone-100'
            }`}
          >
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            Central Admin Oversight
          </button>

          <button
            onClick={() => { logout(); setMobileMenuOpen(false); }}
            className="w-full text-left px-4 py-3 rounded-xl font-bold flex items-center gap-3 text-base text-rose-600 hover:bg-rose-50"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      )}
    </header>
  );
}
