import type { ImageFilters } from '../store/appStore';

export function applyFiltersAndRotation(
  img: HTMLImageElement,
  filters: ImageFilters,
  rotationDeg: number,
  maxDim?: number
): HTMLCanvasElement {
  let width = img.naturalWidth;
  let height = img.naturalHeight;

  // Scale down for preview if maxDim is provided
  if (maxDim) {
    const scale = Math.min(1, maxDim / Math.max(width, height));
    width = Math.round(width * scale);
    height = Math.round(height * scale);
  }

  // Calculate rotated bounding box
  const rad = (rotationDeg * Math.PI) / 180;
  const sin = Math.abs(Math.sin(rad));
  const cos = Math.abs(Math.cos(rad));
  const newWidth = Math.round(width * cos + height * sin);
  const newHeight = Math.round(width * sin + height * cos);

  const canvas = document.createElement('canvas');
  canvas.width = newWidth;
  canvas.height = newHeight;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return canvas;

  // 1. Draw with rotation and basic CSS filters
  ctx.translate(newWidth / 2, newHeight / 2);
  ctx.rotate(rad);
  
  // Approximate temperature with sepia + hue-rotate
  const tempSepia = Math.abs(filters.temperature) > 0 
    ? `sepia(${Math.abs(filters.temperature)}%) hue-rotate(${filters.temperature > 0 ? -15 : 15}deg)` 
    : '';
  
  ctx.filter = `brightness(${filters.brightness}%) contrast(${filters.contrast}%) saturate(${filters.saturation}%) ${tempSepia}`;
  
  ctx.drawImage(img, -width / 2, -height / 2, width, height);

  // 2. Advanced Pixel Manipulation (Highlights, Shadows, Sharpening)
  if (filters.highlights !== 0 || filters.shadows !== 0 || filters.sharpen !== 0) {
    const imageData = ctx.getImageData(0, 0, newWidth, newHeight);
    const data = imageData.data;
    const len = data.length;
    
    // Precompute curves for shadows/highlights
    const shadowMult = filters.shadows > 0 ? (1 + filters.shadows / 100) : (1 + filters.shadows / 200);
    const highlightMult = filters.highlights > 0 ? (1 - filters.highlights / 200) : (1 - filters.highlights / 100);

    for (let i = 0; i < len; i += 4) {
      if (data[i + 3] === 0) continue; // Skip transparent pixels

      let r = data[i];
      let g = data[i + 1];
      let b = data[i + 2];

      // Luminance approximation
      const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

      // Adjust shadows (affects darker pixels more)
      if (filters.shadows !== 0) {
        const shadowFactor = 1 - Math.pow(lum, 0.5); // Higher for dark pixels
        r = Math.min(255, r * (1 + (shadowMult - 1) * shadowFactor));
        g = Math.min(255, g * (1 + (shadowMult - 1) * shadowFactor));
        b = Math.min(255, b * (1 + (shadowMult - 1) * shadowFactor));
      }

      // Adjust highlights (affects brighter pixels more)
      if (filters.highlights !== 0) {
        const highlightFactor = Math.pow(lum, 2); // Higher for bright pixels
        r = Math.max(0, Math.min(255, r * (1 + (highlightMult - 1) * highlightFactor)));
        g = Math.max(0, Math.min(255, g * (1 + (highlightMult - 1) * highlightFactor)));
        b = Math.max(0, Math.min(255, b * (1 + (highlightMult - 1) * highlightFactor)));
      }

      data[i] = r;
      data[i + 1] = g;
      data[i + 2] = b;
    }

    ctx.putImageData(imageData, 0, 0);

    // Apply Sharpening (Simple Convolution)
    if (filters.sharpen > 0) {
      applySharpen(ctx, newWidth, newHeight, filters.sharpen / 100);
    }
  }

  return canvas;
}

function applySharpen(ctx: CanvasRenderingContext2D, w: number, h: number, amount: number) {
  const imageData = ctx.getImageData(0, 0, w, h);
  const src = imageData.data;
  const dst = new Uint8ClampedArray(src.length);
  const mix = amount * 2; // scale amount
  
  const w4 = w * 4;
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const i = y * w4 + x * 4;
      for (let c = 0; c < 3; c++) {
        const top = src[i - w4 + c];
        const bottom = src[i + w4 + c];
        const left = src[i - 4 + c];
        const right = src[i + 4 + c];
        const center = src[i + c];
        
        const sharpened = center + mix * (center - (top + bottom + left + right) / 4);
        dst[i + c] = sharpened;
      }
      dst[i + 3] = src[i + 3]; // alpha
    }
  }
  
  // Copy back edges as-is
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (y === 0 || y === h - 1 || x === 0 || x === w - 1) {
        const i = y * w4 + x * 4;
        dst[i] = src[i];
        dst[i+1] = src[i+1];
        dst[i+2] = src[i+2];
        dst[i+3] = src[i+3];
      }
    }
  }
  
  ctx.putImageData(new ImageData(dst, w, h), 0, 0);
}
