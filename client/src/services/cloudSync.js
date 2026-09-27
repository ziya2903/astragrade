/**
 * AstraGrade Hybrid Cloud Sync Service (Option C)
 * Local-First + Background Cloud Sync
 * 
 * Works 100% offline at rural mandi weighbridges and automatically
 * synchronizes with Cloud API & Supabase when online.
 */

import { createClient } from '@supabase/supabase-js';

const STORAGE_KEY = 'astragrade_reports';
const SYNC_CONFIG_KEY = 'astragrade_supabase_config';
const API_BASE = '/api';

// Listeners for reactive UI sync status updates
const listeners = new Set();
let currentStatus = {
  state: 'idle', // 'idle' | 'syncing' | 'synced' | 'offline' | 'error'
  lastSyncTime: null,
  pendingCount: 0,
  error: null
};

export function subscribeSyncStatus(callback) {
  listeners.add(callback);
  callback(currentStatus);
  return () => listeners.delete(callback);
}

function updateStatus(newStatus) {
  currentStatus = { ...currentStatus, ...newStatus };
  listeners.forEach(fn => {
    try { fn(currentStatus); } catch (e) {}
  });
}

// Supabase client instance (initialized if configured)
let supabaseClient = null;

export function getSupabaseConfig() {
  try {
    const raw = localStorage.getItem(SYNC_CONFIG_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}

  // Fallback to Vite env variables if supplied at build
  if (import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY) {
    return {
      url: import.meta.env.VITE_SUPABASE_URL,
      anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY
    };
  }
  return null;
}

export function saveSupabaseConfig(config) {
  if (!config || !config.url || !config.anonKey) {
    localStorage.removeItem(SYNC_CONFIG_KEY);
    supabaseClient = null;
    return;
  }
  localStorage.setItem(SYNC_CONFIG_KEY, JSON.stringify(config));
  initSupabaseClient(config);
}

function initSupabaseClient(config) {
  if (config && config.url && config.anonKey) {
    try {
      supabaseClient = createClient(config.url, config.anonKey, {
        auth: { persistSession: false }
      });
    } catch (e) {
      console.warn("Supabase init error:", e);
      supabaseClient = null;
    }
  } else {
    supabaseClient = null;
  }
}

// Initialize on module load
initSupabaseClient(getSupabaseConfig());

/**
 * Merge two lists of reports without duplicates, keeping latest timestamps
 */
export function mergeReports(localReports, remoteReports) {
  let deletedIds = new Set(['ASTRA-20260927-004', 'ASTRA-20260927-005']);
  try {
    const raw = localStorage.getItem('astragrade_deleted_ids');
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) arr.forEach(id => deletedIds.add(id));
    }
  } catch (e) {}

  const now = Date.now() + 60000;
  const map = new Map();
  const seenMinuteKey = new Map();

  const all = [...(localReports || []), ...(remoteReports || [])];
  
  // Sort descending by timestamp first (newest scans always first)
  all.sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0));

  const result = [];
  for (const r of all) {
    if (!r || !r.id) continue;
    if (deletedIds.has(r.id)) continue;

    // Prune future timestamps
    const t = new Date(r.timestamp).getTime();
    if (!isNaN(t) && t > now) continue;

    if (map.has(r.id)) continue;

    // Prune identical duplicate spam created in loops
    const minuteKey = `${r.farmerName}_${r.batchNumber}_${(r.timestamp || '').slice(0, 16)}`;
    if (seenMinuteKey.has(minuteKey)) continue;

    map.set(r.id, r);
    seenMinuteKey.set(minuteKey, r.id);
    result.push(r);
  }

  return result;
}

let isSyncingActive = false;

/**
 * Perform Bidirectional Sync between Local Storage and Cloud Backend
 */
