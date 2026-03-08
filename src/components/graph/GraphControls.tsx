// Graph control panel — edge visibility toggles, sliders, view mode switch

import React, { forwardRef, useState } from 'react';
import { EDGE_COLORS, EDGE_LABELS, type EdgeType, type EdgeVisibility } from './useGraphData';

export interface GraphSettings {
  nodeSize: number;      // multiplier 0.5–3
  edgeOpacity: number;   // 0.05–1
  forceStrength: number; // 0.1–5 (repulsion)
  linkDistance: number;   // 20–200
  gravity: number;       // 0–1 (pulls islands toward center)
  labelSize: number;     // 0–14 (0 = hidden)
  showLabels: boolean;   // master toggle for labels (2D + 3D)
  warmupTicks: number;   // initial simulation ticks
  edgeWidth: number;     // base line width 0.2–3
  alphaDecay: number;    // simulation settling speed 0.005–0.1
  velocityDecay: number; // damping 0.05–0.8
}

export const DEFAULT_SETTINGS: GraphSettings = {
  nodeSize: 1,
  edgeOpacity: 0.35,
  forceStrength: 1,
  linkDistance: 60,
  gravity: 0.15,
  labelSize: 10,
  showLabels: false,
  warmupTicks: 100,
  edgeWidth: 0.8,
  alphaDecay: 0.02,
  velocityDecay: 0.3,
};

export interface SearchResultItem {
  id: string;
  name: string;
  address: string;
}

interface GraphControlsProps {
  visibility: EdgeVisibility;
  onVisibilityChange: (v: EdgeVisibility) => void;
  settings: GraphSettings;
  onSettingsChange: (s: GraphSettings) => void;
  dimension: '2d' | '3d';
  onDimensionChange: (d: '2d' | '3d') => void;
  nodeCount: number;
  linkCount: number;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSearchSubmit: () => void;
  searchResultCount: number;
  searchResults: SearchResultItem[];
  activeResultId: string | null;
  onResultClick: (id: string) => void;
}

const Slider: React.FC<{
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  display?: (v: number) => string;
}> = ({ label, value, min, max, step, onChange, display }) => (
  <label className="flex items-center gap-2 text-[11px] text-th-secondary">
    <span className="w-20 shrink-0 text-th-tertiary">{label}</span>
    <input
      type="range"
      min={min} max={max} step={step}
      value={value}
      onChange={e => onChange(Number(e.target.value))}
      className="flex-1 h-1 accent-violet-500 cursor-pointer"
    />
    <span className="w-8 text-right tabular-nums text-th-muted text-[10px]">
      {display ? display(value) : value.toFixed(step < 1 ? 2 : 0)}
    </span>
  </label>
);

const EdgeToggle: React.FC<{
  type: EdgeType;
  active: boolean;
  onToggle: () => void;
}> = ({ type, active, onToggle }) => (
  <button
    onClick={onToggle}
    className={`flex items-center gap-1.5 px-2 py-1 text-[10px] border transition-all ${
      active
        ? 'border-th-hub-border bg-th-surface text-th-primary'
        : 'border-transparent bg-transparent text-th-muted opacity-50'
    }`}
  >
    <span
      className="w-2.5 h-2.5 rounded-full shrink-0"
      style={{ backgroundColor: active ? EDGE_COLORS[type] : '#555' }}
    />
    {EDGE_LABELS[type]}
  </button>
);

const AdvancedSection: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-t border-th-hub-border pt-1">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center justify-between w-full text-[10px] text-th-muted hover:text-th-secondary transition-colors py-1"
      >
        <span className="uppercase tracking-wider">Advanced parameters</span>
        <svg width="8" height="8" viewBox="0 0 8 8" fill="none" stroke="currentColor" strokeWidth="1.5"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 150ms' }}
        >
          <path d="M1 3l3 3 3-3" />
        </svg>
      </button>
      {open && <div className="flex flex-col gap-1.5 pt-1 pb-1">{children}</div>}
    </div>
  );
};

