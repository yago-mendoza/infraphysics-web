// Second Brain Manager Sidebar — data exploration dashboard for /second-brain* routes

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useHub } from '../../contexts/SecondBrainHubContext';
import {
  ChevronIcon,
  FolderIcon,
  BarChartIcon,
  SlidersIcon,
  CloseIcon,
  InfoIcon,
  IslandIcon,
} from '../icons';
import { IslandDetector, type IslandDetectorHandle } from '../IslandDetector';
import { useGraphRelevance } from '../../hooks/useGraphRelevance';
import { SECOND_BRAIN_SIDEBAR_WIDTH } from '../../constants/layout';
import { noteLabel } from '../../types';
import type { FieldNoteMeta } from '../../types';
import type { TreeNode, FilterState } from '../../hooks/useSecondBrainHub';

type StatsScope = null | { type: 'directory'; path: string } | { type: 'island'; id: number };

/** Compute stats for a subset of notes. Links only counted when both ends are in the subset. */
function computeScopedStats(
  notes: FieldNoteMeta[],
  backlinksMap: Map<string, FieldNoteMeta[]>,
) {
  const idSet = new Set(notes.map(n => n.id));
  const totalConcepts = notes.length;
  let totalLinks = 0;
  notes.forEach(n => {
    (n.references || []).forEach(ref => { if (idSet.has(ref)) totalLinks++; });
  });
  const linkedToSet = new Set<string>();
  notes.forEach(n => {
    (n.references || []).forEach(ref => { if (idSet.has(ref)) linkedToSet.add(ref); });
  });
  const orphanCount = notes.filter(n => {
    const hasOutgoing = (n.references || []).some(ref => idSet.has(ref));
    const hasIncoming = linkedToSet.has(n.id);
    return !hasOutgoing && !hasIncoming;
  }).length;
  const avgRefs = totalConcepts > 0 ? Math.round((totalLinks / totalConcepts) * 10) / 10 : 0;
  const maxDepth = notes.reduce((max, n) => {
    const d = (n.addressParts || [n.title]).length;
    return d > max ? d : max;
  }, 0);
  const possibleConnections = totalConcepts * (totalConcepts - 1);
  const density = possibleConnections > 0
    ? Math.round((totalLinks / possibleConnections) * 1000) / 10
    : 0;
  let mostConnectedHub: FieldNoteMeta | null = null;
  let maxConnections = 0;
  notes.forEach(n => {
    const outgoing = (n.references || []).filter(ref => idSet.has(ref)).length;
    const incoming = (backlinksMap.get(n.id) || []).filter(bl => idSet.has(bl.id)).length;
    const total = outgoing + incoming;
    if (total > maxConnections) { maxConnections = total; mostConnectedHub = n; }
  });
  return { totalConcepts, totalLinks, orphanCount, avgRefs, maxDepth, density, mostConnectedHub };
}

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
  return (
    <div className="border-b border-th-hub-border">
      <button
        onClick={() => setOpen(!isOpen)}
        className="w-full flex items-center gap-1.5 px-3 py-2 text-[10px] uppercase tracking-wider text-th-tertiary hover:text-th-secondary transition-colors"
      >
        <span className="text-th-muted">{icon}</span>
        <span className="flex-1 text-left">{title}</span>
        {headerAction && isOpen && (
          <span className="flex-shrink-0" onClick={(e) => e.stopPropagation()}>{headerAction}</span>
        )}
        <ChevronIcon isOpen={isOpen} />
      </button>
      {isOpen && <div className="px-3 pb-3">{children}</div>}
    </div>
  );
};

// --- StepperInput ---
const StepperInput: React.FC<{
  value: number;
  displayValue?: string;
  onDecrement: () => void;
  onIncrement: () => void;
  min?: number;
  max?: number;
}> = ({ value, displayValue, onDecrement, onIncrement, min = -Infinity, max = Infinity }) => {
  return (
    <span className="inline-flex items-center border border-th-hub-border text-[10px] tabular-nums">
      <button
        onClick={onDecrement}
        disabled={value <= min}
        className="px-1 py-0.5 text-th-muted hover:text-th-secondary disabled:opacity-30 transition-colors"
      >
        &minus;
      </button>
      <span className="px-1 py-0.5 text-th-primary min-w-[20px] text-center">
        {displayValue ?? value}
      </span>
      <button
        onClick={onIncrement}
        disabled={value >= max}
        className="px-1 py-0.5 text-th-muted hover:text-th-secondary disabled:opacity-30 transition-colors"
      >
        +
      </button>
    </span>
  );
};

