/**
 * AstraGrade AI Model Service
 *
 * Integrates Google Teachable Machine image classification model
 * Model Base URL: https://teachablemachine.withgoogle.com/models/bIzzGa24O/
 * Classes: GradeA, Rotten, Sprouted, Undersized
 */

const MODEL_BASE_URL = "https://teachablemachine.withgoogle.com/models/bIzzGa24O/";
const MODEL_URL = `${MODEL_BASE_URL}model.json`;
const METADATA_URL = `${MODEL_BASE_URL}metadata.json`;

let modelInstance = null;
let isLoading = false;
let loadPromise = null;

/**
 * Ensures TensorFlow.js and @teachablemachine/image are loaded in window
 */
async function ensureLibrariesLoaded() {
  if (window.tmImage) return true;

  // If not yet available on window, try dynamic script injection
  return new Promise((resolve, reject) => {
    let checkInterval = setInterval(() => {
      if (window.tmImage) {
        clearInterval(checkInterval);
        resolve(true);
      }
    }, 100);

    // Timeout after 8 seconds
    setTimeout(() => {
      clearInterval(checkInterval);
      if (window.tmImage) resolve(true);
      else reject(new Error("Teachable Machine library failed to load from CDN."));
    }, 8000);
  });
}

/**
 * Loads and caches the Teachable Machine model
 */
export async function loadModel(onProgress) {
  if (modelInstance) return modelInstance;
  if (loadPromise) return loadPromise;

  loadPromise = (async () => {
    try {
      if (onProgress) onProgress("Checking libraries...");
      await ensureLibrariesLoaded();

      if (onProgress) onProgress("Downloading AI model weights...");
      modelInstance = await window.tmImage.load(MODEL_URL, METADATA_URL);
      console.log("[AstraGrade AI] Model loaded successfully:", modelInstance.getTotalClasses(), "classes");
      return modelInstance;
    } catch (err) {
      console.error("[AstraGrade AI] Failed to load remote model:", err);
      throw err;
    } finally {
      loadPromise = null;
    }
  })();

  return loadPromise;
}

/**
 * Classifies a single HTMLImageElement, HTMLCanvasElement, or HTMLVideoElement
 * Returns array of { className, probability, percentage }
 */
export async function predictImage(imageElement) {
  const model = await loadModel();
  const predictions = await model.predict(imageElement);

  // Format predictions into clean percentages
  const formatted = predictions.map(p => ({
    className: p.className,
    probability: p.probability,
    percentage: Number((p.probability * 100).toFixed(1))
  }));

  // Identify top prediction
  let topClass = formatted[0];
  for (const p of formatted) {
    if (p.probability > topClass.probability) {
      topClass = p;
    }
  }

  // Calculate Grade A vs URS (Rotten + Sprouted + Undersized)
  const gradeAItem = formatted.find(p => p.className.toLowerCase() === 'gradea') || { percentage: 0 };
  const rottenItem = formatted.find(p => p.className.toLowerCase() === 'rotten') || { percentage: 0 };
  const sproutedItem = formatted.find(p => p.className.toLowerCase() === 'sprouted') || { percentage: 0 };
  const undersizedItem = formatted.find(p => p.className.toLowerCase() === 'undersized') || { percentage: 0 };

  const gradeAPercent = gradeAItem.percentage;
  const ursPercent = Number((rottenItem.percentage + sproutedItem.percentage + undersizedItem.percentage).toFixed(1));

  return {
    raw: formatted,
    topClass: topClass.className,
    confidence: topClass.percentage,
    gradeAPercent,
    ursPercent,
    breakdown: {
      gradeA: gradeAPercent,
      rotten: rottenItem.percentage,
      sprouted: sproutedItem.percentage,
      undersized: undersizedItem.percentage
    },
    isGradeA: topClass.className.toLowerCase() === 'gradea'
  };
}

/**
 * Aggregates results across multiple scanned images in a batch
 * Calculates mean percentages and overall batch verdict
 */
export function aggregateBatchPredictions(samples) {
  if (!samples || samples.length === 0) {
    return {
      sampleCount: 0,
      overallGradeA: 0,
      overallURS: 0,
      breakdown: { gradeA: 0, rotten: 0, sprouted: 0, undersized: 0 },
      verdict: "No Samples",
      verdictType: "neutral",
      verdictMessage: "Scan or upload onion images to assess quality."
    };
  }

  const count = samples.length;
  let sumGradeA = 0;
  let sumRotten = 0;
  let sumSprouted = 0;
  let sumUndersized = 0;
  let gradeACount = 0;

  samples.forEach(sample => {
    const b = sample.prediction.breakdown;
    sumGradeA += b.gradeA;
    sumRotten += b.rotten;
    sumSprouted += b.sprouted;
    sumUndersized += b.undersized;
    if (sample.prediction.topClass.toLowerCase() === 'gradea') {
      gradeACount++;
    }
  });

  const avgGradeA = Number((sumGradeA / count).toFixed(1));
  const avgRotten = Number((sumRotten / count).toFixed(1));
  const avgSprouted = Number((sumSprouted / count).toFixed(1));
  const avgUndersized = Number((sumUndersized / count).toFixed(1));
  const avgURS = Number((avgRotten + avgSprouted + avgUndersized).toFixed(1));

  // Decision rule: If Grade A >= 60% (or majority is Grade A), qualifies as Grade A
  const isGradeAPassing = avgGradeA >= 60.0;
  const verdict = isGradeAPassing ? "Grade A" : "URS";
  const verdictType = isGradeAPassing ? "success" : "warning";
  
  const verdictMessage = isGradeAPassing
    ? `This batch qualifies as Grade A (${avgGradeA}% Grade A confidence across ${count} samples). Meets procurement standards.`
    : `This batch falls under URS category (${avgURS}% defect rate: Rotten ${avgRotten}%, Sprouted ${avgSprouted}%, Undersized ${avgUndersized}%).`;

  return {
    sampleCount: count,
    overallGradeA: avgGradeA,
    overallURS: avgURS,
    breakdown: {
      gradeA: avgGradeA,
      rotten: avgRotten,
      sprouted: avgSprouted,
      undersized: avgUndersized
    },
    gradeACount,
    ursCount: count - gradeACount,
    verdict,
    verdictType,
    verdictMessage
  };
}

export const CLASS_COLORS = {
  GradeA: {
    bg: 'bg-emerald-500',
    text: 'text-emerald-700',
    border: 'border-emerald-500',
    lightBg: 'bg-emerald-50',
    badge: 'bg-emerald-100 text-emerald-800'
  },
  Rotten: {
    bg: 'bg-rose-500',
    text: 'text-rose-700',
    border: 'border-rose-500',
    lightBg: 'bg-rose-50',
    badge: 'bg-rose-100 text-rose-800'
  },
  Sprouted: {
    bg: 'bg-amber-500',
    text: 'text-amber-700',
    border: 'border-amber-500',
    lightBg: 'bg-amber-50',
    badge: 'bg-amber-100 text-amber-800'
  },
  Undersized: {
    bg: 'bg-indigo-500',
    text: 'text-indigo-700',
    border: 'border-indigo-500',
    lightBg: 'bg-indigo-50',
    badge: 'bg-indigo-100 text-indigo-800'
  }
};
