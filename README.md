# PassportSnap 📷

A modern, fast, and privacy-first passport and visa photo generator. Create print-ready photo layout sheets entirely locally inside your browser. No server uploads, no tracking, and 100% private.

## Features

- **100% Local Processing:** Uses HTML5 Canvas and `pdf-lib` for client-side processing. Your images never leave your computer.
- **Easy Upload & Paste:** Support for drag-and-drop file upload, standard file pickers, and direct clipboard pasting (Ctrl+V / Cmd+V).
- **Flexible Aspect Crop:** Easy-to-use cropping tool loaded with preset passport/visa size aspects (2x2 inches, 35x45mm, and more).
- **Live Image Adjustments:**
  - Brightness, Contrast, Saturation
  - Temperature (warm/cool white balance)
  - Shadows & Highlights adjustments
  - High-fidelity Sharpening filter
- **Live Rotation:** Rotate images smoothly (-45° to 45°) to correct crooked angles.
- **Dynamic Layout Settings:**
  - Auto-fit or custom number of copies
  - Page margin, photo spacing, and border size adjustments
  - Custom grid layout (rows and columns override)
  - Page size presets (4x6", 5x7", A4, Letter, and custom dimensions)
- **High-Quality Export:** Generates 300 DPI print-ready PDF sheets instantly.

## Tech Stack

- **Framework:** React 19 + TypeScript + Vite
- **State Management:** Zustand
- **Styling:** CSS Variables (Sleek Apple-inspired styling, responsive layouts, transitions, Dark/Light mode support)
- **Dependencies:** `react-image-crop`, `pdf-lib`, `lucide-react`

## Development Setup

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Run Dev Server:**
   ```bash
   npm run dev
   ```

3. **Build for Production:**
   ```bash
   npm run build
   ```
   *The built output will be inside the `dist` directory, ready to be statically deployed to services like Vercel, Netlify, Cloudflare Pages, or GitHub Pages.*

## License

MIT
