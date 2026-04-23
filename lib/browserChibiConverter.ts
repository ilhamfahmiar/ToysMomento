/**
 * Browser-based Chibi Converter
 *
 * Mengonversi foto ke style chibi/anime menggunakan Canvas API.
 * Berjalan 100% di browser — gratis selamanya, tidak butuh API.
 *
 * Teknik yang digunakan (mirip AnimeGAN):
 * 1. Bilateral filter (smooth skin, preserve edges)
 * 2. Edge detection + thick outline (cartoon ink)
 * 3. Color quantization ke anime palette
 * 4. Cel-shading (flat color blocks)
 * 5. Saturation boost agresif
 * 6. Skin tone enhancement
 */

export async function convertToChibi(imageUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      try {
        const maxSize = 512;
        let { width, height } = img;
        if (width > maxSize || height > maxSize) {
          const ratio = Math.min(maxSize / width, maxSize / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const result = processImage(img, width, height);
        resolve(result);
      } catch (err) {
        reject(err);
      }
    };

    img.onerror = () => reject(new Error("Gagal memuat gambar"));
    img.src = imageUrl;
  });
}

function processImage(
  img: HTMLImageElement,
  width: number,
  height: number,
): string {
  // Step 1: Draw original
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  ctx.drawImage(img, 0, 0, width, height);

  let data = ctx.getImageData(0, 0, width, height);

  // Step 2: Bilateral-like smoothing (preserve edges, smooth flat areas)
  data = bilateralSmooth(data, width, height);

  // Step 3: Boost saturation strongly
  boostSaturation(data.data, 2.5);

  // Step 4: Enhance skin tones
  enhanceSkinTones(data.data);

  // Step 5: Cel-shading (posterize to flat blocks)
  posterize(data.data, 4);

  // Step 6: Snap to anime color palette
  snapToAnimePalette(data.data);

  ctx.putImageData(data, 0, 0);

  // Step 7: Get edges from original (before processing)
  const edgeCanvas = document.createElement("canvas");
  edgeCanvas.width = width;
  edgeCanvas.height = height;
  const edgeCtx = edgeCanvas.getContext("2d", { willReadFrequently: true })!;
  edgeCtx.drawImage(img, 0, 0, width, height);
  const origData = edgeCtx.getImageData(0, 0, width, height);

  // Step 8: Draw thick black outline
  drawOutline(ctx, origData.data, width, height, 25);

  // Step 9: White background
  const finalCanvas = document.createElement("canvas");
  finalCanvas.width = width;
  finalCanvas.height = height;
  const finalCtx = finalCanvas.getContext("2d")!;
  finalCtx.fillStyle = "#ffffff";
  finalCtx.fillRect(0, 0, width, height);
  finalCtx.drawImage(canvas, 0, 0);

  return finalCanvas.toDataURL("image/png");
}

// ── Bilateral-like smooth ──────────────────────────────────────
function bilateralSmooth(
  imageData: ImageData,
  width: number,
  height: number,
): ImageData {
  const src = imageData.data;
  const dst = new Uint8ClampedArray(src.length);
  const radius = 3;
  const sigmaColor = 30;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const ci = (y * width + x) * 4;
      let rSum = 0,
        gSum = 0,
        bSum = 0,
        wSum = 0;

      for (let ky = -radius; ky <= radius; ky++) {
        for (let kx = -radius; kx <= radius; kx++) {
          const nx = Math.min(Math.max(x + kx, 0), width - 1);
          const ny = Math.min(Math.max(y + ky, 0), height - 1);
          const ni = (ny * width + nx) * 4;

          const dr = src[ci] - src[ni];
          const dg = src[ci + 1] - src[ni + 1];
          const db = src[ci + 2] - src[ni + 2];
          const colorDist = Math.sqrt(dr * dr + dg * dg + db * db);
          const spatialDist = Math.sqrt(kx * kx + ky * ky);

          const w =
            Math.exp(-(spatialDist * spatialDist) / (2 * radius * radius)) *
            Math.exp(-(colorDist * colorDist) / (2 * sigmaColor * sigmaColor));

          rSum += src[ni] * w;
          gSum += src[ni + 1] * w;
          bSum += src[ni + 2] * w;
          wSum += w;
        }
      }

      dst[ci] = rSum / wSum;
      dst[ci + 1] = gSum / wSum;
      dst[ci + 2] = bSum / wSum;
      dst[ci + 3] = src[ci + 3];
    }
  }

  return new ImageData(dst, width, height);
}

