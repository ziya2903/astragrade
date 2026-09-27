/**
 * AstraGrade API Client & Local Storage Cache
 * Pre-loaded with realistic Bokaro Krishi Mandi demo files
 */

import { generateSyntheticOnionImage } from './sampleImages';
import { syncWithCloud, mergeReports } from './cloudSync';

const API_BASE = '/api';

export const SHOWCASE_BOKARO_REPORTS = [
  {
    id: "ASTRA-20260926-001",
    centreName: "Bokaro Krishi Mandi",
    centreCode: "BKR-JH-01",
    farmerName: "Rajesh Kumar Mahto (Chas, Bokaro)",
    farmerPhone: "9835123456",
    batchNumber: "JH-09-AB-4821 (60 Bags)",
    timestamp: "2026-09-26T06:30:00.000Z",
    sampleCount: 5,
    gradeAPercent: 89.2,
    ursPercent: 10.8,
    breakdown: {
      gradeA: 89.2,
      rotten: 2.1,
      sprouted: 3.5,
      undersized: 5.2
    },
    dominantClass: "GradeA",
    verdict: "Grade A",
    verdictMessage: "This batch qualifies as Grade A. Firm, dry neck, premium export quality. Approved for Mandi MSP.",
    inspectorName: "Bokaro Gate Inspector (Gate #1)",
    sampleThumbnails: [
      generateSyntheticOnionImage('GradeA'),
      generateSyntheticOnionImage('GradeA'),
      generateSyntheticOnionImage('GradeA'),
      generateSyntheticOnionImage('GradeA'),
      generateSyntheticOnionImage('GradeA')
    ]
  },
  {
    id: "ASTRA-20260926-002",
    centreName: "Bokaro Krishi Mandi",
    centreCode: "BKR-JH-01",
    farmerName: "Sunil Soren (Petarwar)",
    farmerPhone: "9835987654",
    batchNumber: "JH-09-E-3112 (40 Bags)",
    timestamp: "2026-09-26T07:15:00.000Z",
    sampleCount: 5,
    gradeAPercent: 41.6,
    ursPercent: 58.4,
    breakdown: {
      gradeA: 41.6,
      rotten: 8.2,
      sprouted: 38.2,
      undersized: 12.0
    },
    dominantClass: "Sprouted",
    verdict: "URS",
    verdictMessage: "This batch falls under URS category due to high vegetative sprouting (38.2%). Not eligible for Grade A.",
    inspectorName: "Bokaro Gate Inspector (Gate #1)",
    sampleThumbnails: [
      generateSyntheticOnionImage('Sprouted'),
      generateSyntheticOnionImage('GradeA'),
      generateSyntheticOnionImage('Sprouted'),
      generateSyntheticOnionImage('Sprouted'),
      generateSyntheticOnionImage('GradeA')
    ]
  },
  {
    id: "ASTRA-20260926-003",
    centreName: "Bokaro Krishi Mandi",
    centreCode: "BKR-JH-01",
    farmerName: "Amit Kumar Singh (Bermo)",
    farmerPhone: "9835112233",
    batchNumber: "JH-10-C-7744 (75 Bags)",
    timestamp: "2026-09-26T08:00:00.000Z",
    sampleCount: 5,
    gradeAPercent: 84.6,
    ursPercent: 15.4,
    breakdown: {
      gradeA: 84.6,
      rotten: 3.2,
      sprouted: 4.8,
      undersized: 7.4
    },
    dominantClass: "GradeA",
    verdict: "Grade A",
    verdictMessage: "This batch qualifies as Grade A. High uniform diameter (>55mm) with dry outer papery scales.",
    inspectorName: "Bokaro Gate Inspector (Gate #1)",
    sampleThumbnails: [
      generateSyntheticOnionImage('GradeA'),
      generateSyntheticOnionImage('GradeA'),
      generateSyntheticOnionImage('GradeA'),
      generateSyntheticOnionImage('GradeA'),
      generateSyntheticOnionImage('Undersized')
    ]
  },
  {
    id: "ASTRA-20260926-004",
    centreName: "Bokaro Krishi Mandi",
    centreCode: "BKR-JH-01",
    farmerName: "Prakash Yadav (Chandankiyari)",
    farmerPhone: "9835445566",
    batchNumber: "JH-09-D-1456 (50 Bags)",
    timestamp: "2026-09-26T08:45:00.000Z",
    sampleCount: 5,
    gradeAPercent: 35.8,
    ursPercent: 64.2,
    breakdown: {
      gradeA: 35.8,
      rotten: 5.4,
      sprouted: 11.2,
      undersized: 47.6
    },
    dominantClass: "Undersized",
    verdict: "URS",
    verdictMessage: "This batch falls under URS category primarily due to undersized bulbs (< 45mm diameter).",
    inspectorName: "Bokaro Gate Inspector (Gate #1)",
    sampleThumbnails: [
      generateSyntheticOnionImage('Undersized'),
      generateSyntheticOnionImage('Undersized'),
      generateSyntheticOnionImage('GradeA'),
      generateSyntheticOnionImage('Undersized'),
      generateSyntheticOnionImage('GradeA')
    ]
  },
  {
    id: "ASTRA-20260926-005",
    centreName: "Bokaro Krishi Mandi",
    centreCode: "BKR-JH-01",
    farmerName: "Manoj Mahato (Jaridih, Bokaro)",
    farmerPhone: "9835778899",
    batchNumber: "JH-09-F-9021 (45 Bags)",
    timestamp: "2026-09-26T09:30:00.000Z",
    sampleCount: 5,
    gradeAPercent: 42.0,
    ursPercent: 58.0,
    breakdown: {
      gradeA: 42.0,
      rotten: 36.5,
      sprouted: 9.5,
      undersized: 12.0
    },
    dominantClass: "Rotten",
    verdict: "URS",
    verdictMessage: "This batch falls under URS category due to severe wet rot and black mold decay (36.5%).",
    inspectorName: "Bokaro Gate Inspector (Gate #1)",
    sampleThumbnails: [
      generateSyntheticOnionImage('Rotten'),
      generateSyntheticOnionImage('GradeA'),
      generateSyntheticOnionImage('Rotten'),
      generateSyntheticOnionImage('GradeA'),
      generateSyntheticOnionImage('Rotten')
    ]
  }
];