export const GraphControls = forwardRef<HTMLInputElement, GraphControlsProps>(({
  visibility,
  onVisibilityChange,
  settings,
  onSettingsChange,
  dimension,
  onDimensionChange,
  nodeCount,
  linkCount,
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  searchResultCount,
  searchResults,
  activeResultId,
  onResultClick,
}, ref) => {
  const toggleEdge = (type: EdgeType) => {
    onVisibilityChange({ ...visibility, [type]: !visibility[type] });
  };

  const setSetting = <K extends keyof GraphSettings>(key: K, val: GraphSettings[K]) => {
    onSettingsChange({ ...settings, [key]: val });
  };

  // Presets
  const setPreset = (preset: 'refs' | 'hierarchy' | 'all') => {
    switch (preset) {
      case 'refs':
        onVisibilityChange({ body: true, interaction: true, hierarchy: false });
        break;
      case 'hierarchy':
        onVisibilityChange({ body: false, interaction: false, hierarchy: true });
        break;
      case 'all':
        onVisibilityChange({ body: true, interaction: true, hierarchy: true });
        break;
    }
  };

  const activePreset =
    visibility.body && visibility.interaction && !visibility.hierarchy ? 'refs'
    : !visibility.body && !visibility.interaction && visibility.hierarchy ? 'hierarchy'
    : visibility.body && visibility.interaction && visibility.hierarchy ? 'all'
    : null;

  return (
    <div className="flex flex-col gap-3 p-3 bg-th-base/90 backdrop-blur-sm border border-th-hub-border text-th-secondary select-none"
      style={{ width: 260 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium text-th-heading tracking-wide uppercase">Graph</span>
        <span className="text-[9px] text-th-muted tabular-nums">
          {nodeCount}n · {linkCount}e
        </span>
      </div>

      {/* Search */}
      <div>
        <div className="relative">
          <input
            ref={ref}
            type="text"
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') onSearchSubmit();
              if (e.key === 'Escape') { onSearchChange(''); (e.target as HTMLInputElement).blur(); }
            }}
            placeholder="Find node..."
            className="w-full text-[11px] px-2 py-1.5 bg-transparent border border-th-hub-border text-th-primary placeholder-th-muted focus:outline-none focus:border-violet-500/50"
          />
          {searchQuery && (
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] text-th-muted tabular-nums">
              {searchResultCount}
            </span>
          )}
        </div>
        {searchQuery && searchResults.length > 0 && (
          <div className="max-h-[200px] overflow-y-auto border border-t-0 border-th-hub-border bg-th-base/95 backdrop-blur-sm">
            {searchResults.slice(0, 20).map((r, i) => (
              <button
                key={r.id}
                onClick={() => onResultClick(r.id)}
                className={`w-full text-left px-2 py-1.5 text-[11px] transition-colors truncate flex items-center gap-1.5 ${
                  r.id === activeResultId
                    ? 'bg-violet-500/20 text-violet-300'
                    : i === 0 && !activeResultId
                      ? 'bg-violet-500/10 text-th-primary'
                      : 'text-th-secondary hover:bg-violet-500/10 hover:text-th-primary'
                }`}
              >
                <span className="truncate">{r.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Dimension toggle */}
      <div className="flex border border-th-hub-border">
        {(['2d', '3d'] as const).map(d => (
          <button
            key={d}
            onClick={() => onDimensionChange(d)}
            className={`flex-1 py-1 text-[10px] font-medium uppercase transition-colors ${
              dimension === d
                ? 'bg-violet-500/20 text-violet-400 border-violet-500/30'
                : 'text-th-muted hover:text-th-secondary'
            }`}
          >
            {d}
          </button>
        ))}
      </div>

      {/* Presets */}
      <div className="flex gap-1">
        {([
          ['refs', 'References'] as const,
          ['hierarchy', 'Hierarchy'] as const,
          ['all', 'All'] as const,
        ]).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setPreset(key)}
            className={`flex-1 py-1 text-[10px] border transition-colors ${
              activePreset === key
                ? 'border-violet-500/40 bg-violet-500/15 text-violet-400'
                : 'border-th-hub-border text-th-muted hover:text-th-secondary'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Edge toggles */}
      <div className="flex flex-col gap-0.5">
        {(['body', 'interaction', 'hierarchy'] as EdgeType[]).map(type => (
          <EdgeToggle
            key={type}
            type={type}
            active={visibility[type]}
            onToggle={() => toggleEdge(type)}
          />
        ))}
      </div>

      {/* Sliders */}
      <div className="flex flex-col gap-1.5 pt-1 border-t border-th-hub-border">
        <Slider label="Node size" value={settings.nodeSize} min={0.3} max={4} step={0.1}
          onChange={v => setSetting('nodeSize', v)} />
        <Slider label="Edge opacity" value={settings.edgeOpacity} min={0.05} max={1} step={0.05}
          onChange={v => setSetting('edgeOpacity', v)} />
        <Slider label="Repulsion" value={settings.forceStrength} min={0.1} max={5} step={0.1}
          onChange={v => setSetting('forceStrength', v)} />
        <Slider label="Link dist." value={settings.linkDistance} min={10} max={250} step={5}
          onChange={v => setSetting('linkDistance', v)} />
        <Slider label="Gravity" value={settings.gravity} min={0} max={1} step={0.05}
          onChange={v => setSetting('gravity', v)} />
        <label className="flex items-center gap-2 text-[11px] text-th-secondary">
          <span className="w-20 shrink-0 text-th-tertiary">Labels</span>
          <button
            onClick={() => setSetting('showLabels', !settings.showLabels)}
            className={`shrink-0 px-1.5 py-0.5 text-[9px] border transition-colors ${
              settings.showLabels
                ? 'border-violet-500/40 bg-violet-500/15 text-violet-400'
                : 'border-th-hub-border text-th-muted'
            }`}
          >
            {settings.showLabels ? 'ON' : 'OFF'}
          </button>
          {settings.showLabels && (
            <input
              type="range"
              min={4} max={16} step={1}
              value={settings.labelSize}
              onChange={e => setSetting('labelSize', Number(e.target.value))}
              className="min-w-0 flex-1 h-1 accent-violet-500 cursor-pointer"
            />
          )}
          {settings.showLabels && (
            <span className="w-6 shrink-0 text-right tabular-nums text-th-muted text-[10px]">{settings.labelSize}</span>
          )}
        </label>
      </div>

      {/* Advanced */}
      <AdvancedSection>
        <Slider label="Edge width" value={settings.edgeWidth} min={0.2} max={3} step={0.1}
          onChange={v => setSetting('edgeWidth', v)} />
        <Slider label="Warmup" value={settings.warmupTicks} min={0} max={300} step={10}
          onChange={v => setSetting('warmupTicks', v)} display={v => String(v)} />
        <Slider label="Alpha decay" value={settings.alphaDecay} min={0.005} max={0.1} step={0.005}
          onChange={v => setSetting('alphaDecay', v)} display={v => v.toFixed(3)} />
        <Slider label="Damping" value={settings.velocityDecay} min={0.05} max={0.8} step={0.05}
          onChange={v => setSetting('velocityDecay', v)} />
      </AdvancedSection>

      {/* Reset */}
      <button
        onClick={() => onSettingsChange({ ...DEFAULT_SETTINGS })}
        className="text-[10px] text-th-muted hover:text-violet-400 transition-colors text-left"
      >
        Reset defaults
      </button>
    </div>
  );
});

GraphControls.displayName = 'GraphControls';
