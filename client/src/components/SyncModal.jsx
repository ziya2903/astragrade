import React, { useState, useEffect, useRef } from 'react';
import { 
  Cloud, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  Database, 
  Download, 
  Upload, 
  X, 
  Smartphone, 
  Laptop, 
  ShieldCheck,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { 
  subscribeSyncStatus, 
  syncWithCloud, 
  getSupabaseConfig, 
  saveSupabaseConfig, 
  exportReportsJSON, 
  importReportsJSON,
  getLocalReports 
} from '../services/cloudSync';

export default function SyncModal({ isOpen, onClose, onSyncComplete }) {
  const [syncStatus, setSyncStatus] = useState({ state: 'idle', lastSyncTime: null });
  const [isManualSyncing, setIsManualSyncing] = useState(false);
  const [localCount, setLocalCount] = useState(0);
  const [showConfig, setShowConfig] = useState(false);
  
  // Supabase Config form
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseKey, setSupabaseKey] = useState('');
  const [configSaved, setConfigSaved] = useState(false);
  const [importNotice, setImportNotice] = useState(null);

  const fileInputRef = useRef(null);

  useEffect(() => {
    const unsubscribe = subscribeSyncStatus(status => {
      setSyncStatus(status);
    });
    setLocalCount(getLocalReports().length);

    const config = getSupabaseConfig();
    if (config) {
      setSupabaseUrl(config.url || '');
      setSupabaseKey(config.anonKey || '');
    }

    return () => unsubscribe();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleManualSync = async () => {
    setIsManualSyncing(true);
    try {
      const merged = await syncWithCloud();
      setLocalCount(merged.length);
      if (onSyncComplete) onSyncComplete();
    } catch (e) {
      console.error(e);
    } finally {
      setIsManualSyncing(false);
    }
  };

  const handleSaveConfig = (e) => {
    e.preventDefault();
    if (!supabaseUrl.trim() || !supabaseKey.trim()) {
      saveSupabaseConfig(null);
      setConfigSaved(true);
      setTimeout(() => setConfigSaved(false), 2000);
      return;
    }
    saveSupabaseConfig({
      url: supabaseUrl.trim(),
      anonKey: supabaseKey.trim()
    });
    setConfigSaved(true);
    setTimeout(() => {
      setConfigSaved(false);
      handleManualSync();
    }, 1500);
  };

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(exportReportsJSON());
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `astragrade-reports-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = importReportsJSON(event.target.result);
      if (result.success) {
        setImportNotice({ type: 'success', text: `Imported & merged ${result.count} reports!` });
        setLocalCount(result.count);
        if (onSyncComplete) onSyncComplete();
      } else {
        setImportNotice({ type: 'error', text: result.error || 'Failed to parse JSON file' });
      }
      setTimeout(() => setImportNotice(null), 3000);
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const isSynced = syncStatus.state === 'synced';
  const isSyncing = syncStatus.state === 'syncing' || isManualSyncing;
  const isOffline = syncStatus.state === 'offline';

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border-2 border-[#e6dfd1] overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-[#0d3b32] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-stone-950 flex items-center justify-center font-black">
              <Cloud className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight">Mandi Cloud & Device Sync</h3>
              <p className="text-xs text-emerald-200 font-bold">Hybrid Local-First Sync Architecture</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 overflow-y-auto">
          
          {/* Status Overview Card */}
          <div className="p-4 rounded-2xl bg-stone-50 border-2 border-stone-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-stone-500">Live Status</span>
              <div className="flex items-center gap-1.5">
                <span className={`w-2.5 h-2.5 rounded-full ${
                  isSynced ? 'bg-emerald-500' : isSyncing ? 'bg-amber-500 animate-ping' : 'bg-stone-400'
                }`} />
                <span className="text-xs font-black text-stone-900">
                  {isSyncing ? 'Syncing...' : isSynced ? 'Cloud Synchronized' : isOffline ? 'Offline (Saved on Device)' : 'Ready'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1 text-xs">
              <div className="bg-white p-2.5 rounded-xl border border-stone-200">
                <span className="text-stone-400 block text-[10px] font-bold uppercase">Local Reports</span>
                <span className="text-base font-black text-stone-950">{localCount} batches</span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-stone-200">
                <span className="text-stone-400 block text-[10px] font-bold uppercase">Last Synced</span>
                <span className="text-xs font-bold text-stone-800">
                  {syncStatus.lastSyncTime 
                    ? new Date(syncStatus.lastSyncTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
                    : 'Not synced yet'}
                </span>
              </div>
            </div>

            {/* Instant Manual Sync Trigger */}
            <button
              onClick={handleManualSync}
              disabled={isSyncing}
              className="w-full py-3 bg-[#0d3b32] hover:bg-[#092c25] active:scale-98 text-white rounded-xl text-xs font-black flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50 min-h-[44px]"
            >
              <RefreshCw className={`w-4 h-4 text-amber-300 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Synchronizing Batches...' : 'Sync Now with Cloud'}</span>
            </button>
          </div>

          {/* Cross-Device Demonstration Pill */}
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-950 flex items-start gap-3">
            <div className="flex items-center gap-1 shrink-0 pt-0.5">
              <Smartphone className="w-4 h-4 text-amber-700" />
              <span className="text-stone-400">↔</span>
              <Laptop className="w-4 h-4 text-amber-700" />
            </div>
            <div>
              <p className="font-bold">
                Reports scanned on mobile and laptop automatically merge here.
              </p>
              <p className="text-[11px] text-amber-800 mt-0.5">
                Even without internet at the gate, scans are saved locally and sync immediately when connectivity returns.
              </p>
            </div>
          </div>

          {/* Offline File Transfer / Backup Section */}
          <div className="p-4 rounded-2xl bg-stone-100 border border-stone-200 space-y-3">
            <span className="text-xs font-black text-stone-700 block uppercase tracking-wider">
              Offline Data Transfer (No Internet Required)
            </span>
            <p className="text-[11px] text-stone-600 font-semibold">
              Transfer reports between gate phone and office laptop via WhatsApp, USB, or Bluetooth:
            </p>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleExport}
                className="py-2.5 px-3 bg-white hover:bg-stone-50 border border-stone-300 text-stone-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-emerald-700" />
                <span>Export JSON</span>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="py-2.5 px-3 bg-white hover:bg-stone-50 border border-stone-300 text-stone-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-colors"
              >
                <Upload className="w-3.5 h-3.5 text-indigo-700" />
                <span>Import JSON</span>
              </button>
            </div>

            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImportFile} 
              accept=".json" 
              className="hidden" 
            />

            {importNotice && (
              <div className={`p-2.5 rounded-xl text-xs font-bold text-center ${
                importNotice.type === 'success' ? 'bg-emerald-100 text-emerald-900' : 'bg-rose-100 text-rose-900'
              }`}>
                {importNotice.text}
              </div>
            )}
          </div>

          {/* Optional Supabase Cloud Settings (Collapsible) */}
          <div className="border border-stone-200 rounded-2xl overflow-hidden">
            <button
              onClick={() => setShowConfig(!showConfig)}
              className="w-full p-3.5 bg-stone-50 hover:bg-stone-100 text-stone-800 text-xs font-black flex items-center justify-between transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-[#0d3b32]" />
                <span>Enterprise Cloud Database (Supabase)</span>
              </div>
              {showConfig ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showConfig && (
              <form onSubmit={handleSaveConfig} className="p-4 space-y-3 bg-white border-t border-stone-200 text-xs">
                <p className="text-[11px] text-stone-500 font-bold">
                  Connect your own private Supabase project for real-time PostgreSQL database synchronization across unlimited devices.
                </p>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-stone-600 block mb-1">
                    Supabase Project URL
                  </label>
                  <input
                    type="url"
                    value={supabaseUrl}
                    onChange={(e) => setSupabaseUrl(e.target.value)}
                    placeholder="https://xyzcompany.supabase.co"
                    className="w-full p-2.5 rounded-xl border border-stone-300 font-mono text-xs focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-stone-600 block mb-1">
                    Supabase Anon Public API Key
                  </label>
                  <input
                    type="password"
                    value={supabaseKey}
                    onChange={(e) => setSupabaseKey(e.target.value)}
                    placeholder="eyJhbGciOiJIUzI1NiIsIn..."
                    className="w-full p-2.5 rounded-xl border border-stone-300 font-mono text-xs focus:outline-hidden"
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-stone-400">Leave blank to use default Vercel Cloud API</span>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#0d3b32] text-white font-bold rounded-xl text-xs hover:bg-[#092c25] cursor-pointer"
                  >
                    Save & Connect
                  </button>
                </div>

                {configSaved && (
                  <p className="text-emerald-700 font-black text-center text-xs">
                    ✓ Cloud configuration saved successfully!
                  </p>
                )}
              </form>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-100 border-t border-stone-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-stone-900 text-white rounded-xl text-xs font-black hover:bg-black cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