export function getDeletedReportIds() {
  try {
    const raw = localStorage.getItem('astragrade_deleted_ids');
    const set = new Set(raw ? JSON.parse(raw) : []);
    // Always blacklist corrupt future seed IDs from ever appearing
    set.add('ASTRA-20260927-004');
    set.add('ASTRA-20260927-005');
    return set;
  } catch (e) {
    return new Set(['ASTRA-20260927-004', 'ASTRA-20260927-005']);
  }
}

export function recordDeletedReportId(id) {
  try {
    const set = getDeletedReportIds();
    set.add(id);
    localStorage.setItem('astragrade_deleted_ids', JSON.stringify(Array.from(set)));
  } catch (e) {}
}

function getCleanLocalStorageReports() {
  const deletedIds = getDeletedReportIds();
  const now = Date.now() + 60000; // 1 min buffer for device clock variation

  try {
    const raw = localStorage.getItem('astragrade_reports');
    if (!raw) {
      const seeded = localStorage.getItem('astragrade_seeded');
      if (!seeded) {
        localStorage.setItem('astragrade_seeded', 'true');
        const initial = SHOWCASE_BOKARO_REPORTS.filter(r => !deletedIds.has(r.id));
        localStorage.setItem('astragrade_reports', JSON.stringify(initial));
        return initial;
      }
      return [];
    }

    let parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    // Purge stale Nashik
    if (parsed.some(r => r?.centreName?.includes('Nashik') || r?.centreCode?.includes('NSK'))) {
      parsed = SHOWCASE_BOKARO_REPORTS;
    }

    // Smart deduplication and tombstone pruning
    const seenMinutes = new Set();
    const seenIds = new Set();
    const deduplicated = [];

    for (const r of parsed) {
      if (!r || !r.id) continue;
      // Drop deleted IDs
      if (deletedIds.has(r.id)) continue;
      if (seenIds.has(r.id)) continue;

      // Drop future timestamps
      const t = new Date(r.timestamp).getTime();
      if (!isNaN(t) && t > now) continue;

      // Group by farmer + batch + minute (removes identical loop copies)
      const minuteKey = `${r.farmerName}_${r.batchNumber}_${(r.timestamp || '').slice(0, 16)}`;
      if (seenMinutes.has(minuteKey)) continue;

      seenIds.add(r.id);
      seenMinutes.add(minuteKey);
      deduplicated.push(r);
    }

    // Sort descending by timestamp (newest scans ALWAYS on top)
    deduplicated.sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0));

    localStorage.setItem('astragrade_reports', JSON.stringify(deduplicated));
    return deduplicated;
  } catch (e) {
    return [];
  }
}

