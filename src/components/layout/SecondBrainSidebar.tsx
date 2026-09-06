// Wiki Console sidebar — data exploration dashboard for Second Brain routes

import React, { useState, useRef, useEffect, useMemo, Suspense } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { isSecondBrainPath, secondBrainPath } from '../../config/categories';
import { useHub } from '../../contexts/SecondBrainHubContext';
import {
  ChevronIcon,
  FolderIcon,
  BarChartIcon,
  SlidersIcon,
  CloseIcon,
  InfoIcon,
  WikiBrainIcon,
} from '../icons';
import { SecondBrainGuide } from '../SecondBrainGuide';
import { useGraphRelevance } from '../../hooks/useGraphRelevance';
import { useIsLocalhost } from '../../hooks/useIsLocalhost';
import { SIDEBAR_WIDTH, SECOND_BRAIN_SIDEBAR_WIDTH } from '../../constants/layout';
import type { FieldNoteMeta } from '../../types';
import type { TreeNode, FilterState, DirectorySortMode, SearchMode } from '../../hooks/useSecondBrainHub';

// Lazy-load MiniGraph — heavy dep (react-force-graph-2d)
const MiniGraph = React.lazy(() => import('../graph/MiniGraph'));
import type { GraphColorMode } from '../graph/MiniGraph';
import { assignRootColors, ROOT_NEUTRAL } from '../graph/useGraphData';

type GraphPhysics = { repulsion: number; linkDistance: number; linkStrength: number; collision: number; damping: number; gravity: number };
const GRAPH_PHYSICS_DEFAULTS: GraphPhysics = { repulsion: -30, linkDistance: 58, linkStrength: .11, collision: 3.2, damping: .32, gravity: .05 };
const GraphDynamicsControls = React.memo(() => {
  const [values, setValues] = useState<GraphPhysics>(() => {
    try { return { ...GRAPH_PHYSICS_DEFAULTS, ...JSON.parse(localStorage.getItem('wiki-graph-physics-v4') ?? '{}') }; }
    catch { return GRAPH_PHYSICS_DEFAULTS; }
  });
  const pendingRef = useRef<GraphPhysics | null>(null);
  const timerRef = useRef<number | null>(null);
  const update = (key: keyof GraphPhysics, value: number) => {
    setValues(current => {
      const next = { ...current, [key]: value };
      pendingRef.current = next;
      return next;
    });
    if (timerRef.current === null) timerRef.current = window.setTimeout(() => {
      timerRef.current = null;
      const next = pendingRef.current;
      pendingRef.current = null;
      if (next) window.dispatchEvent(new CustomEvent('wiki-graph-physics-change', { detail: next }));
    }, 70);
  };
  useEffect(() => () => { if (timerRef.current !== null) window.clearTimeout(timerRef.current); }, []);
  return <div className="graph-instrument divide-y divide-th-hub-border border-y border-th-hub-border">{([
    ['repulsion', 'repulsion', 12, 140, 1], ['linkDistance', 'edge length', 10, 80, 1],
    ['linkStrength', 'edge attraction', .02, .9, .01], ['collision', 'clearance', 1, 12, .1],
    ['damping', 'damping', .12, .8, .01], ['gravity', 'center gravity', 0, .4, .01],
  ] as Array<[keyof GraphPhysics, string, number, number, number]>).map(([key, label, min, max, step]) => {
    const shown = key === 'repulsion' ? Math.abs(values[key]) : values[key];
    return <label key={key} className="grid h-7 grid-cols-[5.4rem_minmax(0,1fr)_2.3rem] items-center gap-2 px-1.5"><span className="truncate text-[8px] uppercase tracking-[.08em] text-th-muted">{label}</span><input type="range" min={min} max={max} step={step} value={shown} onChange={event => update(key, key === 'repulsion' ? -Number(event.target.value) : Number(event.target.value))} className="wiki-graph-range min-w-0 w-full" /><output className="text-right font-mono text-[9px] tabular-nums text-violet-400">{shown.toFixed(step < .1 ? 2 : 1)}</output></label>;
  })}</div>;
});
GraphDynamicsControls.displayName = 'GraphDynamicsControls';

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

