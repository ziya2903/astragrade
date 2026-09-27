import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  ScanLine, 
  History, 
  ShieldCheck, 
  MapPin, 
  Menu, 
  X, 
  Globe,
  ChevronDown,
  UserCheck,
  Check
} from 'lucide-react';

export default function Navbar({ currentView, setView }) {
  const { user, activeCentre, changeCentre, updateInspectorName, centresList, lang, setLang, t } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [centreDropdownOpen, setCentreDropdownOpen] = useState(false);
  const [inspectorModalOpen, setInspectorModalOpen] = useState(false);
  const [tempName, setTempName] = useState(user?.name || '');

  return (
    <header className="sticky top-0 z-40 bg-[#0d3b32] text-white shadow-md border-b-2 border-[#164e43]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo & Brand */}
          <button 
            onClick={() => { setView('dashboard'); setMobileMenuOpen(false); }}
            className="flex items-center gap-3 text-left focus:outline-hidden group cursor-pointer"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform border border-amber-300/40">
              <span className="text-2xl sm:text-3xl" role="img" aria-label="onion">🧅</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-white group-hover:text-amber-300 transition-colors">
                  Astra<span className="text-amber-400">Grade</span>
                </span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-black bg-amber-400 text-stone-950">
                  MANDI DESK
                </span>
              </div>
              <p className="text-[11px] font-bold text-emerald-200/80 hidden sm:block">
                {t.mandiSubtitle}
              </p>
            </div>
          </button>

          {/* Interactive Mandi Centre Dropdown (1-tap switch) */}
          <div className="relative hidden md:block">
            <button
              onClick={() => setCentreDropdownOpen(!centreDropdownOpen)}
              className="flex items-center gap-2 bg-[#13493e] hover:bg-[#1a5a4d] px-3.5 py-2 rounded-2xl border border-emerald-500/30 text-xs font-black text-white transition-all cursor-pointer"
            >
              <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="truncate max-w-[200px]">{activeCentre?.name}</span>
              <ChevronDown className="w-3.5 h-3.5 text-emerald-300" />
            </button>

            {centreDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-64 bg-white text-stone-900 rounded-2xl shadow-2xl border-2 border-stone-300 p-2 z-50 animate-fadeIn">
                <span className="text-[10px] uppercase font-black tracking-wider text-stone-500 px-3 py-1 block">
                  Select Mandi Yard
                </span>
                {centresList.map(c => (
                  <button
                    key={c.id}
                    onClick={() => {
                      changeCentre(c);
                      setCentreDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-black flex items-center justify-between cursor-pointer transition-colors ${
                      activeCentre?.id === c.id ? 'bg-amber-100 text-amber-950 font-black' : 'hover:bg-stone-100'
                    }`}
                  >
                    <span>{c.name}</span>
                    {activeCentre?.id === c.id && <Check className="w-4 h-4 text-amber-600" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Language Switcher (EN | मराठी | हिंदी) */}
          <div className="flex items-center bg-[#13493e] rounded-xl p-1 border border-emerald-500/30">
            <Globe className="w-3.5 h-3.5 text-emerald-300 ml-1.5 mr-1 hidden sm:block" />
            <button
              onClick={() => setLang('en')}
              className={`px-2 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                lang === 'en' ? 'bg-amber-500 text-stone-950 shadow-xs' : 'text-emerald-100 hover:text-white'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLang('mr')}
              className={`px-2 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                lang === 'mr' ? 'bg-amber-500 text-stone-950 shadow-xs' : 'text-emerald-100 hover:text-white'
              }`}
            >
              मराठी
            </button>
            <button
              onClick={() => setLang('hi')}
              className={`px-2 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                lang === 'hi' ? 'bg-amber-500 text-stone-950 shadow-xs' : 'text-emerald-100 hover:text-white'
              }`}
            >
              हिंदी
            </button>
          </div>

          {/* Desktop Nav Controls */}
          <nav className="hidden sm:flex items-center gap-2">
            <button
              onClick={() => setView('dashboard')}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-black flex items-center gap-1.5 transition-all cursor-pointer min-h-[44px] ${
                currentView === 'dashboard'
                  ? 'bg-amber-500 text-stone-950 shadow-sm'
                  : 'text-emerald-100 hover:bg-[#13493e]'
              }`}
            >
              Terminal
            </button>

            <button
              onClick={() => setView('scan')}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-black flex items-center gap-1.5 transition-all cursor-pointer min-h-[44px] ${
                currentView === 'scan'
                  ? 'bg-amber-500 text-stone-950 shadow-sm'
                  : 'text-emerald-100 hover:bg-[#13493e]'
              }`}
            >
              <ScanLine className="w-4 h-4" />
              <span>Scan Lot</span>
            </button>

            <button
              onClick={() => setView('history')}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-black flex items-center gap-1.5 transition-all cursor-pointer min-h-[44px] ${
                currentView === 'history'
                  ? 'bg-amber-500 text-stone-950 shadow-sm'
                  : 'text-emerald-100 hover:bg-[#13493e]'
              }`}
            >
              <History className="w-4 h-4" />
              <span>Slips</span>
            </button>

            <button
              onClick={() => setView('admin')}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-black flex items-center gap-1.5 transition-all cursor-pointer min-h-[44px] ${
                currentView === 'admin'
                  ? 'bg-amber-500 text-stone-950 shadow-sm'
                  : 'text-emerald-100 hover:bg-[#13493e]'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-amber-300" />
              <span>Oversight</span>
            </button>

            {/* Quick Staff Badge / Edit Name */}
            <button
              onClick={() => {
                setTempName(user?.name || '');
                setInspectorModalOpen(true);
              }}
              title="Click to edit Inspector Name"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#092c25] hover:bg-[#07241e] text-[11px] font-black text-amber-300 border border-amber-400/30 cursor-pointer ml-1"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span className="truncate max-w-[120px]">{user?.name?.split(' ')?.[1] || user?.name || "Staff"}</span>
            </button>
          </nav>

          {/* Mobile Menu Trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="sm:hidden p-2.5 rounded-xl text-white hover:bg-[#13493e] focus:outline-hidden min-h-[48px] min-w-[48px] flex items-center justify-center cursor-pointer"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-[#164e43] bg-[#0c352d] px-4 pt-3 pb-6 space-y-2.5 shadow-2xl">
          {/* Mobile Centre Selector */}
          <div className="p-3 bg-[#13493e] rounded-xl mb-3 text-xs font-bold text-white border border-emerald-500/30">
            <span className="text-[10px] text-amber-300 uppercase block font-black mb-1">Current APMC Yard</span>
            <select
              value={activeCentre?.id}
              onChange={(e) => {
                const c = centresList.find(item => item.id === e.target.value);
                if (c) changeCentre(c);
              }}
              className="w-full bg-[#092c25] text-white font-black text-xs py-2 px-3 rounded-lg border border-emerald-500/40"
            >
              {centresList.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <button
            onClick={() => { setView('dashboard'); setMobileMenuOpen(false); }}
            className={`w-full text-left px-4 py-3 rounded-xl font-black flex items-center gap-3 text-base min-h-[48px] ${
              currentView === 'dashboard' ? 'bg-amber-500 text-stone-950' : 'text-white hover:bg-[#13493e]'
            }`}
          >
            Mandi Gate Terminal
          </button>

          <button
            onClick={() => { setView('scan'); setMobileMenuOpen(false); }}
            className={`w-full text-left px-4 py-3 rounded-xl font-black flex items-center gap-3 text-base min-h-[48px] ${
              currentView === 'scan' ? 'bg-amber-500 text-stone-950' : 'text-white hover:bg-[#13493e]'
            }`}
          >
            <ScanLine className="w-5 h-5 text-amber-400" />
            {t.scanOnionsBtn}
          </button>

          <button
            onClick={() => { setView('history'); setMobileMenuOpen(false); }}
            className={`w-full text-left px-4 py-3 rounded-xl font-black flex items-center gap-3 text-base min-h-[48px] ${
              currentView === 'history' ? 'bg-amber-500 text-stone-950' : 'text-white hover:bg-[#13493e]'
            }`}
          >
            <History className="w-5 h-5" />
            {t.historyTitle}
          </button>

          <button
            onClick={() => { setView('admin'); setMobileMenuOpen(false); }}
            className={`w-full text-left px-4 py-3 rounded-xl font-black flex items-center gap-3 text-base min-h-[48px] ${
              currentView === 'admin' ? 'bg-amber-500 text-stone-950' : 'text-white hover:bg-[#13493e]'
            }`}
          >
            <ShieldCheck className="w-5 h-5 text-amber-300" />
            {t.adminTitle}
          </button>
        </div>
      )}

      {/* Quick Inspector Name Modal */}
      {inspectorModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="bg-white text-stone-900 rounded-3xl p-6 max-w-sm w-full shadow-2xl border-2 border-stone-300 space-y-4">
            <h3 className="text-base font-black text-stone-950">
              Set Gate Inspector Name
            </h3>
            <p className="text-xs text-stone-600 font-bold">
              This name appears on the printed mandi quality slips.
            </p>
            <input
              type="text"
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              placeholder="e.g. Inspector S. D. Deshmukh"
              className="w-full px-4 py-3 border-2 border-stone-300 rounded-xl font-black text-sm bg-stone-50 focus:bg-white focus:outline-hidden"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setInspectorModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-stone-300 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  updateInspectorName(tempName);
                  setInspectorModalOpen(false);
                }}
                className="flex-1 py-2.5 rounded-xl bg-[#0d3b32] text-white font-black text-xs"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

    </header>
  );
}
