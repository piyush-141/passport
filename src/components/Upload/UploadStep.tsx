import { useCallback, useRef, useState, useEffect } from 'react';
import { Upload, ImageIcon, AlertCircle } from 'lucide-react';
import { useAppStore } from '../../store/appStore';

const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];

export default function UploadStep() {
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { setRawImage } = useAppStore();

  const processFile = useCallback((file: File) => {
    setError(null);
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('Invalid file type. Please upload a JPG or PNG image.');
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
      setError('File too large. Maximum size is 10MB.');
      return;
    }
    const url = URL.createObjectURL(file);
    setRawImage(file, url);
  }, [setRawImage]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [processFile]);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = '';
  };

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (e.clipboardData && e.clipboardData.items) {
        for (let i = 0; i < e.clipboardData.items.length; i++) {
          const item = e.clipboardData.items[i];
          if (item.type.indexOf('image/') !== -1) {
            const file = item.getAsFile();
            if (file) {
              e.preventDefault();
              // Follow the requirement strictly: use DataTransfer to update the file input
              if (inputRef.current) {
                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(file);
                inputRef.current.files = dataTransfer.files;
              }
              processFile(file);
              return;
            }
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => {
      window.removeEventListener('paste', handlePaste);
    };
  }, [processFile]);

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', padding: '40px' }}>
      <div
        className={`dropzone${dragOver ? ' drag-over' : ''}`}
        style={{
          width: '100%',
          maxWidth: 600,
          padding: '60px 40px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 24,
          textAlign: 'center',
          minHeight: 400,
        }}
        onClick={() => inputRef.current?.click()}
        onDrop={onDrop}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragEnter={() => setDragOver(true)}
        onDragLeave={() => setDragOver(false)}
        role="button"
        tabIndex={0}
        id="upload-dropzone"
        aria-label="Upload passport photo"
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
      >
        <div style={{
          width: 80, height: 80,
          borderRadius: '50%',
          background: 'var(--accent-glow)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: '1.5px solid var(--accent)',
          transition: 'transform 0.3s ease',
        }}>
          {dragOver
            ? <ImageIcon size={36} color="var(--accent)" />
            : <Upload size={36} color="var(--accent)" />
          }
        </div>
        <div>
          <div className="apple-h2" style={{ fontSize: 24, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>
            {dragOver ? 'Drop your photo here' : 'Upload or Paste Photo'}
          </div>
          <div style={{ fontSize: 16, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            Drag & drop, click to browse, or Paste (Ctrl+V) · JPG, PNG · Max 10MB
          </div>
        </div>
        <button
          className="btn-primary"
          onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
          id="browse-btn"
          type="button"
          style={{ fontSize: 16, padding: '12px 24px' }}
        >
          <Upload size={18} />
          Browse Files
        </button>
        <input
          ref={inputRef}
          type="file"
          accept=".jpg,.jpeg,.png,image/jpeg,image/png"
          onChange={onFileChange}
          style={{ display: 'none' }}
          id="file-input"
        />

        {error && (
          <div className="warning-box" style={{
            display: 'flex', alignItems: 'center', gap: 10,
            color: 'var(--danger)',
            fontSize: 15,
            width: '100%',
            maxWidth: 460,
          }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
