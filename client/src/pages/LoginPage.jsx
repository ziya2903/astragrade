import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { sendOtp } from '../services/api';
import { 
  Phone, 
  KeyRound, 
  MapPin, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles,
  UserCheck,
  Building2
} from 'lucide-react';

const SAMPLE_CENTRES = [
  { id: "NSK-01", name: "Nashik APMC Main Yard", code: "NSK-01" },
  { id: "LSG-03", name: "Lasalgaon Procurement Hub", code: "LSG-03" },
  { id: "PMP-02", name: "Pimpalgaon Baswant Centre", code: "PMP-02" },
  { id: "YLA-01", name: "Yeola Sub-Centre", code: "YLA-01" }
];

export default function LoginPage({ onLoginSuccess }) {
  const { loginWithPhone, loginWithAdmin } = useAuth();
  const [tab, setTab] = useState('farmer'); // 'farmer' | 'admin'

  // Farmer / Staff fields
  const [phone, setPhone] = useState('9822012345');
  const [farmerName, setFarmerName] = useState('Rameshwar Patil');
  const [selectedCentre, setSelectedCentre] = useState(SAMPLE_CENTRES[0]);
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpHelper, setOtpHelper] = useState('');

  // Admin fields
  const [adminEmail, setAdminEmail] = useState('admin@kisanastra.gov.in');
  const [adminPassword, setAdminPassword] = useState('admin123');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Handle Send OTP
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
    setOtp('1234'); // Pre-fill mock OTP for effortless instant demo
    setOtpHelper(res.demoOtp ? `Demo OTP: ${res.demoOtp}` : 'Demo OTP: 1234');
  };

  // Handle Verify OTP
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

  // Handle Admin Login
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
    <div className="min-h-[calc(100vh-80px)] flex flex-col justify-center items-center px-4 py-8 bg-gradient-to-b from-stone-50 via-emerald-50/20 to-stone-100">
      
      {/* Top Banner / Problem Solved */}
      <div className="text-center max-w-lg mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-3 shadow-xs">
          <Sparkles className="w-3.5 h-3.5" />
          KisanAstra Procurement Transparency System
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight leading-tight">
          AI Onion Quality Assessment
        </h1>
        <p className="text-stone-600 text-sm mt-2">
          Eliminate manual grading disputes. Instant, unbiased computer vision analysis for mandi procurement centres.
        </p>
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-stone-200">
        
        {/* Tab Switcher: Farmer / Staff vs Admin */}
        <div className="grid grid-cols-2 p-1 bg-stone-100 rounded-2xl mb-6">
          <button
            type="button"
            onClick={() => { setTab('farmer'); setError(''); }}
            className={`py-3 rounded-xl font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 transition-all cursor-pointer ${
              tab === 'farmer'
                ? 'bg-white text-emerald-800 shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <UserCheck className="w-4 h-4 text-emerald-600" />
            Farmer / Staff
          </button>

          <button
            type="button"
            onClick={() => { setTab('admin'); setError(''); }}
            className={`py-3 rounded-xl font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 transition-all cursor-pointer ${
              tab === 'admin'
                ? 'bg-white text-emerald-800 shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Ministry Admin
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold text-center">
            {error}
          </div>
        )}

        {/* FARMER / STAFF LOGIN FORM (High contrast, large fonts, low digital literacy friendly) */}
        {tab === 'farmer' && (
          <div className="space-y-4">
            
            {/* Centre Selection */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-emerald-600" />
                Select Procurement Centre
              </label>
              <select
                value={selectedCentre.id}
                onChange={(e) => {
                  const c = SAMPLE_CENTRES.find(item => item.id === e.target.value);
                  if (c) setSelectedCentre(c);
                }}
                className="w-full px-4 py-3 text-sm font-semibold rounded-2xl border-2 border-stone-200 bg-stone-50 focus:bg-white focus:border-emerald-600 focus:outline-hidden transition-all text-stone-900 cursor-pointer"
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
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                Farmer / Staff Name
              </label>
              <input
                type="text"
                value={farmerName}
                onChange={(e) => setFarmerName(e.target.value)}
                placeholder="e.g. Rameshwar Patil"
                className="w-full px-4 py-3 text-base font-semibold rounded-2xl border-2 border-stone-200 bg-stone-50 focus:bg-white focus:border-emerald-600 focus:outline-hidden transition-all text-stone-900"
              />
            </div>

            {/* Mobile Number */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5 flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-emerald-600" />
                10-Digit Mobile Number
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-500 font-bold text-base">
                  +91
                </span>
                <input
                  type="tel"
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="9822012345"
                  className="w-full pl-14 pr-4 py-3.5 text-lg font-mono font-bold tracking-wider rounded-2xl border-2 border-stone-200 bg-stone-50 focus:bg-white focus:border-emerald-600 focus:outline-hidden transition-all text-stone-900"
                />
              </div>
            </div>

            {!otpSent ? (
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={loading}
                className="w-full mt-2 py-4 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white text-base sm:text-lg font-extrabold rounded-2xl shadow-lg shadow-emerald-700/25 flex items-center justify-center gap-3 transition-all cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Sending OTP...' : 'Get Instant OTP'}
                <ArrowRight className="w-5 h-5" />
              </button>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4 pt-2">
                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-bold text-emerald-800">
                      {otpHelper || "OTP Sent to Mobile"}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    className="text-xs font-bold text-emerald-700 underline"
                  >
                    Resend
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5 flex items-center gap-1.5">
                    <KeyRound className="w-4 h-4 text-emerald-600" />
                    Enter 4-Digit OTP
                  </label>
                  <input
                    type="text"
                    maxLength={4}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="1234"
                    className="w-full text-center tracking-[0.5em] py-3 text-2xl font-mono font-black rounded-2xl border-2 border-emerald-500 bg-white focus:outline-hidden transition-all text-stone-900 shadow-inner"
                  />
                  <p className="text-[11px] text-stone-500 text-center mt-1">
                    Demo Mode: Any 4 digits accepted (e.g. 1234)
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white text-base sm:text-lg font-extrabold rounded-2xl shadow-lg shadow-emerald-700/25 flex items-center justify-center gap-3 transition-all cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'Verifying...' : 'Enter Grading Dashboard'}
                  <ArrowRight className="w-5 h-5" />
                </button>
              </form>
            )}

            {/* Quick Demo Pre-fill Button */}
            <div className="pt-3 border-t border-stone-100">
              <button
                type="button"
                onClick={() => {
                  setPhone('9822012345');
                  setFarmerName('Rameshwar Patil');
                  setOtp('1234');
                  setOtpSent(true);
                  loginWithPhone('9822012345', '1234', selectedCentre, 'Rameshwar Patil');
                }}
                className="w-full py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                Quick 1-Click Demo Login
              </button>
            </div>
          </div>
        )}

        {/* ADMIN LOGIN FORM */}
        {tab === 'admin' && (
          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                Admin / Ministry Email
              </label>
              <input
                type="email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                placeholder="admin@kisanastra.gov.in"
                className="w-full px-4 py-3 text-sm font-semibold rounded-2xl border-2 border-stone-200 bg-stone-50 focus:bg-white focus:border-emerald-600 focus:outline-hidden transition-all text-stone-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 text-sm font-semibold rounded-2xl border-2 border-stone-200 bg-stone-50 focus:bg-white focus:border-emerald-600 focus:outline-hidden transition-all text-stone-900"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-stone-900 hover:bg-black active:scale-98 text-white text-base font-extrabold rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Sign In as Admin'}
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="pt-2 text-center text-xs text-stone-500">
              Demo Credentials: <span className="font-mono font-bold text-stone-700">admin@kisanastra.gov.in</span> / <span className="font-mono font-bold text-stone-700">admin123</span>
            </div>
          </form>
        )}

      </div>

      {/* Trust & Transparency Guarantee */}
      <div className="mt-8 flex items-center gap-4 text-stone-500 text-xs font-semibold">
        <span className="flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          Teachable Machine TFJS AI
        </span>
        <span>•</span>
        <span className="flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          No Image Upload Lag
        </span>
        <span>•</span>
        <span className="flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          Transparent Slips
        </span>
      </div>

    </div>
  );
}
