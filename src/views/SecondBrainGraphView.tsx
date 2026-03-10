// Second Brain — Graph Explorer View
// Full-screen force-directed graph with note preview panel

import React, {
  useState, useEffect, useRef, useCallback, useMemo,
  Suspense,
} from 'react';
import { createPortal } from 'react-dom';
import { Link, useSearchParams } from 'react-router-dom';
import { secondBrainPath } from '../config/categories';
import { InfoIcon } from '../components/icons';
import { initBrainIndex, fetchNoteContent, type BrainIndex } from '../lib/brainIndex';
import { useGraphRelevance } from '../hooks/useGraphRelevance';
import {
  buildGraphData,
  type GraphData, type GraphNode, type GraphLink,
  type EdgeVisibility, EDGE_COLORS,
  useFilteredGraph,
} from '../components/graph/useGraphData';
import {
  GraphControls,
  DEFAULT_SETTINGS,
  COLOR_MODE_LABELS,
  type GraphSettings,
  type ColorMode,
} from '../components/graph/GraphControls';
import type { FieldNoteMeta } from '../types';
import { parseHubFilters, applyHubFilters } from '../lib/filterParams';
import { SIDEBAR_WIDTH, MOBILE_NAV_HEIGHT } from '../constants/layout';
import '../styles/article.css';
import '../styles/wiki-content.css';

// Lazy-load force-graph components (large deps)
const ForceGraph2D = React.lazy(() => import('react-force-graph-2d'));
const ForceGraph3D = React.lazy(() => import('react-force-graph-3d'));

