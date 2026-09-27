const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '15mb' }));

const DATA_DIR = process.env.VERCEL ? '/tmp' : path.join(__dirname, 'data');
const REPORTS_FILE = path.join(DATA_DIR, 'reports.json');

try {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
} catch (e) {
  console.warn("Could not create DATA_DIR:", e.message);
}

// Initial seed data for Bokaro Mandi, Jharkhand
const INITIAL_REPORTS = [
  {
    id: "ASTRA-20260927-001",
    centreName: "Bokaro Krishi Mandi",
    centreCode: "BKR-JH-01",
    farmerName: "Rajesh Mahto",
    farmerPhone: "9835123456",
    batchNumber: "LOT-JH-501",
    timestamp: "2026-09-27T08:30:00.000Z",
    sampleCount: 5,
    gradeAPercent: 82.0,
    ursPercent: 18.0,
    breakdown: {
      gradeA: 82.0,
      rotten: 3.5,
      sprouted: 5.5,
      undersized: 9.0
    },
    dominantClass: "GradeA",
    verdict: "Grade A",
    verdictMessage: "This batch qualifies as Grade A. Approved for standard procurement price.",
    inspectorName: "Mandi Officer (Bokaro)"
  },
  {
    id: "ASTRA-20260927-002",
    centreName: "Bokaro Krishi Mandi",
    centreCode: "BKR-JH-01",
    farmerName: "Sanjay Kumar",
    farmerPhone: "9835987654",
    batchNumber: "LOT-JH-502",
    timestamp: "2026-09-27T09:45:00.000Z",
    sampleCount: 5,
    gradeAPercent: 46.0,
    ursPercent: 54.0,
    breakdown: {
      gradeA: 46.0,
      rotten: 12.0,
      sprouted: 14.0,
      undersized: 28.0
    },
    dominantClass: "Undersized",
    verdict: "URS",
    verdictMessage: "This batch falls under URS category primarily due to undersized bulbs (< 45mm).",
    inspectorName: "Mandi Officer (Bokaro)"
  },
  {
    id: "ASTRA-20260927-003",
    centreName: "Bokaro Krishi Mandi",
    centreCode: "BKR-JH-01",
    farmerName: "Amit Singh",
    farmerPhone: "9835112233",
    batchNumber: "LOT-JH-503",
    timestamp: "2026-09-27T11:15:00.000Z",
    sampleCount: 5,
    gradeAPercent: 74.5,
    ursPercent: 25.5,
    breakdown: {
      gradeA: 74.5,
      rotten: 5.5,
      sprouted: 8.0,
      undersized: 12.0
    },
    dominantClass: "GradeA",
    verdict: "Grade A",
    verdictMessage: "This batch qualifies as Grade A. Approved for standard procurement price.",
    inspectorName: "Mandi Officer (Bokaro)"
  }
];

// Write seed reports if not present
try {
  if (!fs.existsSync(REPORTS_FILE)) {
    fs.writeFileSync(REPORTS_FILE, JSON.stringify(INITIAL_REPORTS, null, 2));
  }
} catch (e) {
  console.warn("Could not write REPORTS_FILE:", e.message);
}

function getStoredReports() {
  try {
    const data = fs.readFileSync(REPORTS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading reports file:", err);
    return INITIAL_REPORTS;
  }
}

function saveStoredReports(reports) {
  const tmpFile = `${REPORTS_FILE}.tmp`;
  try {
    fs.writeFileSync(tmpFile, JSON.stringify(reports, null, 2));
    fs.renameSync(tmpFile, REPORTS_FILE);
  } catch (err) {
    console.error("Error writing reports file atomically:", err);
  }
}

const CENTRES = [
  { id: "BKR-JH-01", name: "Bokaro Krishi Mandi", state: "Jharkhand", district: "Bokaro" },
  { id: "RNC-JH-02", name: "Ranchi APMC Hub", state: "Jharkhand", district: "Ranchi" },
  { id: "DHN-JH-03", name: "Dhanbad Agri Yard", state: "Jharkhand", district: "Dhanbad" }
];

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'AstraGrade API',
    location: 'Bokaro, Jharkhand',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/centres', (req, res) => {
  res.json({ success: true, centres: CENTRES });
});

app.get('/api/reports', (req, res) => {
  const { centreCode, verdict, limit } = req.query;
  let reports = getStoredReports();

  if (centreCode) {
    reports = reports.filter(r => r.centreCode === centreCode);
  }
  if (verdict) {
    reports = reports.filter(r => r.verdict.toLowerCase() === verdict.toLowerCase());
  }

  reports.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  if (limit) {
    reports = reports.slice(0, parseInt(limit, 10));
  }

  res.json({ success: true, count: reports.length, reports });
});

app.get('/api/reports/:id', (req, res) => {
  const reports = getStoredReports();
  const report = reports.find(r => r.id === req.params.id);
  if (!report) {
    return res.status(404).json({ success: false, message: 'Report not found' });
  }
  res.json({ success: true, report });
});

