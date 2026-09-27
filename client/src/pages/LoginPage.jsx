import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { sendOtp } from '../services/api';
import { 
  Phone, 
  KeyRound, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles,
  UserCheck,
  Building2,
  Globe
} from 'lucide-react';

const SAMPLE_CENTRES = [
  { id: "BKR-JH-01", name: "Bokaro Krishi Mandi", code: "BKR-JH-01" },
  { id: "RNC-JH-02", name: "Ranchi APMC Hub", code: "RNC-JH-02" },
  { id: "DHN-JH-03", name: "Dhanbad Agri Yard", code: "DHN-JH-03" },
  { id: "HZB-JH-04", name: "Hazaribagh Krishi Bazaar", code: "HZB-JH-04" }
];

export default function LoginPage({ onLoginSuccess }) {
  const { loginWithPhone, loginWithAdmin, t, lang, setLang } = useAuth();
  const [tab, setTab] = useState('farmer');

  const [phone, setPhone] = useState('9835123456');
  const [farmerName, setFarmerName] = useState('Rajesh Kumar Mahto');
  const [selectedCentre, setSelectedCentre] = useState(SAMPLE_CENTRES[0]);
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpHelper, setOtpHelper] = useState('');

  const [adminEmail, setAdminEmail] = useState('admin@kisanastra.gov.in');
  const [adminPassword, setAdminPassword] = useState('admin123');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOtp = async (e) => {
    e?.preventDefault();
    if (!phone || phone.length < 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }
    setError('');
    setLoading(true);
    const res = await sendOtp(phone);
    setLoading(false);
    setOtpSent(true);
    setOtp('1234');
    setOtpHelper(res.demoOtp ? `Demo OTP: ${res.demoOtp}` : 'Demo OTP: 1234');
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp) {
      setError('Please enter 4-digit OTP');
      return;
    }
    setError('');
    setLoading(true);
    const res = await loginWithPhone(phone, otp, selectedCentre, farmerName);
    setLoading(false);
    if (res.success) {
      if (onLoginSuccess) onLoginSuccess();
    } else {
      setError(res.message);
    }
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const res = await loginWithAdmin(adminEmail, adminPassword);
    setLoading(false);
    if (res.success) {
      if (onLoginSuccess) onLoginSuccess();
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col justify-center items-center px-4 py-8 bg-[#faf8f5]">
      
      {/* Language Switcher Bar on Top of Login */}
      <div className="flex items-center gap-1 bg-white p-1.5 rounded-2xl border-2 border-stone-300 shadow-xs mb-6">
        <Globe className="w-4 h-4 text-stone-600 ml-2 mr-1" />
        <button
          onClick={() => setLang('en')}
          className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer min-h-[38px] ${
            lang === 'en' ? 'bg-emerald-700 text-white shadow-xs' : 'text-stone-700 hover:text-black'
          }`}
        >
          English
        </button>
        <button
          onClick={() => setLang('mr')}
          className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer min-h-[38px] ${
            lang === 'mr' ? 'bg-emerald-700 text-white shadow-xs' : 'text-stone-700 hover:text-black'
          }`}
        >
          मराठी
        </button>
        <button
          onClick={() => setLang('hi')}
          className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer min-h-[38px] ${
            lang === 'hi' ? 'bg-emerald-700 text-white shadow-xs' : 'text-stone-700 hover:text-black'
          }`}
        >
          हिंदी
        </button>
      </div>

      {/* Top Banner */}
      <div className="text-center max-w-lg mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-950 text-xs font-black mb-3 border border-emerald-300">
          <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
          KisanAstra Mandi Transparency System
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-stone-950 tracking-tight leading-tight">
          {t.tagline}
        </h1>
        <p className="text-stone-700 text-xs sm:text-sm mt-2 font-bold">
          Eliminate manual grading disputes. Instant, unbiased computer vision analysis for mandi procurement centres.
        </p>
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-xl border-3 border-stone-300">
        
        {/* Tab Switcher */}
        <div className="grid grid-cols-2 p-1 bg-stone-100 rounded-2xl mb-6 border border-stone-300">
          <button
            type="button"
            onClick={() => { setTab('farmer'); setError(''); }}
            className={`py-3 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer min-h-[44px] ${
              tab === 'farmer'
                ? 'bg-white text-emerald-950 shadow-sm border border-stone-300'
                : 'text-stone-700 hover:text-stone-950'
            }`}
          >
            <UserCheck className="w-4 h-4 text-emerald-700" />
            {t.farmerStaffLogin}
          </button>

          <button
            type="button"
            onClick={() => { setTab('admin'); setError(''); }}
            className={`py-3 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer min-h-[44px] ${
              tab === 'admin'
                ? 'bg-white text-emerald-950 shadow-sm border border-stone-300'
                : 'text-stone-700 hover:text-stone-950'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            {t.ministryAdmin}
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border-2 border-rose-300 text-rose-950 text-xs font-black text-center">
            {error}
          </div>
        )}

        {/* FARMER / STAFF LOGIN FORM */}
        {tab === 'farmer' && (
          <div className="space-y-4">
            
            {/* Centre Selection */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-stone-900 mb-1.5 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-emerald-700" />
                {t.selectCentre}
              </label>
              <select
                value={selectedCentre.id}
                onChange={(e) => {
                  const c = SAMPLE_CENTRES.find(item => item.id === e.target.value);
                  if (c) setSelectedCentre(c);
                }}
                className="w-full px-4 py-3 text-sm font-bold rounded-2xl border-2 border-stone-300 bg-stone-100 focus:bg-white focus:border-emerald-700 focus:outline-hidden transition-all text-stone-950 cursor-pointer min-h-[48px]"
              >
                {SAMPLE_CENTRES.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Farmer / Staff Name */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-stone-900 mb-1.5">
                {t.farmerNameLabel}
              </label>
              <input
                type="text"
                value={farmerName}
                onChange={(e) => setFarmerName(e.target.value)}
                placeholder="e.g. Rameshwar Patil"
                className="w-full px-4 py-3 text-base font-bold rounded-2xl border-2 border-stone-300 bg-stone-100 focus:bg-white focus:border-emerald-700 focus:outline-hidden transition-all text-stone-950 min-h-[48px]"
              />
            </div>

            {/* Mobile Number */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-stone-900 mb-1.5 flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-emerald-700" />
                {t.phoneLabel}
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-700 font-black text-base">
                  +91
                </span>
                <input
                  type="tel"
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="9822012345"
                  className="w-full pl-14 pr-4 py-3.5 text-lg font-mono font-black tracking-wider rounded-2xl border-2 border-stone-300 bg-stone-100 focus:bg-white focus:border-emerald-700 focus:outline-hidden transition-all text-stone-950 min-h-[48px]"
                />
              </div>
            </div>

            {!otpSent ? (
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={loading}
                className="w-full mt-2 py-4 bg-emerald-700 hover:bg-emerald-800 active:scale-98 text-white text-base sm:text-lg font-black rounded-2xl shadow-lg flex items-center justify-center gap-3 transition-all cursor-pointer disabled:opacity-50 min-h-[56px]"
              >
                {loading ? 'Sending OTP...' : t.getOtp}
                <ArrowRight className="w-5 h-5" />
              </button>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4 pt-2">
                <div className="p-3 rounded-2xl bg-emerald-100 border border-emerald-300 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                    <span className="text-xs font-black text-emerald-950">
                      {otpHelper || "OTP Sent to Mobile"}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    className="text-xs font-black text-emerald-800 underline p-1 min-h-[44px]"
                  >
                    Resend
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-stone-900 mb-1.5 flex items-center gap-1.5">
                    <KeyRound className="w-4 h-4 text-emerald-700" />
                    {t.enterOtp}
                  </label>
                  <input
                    type="text"
                    maxLength={4}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="1234"
                    className="w-full text-center tracking-[0.5em] py-3 text-2xl font-mono font-black rounded-2xl border-3 border-emerald-600 bg-white focus:outline-hidden transition-all text-stone-950 shadow-inner min-h-[48px]"
                  />
                  <p className="text-xs text-stone-600 font-bold text-center mt-1">
                    Demo Mode: Any 4 digits accepted (e.g. 1234)
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-emerald-700 hover:bg-emerald-800 active:scale-98 text-white text-base sm:text-lg font-black rounded-2xl shadow-lg flex items-center justify-center gap-3 transition-all cursor-pointer disabled:opacity-50 min-h-[56px]"
                >
                  {loading ? 'Verifying...' : t.verifyLogin}
                  <ArrowRight className="w-5 h-5" />
                </button>
              </form>
            )}

            {/* Quick Demo Button */}
            <div className="pt-3 border-t border-stone-200">
              <button
                type="button"
                onClick={() => {
                  setPhone('9822012345');
                  setFarmerName('Rameshwar Patil');
                  setOtp('1234');
                  setOtpSent(true);
                  loginWithPhone('9822012345', '1234', selectedCentre, 'Rameshwar Patil');
                }}
                className="w-full py-3 bg-stone-100 hover:bg-stone-200 text-stone-900 text-xs font-black rounded-xl flex items-center justify-center gap-1.5 transition-colors border border-stone-300 min-h-[48px] cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-emerald-700" />
                {t.demoQuickLogin}
              </button>
            </div>
          </div>
        )}

        {/* ADMIN LOGIN FORM */}
        {tab === 'admin' && (
          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-stone-900 mb-1.5">
                Admin / Ministry Email
              </label>
              <input
                type="email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                placeholder="admin@kisanastra.gov.in"
                className="w-full px-4 py-3 text-sm font-bold rounded-2xl border-2 border-stone-300 bg-stone-100 focus:bg-white focus:border-emerald-700 focus:outline-hidden transition-all text-stone-950 min-h-[48px]"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-stone-900 mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 text-sm font-bold rounded-2xl border-2 border-stone-300 bg-stone-100 focus:bg-white focus:border-emerald-700 focus:outline-hidden transition-all text-stone-950 min-h-[48px]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-stone-950 hover:bg-black active:scale-98 text-white text-base font-black rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 min-h-[56px]"
            >
              {loading ? 'Authenticating...' : 'Sign In as Admin'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

      </div>

    </div>
  );
}
