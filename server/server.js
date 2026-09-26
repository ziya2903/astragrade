const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '15mb' }));

// Ensure data directory exists
const DATA_DIR = path.join(__dirname, 'data');
const REPORTS_FILE = path.join(DATA_DIR, 'reports.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial seed data if file doesn't exist
const INITIAL_REPORTS = [
  {
    id: "ASTRA-20260926-001",
    centreName: "Nashik APMC Main Yard",
    centreCode: "NSK-01",
    farmerName: "Rameshwar Patil",
    farmerPhone: "9822012345",
    batchNumber: "LOT-ON-9421",
    timestamp: "2026-09-26T10:15:00.000Z",
    sampleCount: 6,
    gradeAPercent: 78.5,
    ursPercent: 21.5,
    breakdown: {
      gradeA: 78.5,
      rotten: 4.2,
      sprouted: 7.1,
      undersized: 10.2
    },
    dominantClass: "GradeA",
    verdict: "Grade A",
    verdictMessage: "This batch qualifies as Grade A. Approved for standard procurement price.",
    inspectorName: "S. D. Deshmukh (Inspector #4)"
  },
  {
    id: "ASTRA-20260926-002",
    centreName: "Lasalgaon Procurement Hub",
    centreCode: "LSG-03",
    farmerName: "Sunil Shinde",
    farmerPhone: "9823198765",
    batchNumber: "LOT-ON-9422",
    timestamp: "2026-09-26T11:40:00.000Z",
    sampleCount: 8,
    gradeAPercent: 42.0,
    ursPercent: 58.0,
    breakdown: {
      gradeA: 42.0,
      rotten: 28.5,
      sprouted: 18.0,
      undersized: 11.5
    },
    dominantClass: "Rotten",
    verdict: "URS",
    verdictMessage: "This batch falls under URS category due to high rot percentage.",
    inspectorName: "V. R. Kulkarni (Inspector #2)"
  },
  {
    id: "ASTRA-20260926-003",
    centreName: "Pimpalgaon Baswant Centre",
    centreCode: "PMP-02",
    farmerName: "Ganesh Gaikwad",
    farmerPhone: "9821456789",
    batchNumber: "LOT-ON-9423",
    timestamp: "2026-09-26T13:20:00.000Z",
    sampleCount: 5,
    gradeAPercent: 65.4,
    ursPercent: 34.6,
    breakdown: {
      gradeA: 65.4,
      rotten: 8.2,
      sprouted: 14.1,
      undersized: 12.3
    },
    dominantClass: "GradeA",
    verdict: "Grade A",
    verdictMessage: "This batch qualifies as Grade A. Meets minimum procurement specifications.",
    inspectorName: "A. P. Joshi (Inspector #1)"
  },
  {
    id: "ASTRA-20260926-004",
    centreName: "Yeola Sub-Centre",
    centreCode: "YLA-01",
    farmerName: "Bhagwan Wagh",
    farmerPhone: "9822334455",
    batchNumber: "LOT-ON-9424",
    timestamp: "2026-09-26T15:05:00.000Z",
    sampleCount: 7,
    gradeAPercent: 31.8,
    ursPercent: 68.2,
    breakdown: {
      gradeA: 31.8,
      rotten: 12.4,
      sprouted: 16.5,
      undersized: 39.3
    },
    dominantClass: "Undersized",
    verdict: "URS",
    verdictMessage: "This batch falls under URS category primarily due to undersized bulbs (< 45mm).",
    inspectorName: "M. N. Khairnar (Inspector #3)"
  }
];

if (!fs.existsSync(REPORTS_FILE)) {
  fs.writeFileSync(REPORTS_FILE, JSON.stringify(INITIAL_REPORTS, null, 2));
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

// Atomic file save (prevents corruption from concurrent writes)
function saveStoredReports(reports) {
  const tmpFile = `${REPORTS_FILE}.tmp`;
  try {
    fs.writeFileSync(tmpFile, JSON.stringify(reports, null, 2));
    fs.renameSync(tmpFile, REPORTS_FILE);
  } catch (err) {
    console.error("Error writing reports file atomically:", err);
  }
}

// Centres list
const CENTRES = [
  { id: "NSK-01", name: "Nashik APMC Main Yard", state: "Maharashtra", district: "Nashik" },
  { id: "LSG-03", name: "Lasalgaon Procurement Hub", state: "Maharashtra", district: "Nashik" },
  { id: "PMP-02", name: "Pimpalgaon Baswant Centre", state: "Maharashtra", district: "Nashik" },
  { id: "YLA-01", name: "Yeola Sub-Centre", state: "Maharashtra", district: "Nashik" }
];

// Mock Auth: Request OTP
app.post('/api/auth/send-otp', (req, res) => {
  const { phone } = req.body;
  if (!phone || phone.length < 10) {
    return res.status(400).json({ success: false, message: 'Valid 10-digit mobile number required' });
  }

  const otp = '1234';
  return res.json({
    success: true,
    message: 'OTP sent successfully',
    demoOtp: otp,
    note: 'In this demo mode, any 4 digits are accepted.'
  });
});

// Mock Auth: Verify OTP
app.post('/api/auth/verify-otp', (req, res) => {
  const { phone, otp, centreId, farmerName } = req.body;
  if (!phone || !otp) {
    return res.status(400).json({ success: false, message: 'Phone and OTP are required' });
  }

  if (otp.length === 4 && /^\d{4}$/.test(otp)) {
    const centre = CENTRES.find(c => c.id === centreId) || CENTRES[0];
    const user = {
      phone,
      name: farmerName || `Staff (${phone.slice(-4)})`,
      role: 'staff',
      centre: centre,
      token: `demo-token-${Date.now()}`
    };
    return res.json({ success: true, user });
  }

  return res.status(401).json({ success: false, message: 'Invalid 4-digit OTP. Try 1234.' });
});

// Mock Auth: Admin Login
app.post('/api/auth/admin-login', (req, res) => {
  const { email, password } = req.body;
  if (
    (email === 'admin@kisanastra.gov.in' || email === 'admin@astragrade.org' || email === 'admin') &&
    (password === 'admin123' || password === 'admin')
  ) {
    return res.json({
      success: true,
      user: {
        email: email,
        name: 'Ministry Quality Inspector / Central Admin',
        role: 'admin',
        token: `admin-token-${Date.now()}`
      }
    });
  }

  return res.status(401).json({
    success: false,
    message: 'Invalid credentials. Use admin@kisanastra.gov.in / admin123'
  });
});

// GET all reports
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

// GET single report by ID
app.get('/api/reports/:id', (req, res) => {
  const reports = getStoredReports();
  const report = reports.find(r => r.id === req.params.id);
  if (!report) {
    return res.status(404).json({ success: false, message: 'Report not found' });
  }
  res.json({ success: true, report });
});

// POST new quality report (with atomic write and retained thumbnails)
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
  const reportId = `ASTRA-${dateStr}-${uniqueSeq}`;

  const newReport = {
    id: reportId,
    centreName: centreName || "Nashik APMC Main Yard",
    centreCode: centreCode || "NSK-01",
    farmerName: farmerName || "Farmer Walk-in",
    farmerPhone: farmerPhone || "N/A",
    batchNumber: batchNumber || `LOT-ON-${Math.floor(1000 + Math.random() * 9000)}`,
    timestamp: new Date().toISOString(),
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
    inspectorName: inspectorName || "Authorized Centre Inspector",
    sampleThumbnails: sampleThumbnails || [],
    imagesCount: sampleCount || 1
  };

  reports.unshift(newReport);
  saveStoredReports(reports);

  res.status(201).json({ success: true, report: newReport });
});

// GET Admin Dashboard Analytics
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
    const cName = r.centreName || "Unknown Centre";
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

app.listen(PORT, () => {
  console.log(`[AstraGrade Server] Running on http://localhost:${PORT}`);
});