// --- Scope Icon (for concept+folder nodes) ---
const ScopeIcon: React.FC<{ onClick: (e: React.MouseEvent) => void }> = ({ onClick }) => (
  <button
    onClick={onClick}
    className="opacity-0 group-hover:opacity-100 text-th-muted hover:text-violet-400 transition-all flex-shrink-0"
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

// --- Stats Scope Icon (for tree nodes) ---
const StatsScopeIcon: React.FC<{ onClick: (e: React.MouseEvent) => void }> = ({ onClick }) => (
  <button
    onClick={onClick}
    className="opacity-0 group-hover:opacity-100 text-th-muted hover:text-violet-400 transition-all flex-shrink-0"
    title="Show stats for this folder"
  >
    <BarChartIcon />
  </button>
);

// --- Tree Node ---
const TreeNodeItem: React.FC<{
  node: TreeNode;
  depth?: number;
  activeScope: string | null;
  onScope: (path: string) => void;
  onStatsScope?: (path: string) => void;
  onConceptClick?: () => void;
  forceExpanded?: boolean;
  activePath?: string | null;
  getPercentile?: (uid: string) => number;
}> = ({ node, depth = 0, activeScope, onScope, onStatsScope, onConceptClick, forceExpanded = false, activePath, getPercentile }) => {
  const [expanded, setExpanded] = useState(false);
  const hasChildren = node.children.length > 0;
  // Auto-expand if active note is inside this node's subtree
  const isOnActivePath = !!(activePath && hasChildren && (activePath === node.path || activePath.startsWith(node.path + '//')));
  const isExpanded = forceExpanded || expanded || isOnActivePath;
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
            onClick={() => setExpanded(!isExpanded)}
            className="w-3 h-3 flex items-center justify-center text-th-muted hover:text-th-secondary transition-colors flex-shrink-0"
          >
            <ChevronIcon isOpen={isExpanded} />
          </button>
        ) : (
          <span className="w-3 h-3 flex-shrink-0" />
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
              <span className="flex-1" />
              <CentralityBar pct={centralityPct} />
              {onStatsScope && <StatsScopeIcon onClick={(e) => { e.preventDefault(); onStatsScope(node.path); }} />}
              <ScopeIcon onClick={(e) => { e.preventDefault(); onScope(node.path); }} />
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
            {onStatsScope && <StatsScopeIcon onClick={(e) => { e.preventDefault(); onStatsScope(node.path); }} />}
          </>
        ) : (
          <span className="text-[11px] text-th-muted truncate flex-1">{displayLabel}</span>
        )}

      </div>

      {isExpanded && hasChildren && (
        <div>
          {node.children
            .sort((a, b) => a.label.localeCompare(b.label))
            .map(child => (
              <TreeNodeItem
                key={child.label}
                node={child}
                depth={depth + 1}
                activeScope={activeScope}
                onScope={onScope}
                onStatsScope={onStatsScope}
                onConceptClick={onConceptClick}
                forceExpanded={forceExpanded}
                activePath={activePath}
                getPercentile={getPercentile}
              />
            ))}
        </div>
      )}
    </div>
  );
};

// --- Guide Popup ---
const GUIDE_TABS = ['commands', 'breadcrumb', 'links', 'interactions', 'illustration', 'topology'] as const;

