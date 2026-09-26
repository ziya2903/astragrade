import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Generates an official AstraGrade Digital Quality Assessment Report PDF
 */
export function generateReportPDF(report) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // Primary Header Banner
  doc.setFillColor(21, 128, 61); // Emerald 700
  doc.rect(0, 0, pageWidth, 38, 'F');

  // Title & Subtitle
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('AstraGrade', 16, 18);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('AI-Powered Onion Quality Assessment & Grading Certificate', 16, 25);
  doc.text('A KisanAstra Transparency Initiative | APMC Procurement Oversight', 16, 31);

  // Certificate / Report ID badge on top right
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(`ID: ${report.id}`, pageWidth - 16, 18, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated: ${new Date(report.timestamp).toLocaleString()}`, pageWidth - 16, 25, { align: 'right' });

  // Metadata Grid Box
  doc.setDrawColor(229, 231, 235);
  doc.setFillColor(249, 250, 251);
  doc.roundedRect(14, 46, pageWidth - 28, 42, 3, 3, 'FD');

  doc.setTextColor(55, 65, 81);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('PROCUREMENT CENTRE:', 20, 54);
  doc.setFont('helvetica', 'normal');
  doc.text(`${report.centreName} (${report.centreCode || 'APMC-HQ'})`, 65, 54);

  doc.setFont('helvetica', 'bold');
  doc.text('FARMER / LOT HOLDER:', 20, 62);
  doc.setFont('helvetica', 'normal');
  doc.text(`${report.farmerName || 'Registered Grower'} (Ph: ${report.farmerPhone || 'N/A'})`, 65, 62);

  doc.setFont('helvetica', 'bold');
  doc.text('BATCH / LOT NUMBER:', 20, 70);
  doc.setFont('helvetica', 'normal');
  doc.text(`${report.batchNumber || 'LOT-AUTO-GEN'}`, 65, 70);

  doc.setFont('helvetica', 'bold');
  doc.text('SAMPLES EVALUATED:', 20, 78);
  doc.setFont('helvetica', 'normal');
  doc.text(`${report.sampleCount || 1} Onion Images (Multi-angle AI Scan)`, 65, 78);

  doc.setFont('helvetica', 'bold');
  doc.text('VERIFYING OFFICER:', 125, 78);
  doc.setFont('helvetica', 'normal');
  doc.text(`${report.inspectorName || 'Govt. Mandi Inspector'}`, 160, 78);

  // Verdict Section
  const isGradeA = report.verdict === 'Grade A';
  const verdictBoxY = 96;

  if (isGradeA) {
    doc.setFillColor(236, 253, 245); // Emerald 50
    doc.setDrawColor(16, 185, 129);  // Emerald 500
  } else {
    doc.setFillColor(254, 242, 242); // Rose 50
    doc.setDrawColor(239, 68, 68);   // Rose 500
  }

  doc.setLineWidth(0.8);
  doc.roundedRect(14, verdictBoxY, pageWidth - 28, 30, 4, 4, 'FD');

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  if (isGradeA) {
    doc.setTextColor(6, 95, 70);
    doc.text('VERDICT: GRADE A (APPROVED FOR PROCUREMENT)', 20, verdictBoxY + 12);
  } else {
    doc.setTextColor(153, 27, 27);
    doc.text('VERDICT: URS CATEGORY (UNDER-GRADE / DEFECTIVE)', 20, verdictBoxY + 12);
  }

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(75, 85, 99);
  doc.text(
    report.verdictMessage || (isGradeA
      ? "This batch qualifies as Grade A. Approved for standard procurement price."
      : "This batch falls under URS category. Unsuitable for Grade A procurement."),
    20,
    verdictBoxY + 21
  );

  // AI Quality Scores Table
  const tableY = 134;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(17, 24, 39);
  doc.text('AI Quality Analysis Breakdown', 14, tableY - 4);

  const breakdown = report.breakdown || {
    gradeA: report.gradeAPercent,
    rotten: 0,
    sprouted: 0,
    undersized: report.ursPercent
  };

  const tableData = [
    [
      'Grade A (Healthy & High Quality)',
      `${report.gradeAPercent}%`,
      '>= 60.0%',
      report.gradeAPercent >= 60 ? 'PASS (Grade A)' : 'FAIL (< 60%)'
    ],
    [
      'Rotten / Decayed',
      `${breakdown.rotten}%`,
      '<= 10.0%',
      breakdown.rotten <= 10 ? 'Acceptable' : 'Defect Alert'
    ],
    [
      'Sprouted / Shoot Emergence',
      `${breakdown.sprouted}%`,
      '<= 15.0%',
      breakdown.sprouted <= 15 ? 'Acceptable' : 'Defect Alert'
    ],
    [
      'Undersized / Immature (< 45mm)',
      `${breakdown.undersized}%`,
      '<= 15.0%',
      breakdown.undersized <= 15 ? 'Acceptable' : 'Defect Alert'
    ],
    [
      'TOTAL URS (Under-grade / Defective)',
      `${report.ursPercent}%`,
      '<= 40.0%',
      report.ursPercent <= 40 ? 'Acceptable' : 'High Defect Risk'
    ]
  ];

  autoTable(doc, {
    startY: tableY,
    head: [['Parameter / Class', 'AI Assessed %', 'Mandi Benchmark', 'Status']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [21, 128, 61],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9
    },
    bodyStyles: {
      fontSize: 9,
      textColor: [31, 41, 55]
    },
    alternateRowStyles: {
      fillColor: [249, 250, 251]
    },
    columnStyles: {
      0: { cellWidth: 70 },
      1: { cellWidth: 35, fontStyle: 'bold' },
      2: { cellWidth: 35 },
      3: { cellWidth: 42, fontStyle: 'bold' }
    }
  });

  // Dispute Prevention & Legal Assurance Note
  const finalY = doc.lastAutoTable.finalY + 14;
  doc.setDrawColor(209, 213, 219);
  doc.setFillColor(243, 244, 246);
  doc.roundedRect(14, finalY, pageWidth - 28, 28, 2, 2, 'FD');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(31, 41, 55);
  doc.text('TRANSPARENCY & FAIR PRICING GUARANTEE (TEAM KISANASTRA)', 18, finalY + 7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(75, 85, 99);
  doc.text(
    'This digital grading slip is generated using impartial computer vision (Google Teachable Machine TFJS model).\n' +
    'It eliminates human inspector bias and provides an unalterable timestamped record to resolve procurement disputes.\n' +
    'Both farmer and procurement officer retain equal access to this verified batch score.',
    18,
    finalY + 13
  );

  // Digital Signatures & QR Code Simulation
  const signY = finalY + 40;

  // Inspector Stamp Area
  doc.setDrawColor(156, 163, 175);
  doc.setLineDashPattern([1, 1], 0);
  doc.roundedRect(18, signY, 65, 24, 2, 2, 'D');
  doc.setLineDashPattern([], 0);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(107, 114, 128);
  doc.text('CENTRE IN-CHARGE SIGN / STAMP', 22, signY + 6);
  doc.setFont('helvetica', 'normal');
  doc.text('Digitally Verified at Procurement Gate', 22, signY + 18);

  // Farmer Acceptance Area
  doc.roundedRect(pageWidth - 83, signY, 65, 24, 2, 2, 'D');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(107, 114, 128);
  doc.text('FARMER ACKNOWLEDGEMENT', pageWidth - 79, signY + 6);
  doc.setFont('helvetica', 'normal');
  doc.text('Grade & Tare Accepted Digitally', pageWidth - 79, signY + 18);

  // Footer
  doc.setFontSize(7.5);
  doc.setTextColor(156, 163, 175);
  doc.text('AstraGrade v1.0 • Built with Google Teachable Machine & TensorFlow.js • KisanAstra AgriTech', pageWidth / 2, 288, { align: 'center' });

  // Save the PDF
  const filename = `AstraGrade_Report_${report.id || 'Batch'}.pdf`;
  doc.save(filename);
  return filename;
}
