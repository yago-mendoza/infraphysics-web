// Graph filter panel — hub filters (structure, date, content, scope) for the graph view
// Matches GraphControls styling. Changes sync to URL params via onChange callback.

import React, { useState, useCallback } from 'react';
import type { FilterState } from '../../hooks/useSecondBrainHub';

interface GraphFilterPanelProps {
  filters: FilterState;
  searchQuery: string;
  searchMode: string;
  directoryScope: string | null;
  onChange: (filters: FilterState, opts?: { query?: string; scope?: string | null }) => void;
  onClear: () => void;
  maxDepth: number;
  activeCount: number;
}

// ─── Reusable sub-components (match GraphControls patterns) ─────────

const Slider: React.FC<{
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  display?: (v: number) => string;
  infinity?: boolean;
}> = ({ label, value, min, max, step, onChange, display, infinity }) => (
  <label className="flex items-center gap-2 text-[11px] text-th-secondary">
    <span className="w-20 shrink-0 text-th-tertiary">{label}</span>
    <input
      type="range"
      min={min} max={max} step={step}
      value={infinity && value >= max ? max : value}
      onChange={e => onChange(Number(e.target.value))}
      className="flex-1 h-1 accent-violet-500 cursor-pointer"
    />
    <span className="w-8 text-right tabular-nums text-th-muted text-[10px]">
      {infinity && value >= max ? '∞' : display ? display(value) : String(value)}
    </span>
  </label>
);

