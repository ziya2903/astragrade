/**
 * AstraGrade Image Optimizer
 * 
 * Downscales incoming high-resolution camera frames (12MP/4K) to a manageable footprint
 * (max 800px width/height, 0.75 JPEG quality, ~100-150KB instead of 6-8MB).
 * Prevents mobile browser tab Out-Of-Memory (OOM) crashes during continuous multi-sample scanning.
 */

export function optimizeImage(sourceImageOrCanvas, maxDimension = 800, quality = 0.75) {
  return new Promise((resolve, reject) => {
    try {
      if (typeof sourceImageOrCanvas === 'string') {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          resolve(renderScaledCanvas(img, maxDimension, quality));
        };
        img.onerror = (e) => reject(new Error("Failed to load image for optimization"));
        img.src = sourceImageOrCanvas;
      } else {
        resolve(renderScaledCanvas(sourceImageOrCanvas, maxDimension, quality));
      }
    } catch (err) {
      reject(err);
    }
  });
}

function renderScaledCanvas(source, maxDimension, quality) {
  const width = source.width || source.videoWidth || 800;
  const height = source.height || source.videoHeight || 600;

  let targetWidth = width;
  let targetHeight = height;

  if (width > maxDimension || height > maxDimension) {
    if (width > height) {
      targetWidth = maxDimension;
      targetHeight = Math.round((height * maxDimension) / width);
    } else {
      targetHeight = maxDimension;
      targetWidth = Math.round((width * maxDimension) / height);
    }
  }

  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d');

  // Draw smooth downscaled image
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(source, 0, 0, targetWidth, targetHeight);

  return canvas.toDataURL('image/jpeg', quality);
}
