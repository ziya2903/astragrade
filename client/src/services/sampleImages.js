/**
 * High-fidelity synthetic onion image generator for seamless live demo testing.
 * Generates canvas images matching the 4 classes: GradeA, Rotten, Sprouted, Undersized.
 */

export function generateSyntheticOnionImage(type) {
  const canvas = document.createElement('canvas');
  canvas.width = 300;
  canvas.height = 300;
  const ctx = canvas.getContext('2d');

  // Background: typical mandi inspection table / burlap sack texture
  const bgGrad = ctx.createLinearGradient(0, 0, 300, 300);
  bgGrad.addColorStop(0, '#e5d9c5');
  bgGrad.addColorStop(1, '#cbb79a');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 300, 300);

  // Subtle burlap cloth lines
  ctx.strokeStyle = 'rgba(160, 130, 95, 0.25)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 300; i += 12) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, 300);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(300, i);
    ctx.stroke();
  }

  // Shadow under onion
  ctx.fillStyle = 'rgba(60, 40, 20, 0.35)';
  ctx.beginPath();
  if (type === 'Undersized') {
    ctx.ellipse(150, 210, 45, 14, 0, 0, Math.PI * 2);
  } else {
    ctx.ellipse(150, 230, 85, 22, 0, 0, Math.PI * 2);
  }
  ctx.fill();

  // Draw Onion Body based on class
  ctx.save();
  if (type === 'Undersized') {
    // Small onion: radius ~45px
    drawOnionBulb(ctx, 150, 175, 52, 60, '#c25838', '#df8b5b');
    // Root beard at bottom
    drawRoots(ctx, 150, 220, 15);
    // Neck at top
    drawNeck(ctx, 150, 125, 10, '#a74325');
  } else if (type === 'Rotten') {
    // Decayed dark patches, mold
    drawOnionBulb(ctx, 150, 155, 90, 105, '#4a2c1f', '#7d4d38');
    // Dark sunken necrotic lesions
    ctx.fillStyle = '#221510';
    ctx.beginPath();
    ctx.ellipse(135, 150, 35, 45, 0.2, 0, Math.PI * 2);
    ctx.fill();
    // Fungal white/gray sporulation
    ctx.fillStyle = 'rgba(230, 220, 210, 0.7)';
    ctx.beginPath();
    ctx.arc(140, 160, 12, 0, Math.PI * 2);
    ctx.arc(125, 145, 8, 0, Math.PI * 2);
    ctx.fill();
    drawRoots(ctx, 150, 235, 25);
    drawNeck(ctx, 150, 68, 16, '#3e2016');
  } else if (type === 'Sprouted') {
    // Bulb with active green shoot emerging from top
    drawOnionBulb(ctx, 150, 170, 88, 100, '#b85435', '#db8156');
    drawRoots(ctx, 150, 248, 28);

    // Green vegetative sprout emerging from neck
    ctx.fillStyle = '#2e7d32'; // Fresh green shoot
    ctx.beginPath();
    ctx.moveTo(144, 90);
    ctx.quadraticCurveTo(135, 40, 125, 20);
    ctx.quadraticCurveTo(145, 45, 150, 90);
    ctx.fill();

    // Second sprout leaf
    ctx.fillStyle = '#43a047';
    ctx.beginPath();
    ctx.moveTo(150, 90);
    ctx.quadraticCurveTo(165, 35, 175, 15);
    ctx.quadraticCurveTo(158, 48, 154, 90);
    ctx.fill();

    drawNeck(ctx, 150, 95, 16, '#8f3e23');
  } else {
    // Grade A: Flawless, golden copper skin, firm dry papery scales
    drawOnionBulb(ctx, 150, 155, 94, 110, '#c75936', '#e88d5e');
    // Vertical skin striations
    drawStriations(ctx, 150, 155, 94, 110);
    drawRoots(ctx, 150, 240, 28);
    drawNeck(ctx, 150, 65, 18, '#a24223');
  }
  ctx.restore();

  // Overlay text tag for clear visibility
  ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
  ctx.fillRect(8, 8, 120, 24);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 11px sans-serif';
  ctx.fillText(`TEST: ${type}`, 14, 24);

  return canvas.toDataURL('image/jpeg', 0.95);
}

function drawOnionBulb(ctx, cx, cy, rx, ry, col1, col2) {
  const grad = ctx.createRadialGradient(cx - rx * 0.35, cy - ry * 0.3, 10, cx, cy, rx * 1.1);
  grad.addColorStop(0, '#f9be9b');
  grad.addColorStop(0.3, col2);
  grad.addColorStop(0.85, col1);
  grad.addColorStop(1, '#662410');

  ctx.fillStyle = grad;
  ctx.beginPath();
  // Slightly tapered top bulb shape
  ctx.moveTo(cx, cy - ry);
  ctx.bezierCurveTo(cx + rx * 1.1, cy - ry * 0.5, cx + rx * 1.15, cy + ry * 0.7, cx, cy + ry * 0.95);
  ctx.bezierCurveTo(cx - rx * 1.15, cy + ry * 0.7, cx - rx * 1.1, cy - ry * 0.5, cx, cy - ry);
  ctx.fill();
}

function drawStriations(ctx, cx, cy, rx, ry) {
  ctx.strokeStyle = 'rgba(120, 40, 15, 0.28)';
  ctx.lineWidth = 1.5;
  for (let offset = -0.7; offset <= 0.7; offset += 0.25) {
    ctx.beginPath();
    ctx.moveTo(cx + offset * 10, cy - ry * 0.9);
    ctx.quadraticCurveTo(cx + offset * rx * 1.1, cy, cx + offset * 8, cy + ry * 0.9);
    ctx.stroke();
  }
}

function drawRoots(ctx, cx, cy, count) {
  ctx.strokeStyle = '#c4ab80';
  ctx.lineWidth = 1.2;
  for (let i = 0; i < count; i++) {
    const rx = cx + (Math.random() - 0.5) * 35;
    const len = 12 + Math.random() * 16;
    ctx.beginPath();
    ctx.moveTo(rx, cy);
    ctx.quadraticCurveTo(rx + (Math.random() - 0.5) * 10, cy + len * 0.5, rx + (Math.random() - 0.5) * 12, cy + len);
    ctx.stroke();
  }
}

function drawNeck(ctx, cx, cy, width, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(cx - width, cy + 15);
  ctx.lineTo(cx - width * 0.6, cy);
  ctx.lineTo(cx + width * 0.6, cy);
  ctx.lineTo(cx + width, cy + 15);
  ctx.closePath();
  ctx.fill();
}

export const PRESET_SAMPLES = [
  { id: 'sample-grade-a', title: 'Grade A Onion', class: 'GradeA', description: 'Firm, healthy copper skin, dry neck, >55mm diameter' },
  { id: 'sample-rotten', title: 'Rotten Onion', class: 'Rotten', description: 'Soft rot, black mold spores, decayed scales' },
  { id: 'sample-sprouted', title: 'Sprouted Onion', class: 'Sprouted', description: 'Active vegetative green shoot emerging from top' },
  { id: 'sample-undersized', title: 'Undersized Onion', class: 'Undersized', description: 'Immature bulb (<45mm), below mandi trading grade' }
];
