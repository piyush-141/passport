import { useAppStore } from '../../store/appStore';
import { PAGE_SIZES, PASSPORT_SIZES, calculateLayout } from '../../utils/measurement';

interface SliderRowProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  id: string;
  unit?: string;
  hint?: string;
}

function SliderRow({
  label, value, min, max, step, onChange, id, unit = 'mm', hint
}: SliderRowProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <label className="form-label" style={{ margin: 0, fontSize: 14 }} htmlFor={id}>{label}</label>
        <span style={{ fontSize: 15, color: 'var(--accent)', fontWeight: 700 }}>
          {value}{unit}
        </span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))} id={id} />
      {hint && <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{hint}</div>}
    </div>
  );
}

export default function SettingsStep() {
  const store = useAppStore();
  const {
    passportSizeId, setPassportSize, customPassportW, customPassportH, setCustomPassport,
    pageSizeId, setPageSize, customPageW, customPageH, setCustomPage,
    copies, setCopies, margin, setMargin, spacing, setSpacing, border, setBorder,
  } = store;

  const passDims = store.getPassportDimensions();
  const pageDims = store.getPageDimensions();

  const layout = calculateLayout(
    pageDims.width, pageDims.height,
    passDims.width, passDims.height,
    margin, spacing, border,
    store.gridColsOverride,
    store.gridRowsOverride,
    store.alignment,
  );

  // Compute maximum physically possible columns and rows
  const totalPhotoW = passDims.width + border * 2;
  const totalPhotoH = passDims.height + border * 2;
  const usableW = pageDims.width - margin * 2;
  const usableH = pageDims.height - margin * 2;
  const maxCols = Math.max(1, Math.floor((usableW + spacing) / (totalPhotoW + spacing)));
  const maxRows = Math.max(1, Math.floor((usableH + spacing) / (totalPhotoH + spacing)));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* 3-column main settings */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>

        {/* Col 1: Passport size */}
        <div className="glass-card" style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="apple-h3" style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)' }}>
            📐 Photo Preset
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {PASSPORT_SIZES.map(s => (
              <div
                key={s.id}
                className={`option-chip ${passportSizeId === s.id ? 'selected' : ''}`}
                onClick={() => setPassportSize(s.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && setPassportSize(s.id)}
              >
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{s.label.split(' (')[0]}</div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                  {s.id === 'custom' ? 'Custom' : `${s.width}×${s.height}mm`}
                </div>
              </div>
            ))}
          </div>

          {passportSizeId === 'custom' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 4 }}>
              <div>
                <label className="form-label" htmlFor="custom-pw">Width (mm)</label>
                <input className="form-input" type="number" min={20} max={100} step={0.5}
                  value={customPassportW} id="custom-pw"
                  onChange={(e) => setCustomPassport(Number(e.target.value), customPassportH)} />
              </div>
              <div>
                <label className="form-label" htmlFor="custom-ph">Height (mm)</label>
                <input className="form-input" type="number" min={20} max={100} step={0.5}
                  value={customPassportH} id="custom-ph"
                  onChange={(e) => setCustomPassport(customPassportW, Number(e.target.value))} />
              </div>
            </div>
          )}

          <div style={{ marginTop: 'auto', padding: '10px 14px', background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 10, fontSize: 14, color: 'var(--text-secondary)', textAlign: 'center', fontWeight: 500 }}>
            Target: {passDims.width} × {passDims.height} mm
          </div>
        </div>

        {/* Col 2: Page size */}
        <div className="glass-card" style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="apple-h3" style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)' }}>
            📄 Paper Preset
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {PAGE_SIZES.map(s => (
              <div
                key={s.id}
                className={`option-chip ${pageSizeId === s.id ? 'selected' : ''}`}
                onClick={() => setPageSize(s.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && setPageSize(s.id)}
              >
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{s.label.split(' (')[0]}</div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                  {s.id === 'custom' ? 'Custom' : `${Math.round(s.width)}×${Math.round(s.height)}mm`}
                </div>
              </div>
            ))}
          </div>

          {pageSizeId === 'custom' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 4 }}>
              <div>
                <label className="form-label" htmlFor="custom-pgw">Width (mm)</label>
                <input className="form-input" type="number" min={50} max={500} step={1}
                  value={customPageW} id="custom-pgw"
                  onChange={(e) => setCustomPage(Number(e.target.value), customPageH)} />
              </div>
              <div>
                <label className="form-label" htmlFor="custom-pgh">Height (mm)</label>
                <input className="form-input" type="number" min={50} max={500} step={1}
                  value={customPageH} id="custom-pgh"
                  onChange={(e) => setCustomPage(customPageW, Number(e.target.value))} />
              </div>
            </div>
          )}

          <div style={{ marginTop: 'auto', padding: '10px 14px', background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 10, fontSize: 14, color: 'var(--text-secondary)', textAlign: 'center', fontWeight: 500 }}>
            Paper: {pageDims.width} × {pageDims.height} mm
          </div>
        </div>

        {/* Col 3: Layout sliders & custom grid overrides */}
        <div className="glass-card" style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="apple-h3" style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)' }}>
            ⚙️ Layout Customization
          </div>

          <SliderRow label="Copies" value={copies} min={0} max={layout.total} step={1}
            onChange={setCopies} id="copies-slider" unit="" 
            hint={copies === 0 ? `Auto (${layout.total} photos, ${layout.cols}×${layout.rows})` : `${layout.cols}×${layout.rows} grid`} />

          <SliderRow label="Margin" value={margin} min={0} max={20} step={0.5}
            onChange={setMargin} id="margin-slider" />

          <SliderRow label="Spacing" value={spacing} min={0} max={10} step={0.5}
            onChange={setSpacing} id="spacing-slider" />

          <SliderRow label="Border" value={border} min={0} max={3} step={0.5}
            onChange={setBorder} id="border-slider"
            hint={border === 0 ? 'No border' : `${border}mm black border`} />

          {/* Grid Override & Alignment Section */}
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14, marginTop: 8, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div className="apple-h3" style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
              🎛️ Custom Grid Override
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label className="form-label" style={{ fontSize: 11, marginBottom: 4 }} htmlFor="cols-override">Grid Cols</label>
                <select 
                  className="form-select" 
                  value={store.gridColsOverride ?? ''} 
                  onChange={(e) => store.setGridColsOverride(e.target.value === '' ? null : Number(e.target.value))} 
                  id="cols-override"
                  style={{ padding: '8px 12px', fontSize: 14 }}
                >
                  <option value="">Auto (Max {maxCols})</option>
                  {Array.from({ length: maxCols }, (_, i) => i + 1).map(n => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="form-label" style={{ fontSize: 11, marginBottom: 4 }} htmlFor="rows-override">Grid Rows</label>
                <select 
                  className="form-select" 
                  value={store.gridRowsOverride ?? ''} 
                  onChange={(e) => store.setGridRowsOverride(e.target.value === '' ? null : Number(e.target.value))} 
                  id="rows-override"
                  style={{ padding: '8px 12px', fontSize: 14 }}
                >
                  <option value="">Auto (Max {maxRows})</option>
                  {Array.from({ length: maxRows }, (_, i) => i + 1).map(n => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="form-label" style={{ fontSize: 11, marginBottom: 4 }}>Alignment</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {(['center', 'left'] as const).map(align => (
                  <button
                    key={align}
                    className="btn-secondary"
                    onClick={() => store.setAlignment(align)}
                    type="button"
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      fontSize: 14,
                      borderRadius: 10,
                      background: store.alignment === align ? 'var(--accent-glow)' : 'transparent',
                      borderColor: store.alignment === align ? 'var(--accent)' : 'var(--border)',
                      color: store.alignment === align ? 'var(--accent)' : 'var(--text-secondary)',
                      fontWeight: store.alignment === align ? '600' : '400',
                      transition: 'var(--transition-smooth)',
                      justifyContent: 'center',
                    }}
                  >
                    {align === 'center' ? 'Center Aligned' : 'Left Aligned'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary bar + CTA */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap', width: '100%' }}>
        <div style={{
          flex: 1, padding: '14px 20px',
          background: 'var(--bg-secondary)',
          borderRadius: 14, border: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', gap: 24, fontSize: 14,
          flexWrap: 'wrap',
        }}>
          <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>
            Grid Layout: <strong style={{ color: 'var(--accent)' }}>{layout.cols}×{layout.rows}</strong>
          </span>
          <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>
            Total Selected: <strong style={{ color: 'var(--accent)' }}>{copies === 0 ? layout.total : Math.min(copies, layout.total)} photos</strong>
          </span>
          <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>
            Max Capacity: <strong style={{ color: 'var(--success)' }}>{layout.total}</strong>
          </span>
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button 
            className="btn-secondary" 
            onClick={store.resetSettings}
            type="button" 
            style={{ height: 48, fontSize: 16, border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
          >
            Reset Defaults
          </button>
        </div>
      </div>
    </div>
  );
}
