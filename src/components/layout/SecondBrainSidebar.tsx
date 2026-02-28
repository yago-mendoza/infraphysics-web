// Second Brain Manager Sidebar — data exploration dashboard for /second-brain* routes

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useHub } from '../../contexts/SecondBrainHubContext';
import {
  ChevronIcon,
  FolderIcon,
  BarChartIcon,
  SlidersIcon,
  CloseIcon,
  IslandIcon,
  InfoIcon,
} from '../icons';
import { SecondBrainGuide } from '../SecondBrainGuide';
import { IslandDetector, type IslandDetectorHandle } from '../IslandDetector';
import { useGraphRelevance } from '../../hooks/useGraphRelevance';
import { useIsLocalhost } from '../../hooks/useIsLocalhost';
import { SIDEBAR_WIDTH, SECOND_BRAIN_SIDEBAR_WIDTH } from '../../constants/layout';
import type { FieldNoteMeta } from '../../types';
import type { TreeNode, FilterState, DirectorySortMode, ViewMode } from '../../hooks/useSecondBrainHub';

// --- Collapsible Section ---
const Section: React.FC<{
  title: React.ReactNode;
  icon: React.ReactNode;
  defaultOpen?: boolean;
  forceOpen?: boolean;
  headerAction?: React.ReactNode;
  children: React.ReactNode;
}> = ({ title, icon, defaultOpen = true, forceOpen, headerAction, children }) => {
  const [open, setOpen] = useState(defaultOpen);
  const isOpen = forceOpen || open;
  // Keep content mounted after first open so close animation works
  const [hasBeenOpen, setHasBeenOpen] = useState(defaultOpen);
  useEffect(() => { if (isOpen) setHasBeenOpen(true); }, [isOpen]);
  return (
    <div className="border-b border-th-hub-border">
      <div
        role="button"
        tabIndex={0}
        onClick={() => setOpen(!isOpen)}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen(!isOpen); } }}
        className="w-full h-8 flex items-center gap-1.5 px-3 text-[10px] uppercase tracking-wider text-th-tertiary hover:text-th-secondary transition-colors cursor-pointer select-none"
      >
        <span className="text-th-muted">{icon}</span>
        <span className="flex-1 text-left">{title}</span>
        {headerAction && isOpen && (
          <span className="flex-shrink-0" onClick={(e) => e.stopPropagation()}>{headerAction}</span>
        )}
        <ChevronIcon isOpen={isOpen} />
      </div>
      <div className={`grid transition-[grid-template-rows] duration-200 ease-out ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
        <div className="overflow-hidden">
          {hasBeenOpen && <div className="px-3 pb-3">{children}</div>}
        </div>
      </div>
    </div>
  );
};

// --- Scope Icon (for concept+folder nodes) ---
const ScopeIcon: React.FC<{ onClick: (e: React.MouseEvent) => void }> = ({ onClick }) => (
  <button
    onClick={onClick}
    className="hover-reveal text-th-muted hover:text-violet-400 flex-shrink-0"
    title="Scope to this folder"
  >
    <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="8" cy="8" r="5" />
      <circle cx="8" cy="8" r="2" />
    </svg>
  </button>
);

// --- Centrality micro-bar ---
const CentralityBar: React.FC<{ pct: number }> = ({ pct }) => {
  if (pct === 0) return null;
  const fillFromRight = pct < 50;
  return (
    <div className="w-8 h-1 bg-th-hub-border rounded-full flex-shrink-0 overflow-hidden" title={`Centrality: top ${100 - pct}%`}>
      <div className={`h-full bg-violet-400/50 rounded-full ${fillFromRight ? 'ml-auto' : ''}`} style={{ width: `${pct}%` }} />
    </div>
  );
};

// --- Tree Node ---
const TreeNodeItem: React.FC<{
  node: TreeNode;
  depth?: number;
  activeScope: string | null;
  onScope: (path: string) => void;
  onConceptClick?: () => void;
  forceExpanded?: boolean;
  activePath?: string | null;
  getPercentile?: (uid: string) => number;
  collapseSignal?: number;
}> = ({ node, depth = 0, activeScope, onScope, onConceptClick, forceExpanded = false, activePath, getPercentile, collapseSignal = 0 }) => {
  const [expanded, setExpanded] = useState(false);
  const [manuallyCollapsed, setManuallyCollapsed] = useState(false);
  const prevSignal = useRef(collapseSignal);
  useEffect(() => {
    if (collapseSignal !== prevSignal.current) {
      prevSignal.current = collapseSignal;
      setExpanded(false);
      setManuallyCollapsed(true);
    }
  }, [collapseSignal]);
  // Reset manual collapse when active note changes so new path auto-expands
  const prevActivePath = useRef(activePath);
  useEffect(() => {
    if (activePath !== prevActivePath.current) {
      prevActivePath.current = activePath;
      setManuallyCollapsed(false);
    }
  }, [activePath]);
  const hasChildren = node.children.length > 0;
  // Auto-expand if active note is inside this node's subtree
  const isOnActivePath = !!(activePath && hasChildren && (activePath === node.path || activePath.startsWith(node.path + '//')));
  const isExpanded = forceExpanded || ((expanded || isOnActivePath) && !manuallyCollapsed);
  // Keep children mounted after first expand so close animation works
  const [hasBeenExpanded, setHasBeenExpanded] = useState(false);
  useEffect(() => { if (isExpanded && hasChildren) setHasBeenExpanded(true); }, [isExpanded, hasChildren]);
  const isScoped = activeScope === node.path;
  const isConceptAndFolder = node.concept && hasChildren;
  const isActive = !!(activePath && node.concept && activePath === node.path);
  const isRoot = depth === 0;
  const displayLabel = node.label.charAt(0).toUpperCase() + node.label.slice(1);
  const countSuffix = hasChildren ? ` (${node.childCount})` : '';
  const centralityPct = node.concept && getPercentile ? getPercentile(node.concept.id) : 0;

  return (
    <div>
      <div
        className={`flex items-center gap-1 py-0.5 group ${
          isScoped ? 'bg-violet-400/10' : isActive ? 'bg-violet-400/5' : ''
        } ${isRoot ? 'border-l-2 border-violet-400/20' : ''}`}
        style={{ paddingLeft: `${depth * 12}px` }}
      >
        {hasChildren ? (
          <button
            onClick={() => {
              if (isExpanded) {
                if (isOnActivePath) setManuallyCollapsed(true);
                else setExpanded(false);
              } else {
                setManuallyCollapsed(false);
                setExpanded(true);
              }
            }}
            className="w-5 h-5 flex items-center justify-center text-th-muted hover:text-th-secondary transition-colors flex-shrink-0"
          >
            <ChevronIcon isOpen={isExpanded} />
          </button>
        ) : (
          <span className="w-5 h-5 flex-shrink-0" />
        )}

        {node.concept ? (
          isConceptAndFolder ? (
            // Concept + folder: label links to detail, scope icon on hover
            <>
              <Link
                to={`/lab/second-brain/${node.concept.id}`}
                onClick={onConceptClick}
                className="text-[11px] text-th-secondary hover:text-violet-400 transition-colors truncate"
              >
                {displayLabel}
              </Link>
              <span className="text-[9px] text-th-muted tabular-nums">{countSuffix}</span>
              <ScopeIcon onClick={(e) => { e.preventDefault(); onScope(node.path); }} />
              <span className="flex-1" />
              <CentralityBar pct={centralityPct} />
            </>
          ) : (
            // Pure concept leaf: link to detail
            <>
              <Link
                to={`/lab/second-brain/${node.concept.id}`}
                onClick={onConceptClick}
                className="text-[11px] text-th-secondary hover:text-violet-400 transition-colors truncate"
              >
                {displayLabel}
              </Link>
              <span className="flex-1" />
              <CentralityBar pct={centralityPct} />
            </>
          )
        ) : hasChildren ? (
          // Pure folder: click label to scope
          <>
            <button
              onClick={() => onScope(node.path)}
              className={`text-[11px] truncate text-left transition-colors ${
                isScoped ? 'text-violet-400' : 'text-th-muted hover:text-th-secondary'
              }`}
            >
              {displayLabel}
            </button>
            <span className="text-[9px] text-th-muted tabular-nums">{countSuffix}</span>
            <span className="flex-1" />
          </>
        ) : (
          <span className="text-[11px] text-th-muted truncate flex-1">{displayLabel}</span>
        )}

      </div>

      {hasChildren && (
        <div className={`grid transition-[grid-template-rows] duration-200 ease-out ${isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
          <div className="overflow-hidden">
            {hasBeenExpanded && node.children.map(child => (
                <TreeNodeItem
                  key={child.label}
                  node={child}
                  depth={depth + 1}
                  activeScope={activeScope}
                  onScope={onScope}
                  onConceptClick={onConceptClick}
                  forceExpanded={forceExpanded}
                  activePath={activePath}
                  getPercentile={getPercentile}
                  collapseSignal={collapseSignal}
                />
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

// --- Word Count Histogram ---
const WordCountHistogram: React.FC<{
  notes: FieldNoteMeta[];
  wordCountMin: number;
  wordCountMax: number;
  onFilter: (min: number, max: number) => void;
}> = ({ notes, wordCountMin, wordCountMax, onFilter }) => {
  const BUCKET_COUNT = 10;
  const MAX_BAR_HEIGHT = 30;
  const containerRef = useRef<HTMLDivElement>(null);

  const { buckets, maxCount, maxWc } = useMemo(() => {
    const counts = notes.map(n => (n.searchText || '').split(/\s+/).filter(Boolean).length);
    const maxWc = Math.max(...counts, 1);
    const binWidth = Math.ceil(maxWc / BUCKET_COUNT) || 1;
    const bucketCount = Math.ceil(maxWc / binWidth);
    const buckets: { min: number; max: number; count: number }[] = [];
    for (let i = 0; i < bucketCount; i++) {
      buckets.push({ min: i * binWidth, max: (i + 1) * binWidth - 1, count: 0 });
    }
    counts.forEach(wc => {
      const idx = Math.min(Math.floor(wc / binWidth), bucketCount - 1);
      buckets[idx].count++;
    });
    const maxCount = Math.max(...buckets.map(b => b.count), 1);
    return { buckets, maxCount, maxWc };
  }, [notes]);

  const hasSelection = wordCountMin > 0 || wordCountMax < Infinity;
  const effectiveMax = wordCountMax === Infinity ? maxWc : wordCountMax;

  const isInSelection = (bucket: { min: number; max: number }) => {
    if (!hasSelection) return true;
    return bucket.max >= wordCountMin && bucket.min <= effectiveMax;
  };

  // Mirrors heatmap click logic:
  // nothing selected → select single; range selected → reset to single;
  // single + same → deselect; single + after → extend range; single + before → replace
  const isSingleBucket = hasSelection && wordCountMin === effectiveMax
    ? true  // degenerate: one-bucket range
    : hasSelection && buckets.some(b => b.min === wordCountMin && b.max === effectiveMax);
  const isRange = hasSelection && !isSingleBucket;

  const handleBarClick = (bucket: { min: number; max: number }) => {
    if (!hasSelection) {
      // Nothing selected → select single
      onFilter(bucket.min, bucket.max);
    } else if (isRange) {
      // Range selected → reset to this single bucket
      onFilter(bucket.min, bucket.max);
    } else {
      // Single bucket selected
      if (bucket.min === wordCountMin && bucket.max === effectiveMax) {
        // Same bucket → deselect
        onFilter(0, Infinity);
      } else if (bucket.min > effectiveMax) {
        // After → extend to range
        onFilter(wordCountMin, bucket.max);
      } else {
        // Before or non-adjacent → replace with new single
        onFilter(bucket.min, bucket.max);
      }
    }
  };

  // Touch drag: resolve bucket index from clientX
  const bucketFromX = (clientX: number): number | null => {
    const el = containerRef.current;
    if (!el || buckets.length === 0) return null;
    const rect = el.getBoundingClientRect();
    const x = clientX - rect.left;
    const gap = 2;
    const colWidth = (rect.width - (buckets.length - 1) * gap) / buckets.length;
    const colStep = colWidth + gap;
    const idx = Math.min(Math.max(Math.floor(x / colStep), 0), buckets.length - 1);
    return idx;
  };

  // Touch drag state
  const dragRef = useRef<{ startIdx: number; lastIdx: number } | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    const idx = bucketFromX(e.touches[0].clientX);
    if (idx == null) return;
    dragRef.current = { startIdx: idx, lastIdx: idx };
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!dragRef.current) return;
    const idx = bucketFromX(e.touches[0].clientX);
    if (idx == null || idx === dragRef.current.lastIdx) return;
    dragRef.current.lastIdx = idx;
    // Live preview: set range from startIdx..currentIdx
    const lo = Math.min(dragRef.current.startIdx, idx);
    const hi = Math.max(dragRef.current.startIdx, idx);
    onFilter(buckets[lo].min, buckets[hi].max);
  };

  const handleTouchEnd = () => {
    if (!dragRef.current) return;
    const { startIdx, lastIdx } = dragRef.current;
    dragRef.current = null;
    if (startIdx === lastIdx) {
      // Single tap — use normal click logic
      handleBarClick(buckets[startIdx]);
    }
    // Range already committed during touchMove
  };

  const selectionLabel = hasSelection
    ? `${wordCountMin}\u2013${effectiveMax} words`
    : null;

  return (
    <div className="mt-2">
      <div className="flex items-center gap-1.5 mb-1">
        <span className="text-[9px] text-th-muted">word count</span>
        {selectionLabel && (
          <span className="text-[9px] text-violet-400 tabular-nums ml-auto">{selectionLabel}</span>
        )}
      </div>
      <div
        ref={containerRef}
        className="flex items-end gap-[2px] cursor-pointer"
        style={{ height: MAX_BAR_HEIGHT + 2 }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {buckets.map((bucket, i) => {
          const barH = bucket.count > 0 ? Math.max((bucket.count / maxCount) * MAX_BAR_HEIGHT, 2) : 1;
          const inSelection = isInSelection(bucket);
          return (
            <div
              key={i}
              className="flex-1 min-w-0 flex items-end"
              style={{ height: MAX_BAR_HEIGHT + 2 }}
              onClick={() => handleBarClick(bucket)}
              title={`${bucket.min}\u2013${bucket.max} words: ${bucket.count} notes`}
            >
              <div
                className="w-full"
                style={{
                  height: barH,
                  backgroundColor: inSelection
                    ? 'rgba(167, 139, 250, 0.5)'
                    : 'rgba(167, 139, 250, 0.15)',
                  borderRadius: 1,
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

// --- Main Sidebar ---
export const SecondBrainSidebar: React.FC = () => {
  const hub = useHub();
  const navigate = useNavigate();
  const isLocalhost = useIsLocalhost();
  const [guideOpen, setGuideOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [drawerMounted, setDrawerMounted] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const { getPercentile, getIslands } = useGraphRelevance();

  // Animate drawer open/close + lock background scroll
  useEffect(() => {
    if (mobileOpen) {
      setDrawerMounted(true);
      document.body.style.overflow = 'hidden';
      const id = setTimeout(() => setDrawerVisible(true), 20);
      return () => clearTimeout(id);
    } else {
      setDrawerVisible(false);
      document.body.style.overflow = '';
      const id = setTimeout(() => setDrawerMounted(false), 250);
      return () => clearTimeout(id);
    }
  }, [mobileOpen]);

  // Island detector ref for collapse-all button in header
  const islandRef = useRef<IslandDetectorHandle>(null);
  const [topologyQuery, setTopologyQuery] = useState('');

  // Directory collapse-all: increment to reset all TreeNodeItem expanded state
  const [dirCollapseGen, setDirCollapseGen] = useState(0);

  // Topology focus: { id, flash } — flash=true only from chip click, false from auto-expand
  const [topologyFocus, setTopologyFocus] = useState<{ id: number; flash: boolean } | null>(null);

  // Chip click → focus with flash
  useEffect(() => {
    const handler = (e: Event) => {
      const compId = (e as CustomEvent).detail?.componentId;
      if (typeof compId === 'number') setTopologyFocus({ id: compId, flash: true });
    };
    window.addEventListener('topology-focus', handler);
    return () => window.removeEventListener('topology-focus', handler);
  }, []);

  // Auto-expand corresponding island on note navigation (no flash), collapse on grid view
  const prevActiveIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (!hub) return;
    const { activePost } = hub;
    if (!activePost) {
      // Back to grid — collapse all topology
      if (prevActiveIdRef.current) {
        prevActiveIdRef.current = null;
        islandRef.current?.collapseAll();
      }
      return;
    }
    if (activePost.id === prevActiveIdRef.current) return;
    prevActiveIdRef.current = activePost.id;
    const islands = getIslands();
    if (!islands) return;
    const compId = islands.nodeToComponent[activePost.id];
    if (compId != null) setTopologyFocus({ id: compId, flash: false });
  }, [hub, getIslands]);

  if (!hub) return null;

  const {
    filterState, setFilterState,
    directoryScope, setDirectoryScope,
    directoryQuery, setDirectoryQuery,
    directorySortMode, setDirectorySortMode,
    filteredTree,
    stats,
    allFieldNotes,
    backlinksMap,
    signalDirectoryNav,
    activePost,
    sortedResults,
    histogramNotes,
    hasActiveFilters,
    searchActive,
    viewMode,
    setViewMode,
  } = hub;

  const isSimplified = viewMode === 'simplified';

  // Prune sidebar sections when any filter/scope/search is active
  const isFiltering = hasActiveFilters || !!directoryScope || searchActive;
  const resultIdSet = useMemo(() => {
    if (!isFiltering) return null;
    return new Set(sortedResults.map(n => n.id));
  }, [sortedResults, isFiltering]);

  const visibleTree = useMemo(() => {
    if (!resultIdSet) return filteredTree;
    const prune = (nodes: TreeNode[]): TreeNode[] =>
      nodes.reduce<TreeNode[]>((acc, node) => {
        const hit = node.concept && resultIdSet.has(node.concept.id);
        const kids = prune(node.children);
        if (hit || kids.length > 0) acc.push({ ...node, children: kids });
        return acc;
      }, []);
    return prune(filteredTree);
  }, [filteredTree, resultIdSet]);

  const handleScope = (path: string) => {
    // Toggle: clicking already-scoped folder clears scope
    setDirectoryScope(directoryScope === path ? null : path);
  };

  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setFilterState(prev => ({ ...prev, [key]: value }));
  };

  const modeToggle = (
    <button
      onClick={() => setViewMode(isSimplified ? 'technical' : 'simplified')}
      className="flex items-center gap-1.5 text-[9px] text-violet-400/70 hover:text-violet-400 transition-colors whitespace-nowrap"
      title={isSimplified ? 'Switch to technical view' : 'Switch to simple view'}
    >
      <span className="relative w-[22px] h-[12px] rounded-full bg-violet-400/20 flex-shrink-0">
        <span
          className="absolute top-[2px] w-[8px] h-[8px] rounded-full bg-violet-400 transition-[left] duration-200 ease-out"
          style={{ left: isSimplified ? 2 : 12 }}
        />
      </span>
      {isSimplified ? 'simple view' : 'technical view'}
    </button>
  );

  const sections = (
    <>
      {/* Graph Stats — always global, technical only */}
      {!isSimplified && <Section
        title="graph stats"
        icon={<BarChartIcon />}
        defaultOpen={false}
      >
        <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
          <div>
            <div className="text-[9px] text-th-muted">concepts</div>
            <div className="text-[11px] text-th-primary tabular-nums">{stats.totalConcepts}</div>
          </div>
          <div>
            <div className="text-[9px] text-th-muted">links</div>
            <div className="text-[11px] text-th-primary tabular-nums">{stats.totalLinks}</div>
          </div>
          <div>
            <div className="text-[9px] text-th-muted">isolated</div>
            <div className="text-[11px] text-th-primary tabular-nums">{stats.isolatedCount}</div>
          </div>
          <div>
            <div className="text-[9px] text-th-muted">avg refs</div>
            <div className="text-[11px] text-th-primary tabular-nums">{stats.avgRefs}</div>
          </div>
          <div>
            <div className="text-[9px] text-th-muted">max depth</div>
            <div className="text-[11px] text-th-primary tabular-nums">{stats.maxDepth}</div>
          </div>
          <div>
            <div className="text-[9px] text-th-muted">density</div>
            <div className="text-[11px] text-th-primary tabular-nums">{stats.density}%</div>
          </div>
        </div>
        <WordCountHistogram
          notes={histogramNotes}
          wordCountMin={filterState.wordCountMin}
          wordCountMax={filterState.wordCountMax}
          onFilter={(min, max) => {
            setFilterState(prev => ({ ...prev, wordCountMin: min, wordCountMax: max }));
          }}
        />
      </Section>}

      {/* Directory Tree */}
      <Section
        title="directory"
        icon={<FolderIcon />}
        defaultOpen={true}
        headerAction={isSimplified ? undefined :
          <span className="flex items-center gap-0.5">
            {([
              ['children', 'Sort by children count', <svg key="ch" className="block" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v8"/><path d="M4 14h16"/><circle cx="6" cy="19" r="3"/><circle cx="12" cy="19" r="3"/><circle cx="18" cy="19" r="3"/></svg>],
              ['alpha', 'Sort alphabetically', <svg key="az" className="block" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h8"/><path d="M3 12h5"/><path d="M3 18h3"/><path d="M16 6l4 12"/><path d="M13 18h6"/></svg>],
              ['depth', 'Sort by depth', <svg key="dp" className="block" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18"/><path d="M7 8h4"/><path d="M7 16h8"/><path d="M7 12h12"/></svg>],
            ] as [DirectorySortMode, string, React.ReactNode][]).map(([mode, title, icon]) => (
              <button
                key={mode}
                onClick={() => setDirectorySortMode(mode)}
                className={`p-1 leading-none transition-colors ${directorySortMode === mode ? 'text-th-secondary' : 'text-th-muted hover:text-th-secondary'}`}
                title={title}
              >
                {icon}
              </button>
            ))}
            <button
              onClick={() => setDirCollapseGen(g => g + 1)}
              className="text-th-muted hover:text-th-secondary transition-colors p-1 leading-none"
              title="Collapse all"
            >
              <svg className="block" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" x2="18" y1="15" y2="15" />
                <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
              </svg>
            </button>
          </span>
        }
      >
        {/* Tree search */}
        <div className="flex items-center border border-th-hub-border px-2 py-1 bg-th-surface focus-within:border-th-border-active transition-colors mb-2">
          <input
            type="text"
            placeholder="Filter tree..."
            value={directoryQuery}
            onChange={(e) => setDirectoryQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Escape') { setDirectoryQuery(''); (e.target as HTMLInputElement).blur(); } }}
            className="w-full text-[10px] focus:outline-none placeholder-th-muted bg-transparent text-th-primary"
          />
          {directoryQuery && (
            <button
              onClick={() => setDirectoryQuery('')}
              className="text-th-muted hover:text-th-secondary text-[9px] ml-1 flex-shrink-0"
            >
              &times;
            </button>
          )}
        </div>

        {(() => {
          const withChildren = visibleTree.filter(n => n.children.length > 0);
          const leaves = visibleTree.filter(n => n.children.length === 0);
          return (
            <div>
              {withChildren.length === 0 && leaves.length === 0 && isFiltering && (
                <div className="text-[10px] text-th-muted py-2 text-center">
                  No branches match current filters
                </div>
              )}
              {withChildren.length > 0 && (
                <div className="space-y-0.5">
                  {withChildren.map(node => (
                    <TreeNodeItem
                      key={node.label}
                      node={node}
                      activeScope={directoryScope}
                      onScope={handleScope}
                      onConceptClick={signalDirectoryNav}
                      forceExpanded={directoryQuery.length > 0}
                      activePath={activePost?.address ?? null}
                      getPercentile={isSimplified ? undefined : getPercentile}
                      collapseSignal={dirCollapseGen}

                    />
                  ))}
                </div>
              )}
              {leaves.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 py-1.5">
                    <div className="flex-1 border-t border-th-hub-border" />
                    <span className="text-[8px] text-th-muted uppercase tracking-wider leading-none">Standalone</span>
                    <div className="flex-1 border-t border-th-hub-border" />
                  </div>
                  <div>
                    {leaves.map(node => (
                      <TreeNodeItem
                        key={node.label}
                        node={node}
                        activeScope={directoryScope}
                        onScope={handleScope}
                        onConceptClick={signalDirectoryNav}
                        forceExpanded={directoryQuery.length > 0}
                        activePath={activePost?.address ?? null}
                        getPercentile={isSimplified ? undefined : getPercentile}
                        collapseSignal={dirCollapseGen}
  
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })()}
      </Section>

      {/* Topology — technical only */}
      {!isSimplified && <Section
        title="topology"
        icon={<IslandIcon />}
        defaultOpen={true}
        forceOpen={topologyFocus != null}
        headerAction={
          <span className="flex items-center gap-1.5">
            <button
              onClick={() => islandRef.current?.collapseAll()}
              className="text-th-muted hover:text-th-secondary transition-colors p-1 leading-none"
              title="Collapse all"
            >
              <svg className="block" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" x2="18" y1="15" y2="15" />
                <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
              </svg>
            </button>
          </span>
        }
      >
        <div className="flex items-center border border-th-hub-border px-2 py-1 bg-th-surface focus-within:border-th-border-active transition-colors mb-2">
          <input
            type="text"
            placeholder="Filter topology..."
            value={topologyQuery}
            onChange={(e) => setTopologyQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Escape') { setTopologyQuery(''); (e.target as HTMLInputElement).blur(); } }}
            className="w-full text-[10px] focus:outline-none placeholder-th-muted bg-transparent text-th-primary"
          />
          {topologyQuery && (
            <button
              onClick={() => setTopologyQuery('')}
              className="text-th-muted hover:text-th-secondary text-[9px] ml-1 flex-shrink-0"
            >
              &times;
            </button>
          )}
        </div>
        <IslandDetector
          ref={islandRef}
          focusComponentId={topologyFocus?.id ?? null}
          focusFlash={topologyFocus?.flash ?? false}
          onFocusHandled={() => setTopologyFocus(null)}
          activeIslandScope={filterState.islandId}
          onIslandScope={(id) => updateFilter('islandId', filterState.islandId === id ? null : id)}
          filterQuery={topologyQuery}
          visibleIds={resultIdSet}
        />
      </Section>}
    </>
  );

  return (
    <>
      {/* Mobile toggle button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed bottom-4 right-4 z-40 w-11 h-11 rounded-full bg-violet-500/90 text-th-on-accent shadow-lg flex items-center justify-center active:scale-95 transition-transform"
        aria-label="Open manager sidebar"
      >
        <SlidersIcon />
      </button>

      {/* Mobile drawer */}
      {drawerMounted && (
        <div className="md:hidden fixed inset-0 z-50">
          <div
            className={`absolute inset-0 bg-th-overlay transition-opacity duration-200 ${drawerVisible ? 'opacity-100' : 'opacity-0'}`}
            onClick={() => setMobileOpen(false)}
          />
          <aside
            className={`absolute left-0 top-0 bottom-0 w-72 max-w-[85vw] flex flex-col overflow-hidden transition-transform duration-250 ease-out ${drawerVisible ? 'translate-x-0' : '-translate-x-full'}`}
            style={{ backgroundColor: 'var(--hub-sidebar-bg)' }}
          >
            {/* Header with close */}
            <div className="px-3 py-3 border-b border-th-hub-border flex-shrink-0">
              <div className="flex items-center justify-between">
                <Link to="/lab/second-brain" className="group" onClick={() => setMobileOpen(false)}>
                  <span className="text-[11px] lowercase tracking-wide font-semibold text-violet-400 group-hover:text-violet-300 transition-colors">second brain</span>{' '}
                  <span className="text-[11px] lowercase tracking-wide text-th-muted font-normal">manager</span>
                </Link>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setGuideOpen(true)}
                    className="text-violet-400 hover:text-violet-300 transition-colors flex-shrink-0 leading-[0]"
                    title="How Second Brain works"
                  >
                    <InfoIcon size={11} />
                  </button>
                  <button
                    onClick={() => setMobileOpen(false)}
                    className="p-1 text-th-muted hover:text-th-secondary transition-colors"
                    aria-label="Close sidebar"
                  >
                    <CloseIcon />
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between mt-0.5">
                {modeToggle}
                <span className="text-[9px] text-th-muted">{stats.totalConcepts} concepts</span>
              </div>
            </div>
            {/* Scrollable sections */}
            <div className="flex-1 overflow-y-auto thin-scrollbar hub-scrollbar">
              {sections}
            </div>
          </aside>
        </div>
      )}

      {/* Desktop sidebar — spacer keeps content pushed right */}
      <div className="hidden md:block flex-shrink-0" style={{ width: SECOND_BRAIN_SIDEBAR_WIDTH }} />
      <aside
        className="hidden md:flex flex-col fixed top-0 h-screen border-r border-th-hub-border overflow-hidden"
        style={{
          left: SIDEBAR_WIDTH,
          width: SECOND_BRAIN_SIDEBAR_WIDTH,
          minWidth: SECOND_BRAIN_SIDEBAR_WIDTH,
          backgroundColor: 'var(--hub-sidebar-bg)',
        }}
      >
        {/* Header — h-7 first row aligns with the editing upbar */}
        <div className="border-b border-th-hub-border flex-shrink-0">
          <div className="px-3 h-7 flex items-center justify-between">
            <Link to="/lab/second-brain" className="group">
              <span className="text-[11px] lowercase tracking-wide font-semibold text-violet-400 group-hover:text-violet-300 transition-colors">second brain</span>{' '}
              <span className="text-[11px] lowercase tracking-wide text-th-muted font-normal">manager</span>
            </Link>
            <button
              onClick={() => setGuideOpen(true)}
              className="text-violet-400 hover:text-violet-300 transition-colors flex-shrink-0 leading-[0]"
              title="How Second Brain works"
            >
              <InfoIcon size={11} />
            </button>
          </div>
          <div className="px-3 pb-1.5 flex items-center justify-between">
            {modeToggle}
            <span className="text-[9px] text-th-muted">{stats.totalConcepts} concepts</span>
          </div>
        </div>
        {/* Scrollable sections */}
        <div className="flex-1 overflow-y-auto thin-scrollbar hub-scrollbar">
          {sections}
        </div>
      </aside>

      <SecondBrainGuide isOpen={guideOpen} onClose={() => setGuideOpen(false)} isLocalhost={isLocalhost} />
    </>
  );
};