app.post('/api/reports', (req, res) => {
  const {
    centreName,
    centreCode,
    farmerName,
    farmerPhone,
    batchNumber,
    sampleCount,
    gradeAPercent,
    ursPercent,
    breakdown,
    dominantClass,
    verdict,
    verdictMessage,
    inspectorName,
    sampleThumbnails,
    imagesData
  } = req.body;

  if (gradeAPercent === undefined || ursPercent === undefined) {
    return res.status(400).json({ success: false, message: 'Percentages required' });
  }

  const reports = getStoredReports();
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const uniqueSeq = String(reports.length + 1).padStart(3, '0');
  const targetId = req.body.id || `ASTRA-${dateStr}-${uniqueSeq}`;

  const newReport = {
    id: targetId,
    centreName: centreName || "Bokaro Krishi Mandi",
    centreCode: centreCode || "BKR-JH-01",
    farmerName: farmerName || "Farmer Lot",
    farmerPhone: farmerPhone || "N/A",
    batchNumber: batchNumber || `LOT-${Math.floor(100 + Math.random() * 900)}`,
    timestamp: req.body.timestamp || new Date().toISOString(),
    sampleCount: sampleCount || 1,
    gradeAPercent: Number(Number(gradeAPercent).toFixed(1)),
    ursPercent: Number(Number(ursPercent).toFixed(1)),
    breakdown: {
      gradeA: Number(Number(breakdown?.gradeA || gradeAPercent).toFixed(1)),
      rotten: Number(Number(breakdown?.rotten || 0).toFixed(1)),
      sprouted: Number(Number(breakdown?.sprouted || 0).toFixed(1)),
      undersized: Number(Number(breakdown?.undersized || 0).toFixed(1))
    },
    dominantClass: dominantClass || (gradeAPercent >= 60 ? 'GradeA' : 'Undersized'),
    verdict: verdict || (gradeAPercent >= 60 ? "Grade A" : "URS"),
    verdictMessage: verdictMessage || (gradeAPercent >= 60
      ? "This batch qualifies as Grade A. Approved for standard procurement price."
      : "This batch falls under URS category. Quality falls below standard Grade A baseline."),
    inspectorName: inspectorName || "Mandi Officer (Bokaro)",
    sampleThumbnails: sampleThumbnails || [],
    imagesCount: sampleCount || 1
  };

  const existingIndex = reports.findIndex(r => r.id === targetId);
  if (existingIndex >= 0) {
    reports[existingIndex] = { ...reports[existingIndex], ...newReport };
  } else {
    reports.unshift(newReport);
  }
  saveStoredReports(reports);

  res.status(201).json({ success: true, report: newReport });
});

app.post('/api/reports/reset', (req, res) => {
  saveStoredReports(INITIAL_REPORTS);
  res.json({ success: true, reports: INITIAL_REPORTS });
});

app.delete('/api/reports/:id', (req, res) => {
  const { id } = req.params;
  let reports = getStoredReports();
  const initialLength = reports.length;
  reports = reports.filter(r => r.id !== id);
  saveStoredReports(reports);
  res.json({ success: true, deleted: reports.length < initialLength, id });
});

app.get('/api/admin/stats', (req, res) => {
  const reports = getStoredReports();
  const totalBatches = reports.length;

  if (totalBatches === 0) {
    return res.json({
      success: true,
      stats: { totalBatches: 0, avgGradeAPercent: 0, gradeACount: 0, ursCount: 0, centrePerformance: [] }
    });
  }

  const totalGradeASum = reports.reduce((acc, r) => acc + (r.gradeAPercent || 0), 0);
  const avgGradeAPercent = (totalGradeASum / totalBatches).toFixed(1);
  const gradeACount = reports.filter(r => r.verdict === "Grade A").length;
  const ursCount = reports.filter(r => r.verdict === "URS").length;

  const centreMap = {};
  reports.forEach(r => {
    const cName = r.centreName || "Bokaro Krishi Mandi";
    if (!centreMap[cName]) {
      centreMap[cName] = { name: cName, count: 0, gradeASum: 0, ursCount: 0, gradeACount: 0 };
    }
    centreMap[cName].count += 1;
    centreMap[cName].gradeASum += (r.gradeAPercent || 0);
    if (r.verdict === "Grade A") centreMap[cName].gradeACount += 1;
    else centreMap[cName].ursCount += 1;
  });

  const centrePerformance = Object.values(centreMap).map(c => ({
    name: c.name,
    totalBatches: c.count,
    avgGradeA: Number((c.gradeASum / c.count).toFixed(1)),
    gradeACount: c.gradeACount,
    ursCount: c.ursCount,
    flagged: (c.gradeASum / c.count) < 50
  }));

  res.json({
    success: true,
    stats: {
      totalBatches,
      avgGradeAPercent: Number(avgGradeAPercent),
      gradeACount,
      ursCount,
      centrePerformance
    }
  });
});

module.exports = app;

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`[AstraGrade Server] Running on http://localhost:${PORT}`);
  });
}