const GuideTabContent: React.FC<{ tab: number }> = ({ tab }) => {
  const cls = "space-y-3 text-[11px] text-th-secondary leading-relaxed";
  const strong = "text-th-primary";
  const accent = "text-violet-400";
  const code = "text-violet-400/80";

  switch (tab) {
    case 0: return (
      <div className={cls}>
        <p><strong className={strong}>Just start typing</strong> — any key opens the floating search overlay. Backspace too.</p>
        <p><strong className={strong}>Arrow keys</strong> — navigate the grid, move between search results, or step through graph zones in detail view.</p>
        <p><strong className={strong}>Enter</strong> — open the selected card, or close the search overlay (keeps query active).</p>
        <p><strong className={strong}>Escape</strong> — close the search overlay and clear the query.</p>
        <p><strong className={strong}>Ctrl+Shift+F</strong> — open search overlay directly.</p>
        <p><strong className={strong}>Shift+T</strong> — toggle light/dark theme.</p>
        <p><strong className={strong}>Unvisited filter</strong> — in the grid toolbar, hide cards you've already opened this session.</p>
        <p><span className="text-blue-400">Blue</span> = visited this session. <span className={accent}>Purple</span> = not yet. Tracked across grid, links, and graph.</p>
      </div>
    );
    case 1: return (
      <div className={cls}>
        <p>The <strong className={strong}>breadcrumb trail</strong> at the top tracks your navigation path through concepts.</p>
        <p><strong className={strong}>Click any crumb</strong> to jump back to that point in your trail.</p>
        <p><strong className={strong}>"all concepts"</strong> — the first crumb always returns you to the grid.</p>
        <p><strong className={strong}>Clicking a body link</strong> extends the trail — you can trace how you got somewhere.</p>
        <p><strong className={strong}>Clicking a grid card</strong> resets the trail (starts a new navigation path).</p>
        <p>When the trail gets long, it <strong className={strong}>collapses</strong> — older crumbs are hidden but still accessible.</p>
      </div>
    );
    case 2: return (
      <div className={cls}>
        <p className={`text-xs font-semibold ${accent} mb-1`}>Links ↓ <span className="font-normal text-th-muted">(outgoing)</span></p>
        <p>Wiki-links in a note's body point to other concepts. Clicking one opens that concept and extends your breadcrumb trail.</p>

        <div className="border-t border-th-hub-border my-3" />

        <p className={`text-xs font-semibold ${accent} mb-1`}>Mentioned ↑ <span className="font-normal text-th-muted">(incoming)</span></p>
        <p>Shown above the body — these are links <em>from other notes</em> that reference the current concept in their body text.</p>
        <p><span className="text-blue-400">Blue</span> = visited, <span className={accent}>purple</span> = not yet visited.</p>
      </div>
    );
    case 3: return (
      <div className={cls}>
        <p><strong className={strong}>Interactions</strong> are explicit relationships between concepts, defined as trailing refs at the bottom of a note.</p>
        <p>Each interaction has <strong className={strong}>annotation text</strong> that describes the relationship (e.g. "contrast", "depends on", "example of").</p>
        <p>They are <strong className={strong}>bilateral</strong> — if concept A has an interaction with B, it automatically appears on both sides.</p>
        <p>Interaction entries can contain <strong className={strong}>clickable links</strong> to navigate directly to the related concept.</p>
      </div>
    );
    case 4: return (
      <div className={cls}>
        <p>The <strong className={strong}>neighborhood graph</strong> (right column) shows the current concept's position in the address hierarchy.</p>
        <p>Addresses use <code className={code}>//</code> as hierarchy separator — <code className={code}>chip//MCU</code> is a child of <code className={code}>chip</code>.</p>
        <p>Three zones: <strong className={strong}>parent</strong> (above), <strong className={strong}>siblings</strong> (same level), <strong className={strong}>children</strong> (below). Each zone is clickable.</p>
        <p><strong className={strong}>Arrow keys</strong> navigate between zones when graph is focused.</p>
        <p><strong className={strong}>White bar</strong> = current concept. <span className="text-blue-400">Blue</span> = visited, <span className={accent}>purple</span> = unvisited.</p>
      </div>
    );
    case 5: return (
      <div className={cls}>
        <p>The <strong className={strong}>topology</strong> section (sidebar) shows graph structure — components, bridges, and orphans.</p>
        <p><strong className={strong}>Expand components</strong> — click the chevron next to a component to see all its member notes.</p>
        <p><strong className={strong}>Bridges</strong> (⚡) are articulation points — removing one would split a cluster. Expand a bridge to see which notes end up on each side.</p>
        <p><strong className={strong}>Orphans</strong> (○) are notes with no connections. Expand to see the full list.</p>
        <p><strong className={strong}>Island badge</strong> — in detail view, each note shows its island number. Click to scroll the sidebar to that component.</p>
        <p><strong className={strong}>Topology filters</strong> — in the filters section, use <span className={accent}>bridges only</span> to show only bridge notes, or the <span className={accent}>island</span> dropdown to filter by component.</p>
      </div>
    );
    default: return null;
  }
};