export async function syncWithCloud() {
  if (isSyncingActive) return getLocalReports();

  if (!navigator.onLine) {
    updateStatus({ state: 'offline', error: 'No internet connection' });
    return getLocalReports();
  }

  isSyncingActive = true;
  updateStatus({ state: 'syncing', error: null });

  try {
    // 0. Pull server-deleted IDs to sync deletions across laptop and mobile
    try {
      const delRes = await fetch(`${API_BASE}/reports/deleted`);
      if (delRes.ok) {
        const delData = await delRes.json();
        if (Array.isArray(delData.deletedIds)) {
          let localDel = new Set(['ASTRA-20260927-004', 'ASTRA-20260927-005']);
          try {
            const raw = localStorage.getItem('astragrade_deleted_ids');
            if (raw) JSON.parse(raw).forEach(id => localDel.add(id));
          } catch (e) {}
          delData.deletedIds.forEach(id => localDel.add(id));
          localStorage.setItem('astragrade_deleted_ids', JSON.stringify([...localDel]));
        }
      }
    } catch (e) {}

    const localReports = getLocalReports();
    let remoteReports = [];
    let syncSuccess = false;

    // 1. Try Vercel Serverless / Express API
    try {
      const res = await fetch(`${API_BASE}/reports?limit=100`, {
        headers: { 'Accept': 'application/json' }
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.reports)) {
          remoteReports = data.reports;
          syncSuccess = true;
        }
      }
    } catch (err) {}

    // 2. Try Supabase if configured
    if (supabaseClient) {
      try {
        const { data, error } = await supabaseClient
          .from('reports')
          .select('*')
          .order('timestamp', { ascending: false })
          .limit(100);

        if (!error && Array.isArray(data)) {
          remoteReports = [...remoteReports, ...data];
          syncSuccess = true;
        }
      } catch (e) {}
    }

    // Merge local & remote reports (respecting tombstones & timestamps)
    const merged = mergeReports(localReports, remoteReports);

    // Write merged back to local storage
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    } catch (e) {}

    // Push local reports that were missing on remote (max 5 at a time, never push deleted ones)
    if (syncSuccess) {
      let currentDeleted = new Set(['ASTRA-20260927-004', 'ASTRA-20260927-005']);
      try {
        const raw = localStorage.getItem('astragrade_deleted_ids');
        if (raw) JSON.parse(raw).forEach(id => currentDeleted.add(id));
      } catch (e) {}

      const remoteIdSet = new Set(remoteReports.map(r => r.id));
      const unsyncedLocals = merged.filter(r => !remoteIdSet.has(r.id) && !currentDeleted.has(r.id)).slice(0, 5);

      for (const report of unsyncedLocals) {
        try {
          await fetch(`${API_BASE}/reports`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(report)
          });
        } catch (e) {}

        if (supabaseClient) {
          try {
            await supabaseClient.from('reports').upsert(report);
          } catch (e) {}
        }
      }

      updateStatus({
        state: 'synced',
        lastSyncTime: new Date().toISOString(),
        pendingCount: 0,
        error: null
      });
    } else {
      updateStatus({
        state: 'offline',
        lastSyncTime: currentStatus.lastSyncTime || null,
        error: 'Saved locally on device (Cloud unreachable)'
      });
    }

    return merged;
  } finally {
    isSyncingActive = false;
  }
}

/**
 * Get Reports from Local Storage
 */
export function getLocalReports() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

/**
 * Export all reports as a JSON string (for offline file transfer / QR)
 */
export function exportReportsJSON() {
  const reports = getLocalReports();
  return JSON.stringify(reports, null, 2);
}

/**
 * Import reports from a JSON string or file
 */
export function importReportsJSON(jsonString) {
  try {
    const parsed = JSON.parse(jsonString);
    if (!Array.isArray(parsed)) throw new Error("Imported data must be an array of reports");
    const current = getLocalReports();
    const merged = mergeReports(current, parsed);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    // Trigger background sync to propagate to cloud
    syncWithCloud().catch(() => {});
    return { success: true, count: merged.length };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

// Auto-sync event listeners
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    syncWithCloud().catch(() => {});
  });
  window.addEventListener('focus', () => {
    // Periodic refresh on tab focus
    syncWithCloud().catch(() => {});
  });
  // Auto-sync initial kick after 1.5 seconds
  setTimeout(() => {
    syncWithCloud().catch(() => {});
  }, 1500);
}
