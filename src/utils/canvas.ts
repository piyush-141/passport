import type { ImageFilters } from '../store/appStore';
import { applyFiltersAndRotation } from './imageProcessor';

export interface PixelCrop {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Creates a cropped image from a source image URL using canvas.
 * Returns an object URL that must be revoked after use.
 */
export async function getCroppedImg(
  imageSrc: string,
  cropPercent: any,
  targetWidthPx: number,
  targetHeightPx: number,
  rotationDeg: number = 0,
  filters?: ImageFilters
): Promise<{ blob: Blob; url: string }> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context unavailable');

  canvas.width = targetWidthPx;
  canvas.height = targetHeightPx;

  let sourceCanvas: HTMLImageElement | HTMLCanvasElement = image;

  // Apply filters and rotation if provided
  if (filters && (rotationDeg !== 0 || Object.values(filters).some(v => v !== 0))) {
    sourceCanvas = applyFiltersAndRotation(image, filters, rotationDeg);
  }

  // Calculate pixel coordinates from percent based on the FINAL sourceCanvas size
  // Since sourceCanvas can be larger than image due to rotation bounding box.
  const sourceWidth = sourceCanvas.width || (sourceCanvas as HTMLImageElement).naturalWidth;
  const sourceHeight = sourceCanvas.height || (sourceCanvas as HTMLImageElement).naturalHeight;
  
  const pixelX = Math.round((cropPercent.x / 100) * sourceWidth);
  const pixelY = Math.round((cropPercent.y / 100) * sourceHeight);
  const pixelW = Math.round((cropPercent.width / 100) * sourceWidth);
  const pixelH = Math.round((cropPercent.height / 100) * sourceHeight);

  ctx.drawImage(
    sourceCanvas,
    pixelX,
    pixelY,
    pixelW,
    pixelH,
    0,
    0,
    targetWidthPx,
    targetHeightPx,
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) { reject(new Error('Canvas toBlob failed')); return; }
        const url = URL.createObjectURL(blob);
        resolve({ blob, url });
      },
      'image/jpeg',
      0.97,
    );
  });
}

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.addEventListener('load', () => resolve(img));
    img.addEventListener('error', (e) => reject(e));
    img.setAttribute('crossOrigin', 'anonymous');
    img.src = url;
  });
}

/**
 * Render a layout preview onto a canvas element.
 * Returns true on success.
 */
export interface PreviewOptions {
  pageWidthMm: number;
  pageHeightMm: number;
  photoWidthMm: number;
  photoHeightMm: number;
  marginMm: number;
  spacingMm: number;
  borderMm: number;
  cols: number;
  rows: number;
  offsetXMm: number;
  offsetYMm: number;
  croppedImageBlob: Blob | null;
  canvasEl: HTMLCanvasElement;
  scaleFactor?: number; // px per mm
}

export async function renderPreviewCanvas(opts: PreviewOptions): Promise<void> {
  const {
    pageWidthMm, pageHeightMm, photoWidthMm, photoHeightMm,
    marginMm, spacingMm, borderMm,
    cols, rows, offsetXMm, offsetYMm,
    croppedImageBlob, canvasEl,
  } = opts;

  // Compute scale so the page fits in the canvas container
  const containerW = canvasEl.parentElement?.clientWidth || 600;
  const containerH = canvasEl.parentElement?.clientHeight || 800;
  const scaleX = containerW / pageWidthMm;
  const scaleY = containerH / pageHeightMm;
  const scale = Math.min(scaleX, scaleY) * 0.95;

  canvasEl.width = Math.round(pageWidthMm * scale);
  canvasEl.height = Math.round(pageHeightMm * scale);

  const ctx = canvasEl.getContext('2d');
  if (!ctx) return;

  // White page background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvasEl.width, canvasEl.height);

  // Load cropped image if available
  let imgEl: HTMLImageElement | null = null;
  if (croppedImageBlob) {
    const url = URL.createObjectURL(croppedImageBlob);
    imgEl = await createImage(url);
    URL.revokeObjectURL(url);
  }

  const toS = (mm: number) => mm * scale;
  const totalPhotoW = photoWidthMm + borderMm * 2;
  const totalPhotoH = photoHeightMm + borderMm * 2;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = offsetXMm + c * (totalPhotoW + spacingMm);
      const y = offsetYMm + r * (totalPhotoH + spacingMm);

      // Draw border background (black border)
      if (borderMm > 0) {
        ctx.fillStyle = '#000000';
        ctx.fillRect(toS(x), toS(y), toS(totalPhotoW), toS(totalPhotoH));
      }

      // Draw photo area
      if (imgEl) {
        ctx.drawImage(
          imgEl,
          toS(x + borderMm), toS(y + borderMm),
          toS(photoWidthMm), toS(photoHeightMm),
        );
      } else {
        // Placeholder
        ctx.fillStyle = '#e8e8f0';
        ctx.fillRect(toS(x + borderMm), toS(y + borderMm), toS(photoWidthMm), toS(photoHeightMm));
        ctx.fillStyle = '#9090b0';
        ctx.font = `${Math.round(toS(5))}px Inter, sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText('Photo', toS(x + borderMm + photoWidthMm / 2), toS(y + borderMm + photoHeightMm / 2));
      }
    }
  }

  // Margin outline (dashed)
  ctx.strokeStyle = 'rgba(108, 99, 255, 0.3)';
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]);
  ctx.strokeRect(toS(marginMm), toS(marginMm), toS(pageWidthMm - marginMm * 2), toS(pageHeightMm - marginMm * 2));
  ctx.setLineDash([]);
}