export async function resetAllReportsToDefault() {
  try {
    localStorage.setItem('astragrade_reports', JSON.stringify(SHOWCASE_BOKARO_REPORTS));
    await fetch(`${API_BASE}/reports/reset`, { method: 'POST' }).catch(() => {});
  } catch (e) {}
  return SHOWCASE_BOKARO_REPORTS;
}

export async function fetchReports(filters = {}) {
  let list = getCleanLocalStorageReports();

  try {
    const params = new URLSearchParams();
    if (filters.centreCode) params.append('centreCode', filters.centreCode);
    if (filters.verdict) params.append('verdict', filters.verdict);
    if (filters.limit) params.append('limit', filters.limit);

    const res = await fetch(`${API_BASE}/reports?${params.toString()}`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.reports) && data.reports.length > 0) {
        // Merge cloud reports with local reports
        list = mergeReports(list, data.reports);
        localStorage.setItem('astragrade_reports', JSON.stringify(list));
      }
    }
  } catch (err) {}

  // Apply filters
  let filtered = list;
  if (filters.verdict && filters.verdict !== 'ALL') {
    filtered = filtered.filter(r => r.verdict?.toLowerCase() === filters.verdict?.toLowerCase());
  }

  // Strictly enforce limit if requested (e.g. limit: 5 on Dashboard!)
  if (filters.limit) {
    filtered = filtered.slice(0, Number(filters.limit));
  }

  return filtered;
}

export async function fetchReportById(id) {
  try {
    const res = await fetch(`${API_BASE}/reports/${id}`);
    if (res.ok) {
      const data = await res.json();
      if (data.report) return data.report;
    }
  } catch (err) {}

  const list = getCleanLocalStorageReports();
  return list.find(r => r.id === id) || list[0] || null;
}

export async function saveReport(reportData) {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const report = {
    ...reportData,
    id: `ASTRA-${dateStr}-${Math.floor(100 + Math.random() * 900)}`,
    timestamp: new Date().toISOString()
  };

  // 1. Instant local-first write (0ms offline support)
  try {
    const list = getCleanLocalStorageReports();
    list.unshift(report);
    localStorage.setItem('astragrade_reports', JSON.stringify(list));
  } catch (e) {}

  // 2. Background sync to cloud
  try {
    fetch(`${API_BASE}/reports`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(report)
    }).then(() => {
      syncWithCloud().catch(() => {});
    }).catch(() => {});
  } catch (e) {}

  return report;
}

export async function deleteReport(id) {
  // 1. Record in tombstone registry so cloud sync never resurrects it
  recordDeletedReportId(id);

  // 2. Instant local deletion
  let updated = [];
  try {
    const list = getCleanLocalStorageReports();
    updated = list.filter(r => r.id !== id);
    localStorage.setItem('astragrade_reports', JSON.stringify(updated));
  } catch (e) {}

  // 3. Propagate deletion to serverless API
  try {
    fetch(`${API_BASE}/reports/${id}`, {
      method: 'DELETE'
    }).catch(() => {});
  } catch (e) {}

  return updated;
}

export async function fetchAdminStats() {
  const reports = await fetchReports();
  const totalBatches = reports.length;
  const gradeACount = reports.filter(r => r.verdict === 'Grade A').length;
  const avgGradeA = totalBatches > 0
    ? Number((reports.reduce((acc, r) => acc + (r.gradeAPercent || 0), 0) / totalBatches).toFixed(1))
    : 0;

  return {
    totalBatches,
    avgGradeAPercent: avgGradeA,
    gradeACount,
    ursCount: totalBatches - gradeACount,
    centrePerformance: [
      { name: "Bokaro Krishi Mandi", totalBatches, avgGradeA, gradeACount, ursCount: totalBatches - gradeACount, flagged: avgGradeA < 50 }
    ]
  };
}
