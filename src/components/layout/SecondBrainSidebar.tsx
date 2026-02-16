// Second Brain Manager Sidebar — data exploration dashboard for /second-brain* routes

import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useHub } from '../../contexts/SecondBrainHubContext';
import {
  SearchIcon,
  ChevronIcon,
  FolderIcon,
  BarChartIcon,
  SlidersIcon,
  CloseIcon,
  InfoIcon,
  IslandIcon,
} from '../icons';
import { IslandDetector } from '../IslandDetector';
import { SECOND_BRAIN_SIDEBAR_WIDTH } from '../../constants/layout';
import type { TreeNode, SearchMode, FilterState } from '../../hooks/useSecondBrainHub';

// --- Collapsible Section ---
const Section: React.FC<{
  title: React.ReactNode;
  icon: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
}> = ({ title, icon, defaultOpen = true, children }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-th-hub-border">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-1.5 px-3 py-2 text-[10px] uppercase tracking-wider text-th-tertiary hover:text-th-secondary transition-colors"
      >
        <span className="text-th-muted">{icon}</span>
        <span className="flex-1 text-left">{title}</span>
        <ChevronIcon isOpen={open} />
      </button>
      {open && <div className="px-3 pb-3">{children}</div>}
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

// --- Tree Node ---
const TreeNodeItem: React.FC<{
  node: TreeNode;
  depth?: number;
  activeScope: string | null;
  onScope: (path: string) => void;
  onConceptClick?: () => void;
  forceExpanded?: boolean;
}> = ({ node, depth = 0, activeScope, onScope, onConceptClick, forceExpanded = false }) => {
  const [expanded, setExpanded] = useState(false);
  const hasChildren = node.children.length > 0;
  const isExpanded = forceExpanded || expanded;
  const isScoped = activeScope === node.path;
  const isConceptAndFolder = node.concept && hasChildren;
  const isRoot = depth === 0;
  const displayLabel = node.label.charAt(0).toUpperCase() + node.label.slice(1);

  return (
    <div>
      <div
        className={`flex items-center gap-1 py-0.5 group ${
          isScoped ? 'bg-violet-400/10' : ''
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
                className="text-[11px] text-th-secondary hover:text-violet-400 transition-colors truncate flex-1"
              >
                {displayLabel}
              </Link>
              <ScopeIcon onClick={(e) => { e.preventDefault(); onScope(node.path); }} />
            </>
          ) : (
            // Pure concept leaf: link to detail
            <Link
              to={`/lab/second-brain/${node.concept.id}`}
              onClick={onConceptClick}
              className="text-[11px] text-th-secondary hover:text-violet-400 transition-colors truncate flex-1"
            >
              {displayLabel}
            </Link>
          )
        ) : hasChildren ? (
          // Pure folder: click label to scope
          <button
            onClick={() => onScope(node.path)}
            className={`text-[11px] truncate flex-1 text-left transition-colors ${
              isScoped ? 'text-violet-400' : 'text-th-muted hover:text-th-secondary'
            }`}
          >
            {displayLabel}
          </button>
        ) : (
          <span className="text-[11px] text-th-muted truncate flex-1">{displayLabel}</span>
        )}

        {isRoot && !hasChildren ? (
          <span className="text-[8px] text-th-muted opacity-50 flex-shrink-0">Root node</span>
        ) : isRoot && hasChildren ? (
          <>
            <span className="text-[8px] text-th-muted opacity-50 flex-shrink-0">Root node</span>
            <span className="text-[9px] text-th-muted tabular-nums flex-shrink-0">{node.childCount}</span>
          </>
        ) : hasChildren ? (
          <span className="text-[9px] text-th-muted tabular-nums flex-shrink-0">{node.childCount}</span>
        ) : null}
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
                onConceptClick={onConceptClick}
                forceExpanded={forceExpanded}
              />
            ))}
        </div>
      )}
    </div>
  );
};

// --- Search Mode Chips ---
const SEARCH_MODES: { value: SearchMode; label: string }[] = [
  { value: 'name', label: 'name' },
  { value: 'content', label: 'content' },
  { value: 'backlinks', label: 'backlinks' },
];


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
        <p><strong className={strong}>Just start typing</strong> — any key focuses the search bar. Backspace too. No need to click it.</p>
        <p><strong className={strong}>Arrow keys</strong> — navigate the grid, move between search results, or step through graph zones in detail view.</p>
        <p><strong className={strong}>Enter</strong> — open the selected card or search result.</p>
        <p><strong className={strong}>Escape</strong> — clear search, close detail view, or dismiss popups.</p>
        <p><strong className={strong}>Ctrl+Shift+F</strong> — focus search bar directly.</p>
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
        <p>The <strong className={strong}>topology</strong> section (sidebar, below filters) shows the graph's structural fragility.</p>
        <p><strong className={strong}>Bridges</strong> (⚡) are articulation points — removing one would split a cluster into disconnected islands.</p>
        <p><strong className={strong}>Side sizes</strong> (e.g. 19 | 1) show how many notes end up on each side if the bridge is removed. Bridges are sorted by criticality.</p>
        <p><strong className={strong}>Click a bridge</strong> to navigate to that note.</p>
        <p><strong className={strong}>Orphans</strong> (○) are notes with no connections at all.</p>
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

// --- Main Sidebar ---
export const SecondBrainSidebar: React.FC = () => {
  const hub = useHub();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Type-to-search: any printable key focuses the search bar and starts typing
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        searchInputRef.current?.focus();
        return;
      }

      // Skip if already focused on an input/textarea, or if modifier keys are held
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      // Printable character or Backspace — focus search bar
      if (e.key.length === 1 || e.key === 'Backspace') {
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  if (!hub) return null;

  const {
    query, setQuery,
    searchMode, setSearchMode,
    filterState, setFilterState, hasActiveFilters, resetFilters,
    directoryScope, setDirectoryScope,
    directoryQuery, setDirectoryQuery,
    filteredTree,
    stats,
    signalDirectoryNav,
  } = hub;

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
      {/* Search */}
      <Section title={<>search <span className="normal-case tracking-normal text-th-muted text-[8px] opacity-40 font-normal">type anywhere to search</span></>} icon={<SearchIcon />} defaultOpen={true}>
        <div className="flex items-center border border-th-hub-border px-2 py-1.5 bg-th-surface focus-within:border-th-border-active transition-colors mb-2">
          <input
            ref={searchInputRef}
            type="text"
            placeholder={directoryScope ? `Search in ${directoryScope.replace(/\/\//g, ' / ')}...` : 'Search...'}
            value={query}
            onChange={(e) => {
              const val = e.target.value;
              setQuery(val);
              if (!val) searchInputRef.current?.blur();
            }}
            onKeyDown={(e) => { if (e.key === 'Escape') { setQuery(''); searchInputRef.current?.blur(); } }}
            className="w-full text-[11px] focus:outline-none placeholder-th-muted bg-transparent text-th-primary"
          />
          {query && (
            <button
              onClick={() => { setQuery(''); searchInputRef.current?.blur(); }}
              className="text-th-muted hover:text-th-secondary text-[10px] ml-1 flex-shrink-0"
            >
              &times;
            </button>
          )}
        </div>
        <div className="flex gap-1 flex-wrap">
          {SEARCH_MODES.map(mode => (
            <button
              key={mode.value}
              onClick={() => setSearchMode(mode.value)}
              className={`text-[9px] px-1.5 py-0.5 transition-colors ${
                searchMode === mode.value
                  ? 'bg-violet-400/20 text-violet-400 border border-violet-400/30'
                  : 'text-th-muted border border-th-hub-border hover:text-th-secondary hover:border-th-border-hover'
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </Section>

      {/* Stats */}
      <Section title="stats" icon={<BarChartIcon />} defaultOpen={false}>
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
            <div className="text-[9px] text-th-muted">orphans</div>
            <div className="text-[11px] text-th-primary tabular-nums">{stats.orphanCount}</div>
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
      </Section>

      {/* Topology */}
      <Section title="topology" icon={<IslandIcon />} defaultOpen={true}>
        <IslandDetector />
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

        {/* Scope indicator */}
        {directoryScope && (
          <div className="flex items-center gap-1 mb-2 px-1 py-1 bg-violet-400/10 border border-violet-400/20 text-[9px]">
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

        <div className="space-y-0.5 max-h-60 overflow-y-auto thin-scrollbar hub-scrollbar">
          {filteredTree.map(node => (
            <TreeNodeItem
              key={node.label}
              node={node}
              activeScope={directoryScope}
              onScope={handleScope}
              onConceptClick={signalDirectoryNav}
              forceExpanded={directoryQuery.length > 0}
            />
          ))}
        </div>
      </Section>

      {/* Filters */}
      <Section title="filters" icon={<SlidersIcon />} defaultOpen={false}>
        <div className="space-y-2">
          {/* Toggle chips */}
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
          </div>

          {/* Depth range */}
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

          {/* Hub threshold */}
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

          {/* Reset */}
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="text-[9px] text-th-muted hover:text-violet-400 transition-colors"
            >
              reset filters
            </button>
          )}
        </div>
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