/** Display-friendly address: `//` → ` / ` */
const displayAddress = (addr: string) => addr.replace(/\/\//g, ' / ');

// ─── Graph Guide Modal ────────────────────────────────────────────────

const tipStrong = 'text-th-primary';
const tipAccent = 'text-violet-400';
const tipCode = 'bg-violet-500/10 text-violet-400/80 px-1 py-0.5 text-[11px] rounded-sm font-mono';

const GraphGuide: React.FC<{ isOpen: boolean; onClose: () => void; isMobile: boolean }> = ({ isOpen, onClose, isMobile }) => {
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') { e.stopPropagation(); onClose(); } };
    window.addEventListener('keydown', handler, true);
    return () => window.removeEventListener('keydown', handler, true);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40" />
      <div
        className="relative w-full max-w-lg max-h-[75vh] overflow-y-auto border border-violet-500/20 rounded-sm shadow-2xl p-5"
        style={{ backgroundColor: 'var(--hub-sidebar-bg)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-th-primary">Graph Explorer</h2>
          <button onClick={onClose} className="text-th-muted hover:text-th-secondary transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="space-y-4 text-[12px] text-th-secondary leading-relaxed">
          {isMobile ? (
            <>
              <div>
                <h3 className={'text-[11px] uppercase tracking-wider mb-1.5 ' + tipAccent}>Navigation</h3>
                <ul className="space-y-1">
                  <li><strong className={tipStrong}>Pinch</strong> — zoom in/out</li>
                  <li><strong className={tipStrong}>Drag</strong> — pan around the graph</li>
                  <li><strong className={tipStrong}>Tap a node</strong> — select it and open the preview panel</li>
                  <li><strong className={tipStrong}>Tap empty space</strong> — deselect</li>
                  <li><strong className={tipStrong}>Swipe right</strong> on the preview panel — dismiss it</li>
                </ul>
              </div>
              <div>
                <h3 className={'text-[11px] uppercase tracking-wider mb-1.5 ' + tipAccent}>Multi-selection</h3>
                <ul className="space-y-1">
                  <li>Activate <strong className={tipStrong}>selection mode</strong> with the dashed-rectangle button in the toolbar.</li>
                  <li><strong className={tipStrong}>Tap nodes</strong> — toggle them in/out of selection</li>
                  <li><strong className={tipStrong}>Drag on background</strong> — draw a selection rectangle (2D)</li>
                  <li>Selected nodes appear in <span className="text-cyan-400">cyan</span>. A prompt lets you copy their content or <strong className={tipStrong}>isolate</strong> them into a subgraph.</li>
                </ul>
              </div>
            </>
          ) : (
            <>
              <div>
                <h3 className={'text-[11px] uppercase tracking-wider mb-1.5 ' + tipAccent}>Navigation</h3>
                <ul className="space-y-1">
                  <li><strong className={tipStrong}>Scroll wheel</strong> — zoom in/out</li>
                  <li><strong className={tipStrong}>Middle mouse + drag</strong> — pan around the graph</li>
                  <li><strong className={tipStrong}>Click on a node</strong> — select it, view its content in the preview panel and its connections below the controls</li>
                  <li><strong className={tipStrong}>Click on empty space</strong> — deselect everything</li>
                  <li><strong className={tipStrong}>Hover on a node</strong> — highlights it and all connected nodes, dims the rest</li>
                </ul>
              </div>
              <div>
                <h3 className={'text-[11px] uppercase tracking-wider mb-1.5 ' + tipAccent}>Multi-selection</h3>
                <ul className="space-y-1">
                  <li><strong className={tipStrong}>Drag on background</strong> — draw a selection rectangle (2D)</li>
                  <li><strong className={tipStrong}>Ctrl + click</strong> — toggle individual nodes in/out of selection</li>
                  <li>Selected nodes appear in <span className="text-cyan-400">cyan</span> with their names always visible. A prompt appears to copy all their content as structured context for LLMs.</li>
                  <li><strong className={tipStrong}>Isolate cluster</strong> — with 2+ nodes selected, isolate them into their own subgraph. A breadcrumb at the top-right tracks depth. You can nest isolations and click breadcrumb levels to navigate back.</li>
                  <li><code className={tipCode}>Escape</code> — clear selection</li>
                </ul>
              </div>
            </>
          )}
          <div>
            <h3 className={'text-[11px] uppercase tracking-wider mb-1.5 ' + tipAccent}>Toolbar</h3>
            <ul className="space-y-1">
              <li><strong className={tipStrong}>Controls panel</strong> — toggle edge types, presets, sliders for node size, repulsion, link distance, labels.{!isMobile && <> Press <code className={tipCode}>C</code> to toggle.</>}</li>
              <li><strong className={tipStrong}>Crosshair button</strong> — zoom to fit the entire graph</li>
              <li><strong className={tipStrong}>Dice button</strong> — jump to a random note (in the preview panel header)</li>
              <li><strong className={tipStrong}>2D / 3D toggle</strong> — switch renderer. 3D uses WebGL spheres.</li>
            </ul>
          </div>
          <div>
            <h3 className={'text-[11px] uppercase tracking-wider mb-1.5 ' + tipAccent}>Search</h3>
            <ul className="space-y-1">
              <li>Type in the search box to filter nodes by name or address.</li>
              <li><strong className={tipStrong}>Primary matches</strong> (name contains the query) appear in <span className="text-amber-400">amber</span> with a bright outline.</li>
              <li><strong className={tipStrong}>Secondary matches</strong> (children via address) appear dimmer in <span className="text-orange-400">orange</span>.</li>
              {!isMobile && <li>Press <strong className={tipStrong}>Enter</strong> to center the camera on the first result.</li>}
            </ul>
          </div>
          <div>
            <h3 className={'text-[11px] uppercase tracking-wider mb-1.5 ' + tipAccent}>Edge colors</h3>
            <ul className="space-y-1">
              <li><span style={{ color: '#a78bfa' }}>Purple</span> — body references (wiki-links inside the note)</li>
              <li><span style={{ color: '#f472b6' }}>Pink</span> — interactions (trailing refs / contrasts)</li>
              <li><span style={{ color: '#60a5fa' }}>Blue</span> — hierarchy (parent → child)</li>
            </ul>
          </div>
          <div>
            <h3 className={'text-[11px] uppercase tracking-wider mb-1.5 ' + tipAccent}>Advanced parameters</h3>
            <ul className="space-y-1">
              <li><strong className={tipStrong}>Edge width</strong> — thickness of the lines connecting nodes. Hierarchy edges are drawn ~2× thicker.</li>
              <li><strong className={tipStrong}>Warmup</strong> — how many simulation steps run before the first frame renders. Higher values = the graph appears more settled on load, but takes longer.</li>
              <li><strong className={tipStrong}>Alpha decay</strong> — how fast the simulation cools down and stops moving. Lower = nodes keep adjusting longer. Higher = settles quickly but may look cramped.</li>
              <li><strong className={tipStrong}>Gravity</strong> — pulls all nodes toward the center. Higher values bring isolated clusters closer together; 0 lets them drift freely.</li>
              <li><strong className={tipStrong}>Damping</strong> — friction on node movement. Low damping = nodes coast further (fluid, slower to settle). High damping = nodes stop almost immediately (snappy, tighter layout).</li>
            </ul>
          </div>
          <div>
            <h3 className={'text-[11px] uppercase tracking-wider mb-1.5 ' + tipAccent}>Pop-in mode</h3>
            <ul className="space-y-1">
              <li>The <strong className={tipStrong}>play button</strong> in the toolbar reveals nodes one by one, sorted by importance (PageRank). Watch the graph grow organically as each node pops in with its connections.</li>
              <li>Click again to stop and show the full graph.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
};

// ─── Note Preview Panel ──────────────────────────────────────────────

const NotePreviewPanel: React.FC<{
  note: FieldNoteMeta | null;
  html: string;
  loading: boolean;
  onNavigate: (uid: string) => void;
}> = ({ note, html, loading, onNavigate }) => {
  const contentRef = useRef<HTMLDivElement>(null);

  // Handle wiki-link clicks inside rendered HTML
  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    const handler = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest('a.wiki-ref');
      if (!anchor) return;
      e.preventDefault();
      const uid = anchor.getAttribute('data-uid');
      if (uid) onNavigate(uid);
    };
    el.addEventListener('click', handler);
    return () => el.removeEventListener('click', handler);
  }, [html, onNavigate]);

  if (!note) {
    return (
      <div className="flex items-center justify-center h-full text-th-muted text-sm">
        Click a node to preview
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="shrink-0 px-4 py-3 border-b border-th-hub-border bg-th-surface/50">
        <div className="text-[10px] text-th-muted tracking-wide mb-1">
          {displayAddress(note.address || note.title)}
        </div>
        <div className="flex items-center gap-2">
          <h2 className="text-base font-semibold text-th-heading flex-1 min-w-0 truncate">
            {note.name}
          </h2>
          <a
            href={secondBrainPath(note.id)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] text-violet-400 hover:text-violet-300 shrink-0 transition-colors"
          >
            expand ↗
          </a>
        </div>
        <div className="text-[10px] text-th-muted mt-1">{note.date}</div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        {loading ? (
          <div className="text-th-muted text-xs animate-pulse">Loading content...</div>
        ) : (
          <div className="wiki-content-box">
            <div className="article-page-wrapper article-wiki">
              <div
                ref={contentRef}
                className="article-content wiki-content"
                dangerouslySetInnerHTML={{ __html: html }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Main Graph View ─────────────────────────────────────────────────

const SecondBrainGraphView: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<any>(null);

  // Data
  const [index, setIndex] = useState<BrainIndex | null>(null);
  const { getCentrality, loaded: relevanceLoaded, getIslands } = useGraphRelevance();

  // Graph state
  const [fullGraph, setFullGraph] = useState<GraphData | null>(null);
  const [visibility, setVisibility] = useState<EdgeVisibility>({
    body: true, interaction: true, hierarchy: false,
  });
  const [settings, setSettings] = useState<GraphSettings>({ ...DEFAULT_SETTINGS });
  const [dimension, setDimension] = useState<'2d' | '3d'>(() => {
    const stored = sessionStorage.getItem('graph-dimension');
    if (stored === '3d') { sessionStorage.removeItem('graph-dimension'); return '3d'; }
    return '2d';
  });

  // Reset key — bumping this remounts the graph, re-running warmupTicks from scratch
  const [graphKey, setGraphKey] = useState(0);
  const gravityInitialized = useRef(false);

  // Pop-in animation — purely visual reveal (physics run on full graph)
  const [popInActive, setPopInActive] = useState(false);
  const [popInCount, setPopInCount] = useState(0);
  const popInRevealed = useRef<Set<string>>(new Set());

  // Selection & hover preview
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [noteHtml, setNoteHtml] = useState('');
  const [contentLoading, setContentLoading] = useState(false);
  // The "active" id for the preview panel: selected wins over hovered
  const previewId = selectedId ?? hoveredId;

  // Guide modal + selection mode + connections panel
  const [guideOpen, setGuideOpen] = useState(false);
  const [selectMode, setSelectMode] = useState(false);
  const [showConnections, setShowConnections] = useState(false);

  // Multi-select (Ctrl+click or Shift+drag)
  const [multiSelected, setMultiSelected] = useState<Set<string>>(new Set());
  const [dragSelect, setDragSelect] = useState<{ x0: number; y0: number; x1: number; y1: number } | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Subgraph mode — isolate selected cluster
  const [subgraphStack, setSubgraphStack] = useState<Set<string>[]>([]);
  const activeSubgraph = subgraphStack.length > 0 ? subgraphStack[subgraphStack.length - 1] : null;

  // Search — initialize from URL ?q= param (passed from mini graph)
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(() => searchParams.get('q') || '');

  // Hub filters — propagated from the list view via URL params
  const hubFilters = useMemo(() => parseHubFilters(searchParams), [searchParams]);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchResults = useMemo(() => {
    if (!searchQuery || !index) return [];
    const q = searchQuery.toLowerCase();
    return index.allFieldNotes
      .filter(n => n.name.toLowerCase().includes(q) || n.address.toLowerCase().includes(q))
      .map(n => n.id);
  }, [searchQuery, index]);

  // Search results with metadata (for the dropdown)
  const searchResultsMeta = useMemo(() => {
    if (!searchQuery || !index) return [];
    const q = searchQuery.toLowerCase();
    return index.allFieldNotes
      .filter(n => n.name.toLowerCase().includes(q) || n.address.toLowerCase().includes(q))
      .slice(0, 20)
      .map(n => ({ id: n.id, name: n.name, address: n.address }));
  }, [searchQuery, index]);

  // Layout
  const PANEL_MIN = 280;
  const PANEL_MAX = 600;
  const PANEL_DEFAULT = 380;
  const [panelWidth, setPanelWidth] = useState(PANEL_DEFAULT);
  const panelDragging = useRef(false);
  const [showPanel, setShowPanel] = useState(() => window.innerWidth >= 768);
  const [showControls, setShowControls] = useState(() => window.innerWidth >= 768);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const handler = (e: MediaQueryListEvent) => setIsMobile(!e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Load index
  useEffect(() => {
    initBrainIndex().then(setIndex);
  }, []);

  // Build graph when data ready
  useEffect(() => {
    if (!index || !relevanceLoaded) return;
    const centralityMap: Record<string, number> = {};
    index.allFieldNotes.forEach(n => {
      centralityMap[n.id] = getCentrality(n.id);
    });
    setFullGraph(buildGraphData(index, centralityMap));
  }, [index, relevanceLoaded, getCentrality]);

  // Filtered graph (edge visibility)
  const baseFiltered = useFilteredGraph(fullGraph, visibility);

  // Apply hub filters from URL params (propagated from list view)
  const hubFilteredIds = useMemo(() => {
    if (!hubFilters.hasAny || !index) return null;
    return applyHubFilters(index.allFieldNotes, hubFilters, index, getIslands);
  }, [hubFilters, index, getIslands]);

  const hubFilteredGraph = useMemo(() => {
    if (!baseFiltered || !hubFilteredIds) return baseFiltered;
    const nodes = baseFiltered.nodes.filter(n => hubFilteredIds.has(n.id));
    const nodeSet = new Set(nodes.map(n => n.id));
    const links = baseFiltered.links.filter((l: any) => {
      const src = typeof l.source === 'object' ? l.source.id : l.source;
      const tgt = typeof l.target === 'object' ? l.target.id : l.target;
      return nodeSet.has(src) && nodeSet.has(tgt);
    });
    return { nodes, links };
  }, [baseFiltered, hubFilteredIds]);

  // Apply subgraph constraint if active
  const filtered = useMemo(() => {
    if (!hubFilteredGraph || !activeSubgraph) return hubFilteredGraph;
    const nodes = hubFilteredGraph.nodes.filter(n => activeSubgraph.has(n.id));
    const nodeSet = new Set(nodes.map(n => n.id));
    const links = hubFilteredGraph.links.filter((l: any) => {
      const src = typeof l.source === 'object' ? l.source.id : l.source;
      const tgt = typeof l.target === 'object' ? l.target.id : l.target;
      return nodeSet.has(src) && nodeSet.has(tgt);
    });
    return { nodes, links };
  }, [hubFilteredGraph, activeSubgraph]);

  const resetGraph = useCallback(() => {
    if (filtered) {
      for (const node of filtered.nodes as any[]) {
        delete node.x; delete node.y; delete node.z;
        delete node.vx; delete node.vy; delete node.vz;
      }
    }
    gravityInitialized.current = false;
    setGraphKey(k => k + 1);
  }, [filtered]);

  // ─── Heatmap coloring ───────────────────────────────────────────────
  const [colorMode, setColorMode] = useState<ColorMode>('default');

  // Precompute metric values → normalized 0–1 per node
  const colorMetrics = useMemo(() => {
    if (colorMode === 'default' || !index) return null;

    const values = new Map<string, number>();
    const today = Date.now();

    index.allFieldNotes.forEach(n => {
      let v = 0;
      if (colorMode === 'wordCount') {
        v = (n.searchText || '').split(/\s+/).filter(Boolean).length;
      } else if (colorMode === 'connections') {
        const out = n.references?.length || 0;
        const inc = (index.backlinksMap.get(n.id) || []).length;
        v = out + inc;
      } else if (colorMode === 'age') {
        const d = n.date ? new Date(n.date).getTime() : today;
        v = (today - d) / (1000 * 60 * 60 * 24); // days old
      }
      values.set(n.id, v);
    });

    // Find min/max for normalization
    let min = Infinity, max = -Infinity;
    values.forEach(v => { if (v < min) min = v; if (v > max) max = v; });
    const range = max - min || 1;

    // Normalize to 0–1
    const normalized = new Map<string, number>();
    values.forEach((v, id) => normalized.set(id, (v - min) / range));

    return { normalized, min, max, range };
  }, [colorMode, index]);

  // Reset layout when entering/exiting subgraph mode
  const prevSubgraphLen = useRef(0);
  useEffect(() => {
    if (subgraphStack.length !== prevSubgraphLen.current) {
      prevSubgraphLen.current = subgraphStack.length;
      // Clear positions so force layout starts fresh
      if (baseFiltered) {
        for (const node of baseFiltered.nodes as any[]) {
          delete node.x; delete node.y; delete node.z;
          delete node.vx; delete node.vy; delete node.vz;
        }
      }
      gravityInitialized.current = false;
      setGraphKey(k => k + 1);
    }
  }, [subgraphStack.length, baseFiltered]);

  // Pop-in: nodes sorted by centrality (most important first)
  const popInNodeOrder = useMemo(() => {
    if (!filtered) return [];
    return [...filtered.nodes]
      .sort((a, b) => (b as GraphNode).centrality - (a as GraphNode).centrality)
      .map(n => n.id);
  }, [filtered]);

  // Pop-in interval — just grows the revealed set (physics untouched)
  useEffect(() => {
    if (!popInActive || !filtered) return;
    const total = popInNodeOrder.length;
    if (popInCount >= total) {
      setPopInActive(false);
      return;
    }
    const timer = setInterval(() => {
      setPopInCount(prev => {
        const step = Math.max(1, Math.floor(prev / 15));
        const next = Math.min(prev + step, total);
        // Add newly revealed nodes to the set
        for (let i = prev; i < next; i++) {
          popInRevealed.current.add(popInNodeOrder[i]);
        }
        if (next >= total) setPopInActive(false);
        return next;
      });
    }, 50);
    return () => clearInterval(timer);
  }, [popInActive, filtered, popInCount, popInNodeOrder]);

  const togglePopIn = useCallback(() => {
    if (popInActive) {
      // Stop — reveal everything
      setPopInActive(false);
      popInRevealed.current.clear();
      setPopInCount(filtered?.nodes.length ?? 0);
    } else {
      // Start — hide all, then reveal progressively
      popInRevealed.current.clear();
      setPopInCount(0);
      setPopInActive(true);
    }
  }, [popInActive, filtered]);

  // Track graph area size via its own ref
  const graphAreaRef = useRef<HTMLDivElement>(null);

  // Off-screen node indicators (triangles on viewport edges)
  type EdgeIndicator = { edge: 'top' | 'bottom' | 'left' | 'right'; pos: number; count: number };
  const [offscreenIndicators, setOffscreenIndicators] = useState<EdgeIndicator[]>([]);

  const [graphDims, setGraphDims] = useState(() => {
    const mobile = window.innerWidth < 768;
    const sidebarW = mobile ? 0 : SIDEBAR_WIDTH;
    const panelW = mobile ? 0 : PANEL_DEFAULT;
    return {
      width: Math.max(300, window.innerWidth - sidebarW - panelW),
      height: window.innerHeight - (mobile ? MOBILE_NAV_HEIGHT : 0),
    };
  });

  useEffect(() => {
    const el = graphAreaRef.current;
    if (!el) return;
    const ro = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      if (width > 0 && height > 0) setGraphDims({ width, height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Compute off-screen node indicators on each frame
  useEffect(() => {
    let raf = 0;
    const MARGIN = 8;
    const BUCKET = 120; // wide buckets to merge nearby clusters
    const CORNER = 40;
    const MIN_COUNT = 3; // need at least this many nodes to show an indicator
    const MAX_PER_EDGE = 3; // max indicators per edge

    const compute = () => {
      raf = requestAnimationFrame(compute);
      const fg = graphRef.current;
      if (!fg || !filtered || !fg.graph2ScreenCoords) return;

      const W = graphDims.width;
      const H = graphDims.height;
      if (W < 50 || H < 50) return;

      const buckets: Record<string, { edge: 'top' | 'bottom' | 'left' | 'right'; bucket: number; count: number }> = {};

      for (const node of (filtered.nodes as any[])) {
        const x = node.x ?? 0;
        const y = node.y ?? 0;
        const z = node.z ?? 0;
        const screen = dimension === '3d'
          ? fg.graph2ScreenCoords(x, y, z)
          : fg.graph2ScreenCoords(x, y);
        if (!screen) continue;
        const sx = screen.x;
        const sy = screen.y;

        if (sx >= MARGIN && sx <= W - MARGIN && sy >= MARGIN && sy <= H - MARGIN) continue;

        let edge: 'top' | 'bottom' | 'left' | 'right';
        let pos: number;
        const cx = Math.max(0, Math.min(W, sx));
        const cy = Math.max(0, Math.min(H, sy));

        // Assign edge, skipping corner dead zones
        if (sy < MARGIN && cx > CORNER && cx < W - CORNER) { edge = 'top'; pos = cx; }
        else if (sy > H - MARGIN && cx > CORNER && cx < W - CORNER) { edge = 'bottom'; pos = cx; }
        else if (sx < MARGIN && cy > CORNER && cy < H - CORNER) { edge = 'left'; pos = cy; }
        else if (sx > W - MARGIN && cy > CORNER && cy < H - CORNER) { edge = 'right'; pos = cy; }
        else continue; // corner — skip

        const b = Math.round(pos / BUCKET) * BUCKET;
        const key = `${edge}-${b}`;
        if (buckets[key]) { buckets[key].count++; }
        else { buckets[key] = { edge, bucket: b, count: 1 }; }
      }

      // Filter by minimum count, then keep only top N per edge
      const all = Object.values(buckets).filter(b => b.count >= MIN_COUNT);
      const byEdge: Record<string, typeof all> = {};
      for (const b of all) {
        (byEdge[b.edge] ??= []).push(b);
      }
      const indicators: EdgeIndicator[] = [];
      for (const group of Object.values(byEdge)) {
        group.sort((a, b) => b.count - a.count);
        for (const b of group.slice(0, MAX_PER_EDGE)) {
          indicators.push({ edge: b.edge, pos: b.bucket, count: b.count });
        }
      }
      setOffscreenIndicators(indicators);
    };

    raf = requestAnimationFrame(compute);
    return () => cancelAnimationFrame(raf);
  }, [filtered, graphDims, dimension]);

  // Fetch note content for whichever note is active in the panel
  useEffect(() => {
    if (!previewId) { setNoteHtml(''); return; }
    let cancelled = false;
    setContentLoading(true);
    fetchNoteContent(previewId).then(html => {
      if (!cancelled) {
        setNoteHtml(html);
        setContentLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [previewId]);

  const previewNote = useMemo(
    () => previewId ? index?.noteById.get(previewId) ?? null : null,
    [previewId, index],
  );

  // ─── Zoom to fit after simulation settles ───
  const hasZoomed = useRef(false);
  useEffect(() => {
    if (!filtered || hasZoomed.current) return;
    const timer = setTimeout(() => {
      graphRef.current?.zoomToFit?.(400, 60);
      hasZoomed.current = true;
    }, 1500);
    return () => clearTimeout(timer);
  }, [filtered]);

  // Adjacency map: nodeId → list of { id, name, type }
  const adjacency = useMemo(() => {
    if (!fullGraph || !index) return new Map<string, { id: string; name: string; type: string }[]>();
    const adj = new Map<string, { id: string; name: string; type: string }[]>();
    for (const link of fullGraph.links) {
      const s = typeof link.source === 'string' ? link.source : (link.source as any).id;
      const t = typeof link.target === 'string' ? link.target : (link.target as any).id;
      const sName = index.noteById.get(s)?.name ?? s;
      const tName = index.noteById.get(t)?.name ?? t;
      if (!adj.has(s)) adj.set(s, []);
      if (!adj.has(t)) adj.set(t, []);
      adj.get(s)!.push({ id: t, name: tName, type: link.type });
      adj.get(t)!.push({ id: s, name: sName, type: link.type });
    }
    return adj;
  }, [fullGraph, index]);

  // Tooltip with related nodes
  const nodeTooltip = useCallback((node: any) => {
    const n = node as GraphNode;
    const neighbors = adjacency.get(n.id) ?? [];
    if (neighbors.length === 0) return n.name;
    const grouped: Record<string, string[]> = {};
    for (const nb of neighbors) {
      (grouped[nb.type] ??= []).push(nb.name);
    }
    const lines = Object.entries(grouped).map(([type, names]) =>
      `<div style="margin-top:3px"><span style="opacity:0.5;font-size:9px">${type}</span> ${names.join(', ')}</div>`
    ).join('');
    return `<div style="max-width:280px"><b>${n.name}</b>${lines}</div>`;
  }, [adjacency]);

  // ─── Node rendering ───
  const searchResultSet = useMemo(() => new Set(searchResults), [searchResults]);
  // Primary matches: name contains the query. Secondary: matched only via address (children).
  const searchPrimarySet = useMemo(() => {
    if (!searchQuery || !index) return new Set<string>();
    const q = searchQuery.toLowerCase();
    return new Set(
      index.allFieldNotes
        .filter(n => n.name.toLowerCase().includes(q))
        .map(n => n.id)
    );
  }, [searchQuery, index]);

  // The "focus" node for neighbor highlight: only when pinned (clicked)
  const focusId = selectedId;
  const focusNeighborSet = useMemo(() => {
    if (!focusId) return new Set<string>();
    const neighbors = adjacency.get(focusId) ?? [];
    return new Set(neighbors.map(n => n.id));
  }, [focusId, adjacency]);
  // Grouped neighbors for the connections panel (works for both click and hover)
  const previewNeighbors = useMemo(() => {
    if (!previewId) return null;
    const neighbors = adjacency.get(previewId) ?? [];
    const grouped: Record<string, { id: string; name: string }[]> = {};
    for (const nb of neighbors) {
      (grouped[nb.type] ??= []).push({ id: nb.id, name: nb.name });
    }
    return grouped;
  }, [previewId, adjacency]);

  const nodeCanvasObject = useCallback((node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const n = node as GraphNode & { x: number; y: number };

    // Pop-in: skip unrevealed nodes
    if (popInActive && !popInRevealed.current.has(n.id)) return;

    const baseR = 2 + n.centrality * 12;
    const r = baseR * settings.nodeSize;

    // Dim non-matching nodes when search is active
    const isSearching = searchResultSet.size > 0;
    const isPrimary = searchPrimarySet.has(n.id);
    const isSecondary = !isPrimary && searchResultSet.has(n.id);
    const isMatch = isPrimary || isSecondary;
    const isSelected = n.id === selectedId;
    const isMultiSelected = multiSelected.has(n.id);
    const isFocused = n.id === focusId;
    const isFocusNeighbor = focusNeighborSet.has(n.id);
    const hasFocus = !!focusId;

    if (hasFocus && !isFocused && !isFocusNeighbor && !isSelected && !isMultiSelected) {
      ctx.globalAlpha = 0.12;
    } else if (isSearching && !isMatch && !isSelected) {
      ctx.globalAlpha = 0.15;
    } else if (isSecondary) {
      ctx.globalAlpha = 0.6;
    }

    // Node circle
    ctx.beginPath();
    ctx.arc(n.x, n.y, r, 0, 2 * Math.PI);
    // Heatmap coloring: override default when a metric is active
    let nodeColor: string;
    if (isMultiSelected) nodeColor = '#22d3ee';
    else if (isSelected) nodeColor = '#a78bfa';
    else if (isFocused) nodeColor = '#e879f9';
    else if (isPrimary) nodeColor = '#f59e0b';
    else if (isSecondary) nodeColor = '#fb923c';
    else if (isFocusNeighbor) nodeColor = '#c084fc';
    else if (colorMetrics) {
      const t = colorMetrics.normalized.get(n.id) ?? 0;
      // Viridis-inspired gradient: violet → blue → teal → green → yellow
      const hue = 270 - t * 210;
      const sat = 75 + t * 15;
      const lum = 30 + t * 35;
      nodeColor = `hsl(${hue}, ${sat}%, ${lum}%)`;
    } else {
      nodeColor = n.isParent ? '#8b5cf6' : '#6d28d9';
    }
    ctx.fillStyle = nodeColor;
    ctx.fill();
    if (isSelected || isPrimary || isMultiSelected || isFocused) {
      ctx.strokeStyle = isMultiSelected ? '#67e8f9' : isSelected ? '#c4b5fd' : isFocused ? '#f0abfc' : '#fbbf24';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // Label — always show for multi-selected nodes (area selection)
    const forceLabel = isMultiSelected;
    if ((settings.showLabels && settings.labelSize > 0 && (globalScale > 0.5 || isMatch)) || forceLabel) {
      const fontSize = forceLabel ? Math.max(4, (settings.labelSize || 10) / globalScale) : settings.labelSize / globalScale;
      if (fontSize < 2 && !isMatch && !forceLabel) { ctx.globalAlpha = 1; return; }
      ctx.font = `${Math.max(fontSize, isMatch ? 4 : forceLabel ? 4 : 0)}px Inter, system-ui, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillStyle = isMultiSelected ? '#67e8f9' : isSelected ? '#e9d5ff' : isPrimary ? '#fef3c7' : isSecondary ? 'rgba(251,191,36,0.5)' : 'rgba(255,255,255,0.75)';
      ctx.fillText(n.name, n.x, n.y + r + 2);
    }

    ctx.globalAlpha = 1;
  }, [settings.nodeSize, settings.labelSize, settings.showLabels, selectedId, multiSelected, searchResultSet, searchPrimarySet, focusId, focusNeighborSet, popInActive, popInCount, colorMetrics]);

  const nodePointerAreaPaint = useCallback((node: any, color: string, ctx: CanvasRenderingContext2D) => {
    const n = node as GraphNode & { x: number; y: number };
    const pad = isMobile ? 8 : 3;
    const r = (2 + n.centrality * 12) * settings.nodeSize + pad;
    ctx.beginPath();
    ctx.arc(n.x, n.y, r, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill();
  }, [settings.nodeSize, isMobile]);

  // ─── Link rendering ───
  const linkCanvasObject = useCallback((link: any, ctx: CanvasRenderingContext2D) => {
    const l = link as GraphLink & { source: { x: number; y: number; id?: string }; target: { x: number; y: number; id?: string } };
    if (!l.source?.x || !l.target?.x) return;

    // Pop-in: skip links where either endpoint is not yet revealed
    if (popInActive) {
      const sId = (l.source as any).id ?? l.source;
      const tId = (l.target as any).id ?? l.target;
      if (!popInRevealed.current.has(sId) || !popInRevealed.current.has(tId)) return;
    }

    ctx.beginPath();
    ctx.moveTo(l.source.x, l.source.y);
    ctx.lineTo(l.target.x, l.target.y);
    ctx.strokeStyle = EDGE_COLORS[l.type];
    ctx.globalAlpha = settings.edgeOpacity;
    ctx.lineWidth = l.type === 'hierarchy' ? settings.edgeWidth * 1.8 : settings.edgeWidth;
    ctx.stroke();
    ctx.globalAlpha = 1;
  }, [settings.edgeOpacity, settings.edgeWidth, popInActive, popInCount]);

  // Mobile slide-in panel
  const [mobilePanel, setMobilePanel] = useState(false);

  // ─── Mobile: swipe-to-dismiss state ───
  const [swipeOffset, setSwipeOffset] = useState(0);
  const swipingRef = useRef(false);
  const swipeStart = useRef<{ x: number; y: number; time: number } | null>(null);

  // ─── Event handlers ───
  const onNodeClick = useCallback((node: any, event?: MouseEvent) => {
    if (event?.ctrlKey || event?.metaKey || (isMobile && selectMode)) {
      // Ctrl+click (desktop) or tap in select mode (mobile): toggle multi-selection
      setMultiSelected(prev => {
        const next = new Set(prev);
        if (next.has(node.id)) next.delete(node.id);
        else next.add(node.id);
        return next;
      });
      return;
    }
    // Normal click: pin single node, clear multi-selection + search
    setMultiSelected(new Set());
    setSelectedId(node.id);
    setHoveredId(null);
    setSearchQuery('');
    if (isMobile) {
      setMobilePanel(true);
    } else if (!showPanel) {
      setShowPanel(true);
    }
  }, [showPanel, isMobile, selectMode]);

  const onNodeHover = useCallback((node: any) => {
    if (containerRef.current) {
      containerRef.current.style.cursor = node ? 'pointer' : 'default';
    }
    // Always update hover for visual highlight
    setHoveredId(node ? node.id : null);
    // Only open panel preview if nothing is pinned
    if (!selectedId && node && !showPanel && !isMobile) {
      setShowPanel(true);
    }
  }, [selectedId, showPanel, isMobile]);

  const onBackgroundClick = useCallback(() => {
    setSelectedId(null);
    setMultiSelected(new Set());
    setHoveredId(null);
  }, []);

  const goToRandomNote = useCallback(() => {
    if (!filtered) return;
    const nodes = filtered.nodes as (GraphNode & { x: number; y: number })[];
    const rand = nodes[Math.floor(Math.random() * nodes.length)];
    if (!rand) return;
    setSelectedId(rand.id);
    setMultiSelected(new Set());
    setHoveredId(null);
    if (!showPanel && !isMobile) setShowPanel(true);
    const fg = graphRef.current;
    if (!fg) return;
    // 2D: centerAt, 3D: cameraPosition
    if (fg.centerAt) {
      fg.centerAt(rand.x, rand.y, 600);
    } else if (fg.cameraPosition) {
      const n = rand as any;
      fg.cameraPosition(
        { x: n.x, y: n.y, z: (n.z ?? 0) + 200 }, // camera position
        { x: n.x, y: n.y, z: n.z ?? 0 },           // lookAt target
        600,                                          // transition ms
      );
    }
  }, [filtered, showPanel, isMobile]);

  const onNavigateFromPanel = useCallback((uid: string) => {
    setSelectedId(uid);
    // Center graph on the node
    if (graphRef.current && fullGraph) {
      const node = fullGraph.nodes.find(n => n.id === uid);
      if (node && graphRef.current.centerAt) {
        graphRef.current.centerAt((node as any).x, (node as any).y, 400);
      }
    }
  }, [fullGraph]);

  // Search submit — center on first result
  const onSearchSubmit = useCallback(() => {
    if (searchResults.length === 0) return;
    const uid = searchResults[0];
    setSelectedId(uid);
    if (!showPanel) setShowPanel(true);
    // Center camera on the node
    const fg = graphRef.current;
    if (fg && filtered) {
      const node = filtered.nodes.find((n: any) => (n.id || n) === uid);
      if (node && fg.centerAt) {
        fg.centerAt((node as any).x, (node as any).y, 600);
        fg.zoom(3, 600);
      }
    }
  }, [searchResults, showPanel, filtered]);

  // Auto-preview first result as user types
  useEffect(() => {
    if (searchResults.length > 0) {
      setSelectedId(searchResults[0]);
      if (!showPanel && !isMobile) setShowPanel(true);
    }
  }, [searchResults]); // eslint-disable-line react-hooks/exhaustive-deps

  // Click a search result → select + center
  const onSearchResultClick = useCallback((uid: string) => {
    setSelectedId(uid);
    setHoveredId(null);
    if (!showPanel && !isMobile) setShowPanel(true);
    const fg = graphRef.current;
    if (fg && filtered) {
      const node = filtered.nodes.find((n: any) => n.id === uid);
      if (node && fg.centerAt) {
        fg.centerAt((node as any).x, (node as any).y, 400);
        fg.zoom(3, 400);
      } else if (node && fg.cameraPosition) {
        const n = node as any;
        fg.cameraPosition(
          { x: n.x, y: n.y, z: (n.z ?? 0) + 200 },
          { x: n.x, y: n.y, z: n.z ?? 0 }, 400,
        );
      }
    }
  }, [filtered, showPanel, isMobile]);

  // ─── Force config (from settings) ───
  const d3AlphaDecay = settings.alphaDecay;
  const d3VelocityDecay = settings.velocityDecay;

  // Reset gravity flag when graph remounts (dimension or key change)
  useEffect(() => {
    gravityInitialized.current = false;
  }, [dimension, graphKey]);

  // Apply charge + link forces (full reheat OK)
  useEffect(() => {
    const fg = graphRef.current;
    if (!fg || !fg.d3Force) return;

    const charge = fg.d3Force('charge');
    if (charge) {
      charge.strength(-30 * settings.forceStrength);
      charge.distanceMax(800);
    }
    const link = fg.d3Force('link');
    if (link) link.distance(settings.linkDistance);

    fg.d3ReheatSimulation?.();
  }, [settings.forceStrength, settings.linkDistance, dimension, graphKey]);

  // Apply gravity separately — gentle alpha so nodes drift instead of collapsing
  useEffect(() => {
    const fg = graphRef.current;
    if (!fg || !fg.d3Force) return;

    const is3d = dimension === '3d';
    if (!gravityInitialized.current) {
      import('d3-force-3d').then((d3) => {
        if (!fg.d3Force) return;
        fg.d3Force('x', d3.forceX(0).strength(settings.gravity));
        fg.d3Force('y', d3.forceY(0).strength(settings.gravity));
        if (is3d) fg.d3Force('z', d3.forceZ(0).strength(settings.gravity));
        gravityInitialized.current = true;
        fg.d3ReheatSimulation?.();
      });
    } else {
      const fx = fg.d3Force('x');
      const fy = fg.d3Force('y');
      const fz = fg.d3Force('z');
      if (fx) fx.strength(settings.gravity);
      if (fy) fy.strength(settings.gravity);
      if (is3d && fz) fz.strength(settings.gravity);
      fg.d3ReheatSimulation?.();
    }
  }, [settings.gravity, dimension]);

  // 3D: point controls target at selected node so scroll-zoom follows it
  useEffect(() => {
    if (dimension !== '3d' || !selectedId) return;
    const fg = graphRef.current;
    if (!fg || !fg.controls) return;
    const node = (filtered?.nodes as any[])?.find(n => n.id === selectedId);
    if (!node) return;
    const controls = fg.controls();
    if (controls?.target) {
      controls.target.set(node.x ?? 0, node.y ?? 0, node.z ?? 0);
    }
  }, [selectedId, dimension, filtered]);

  // Keyboard: Escape to deselect, C to toggle controls, type-to-search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      const isInput = el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT';

      if (e.key === 'Escape') {
        if (isInput) (el as HTMLInputElement).blur();
        setSearchQuery('');
        setSelectedId(null); setMultiSelected(new Set());
        return;
      }
      if (e.key === 'c' && !e.ctrlKey && !e.metaKey && !isInput) {
        setShowControls(v => !v);
        return;
      }

      // Type-to-search: printable keys focus the search input
      if (isInput || e.ctrlKey || e.metaKey || e.altKey) return;

      if (e.key === 'Backspace' && searchQuery) {
        e.preventDefault();
        setSearchQuery(searchQuery.slice(0, -1));
        if (!showControls) setShowControls(true);
        searchInputRef.current?.focus();
        return;
      }

      if (e.key.length === 1 && !e.shiftKey) {
        e.preventDefault();
        setSearchQuery(searchQuery + e.key);
        if (!showControls) setShowControls(true);
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [searchQuery, showControls]);

  // Drag rectangle selection (only when selectMode is active, 2D only)
  useEffect(() => {
    const el = graphAreaRef.current;
    if (!el || dimension !== '2d' || !selectMode) return;

    let selecting = false;
    let startX = 0, startY = 0;
    const MIN_DRAG = 5;

    const onMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return;
      selecting = true;
      const rect = el.getBoundingClientRect();
      startX = e.clientX - rect.left;
      startY = e.clientY - rect.top;
      e.preventDefault(); // prevent pan while in select mode
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!selecting) return;
      const rect = el.getBoundingClientRect();
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;
      if (Math.abs(cx - startX) > MIN_DRAG || Math.abs(cy - startY) > MIN_DRAG) {
        setDragSelect({ x0: startX, y0: startY, x1: cx, y1: cy });
      }
    };

    const onMouseUp = (e: MouseEvent) => {
      if (e.button !== 0 || !selecting) return;
      selecting = false;
      const rect = el.getBoundingClientRect();
      const endX = e.clientX - rect.left;
      const endY = e.clientY - rect.top;
      setDragSelect(null);

      if (Math.abs(endX - startX) <= MIN_DRAG && Math.abs(endY - startY) <= MIN_DRAG) return;

      const fg = graphRef.current;
      if (!fg || !filtered || !fg.screen2GraphCoords) return;

      const topLeft = fg.screen2GraphCoords(Math.min(startX, endX), Math.min(startY, endY));
      const bottomRight = fg.screen2GraphCoords(Math.max(startX, endX), Math.max(startY, endY));

      const selected = new Set<string>();
      for (const node of filtered.nodes) {
        const n = node as GraphNode & { x: number; y: number };
        if (n.x >= topLeft.x && n.x <= bottomRight.x && n.y >= topLeft.y && n.y <= bottomRight.y) {
          selected.add(n.id);
        }
      }
      if (selected.size > 0) {
        setMultiSelected(prev => {
          if (e.ctrlKey || e.metaKey) {
            const merged = new Set(prev);
            selected.forEach(id => merged.add(id));
            return merged;
          }
          return selected;
        });
      }
    };

    el.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      el.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [dimension, filtered, selectMode]);

  // Touch-based drag rectangle selection (mobile, selectMode + 2D only)
  const touchDragRef = useRef<{ startX: number; startY: number } | null>(null);
  useEffect(() => {
    const el = graphAreaRef.current;
    if (!el || dimension !== '2d' || !selectMode || !isMobile) return;

    const MIN_DRAG = 10;

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      const rect = el.getBoundingClientRect();
      touchDragRef.current = {
        startX: e.touches[0].clientX - rect.left,
        startY: e.touches[0].clientY - rect.top,
      };
    };

    const onTouchMove = (e: TouchEvent) => {
      const td = touchDragRef.current;
      if (!td || e.touches.length !== 1) return;
      const rect = el.getBoundingClientRect();
      const cx = e.touches[0].clientX - rect.left;
      const cy = e.touches[0].clientY - rect.top;
      if (Math.abs(cx - td.startX) > MIN_DRAG || Math.abs(cy - td.startY) > MIN_DRAG) {
        e.preventDefault(); // prevent scroll/pan while drawing rectangle
        setDragSelect({ x0: td.startX, y0: td.startY, x1: cx, y1: cy });
      }
    };

    const onTouchEnd = () => {
      const td = touchDragRef.current;
      touchDragRef.current = null;
      const ds = dragSelect;
      setDragSelect(null);
      if (!td || !ds) return;

      const { startX } = td;
      const { startY } = td;
      const endX = ds.x1;
      const endY = ds.y1;
      if (Math.abs(endX - startX) <= MIN_DRAG && Math.abs(endY - startY) <= MIN_DRAG) return;

      const fg = graphRef.current;
      if (!fg || !filtered || !fg.screen2GraphCoords) return;

      const topLeft = fg.screen2GraphCoords(Math.min(startX, endX), Math.min(startY, endY));
      const bottomRight = fg.screen2GraphCoords(Math.max(startX, endX), Math.max(startY, endY));

      const selected = new Set<string>();
      for (const node of filtered.nodes) {
        const n = node as GraphNode & { x: number; y: number };
        if (n.x >= topLeft.x && n.x <= bottomRight.x && n.y >= topLeft.y && n.y <= bottomRight.y) {
          selected.add(n.id);
        }
      }
      if (selected.size > 0) {
        setMultiSelected(prev => {
          const merged = new Set(prev);
          selected.forEach(id => merged.add(id));
          return merged;
        });
      }
    };

    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    el.addEventListener('touchend', onTouchEnd);
    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
    };
  }, [dimension, filtered, selectMode, isMobile, dragSelect]);

  // Copy multi-selected notes to clipboard
  const copySelectionToClipboard = useCallback(async () => {
    if (!index || multiSelected.size === 0) return;
    const notes = Array.from(multiSelected)
      .map(uid => index.noteById.get(uid))
      .filter(Boolean) as FieldNoteMeta[];

    // Fetch content for all selected notes in parallel
    const contents = await Promise.all(
      notes.map(async n => {
        try {
          const resp = await fetch(`/fieldnotes/${n.id}.json`);
          if (!resp.ok) return { note: n, body: '' };
          const { content } = await resp.json();
          // Strip HTML tags for plain text
          const text = content.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#39;/g, "'").replace(/&quot;/g, '"').trim();
          return { note: n, body: text };
        } catch { return { note: n, body: '' }; }
      })
    );

    const structured = contents.map(({ note, body }) =>
      `## ${note.name}\n**Address:** ${note.address}\n**UID:** ${note.id}\n\n${body}`
    ).join('\n\n---\n\n');

    const header = `# Fieldnotes context (${notes.length} notes)\n\n`;
    const text = header + structured;
    await navigator.clipboard.writeText(text);
    const chars = text.length;
    const tokens = Math.round(chars / 4);
    const fmtK = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);
    setToast(`Copied ${notes.length} notes · ${fmtK(chars)} chars · ~${fmtK(tokens)} tokens`);
    setTimeout(() => setToast(null), 3000);
  }, [index, multiSelected]);

  // Names of multi-selected notes (for the prompt)
  const multiSelectedNames = useMemo(() => {
    if (!index || multiSelected.size === 0) return [];
    return Array.from(multiSelected)
      .map(uid => index.noteById.get(uid)?.name)
      .filter(Boolean) as string[];
  }, [index, multiSelected]);

  // 3D callbacks (memoized — must be before early return to keep hook order stable)
  const nodeColor3d = useCallback((node: any) => {
    const n = node as GraphNode;
    if (n.id === selectedId) return '#a78bfa';
    if (colorMetrics) {
      const t = colorMetrics.normalized.get(n.id) ?? 0;
      const hue = 270 - t * 210;
      const sat = 75 + t * 15;
      const lum = 30 + t * 35;
      return `hsl(${hue}, ${sat}%, ${lum}%)`;
    }
    return n.isParent ? '#8b5cf6' : '#6d28d9';
  }, [selectedId, colorMetrics]);

  const nodeVal3d = useCallback((node: any) => {
    const n = node as GraphNode;
    return (1 + n.centrality * 8) * settings.nodeSize;
  }, [settings.nodeSize]);

  const linkColor3d = useCallback((link: any) => {
    return EDGE_COLORS[(link as GraphLink).type];
  }, []);

  if (!index || !filtered) {
    return (
      <div className="flex items-center justify-center h-[80vh] text-th-muted text-sm animate-pulse">
        Loading graph data...
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="fixed right-0 bottom-0 bg-th-base flex select-none"
      style={{ left: isMobile ? 0 : SIDEBAR_WIDTH, top: isMobile ? MOBILE_NAV_HEIGHT : 0 }}
    >
      {/* Toolbar — vertical icon strip + controls panel side by side */}
      <div className="absolute left-3 top-3 z-20 flex items-start gap-1.5">
        {/* Icon strip (vertical): menu → replay → center → select → back */}
        <div className="flex flex-col gap-1">
          {/* Controls toggle (menu) */}
          <button
            onClick={() => setShowControls(v => !v)}
            className={`inline-flex items-center justify-center w-8 h-8 bg-th-base/80 backdrop-blur-sm border transition-colors ${
              showControls ? 'border-violet-500/40 text-violet-400' : 'border-th-hub-border text-th-secondary hover:text-violet-400'
            }`}
            title="Toggle controls (C)"
            aria-label="Toggle controls"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.3">
              <line x1="2" y1="3" x2="10" y2="3" /><circle cx="4" cy="3" r="1" fill="currentColor" />
              <line x1="2" y1="6" x2="10" y2="6" /><circle cx="7" cy="6" r="1" fill="currentColor" />
              <line x1="2" y1="9" x2="10" y2="9" /><circle cx="5" cy="9" r="1" fill="currentColor" />
            </svg>
          </button>
          {/* Info / guide */}
          <button
            onClick={() => setGuideOpen(true)}
            className="inline-flex items-center justify-center w-8 h-8 bg-th-base/80 backdrop-blur-sm border border-th-hub-border text-violet-400 hover:text-violet-300 transition-colors"
            title="Graph guide"
            aria-label="Graph guide"
          >
            <InfoIcon size={11} />
          </button>
          {/* Pop-in (replay) */}
          <button
            onClick={togglePopIn}
            className={`inline-flex items-center justify-center w-8 h-8 bg-th-base/80 backdrop-blur-sm border transition-colors ${
              popInActive ? 'border-violet-500/40 text-violet-400' : 'border-th-hub-border text-th-secondary hover:text-violet-400'
            }`}
            title={popInActive ? 'Stop pop-in' : 'Pop-in animation'}
            aria-label={popInActive ? 'Stop pop-in' : 'Pop-in animation'}
          >
            {popInActive ? (
              <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                <rect x="2" y="2" width="3" height="8" rx="0.5" />
                <rect x="7" y="2" width="3" height="8" rx="0.5" />
              </svg>
            ) : (
              <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                <path d="M3 1.5v9l7-4.5z" />
              </svg>
            )}
          </button>
          {/* Center view */}
          <button
            onClick={() => graphRef.current?.zoomToFit?.(400, 60)}
            className="inline-flex items-center justify-center w-8 h-8 text-th-secondary bg-th-base/80 backdrop-blur-sm border border-th-hub-border hover:text-violet-400 transition-colors"
            title="Center view"
            aria-label="Center view"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.3">
              <circle cx="6" cy="6" r="4" />
              <line x1="6" y1="1" x2="6" y2="3" />
              <line x1="6" y1="9" x2="6" y2="11" />
              <line x1="1" y1="6" x2="3" y2="6" />
              <line x1="9" y1="6" x2="11" y2="6" />
            </svg>
          </button>
          {/* 2D / 3D toggle */}
          <button
            onClick={() => setDimension(d => d === '2d' ? '3d' : '2d')}
            className="inline-flex items-center justify-center w-8 h-8 bg-th-base/80 backdrop-blur-sm border border-th-hub-border text-th-secondary hover:text-violet-400 transition-colors text-[10px] font-mono font-bold"
            title={dimension === '2d' ? 'Switch to 3D' : 'Switch to 2D'}
            aria-label={dimension === '2d' ? 'Switch to 3D' : 'Switch to 2D'}
          >
            {dimension === '2d' ? '3D' : '2D'}
          </button>
          {/* Select mode */}
          <button
            onClick={() => setSelectMode(v => !v)}
            className={`inline-flex items-center justify-center w-8 h-8 bg-th-base/80 backdrop-blur-sm border transition-colors ${
              selectMode ? 'border-cyan-500/40 text-cyan-400' : 'border-th-hub-border text-th-secondary hover:text-violet-400'
            }`}
            title={selectMode ? 'Exit selection mode' : 'Area selection mode'}
            aria-label={selectMode ? 'Exit selection mode' : 'Area selection mode'}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.3">
              <line x1="1" y1="1" x2="4" y2="1" />
              <line x1="8" y1="1" x2="11" y2="1" />
              <line x1="11" y1="1" x2="11" y2="4" />
              <line x1="11" y1="8" x2="11" y2="11" />
              <line x1="11" y1="11" x2="8" y2="11" />
              <line x1="4" y1="11" x2="1" y2="11" />
              <line x1="1" y1="11" x2="1" y2="8" />
              <line x1="1" y1="4" x2="1" y2="1" />
            </svg>
          </button>
          {/* Go back */}
          <Link
            to={secondBrainPath()}
            className="inline-flex items-center justify-center w-8 h-8 text-th-secondary bg-th-base/80 backdrop-blur-sm border border-th-hub-border hover:text-violet-400 hover:border-violet-500/40 transition-colors"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M8 2L4 6l4 4" />
            </svg>
          </Link>
        </div>

        {/* Controls panel (opens to the right of the icon strip) */}
        {showControls && (
          <GraphControls
            ref={searchInputRef}
            visibility={visibility}
            onVisibilityChange={setVisibility}
            settings={settings}
            onSettingsChange={setSettings}
            dimension={dimension}
            onDimensionChange={setDimension}
            nodeCount={popInActive ? popInCount : filtered.nodes.length}
            linkCount={filtered.links.length}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onSearchSubmit={onSearchSubmit}
            searchResultCount={searchResults.length}
            searchResults={searchResultsMeta}
            activeResultId={selectedId}
            onResultClick={onSearchResultClick}
            colorMode={colorMode}
            onColorModeChange={setColorMode}
            onReset={resetGraph}
          />
        )}
      </div>

      {/* Graph canvas */}
      <div
        ref={graphAreaRef}
        className="flex-1 min-w-0 h-full overflow-hidden relative"
        style={{
          cursor: selectMode ? 'crosshair' : undefined,
          ...(activeSubgraph ? {
            backgroundImage: 'radial-gradient(circle, rgba(139,92,246,0.08) 1px, transparent 1px)',
            backgroundSize: '20px 20px',
            backgroundColor: 'rgba(139,92,246,0.03)',
          } : {}),
        }}
      >
        <Suspense fallback={
          <div className="flex items-center justify-center h-full text-th-muted text-sm animate-pulse">
            Loading renderer...
          </div>
        }>
          {dimension === '2d' ? (
            <ForceGraph2D
              key={graphKey}
              ref={graphRef}
              graphData={filtered}
              width={graphDims.width}
              height={graphDims.height}
              nodeCanvasObject={nodeCanvasObject}
              nodePointerAreaPaint={nodePointerAreaPaint}
              nodeLabel={nodeTooltip}
              linkCanvasObject={linkCanvasObject}
              onNodeClick={onNodeClick}
              onNodeHover={onNodeHover}
              onBackgroundClick={onBackgroundClick}
              d3AlphaDecay={d3AlphaDecay}
              d3VelocityDecay={d3VelocityDecay}
              warmupTicks={settings.warmupTicks}
              cooldownTicks={300}
              enableNodeDrag={!isMobile}
              enableZoomInteraction={true}
              enablePanInteraction={!selectMode}
              backgroundColor="transparent"
            />
          ) : (
            <ForceGraph3D
              key={graphKey}
              ref={graphRef}
              graphData={filtered}
              width={graphDims.width}
              height={graphDims.height}
              nodeColor={nodeColor3d}
              nodeVal={nodeVal3d}
              nodeRelSize={6}
              nodeLabel={nodeTooltip}
              nodeResolution={8}
              linkColor={linkColor3d}
              linkOpacity={settings.edgeOpacity}
              linkWidth={0}
              onNodeClick={onNodeClick}
              onNodeHover={onNodeHover}
              onBackgroundClick={onBackgroundClick}
              backgroundColor="#000011"
              warmupTicks={settings.warmupTicks}
              cooldownTicks={200}
              enableNodeDrag={!isMobile}
            />
          )}
        </Suspense>

        {/* Shift+drag selection rectangle */}
        {dragSelect && (
          <div
            className="absolute border border-cyan-400/60 bg-cyan-400/10 pointer-events-none z-10"
            style={{
              left: Math.min(dragSelect.x0, dragSelect.x1),
              top: Math.min(dragSelect.y0, dragSelect.y1),
              width: Math.abs(dragSelect.x1 - dragSelect.x0),
              height: Math.abs(dragSelect.y1 - dragSelect.y0),
            }}
          />
        )}

        {/* Off-screen node indicators */}
        {offscreenIndicators.map((ind, i) => {
          const SIZE = 6;
          let style: React.CSSProperties;
          let points: string;
          switch (ind.edge) {
            case 'top':
              style = { left: ind.pos - SIZE, top: 2 };
              points = `${SIZE},0 0,${SIZE * 1.2} ${SIZE * 2},${SIZE * 1.2}`;
              break;
            case 'bottom':
              style = { left: ind.pos - SIZE, bottom: 2 };
              points = `0,0 ${SIZE * 2},0 ${SIZE},${SIZE * 1.2}`;
              break;
            case 'left':
              style = { left: 2, top: ind.pos - SIZE };
              points = `0,${SIZE} ${SIZE * 1.2},0 ${SIZE * 1.2},${SIZE * 2}`;
              break;
            case 'right':
              style = { right: 2, top: ind.pos - SIZE };
              points = `${SIZE * 1.2},${SIZE} 0,0 0,${SIZE * 2}`;
              break;
          }
          const opacity = Math.min(0.9, 0.25 + ind.count * 0.06);
          return (
            <svg
              key={`${ind.edge}-${ind.pos}`}
              className="absolute pointer-events-none z-10"
              width={SIZE * 2 + 2}
              height={SIZE * 2 + 2}
              style={style}
            >
              <polygon points={points} fill="#a78bfa" opacity={opacity} />
            </svg>
          );
        })}

        {/* Multi-selection prompt */}
        {multiSelected.size > 0 && (
          <div className="absolute bottom-4 right-4 z-20 flex flex-col gap-2 px-4 py-3 bg-th-base/95 backdrop-blur-sm border border-cyan-500/40 text-[11px] max-w-sm">
            <div className="text-cyan-300 font-medium">
              {multiSelected.size} note{multiSelected.size > 1 ? 's' : ''} selected
            </div>
            <div className="text-th-muted text-[10px] max-h-24 overflow-y-auto leading-relaxed">
              {multiSelectedNames.join(', ')}
            </div>
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={copySelectionToClipboard}
                className="px-2.5 py-1 bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/30 transition-colors text-[10px]"
              >
                Copy structured context
              </button>
              {multiSelected.size >= 2 && (
                <button
                  onClick={() => {
                    setSubgraphStack(prev => [...prev, new Set(multiSelected)]);
                    setMultiSelected(new Set());
                  }}
                  className="px-2.5 py-1 bg-violet-500/20 border border-violet-500/40 text-violet-300 hover:bg-violet-500/30 transition-colors text-[10px]"
                >
                  Isolate cluster
                </button>
              )}
              <button
                onClick={() => setMultiSelected(new Set())}
                className="px-2.5 py-1 border border-th-hub-border text-th-muted hover:text-th-secondary transition-colors text-[10px]"
              >
                Clear
              </button>
            </div>
          </div>
        )}

        {/* Subgraph breadcrumb — top-right of graph viewport */}
        {subgraphStack.length > 0 && (
          <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5 px-3 py-1.5 bg-th-base/90 backdrop-blur-sm border border-violet-500/30 text-[10px]">
            <button
              onClick={() => setSubgraphStack([])}
              className="text-th-muted hover:text-violet-300 transition-colors"
            >
              graph
            </button>
            {subgraphStack.map((_, i) => (
              <React.Fragment key={i}>
                <span className="text-violet-500/40">/</span>
                {i < subgraphStack.length - 1 ? (
                  <button
                    onClick={() => setSubgraphStack(prev => prev.slice(0, i + 1))}
                    className="text-th-muted hover:text-violet-300 transition-colors"
                  >
                    {subgraphStack[i].size}n
                  </button>
                ) : (
                  <span className="text-violet-300 font-medium">
                    {subgraphStack[i].size} nodes
                  </span>
                )}
              </React.Fragment>
            ))}
          </div>
        )}
      </div>

      {/* Heatmap legend */}
      {colorMode !== 'default' && colorMetrics && (
        <div className="absolute bottom-4 left-4 z-20 flex flex-col gap-1 px-3 py-2 bg-th-base/90 backdrop-blur-sm border border-th-hub-border">
          <span className="text-[9px] uppercase tracking-wider text-th-muted">{COLOR_MODE_LABELS[colorMode]}</span>
          <div className="w-32 h-2 rounded-full" style={{
            background: 'linear-gradient(to right, hsl(270,75%,30%), hsl(210,80%,40%), hsl(150,85%,42%), hsl(90,85%,50%), hsl(60,90%,55%))'
          }} />
          <div className="flex justify-between text-[9px] text-th-muted tabular-nums">
            <span>{colorMode === 'age' ? `${Math.round(colorMetrics.min)}d` : Math.round(colorMetrics.min)}</span>
            <span>{colorMode === 'age' ? `${Math.round(colorMetrics.max)}d` : Math.round(colorMetrics.max)}</span>
          </div>
        </div>
      )}

      {/* Pop-in counter */}
      {popInActive && filtered && (
        <div className="absolute bottom-4 left-4 z-20 px-3 py-1.5 bg-th-base/90 backdrop-blur-sm border border-violet-500/30 text-[11px] text-violet-400 tabular-nums">
          {popInCount} / {filtered.nodes.length}
        </div>
      )}

      {/* Toast notification */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-cyan-900/90 border border-cyan-500/40 text-cyan-200 text-[12px] backdrop-blur-sm animate-pulse">
          {toast}
        </div>
      )}

      {/* Toggle panel button (desktop only) */}
      {!showPanel && !isMobile && (
        <button
          onClick={() => setShowPanel(true)}
          className="absolute top-3 right-3 z-20 px-2 py-1 text-[10px] text-th-muted bg-th-base/80 backdrop-blur-sm border border-th-hub-border hover:text-violet-400 transition-colors"
        >
          Show panel
        </button>
      )}

      {/* Note preview panel — desktop: side column */}
      {showPanel && !isMobile && (
        <div
          className="shrink-0 bg-th-base border-l border-th-hub-border flex flex-col overflow-hidden select-text relative"
          style={{ width: panelWidth }}
        >
          {/* Resize drag handle */}
          <div
            className="absolute left-0 top-0 bottom-0 w-1 cursor-col-resize z-10 hover:bg-violet-500/30 transition-colors"
            style={panelDragging.current ? { background: 'rgba(139,92,246,0.3)' } : undefined}
            onMouseDown={e => {
              e.preventDefault();
              panelDragging.current = true;
              document.body.style.userSelect = 'none';
              document.body.style.cursor = 'col-resize';
              const startX = e.clientX;
              const startW = panelWidth;
              const onMove = (ev: MouseEvent) => {
                const delta = startX - ev.clientX;
                setPanelWidth(Math.max(PANEL_MIN, Math.min(PANEL_MAX, startW + delta)));
              };
              const onUp = () => {
                panelDragging.current = false;
                document.body.style.userSelect = '';
                document.body.style.cursor = '';
                window.removeEventListener('mousemove', onMove);
                window.removeEventListener('mouseup', onUp);
              };
              window.addEventListener('mousemove', onMove);
              window.addEventListener('mouseup', onUp);
            }}
          />
          <div className="flex items-center justify-between px-3 py-2 border-b border-th-hub-border bg-th-surface/30">
            <span className="text-[10px] text-th-muted uppercase tracking-wide">Preview</span>
            <div className="flex items-center gap-1">
              <button
                onClick={goToRandomNote}
                className="text-th-muted hover:text-violet-400 transition-colors p-1"
                title="Random note"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.2">
                  <rect x="2" y="2" width="8" height="8" rx="1.5" />
                  <circle cx="4.5" cy="4.5" r="0.7" fill="currentColor" stroke="none" />
                  <circle cx="7.5" cy="4.5" r="0.7" fill="currentColor" stroke="none" />
                  <circle cx="6" cy="6" r="0.7" fill="currentColor" stroke="none" />
                  <circle cx="4.5" cy="7.5" r="0.7" fill="currentColor" stroke="none" />
                  <circle cx="7.5" cy="7.5" r="0.7" fill="currentColor" stroke="none" />
                </svg>
              </button>
              <button
                onClick={() => setShowPanel(false)}
                className="text-th-muted hover:text-th-secondary transition-colors p-1"
              >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5">
                <line x1="2" y1="2" x2="8" y2="8" /><line x1="8" y1="2" x2="2" y2="8" />
              </svg>
              </button>
            </div>
          </div>
          {/* Connections — collapsible, shown when a node is pinned */}
          {previewId && previewNeighbors && index && (
            <div className="border-b border-th-hub-border text-[11px]">
              <button
                onClick={() => setShowConnections(v => !v)}
                className="flex items-center justify-between w-full px-3 py-1.5 text-[9px] text-th-muted uppercase tracking-wide hover:text-th-secondary transition-colors"
              >
                <span>Connections</span>
                <svg width="8" height="8" viewBox="0 0 8 8" fill="none" stroke="currentColor" strokeWidth="1.5"
                  style={{ transform: showConnections ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 150ms' }}
                >
                  <path d="M1 3l3 3 3-3" />
                </svg>
              </button>
              {showConnections && (
                <div className="flex flex-col gap-1 px-3 pb-2 max-h-[30vh] overflow-y-auto">
                  {Object.entries(previewNeighbors).map(([type, neighbors]) => (
                    <div key={type} className="flex flex-col gap-0.5">
                      <span className="text-[9px] uppercase tracking-wider" style={{ color: EDGE_COLORS[type as keyof typeof EDGE_COLORS] }}>
                        {type}
                      </span>
                      {neighbors.map(nb => (
                        <button
                          key={nb.id}
                          onClick={() => {
                            setSelectedId(nb.id);
                            setHoveredId(null);
                            const fg = graphRef.current;
                            if (!fg) return;
                            const node = filtered!.nodes.find((n: any) => n.id === nb.id) as any;
                            if (node && fg.centerAt) fg.centerAt(node.x, node.y, 400);
                            else if (node && fg.cameraPosition) {
                              fg.cameraPosition(
                                { x: node.x, y: node.y, z: (node.z ?? 0) + 200 },
                                { x: node.x, y: node.y, z: node.z ?? 0 }, 400,
                              );
                            }
                          }}
                          className="text-left px-1.5 py-0.5 text-th-secondary hover:text-violet-400 hover:bg-violet-500/10 transition-colors truncate"
                        >
                          {nb.name}
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          <NotePreviewPanel
            note={previewNote}
            html={noteHtml}
            loading={contentLoading}
            onNavigate={onNavigateFromPanel}
          />
        </div>
      )}

      {/* Note preview panel — mobile: slide-in from right, swipe to dismiss */}
      {isMobile && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-30 bg-black/50 transition-opacity"
            style={{
              opacity: mobilePanel && previewNote ? Math.max(0, 1 - swipeOffset / 200) : 0,
              pointerEvents: mobilePanel && previewNote ? 'auto' : 'none',
            }}
            onClick={() => setMobilePanel(false)}
          />
          {/* Sliding panel */}
          <div
            className={`fixed right-0 bottom-0 z-40 bg-th-base border-l border-th-hub-border flex flex-col overflow-hidden select-text ${swipingRef.current ? '' : 'transition-transform duration-200'}`}
            style={{
              top: MOBILE_NAV_HEIGHT,
              width: '85vw',
              maxWidth: 400,
              transform: mobilePanel && previewNote
                ? `translateX(${swipeOffset}px)`
                : 'translateX(100%)',
            }}
            onTouchStart={(e) => {
              if (e.touches.length !== 1) return;
              swipeStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY, time: Date.now() };
              swipingRef.current = false;
            }}
            onTouchMove={(e) => {
              if (!swipeStart.current || e.touches.length !== 1) return;
              const dx = e.touches[0].clientX - swipeStart.current.x;
              const dy = e.touches[0].clientY - swipeStart.current.y;
              // Only activate horizontal swipe to the right
              if (!swipingRef.current) {
                if (Math.abs(dx) < 10) return; // too early
                if (dx < 0 || Math.abs(dy) > Math.abs(dx) * 1.5) { swipeStart.current = null; return; }
                swipingRef.current = true;
              }
              e.preventDefault();
              setSwipeOffset(Math.max(0, dx));
            }}
            onTouchEnd={() => {
              if (!swipeStart.current || !swipingRef.current) { swipeStart.current = null; return; }
              const elapsed = Date.now() - swipeStart.current.time;
              const velocity = swipeOffset / Math.max(elapsed, 1);
              if (swipeOffset > 80 || velocity > 0.4) {
                setMobilePanel(false);
              }
              setSwipeOffset(0);
              swipingRef.current = false;
              swipeStart.current = null;
            }}
          >
            {/* Drag handle indicator */}
            <div className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1 h-8 rounded-full bg-th-muted/30 pointer-events-none" />
            {/* Mobile panel header */}
            <div className="flex items-center justify-between px-3 py-2.5 border-b border-th-hub-border bg-th-surface/30">
              <button
                onClick={() => setMobilePanel(false)}
                className="inline-flex items-center gap-1 text-[11px] text-th-secondary hover:text-violet-400 transition-colors"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M8 2L4 6l4 4" />
                </svg>
                Back to graph
              </button>
              {previewNote && (
                <a
                  href={secondBrainPath(previewNote.id)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-violet-400 hover:text-violet-300 transition-colors"
                >
                  open full ↗
                </a>
              )}
            </div>
            <NotePreviewPanel
              note={previewNote}
              html={noteHtml}
              loading={contentLoading}
              onNavigate={(uid) => { onNavigateFromPanel(uid); setMobilePanel(true); }}
            />
          </div>
        </>
      )}
      <GraphGuide isOpen={guideOpen} onClose={() => setGuideOpen(false)} isMobile={isMobile} />
    </div>
  );
};

export default SecondBrainGraphView;
