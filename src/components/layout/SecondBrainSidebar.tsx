// Second Brain Manager Sidebar — data exploration dashboard for /second-brain* routes

import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useHub } from '../../contexts/SecondBrainHubContext';
import {
  ChevronIcon,
  FolderIcon,
  BarChartIcon,
  SlidersIcon,
  CloseIcon,
  IslandIcon,
} from '../icons';
import { InfoPopover, tipStrong, tipAccent, tipCode } from '../InfoPopover';
import { IslandDetector, type IslandDetectorHandle } from '../IslandDetector';
import { useGraphRelevance } from '../../hooks/useGraphRelevance';
import { SIDEBAR_WIDTH, SECOND_BRAIN_SIDEBAR_WIDTH } from '../../constants/layout';
import type { FieldNoteMeta } from '../../types';
import type { TreeNode, FilterState } from '../../hooks/useSecondBrainHub';

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
}> = ({ node, depth = 0, activeScope, onScope, onConceptClick, forceExpanded = false, activePath, getPercentile }) => {
  const [expanded, setExpanded] = useState(false);
  const hasChildren = node.children.length > 0;
  // Auto-expand if active note is inside this node's subtree
  const isOnActivePath = !!(activePath && hasChildren && (activePath === node.path || activePath.startsWith(node.path + '//')));
  const isExpanded = forceExpanded || expanded || isOnActivePath;
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
            onClick={() => setExpanded(!isExpanded)}
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
            {hasBeenExpanded && node.children
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
                  activePath={activePath}
                  getPercentile={getPercentile}
                />
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

// --- Sidebar header help content ---
const HEADER_INFO_CONTENT = (
  <div className="space-y-2.5">
    <p>A <strong className={tipStrong}>knowledge graph</strong> for exploring interconnected concepts. Each card is a note; links between them form a navigable web.</p>
    <p><strong className={tipStrong}>Just start typing</strong> — any key opens the search. Results filter live as you type.</p>
    <p><span className="text-blue-400">Blue</span> = visited this session. <span className={tipAccent}>Purple</span> = not yet visited. Tracked across the grid, links, and graph.</p>
    <p>The <strong className={tipStrong}>sidebar sections</strong> below show different views of the same data — each has its own <span className={tipAccent}>?</span> with details.</p>
    <p>Use the theme button in the header — or <code className={tipCode}>Shift+T</code> on desktop — to toggle light / dark.</p>
  </div>
);

// --- Main Sidebar ---
export const SecondBrainSidebar: React.FC = () => {
  const hub = useHub();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [drawerMounted, setDrawerMounted] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const { getPercentile, getIslands } = useGraphRelevance();

  // Animate drawer open/close
  useEffect(() => {
    if (mobileOpen) {
      setDrawerMounted(true);
      const id = setTimeout(() => setDrawerVisible(true), 20);
      return () => clearTimeout(id);
    } else {
      setDrawerVisible(false);
      const id = setTimeout(() => setDrawerMounted(false), 250);
      return () => clearTimeout(id);
    }
  }, [mobileOpen]);

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
    filterState, setFilterState,
    directoryScope, setDirectoryScope,
    directoryQuery, setDirectoryQuery,
    filteredTree,
    stats,
    allFieldNotes,
    backlinksMap,
    signalDirectoryNav,
    activePost,
  } = hub;

  const handleScope = (path: string) => {
    // Toggle: clicking already-scoped folder clears scope
    setDirectoryScope(directoryScope === path ? null : path);
  };

  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setFilterState(prev => ({ ...prev, [key]: value }));
  };

  const sections = (
    <>
      {/* Graph Stats — always global */}
      <Section
        title="graph stats"
        icon={<BarChartIcon />}
        defaultOpen={false}
        headerAction={
          <InfoPopover
            size={13}
            title="What each stat means"
            content={
              <div className="space-y-2">
                <p><strong className={tipStrong}>Concepts</strong> — total number of notes in the knowledge base.</p>
                <p><strong className={tipStrong}>Links</strong> — total references between notes (wiki-links in the body + explicit interactions).</p>
                <p><strong className={tipStrong}>Orphans</strong> — notes with zero connections to anything.</p>
                <p><strong className={tipStrong}>Avg refs</strong> — average number of links per note.</p>
                <p><strong className={tipStrong}>Max depth</strong> — deepest level in the naming tree (e.g. <code className={tipCode}>chip//MCU//ARM</code> = depth 3).</p>
                <p><strong className={tipStrong}>Density</strong> — how interconnected the graph is. 100% would mean every note links to every other note.</p>
              </div>
            }
          />
        }
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
      <Section
        title="topology"
        icon={<IslandIcon />}
        defaultOpen={true}
        forceOpen={topologyFocus != null}
        headerAction={
          <span className="flex items-center gap-1.5">
            <InfoPopover
              size={13}
              title="Topology overview"
              content={
                <div className="space-y-2">
                  <p>Topology groups notes by <strong className={tipStrong}>actual connections</strong> (wiki-links and interactions) — not by their name or folder. Two notes in the same directory folder can belong to different islands if they aren't linked.</p>
                  <p><strong className={tipStrong}>Islands</strong> — clusters of notes reachable from each other through links. Each gets a <span className={tipAccent}>#ID</span>.</p>
                  <p><strong className={tipStrong}>Bridges</strong> (⚡) — notes that hold an island together. Remove one and the cluster splits into separate groups.</p>
                  <p><strong className={tipStrong}>Orphans</strong> (○) — notes with zero connections to anything.</p>
                  <p><strong className={tipStrong}>Tap the chevron</strong> next to any component to see all its members.</p>
                  <p><strong className={tipStrong}>Island badge</strong> — in note detail, each note shows its island <span className={tipAccent}>#ID</span>. Click to scroll here.</p>
                </div>
              }
            />
            {topologyHasExpanded && (
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
            )}
          </span>
        }
      >
        <IslandDetector
          ref={islandRef}
          focusComponentId={topologyFocus?.id ?? null}
          focusFlash={topologyFocus?.flash ?? false}
          onFocusHandled={() => setTopologyFocus(null)}
          activeIslandScope={filterState.islandId}
          onIslandScope={(id) => updateFilter('islandId', filterState.islandId === id ? null : id)}
          onExpandedChange={setTopologyHasExpanded}
        />
      </Section>

      {/* Directory Tree */}
      <Section
        title="directory"
        icon={<FolderIcon />}
        defaultOpen={true}
        headerAction={
          <InfoPopover
            size={13}
            title="Directory tree"
            content={
              <div className="space-y-2">
                <p>The directory organizes notes by their <strong className={tipStrong}>address</strong> — a naming path using <code className={tipCode}>//</code> as separator (e.g. <code className={tipCode}>chip//MCU//ARM</code>). This is the note's position in a <em>naming hierarchy</em>, independent of which notes it links to.</p>
                <p><strong className={tipStrong}>Scope</strong> — select a folder name (or the ⊙ icon) to filter the grid to only notes within that branch.</p>
                <p><strong className={tipStrong}>Auto-expand</strong> — when you open a note, its branch auto-expands here.</p>
                <p><strong className={tipStrong}>Filter tree</strong> — type in the input above to narrow by name.</p>
                <p><strong className={tipStrong}>Centrality bars</strong> — small bars on the right show each note's relative importance based on how many links it has.</p>
              </div>
            }
          />
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
          const withChildren = filteredTree.filter(n => n.children.length > 0);
          const leaves = filteredTree.filter(n => n.children.length === 0);
          return (
            <div>
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
                <InfoPopover size={15} content={HEADER_INFO_CONTENT} title="How Second Brain works" />
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
          <InfoPopover size={15} content={HEADER_INFO_CONTENT} title="How Second Brain works" className="mt-0.5" />
        </div>
        {/* Scrollable sections */}
        <div className="flex-1 overflow-y-auto thin-scrollbar hub-scrollbar">
          {sections}
        </div>
      </aside>
    </>
  );
};
