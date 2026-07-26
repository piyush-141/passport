// Global app state with Zustand (no localStorage/IndexedDB - RAM only)

import { create } from 'zustand';
import { PAGE_SIZES, PASSPORT_SIZES } from '../utils/measurement';

export interface ImageFilters {
  brightness: number; // 0-200 (100 = normal)
  contrast: number; // 0-200 (100 = normal)
  saturation: number; // 0-200 (100 = normal)
  temperature: number; // -100 to 100 (0 = normal)
  highlights: number; // -100 to 100 (0 = normal)
  shadows: number; // -100 to 100 (0 = normal)
  sharpen: number; // 0 to 100 (0 = normal)
}

export interface AppState {
  // Image upload (object URLs live in RAM, revoked on change)
  rawImageUrl: string | null;
  rawImageFile: File | null;
  setRawImage: (file: File, url: string) => void;
  clearRawImage: () => void;

  // Filters & Rotation
  filters: ImageFilters;
  rotation: number;
  setFilter: (key: keyof ImageFilters, val: number) => void;
  setRotation: (val: number) => void;
  resetFilters: () => void;

  // Cropped area
  cropPercent: any | null;
  setCropPercent: (percent: any | null) => void;

  // Passport size
  passportSizeId: string;
  customPassportW: number;
  customPassportH: number;
  setPassportSize: (id: string) => void;
  setCustomPassport: (w: number, h: number) => void;
  getPassportDimensions: () => { width: number; height: number };

  // Page size
  pageSizeId: string;
  customPageW: number;
  customPageH: number;
  setPageSize: (id: string) => void;
  setCustomPage: (w: number, h: number) => void;
  getPageDimensions: () => { width: number; height: number };

  // Layout
  copies: number;          // 0 = auto-fit
  margin: number;          // mm
  spacing: number;         // mm
  border: number;          // mm
  gridColsOverride: number | null;
  gridRowsOverride: number | null;
  alignment: 'center' | 'left';
  setCopies: (n: number) => void;
  setMargin: (n: number) => void;
  setSpacing: (n: number) => void;
  setBorder: (n: number) => void;
  setGridColsOverride: (n: number | null) => void;
  setGridRowsOverride: (n: number | null) => void;
  setAlignment: (a: 'center' | 'left') => void;
  resetSettings: () => void;

  // UI state
  isGeneratingPdf: boolean;
  setGeneratingPdf: (v: boolean) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Raw image
  rawImageUrl: null,
  rawImageFile: null,
  setRawImage: (file, url) => {
    const prev = get().rawImageUrl;
    if (prev) URL.revokeObjectURL(prev);
    set({ rawImageUrl: url, rawImageFile: file, cropPercent: null });
    get().resetFilters();
  },
  clearRawImage: () => {
    const url = get().rawImageUrl;
    if (url) URL.revokeObjectURL(url);
    set({ rawImageUrl: null, rawImageFile: null, cropPercent: null });
  },

  // Filters & Rotation
  filters: {
    brightness: 100,
    contrast: 100,
    saturation: 100,
    temperature: 0,
    highlights: 0,
    shadows: 0,
    sharpen: 0,
  },
  rotation: 0,
  setFilter: (key, val) => set((state) => ({ filters: { ...state.filters, [key]: val } })),
  setRotation: (val) => set({ rotation: val }),
  resetFilters: () => set({
    filters: { brightness: 100, contrast: 100, saturation: 100, temperature: 0, highlights: 0, shadows: 0, sharpen: 0 },
    rotation: 0,
  }),

  // Cropped area
  cropPercent: null as any,
  setCropPercent: (percent) => set({ cropPercent: percent }),

  // Passport size
  passportSizeId: '28x32',
  customPassportW: 28,
  customPassportH: 32,
  setPassportSize: (id) => set({ passportSizeId: id }),
  setCustomPassport: (w, h) => set({ customPassportW: w, customPassportH: h }),
  getPassportDimensions: () => {
    const { passportSizeId, customPassportW, customPassportH } = get();
    if (passportSizeId === 'custom') return { width: customPassportW, height: customPassportH };
    const found = PASSPORT_SIZES.find(p => p.id === passportSizeId);
    return found ? { width: found.width, height: found.height } : { width: 28, height: 32 };
  },

  // Page size
  pageSizeId: '4x6',
  customPageW: 101.6,
  customPageH: 152.4,
  setPageSize: (id) => set({ pageSizeId: id }),
  setCustomPage: (w, h) => set({ customPageW: w, customPageH: h }),
  getPageDimensions: () => {
    const { pageSizeId, customPageW, customPageH } = get();
    if (pageSizeId === 'custom') return { width: customPageW, height: customPageH };
    const found = PAGE_SIZES.find(p => p.id === pageSizeId);
    return found ? { width: found.width, height: found.height } : { width: 101.6, height: 152.4 };
  },

  // Layout
  copies: 12,     // fixed 12 copies by default
  margin: 5,      // mm
  spacing: 2,     // mm
  border: 0.5,    // mm
  gridColsOverride: null,
  gridRowsOverride: null,
  alignment: 'center',
  setCopies: (n) => set({ copies: n }),
  setMargin: (n) => set({ margin: n }),
  setSpacing: (n) => set({ spacing: n }),
  setBorder: (n) => set({ border: n }),
  setGridColsOverride: (n) => set({ gridColsOverride: n }),
  setGridRowsOverride: (n) => set({ gridRowsOverride: n }),
  setAlignment: (a) => set({ alignment: a }),
  resetSettings: () => set({
    copies: 12,
    margin: 5,
    spacing: 2,
    border: 0.5,
    gridColsOverride: null,
    gridRowsOverride: null,
    alignment: 'center',
    passportSizeId: '28x32',
    customPassportW: 28,
    customPassportH: 32,
    pageSizeId: '4x6',
    customPageW: 101.6,
    customPageH: 152.4,
  }),

  // UI
  isGeneratingPdf: false,
  setGeneratingPdf: (v) => set({ isGeneratingPdf: v }),
}));
