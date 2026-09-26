/**
 * AstraGrade AI Model Service
 *
 * Integrates Google Teachable Machine image classification model
 * Prioritizes local bundled model (/models/onion_v1/) for 100% offline rural mandi reliability,
 * and falls back to Google's hosted URL if needed.
 * Classes: GradeA, Rotten, Sprouted, Undersized
 */

const LOCAL_MODEL_URL = "/models/onion_v1/model.json";
const LOCAL_METADATA_URL = "/models/onion_v1/metadata.json";

const REMOTE_BASE_URL = "https://teachablemachine.withgoogle.com/models/bIzzGa24O/";
const REMOTE_MODEL_URL = `${REMOTE_BASE_URL}model.json`;
const REMOTE_METADATA_URL = `${REMOTE_BASE_URL}metadata.json`;

let modelInstance = null;
let loadPromise = null;

async function ensureLibrariesLoaded() {
  if (window.tmImage) return true;

  return new Promise((resolve, reject) => {
    let checkInterval = setInterval(() => {
      if (window.tmImage) {
        clearInterval(checkInterval);
        resolve(true);
      }
    }, 100);

    setTimeout(() => {
      clearInterval(checkInterval);
      if (window.tmImage) resolve(true);
      else reject(new Error("Teachable Machine library failed to load."));
    }, 8000);
  });
}

/**
 * Loads and caches model. Tries local bundled offline files first.
 */
export async function loadModel(onProgress) {
  if (modelInstance) return modelInstance;
  if (loadPromise) return loadPromise;

  loadPromise = (async () => {
    try {
      if (onProgress) onProgress("Initializing AI engine...");
      await ensureLibrariesLoaded();

      // 1. Try local offline model first
      try {
        if (onProgress) onProgress("Loading local offline model...");
        modelInstance = await window.tmImage.load(LOCAL_MODEL_URL, LOCAL_METADATA_URL);
        console.log("[AstraGrade AI] Loaded LOCAL offline model successfully");
        return modelInstance;
      } catch (localErr) {
        console.warn("[AstraGrade AI] Local model failed, falling back to remote URL:", localErr.message);
      }

      // 2. Fall back to remote model
      if (onProgress) onProgress("Connecting to cloud model...");
      modelInstance = await window.tmImage.load(REMOTE_MODEL_URL, REMOTE_METADATA_URL);
      console.log("[AstraGrade AI] Loaded REMOTE model successfully");
      return modelInstance;
    } catch (err) {
      console.error("[AstraGrade AI] Failed to load model:", err);
      throw err;
    } finally {
      loadPromise = null;
    }
  })();

  return loadPromise;
}

/**
 * Classifies a single HTMLImageElement, HTMLCanvasElement, or HTMLVideoElement
 */
export async function predictImage(imageElement) {
  const model = await loadModel();
  const predictions = await model.predict(imageElement);

  const formatted = predictions.map(p => ({
    className: p.className,
    probability: p.probability,
    percentage: Number((p.probability * 100).toFixed(1))
  }));

  let topClass = formatted[0];
  for (const p of formatted) {
    if (p.probability > topClass.probability) {
      topClass = p;
    }
  }

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
 * Aggregates results across multiple scanned images in a batch.
 * Correctly identifies the true dominant defect when Grade A < 60%
 * (Fixes CB-01 Defect Inversion Bug).
 */
export function aggregateBatchPredictions(samples, lang = 'en') {
  if (!samples || samples.length === 0) {
    return {
      sampleCount: 0,
      overallGradeA: 0,
      overallURS: 0,
      breakdown: { gradeA: 0, rotten: 0, sprouted: 0, undersized: 0 },
      dominantClass: "No Samples",
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

  const isGradeAPassing = avgGradeA >= 60.0;
  const verdict = isGradeAPassing ? "Grade A" : "URS";
  const verdictType = isGradeAPassing ? "success" : "warning";

  // FIX CB-01: Calculate true dominant defect dynamically
  let dominantClass = 'GradeA';
  if (!isGradeAPassing) {
    const defects = [
      { name: 'Undersized', val: avgUndersized },
      { name: 'Sprouted', val: avgSprouted },
      { name: 'Rotten', val: avgRotten }
    ];
    defects.sort((a, b) => b.val - a.val);
    dominantClass = defects[0].name;
  }

  const verdictMessage = isGradeAPassing
    ? `This batch qualifies as Grade A (${avgGradeA}% Grade A confidence across ${count} samples). Meets procurement standards.`
    : `This batch falls under URS category (Primary reason: ${dominantClass} at ${
        dominantClass === 'Undersized' ? avgUndersized : dominantClass === 'Sprouted' ? avgSprouted : avgRotten
      }%). Total URS defect: ${avgURS}%.`;

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
    dominantClass,
    verdict,
    verdictType,
    verdictMessage
  };
}
