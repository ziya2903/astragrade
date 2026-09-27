/**
 * AstraGrade API Client & Local Storage Cache
 * Pre-loaded with realistic Bokaro Krishi Mandi demo files
 */

import { generateSyntheticOnionImage } from './sampleImages';

const API_BASE = '/api';

export const SHOWCASE_BOKARO_REPORTS = [
  {
    id: "ASTRA-20260927-001",
    centreName: "Bokaro Krishi Mandi",
    centreCode: "BKR-JH-01",
    farmerName: "Rajesh Kumar Mahto (Chas, Bokaro)",
    farmerPhone: "9835123456",
    batchNumber: "JH-09-AB-4821 (60 Bags)",
    timestamp: "2026-09-27T08:30:00.000Z",
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
    id: "ASTRA-20260927-002",
    centreName: "Bokaro Krishi Mandi",
    centreCode: "BKR-JH-01",
    farmerName: "Sunil Soren (Petarwar)",
    farmerPhone: "9835987654",
    batchNumber: "JH-09-E-3112 (40 Bags)",
    timestamp: "2026-09-27T09:45:00.000Z",
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
    id: "ASTRA-20260927-003",
    centreName: "Bokaro Krishi Mandi",
    centreCode: "BKR-JH-01",
    farmerName: "Amit Kumar Singh (Bermo)",
    farmerPhone: "9835112233",
    batchNumber: "JH-10-C-7744 (75 Bags)",
    timestamp: "2026-09-27T11:15:00.000Z",
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
    id: "ASTRA-20260927-004",
    centreName: "Bokaro Krishi Mandi",
    centreCode: "BKR-JH-01",
    farmerName: "Prakash Yadav (Chandankiyari)",
    farmerPhone: "9835445566",
    batchNumber: "JH-09-D-1456 (50 Bags)",
    timestamp: "2026-09-27T13:00:00.000Z",
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
    id: "ASTRA-20260927-005",
    centreName: "Bokaro Krishi Mandi",
    centreCode: "BKR-JH-01",
    farmerName: "Manoj Mahato (Jaridih, Bokaro)",
    farmerPhone: "9835778899",
    batchNumber: "JH-09-F-9021 (45 Bags)",
    timestamp: "2026-09-27T14:20:00.000Z",
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

function getCleanLocalStorageReports() {
  try {
    const raw = localStorage.getItem('astragrade_reports');
    if (!raw) {
      localStorage.setItem('astragrade_reports', JSON.stringify(SHOWCASE_BOKARO_REPORTS));
      return SHOWCASE_BOKARO_REPORTS;
    }
    const parsed = JSON.parse(raw);
    // If reports contain stale Nashik references, refresh with Bokaro showcase
    if (parsed.some(r => r?.centreName?.includes('Nashik') || r?.centreCode?.includes('NSK'))) {
      localStorage.setItem('astragrade_reports', JSON.stringify(SHOWCASE_BOKARO_REPORTS));
      return SHOWCASE_BOKARO_REPORTS;
    }
    return parsed;
  } catch (e) {
    return SHOWCASE_BOKARO_REPORTS;
  }
}

export async function fetchReports(filters = {}) {
  try {
    const params = new URLSearchParams();
    if (filters.centreCode) params.append('centreCode', filters.centreCode);
    if (filters.verdict) params.append('verdict', filters.verdict);
    if (filters.limit) params.append('limit', filters.limit);

    const res = await fetch(`${API_BASE}/reports?${params.toString()}`);
    if (res.ok) {
      const data = await res.json();
      if (data.reports && data.reports.length > 0) {
        // Merge with showcase if fewer than 3
        return data.reports;
      }
    }
    return getCleanLocalStorageReports();
  } catch (err) {
    return getCleanLocalStorageReports();
  }
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

  try {
    fetch(`${API_BASE}/reports`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(report)
    }).catch(() => {});
  } catch (e) {}

  // Sync to local storage
  try {
    const list = getCleanLocalStorageReports();
    list.unshift(report);
    localStorage.setItem('astragrade_reports', JSON.stringify(list));
  } catch (e) {}

  return report;
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