const GuidePopup: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState(0);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div
        className="relative max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto thin-scrollbar hub-scrollbar border border-th-hub-border rounded-sm p-5"
        style={{ backgroundColor: 'var(--hub-sidebar-bg)' }}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-th-muted hover:text-th-secondary transition-colors"
        >
          <CloseIcon />
        </button>

        <h2 className="text-sm font-semibold text-violet-400 mb-3">Tips</h2>

        <div className="flex gap-1 mb-4 flex-wrap">
          {GUIDE_TABS.map((label, i) => (
            <button
              key={label}
              onClick={() => setActiveTab(i)}
              className={`px-2 py-1 text-[10px] font-medium border rounded-sm transition-colors ${
                activeTab === i
                  ? 'bg-violet-400/20 text-violet-400 border-violet-400/30'
                  : 'text-th-muted border-th-hub-border hover:text-th-secondary'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <GuideTabContent tab={activeTab} />
      </div>
    </div>
  );
};

// --- Topology Island Filter ---
const TopologyIslandFilter: React.FC<{
  filterState: FilterState;
  updateFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
}> = ({ filterState, updateFilter }) => {
  const { getIslands, loaded } = useGraphRelevance();
  if (!loaded) return null;
  const islands = getIslands();
  if (!islands) return null;

  const significant = islands.components
    .filter(c => c.size > 1)
    .sort((a, b) => b.size - a.size);

  if (significant.length <= 1) return null;

  return (
    <div className="flex items-center gap-1.5 text-[10px] text-th-muted">
      <span>island</span>
      <select
        value={filterState.islandId ?? ''}
        onChange={(e) => {
          const val = e.target.value;
          updateFilter('islandId', val === '' ? null : Number(val));
        }}
        className="bg-th-surface border border-th-hub-border text-[10px] text-th-primary px-1 py-0.5 focus:outline-none focus:border-th-border-active"
      >
        <option value="">all</option>
        {significant.map(c => (
          <option key={c.id} value={c.id}>
            #{c.id} ({c.size} notes)
          </option>
        ))}
      </select>
    </div>
  );
};

// --- Main Sidebar ---
export const SecondBrainSidebar: React.FC = () => {
  const hub = useHub();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const { getPercentile, getIslands } = useGraphRelevance();
  const [statsScope, setStatsScope] = useState<StatsScope>(null);

  // Island detector ref for collapse-all button in header
  const islandRef = useRef<IslandDetectorHandle>(null);
  const [topologyHasExpanded, setTopologyHasExpanded] = useState(false);

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
    filterState, setFilterState, hasActiveFilters, resetFilters,
    directoryScope, setDirectoryScope,
    directoryQuery, setDirectoryQuery,
    filteredTree,
    stats,
    allFieldNotes,
    backlinksMap,
    signalDirectoryNav,
    activePost,
  } = hub;

  // Scoped stats computation
  const scopedStats = useMemo(() => {
    if (!statsScope) return stats;
    if (statsScope.type === 'directory') {
      const subset = allFieldNotes.filter(n => n.address.startsWith(statsScope.path));
      return computeScopedStats(subset, backlinksMap);
    }
    if (statsScope.type === 'island') {
      const islands = getIslands();
      if (!islands) return stats;
      const comp = islands.components.find(c => c.id === statsScope.id);
      if (!comp) return stats;
      const memberSet = new Set(comp.members);
      const subset = allFieldNotes.filter(n => memberSet.has(n.id));
      return computeScopedStats(subset, backlinksMap);
    }
    return stats;
  }, [statsScope, stats, allFieldNotes, backlinksMap, getIslands]);

  // Bonus stats for scoped views
  const bonusStats = useMemo(() => {
    if (!statsScope) return null;
    if (statsScope.type === 'island') {
      const islands = getIslands();
      if (!islands) return null;
      const comp = islands.components.find(c => c.id === statsScope.id);
      if (!comp) return null;
      const bridges = islands.cuts.filter(c => c.componentId === comp.id).length;
      const hubName = scopedStats.mostConnectedHub ? noteLabel(scopedStats.mostConnectedHub) : '—';
      return { type: 'island' as const, bridges, hub: hubName };
    }
    if (statsScope.type === 'directory') {
      // Count direct child paths at next depth level
      const prefix = statsScope.path + '//';
      const childSegments = new Set<string>();
      allFieldNotes.forEach(n => {
        if (n.address.startsWith(prefix)) {
          const rest = n.address.slice(prefix.length);
          const seg = rest.split('//')[0];
          if (seg) childSegments.add(seg);
        }
      });
      return { type: 'directory' as const, subtrees: childSegments.size };
    }
    return null;
  }, [statsScope, getIslands, scopedStats.mostConnectedHub, allFieldNotes]);

  const handleStatsScope = (scope: StatsScope) => {
    setStatsScope(scope);
  };

  const handleScope = (path: string) => {
    // Toggle: clicking already-scoped folder clears scope
    setDirectoryScope(directoryScope === path ? null : path);
  };

  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setFilterState(prev => ({ ...prev, [key]: value }));
  };

  // Format scope path for display: "LAPTOP // UI" → "LAPTOP / UI"
  const scopeDisplay = directoryScope ? directoryScope.replace(/\/\//g, ' / ') : null;

  const sections = (
    <>
      {/* Filters */}
      <Section
        title="filters"
        icon={<SlidersIcon />}
        defaultOpen={false}
        forceOpen={hasActiveFilters}
        headerAction={hasActiveFilters ? (
          <button
            onClick={resetFilters}
            className="text-[9px] text-th-muted hover:text-violet-400 transition-colors"
          >
            reset
          </button>
        ) : undefined}
      >
        <div className="space-y-2">
          <div className="flex gap-1 flex-wrap">
            <button
              onClick={() => updateFilter('orphans', !filterState.orphans)}
              className={`text-[9px] px-1.5 py-0.5 transition-colors ${
                filterState.orphans
                  ? 'bg-violet-400/20 text-violet-400 border border-violet-400/30'
                  : 'text-th-muted border border-th-hub-border hover:text-th-secondary hover:border-th-border-hover'
              }`}
            >
              orphans
            </button>
            <button
              onClick={() => updateFilter('leaf', !filterState.leaf)}
              className={`text-[9px] px-1.5 py-0.5 transition-colors ${
                filterState.leaf
                  ? 'bg-violet-400/20 text-violet-400 border border-violet-400/30'
                  : 'text-th-muted border border-th-hub-border hover:text-th-secondary hover:border-th-border-hover'
              }`}
            >
              leaf nodes
            </button>
            <button
              onClick={() => updateFilter('bridgesOnly', !filterState.bridgesOnly)}
              className={`text-[9px] px-1.5 py-0.5 transition-colors ${
                filterState.bridgesOnly
                  ? 'bg-amber-400/20 text-amber-400 border border-amber-400/30'
                  : 'text-th-muted border border-th-hub-border hover:text-th-secondary hover:border-th-border-hover'
              }`}
            >
              bridges only
            </button>
          </div>

          <TopologyIslandFilter filterState={filterState} updateFilter={updateFilter} />

          <div className="flex items-center gap-1.5 text-[10px] text-th-muted">
            <span>depth</span>
            <StepperInput
              value={filterState.depthMin}
              onDecrement={() => updateFilter('depthMin', Math.max(1, filterState.depthMin - 1))}
              onIncrement={() => updateFilter('depthMin', filterState.depthMin + 1)}
              min={1}
            />
            <span>to</span>
            <StepperInput
              value={filterState.depthMax}
              displayValue={filterState.depthMax === Infinity ? '\u221e' : String(filterState.depthMax)}
              onDecrement={() => updateFilter('depthMax', filterState.depthMax === Infinity ? stats.maxDepth : Math.max(1, filterState.depthMax - 1))}
              onIncrement={() => {
                if (filterState.depthMax === Infinity) return;
                if (filterState.depthMax >= stats.maxDepth) {
                  updateFilter('depthMax', Infinity);
                } else {
                  updateFilter('depthMax', filterState.depthMax + 1);
                }
              }}
            />
          </div>

          <div className="flex items-center gap-1.5 text-[10px] text-th-muted">
            <span>hubs &ge;</span>
            <StepperInput
              value={filterState.hubThreshold}
              onDecrement={() => updateFilter('hubThreshold', Math.max(0, filterState.hubThreshold - 1))}
              onIncrement={() => updateFilter('hubThreshold', filterState.hubThreshold + 1)}
              min={0}
            />
            {filterState.hubThreshold === 0 && (
              <span className="text-[9px] text-th-muted">off</span>
            )}
          </div>

          {/* Scope indicators */}
          {(directoryScope || filterState.islandId != null) && (
            <div className="border-t border-th-hub-border pt-2 space-y-1">
              {directoryScope && (
                <div className="flex items-center gap-1 px-1 py-1 bg-violet-400/10 border border-violet-400/20 text-[9px]">
                  <span className="text-th-muted">scope:</span>
                  <span className="text-violet-400 truncate flex-1">{scopeDisplay}</span>
                  <button
                    onClick={() => setDirectoryScope(null)}
                    className="text-th-muted hover:text-th-secondary flex-shrink-0"
                  >
                    &times;
                  </button>
                </div>
              )}
              {filterState.islandId != null && (
                <div className="flex items-center gap-1 px-1 py-1 bg-violet-400/10 border border-violet-400/20 text-[9px]">
                  <span className="text-th-muted">island:</span>
                  <span className="text-violet-400 truncate flex-1">#{filterState.islandId}</span>
                  <button
                    onClick={() => updateFilter('islandId', null)}
                    className="text-th-muted hover:text-th-secondary flex-shrink-0"
                  >
                    &times;
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </Section>

      {/* Stats */}
      <Section title="stats" icon={<BarChartIcon />} defaultOpen={false} forceOpen={statsScope != null}>
        {statsScope && (
          <div className="flex items-center gap-1 px-1 py-1 mb-2 bg-violet-400/10 border border-violet-400/20 text-[9px]">
            <span className="text-th-muted">stats:</span>
            <span className="text-violet-400 truncate flex-1">
              {statsScope.type === 'directory'
                ? statsScope.path.replace(/\/\//g, ' / ')
                : `island #${statsScope.id}`}
            </span>
            <button
              onClick={() => setStatsScope(null)}
              className="text-th-muted hover:text-th-secondary flex-shrink-0"
            >
              &times;
            </button>
          </div>
        )}
        <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
          <div>
            <div className="text-[9px] text-th-muted">concepts</div>
            <div className="text-[11px] text-th-primary tabular-nums">{scopedStats.totalConcepts}</div>
          </div>
          <div>
            <div className="text-[9px] text-th-muted">links</div>
            <div className="text-[11px] text-th-primary tabular-nums">{scopedStats.totalLinks}</div>
          </div>
          <div>
            <div className="text-[9px] text-th-muted">orphans</div>
            <div className="text-[11px] text-th-primary tabular-nums">{scopedStats.orphanCount}</div>
          </div>
          <div>
            <div className="text-[9px] text-th-muted">avg refs</div>
            <div className="text-[11px] text-th-primary tabular-nums">{scopedStats.avgRefs}</div>
          </div>
          <div>
            <div className="text-[9px] text-th-muted">max depth</div>
            <div className="text-[11px] text-th-primary tabular-nums">{scopedStats.maxDepth}</div>
          </div>
          <div>
            <div className="text-[9px] text-th-muted">density</div>
            <div className="text-[11px] text-th-primary tabular-nums">{scopedStats.density}%</div>
          </div>
        </div>
        {bonusStats && (
          <div className="border-t border-th-hub-border mt-2 pt-2 grid grid-cols-2 gap-x-3 gap-y-1.5">
            {bonusStats.type === 'island' && (
              <>
                <div>
                  <div className="text-[9px] text-th-muted">bridges</div>
                  <div className="text-[11px] text-th-primary tabular-nums">{bonusStats.bridges}</div>
                </div>
                <div>
                  <div className="text-[9px] text-th-muted">hub</div>
                  <div className="text-[11px] text-th-primary truncate">{bonusStats.hub}</div>
                </div>
              </>
            )}
            {bonusStats.type === 'directory' && (
              <div>
                <div className="text-[9px] text-th-muted">subtrees</div>
                <div className="text-[11px] text-th-primary tabular-nums">{bonusStats.subtrees}</div>
              </div>
            )}
          </div>
        )}
      </Section>

      {/* Topology */}
      <Section
        title="topology"
        icon={<IslandIcon />}
        defaultOpen={true}
        forceOpen={topologyFocus != null}
        headerAction={topologyHasExpanded ? (
          <button
            onClick={() => islandRef.current?.collapseAll()}
            className="text-th-muted hover:text-th-secondary transition-colors"
            title="Collapse all"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" x2="18" y1="15" y2="15" />
              <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
              <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
            </svg>
          </button>
        ) : undefined}
      >
        <IslandDetector
          ref={islandRef}
          focusComponentId={topologyFocus?.id ?? null}
          focusFlash={topologyFocus?.flash ?? false}
          onFocusHandled={() => setTopologyFocus(null)}
          activeIslandScope={filterState.islandId}
          onIslandScope={(id) => updateFilter('islandId', filterState.islandId === id ? null : id)}
          onStatsScope={(id) => handleStatsScope({ type: 'island', id })}
          onExpandedChange={setTopologyHasExpanded}
        />
      </Section>

      {/* Directory Tree */}
      <Section title="directory" icon={<FolderIcon />} defaultOpen={true}>
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
          const withChildren = filteredTree.filter(n => n.children.length > 0);
          const leaves = filteredTree.filter(n => n.children.length === 0);
          return (
            <div className="max-h-60 overflow-y-auto thin-scrollbar hub-scrollbar">
              {withChildren.length > 0 && (
                <div className="space-y-0.5">
                  {withChildren.map(node => (
                    <TreeNodeItem
                      key={node.label}
                      node={node}
                      activeScope={directoryScope}
                      onScope={handleScope}
                      onStatsScope={(path) => handleStatsScope({ type: 'directory', path })}
                      onConceptClick={signalDirectoryNav}
                      forceExpanded={directoryQuery.length > 0}
                      activePath={activePost?.address ?? null}
                      getPercentile={getPercentile}
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
                        getPercentile={getPercentile}
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
  );

  return (
    <>
      {/* Mobile toggle button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed bottom-4 right-4 z-40 w-10 h-10 rounded-full bg-violet-500/90 text-th-on-accent shadow-lg flex items-center justify-center active:scale-95 transition-transform"
        aria-label="Open manager sidebar"
      >
        <SlidersIcon />
      </button>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-th-overlay"
            onClick={() => setMobileOpen(false)}
          />
          <aside
            className="absolute left-0 top-0 bottom-0 w-72 flex flex-col overflow-hidden"
            style={{ backgroundColor: 'var(--hub-sidebar-bg)' }}
          >
            {/* Header with close */}
            <div className="px-3 py-3 border-b border-th-hub-border flex-shrink-0 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div>
                  <div className="text-[11px] lowercase tracking-wide">
                    <span className="font-semibold text-violet-400">second brain</span>{' '}
                    <span className="text-th-muted font-normal">manager</span>
                  </div>
                  <div className="text-[9px] text-th-muted mt-0.5">
                    {stats.totalConcepts} concepts
                  </div>
                </div>
                <button
                  onClick={() => setGuideOpen(true)}
                  className="text-th-muted hover:text-violet-400 transition-colors"
                  title="How Second Brain works"
                >
                  <InfoIcon />
                </button>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-1 text-th-muted hover:text-th-secondary transition-colors"
                aria-label="Close sidebar"
              >
                <CloseIcon />
              </button>
            </div>
            {/* Scrollable sections */}
            <div className="flex-1 overflow-y-auto thin-scrollbar hub-scrollbar">
              {sections}
            </div>
          </aside>
        </div>
      )}

      {/* Guide popup */}
      {guideOpen && <GuidePopup onClose={() => setGuideOpen(false)} />}

      {/* Desktop sidebar */}
      <aside
        className="hidden md:flex flex-col sticky top-0 h-screen border-r border-th-hub-border overflow-hidden"
        style={{
          width: SECOND_BRAIN_SIDEBAR_WIDTH,
          minWidth: SECOND_BRAIN_SIDEBAR_WIDTH,
          backgroundColor: 'var(--hub-sidebar-bg)',
        }}
      >
        {/* Header */}
        <div className="px-3 py-3 border-b border-th-hub-border flex-shrink-0 flex items-start justify-between">
          <div>
            <div className="text-[11px] lowercase tracking-wide">
              <span className="font-semibold text-violet-400">second brain</span>{' '}
              <span className="text-th-muted font-normal">manager</span>
            </div>
            <div className="text-[9px] text-th-muted mt-0.5">
              {stats.totalConcepts} concepts
            </div>
          </div>
          <button
            onClick={() => setGuideOpen(true)}
            className="text-th-muted hover:text-violet-400 transition-colors mt-0.5"
            title="How Second Brain works"
          >
            <InfoIcon size={18} />
          </button>
        </div>
        {/* Scrollable sections */}
        <div className="flex-1 overflow-y-auto thin-scrollbar hub-scrollbar">
          {sections}
        </div>
      </aside>
    </>
  );
};
