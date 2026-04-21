/**
 * Canvas API Chibi Converter
 *
 * Mengonversi foto menjadi gambar bergaya chibi/kartun menggunakan
 * HTML5 Canvas API — berjalan 100% di browser, tanpa API eksternal.
 *
 * Pipeline:
 * 1. Bilateral-like smoothing (kurangi noise, pertahankan edge)
 * 2. Saturation & brightness boost agresif
 * 3. Posterize kuat (flat color blocks seperti cel-shading)
 * 4. Outline hitam tebal (cartoon ink effect)
 * 5. Color quantization ke palette anime-friendly
 */

export interface ChibiConversionOptions {
  posterizeLevels?: number; // 2-5, default 3
  edgeThreshold?: number; // 20-80, default 35
  saturationBoost?: number; // 1.5-4.0, default 2.8
  smoothPasses?: number; // 1-3, default 2
}

export async function convertToChibi(
  imageUrl: string,
  options: ChibiConversionOptions = {},
): Promise<string> {
  const {
    posterizeLevels = 3,
    edgeThreshold = 35,
    saturationBoost = 2.8,
    smoothPasses = 2,
  } = options;

  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      try {
        // Resize ke ukuran optimal
        const maxSize = 512;
        let { width, height } = img;
        if (width > maxSize || height > maxSize) {
          const ratio = Math.min(maxSize / width, maxSize / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        // === STEP 1: Draw original ===
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
        ctx.drawImage(img, 0, 0, width, height);

        let imageData = ctx.getImageData(0, 0, width, height);

        // === STEP 2: Smooth (bilateral-like box blur) ===
        for (let p = 0; p < smoothPasses; p++) {
          imageData = boxBlur(imageData, width, height, 2);
        }

        // === STEP 3: Aggressive saturation boost ===
        boostSaturation(imageData.data, saturationBoost);

        // === STEP 4: Strong posterize (cel-shading) ===
        posterize(imageData.data, posterizeLevels);

        // === STEP 5: Quantize to anime-friendly palette ===
        quantizeToAnimePalette(imageData.data);

        ctx.putImageData(imageData, 0, 0);

        // === STEP 6: Detect edges from original (not posterized) ===
        const edgeCanvas = document.createElement("canvas");
        edgeCanvas.width = width;
        edgeCanvas.height = height;
        const edgeCtx = edgeCanvas.getContext("2d", {
          willReadFrequently: true,
        })!;
        edgeCtx.drawImage(img, 0, 0, width, height);
        const origData = edgeCtx.getImageData(0, 0, width, height);
        const edges = detectEdges(origData.data, width, height, edgeThreshold);

        // === STEP 7: Composite — draw thick black outline on top ===
        const outlineData = ctx.createImageData(width, height);
        for (let i = 0; i < edges.length; i++) {
          const di = i * 4;
          if (edges[i]) {
            outlineData.data[di] = 0;
            outlineData.data[di + 1] = 0;
            outlineData.data[di + 2] = 0;
            outlineData.data[di + 3] = 220; // semi-opaque black
          } else {
            outlineData.data[di + 3] = 0; // transparent
          }
        }

        // Dilate edges (make outline thicker)
        const thickEdges = dilateEdges(outlineData.data, width, height);
        const thickData = ctx.createImageData(width, height);
        thickData.data.set(thickEdges);
        edgeCtx.putImageData(thickData, 0, 0);

        ctx.drawImage(edgeCanvas, 0, 0);

        // === STEP 8: White background (remove transparency) ===
        const finalCanvas = document.createElement("canvas");
        finalCanvas.width = width;
        finalCanvas.height = height;
        const finalCtx = finalCanvas.getContext("2d")!;
        finalCtx.fillStyle = "#ffffff";
        finalCtx.fillRect(0, 0, width, height);
        finalCtx.drawImage(canvas, 0, 0);

        resolve(finalCanvas.toDataURL("image/png"));
      } catch (err) {
        reject(err);
      }
    };

    img.onerror = () => reject(new Error("Gagal memuat gambar"));
    img.src = imageUrl;
  });
}

// ============================================================
// Box Blur (smoothing)
// ============================================================
function boxBlur(
  imageData: ImageData,
  width: number,
  height: number,
  radius: number,
): ImageData {
  const src = imageData.data;
  const dst = new Uint8ClampedArray(src.length);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let r = 0,
        g = 0,
        b = 0,
        count = 0;
      for (let ky = -radius; ky <= radius; ky++) {
        for (let kx = -radius; kx <= radius; kx++) {
          const nx = Math.min(Math.max(x + kx, 0), width - 1);
          const ny = Math.min(Math.max(y + ky, 0), height - 1);
          const i = (ny * width + nx) * 4;
          r += src[i];
          g += src[i + 1];
          b += src[i + 2];
          count++;
        }
      }
      const di = (y * width + x) * 4;
      dst[di] = r / count;
      dst[di + 1] = g / count;
      dst[di + 2] = b / count;
      dst[di + 3] = src[di + 3];
    }
  }

  const result = new ImageData(dst, width, height);
  return result;
}

