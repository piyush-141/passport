import { useState, useRef, useEffect } from 'react';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import type { Crop, PixelCrop, PercentCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { useAppStore } from '../../store/appStore';
import EditPanel from './EditPanel';
import { applyFiltersAndRotation } from '../../utils/imageProcessor';
import { RotateCw } from 'lucide-react';

function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number,
) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight,
    ),
    mediaWidth,
    mediaHeight,
  )
}

export default function ImageCropper({ showEditPanel }: { showEditPanel?: boolean }) {
  const { rawImageUrl, getPassportDimensions, setCropPercent, filters, rotation, setRotation } = useAppStore();
  const [crop, setCrop] = useState<Crop>();
  const [aspect, setAspect] = useState<number | undefined>(undefined);
  const imgRef = useRef<HTMLImageElement>(null);
  const hiddenImgRef = useRef<HTMLImageElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const isDraggingRotation = useRef(false);
  const startAngle = useRef(0);
  const startRotation = useRef(0);

  useEffect(() => {
    const dims = getPassportDimensions();
    setAspect(dims.width / dims.height);
  }, [getPassportDimensions]);

  // Generate live preview when filters or image changes
  useEffect(() => {
    if (!hiddenImgRef.current || !rawImageUrl) return;
    
    if (hiddenImgRef.current.complete) {
      updatePreview();
    }
  }, [filters, rotation, rawImageUrl]);

  const updatePreview = () => {
    if (!hiddenImgRef.current) return;
    const canvas = applyFiltersAndRotation(hiddenImgRef.current, filters, rotation, 800);
    setPreviewUrl(canvas.toDataURL('image/jpeg', 0.8));
  };

  const handleRotationStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!imgRef.current) return;

    const rect = imgRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const dx = clientX - centerX;
    const dy = clientY - centerY;
    
    startAngle.current = Math.atan2(dy, dx);
    startRotation.current = rotation;
    isDraggingRotation.current = true;

    document.addEventListener('mousemove', handleRotationMove);
    document.addEventListener('mouseup', handleRotationEnd);
    document.addEventListener('touchmove', handleRotationMove, { passive: false });
    document.addEventListener('touchend', handleRotationEnd);
  };

  const handleRotationMove = (e: MouseEvent | TouchEvent) => {
    if (!isDraggingRotation.current || !imgRef.current) return;
    if (e.cancelable) e.preventDefault();

    const rect = imgRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const dx = clientX - centerX;
    const dy = clientY - centerY;

    const currentAngle = Math.atan2(dy, dx);
    const angleDiffRad = currentAngle - startAngle.current;
    const angleDiffDeg = (angleDiffRad * 180) / Math.PI;

    let newRotation = startRotation.current + angleDiffDeg;
    newRotation = Math.max(-45, Math.min(45, newRotation));
    setRotation(newRotation);
  };

  const handleRotationEnd = () => {
    isDraggingRotation.current = false;
    document.removeEventListener('mousemove', handleRotationMove);
    document.removeEventListener('mouseup', handleRotationEnd);
    document.removeEventListener('touchmove', handleRotationMove);
    document.removeEventListener('touchend', handleRotationEnd);
  };

  // Clean up listeners on unmount
  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleRotationMove);
      document.removeEventListener('mouseup', handleRotationEnd);
      document.removeEventListener('touchmove', handleRotationMove);
      document.removeEventListener('touchend', handleRotationEnd);
    };
  }, []);

  function onHiddenImageLoad() {
    updatePreview();
  }

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    if (aspect) {
      const { width, height } = e.currentTarget;
      setCrop(centerAspectCrop(width, height, aspect));
    }
  }

  const handleComplete = (_crop: PixelCrop, percentCrop: PercentCrop) => {
    if (imgRef.current && percentCrop.width && percentCrop.height) {
      setCropPercent(percentCrop);
    } else {
      setCropPercent(null);
    }
  };

  if (!rawImageUrl) return null;

  return (
    <div style={{ display: 'flex', width: '100%', height: '100%', overflow: 'hidden' }}>
      
      {/* Hidden original image for processing */}
      <img 
        ref={hiddenImgRef} 
        src={rawImageUrl} 
        onLoad={onHiddenImageLoad} 
        style={{ display: 'none' }} 
        alt="" 
        crossOrigin="anonymous"
      />

      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        overflow: 'hidden',
        position: 'relative'
      }}>
        {previewUrl ? (
          <div style={{ position: 'relative', display: 'inline-block', maxWidth: '100%', maxHeight: '100%' }}>
            <ReactCrop
              crop={crop}
              onChange={(_, percentCrop) => setCrop(percentCrop)}
              onComplete={handleComplete}
              aspect={aspect}
              keepSelection
            >
              <img
                ref={imgRef}
                src={previewUrl}
                alt="Upload"
                style={{ 
                  maxWidth: '100%', 
                  maxHeight: 'calc(100vh - 120px)', // adjust for header and padding
                  display: 'block'
                }}
                onLoad={onImageLoad}
              />

              {/* Rotator Handle UI overlaid above the crop box */}
              {crop && crop.width && crop.x !== undefined && (
                <div
                  style={{
                    position: 'absolute',
                    left: `${crop.x + crop.width / 2}%`,
                    top: `${crop.y}%`,
                    transform: 'translate(-50%, -46px)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    cursor: 'grab',
                    zIndex: 1000,
                  }}
                  onMouseDown={handleRotationStart}
                  onTouchStart={handleRotationStart}
                >
                  {/* Rotation handler circle */}
                  <div style={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    background: '#ffffff',
                    border: '1.5px solid var(--accent)',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--accent)',
                    cursor: 'grab',
                  }}>
                    <RotateCw size={12} />
                  </div>
                  {/* Vertical connector line */}
                  <div style={{ width: 1.5, height: 18, background: '#ffffff', boxShadow: '0 0 2px rgba(0,0,0,0.5)' }} />
                </div>
              )}
            </ReactCrop>
          </div>
        ) : (
          <div className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} />
        )}
      </div>
      
      {showEditPanel && (
        <EditPanel />
      )}
    </div>
  );
}
