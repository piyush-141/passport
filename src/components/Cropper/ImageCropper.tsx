import { useState, useRef, useEffect } from 'react';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import type { Crop, PixelCrop, PercentCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { useAppStore } from '../../store/appStore';
import EditPanel from './EditPanel';
import { applyFiltersAndRotation } from '../../utils/imageProcessor';

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
  const { rawImageUrl, getPassportDimensions, setCropPercent, filters, rotation } = useAppStore();
  const [crop, setCrop] = useState<Crop>();
  const [aspect, setAspect] = useState<number | undefined>(undefined);
  const imgRef = useRef<HTMLImageElement>(null);
  const hiddenImgRef = useRef<HTMLImageElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    const dims = getPassportDimensions();
    setAspect(dims.width / dims.height);
  }, [getPassportDimensions]);

  // Generate live preview when filters or image changes
  useEffect(() => {
    if (!hiddenImgRef.current || !rawImageUrl) return;
    
    // We need to wait for the hidden image to load if it hasn't
    if (hiddenImgRef.current.complete) {
      updatePreview();
    }
  }, [filters, rotation, rawImageUrl]);

  const updatePreview = () => {
    if (!hiddenImgRef.current) return;
    const canvas = applyFiltersAndRotation(hiddenImgRef.current, filters, rotation, 800);
    setPreviewUrl(canvas.toDataURL('image/jpeg', 0.8));
  };

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
