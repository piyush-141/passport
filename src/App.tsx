import { useEffect, useState, useRef } from 'react';
import './index.css';
import { useAppStore } from './store/appStore';
import UploadStep from './components/Upload/UploadStep';
import ImageCropper from './components/Cropper/ImageCropper';
import SettingsStep from './components/Settings/SettingsStep';
import { Shield, Sun, Moon, Upload, RefreshCw, Settings, Download, X, SlidersHorizontal } from 'lucide-react';
import { getCroppedImg } from './utils/canvas';
import { generatePassportPDF } from './utils/pdf';

function App() {
  const store = useAppStore();
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'light' || saved === 'dark') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  const [showSettings, setShowSettings] = useState(false);
  const [showEditPanel, setShowEditPanel] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync theme with document element
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const handleDownloadPDF = async () => {
    if (!store.rawImageUrl || !store.cropPercent) {
      alert("Please upload and crop an image first.");
      return;
    }
    store.setGeneratingPdf(true);
    try {
      const dims = store.getPassportDimensions();
      const dpiScale = 300 / 25.4;
      const targetW = Math.round(dims.width * dpiScale);
      const targetH = Math.round(dims.height * dpiScale);
      
      const { blob } = await getCroppedImg(store.rawImageUrl, store.cropPercent, targetW, targetH, store.rotation, store.filters);
      
      const pageDims = store.getPageDimensions();
      const pdfRes = await generatePassportPDF({
        croppedImageBlob: blob,
        pageWidthMm: pageDims.width,
        pageHeightMm: pageDims.height,
        photoWidthMm: dims.width,
        photoHeightMm: dims.height,
        marginMm: store.margin,
        spacingMm: store.spacing,
        borderMm: store.border,
        copies: store.copies,
        gridColsOverride: store.gridColsOverride,
        gridRowsOverride: store.gridRowsOverride,
        alignment: store.alignment,
      });

      // Trigger download
      const a = document.createElement('a');
      a.href = pdfRes.url;
      a.download = `Passport_Photos_${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

    } catch (err) {
      console.error("Failed to generate PDF", err);
      alert("Failed to generate PDF. Check console for details.");
    } finally {
      store.setGeneratingPdf(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      store.setRawImage(file, url);
    }
    e.target.value = '';
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', transition: 'background-color 0.4s ease', overflow: 'hidden', paddingBottom: '36px', position: 'relative' }}>
      {/* Header */}
      <header style={{
        flexShrink: 0,
        zIndex: 100,
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg-secondary)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        transition: 'background-color 0.4s ease, border-color 0.4s ease',
      }}>
        <div style={{ padding: '14px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginRight: 'auto' }}>
            <div style={{
              width: 42, height: 42, borderRadius: 12,
              background: 'var(--accent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22,
              color: '#ffffff',
              boxShadow: 'var(--accent-glow) 0 4px 12px',
            }}>
              📷
            </div>
            <div>
              <div className="apple-h1" style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--text-primary)' }}>
                PassportSnap
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600 }}>
                Privacy-First Photo Generator
              </div>
            </div>
          </div>

          {/* Privacy pill */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '6px 14px',
            background: 'var(--bg-primary)',
            border: '1px solid var(--border)',
            borderRadius: 20,
            fontSize: 13,
            color: 'var(--text-primary)',
            fontWeight: 600,
            marginRight: '12px'
          }}>
            <Shield size={14} style={{ color: 'var(--accent)' }} />
            100% Local
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {store.rawImageUrl && (
              <>
                <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} />
                <button className="btn-secondary" onClick={() => fileInputRef.current?.click()}>
                  <Upload size={16} /> Change
                </button>
                <button className="btn-secondary" onClick={store.clearRawImage}>
                  <RefreshCw size={16} /> Reset
                </button>
                <button className={`btn-secondary ${showEditPanel ? 'active' : ''}`} onClick={() => setShowEditPanel(!showEditPanel)} style={showEditPanel ? { background: 'var(--accent-glow)', borderColor: 'var(--accent)', color: 'var(--accent)' } : {}}>
                  <SlidersHorizontal size={16} /> Edit
                </button>
                <button className="btn-secondary" onClick={() => setShowSettings(true)}>
                  <Settings size={16} /> Settings
                </button>
                <button 
                  className="btn-primary" 
                  onClick={handleDownloadPDF} 
                  disabled={store.isGeneratingPdf || !store.cropPercent}
                >
                  {store.isGeneratingPdf ? (
                     <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                  ) : (
                    <Download size={16} />
                  )}
                  Download PDF
                </button>
              </>
            )}

            {/* Theme Toggle */}
            <div 
              className="theme-switch"
              onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}
              style={{ marginLeft: 12 }}
            >
              <div className="theme-switch-slider" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {theme === 'light' ? <Sun size={14} style={{ color: '#ff9f0a' }} /> : <Moon size={14} style={{ color: '#0066cc' }} />}
              </div>
              <Sun size={14} style={{ position: 'absolute', left: 9, color: 'var(--text-muted)', pointerEvents: 'none' }} />
              <Moon size={14} style={{ position: 'absolute', right: 9, color: 'var(--text-muted)', pointerEvents: 'none' }} />
            </div>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <main style={{ flex: 1, position: 'relative', background: 'var(--bg-primary)' }}>
        {!store.rawImageUrl ? (
          <UploadStep />
        ) : (
          <ImageCropper showEditPanel={showEditPanel} />
        )}
      </main>

      {/* Footer */}
      <footer style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '36px',
        textAlign: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '12px',
        color: 'var(--text-secondary)',
        borderTop: '1px solid var(--border)',
        background: 'var(--bg-secondary)',
        zIndex: 300,
      }}>
        Designed and developed by <a href="https://github.com/piyush-141" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>Piyush</a>
      </footer>

      {/* Settings Modal */}
      {showSettings && (
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          zIndex: 200,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px'
        }}>
          <div className="glass-card" style={{
            width: '100%',
            maxWidth: 1000,
            maxHeight: '90vh',
            overflowY: 'auto',
            position: 'relative',
            background: 'var(--bg-primary)'
          }}>
            <button 
              onClick={() => setShowSettings(false)}
              style={{
                position: 'absolute', top: 16, right: 16,
                background: 'transparent', border: 'none',
                cursor: 'pointer', color: 'var(--text-primary)', zIndex: 10
              }}
            >
              <X size={24} />
            </button>
            <div style={{ padding: '32px' }}>
              <h2 className="apple-h2" style={{ marginBottom: '24px' }}>PDF Settings</h2>
              <SettingsStep />
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

export default App;