// --- Root legend (graph roots color mode) ---
// Click a root to light up its address subtree on the graph without hiding the rest
const RootLegend: React.FC<{
  roots: { root: string; count: number }[];
  colors: Map<string, string>;
  activeRoot: string | null;
  onPick: (root: string | null) => void;
  onPreview?: (root: string | null) => void;
  className?: string;
}> = ({ roots, colors, activeRoot, onPick, onPreview, className }) => (
  <div className={`flex flex-wrap gap-x-2 gap-y-1 ${className ?? ''}`}>
    {roots.map(({ root, count }) => {
      const active = activeRoot === root;
      return (
        <button
          key={root}
          type="button"
          aria-pressed={active}
          onClick={() => onPick(active ? null : root)}
          onMouseEnter={() => onPreview?.(root)}
          onMouseLeave={() => onPreview?.(null)}
          className={`flex items-center gap-1 text-[8px] leading-none transition-colors ${active ? 'text-th-primary' : 'text-th-muted hover:text-th-secondary'}`}
          title={`${root} (${count} notes) — click to light up its subtree`}
        >
          <i className="h-1.5 w-1.5 flex-shrink-0 rounded-full" style={{ backgroundColor: colors.get(root) ?? ROOT_NEUTRAL }} />
          <span className="max-w-[80px] truncate">{root}</span>
        </button>
      );
    })}
  </div>
);

// --- Centrality micro-bar ---
const CentralityBar: React.FC<{ pct: number }> = ({ pct }) => {
  if (pct === 0) return null;
  const rank = pct >= 50 ? `top ${Math.max(1, 100 - pct)}%` : `bottom ${Math.max(1, pct)}%`;
  return (
    <div className="w-8 h-1 bg-th-hub-border rounded-full flex-shrink-0 overflow-hidden" title={`Centrality: ${rank} · percentile ${pct}`}>
      <div className="h-full rounded-full bg-violet-400/50" style={{ width: `${pct}%` }} />
    </div>
  );
};

