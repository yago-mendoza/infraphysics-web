// Second Brain / Concept Wiki view component — theme-aware

import React, { useCallback, useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import { useHub } from '../contexts/SecondBrainHubContext';
import { useNavigationTrail } from '../hooks/useNavigationTrail';
import { WikiContent } from '../components/WikiContent';
import { NavigationTrail } from '../components/NavigationTrail';
import { NeighborhoodGraph, type Zone } from '../components/NeighborhoodGraph';
import { RelevanceLeaderboard, type FamilyItem } from '../components/RelevanceLeaderboard';
import { BridgeScoreBadge } from '../components/BridgeScoreBadge';

import { DriftDetector } from '../components/DriftDetector';
import { useGraphRelevance } from '../hooks/useGraphRelevance';
import type { SortMode, SearchMode, FilterState } from '../hooks/useSecondBrainHub';
import { SearchIcon } from '../components/icons';
import { InfoPopover, tipStrong, tipAccent, tipCode } from '../components/InfoPopover';
import { noteLabel, type FieldNoteMeta } from '../types';
import type { Connection } from '../lib/brainIndex';
import { ICON_REF_IN, ICON_REF_OUT } from '../lib/icons';
import { resolveWikiLinks } from '../lib/wikilinks';
import { WikiLinkPreview } from '../components/WikiLinkPreview';
import '../styles/article.css';
import '../styles/wiki-content.css';

/** Display-friendly address: `//` → `/` */
const displayAddress = (addr: string) => addr.replace(/\/\//g, ' / ');

const SORT_OPTIONS: { value: SortMode; label: string }[] = [
  { value: 'a-z', label: 'A\u2013Z' },
  { value: 'newest', label: 'newest' },
  { value: 'oldest', label: 'oldest' },
  { value: 'most-links', label: 'most links' },
  { value: 'fewest-links', label: 'fewest links' },
  { value: 'depth', label: 'depth' },
  { value: 'shuffle', label: 'shuffle' },
];

// --- Search Mode Chips ---
const SEARCH_MODES: { value: SearchMode; label: string }[] = [
  { value: 'name', label: 'name' },
  { value: 'content', label: 'content' },
  { value: 'backlinks', label: 'backlinks' },
];

// --- StepperInput (inline, moved from sidebar) ---
const StepperInput: React.FC<{
  value: number;
  displayValue?: string;
  onDecrement: () => void;
  onIncrement: () => void;
  min?: number;
  max?: number;
}> = ({ value, displayValue, onDecrement, onIncrement, min = -Infinity, max = Infinity }) => (
  <span className="inline-flex items-center border border-th-hub-border text-[10px] tabular-nums">
    <button onClick={onDecrement} disabled={value <= min} className="px-2 py-1 text-th-muted hover:text-th-secondary disabled:opacity-30 transition-colors">&minus;</button>
    <span className="px-1.5 py-1 text-th-primary min-w-[20px] text-center">{displayValue ?? value}</span>
    <button onClick={onIncrement} disabled={value >= max} className="px-2 py-1 text-th-muted hover:text-th-secondary disabled:opacity-30 transition-colors">+</button>
  </span>
);

// --- Chip (dismissible filter indicator) ---
const Chip: React.FC<{
  label: string;
  onDismiss: () => void;
  color?: 'violet' | 'amber';
}> = ({ label, onDismiss, color = 'violet' }) => {
  const cls = color === 'amber'
    ? 'bg-amber-400/20 text-amber-400 border-amber-400/30'
    : 'bg-violet-400/10 text-violet-400 border-violet-400/20';
  return (
    <span className={`text-[9px] px-1.5 py-0.5 border flex items-center gap-1 ${cls}`}>
      {label}
      <button onClick={onDismiss} className="hover:text-white">&times;</button>
    </span>
  );
};

// --- Activity Heatmap (GitHub-style) ---
const DAY_NAMES = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const ActivityHeatmap: React.FC<{
  allNotes: FieldNoteMeta[];
  dateFilter: string | null;
  onDateClick: (date: string | null) => void;
}> = ({ allNotes, dateFilter, onDateClick }) => {
  const [year, setYear] = useState(() => new Date().getFullYear());

  // Build date → count map
  const dateCounts = useMemo(() => {
    const map = new Map<string, number>();
    allNotes.forEach(n => {
      if (!n.date) return;
      const d = n.date.slice(0, 10);
      map.set(d, (map.get(d) || 0) + 1);
    });
    return map;
  }, [allNotes]);

  // Build weeks grid for the year
  const weeks = useMemo(() => {
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);
    // Pad to start on Sunday
    const startDay = startDate.getDay();
    const actualStart = new Date(startDate);
    actualStart.setDate(actualStart.getDate() - startDay);

    const result: { date: string; count: number; inYear: boolean }[][] = [];
    let current = new Date(actualStart);

    while (current <= endDate || current.getDay() !== 0) {
      const week: { date: string; count: number; inYear: boolean }[] = [];
      for (let d = 0; d < 7; d++) {
        const iso = current.toISOString().slice(0, 10);
        week.push({
          date: iso,
          count: dateCounts.get(iso) || 0,
          inYear: current.getFullYear() === year,
        });
        current.setDate(current.getDate() + 1);
      }
      result.push(week);
      if (current > endDate && current.getDay() === 0) break;
    }
    return result;
  }, [year, dateCounts]);

  // Max count for the currently viewed year (drives the color scale)
  const yearMax = useMemo(() => {
    let max = 0;
    for (const week of weeks) {
      for (const day of week) {
        if (day.inYear && day.count > max) max = day.count;
      }
    }
    return max;
  }, [weeks]);

  const cellColor = (count: number, inYear: boolean) => {
    if (!inYear || count === 0) return 'transparent';
    // Linear interpolation: 1 note = 0.15, yearMax notes = 0.7
    const t = yearMax > 1 ? (count - 1) / (yearMax - 1) : 1;
    const opacity = 0.15 + t * 0.55;
    return `rgba(167, 139, 250, ${opacity.toFixed(2)})`;
  };

  // Parse dateFilter into single or range for highlighting + click logic
  const parsed = useMemo(() => {
    if (!dateFilter) return null;
    if (dateFilter.includes('..')) {
      const [start, end] = dateFilter.split('..');
      return { type: 'range' as const, start, end };
    }
    return { type: 'single' as const, date: dateFilter };
  }, [dateFilter]);

  const isSelected = (d: string) => {
    if (!parsed) return false;
    if (parsed.type === 'single') return d === parsed.date;
    return d === parsed.start || d === parsed.end;
  };
  const isInRange = (d: string) => {
    if (!parsed || parsed.type !== 'range') return false;
    return d > parsed.start && d < parsed.end;
  };

  const handleCellClick = (clickedDate: string) => {
    if (!parsed) {
      // Nothing selected → single
      onDateClick(clickedDate);
    } else if (parsed.type === 'range') {
      // Range selected → always reset to single
      onDateClick(clickedDate);
    } else {
      // Single selected
      if (clickedDate === parsed.date) {
        onDateClick(null); // deselect
      } else if (clickedDate > parsed.date) {
        onDateClick(`${parsed.date}..${clickedDate}`); // range
      } else {
        onDateClick(clickedDate); // replace with earlier
      }
    }
  };

  const currentYear = new Date().getFullYear();

  return (
    <div className="relative">
      {/* Year selector */}
      <div className="flex items-center gap-2 mb-1.5">
        <button onClick={() => setYear(y => y - 1)} className="text-[10px] text-th-muted hover:text-th-secondary transition-colors">&lsaquo;</button>
        <span className="text-[10px] text-th-tertiary tabular-nums">{year}</span>
        <button onClick={() => setYear(y => Math.min(y + 1, currentYear))} disabled={year >= currentYear} className="text-[10px] text-th-muted hover:text-th-secondary disabled:opacity-30 transition-colors">&rsaquo;</button>
      </div>
      {/* Grid */}
      <div className="overflow-hidden pb-1">
        <div className="flex gap-[2px]" style={{ width: '100%' }}>
          {/* Day labels */}
          <div className="flex flex-col gap-[2px] mr-0.5 flex-shrink-0">
            {DAY_NAMES.map((name, i) => (
              <div key={i} className="text-[6px] text-th-muted leading-none flex items-center" style={{ width: 8, height: 8 }}>
                {i % 2 === 1 ? name : ''}
              </div>
            ))}
          </div>
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-[2px] flex-1 min-w-0">
              {week.map((day, di) => {
                const isEmpty = day.count === 0 && day.inYear;
                return (
                <div
                  key={di}
                  className={`cursor-pointer aspect-square ${isSelected(day.date) ? 'ring-1 ring-violet-400' : isInRange(day.date) ? 'ring-1 ring-violet-400/40' : ''}`}
                  style={{
                    height: 8,
                    backgroundColor: cellColor(day.count, day.inYear),
                    border: isEmpty ? '1px solid rgba(255, 255, 255, 0.06)' : 'none',
                    borderRadius: 1,
                    opacity: day.inYear ? 1 : 0,
                  }}
                  onClick={() => {
                    if (!day.inYear) return;
                    handleCellClick(day.date);
                  }}
                  title={day.inYear ? `${day.date}${day.count ? ` (${day.count})` : ''}` : undefined}
                />
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- Docked Toolbar ---
const DockedToolbar: React.FC<{
  query: string;
  setQuery: (q: string) => void;
  searchMode: SearchMode;
  setSearchMode: (m: SearchMode) => void;
  sortMode: SortMode;
  setSortMode: (m: SortMode) => void;
  filterState: FilterState;
  updateFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
  hasActiveFilters: boolean;
  resetFilters: () => void;
  directoryScope: string | null;
  setDirectoryScope: (s: string | null) => void;
  sortedCount: number;
  unvisitedOnly: boolean;
  setUnvisitedOnly: (v: boolean | ((prev: boolean) => boolean)) => void;
  hasVisited: boolean;
  isVisited: (id: string) => boolean;
  allNotes: FieldNoteMeta[];
  stats: { maxDepth: number };
  inputRef: React.RefObject<HTMLInputElement | null>;
}> = ({
  query, setQuery, searchMode, setSearchMode,
  sortMode, setSortMode,
  filterState, updateFilter, hasActiveFilters, resetFilters,
  directoryScope, setDirectoryScope,
  sortedCount, unvisitedOnly, setUnvisitedOnly, hasVisited,
  allNotes, stats, inputRef,
}) => {
  const { getIslands, loaded } = useGraphRelevance();
  const [filtersOpen, setFiltersOpen] = useState(true);

  // Auto-expand filters when any filter is active
  const isFiltersVisible = filtersOpen || hasActiveFilters;

  // Island options
  const islandOptions = useMemo(() => {
    if (!loaded) return [];
    const islands = getIslands();
    if (!islands) return [];
    return islands.components
      .filter(c => c.size > 1)
      .sort((a, b) => b.size - a.size);
  }, [getIslands, loaded]);

  return (
    <div className="mb-3 border border-th-hub-border rounded-sm" style={{ backgroundColor: 'var(--hub-sidebar-bg)' }}>
      {/* Row 1: Search + mode chips */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-th-hub-border min-w-0">
        <span className="text-th-muted flex-shrink-0"><SearchIcon /></span>
        <input
          ref={inputRef}
          type="text"
          placeholder={
            directoryScope ? `Search in ${directoryScope.replace(/\/\//g, ' / ')}...`
            : filterState.islandId != null ? `Search in island #${filterState.islandId}...`
            : 'Search...'
          }
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              e.preventDefault();
              setQuery('');
              (e.target as HTMLElement).blur();
            }
          }}
          autoComplete="off"
          spellCheck={false}
          className="flex-1 min-w-0 text-[11px] focus:outline-none placeholder-th-muted bg-transparent text-th-primary"
        />
        {query && (
          <button onClick={() => setQuery('')} className="text-th-muted hover:text-th-secondary text-[16px] md:text-[13px] leading-none flex-shrink-0 px-0.5">&times;</button>
        )}
        <span className="text-th-hub-border">|</span>
        <select
          value={searchMode}
          onChange={(e) => setSearchMode(e.target.value as SearchMode)}
          className="md:hidden border border-th-hub-border text-[10px] text-th-primary px-1 py-0.5 focus:outline-none focus:border-th-border-active"
          style={{ backgroundColor: 'var(--hub-sidebar-bg)', colorScheme: 'dark' }}
        >
          {SEARCH_MODES.map(mode => (
            <option key={mode.value} value={mode.value}>{mode.label}</option>
          ))}
        </select>
        {SEARCH_MODES.map(mode => (
          <button
            key={mode.value}
            onClick={() => setSearchMode(mode.value)}
            className={`hidden md:inline-block text-[9px] px-1 py-0 transition-colors flex-shrink-0 ${
              searchMode === mode.value ? 'text-violet-400' : 'text-th-muted hover:text-th-secondary'
            }`}
          >
            {mode.label}
          </button>
        ))}
        <InfoPopover
          size={12}
          title="Search modes"
          content={
            <div className="space-y-2">
              <p><strong className={tipStrong}>Name</strong> — matches against note names and addresses.</p>
              <p><strong className={tipStrong}>Content</strong> — full-text search across note bodies.</p>
              <p><strong className={tipStrong}>Backlinks</strong> — finds notes that <em>link to</em> a concept matching your query. If note A links to note B, then A is a "backlink" of B.</p>
              <p><span className="text-blue-400">Blue</span> = visited this session. <span className={tipAccent}>Purple</span> = not yet visited.</p>
            </div>
          }
        />
      </div>

      {/* Row 2: Filters (collapsible) */}
      <div className="border-b border-th-hub-border">
        <div
          role="button"
          onClick={() => setFiltersOpen(v => !v)}
          className="w-full flex items-center gap-1.5 px-3 py-1.5 text-[10px] bg-white/[0.03] border-b border-th-hub-border text-th-secondary hover:text-th-primary transition-colors cursor-pointer select-none"
        >
          <span>{isFiltersVisible ? '\u25BE' : '\u25B8'}</span>
          <span className="uppercase tracking-wider text-[9px] font-medium">filters</span>
          {hasActiveFilters && <span className="w-1.5 h-1.5 rounded-full bg-violet-400 flex-shrink-0" />}
          <span className="inline-flex items-center" onClick={(e) => e.stopPropagation()}>
            <InfoPopover
              size={12}
              title="Filter options"
              content={
                <div className="space-y-2">
                  <p><strong className={tipStrong}>Orphans</strong> — notes with zero links to or from any other note.</p>
                  <p><strong className={tipStrong}>Leaf</strong> — notes that have no children in the naming tree (they're at the end of a branch, e.g. <code className={tipCode}>chip//MCU//ARM</code> if ARM has no sub-notes).</p>
                  <p><strong className={tipStrong}>Bridges</strong> — critical connector notes. If you removed one, its island would split in two. (See the topology section in the sidebar.)</p>
                  <p><strong className={tipStrong}>Island</strong> — pick a specific connected group from the dropdown. Islands are clusters of notes linked to each other — see sidebar topology for the full map.</p>
                  <p><strong className={tipStrong}>Depth</strong> — filter by position in the naming tree (<code className={tipCode}>a</code>=1, <code className={tipCode}>a//b</code>=2, <code className={tipCode}>a//b//c</code>=3).</p>
                  <p><strong className={tipStrong}>Hubs &ge;</strong> — show only notes with at least N connections.</p>
                  <p><strong className={tipStrong}>Heatmap</strong> — click a day to filter by creation date. Click two days to select a range.</p>
                </div>
              }
            />
          </span>
          {hasActiveFilters && (
            <span
              className="ml-auto text-th-muted hover:text-violet-400"
              onClick={(e) => { e.stopPropagation(); resetFilters(); }}
            >
              reset
            </span>
          )}
        </div>
        {isFiltersVisible && (
          <div className="px-3 pb-2 pt-2">
            {/* All filters in one row: dropdowns + separator + toggle pills */}
            <div className="flex items-center gap-1.5 md:gap-3 flex-wrap">
              {islandOptions.length > 1 && (
                <div className="flex items-center gap-1 text-[10px] text-th-muted">
                  <span>island</span>
                  <select
                    value={filterState.islandId ?? ''}
                    onChange={(e) => updateFilter('islandId', e.target.value === '' ? null : Number(e.target.value))}
                    className="bg-th-surface border border-th-hub-border text-[10px] text-th-primary px-1 py-0.5 focus:outline-none focus:border-th-border-active"
                  >
                    <option value="">all</option>
                    {islandOptions.map(c => (
                      <option key={c.id} value={c.id}>#{c.id} ({c.size})</option>
                    ))}
                  </select>
                </div>
              )}
              <div className="flex items-center gap-1 text-[10px] text-th-muted">
                <span>depth</span>
                <StepperInput
                  value={filterState.depthMin}
                  onDecrement={() => updateFilter('depthMin', Math.max(1, filterState.depthMin - 1))}
                  onIncrement={() => updateFilter('depthMin', filterState.depthMin + 1)}
                  min={1}
                />
                <span>&ndash;</span>
                <StepperInput
                  value={filterState.depthMax}
                  displayValue={filterState.depthMax === Infinity ? '\u221e' : String(filterState.depthMax)}
                  onDecrement={() => updateFilter('depthMax', filterState.depthMax === Infinity ? stats.maxDepth : Math.max(1, filterState.depthMax - 1))}
                  onIncrement={() => {
                    if (filterState.depthMax === Infinity) return;
                    if (filterState.depthMax >= stats.maxDepth) updateFilter('depthMax', Infinity);
                    else updateFilter('depthMax', filterState.depthMax + 1);
                  }}
                />
              </div>
              <div className="flex items-center gap-1 text-[10px] text-th-muted">
                <span>hubs&ge;</span>
                <StepperInput
                  value={filterState.hubThreshold}
                  onDecrement={() => updateFilter('hubThreshold', Math.max(0, filterState.hubThreshold - 1))}
                  onIncrement={() => updateFilter('hubThreshold', filterState.hubThreshold + 1)}
                  min={0}
                />
              </div>
              <span className="text-th-hub-border select-none">|</span>
              <button
                onClick={() => updateFilter('orphans', !filterState.orphans)}
                className={`text-[10px] px-1 py-0.5 transition-colors ${
                  filterState.orphans
                    ? 'bg-violet-400/20 text-violet-400 border border-violet-400/30'
                    : 'text-th-muted border border-th-hub-border hover:text-th-secondary hover:border-th-border-hover'
                }`}
              >orphans</button>
              <button
                onClick={() => updateFilter('leaf', !filterState.leaf)}
                className={`text-[10px] px-1 py-0.5 transition-colors ${
                  filterState.leaf
                    ? 'bg-violet-400/20 text-violet-400 border border-violet-400/30'
                    : 'text-th-muted border border-th-hub-border hover:text-th-secondary hover:border-th-border-hover'
                }`}
              >leaf</button>
              <button
                onClick={() => updateFilter('bridgesOnly', !filterState.bridgesOnly)}
                className={`text-[10px] px-1 py-0.5 transition-colors ${
                  filterState.bridgesOnly
                    ? 'bg-amber-400/20 text-amber-400 border border-amber-400/30'
                    : 'text-th-muted border border-th-hub-border hover:text-th-secondary hover:border-th-border-hover'
                }`}
              >bridges</button>
            </div>
            {/* Heatmap */}
            <div className="mt-2">
              <ActivityHeatmap
                allNotes={allNotes}
                dateFilter={filterState.dateFilter}
                onDateClick={(d) => updateFilter('dateFilter', d)}
              />
            </div>
          </div>
        )}
      </div>

      {/* Row 3: Sort + unvisited + count + active chips */}
      <div className="flex items-center gap-1.5 px-3 py-1.5 flex-wrap">
        {/* Sort: compact dropdown on mobile, inline buttons on desktop */}
        <select
          value={sortMode}
          onChange={(e) => setSortMode(e.target.value as SortMode)}
          className="md:hidden border border-th-hub-border text-[10px] text-th-primary px-1 py-0.5 focus:outline-none focus:border-th-border-active"
          style={{ backgroundColor: 'var(--hub-sidebar-bg)', colorScheme: 'dark' }}
        >
          {SORT_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        {SORT_OPTIONS.map(opt => (
          <button
            key={opt.value}
            onClick={() => setSortMode(opt.value)}
            className={`hidden md:inline-block text-[10px] px-1.5 py-0.5 rounded-sm transition-colors ${
              sortMode === opt.value
                ? 'text-violet-400 bg-violet-400/10'
                : 'text-th-muted hover:text-th-secondary'
            }`}
          >
            {opt.label}
          </button>
        ))}
        {hasVisited && (
          <>
            <span className="text-th-hub-border">|</span>
            <button
              onClick={() => setUnvisitedOnly((v: boolean) => !v)}
              className={`text-[10px] px-1.5 py-0.5 rounded-sm transition-colors ${
                unvisitedOnly ? 'text-blue-400' : 'text-th-muted hover:text-blue-400'
              }`}
            >
              unvisited
            </button>
          </>
        )}

        {/* Count + info — pushed to the right */}
        <span className="flex items-center gap-1.5 ml-auto">
          <span className="text-[9px] text-th-muted tabular-nums">{sortedCount} {hasActiveFilters || query ? 'results' : 'notes'}</span>
          <InfoPopover
            size={12}
            title="Sorting & shortcuts"
            tabs={[
              {
                label: 'sorting',
                content: (
                  <div className="space-y-2">
                    <p><strong className={tipStrong}>A–Z</strong> — alphabetical by name.</p>
                    <p><strong className={tipStrong}>Newest / oldest</strong> — by creation date.</p>
                    <p><strong className={tipStrong}>Most / fewest links</strong> — by total connection count (outgoing + incoming).</p>
                    <p><strong className={tipStrong}>Depth</strong> — by address hierarchy depth (how deep the note sits in the naming tree).</p>
                    <p><strong className={tipStrong}>Shuffle</strong> — random order. Click again to reshuffle.</p>
                    <p><strong className={tipStrong}>Unvisited</strong> — hide cards you've already opened this session.</p>
                  </div>
                ),
              },
              {
                label: 'keyboard',
                content: (
                  <div className="space-y-2">
                    <p className="text-th-muted italic">These shortcuts require a physical keyboard.</p>
                    <p><strong className={tipStrong}>Arrow keys</strong> — navigate between cards in the grid.</p>
                    <p><strong className={tipStrong}>Enter</strong> — open the selected card.</p>
                    <p><strong className={tipStrong}>Escape</strong> — clear the search query and deselect.</p>
                    <p><strong className={tipStrong}>Any letter key</strong> — starts typing in the search bar instantly.</p>
                  </div>
                ),
              },
            ]}
          />
        </span>

        {/* Active chips */}
        <div className="flex items-center gap-1 flex-wrap">
          {directoryScope && (
            <Chip label={`scope: ${directoryScope.replace(/\/\//g, ' / ')}`} onDismiss={() => setDirectoryScope(null)} />
          )}
          {filterState.islandId != null && (
            <Chip label={`island #${filterState.islandId}`} onDismiss={() => updateFilter('islandId', null)} />
          )}
          {filterState.dateFilter && (
            <Chip label={filterState.dateFilter.replace('..', ' \u2192 ')} onDismiss={() => updateFilter('dateFilter', null)} />
          )}
          {filterState.orphans && <Chip label="orphans" onDismiss={() => updateFilter('orphans', false)} />}
          {filterState.leaf && <Chip label="leaf" onDismiss={() => updateFilter('leaf', false)} />}
          {filterState.bridgesOnly && <Chip label="bridges" onDismiss={() => updateFilter('bridgesOnly', false)} color="amber" />}
          {filterState.depthMin > 1 && <Chip label={`depth \u2265 ${filterState.depthMin}`} onDismiss={() => updateFilter('depthMin', 1)} />}
          {filterState.depthMax !== Infinity && <Chip label={`depth \u2264 ${filterState.depthMax}`} onDismiss={() => updateFilter('depthMax', Infinity)} />}
          {filterState.hubThreshold > 0 && <Chip label={`hubs \u2265 ${filterState.hubThreshold}`} onDismiss={() => updateFilter('hubThreshold', 0)} />}
        </div>
      </div>
    </div>
  );
};

export const SecondBrainView: React.FC = () => {
  const hub = useHub();

  const {
    sortedResults,
    activePost,
    backlinks,
    connections,
    mentions,
    neighborhood,
    outgoingRefCount,
    homonyms,
    resolvedHtml,
    contentReadyId,
    indexLoading,
    noteById,
    query,
    setQuery,
    searchActive,
    clearSearch,
    searchMode,
    setSearchMode,
    directoryScope,
    setDirectoryScope,
    filterState,
    setFilterState,
    hasActiveFilters,
    resetFilters,
    sortMode,
    setSortMode,
    directoryNavRef,
    isVisited,
    backlinksMap,
    allFieldNotes,
    stats,
  } = hub;

  const navigate = useNavigate();
  const { getRelevance, getDrift, getPercentile, getNoteTopology } = useGraphRelevance();
  const { trail, scheduleReset, scheduleExtend, truncateTrail, clearTrail, isOverflowing } =
    useNavigationTrail({ activePost, directoryNavRef });

  const toolbarInputRef = useRef<HTMLInputElement>(null);

  // Auto-focus toolbar input when search becomes active (e.g. typed from detail view)
  useEffect(() => {
    if (searchActive && toolbarInputRef.current) {
      toolbarInputRef.current.focus();
    }
  }, [searchActive]);


  const updateFilter = useCallback(<K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setFilterState(prev => ({ ...prev, [key]: value }));
  }, [setFilterState]);

  // Type-to-search: any printable key focuses toolbar input
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (e.ctrlKey || e.metaKey || e.altKey || e.shiftKey) return;

      if (e.key.length === 1) {
        e.preventDefault();
        // Append character to query — this also flips detail→grid when searchActive becomes true
        setQuery(query + e.key);
        // Focus input if toolbar is already rendered (grid view)
        toolbarInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [query, setQuery]);

  // Wiki-link click handler — extend trail with the clicked concept
  const handleWikiLinkClick = useCallback((conceptId: string) => {
    const concept = noteById.get(conceptId);
    if (concept) scheduleExtend(concept);
  }, [scheduleExtend]);

  // Grid card click — reset trail to single item.
  const handleGridCardClick = useCallback((post: FieldNoteMeta) => {
    scheduleReset(post);
  }, [scheduleReset]);

  // Clear search AFTER activePost changes (avoids 1-frame flicker of old note)
  const prevActiveIdRef = useRef(activePost?.id);
  useEffect(() => {
    if (activePost && activePost.id !== prevActiveIdRef.current && searchActive) {
      clearSearch();
    }
    prevActiveIdRef.current = activePost?.id;
  }, [activePost, searchActive, clearSearch]);

  // Connection / mention click — extend trail
  const handleConnectionClick = useCallback((post: FieldNoteMeta) => {
    scheduleExtend(post);
  }, [scheduleExtend]);

  // Delegated click handler for wiki-ref links inside dangerouslySetInnerHTML regions
  const handleInlineWikiClick = useCallback((e: React.MouseEvent) => {
    const link = (e.target as HTMLElement).closest('a.wiki-ref-resolved') as HTMLAnchorElement | null;
    if (!link) return;
    e.preventDefault();
    const href = link.getAttribute('href');
    if (!href) return;
    const match = href.match(/^\/lab\/second-brain\/(.+)$/);
    if (match) handleWikiLinkClick(match[1]);
    navigate(href);
  }, [handleWikiLinkClick, navigate]);

  // When search is active, force list view even if we're on a detail URL
  const showDetail = activePost && !searchActive;

  // Content ready = content loaded for the currently displayed note
  const contentReady = activePost?.id === contentReadyId;

  // Mention hover preview
  const [mentionPreview, setMentionPreview] = useState<{
    visible: boolean; title: string; address: string; description: string; x: number; y: number;
  }>({ visible: false, title: '', address: '', description: '', x: 0, y: 0 });
  const mentionHideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showMentionPreview = useCallback((m: FieldNoteMeta, e: React.MouseEvent) => {
    if (mentionHideTimer.current) { clearTimeout(mentionHideTimer.current); mentionHideTimer.current = null; }
    setMentionPreview({
      visible: true,
      title: noteLabel(m),
      address: m.address || '',
      description: m.description || '',
      x: e.clientX,
      y: e.clientY,
    });
  }, []);

  const hideMentionPreview = useCallback(() => {
    mentionHideTimer.current = setTimeout(() => {
      setMentionPreview(p => ({ ...p, visible: false }));
      mentionHideTimer.current = null;
    }, 80);
  }, []);

  // "Unvisited only" filter for grid view
  const [unvisitedOnly, setUnvisitedOnly] = useState(false);

  // Mobile "back to top" button — visible when scrolled past threshold
  const [showScrollTop, setShowScrollTop] = useState(false);
  useEffect(() => {
    const handler = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  // Right column: zone filtering toggle (graph always visible)
  const [zoneFilter, setZoneFilter] = useState(true);

  // Right-column zone + detail navigation
  const [activeZone, setActiveZone] = useState<Zone>(null);
  const [focusedDetailIdx, setFocusedDetailIdx] = useState(0);
  const [showDetailFocus, setShowDetailFocus] = useState(false);

  // Build family items for the unified list, filtered by active zone when graph is visible
  const familyItems = useMemo<FamilyItem[]>(() => {
    const items: FamilyItem[] = [];
    if (neighborhood.parent) items.push({ note: neighborhood.parent, zone: 'parent' });
    neighborhood.siblings.forEach(s => items.push({ note: s, zone: 'siblings' }));
    neighborhood.children.forEach(c => items.push({ note: c, zone: 'children' }));
    if (zoneFilter && activeZone) {
      return items.filter(i => i.zone === activeZone);
    }
    return items;
  }, [neighborhood, zoneFilter, activeZone]);

  // Set default zone when note changes — persist previous zone if still valid
  useEffect(() => {
    setActiveZone(prev => {
      if (prev === 'parent' && neighborhood.parent) return 'parent';
      if (prev === 'siblings' && neighborhood.siblings.length > 0) return 'siblings';
      if (prev === 'children' && neighborhood.children.length > 0) return 'children';
      if (neighborhood.siblings.length > 0) return 'siblings';
      if (neighborhood.children.length > 0) return 'children';
      if (neighborhood.parent) return 'parent';
      return null;
    });
    setFocusedDetailIdx(0);
  }, [activePost?.id, neighborhood.siblings.length, neighborhood.children.length, neighborhood.parent]);

  // Reset focused index when zone changes
  useEffect(() => {
    setFocusedDetailIdx(0);
  }, [activeZone]);

  // --- Infinite scroll ---
  const BATCH_SIZE = 50;
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Reset visible count when results change
  useEffect(() => {
    setVisibleCount(BATCH_SIZE);
  }, [sortedResults]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisibleCount(prev => Math.min(prev + BATCH_SIZE, sortedResults.length));
        }
      },
      { rootMargin: '200px' }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [sortedResults.length]);

  // Exclude the currently-open note from search results + optional unvisited filter
  const visibleResults = useMemo(() => {
    let results = searchActive && activePost
      ? sortedResults.slice(0, visibleCount).filter(n => n.id !== activePost.id)
      : sortedResults.slice(0, visibleCount);
    if (unvisitedOnly) results = results.filter(n => !isVisited(n.id));
    return results;
  }, [sortedResults, visibleCount, searchActive, activePost, unvisitedOnly, isVisited]);

  // --- Homonyms: other parents that share the same leaf name ---
  const homonymParents = useMemo(() => {
    if (!activePost || homonyms.length < 2) return [];
    return homonyms
      .filter(h => h.id !== activePost.id)
      .map(h => {
        const parts = h.addressParts || [h.title];
        if (parts.length < 2) return null;
        const parentAddr = parts.slice(0, -1).join('//');
        const parentNote = [...noteById.values()].find(n => n.address === parentAddr) || null;
        return parentNote ? { parent: parentNote, homonym: h } : null;
      })
      .filter((x): x is { parent: FieldNoteMeta; homonym: FieldNoteMeta } => x !== null);
  }, [activePost, homonyms, noteById]);

  const homonymLeaf = useMemo(() => {
    if (!activePost || homonyms.length < 2) return '';
    const parts = activePost.addressParts || [activePost.title];
    return parts[parts.length - 1];
  }, [activePost, homonyms]);

  const [homonymIdx, setHomonymIdx] = useState(0);

  // Reset homonym index when note changes
  useEffect(() => { setHomonymIdx(0); }, [activePost?.id]);

  const cycleHomonym = useCallback((direction: 'prev' | 'next') => {
    if (homonymParents.length === 0) return;
    const next = direction === 'prev'
      ? (homonymIdx - 1 + homonymParents.length) % homonymParents.length
      : (homonymIdx + 1) % homonymParents.length;
    const target = homonymParents[next].homonym;
    setHomonymIdx(next);
    scheduleExtend(target);
    navigate(`/lab/second-brain/${target.id}`);
  }, [homonymParents, homonymIdx, scheduleExtend, navigate]);

  // Available zones in left→right order (matches SVG layout)
  const availableZones = useMemo<Zone[]>(() => {
    const z: Zone[] = [];
    if (neighborhood.parent) z.push('parent');
    if (neighborhood.siblings.length > 0) z.push('siblings');
    if (neighborhood.children.length > 0) z.push('children');
    return z;
  }, [neighborhood.parent, neighborhood.siblings.length, neighborhood.children.length]);

  // --- Detail-view items for keyboard nav ---
  const detailItems = useMemo(() => {
    if (!showDetail || !activeZone) return [];
    if (activeZone === 'parent') {
      const items: FieldNoteMeta[] = [];
      if (neighborhood.parent) items.push(neighborhood.parent);
      homonymParents.forEach(gp => {
        if (!items.some(i => i.id === gp.parent.id)) items.push(gp.parent);
      });
      return items;
    }
    if (activeZone === 'siblings') return neighborhood.siblings;
    if (activeZone === 'children') return neighborhood.children;
    return [];
  }, [showDetail, activeZone, neighborhood, homonymParents]);

  const [focusedIdx, setFocusedIdx] = useState(0);
  const gridRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Map<number, HTMLAnchorElement>>(new Map());

  // Auto-select first result when results change
  useEffect(() => {
    setFocusedIdx(0);
  }, [sortedResults]);

  // Detect column count from CSS grid
  const getColCount = useCallback(() => {
    const grid = gridRef.current;
    if (!grid || grid.children.length === 0) return 1;
    const firstTop = (grid.children[0] as HTMLElement).offsetTop;
    let cols = 1;
    for (let i = 1; i < grid.children.length; i++) {
      if ((grid.children[i] as HTMLElement).offsetTop === firstTop) cols++;
      else break;
    }
    return cols;
  }, []);

  // Throttle ref for arrow key repeat
  const lastArrowTime = useRef(0);
  const ARROW_THROTTLE = 80; // ms between arrow key repeats

  // Check if any notes have been visited (for showing unvisited toggle)
  const hasVisited = useMemo(() => sortedResults.some(n => isVisited(n.id)), [sortedResults, isVisited]);

  useEffect(() => {
    if (showDetail) return; // Only active in list view

    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      const isInput = tag === 'INPUT' || tag === 'TEXTAREA';

      // Any arrow key or Enter from input → transfer focus to grid
      const isArrow = e.key.startsWith('Arrow');
      if (isInput && (isArrow || e.key === 'Enter')) {
        e.preventDefault();
        (e.target as HTMLElement).blur();
        if (e.key === 'Enter') {
          const total = visibleResults.length;
          const idx = focusedIdx >= 0 ? focusedIdx : 0;
          if (idx < total) {
            const note = visibleResults[idx];
            handleGridCardClick(note);
            navigate(`/lab/second-brain/${note.id}`);
          }
          return;
        }
      } else if (isInput) {
        return;
      }

      const total = visibleResults.length;
      if (total === 0) return;

      // Throttle arrow key repeats
      if (isArrow && e.repeat) {
        const now = Date.now();
        if (now - lastArrowTime.current < ARROW_THROTTLE) return;
        lastArrowTime.current = now;
      }

      const cols = getColCount();
      let next = focusedIdx;

      switch (e.key) {
        case 'ArrowRight':
          e.preventDefault();
          next = Math.min(focusedIdx + 1, total - 1);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          next = Math.max(focusedIdx - 1, 0);
          break;
        case 'ArrowDown':
          e.preventDefault();
          if (focusedIdx + cols < total) next = focusedIdx + cols;
          break;
        case 'ArrowUp':
          e.preventDefault();
          if (focusedIdx - cols >= 0) next = focusedIdx - cols;
          break;
        case 'Enter':
          if (focusedIdx >= 0 && focusedIdx < total) {
            e.preventDefault();
            const note = visibleResults[focusedIdx];
            handleGridCardClick(note);
            navigate(`/lab/second-brain/${note.id}`);
          }
          return;
        case 'Escape':
          if (searchActive && activePost) {
            clearSearch();
          }
          setFocusedIdx(-1);
          return;
        default:
          return;
      }

      setFocusedIdx(next);
      const card = cardRefs.current.get(next);
      if (card) card.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [showDetail, focusedIdx, visibleResults, getColCount, handleGridCardClick, navigate, searchActive, activePost, clearSearch]);

  // --- Detail-view arrow-key navigation (right column boxes) ---
  useEffect(() => {
    if (!showDetail) return;

    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;

      if ((e.key === 'ArrowLeft' || e.key === 'ArrowRight') && availableZones.length > 1) {
        e.preventDefault();
        const curIdx = activeZone ? availableZones.indexOf(activeZone) : -1;
        const nextIdx = e.key === 'ArrowLeft'
          ? (curIdx <= 0 ? availableZones.length - 1 : curIdx - 1)
          : (curIdx >= availableZones.length - 1 ? 0 : curIdx + 1);
        setActiveZone(availableZones[nextIdx]);
        return;
      }

      const total = detailItems.length;
      if (total === 0) return;

      const isArrow = e.key === 'ArrowUp' || e.key === 'ArrowDown';
      if (isArrow && e.repeat) {
        const now = Date.now();
        if (now - lastArrowTime.current < ARROW_THROTTLE) return;
        lastArrowTime.current = now;
      }

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setShowDetailFocus(true);
          setFocusedDetailIdx(prev => Math.min(prev + 1, total - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setShowDetailFocus(true);
          setFocusedDetailIdx(prev => Math.max(prev - 1, 0));
          break;
        case 'Enter':
          if (focusedDetailIdx >= 0 && focusedDetailIdx < total) {
            e.preventDefault();
            const item = detailItems[focusedDetailIdx];
            handleConnectionClick(item);
            navigate(`/lab/second-brain/${item.id}`);
          }
          break;
        default:
          return;
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [showDetail, detailItems, focusedDetailIdx, handleConnectionClick, navigate, availableZones, activeZone]);

  // Hide detail focus highlight on mouse click (re-shown on next arrow key)
  useEffect(() => {
    if (!showDetail) return;
    const hide = () => setShowDetailFocus(false);
    window.addEventListener('mousedown', hide);
    return () => window.removeEventListener('mousedown', hide);
  }, [showDetail]);

  if (indexLoading) {
    return <div className="animate-fade-in py-12 text-center text-xs text-th-tertiary">Loading index...</div>;
  }

  return (
    <div className="animate-fade-in">
      {/* Toolbar — always mounted so type-to-search input exists in DOM.
          Hidden in detail view to avoid layout shift, but input stays focusable. */}
      <div style={showDetail ? { position: 'absolute', width: 1, height: 1, overflow: 'hidden', opacity: 0, pointerEvents: 'none' } : undefined}>
        <DockedToolbar
          query={query}
          setQuery={setQuery}
          searchMode={searchMode}
          setSearchMode={setSearchMode}
          sortMode={sortMode}
          setSortMode={setSortMode}
          filterState={filterState}
          updateFilter={updateFilter}
          hasActiveFilters={hasActiveFilters}
          resetFilters={resetFilters}
          directoryScope={directoryScope}
          setDirectoryScope={setDirectoryScope}
          sortedCount={sortedResults.length}
          unvisitedOnly={unvisitedOnly}
          setUnvisitedOnly={setUnvisitedOnly}
          hasVisited={hasVisited}
          isVisited={isVisited}
          allNotes={allFieldNotes}
          stats={stats}
          inputRef={toolbarInputRef}
        />
      </div>

      {/* Main Content */}
      {showDetail ? (
        /* --- Concept Detail View --- */
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-0 lg:gap-12">
          {/* Left: Content + Connections + Mentions — fades during note transitions */}
          <div
            className="lg:col-span-3"
            style={{
              opacity: contentReady ? 1 : 0,
              transition: contentReady ? 'opacity 200ms ease-in' : 'none',
            }}
          >
            {/* Navigation Trail */}
            <div className="flex items-center gap-2 mb-3">
              <div className="flex-1 min-w-0">
                <NavigationTrail
                  trail={trail}
                  onItemClick={(index) => truncateTrail(index)}
                  onAllConceptsClick={clearTrail}
                  isOverflowing={isOverflowing}
                />
              </div>
              <InfoPopover
                size={12}
                title="Navigation & page guide"
                tabs={[
                  {
                    label: 'navigation',
                    content: (
                      <div className="space-y-2">
                        <p>The <strong className={tipStrong}>breadcrumb trail</strong> tracks your navigation path through concepts.</p>
                        <p><strong className={tipStrong}>Click any crumb</strong> to jump back to that point in your trail.</p>
                        <p><strong className={tipStrong}>"all concepts"</strong> — the first crumb always returns you to the grid.</p>
                        <p><strong className={tipStrong}>Clicking a body link</strong> extends the trail — you can trace how you got somewhere.</p>
                        <p><strong className={tipStrong}>Clicking a grid card</strong> resets the trail (starts a new navigation path).</p>
                        <p>When the trail gets long, it <strong className={tipStrong}>collapses</strong> — older crumbs are hidden but still accessible.</p>
                      </div>
                    ),
                  },
                  {
                    label: 'page layout',
                    content: (
                      <div className="space-y-2">
                        <p className={`text-xs font-semibold ${tipAccent} mb-1`}>Mentioned ↑ <span className="font-normal text-th-muted">(incoming links)</span></p>
                        <p>Colored names below the title — these are <em>other notes that link here</em>. Click to visit them.</p>
                        <div className="border-t border-th-hub-border my-2" />
                        <p className={`text-xs font-semibold ${tipAccent} mb-1`}>Links ↓ <span className="font-normal text-th-muted">(outgoing links)</span></p>
                        <p>Highlighted words inside the note body are links to other concepts. Click to follow them.</p>
                        <div className="border-t border-th-hub-border my-2" />
                        <p><strong className={tipStrong}>Address path</strong> — the line below the title (e.g. <code className={tipCode}>chip / MCU / ARM</code>) shows where this note sits in the naming tree. Click an ancestor to go up.</p>
                        <p><strong className={tipStrong}>Metadata line</strong> — <code className={tipCode}>links ↓ N</code> = how many notes this one links to. <code className={tipCode}>mentioned ↑ N</code> = how many notes link here.</p>
                      </div>
                    ),
                  },
                ]}
              />
            </div>

            {/* Topology badges + Concept Title */}
            {(() => {
              const topo = getNoteTopology(activePost!.id);
              const badges = (
                <>
                  {topo.componentId != null && !topo.isOrphan && (
                    <button
                      onClick={() => {
                        window.dispatchEvent(new CustomEvent('topology-focus', { detail: { componentId: topo.componentId } }));
                      }}
                      className="inline-flex items-center text-[10px] font-normal px-1.5 py-0.5 border border-violet-400/30 text-violet-400/80 hover:text-violet-400 hover:border-violet-400/50 transition-colors rounded-sm"
                      title={`Component #${topo.componentId} (${topo.componentSize} notes)`}
                    >
                      island #{topo.componentId}
                    </button>
                  )}
                  {topo.isBridge && (
                    <span className="inline-flex items-center text-[10px] font-normal px-1.5 py-0.5 border border-amber-400/30 text-amber-400/80 rounded-sm">
                      ⚡ bridge {Math.round((topo.bridgeCriticality ?? 0) * 100)}%
                    </span>
                  )}
                  {topo.isOrphan && (
                    <span className="text-[10px] font-normal text-th-muted">(orphan)</span>
                  )}
                </>
              );
              const hasBadges = topo.componentId != null || topo.isBridge || topo.isOrphan;
              return (
                <>
                  {/* Mobile: badges above title, left-aligned */}
                  {hasBadges && (
                    <div className="flex items-center gap-1.5 mb-1 lg:hidden">
                      {badges}
                    </div>
                  )}
                  <h2 className="text-2xl font-bold mb-1 text-th-heading">
                    {noteLabel(activePost!)}
                    <BridgeScoreBadge percentile={getPercentile(activePost!.id)} />
                    {/* Desktop: badges inline after title */}
                    <span className="hidden lg:inline ml-2 align-middle">
                      {badges}
                    </span>
                  </h2>
                </>
              );
            })()}
            <div className="text-[11px] text-th-tertiary mb-2">
              {activePost!.addressParts && activePost!.addressParts.length > 1
                ? activePost!.addressParts.map((part, i) => {
                    const pathUpTo = activePost!.addressParts!.slice(0, i + 1).join('//');
                    const ancestor = [...noteById.values()].find(n => n.address === pathUpTo);
                    const isLast = i === activePost!.addressParts!.length - 1;
                    return (
                      <React.Fragment key={i}>
                        {i > 0 && <span className="mx-0.5 text-th-muted">/</span>}
                        {isLast
                          ? <span>{part}</span>
                          : ancestor
                            ? <Link to={`/lab/second-brain/${ancestor.id}`} className="hover:text-violet-400 transition-colors" onClick={() => {
                                scheduleReset(ancestor);
                              }}>{part}</Link>
                            : <span>{part}</span>
                        }
                      </React.Fragment>
                    );
                  })
                : <span>Root node</span>}
            </div>

            {/* ─── Mentioned in (below address) ─── */}
            {mentions.length > 0 && (
              <div className="mb-2 flex flex-wrap items-baseline gap-x-2 gap-y-1 font-sans">
                {mentions.map((m) => (
                  <Link
                    key={m.id}
                    to={`/lab/second-brain/${m.id}`}
                    onClick={() => handleConnectionClick(m)}
                    onMouseEnter={(e) => showMentionPreview(m, e)}
                    onMouseLeave={hideMentionPreview}
                    className={`text-sm font-medium transition-colors no-underline ${isVisited(m.id) ? 'text-blue-400 hover:text-blue-300' : 'text-violet-400 hover:text-violet-300'}`}
                  >
                    {noteLabel(m)}<svg className="inline w-[0.85em] h-[0.85em] ml-0.5 opacity-50" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" style={{ verticalAlign: '-0.1em' }}><path fillRule="evenodd" clipRule="evenodd" d={ICON_REF_IN}/></svg>
                  </Link>
                ))}
                <WikiLinkPreview {...mentionPreview} variant="blue" />
              </div>
            )}

            {/* Metadata line */}
            <div className="text-xs text-th-tertiary mb-2 flex items-center gap-2">
              <span>links {'\u2193'} {outgoingRefCount}</span>
              <span>&middot;</span>
              <span>mentioned {'\u2191'} {mentions.length}</span>
            </div>

            {/* Content */}
            <div className="article-page-wrapper article-wiki">
              <WikiContent
                html={resolvedHtml}
                className="article-content"
                onWikiLinkClick={handleWikiLinkClick}
                isVisited={isVisited}
              />
            </div>

            {/* ─── Interactions + Drift Detector ─── */}
            {(() => {
              const driftEntries = getDrift(activePost!.id);
              const hasDrift = driftEntries.length > 0;
              if (connections.length === 0 && !hasDrift) return null;
              return (
                <div>
                  <hr className="border-t border-th-border my-6" />
                  {connections.length > 0 && (
                    <div>
                      <h3 className="text-[11px] text-th-tertiary uppercase tracking-wider mb-3 flex items-center gap-1.5">
                        Interactions
                        <InfoPopover
                          size={12}
                          title="About interactions"
                          content={
                            <div className="space-y-2">
                              <p>Unlike regular body links, <strong className={tipStrong}>interactions</strong> are curated, annotated relationships — each one describes <em>how</em> two concepts relate (e.g. "contrast", "depends on", "example of").</p>
                              <p>They are <strong className={tipStrong}>bilateral</strong> — if note A interacts with B, it appears on both sides automatically.</p>
                              <p>Click the name to navigate to the related concept.</p>
                            </div>
                          }
                        />
                      </h3>
                      <div className="space-y-3">
                        {connections.map((conn: Connection) => {
                          const v = isVisited(conn.note.id);
                          return (
                            <div key={conn.note.id}>
                              <Link
                                to={`/lab/second-brain/${conn.note.id}`}
                                onClick={() => handleConnectionClick(conn.note)}
                                className={`inline transition-colors no-underline border-b border-solid cursor-pointer ${v ? 'text-blue-400/70 hover:text-blue-400 border-blue-400/40 hover:border-blue-400' : 'text-violet-400/70 hover:text-violet-400 border-violet-400/40 hover:border-violet-400'}`}
                              >
                                <span className="text-sm">{noteLabel(conn.note)}</span><svg className="inline w-[0.85em] h-[0.85em] ml-0.5 opacity-80" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" style={{ verticalAlign: '-0.1em' }}><path fillRule="evenodd" clipRule="evenodd" d={ICON_REF_OUT}/></svg>
                              </Link>
                              {conn.note.address && (
                                <span className="text-xs text-th-muted ml-2">{displayAddress(conn.note.address)}</span>
                              )}
                              {(conn.annotation || conn.reverseAnnotation) && (
                                <div className="text-xs text-th-tertiary mt-0.5 italic font-sans" onClick={handleInlineWikiClick}>
                                  <span dangerouslySetInnerHTML={{ __html: resolveWikiLinks(conn.annotation || conn.reverseAnnotation || '', [], noteById).html }} />
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  {connections.length > 0 && hasDrift && (
                    <hr className="border-t border-th-border my-6" />
                  )}
                  <DriftDetector
                    entries={driftEntries}
                    noteById={noteById}
                    onNoteClick={handleConnectionClick}
                    isVisited={isVisited}
                  />
                </div>
              );
            })()}
          </div>

          {/* Right: Context panel */}
          <div
            className="lg:col-span-2 lg:sticky lg:top-12 lg:self-start"
            style={{
              opacity: contentReady ? 1 : 0,
              transition: contentReady ? 'opacity 200ms ease-in' : 'none',
            }}
          >
            <hr className="lg:hidden border-t border-th-border my-6" />
            <div className="relative">
              <NeighborhoodGraph
                neighborhood={neighborhood}
                currentNote={activePost!}
                onNoteClick={handleConnectionClick}
                isVisited={isVisited}
                activeZone={zoneFilter ? activeZone : null}
                onActiveZoneChange={(zone) => { setZoneFilter(true); setActiveZone(zone); }}
                homonymParents={homonymParents}
                onHomonymNavigate={(homonym) => {
                  scheduleExtend(homonym);
                  navigate(`/lab/second-brain/${homonym.id}`);
                }}
              />
              <span className="absolute top-2 right-2">
                <InfoPopover
                  size={12}
                  title="Neighborhood graph"
                  content={
                    <div className="space-y-2">
                      <p>This graph shows where the current note sits in the <strong className={tipStrong}>naming hierarchy</strong> (its address path), not its link connections.</p>
                      <p>Three zones: <strong className={tipStrong}>parent</strong> (above), <strong className={tipStrong}>siblings</strong> (same level), <strong className={tipStrong}>children</strong> (below). Tap a zone to filter the leaderboard below.</p>
                      <p><strong className={tipStrong}>Tap a zone</strong> to select it. On desktop, arrow keys also switch zones and navigate within.</p>
                      <p><strong className={tipStrong}>White bar</strong> = current note. <span className="text-blue-400">Blue</span> = visited. <span className={tipAccent}>Purple</span> = not yet visited.</p>
                      <p><strong className={tipStrong}>Ghost dots</strong> — if the same name exists under multiple parents, dots mark the alternatives.</p>
                    </div>
                  }
                />
              </span>
            </div>
            <label className="flex items-center gap-1.5 mt-3 mb-1 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={zoneFilter}
                onChange={() => setZoneFilter(v => !v)}
                className="accent-violet-400 w-3 h-3"
              />
              <span className="text-[10px] text-th-muted">filter by zone</span>
            </label>
            <div className="mt-2">
            <RelevanceLeaderboard
              mode="family"
              familyItems={familyItems}
              noteById={noteById}
              onNoteClick={handleConnectionClick}
              isVisited={isVisited}
              getPercentile={getPercentile}
            />
            </div>
          </div>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="lg:hidden w-full mt-8 mb-4 py-2 text-[10px] uppercase tracking-wider text-th-muted hover:text-violet-400 border border-th-hub-border hover:border-violet-400/30 transition-colors"
          >
            Back to top
          </button>
        </div>
      ) : (
        /* --- Concept List View --- */
        <div>
          <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {visibleResults.length > 0 ? (
              visibleResults.map((note, idx) => {
                const outgoing = note.references?.length || 0;
                const incoming = (backlinksMap.get(note.id) || []).length;
                const topo = getNoteTopology(note.id);
                return (
                <Link
                  key={note.id}
                  ref={(el) => { if (el) cardRefs.current.set(idx, el); else cardRefs.current.delete(idx); }}
                  to={`/lab/second-brain/${note.id}`}
                  onClick={() => handleGridCardClick(note)}
                  className={`card-link group p-4 flex flex-col${focusedIdx === idx ? ' border-violet-400/50 bg-violet-400/5' : ''}`}
                >
                  <div className="mb-0.5 flex items-center gap-1.5">
                    <span className={`text-sm font-medium transition-colors group-hover:text-th-primary ${isVisited(note.id) ? 'text-blue-400/70' : 'text-violet-400'}`}>
                      {noteLabel(note)}
                    </span>
                  </div>
                  {note.addressParts && note.addressParts.length > 1 && (
                    <div className="text-[10px] text-th-tertiary mb-1">
                      {displayAddress(note.address!)}
                    </div>
                  )}
                  {note.description && (
                    <div className="text-xs text-th-secondary line-clamp-2 font-sans">
                      {note.description}
                    </div>
                  )}
                  {/* Card metadata — pinned to bottom */}
                  <div className="flex items-center gap-2 mt-auto pt-2.5 text-[10px] text-th-tertiary tabular-nums">
                    <span>{outgoing}↗ {incoming}↙</span>
                    {topo.componentId != null && !topo.isOrphan && (
                      <span className="text-violet-400/60">#{topo.componentId}</span>
                    )}
                    {topo.isBridge && (
                      <span className="text-amber-400/80">⚡</span>
                    )}
                    {topo.isOrphan && (
                      <span>orphan</span>
                    )}
                    {note.date && (
                      <span className="ml-auto opacity-60">{note.date.slice(0, 10)}</span>
                    )}
                  </div>
                </Link>
                );
              })
            ) : (
              <div className="text-xs text-th-tertiary py-8 text-center col-span-3">
                No concepts match your search
              </div>
            )}
          </div>
          {/* Infinite scroll sentinel */}
          {visibleCount < sortedResults.length && (
            <div ref={sentinelRef} className="h-1" />
          )}
        </div>
      )}

      {/* Mobile floating search button — portal to body to escape animate-fade-in transform stacking context */}
      {showDetail && createPortal(
        <button
          onClick={() => {
            navigate('/lab/second-brain');
            setTimeout(() => {
              toolbarInputRef.current?.scrollIntoView({ block: 'nearest' });
              toolbarInputRef.current?.focus();
            }, 100);
          }}
          className="lg:hidden fixed bottom-16 right-4 z-40 w-11 h-11 rounded-full bg-violet-500/90 text-th-on-accent shadow-lg flex items-center justify-center active:scale-95 transition-transform"
          aria-label="Search concepts"
        >
          <SearchIcon />
        </button>,
        document.body
      )}

      {/* Mobile floating "back to top" button — grid view, after scrolling past first infinite-scroll batch */}
      {!showDetail && showScrollTop && visibleCount > BATCH_SIZE && createPortal(
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="lg:hidden fixed bottom-16 right-4 z-40 w-11 h-11 rounded-full bg-violet-500/90 text-th-on-accent shadow-lg flex items-center justify-center active:scale-95 transition-transform"
          aria-label="Back to top"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 19V5" />
            <path d="M5 12l7-7 7 7" />
          </svg>
        </button>,
        document.body
      )}
    </div>
  );
};