const Toggle: React.FC<{
  label: string;
  active: boolean;
  onToggle: () => void;
}> = ({ label, active, onToggle }) => (
  <button
    onClick={onToggle}
    className={`flex items-center gap-1.5 px-2 py-1 text-[10px] border transition-all ${
      active
        ? 'border-violet-500/40 bg-violet-500/15 text-violet-400'
        : 'border-th-hub-border text-th-muted hover:text-th-secondary'
    }`}
  >
    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${active ? 'bg-violet-400' : 'bg-th-muted/40'}`} />
    {label}
  </button>
);

const SectionLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="text-[9px] uppercase tracking-wider text-th-muted pt-1">{children}</span>
);

// ─── Main component ─────────────────────────────────────────────────

const GraphFilterPanel: React.FC<GraphFilterPanelProps> = ({
  filters,
  directoryScope,
  onChange,
  onClear,
  maxDepth,
  activeCount,
}) => {
  // Local state for text inputs (apply on Enter/blur)
  const [dateInput, setDateInput] = useState(filters.dateFilter || '');
  const [scopeInput, setScopeInput] = useState(directoryScope || '');

  const update = useCallback(<K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    onChange({ ...filters, [key]: value });
  }, [filters, onChange]);

  const applyDate = useCallback(() => {
    const val = dateInput.trim() || null;
    onChange({ ...filters, dateFilter: val });
  }, [dateInput, filters, onChange]);

  const applyScope = useCallback(() => {
    const val = scopeInput.trim() || null;
    onChange(filters, { scope: val });
  }, [scopeInput, filters, onChange]);

  // Count active filters
  const activeFilterCount = [
    filters.isolated,
    filters.leaf,
    filters.bridgesOnly,
    filters.hubThreshold > 0,
    filters.depthMin > 1,
    filters.depthMax < maxDepth,
    filters.islandId != null,
    filters.dateFilter != null,
    filters.wordCountMin > 0,
    filters.wordCountMax < 2000,
    !!directoryScope,
  ].filter(Boolean).length;

  return (
    <div
      className="flex flex-col gap-2.5 p-3 bg-th-base/90 backdrop-blur-sm border border-th-hub-border text-th-secondary select-none"
      style={{ width: 260 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-medium text-th-heading tracking-wide uppercase">Filters</span>
          {activeFilterCount > 0 && (
            <span className="text-[9px] bg-violet-500/20 text-violet-400 px-1.5 py-0.5 tabular-nums">
              {activeFilterCount}
            </span>
          )}
        </div>
        <span className="text-[9px] text-th-muted tabular-nums">{activeCount} nodes</span>
      </div>

      {/* Structure */}
      <div className="flex flex-col gap-1.5">
        <SectionLabel>Structure</SectionLabel>
        <Slider
          label="Depth min"
          value={filters.depthMin}
          min={1} max={maxDepth} step={1}
          onChange={v => update('depthMin', v)}
        />
        <Slider
          label="Depth max"
          value={filters.depthMax >= maxDepth ? maxDepth : filters.depthMax}
          min={1} max={maxDepth} step={1}
          onChange={v => update('depthMax', v >= maxDepth ? Infinity : v)}
          infinity
        />
        <Slider
          label="Min refs"
          value={filters.hubThreshold}
          min={0} max={30} step={1}
          onChange={v => update('hubThreshold', v)}
          display={v => v === 0 ? 'off' : String(v)}
        />
        <div className="flex flex-wrap gap-1 pt-0.5">
          <Toggle label="Isolated" active={filters.isolated} onToggle={() => update('isolated', !filters.isolated)} />
          <Toggle label="Leaf only" active={filters.leaf} onToggle={() => update('leaf', !filters.leaf)} />
          <Toggle label="Bridges" active={filters.bridgesOnly} onToggle={() => update('bridgesOnly', !filters.bridgesOnly)} />
        </div>
      </div>

      {/* Date */}
      <div className="flex flex-col gap-1.5 border-t border-th-hub-border pt-2">
        <SectionLabel>Date</SectionLabel>
        <input
          type="text"
          value={dateInput}
          onChange={e => setDateInput(e.target.value)}
          onBlur={applyDate}
          onKeyDown={e => { if (e.key === 'Enter') applyDate(); if (e.key === 'Escape') { setDateInput(filters.dateFilter || ''); (e.target as HTMLInputElement).blur(); } }}
          placeholder="2026-02-05 or 2026-02..2026-03"
          className="w-full text-[11px] px-2 py-1.5 bg-transparent border border-th-hub-border text-th-primary placeholder-th-muted/50 focus:outline-none focus:border-violet-500/50"
        />
      </div>

      {/* Content */}
      <div className="flex flex-col gap-1.5 border-t border-th-hub-border pt-2">
        <SectionLabel>Content</SectionLabel>
        <Slider
          label="Words min"
          value={filters.wordCountMin}
          min={0} max={2000} step={10}
          onChange={v => update('wordCountMin', v)}
          display={v => v === 0 ? 'off' : String(v)}
        />
        <Slider
          label="Words max"
          value={filters.wordCountMax >= 2000 ? 2000 : filters.wordCountMax}
          min={0} max={2000} step={10}
          onChange={v => update('wordCountMax', v >= 2000 ? Infinity : v)}
          infinity
        />
      </div>

      {/* Scope */}
      <div className="flex flex-col gap-1.5 border-t border-th-hub-border pt-2">
        <SectionLabel>Directory scope</SectionLabel>
        <input
          type="text"
          value={scopeInput}
          onChange={e => setScopeInput(e.target.value)}
          onBlur={applyScope}
          onKeyDown={e => { if (e.key === 'Enter') applyScope(); if (e.key === 'Escape') { setScopeInput(directoryScope || ''); (e.target as HTMLInputElement).blur(); } }}
          placeholder="LAPTOP//UI"
          className="w-full text-[11px] px-2 py-1.5 bg-transparent border border-th-hub-border text-th-primary placeholder-th-muted/50 focus:outline-none focus:border-violet-500/50 font-mono"
        />
      </div>

      {/* Clear */}
      {activeFilterCount > 0 && (
        <button
          onClick={onClear}
          className="text-[10px] text-th-muted hover:text-violet-400 transition-colors text-left pt-1 border-t border-th-hub-border"
        >
          Clear all filters
        </button>
      )}
    </div>
  );
};

export default GraphFilterPanel;