// --- Tree Node ---
const TreeNodeItem: React.FC<{
  node: TreeNode;
  depth?: number;
  onConceptClick?: () => void;
  forceExpandDepth?: number;
  activePath?: string | null;
  getPercentile?: (uid: string) => number;
  collapseSignal?: number;
  accentColor?: string;
  onPathPreview?: (path: string | null) => void;
  onPathPick?: (path: string) => void;
  relativeSize?: number;
}> = ({ node, depth = 0, onConceptClick, forceExpandDepth = 0, activePath, getPercentile, collapseSignal = 0, accentColor, onPathPreview, onPathPick, relativeSize = 1 }) => {
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
  // Automatic expansion reveals matches, but explicit user intent always wins.
  // This keeps filtered/search trees fully foldable instead of reopening them
  // on every render while automatic expansion remains active.
  const isExpanded = !manuallyCollapsed && (depth < forceExpandDepth || expanded || isOnActivePath);
  // Keep children mounted after first expand so close animation works
  const [hasBeenExpanded, setHasBeenExpanded] = useState(false);
  useEffect(() => { if (isExpanded && hasChildren) setHasBeenExpanded(true); }, [isExpanded, hasChildren]);
  const isConceptAndFolder = node.concept && hasChildren;
  const isActive = !!(activePath && node.concept && activePath === node.path);
  const isRoot = depth === 0;
  const displayLabel = node.label.charAt(0).toUpperCase() + node.label.slice(1);
  const countSuffix = hasChildren ? ` (${node.childCount})` : '';
  const centralityPct = node.concept && getPercentile ? getPercentile(node.concept.id) : 0;

  return (
    <div>
      <div
        onMouseEnter={() => onPathPreview?.(node.path)}
        onMouseLeave={() => onPathPreview?.(null)}
        className={`relative flex items-center gap-1 py-1.5 md:py-0.5 group ${
          isActive ? 'bg-violet-400/5' : ''
        } ${isRoot ? 'border-l-2 border-violet-400/20' : ''}`}
        style={{ paddingLeft: `${depth * 12}px`, ...(isRoot && accentColor ? { borderLeftColor: accentColor } : {}) }}
      >
        <span className="pointer-events-none absolute bottom-0 h-[2px] opacity-[.32]" style={{ left: `${depth * 12 + 20}px`, width: `calc((100% - ${depth * 12 + 20}px) * ${Math.max(.03, relativeSize)})`, backgroundColor: accentColor ?? '#a78bfa' }} />
        {hasChildren ? (
          <button
            onClick={() => {
              if (isExpanded) {
                setManuallyCollapsed(true);
                setExpanded(false);
              } else {
                setManuallyCollapsed(false);
                setExpanded(true);
              }
            }}
            className="w-5 h-5 flex items-center justify-center text-th-muted hover:text-th-secondary transition-colors flex-shrink-0"
            aria-expanded={isExpanded}
            aria-label={isExpanded ? 'Collapse' : 'Expand'}
          >
            <ChevronIcon isOpen={isExpanded} />
          </button>
        ) : (
          <span className="w-5 h-5 flex-shrink-0" />
        )}

        {node.concept ? (
          isConceptAndFolder ? (
            // Concept + folder: label links to detail; chevron expands children.
            <>
              <Link
                to={secondBrainPath(node.concept.id)}
                onClick={onConceptClick}
                className="text-[11px] text-th-secondary hover:text-violet-400 transition-colors truncate"
              >
                {displayLabel}
              </Link>
              <span className="text-[9px] text-th-muted tabular-nums">{countSuffix}</span>
              <span className="flex-1" />
              <CentralityBar pct={centralityPct} />
            </>
          ) : (
            // Pure concept leaf: link to detail
            <>
              <Link
                to={secondBrainPath(node.concept.id)}
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
          // Pure folder: the label expands/collapses the directory branch.
          <>
            <button
              onClick={() => { onPathPick?.(node.path); setManuallyCollapsed(isExpanded); setExpanded(!isExpanded); }}
              className="text-[11px] truncate text-left text-th-muted transition-colors hover:text-th-secondary"
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
                  onConceptClick={onConceptClick}
                  forceExpandDepth={forceExpandDepth}
                  activePath={activePath}
                  getPercentile={getPercentile}
                  collapseSignal={collapseSignal}
                  accentColor={accentColor}
                  onPathPreview={onPathPreview}
                  onPathPick={onPathPick}
                  relativeSize={Math.max(1, child.childCount + (child.concept ? 1 : 0)) / Math.max(1, ...node.children.map(sibling => sibling.childCount + (sibling.concept ? 1 : 0)))}
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
  const location = useLocation();
  const isLocalhost = useIsLocalhost();
  const [guideOpen, setGuideOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [drawerMounted, setDrawerMounted] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [graphExpanded, setGraphExpanded] = useState(false);
  const [graphExpandedVisible, setGraphExpandedVisible] = useState(false);
  const graphMinimizeTimerRef = useRef<number | null>(null);
  const graphSearchInputRef = useRef<HTMLInputElement>(null);
  const [graphInput, setGraphInput] = useState('');
  const [graphSelectionCleared, setGraphSelectionCleared] = useState(false);
  const [previewRoot, setPreviewRoot] = useState<string | null>(null);
  const [previewPath, setPreviewPath] = useState<string | null>(null);
  const [miniAreaIds, setMiniAreaIds] = useState<Set<string> | null>(null);
  const [wikiLinkPreviewId, setWikiLinkPreviewId] = useState<string | null>(null);
  const [calendarPreviewIds, setCalendarPreviewIds] = useState<Set<string> | null>(null);
  const [graphColorMode, setGraphColorMode] = useState<GraphColorMode>(() =>
    localStorage.getItem('wiki-graph-colormode') === 'roots' ? 'roots' : 'centrality',
  );
  const { getPercentile } = useGraphRelevance();
  useEffect(() => { localStorage.setItem('wiki-graph-colormode', graphColorMode); }, [graphColorMode]);
  useEffect(() => {
    const receiveCalendarPreview = (event: Event) => {
      const ids = (event as CustomEvent<string[] | null>).detail;
      setCalendarPreviewIds(Array.isArray(ids) ? new Set(ids) : null);
    };
    window.addEventListener('wiki-calendar-preview', receiveCalendarPreview);
    return () => window.removeEventListener('wiki-calendar-preview', receiveCalendarPreview);
  }, []);
  useEffect(() => {
    const receiveWikiLinkPreview = (event: Event) => setWikiLinkPreviewId((event as CustomEvent<string | null>).detail ?? null);
    window.addEventListener('wiki-link-preview', receiveWikiLinkPreview);
    return () => window.removeEventListener('wiki-link-preview', receiveWikiLinkPreview);
  }, []);
  useEffect(() => {
    const handlePreview = (event: Event) => setPreviewRoot((event as CustomEvent<{ root?: string | null }>).detail?.root ?? null);
    window.addEventListener('wiki-root-preview', handlePreview);
    return () => window.removeEventListener('wiki-root-preview', handlePreview);
  }, []);

  const expandGraph = () => {
    if (graphMinimizeTimerRef.current !== null) window.clearTimeout(graphMinimizeTimerRef.current);
    setMobileOpen(false);
    setPreviewRoot(null);
    setPreviewPath(null);
    setMiniAreaIds(null);
    setGraphInput(query || activePost?.title || '');
    setGraphSelectionCleared(false);
    setGraphExpanded(true);
    requestAnimationFrame(() => requestAnimationFrame(() => setGraphExpandedVisible(true)));
  };
  const minimizeGraph = (returnToMatrix = graphSelectionCleared) => {
    setGraphExpandedVisible(false);
    if (returnToMatrix) { setQuery(''); navigate(secondBrainPath()); }
    graphMinimizeTimerRef.current = window.setTimeout(() => { setGraphExpanded(false); graphMinimizeTimerRef.current = null; }, 360);
  };

  // Keep graph inspection alive while its underlying console route changes;
  // only leaving the wiki should dismiss the expanded workspace.
  useEffect(() => {
    if (isSecondBrainPath(location.pathname)) return;
    if (graphMinimizeTimerRef.current !== null) { window.clearTimeout(graphMinimizeTimerRef.current); graphMinimizeTimerRef.current = null; }
    setGraphExpanded(false); setGraphExpandedVisible(false);
  }, [location.pathname]);

  useEffect(() => () => {
    if (graphMinimizeTimerRef.current !== null) window.clearTimeout(graphMinimizeTimerRef.current);
  }, []);

  useEffect(() => {
    if (!graphExpanded) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (graphExpanded) minimizeGraph();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [graphExpanded, graphSelectionCleared]);

  // Swipe-to-close state for mobile drawer
  const drawerRef = useRef<HTMLElement>(null);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const touchDeltaX = useRef(0);
  const isSwiping = useRef(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    touchDeltaX.current = 0;
    isSwiping.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const dx = e.touches[0].clientX - touchStartX.current;
    const dy = e.touches[0].clientY - touchStartY.current;
    // Only start swiping if horizontal movement dominates vertical
    if (!isSwiping.current && Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      isSwiping.current = true;
    }
    if (!isSwiping.current) return;
    // Only allow swipe left (negative dx)
    touchDeltaX.current = Math.min(0, dx);
    if (drawerRef.current) {
      drawerRef.current.style.transition = 'none';
      drawerRef.current.style.transform = `translateX(${touchDeltaX.current}px)`;
    }
  };

  const handleTouchEnd = () => {
    if (!isSwiping.current) return;
    const el = drawerRef.current;
    if (!el) return;
    // Restore transition
    el.style.transition = '';
    if (touchDeltaX.current < -80) {
      // Swipe far enough → close
      el.style.transform = '';
      setMobileOpen(false);
    } else {
      // Snap back
      el.style.transform = '';
    }
    isSwiping.current = false;
    touchDeltaX.current = 0;
  };

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

  // Directory collapse-all: increment to reset all TreeNodeItem expanded state
  const [dirCollapseGen, setDirCollapseGen] = useState(0);

  if (!hub) return null;

  const {
    query, setQuery, searchMode, setSearchMode,
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
    resetFilters,
  } = hub;

  useEffect(() => {
    if (!graphExpanded) return;
    const frame = requestAnimationFrame(() => graphSearchInputRef.current?.focus());
    const redirectTyping = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.matches('input, textarea, [contenteditable="true"]')) return;
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      if (event.key.length === 1) {
        event.preventDefault();
        const next = graphSelectionCleared ? `${graphInput}${event.key}` : event.key;
        setGraphSelectionCleared(true); setGraphInput(next); setQuery(next);
        graphSearchInputRef.current?.focus();
      } else if (event.key === 'Backspace') {
        event.preventDefault();
        const next = graphSelectionCleared ? graphInput.slice(0, -1) : '';
        setGraphSelectionCleared(true); setGraphInput(next); setQuery(next);
        graphSearchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', redirectTyping, true);
    return () => { cancelAnimationFrame(frame); window.removeEventListener('keydown', redirectTyping, true); };
  }, [graphExpanded, graphInput, graphSelectionCleared, setQuery]);

  // Prune sidebar sections when any filter, root, or search is active.
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
  const directoryPreviewIds = calendarPreviewIds ?? miniAreaIds;
  const areaRootBreakdown = useMemo(() => {
    if (!directoryPreviewIds?.size) return [] as Array<{ root: string; count: number; percent: number }>;
    const counts = new Map<string, number>();
    allFieldNotes.forEach(note => {
      if (!directoryPreviewIds.has(note.id)) return;
      const root = note.addressParts?.[0] ?? note.address?.split('//')[0] ?? note.title;
      counts.set(root, (counts.get(root) ?? 0) + 1);
    });
    return [...counts].map(([root, count]) => ({ root, count, percent: count / directoryPreviewIds.size * 100 })).sort((a, b) => b.count - a.count || a.root.localeCompare(b.root));
  }, [allFieldNotes, directoryPreviewIds]);
  const areaOrderedTree = useMemo(() => {
    if (!areaRootBreakdown.length) return visibleTree;
    const pruneToArea = (nodes: TreeNode[]): TreeNode[] => nodes.reduce<TreeNode[]>((result, node) => {
      const children = pruneToArea(node.children);
      const nodeId = node.concept?.id;
      if ((nodeId && directoryPreviewIds?.has(nodeId)) || children.length) result.push({ ...node, children });
      return result;
    }, []);
    // A calendar hover is a transient lens above the persisted date filter.
    // Start from the complete directory tree so a pinned day cannot erase the
    // nodes belonging to the day currently being previewed. Other area tools
    // continue to operate on the already-filtered tree.
    const sampledTree = pruneToArea(calendarPreviewIds ? filteredTree : visibleTree);
    const rank = new Map<string, number>(areaRootBreakdown.map((item, index): [string, number] => [item.root, index]));
    return sampledTree.sort((a, b) => (rank.get(a.path.split('//')[0]) ?? 9999) - (rank.get(b.path.split('//')[0]) ?? 9999));
  }, [areaRootBreakdown, calendarPreviewIds, directoryPreviewIds, filteredTree, visibleTree]);
  const previewExpansionDepth = useMemo(() => {
    if (!calendarPreviewIds?.size && !miniAreaIds?.size) return 0;
    // Spend the available vertical rows one complete generation at a time.
    // This never exposes half of a level and scales to arbitrarily deep trees.
    const viewportHeight = typeof window === 'undefined' ? 800 : window.innerHeight;
    const availableRows = Math.max(4, Math.floor((viewportHeight - (graphExpanded ? 430 : 520)) / 25));
    let visibleRows = areaOrderedTree.length;
    let depth = 0;
    let frontier = areaOrderedTree;
    while (frontier.length) {
      const next = frontier.flatMap(node => node.children);
      if (!next.length || visibleRows + next.length > availableRows) break;
      visibleRows += next.length;
      frontier = next;
      depth += 1;
    }
    return depth;
  }, [areaOrderedTree, calendarPreviewIds, graphExpanded, miniAreaIds]);
  const forceDirectoryDepth = directoryQuery.length > 0
    ? Number.POSITIVE_INFINITY
    : calendarPreviewIds?.size || miniAreaIds?.size
      ? previewExpansionDepth
      : filterState.dateFilter
        ? Number.POSITIVE_INFINITY
        : 0;

  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setFilterState(prev => ({ ...prev, [key]: value }));
  };
  const noteDateById = useMemo(() => new Map(
    allFieldNotes.map(note => [note.id, note.date?.slice(0, 10) ?? '']),
  ), [allFieldNotes]);
  const openGraphNode = (node: { id: string }) => {
    const date = noteDateById.get(node.id);
    if (date) updateFilter('dateFilter', date);
    navigate(secondBrainPath(node.id));
  };

  const rootOptions = useMemo(() => {
    const counts = new Map<string, number>();
    allFieldNotes.forEach(note => {
      const root = (note.addressParts || note.address?.split('//') || [note.title])[0];
      if (root) counts.set(root, (counts.get(root) || 0) + 1);
    });
    return [...counts.entries()]
      .map(([root, count]) => ({ root, count }))
      .sort((a, b) => b.count - a.count || a.root.localeCompare(b.root));
  }, [allFieldNotes]);
  const rootColorMap = useMemo(() => assignRootColors(allFieldNotes.map(note => note.address ?? note.title)), [allFieldNotes]);
  const graphDirectoryIndex = useMemo(() => {
    const descendantsByPath = new Map<string, Set<string>>();
    const noteById = new Map<string, FieldNoteMeta>();
    allFieldNotes.forEach(note => {
      noteById.set(note.id, note);
      const parts = note.addressParts ?? note.address?.split('//') ?? [note.title];
      for (let depth = 1; depth <= parts.length; depth += 1) {
        const path = parts.slice(0, depth).join('//');
        const descendants = descendantsByPath.get(path) ?? new Set<string>();
        descendants.add(note.id);
        descendantsByPath.set(path, descendants);
      }
    });
    return { descendantsByPath, noteById };
  }, [allFieldNotes]);

  const scopedRoot = directoryScope && rootOptions.some(option => option.root === directoryScope) ? directoryScope : '';

  // Build highlight set from sortedResults when searching
  const graphHighlightIds = useMemo(() => {
    if (!isFiltering) return null;
    return new Set(sortedResults.map(n => n.id));
  }, [isFiltering, sortedResults]);
  const previewRootIds = previewRoot ? graphDirectoryIndex.descendantsByPath.get(previewRoot) ?? null : null;
  const previewPathIds = previewPath ? graphDirectoryIndex.descendantsByPath.get(previewPath) ?? null : null;
  const previewPathCameraIds = useMemo(() => {
    if (!previewPath) return null;
    const contextPath = previewPath.split('//').slice(0, 2).join('//');
    return graphDirectoryIndex.descendantsByPath.get(contextPath) ?? null;
  }, [graphDirectoryIndex, previewPath]);
  const wikiLinkHighlightIds = useMemo(() => wikiLinkPreviewId ? new Set([wikiLinkPreviewId]) : null, [wikiLinkPreviewId]);
  // Deep links retain spatial context: frame at most root/first-child depth,
  // independent of how deeply nested the destination itself is.
  const wikiLinkCameraIds = useMemo(() => {
    if (!wikiLinkPreviewId) return null;
    const target = graphDirectoryIndex.noteById.get(wikiLinkPreviewId);
    const parts = target?.addressParts ?? target?.address?.split('//') ?? [];
    if (!parts.length) return wikiLinkHighlightIds;
    const contextPath = parts.slice(0, Math.min(2, parts.length)).join('//');
    return graphDirectoryIndex.descendantsByPath.get(contextPath) ?? wikiLinkHighlightIds;
  }, [graphDirectoryIndex, wikiLinkHighlightIds, wikiLinkPreviewId]);
  const transientGraphHighlightIds = previewPathIds ?? previewRootIds ?? calendarPreviewIds ?? miniAreaIds ?? wikiLinkHighlightIds;
  const graphStateReadout = (graphHighlightIds || transientGraphHighlightIds || (!graphSelectionCleared && activePost)) ? (
    <span className="flex items-center gap-2 font-mono text-[8px] normal-case tracking-normal text-th-muted" aria-label="Graph visual state">
      {graphHighlightIds && <span className="flex items-center gap-1 text-indigo-300" title={`${graphHighlightIds.size} current matrix results`}><i className="h-1.5 w-1.5 rounded-full bg-indigo-300" />{graphHighlightIds.size}</span>}
      {transientGraphHighlightIds && <span className="flex items-center gap-1 text-fuchsia-400" title={`${transientGraphHighlightIds.size} temporarily previewed nodes`}><i className="h-1.5 w-1.5 rounded-full bg-fuchsia-400" />{transientGraphHighlightIds.size}</span>}
      {!graphSelectionCleared && activePost && <span className="flex items-center gap-1 text-lime-400" title="Selected node and descendants"><i className="h-1.5 w-1.5 rounded-full bg-lime-400" />1</span>}
    </span>
  ) : null;
  const temporalPreviewIds = useMemo(() => {
    if (previewPathIds) return previewPathIds;
    if (previewRootIds) return previewRootIds;
    if (calendarPreviewIds) return calendarPreviewIds;
    if (miniAreaIds) return miniAreaIds;
    // A single graph-node hover is deliberately local. Sending it to the
    // calendar made the whole temporal map flicker for no useful comparison.
    return null;
  }, [calendarPreviewIds, miniAreaIds, previewPathIds, previewRootIds]);
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('wiki-temporal-preview', { detail: temporalPreviewIds ? [...temporalPreviewIds] : null }));
  }, [temporalPreviewIds]);

  // Build filtered ID set for mini graph — active when any filter reduces the result set
  const sections = (
    <>
      <>
      {/* Mini Graph — visual overview, highlights search matches */}
      {!graphExpanded && <div className="sticky top-0 z-30 bg-th-base"><Section
        title="graph"
        icon={
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
            <circle cx="3" cy="3" r="1.5" /><circle cx="9" cy="5" r="1.5" /><circle cx="5" cy="9" r="1.5" />
            <line x1="4.2" y1="3.8" x2="7.8" y2="4.5" /><line x1="4" y1="8" x2="7.8" y2="5.8" />
          </svg>
        }
        defaultOpen={true}
        headerAction={graphStateReadout}
      >
        <div className="relative -mx-3 -mb-3 overflow-hidden">
          <Suspense fallback={
            <div className="flex items-center justify-center text-th-muted text-[10px] animate-pulse" style={{ height: 150 }}>
              Loading graph...
            </div>
          }>
            <MiniGraph
              resultIds={graphHighlightIds}
              previewIds={transientGraphHighlightIds}
              searchQuery={hub.query}
              cameraFocusIds={previewPathCameraIds ?? previewRootIds ?? calendarPreviewIds ?? wikiLinkCameraIds}
              cameraAnchorIds={previewPathIds ?? previewRootIds ?? calendarPreviewIds ?? wikiLinkHighlightIds}
              onAreaPreview={setMiniAreaIds}
              colorMode="roots"
              onNodeSelect={openGraphNode}
              activeNodeId={activePost?.id ?? null}
            />
          </Suspense>
          <button
            type="button"
            onClick={expandGraph}
            className="absolute bottom-0.5 right-0.5 z-10 grid h-6 w-6 place-items-center border border-th-hub-border bg-th-base text-violet-400 opacity-55 shadow-sm transition-[opacity,color,background-color] hover:bg-violet-400/10 hover:text-violet-300 hover:opacity-100"
            title="Expand graph"
          >
            <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"><path d="M4.5 1.5h-3v3M7.5 10.5h3v-3M1.5 4.5l3-3M10.5 7.5l-3 3" /></svg>
          </button>
        </div>
      </Section></div>}

      {/* Graph Stats — always global, technical only */}
      {graphExpanded && <Section title="graph statistics" icon={<BarChartIcon />} defaultOpen={false}>
        <div className="divide-y divide-th-hub-border border-y border-th-hub-border">
          {[
            ['nodes', stats.totalConcepts], ['links', stats.totalLinks], ['density', `${stats.density}%`],
            ['isolated', stats.isolatedCount], ['avg refs', stats.avgRefs], ['depth', stats.maxDepth],
          ].map(([label, value]) => <div key={label} className="flex h-6 items-center justify-between px-1.5"><span className="text-[8px] uppercase tracking-[.12em] text-th-muted">{label}</span><span className="font-mono text-[10px] tabular-nums text-th-secondary">{value}</span></div>)}
        </div>
      </Section>}

      {graphExpanded && <Section
        key="graph-dynamics"
        title="graph dynamics"
        icon={<BarChartIcon />}
        defaultOpen={!graphExpanded}
      >
        {graphExpanded ? <GraphDynamicsControls /> : <>
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
        </>}
      </Section>}

      {/* Directory Tree */}
      <Section
        title="directory"
        icon={<FolderIcon />}
        defaultOpen={true}
        headerAction={
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
          const withChildren = areaOrderedTree.filter(n => n.children.length > 0);
          const leaves = areaOrderedTree.filter(n => n.children.length === 0);
          const maxBranchSize = Math.max(1, ...areaOrderedTree.map(node => node.childCount + (node.concept ? 1 : 0)));
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
                      onConceptClick={() => { signalDirectoryNav(); if (graphExpanded) minimizeGraph(false); }}
                      forceExpandDepth={forceDirectoryDepth}
                      activePath={directoryPreviewIds?.size ? null : activePost?.address ?? null}
                      getPercentile={getPercentile}
                      collapseSignal={dirCollapseGen}
                      accentColor={rootColorMap.get(node.path.split('//')[0]) ?? ROOT_NEUTRAL}
                      onPathPreview={setPreviewPath}
                      onPathPick={path => setDirectoryScope(directoryScope === path ? null : path)}
                      relativeSize={Math.max(1, node.childCount + (node.concept ? 1 : 0)) / maxBranchSize}

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
                        onConceptClick={() => { signalDirectoryNav(); if (graphExpanded) minimizeGraph(false); }}
                        forceExpandDepth={forceDirectoryDepth}
                        activePath={directoryPreviewIds?.size ? null : activePost?.address ?? null}
                        getPercentile={getPercentile}
                        collapseSignal={dirCollapseGen}
                        accentColor={rootColorMap.get(node.path.split('//')[0]) ?? ROOT_NEUTRAL}
                        onPathPreview={setPreviewPath}
                        onPathPick={path => setDirectoryScope(directoryScope === path ? null : path)}
                        relativeSize={Math.max(1, node.childCount + (node.concept ? 1 : 0)) / maxBranchSize}
  
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })()}
      </Section>
      </>

    </>
  );

  return (
    <>
      {/* Mobile toggle button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed bottom-4 right-4 z-40 w-11 h-11 rounded-full bg-violet-500/90 text-th-on-accent shadow-lg flex items-center justify-center active:scale-95 transition-transform"
        aria-label="Open Wiki Console"
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
            ref={drawerRef}
            className={`absolute left-0 top-0 bottom-0 w-72 max-w-[85vw] flex flex-col overflow-hidden transition-transform duration-250 ease-out ${drawerVisible ? 'translate-x-0' : '-translate-x-full'}`}
            style={{ backgroundColor: 'var(--hub-sidebar-bg)' }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Header with close */}
            <div className="px-3 py-3 border-b border-th-hub-border flex-shrink-0">
              <div className="flex items-center justify-between">
                <Link to={secondBrainPath()} className="group flex items-center gap-1.5" onClick={() => setMobileOpen(false)}>
                  <WikiBrainIcon className="text-violet-400 group-hover:text-violet-300 transition-colors" size={15} />
                  <span><span className="text-[11px] lowercase tracking-wide font-semibold text-violet-400 group-hover:text-violet-300 transition-colors">wiki</span>{' '}
                  <span className="text-[11px] lowercase tracking-wide text-th-muted font-normal">console</span></span>
                </Link>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setGuideOpen(true)}
                    className="text-violet-400 hover:text-violet-300 transition-colors flex-shrink-0 leading-[0]"
                    title="How the Wiki works"
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
              <div className="mt-1 text-right text-[9px] text-th-muted">{stats.totalConcepts} concepts</div>
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
        className="hidden md:flex flex-col fixed top-12 h-[calc(100vh-3rem)] border-r border-th-hub-border overflow-hidden"
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
            <Link
              to={secondBrainPath()}
              className="group flex items-center gap-1.5"
              onClick={() => { if (graphExpanded) minimizeGraph(true); }}
            >
              <WikiBrainIcon className="text-violet-400 group-hover:text-violet-300 transition-colors" size={14} />
              <span><span className="text-[11px] lowercase tracking-wide font-semibold text-violet-400 group-hover:text-violet-300 transition-colors">wiki</span>{' '}
              <span className="text-[11px] lowercase tracking-wide text-th-muted font-normal">console ({stats.totalConcepts})</span></span>
            </Link>
            <button
              onClick={() => setGuideOpen(true)}
              className="text-violet-400 hover:text-violet-300 transition-colors flex-shrink-0 leading-[0]"
              title="How the Wiki works"
            >
              <InfoIcon size={11} />
            </button>
          </div>
        </div>
        {/* Scrollable sections */}
        <div className="flex-1 overflow-y-auto thin-scrollbar hub-scrollbar">
          {sections}
        </div>
      </aside>

      {graphExpanded && createPortal(
        <div
          className={`fixed bottom-0 right-0 top-12 z-[60] overflow-hidden border-l border-th-hub-border bg-th-base transition-[opacity,transform,border-radius] duration-500 ease-[cubic-bezier(.22,1,.36,1)] ${graphExpandedVisible ? 'opacity-100 scale-100 rounded-none' : 'pointer-events-none opacity-0 scale-[.12] rounded-xl'}`}
          style={{ left: SIDEBAR_WIDTH + SECOND_BRAIN_SIDEBAR_WIDTH, transformOrigin: '0 24%' }}
          role="region"
          aria-label="Expanded Wiki graph"
        >
          <Suspense fallback={<div className="grid h-full place-items-center text-[10px] text-th-muted animate-pulse">Loading graph…</div>}>
            <MiniGraph
              expanded
              resultIds={graphHighlightIds}
              previewIds={transientGraphHighlightIds}
              searchQuery={hub.query}
              cameraFocusIds={previewPathCameraIds ?? previewRootIds ?? calendarPreviewIds ?? wikiLinkCameraIds}
              cameraAnchorIds={previewPathIds ?? previewRootIds ?? calendarPreviewIds ?? wikiLinkHighlightIds}
              colorMode={graphColorMode}
              activeRoot={scopedRoot}
              onAreaPreview={setMiniAreaIds}
              onMinimize={() => minimizeGraph()}
              activeNodeId={graphSelectionCleared ? null : activePost?.id ?? null}
              onNodeSelect={node => { setGraphSelectionCleared(false); minimizeGraph(false); openGraphNode(node); }}
              onNodeOpen={node => { setGraphSelectionCleared(false); minimizeGraph(false); window.setTimeout(() => navigate(secondBrainPath(node.id)), 220); }}
            />
          </Suspense>
          <div className={`group absolute left-20 right-20 top-3 z-[65] mx-auto max-w-2xl border border-th-hub-border bg-th-base/90 font-mono shadow-lg transition-opacity duration-500 focus-within:opacity-100 hover:opacity-100 ${graphInput ? 'opacity-90' : 'opacity-[.14]'}`}>
            <div className="flex h-9 items-center gap-2 px-3"><span className="text-violet-400">⌕</span><input ref={graphSearchInputRef} value={graphInput} onChange={event => { setGraphInput(event.target.value); setGraphSelectionCleared(true); setQuery(event.target.value); }} placeholder="search wiki…" autoComplete="off" spellCheck={false} className="min-w-0 flex-1 cursor-text bg-transparent text-[12px] text-th-primary outline-none placeholder:text-th-muted" />{graphStateReadout}{(hasActiveFilters || directoryScope) && <button type="button" onClick={() => { resetFilters(); setDirectoryScope(null); }} className="flex-none border-l border-th-hub-border pl-2 text-[8px] uppercase tracking-[.08em] text-amber-400 transition-colors hover:text-amber-300" title="Clear active filters, keep search">reset filters</button>}{graphInput && <button type="button" onClick={() => { setGraphInput(''); setGraphSelectionCleared(true); setQuery(''); }} className="text-th-muted hover:text-th-primary">×</button>}</div>
            <div className="grid grid-cols-4 gap-px border-t border-th-hub-border bg-th-hub-border p-px">{([['name', 'name'], ['content', 'content'], ['backlinks', 'referenced by'], ['all', 'all']] as Array<[SearchMode, string]>).map(([mode, label]) => <button key={mode} type="button" onClick={() => setSearchMode(mode)} className={`bg-th-base px-2 py-1.5 text-[9px] transition-colors ${searchMode === mode ? 'bg-violet-400/10 text-violet-400' : 'text-th-muted hover:bg-th-surface hover:text-th-secondary'}`}>{label}</button>)}</div>
          </div>
        </div>,
        document.body,
      )}

      <SecondBrainGuide isOpen={guideOpen} onClose={() => setGuideOpen(false)} isLocalhost={isLocalhost} />
    </>
  );
};