// ============================================================
// Saturation Boost
// ============================================================
function boostSaturation(data: Uint8ClampedArray, factor: number): void {
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i] / 255;
    const g = data[i + 1] / 255;
    const b = data[i + 2] / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const l = (max + min) / 2;

    if (max === min) continue; // achromatic

    const d = max - min;
    const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    let h = 0;

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }

    const newS = Math.min(1, s * factor);
    // Also slightly boost lightness for vivid anime look
    const newL = Math.min(0.85, Math.max(0.15, l * 1.05));

    const [nr, ng, nb] = hslToRgb(h, newS, newL);
    data[i] = nr;
    data[i + 1] = ng;
    data[i + 2] = nb;
  }
}

// ============================================================
// Posterize (cel-shading)
// ============================================================
function posterize(data: Uint8ClampedArray, levels: number): void {
  const step = 255 / (levels - 1);
  for (let i = 0; i < data.length; i += 4) {
    data[i] = Math.round(Math.round(data[i] / step) * step);
    data[i + 1] = Math.round(Math.round(data[i + 1] / step) * step);
    data[i + 2] = Math.round(Math.round(data[i + 2] / step) * step);
  }
}

// ============================================================
// Quantize to anime-friendly palette
// ============================================================
const ANIME_PALETTE: [number, number, number][] = [
  // Skin tones
  [255, 220, 185],
  [255, 200, 160],
  [240, 180, 140],
  [220, 160, 120],
  // Hair colors
  [30, 20, 20],
  [60, 40, 30],
  [180, 140, 100],
  [255, 220, 100],
  [200, 100, 100],
  [100, 60, 160],
  // Clothing - vivid
  [30, 120, 60],
  [20, 80, 180],
  [180, 30, 30],
  [200, 150, 20],
  [80, 30, 120],
  [20, 150, 150],
  // Neutrals
  [255, 255, 255],
  [220, 220, 220],
  [150, 150, 150],
  [80, 80, 80],
  [20, 20, 20],
  // Background / environment
  [100, 180, 100],
  [60, 120, 60],
  [180, 220, 180],
  [200, 200, 255],
  [150, 180, 220],
];

function quantizeToAnimePalette(data: Uint8ClampedArray): void {
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    let minDist = Infinity;
    let closest: [number, number, number] = [r, g, b];

    for (const [pr, pg, pb] of ANIME_PALETTE) {
      const dist = (r - pr) ** 2 + (g - pg) ** 2 + (b - pb) ** 2;
      if (dist < minDist) {
        minDist = dist;
        closest = [pr, pg, pb];
      }
    }

    // Only snap if close enough (avoid over-quantizing)
    if (minDist < 8000) {
      data[i] = closest[0];
      data[i + 1] = closest[1];
      data[i + 2] = closest[2];
    }
  }
}

// ============================================================
// Edge Detection (Sobel)
// ============================================================
function detectEdges(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  threshold: number,
): Uint8Array {
  const gray = new Float32Array(width * height);
  for (let i = 0; i < width * height; i++) {
    const di = i * 4;
    gray[i] = 0.299 * data[di] + 0.587 * data[di + 1] + 0.114 * data[di + 2];
  }

  const edges = new Uint8Array(width * height);
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;
      const gx =
        -gray[idx - width - 1] +
        gray[idx - width + 1] +
        -2 * gray[idx - 1] +
        2 * gray[idx + 1] +
        -gray[idx + width - 1] +
        gray[idx + width + 1];
      const gy =
        -gray[idx - width - 1] -
        2 * gray[idx - width] -
        gray[idx - width + 1] +
        gray[idx + width - 1] +
        2 * gray[idx + width] +
        gray[idx + width + 1];
      const mag = Math.sqrt(gx * gx + gy * gy);
      edges[idx] = mag > threshold ? 1 : 0;
    }
  }
  return edges;
}

// ============================================================
// Dilate edges (make outline thicker)
// ============================================================
function dilateEdges(
  data: Uint8ClampedArray,
  width: number,
  height: number,
): Uint8ClampedArray {
  const result = new Uint8ClampedArray(data.length);
  const radius = 1;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let maxAlpha = 0;
      for (let ky = -radius; ky <= radius; ky++) {
        for (let kx = -radius; kx <= radius; kx++) {
          const nx = Math.min(Math.max(x + kx, 0), width - 1);
          const ny = Math.min(Math.max(y + ky, 0), height - 1);
          const ni = (ny * width + nx) * 4 + 3;
          if (data[ni] > maxAlpha) maxAlpha = data[ni];
        }
      }
      const di = (y * width + x) * 4;
      result[di] = 0;
      result[di + 1] = 0;
      result[di + 2] = 0;
      result[di + 3] = maxAlpha;
    }
  }
  return result;
}

// ============================================================
// HSL helpers
// ============================================================
function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  if (s === 0) {
    const v = Math.round(l * 255);
    return [v, v, v];
  }
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return [
    Math.round(hueToRgb(p, q, h + 1 / 3) * 255),
    Math.round(hueToRgb(p, q, h) * 255),
    Math.round(hueToRgb(p, q, h - 1 / 3) * 255),
  ];
}

function hueToRgb(p: number, q: number, t: number): number {
  if (t < 0) t += 1;
  if (t > 1) t -= 1;
  if (t < 1 / 6) return p + (q - p) * 6 * t;
  if (t < 1 / 2) return q;
  if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
  return p;
}