// ── Saturation boost ──────────────────────────────────────────
function boostSaturation(data: Uint8ClampedArray, factor: number): void {
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i] / 255;
    const g = data[i + 1] / 255;
    const b = data[i + 2] / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const l = (max + min) / 2;
    if (max === min) continue;

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
    const newL = Math.min(0.88, Math.max(0.12, l));
    const [nr, ng, nb] = hslToRgb(h, newS, newL);
    data[i] = nr;
    data[i + 1] = ng;
    data[i + 2] = nb;
  }
}

// ── Skin tone enhancement ─────────────────────────────────────
function enhanceSkinTones(data: Uint8ClampedArray): void {
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i],
      g = data[i + 1],
      b = data[i + 2];
    if (
      r > 120 &&
      g > 80 &&
      b > 60 &&
      r > g &&
      r > b &&
      r - b > 15 &&
      r - g < 80
    ) {
      // Warm up skin tone slightly
      data[i] = Math.min(255, r + 8);
      data[i + 1] = Math.min(255, Math.round(g * 0.97 + 200 * 0.03));
      data[i + 2] = Math.min(255, Math.round(b * 0.95 + 160 * 0.05));
    }
  }
}

// ── Posterize ─────────────────────────────────────────────────
function posterize(data: Uint8ClampedArray, levels: number): void {
  const step = 255 / (levels - 1);
  for (let i = 0; i < data.length; i += 4) {
    data[i] = Math.round(Math.round(data[i] / step) * step);
    data[i + 1] = Math.round(Math.round(data[i + 1] / step) * step);
    data[i + 2] = Math.round(Math.round(data[i + 2] / step) * step);
  }
}

// ── Anime palette snap ────────────────────────────────────────
const ANIME_PALETTE: [number, number, number][] = [
  [255, 225, 190],
  [245, 205, 170],
  [230, 185, 150],
  [210, 165, 130],
  [20, 20, 20],
  [50, 40, 35],
  [80, 60, 45],
  [160, 130, 100],
  [220, 190, 120],
  [255, 215, 80],
  [180, 100, 80],
  [120, 80, 160],
  [20, 110, 55],
  [15, 75, 170],
  [170, 25, 25],
  [190, 140, 15],
  [255, 255, 255],
  [230, 230, 230],
  [180, 180, 180],
  [100, 100, 100],
  [25, 25, 25],
  [90, 170, 90],
  [50, 110, 50],
  [170, 210, 170],
  [190, 195, 245],
  [140, 170, 210],
  [255, 180, 180],
  [255, 140, 100],
];

function snapToAnimePalette(data: Uint8ClampedArray): void {
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i],
      g = data[i + 1],
      b = data[i + 2];
    let minDist = Infinity;
    let closest: [number, number, number] = [r, g, b];

    for (const [pr, pg, pb] of ANIME_PALETTE) {
      const dist = (r - pr) ** 2 + (g - pg) ** 2 + (b - pb) ** 2;
      if (dist < minDist) {
        minDist = dist;
        closest = [pr, pg, pb];
      }
    }

    // Only snap if close enough
    if (minDist < 6000) {
      data[i] = closest[0];
      data[i + 1] = closest[1];
      data[i + 2] = closest[2];
    }
  }
}

// ── Outline drawing ───────────────────────────────────────────
function drawOutline(
  ctx: CanvasRenderingContext2D,
  origData: Uint8ClampedArray,
  width: number,
  height: number,
  threshold: number,
): void {
  const gray = new Float32Array(width * height);
  for (let i = 0; i < width * height; i++) {
    const di = i * 4;
    gray[i] =
      0.299 * origData[di] +
      0.587 * origData[di + 1] +
      0.114 * origData[di + 2];
  }

  const edgeCanvas = document.createElement("canvas");
  edgeCanvas.width = width;
  edgeCanvas.height = height;
  const edgeCtx = edgeCanvas.getContext("2d")!;
  const edgeData = edgeCtx.createImageData(width, height);

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
      const di = idx * 4;
      edgeData.data[di + 3] = mag > threshold ? 200 : 0;
    }
  }

  edgeCtx.putImageData(edgeData, 0, 0);

  // Dilate edges for thicker outline
  ctx.save();
  ctx.globalCompositeOperation = "source-over";
  ctx.filter = "blur(0.5px)";
  ctx.drawImage(edgeCanvas, 0, 0);
  ctx.filter = "none";
  ctx.restore();
}

// ── HSL helpers ───────────────────────────────────────────────
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
