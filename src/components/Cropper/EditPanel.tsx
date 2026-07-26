import { useAppStore } from '../../store/appStore';
import type { ImageFilters } from '../../store/appStore';
import { SlidersHorizontal, Sun, Contrast, Droplets, Thermometer, Sparkles, RefreshCcw } from 'lucide-react';

export default function EditPanel() {
  const { filters, rotation, setFilter, setRotation, resetFilters } = useAppStore();

  const handleFilterChange = (key: keyof ImageFilters, value: number) => {
    setFilter(key, value);
  };

  return (
    <div style={{
      width: 320,
      height: '100%',
      background: 'var(--bg-secondary)',
      borderLeft: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      overflowY: 'auto',
    }}>
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        background: 'var(--bg-secondary)',
        zIndex: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, color: 'var(--text-primary)' }}>
          <SlidersHorizontal size={18} />
          Edit Photo
        </div>
        <button 
          onClick={resetFilters}
          className="btn-secondary" 
          style={{ padding: '6px 12px', fontSize: 13, background: 'transparent', border: 'none' }}
          title="Reset all edits"
        >
          <RefreshCcw size={14} /> Reset
        </button>
      </div>

      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 24 }}>
        
        {/* Brightness */}
        <div className="filter-control">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13, color: 'var(--text-secondary)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Sun size={14}/> Brightness</span>
            <span>{Math.round(filters.brightness - 100)}</span>
          </div>
          <input 
            type="range" min={0} max={200} value={filters.brightness} 
            onChange={(e) => handleFilterChange('brightness', Number(e.target.value))} 
            onDoubleClick={() => handleFilterChange('brightness', 100)}
            style={{ width: '100%' }}
          />
        </div>

        {/* Contrast */}
        <div className="filter-control">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13, color: 'var(--text-secondary)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Contrast size={14}/> Contrast</span>
            <span>{Math.round(filters.contrast - 100)}</span>
          </div>
          <input 
            type="range" min={0} max={200} value={filters.contrast} 
            onChange={(e) => handleFilterChange('contrast', Number(e.target.value))} 
            onDoubleClick={() => handleFilterChange('contrast', 100)}
            style={{ width: '100%' }}
          />
        </div>

        {/* Saturation */}
        <div className="filter-control">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13, color: 'var(--text-secondary)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Droplets size={14}/> Saturation</span>
            <span>{Math.round(filters.saturation - 100)}</span>
          </div>
          <input 
            type="range" min={0} max={200} value={filters.saturation} 
            onChange={(e) => handleFilterChange('saturation', Number(e.target.value))} 
            onDoubleClick={() => handleFilterChange('saturation', 100)}
            style={{ width: '100%' }}
          />
        </div>

        {/* Temperature */}
        <div className="filter-control">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13, color: 'var(--text-secondary)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Thermometer size={14}/> Temperature</span>
            <span>{filters.temperature}</span>
          </div>
          <input 
            type="range" min={-100} max={100} value={filters.temperature} 
            onChange={(e) => handleFilterChange('temperature', Number(e.target.value))} 
            onDoubleClick={() => handleFilterChange('temperature', 0)}
            style={{ width: '100%' }}
          />
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid var(--border)' }} />

        {/* Highlights */}
        <div className="filter-control">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13, color: 'var(--text-secondary)' }}>
            <span>Highlights</span>
            <span>{filters.highlights}</span>
          </div>
          <input 
            type="range" min={-100} max={100} value={filters.highlights} 
            onChange={(e) => handleFilterChange('highlights', Number(e.target.value))} 
            onDoubleClick={() => handleFilterChange('highlights', 0)}
            style={{ width: '100%' }}
          />
        </div>

        {/* Shadows */}
        <div className="filter-control">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13, color: 'var(--text-secondary)' }}>
            <span>Shadows</span>
            <span>{filters.shadows}</span>
          </div>
          <input 
            type="range" min={-100} max={100} value={filters.shadows} 
            onChange={(e) => handleFilterChange('shadows', Number(e.target.value))} 
            onDoubleClick={() => handleFilterChange('shadows', 0)}
            style={{ width: '100%' }}
          />
        </div>

        {/* Sharpen */}
        <div className="filter-control">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13, color: 'var(--text-secondary)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Sparkles size={14}/> Sharpening</span>
            <span>{filters.sharpen}</span>
          </div>
          <input 
            type="range" min={0} max={100} value={filters.sharpen} 
            onChange={(e) => handleFilterChange('sharpen', Number(e.target.value))} 
            onDoubleClick={() => handleFilterChange('sharpen', 0)}
            style={{ width: '100%' }}
          />
        </div>
        
        {/* Rotation */}
        <div className="filter-control">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13, color: 'var(--text-secondary)' }}>
            <span>Rotation (Degrees)</span>
            <span>{Math.round(rotation)}°</span>
          </div>
          <input 
            type="range" min={-45} max={45} value={rotation} step={0.1}
            onChange={(e) => setRotation(Number(e.target.value))} 
            onDoubleClick={() => setRotation(0)}
            style={{ width: '100%' }}
          />
        </div>

      </div>
    </div>
  );
}
