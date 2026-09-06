// Mini force-directed graph for the Second Brain sidebar
// Compact overview plus the expanded 2D/3D workspace. Topology and positions
// stay stable while result, preview and selection layers change paint only.

import React, { useState, useEffect, useRef, useCallback, useMemo, Suspense } from 'react';
import { forceCenter, forceCollide, forceLink, forceManyBody, forceSimulation } from 'd3-force';
import { initBrainIndex, type BrainIndex } from '../../lib/brainIndex';
import { useGraphRelevance } from '../../hooks/useGraphRelevance';
import { buildGraphData, type GraphData, type GraphNode, type GraphLink, type EdgeVisibility, EDGE_COLORS, assignRootColors, hexToRgb, ROOT_NEUTRAL } from './useGraphData';

export type GraphColorMode = 'centrality' | 'roots';
type SelectionRect = { x0: number; y0: number; x1: number; y1: number };
type OffscreenIndicator = { side: 'top' | 'right' | 'bottom' | 'left'; count: number; position: number };
type PhysicsSettings = { repulsion: number; linkDistance: number; linkStrength: number; collision: number; damping: number; gravity: number };
type CameraBookmark =
  | { dimension: '2d'; x: number; y: number; zoom: number }
  | { dimension: '3d'; position: { x: number; y: number; z: number }; target: { x: number; y: number; z: number } };
const DEFAULT_PHYSICS: PhysicsSettings = { repulsion: -30, linkDistance: 58, linkStrength: .11, collision: 3.2, damping: .32, gravity: .05 };
const NODE_SCALE = 1.8;
const EDGE_PRESENCE = 2;
const AreaInspectIcon: React.FC<{ size?: number }> = ({ size = 14 }) => <span aria-hidden="true" style={{ fontSize: size, lineHeight: 1 }}>%</span>;
const CopyIcon: React.FC = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="8" y="8" width="11" height="11" rx="1" /><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3" /></svg>;
const PHYSICS_STORAGE_KEY = 'wiki-graph-physics-v4';
// v9 tethers truly isolated notes near the constellation so one unconnected
// point cannot dictate the camera bounds.
const POSITIONS_STORAGE_KEY = 'wiki-graph-positions-v9';
const POSITIONS_SYNC_EVENT = 'wiki-graph-positions-updated';
const EDGE_VISIBILITY_STORAGE_KEY = 'wiki-graph-edge-visibility-v1';
const EDGE_VISIBILITY_EVENT = 'wiki-graph-edge-visibility-change';

const ForceGraph2D = React.lazy(() => import('react-force-graph-2d'));
const ForceGraph3D = React.lazy(() => import('react-force-graph-3d'));

const MINI_HEIGHT = 150;
// Canvas colors are raw values by necessity (no CSS cascade inside canvas paint).
// Purple centrality scale: periphery (violet-800) → core (violet-300).
const SCALE_LOW = [91, 33, 182];
const SCALE_HIGH = [196, 181, 253];
// Selection color: infraphysics lime, mirrors --cat-projects-accent (theme-constant)
const SELECT_RGB = [163, 230, 53];
const SELECT_HEX = '#a3e635';
const SELECT_RING = '#d9f99d';
// Semantic overlays stay inside the Wiki palette without collapsing into the
// purple centrality ramp: cool periwinkle = result, hot orchid = preview.
const RESULT_RGB = [129, 140, 248];
const RESULT_HEX = '#a5b4fc';
const PREVIEW_RGB = [232, 121, 249];
const PREVIEW_HEX = '#e879f9';
const WEBGL_RENDERER_CONFIG = { antialias: false, powerPreference: 'high-performance' as const };
const settledPositions = new Map<string, { x: number; y: number; z?: number }>();
let positionsHydrated = false;
let cachedBrainIndex: BrainIndex | null = null;
let cachedGraphTemplate: GraphData | null = null;
const hash01 = (value: string, salt: number) => { let hash = 2166136261 ^ salt; for (let i = 0; i < value.length; i += 1) { hash ^= value.charCodeAt(i); hash = Math.imul(hash, 16777619); } return (hash >>> 0) / 4294967295; };
const forceIsolatedSatellites = (linkedIds: Set<string>, strength = .045) => {
  let isolated: any[] = [];
  const force = (alpha: number) => {
    const k = strength * alpha;
    for (const node of isolated) {
      const targetX = (hash01(node.id, 71) - .5) * 300;
      const targetY = (hash01(node.id, 97) - .5) * 300;
      node.vx = (node.vx ?? 0) + (targetX - (node.x ?? 0)) * k;
      node.vy = (node.vy ?? 0) + (targetY - (node.y ?? 0)) * k;
    }
  };
  force.initialize = (nodes: any[]) => { isolated = nodes.filter(node => !linkedIds.has(node.id)); };
  return force;
};

const cloneGraph = (graph: GraphData): GraphData => ({ nodes: graph.nodes.map(node => ({ ...node })), links: graph.links.map(link => ({ ...link })) });
const seedConstellation = (graph: GraphData) => {
  if (!positionsHydrated) {
    positionsHydrated = true;
    try {
      const saved = JSON.parse(localStorage.getItem(POSITIONS_STORAGE_KEY) ?? '{}') as Record<string, { x: number; y: number; z?: number }>;
      Object.entries(saved).forEach(([id, position]) => { if (Number.isFinite(position.x) && Number.isFinite(position.y)) settledPositions.set(id, position); });
    } catch { /* A corrupt optional cache should never block the graph. */ }
  }
  if (graph.nodes.every(node => settledPositions.has(node.id))) { graph.nodes.forEach(node => Object.assign(node, settledPositions.get(node.id)!)); return graph; }
  // Plain isotropic random scatter. The topology, not a radial seed, decides
  // the final silhouette.
  graph.nodes.forEach(node => Object.assign(node, {
    x: (hash01(node.id, 17) - .5) * 320,
    y: (hash01(node.id, 43) - .5) * 320,
  }));
  const linkedIds = new Set<string>();
  graph.links.forEach(link => {
    linkedIds.add(typeof link.source === 'object' ? (link.source as GraphNode).id : link.source);
    linkedIds.add(typeof link.target === 'object' ? (link.target as GraphNode).id : link.target);
  });
  const simulation = forceSimulation(graph.nodes as any)
    .force('link', forceLink(graph.links as any).id((node: any) => node.id).distance(DEFAULT_PHYSICS.linkDistance).strength(DEFAULT_PHYSICS.linkStrength))
    .force('charge', forceManyBody().strength(DEFAULT_PHYSICS.repulsion).theta(.92).distanceMax(500))
    .force('collide', forceCollide(DEFAULT_PHYSICS.collision).strength(.76).iterations(1))
    .force('center', forceCenter(0, 0).strength(DEFAULT_PHYSICS.gravity))
    .force('isolated', forceIsolatedSatellites(linkedIds) as any)
    .alphaDecay(.04).velocityDecay(DEFAULT_PHYSICS.damping).stop();
  // This is synchronous and runs on the UI thread. A contained 88-tick seed is
  // visually settled enough; interactive reheating handles later adjustments.
  simulation.tick(88);
  simulation.stop();
  graph.nodes.forEach(node => { const positioned = node as GraphNode & { x: number; y: number }; settledPositions.set(node.id, { x: positioned.x, y: positioned.y }); });
  return graph;
};
const prepareGraph = (graph: GraphData) => seedConstellation(graph);

const MiniGraph: React.FC<{
  /** Persistent result set produced by search/filter controls. */
  resultIds: Set<string> | null;
  /** Reversible result set produced by hover/inspection. */
  previewIds?: Set<string> | null;
  /** Current search query (passed to full graph via URL) */
  searchQuery: string;
  /** Directory/root hover focus; drives the mini camera even without a query. */
  cameraFocusIds?: Set<string> | null;
  /** Exact semantic target used to decide whether the current framing is already legible. */
  cameraAnchorIds?: Set<string> | null;
  /** Base node coloring: purple centrality scale, or categorical color per root */
  colorMode?: GraphColorMode;
  expanded?: boolean;
  activeRoot?: string;
  onNodeOpen?: (node: GraphNode) => void;
  activeNodeId?: string | null;
  onNodeSelect?: (node: GraphNode) => void;
  onAreaPreview?: (ids: Set<string> | null) => void;
  onMinimize?: () => void;
}> = ({ resultIds, previewIds = null, searchQuery, cameraFocusIds = null, cameraAnchorIds = null, colorMode = 'centrality', expanded = false, activeRoot = '', onNodeOpen, activeNodeId, onNodeSelect, onAreaPreview, onMinimize }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<any>(null);

  // Data
  const [index, setIndex] = useState<BrainIndex | null>(cachedBrainIndex);
  const { getCentrality, getPercentile, loaded: relevanceLoaded } = useGraphRelevance();
  const [fullGraph, setFullGraph] = useState<GraphData | null>(() => cachedGraphTemplate ? prepareGraph(cloneGraph(cachedGraphTemplate)) : null);
  const [visibility, setVisibility] = useState<EdgeVisibility>(() => {
    const contentMode = { body: true, interaction: true, hierarchy: false };
    try {
      const stored = JSON.parse(localStorage.getItem(EDGE_VISIBILITY_STORAGE_KEY) ?? '{}') as Partial<EdgeVisibility>;
      return stored.hierarchy && !stored.body && !stored.interaction
        ? { body: false, interaction: false, hierarchy: true }
        : contentMode;
    } catch { return contentMode; }
  });
  // The expanded canvas must not boot at the mini-map's 220×150 dimensions.
  // Starting near its real viewport prevents an unnecessary WebGL/canvas
  // allocation and a misleading first camera fit before ResizeObserver fires.
  const [containerWidth, setContainerWidth] = useState(() => expanded && typeof window !== 'undefined' ? Math.max(320, window.innerWidth - 260) : 220);
  const [containerHeight, setContainerHeight] = useState(() => expanded && typeof window !== 'undefined' ? Math.max(240, window.innerHeight - 48) : MINI_HEIGHT);
  const [isFramed, setIsFramed] = useState(false);
  const highlightFrameRef = useRef(0);
  const hoverFrameRef = useRef(0);
  const areaPreviewFrameRef = useRef(0);
  const areaPreviewAtRef = useRef(0);
  const lastAreaSignatureRef = useRef('');
  const hoverLastAtRef = useRef(0);
  const hoverCardRef = useRef<HTMLDivElement>(null);
  const miniCameraHeldUntilRef = useRef(0);
  const miniCameraAutomationBlockedRef = useRef(false);
  const hadDirectoryFocusRef = useRef(false);
  const directoryCameraBookmarkRef = useRef<CameraBookmark | null>(null);
  const proximityClickRef = useRef<{ x: number; y: number } | null>(null);
  const selectionStartRef = useRef<{ x: number; y: number } | null>(null);
  const selectionRectRef = useRef<SelectionRect | null>(null);
  const selectionBaseRef = useRef<Set<string>>(new Set());
  const offscreenFrameRef = useRef(0);
  const copyResetTimerRef = useRef<number | null>(null);
  const layoutSaveTimerRef = useRef<number | null>(null);
  const physicsTouchedRef = useRef(false);
  const topologyChangedRef = useRef(false);
  const topologyCameraCancelledRef = useRef(false);
  const cameraTimerRef = useRef<number | null>(null);
  const highlightVisualRef = useRef({ strength: 0, matches: new Map<string, number>() });
  // While the highlight animation runs, autoPauseRedraw is disabled so the
  // canvas repaints without user interaction (the ref exposes no refresh()).
  const [highlightAnimating, setHighlightAnimating] = useState(false);
  const [miniAnalysisEnabled, setMiniAnalysisEnabled] = useState(false);
  const [densityAreaIds, setDensityAreaIds] = useState<Set<string> | null>(null);
  const [miniCameraDirty, setMiniCameraDirty] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dimension, setDimension] = useState<'2d' | '3d'>('2d');
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectionMode, setSelectionMode] = useState(false);
  const [multiSelected, setMultiSelected] = useState<Set<string>>(() => new Set());
  const [dragSelect, setDragSelect] = useState<SelectionRect | null>(null);
  const [copyState, setCopyState] = useState<'idle' | 'copying' | 'copied'>('idle');
  const [copyStats, setCopyStats] = useState<{ chars: number; tokens: number } | null>(null);
  const [offscreenIndicators, setOffscreenIndicators] = useState<OffscreenIndicator[]>([]);
  const [physics, setPhysics] = useState<PhysicsSettings>(() => {
    try { return { ...DEFAULT_PHYSICS, ...JSON.parse(localStorage.getItem(PHYSICS_STORAGE_KEY) ?? '{}') }; }
    catch { return DEFAULT_PHYSICS; }
  });
  const [physicsSettling, setPhysicsSettling] = useState(false);

  // Console route and graph inspection are two views of the same selection.
  useEffect(() => {
    setSelectedId(activeNodeId ?? null);
  }, [activeNodeId]);

  // Load index
  useEffect(() => {
    if (index) return;
    let cancelled = false;
    initBrainIndex().then(next => {
      cachedBrainIndex = next;
      if (!cancelled) setIndex(next);
    });
    return () => { cancelled = true; };
  }, [index]);

  // Track container width
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      if (width > 0) setContainerWidth(width);
      if (height > 0) setContainerHeight(height);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Build graph
  useEffect(() => {
    if (!index || !relevanceLoaded) return;
    const centralityMap: Record<string, number> = {};
    index.allFieldNotes.forEach(n => { centralityMap[n.id] = getCentrality(n.id); });
    if (!cachedGraphTemplate) cachedGraphTemplate = buildGraphData(index, centralityMap);
    // The initializer already clones a warm module-level template. Avoid
    // replacing it on mount: that used to launch a second renderer/simulation
    // every time the expanded view opened.
    setFullGraph(current => current ?? prepareGraph(cloneGraph(cachedGraphTemplate!)));
  }, [index, relevanceLoaded, getCentrality]);

  useEffect(() => {
    try { localStorage.setItem(PHYSICS_STORAGE_KEY, JSON.stringify(physics)); } catch { /* storage is optional */ }
  }, [physics]);
  useEffect(() => {
    const receivePhysics = (event: Event) => {
      const next = (event as CustomEvent<PhysicsSettings>).detail;
      if (!next) return;
      physicsTouchedRef.current = true;
      setPhysicsSettling(true);
      setPhysics(current => ({ ...current, ...next }));
    };
    window.addEventListener('wiki-graph-physics-change', receivePhysics);
    return () => window.removeEventListener('wiki-graph-physics-change', receivePhysics);
  }, []);
  useEffect(() => {
    const receiveVisibility = (event: Event) => {
      const next = (event as CustomEvent<EdgeVisibility>).detail;
      if (!next) return;
      // Edge visibility is deliberately a two-state topology. Normalising here
      // also migrates stale three-toggle state left in localStorage/open tabs.
      setVisibility(next.hierarchy && !next.body && !next.interaction
        ? { body: false, interaction: false, hierarchy: true }
        : { body: true, interaction: true, hierarchy: false });
      physicsTouchedRef.current = true;
      topologyChangedRef.current = true;
      topologyCameraCancelledRef.current = false;
      setPhysicsSettling(true);
    };
    window.addEventListener(EDGE_VISIBILITY_EVENT, receiveVisibility);
    return () => window.removeEventListener(EDGE_VISIBILITY_EVENT, receiveVisibility);
  }, [expanded]);
  const setEdgeMode = useCallback((mode: 'content' | 'hierarchy') => {
    const next: EdgeVisibility = mode === 'hierarchy'
      ? { body: false, interaction: false, hierarchy: true }
      : { body: true, interaction: true, hierarchy: false };
    setVisibility(next);
    try { localStorage.setItem(EDGE_VISIBILITY_STORAGE_KEY, JSON.stringify(next)); } catch { /* optional */ }
    window.dispatchEvent(new CustomEvent(EDGE_VISIBILITY_EVENT, { detail: next }));
  }, []);

  // The mini graph is already mounted behind the expanded workspace. Update
  // its coordinates in place when the large simulation settles instead of
  // rebuilding or running a second force engine.
  useEffect(() => {
    if (expanded) return;
    const syncPositions = () => {
      setFullGraph(current => current ? {
        ...current,
        nodes: current.nodes.map(node => {
          const position = settledPositions.get(node.id);
          return position ? { ...node, x: position.x, y: position.y } : node;
        }),
      } : current);
      setIsFramed(false);
    };
    window.addEventListener(POSITIONS_SYNC_EVENT, syncPositions);
    return () => window.removeEventListener(POSITIONS_SYNC_EVENT, syncPositions);
  }, [expanded]);

  // Base color per node. Centrality mode: purple scale over percentile (uniform
  // ramp, unlike raw PageRank). Roots mode: categorical color per address root.
  const rootHexByName = useMemo(() => fullGraph ? assignRootColors(fullGraph.nodes.map(node => node.address)) : new Map<string, string>(), [fullGraph]);
  const baseRgbById = useMemo(() => {
    const map = new Map<string, number[]>();
    if (!fullGraph) return map;
    if (colorMode === 'roots') {
      fullGraph.nodes.forEach(n => {
        map.set(n.id, hexToRgb(rootHexByName.get(n.address.split('//')[0]) ?? ROOT_NEUTRAL));
      });
    } else {
      fullGraph.nodes.forEach(n => {
        const t = getPercentile(n.id) / 100;
        map.set(n.id, SCALE_LOW.map((channel, index) => channel + (SCALE_HIGH[index] - channel) * t));
      });
    }
    return map;
  }, [colorMode, fullGraph, getPercentile, rootHexByName]);
  const baseCssById = useMemo(() => new Map(
    [...baseRgbById].map(([id, rgb]) => [id, `rgb(${rgb.map(Math.round).join(',')})`]),
  ), [baseRgbById]);
  const nodeRadiusById = useMemo(() => {
    const radii = new Map<string, number>();
    fullGraph?.nodes.forEach(node => {
      radii.set(node.id, (1.05 + Math.pow(getPercentile(node.id) / 100, .78) * 3.6) * NODE_SCALE);
    });
    return radii;
  }, [fullGraph, getPercentile]);

  // Apply hub filters — remove nodes not in the filtered set
  // Console filters change the result layer, never the overview topology.
  // Preserve object identity so force-graph does not rebuild 553 nodes when
  // only paint, search, or edge visibility changes.
  const filtered = fullGraph;


  const copySelection = useCallback(async (selection: Set<string> = multiSelected) => {
    if (!index || selection.size === 0) return;
    setCopyState('copying');
    const notes = [...selection].map(id => index.noteById.get(id)).filter(Boolean) as NonNullable<ReturnType<typeof index.noteById.get>>[];
    const contents = await Promise.all(notes.map(async note => {
      try {
        const response = await fetch(`/fieldnotes/${note.id}.json`);
        if (!response.ok) return { note, text: '' };
        const payload = await response.json();
        const documentNode = new DOMParser().parseFromString(payload.content ?? '', 'text/html');
        return { note, text: (documentNode.body.textContent ?? '').trim() };
      } catch { return { note, text: '' }; }
    }));
    const body = contents.map(({ note, text }) => `## ${note.name}\nAddress: ${note.address}\nUID: ${note.id}\n\n${text}`).join('\n\n---\n\n');
    const output = `# Wiki graph selection (${notes.length} notes)\n\n${body}`;
    try {
      await navigator.clipboard.writeText(output);
      setCopyStats({ chars: output.length, tokens: Math.round(output.length / 4) });
      setCopyState('copied');
      if (copyResetTimerRef.current !== null) window.clearTimeout(copyResetTimerRef.current);
      copyResetTimerRef.current = window.setTimeout(() => {
        copyResetTimerRef.current = null;
        setCopyState('idle');
        setMultiSelected(new Set());
        graphRef.current?.refresh?.();
      }, 1800);
    } catch {
      setCopyState('idle');
      setCopyStats(null);
    }
  }, [index, multiSelected]);

  const updateOffscreenIndicators = useCallback(() => {
    if (!expanded || dimension !== '2d' || !filtered) return;
    cancelAnimationFrame(offscreenFrameRef.current);
    offscreenFrameRef.current = requestAnimationFrame(() => {
      const graph = graphRef.current;
      if (!graph) return;
      const margin = 18;
      const buckets = new Map<OffscreenIndicator['side'], { count: number; sum: number }>();
      filtered.nodes.forEach(node => {
        const positioned = node as GraphNode & { x?: number; y?: number };
        if (!Number.isFinite(positioned.x) || !Number.isFinite(positioned.y)) return;
        const point = graph.graph2ScreenCoords?.(positioned.x, positioned.y);
        if (!point) return;
        const outside = [
          { side: 'left' as const, distance: margin - point.x, position: point.y / containerHeight },
          { side: 'right' as const, distance: point.x - (containerWidth - margin), position: point.y / containerHeight },
          { side: 'top' as const, distance: margin - point.y, position: point.x / containerWidth },
          { side: 'bottom' as const, distance: point.y - (containerHeight - margin), position: point.x / containerWidth },
        ].filter(candidate => candidate.distance > 0).sort((a, b) => b.distance - a.distance)[0];
        if (!outside) return;
        const bucket = buckets.get(outside.side) ?? { count: 0, sum: 0 };
        bucket.count += 1; bucket.sum += Math.max(.08, Math.min(.92, outside.position)); buckets.set(outside.side, bucket);
      });
      setOffscreenIndicators([...buckets].map(([side, bucket]) => ({ side, count: bucket.count, position: bucket.sum / bucket.count })));
    });
  }, [containerHeight, containerWidth, dimension, expanded, filtered]);

  useEffect(() => {
    if (!expanded || dimension !== '2d') { setOffscreenIndicators([]); return; }
    updateOffscreenIndicators();
    return () => cancelAnimationFrame(offscreenFrameRef.current);
  }, [expanded, dimension, updateOffscreenIndicators]);

  // Selection neighbourhood: incoming references plus the complete hierarchy
  // below the selected concept. Both traversals are linear and only rerun when
  // the persistent selection changes.
  const backlinkDepthById = useMemo(() => {
    const depths = new Map<string, number>();
    if (!selectedId || !fullGraph) return depths;
    const selectedRoot = fullGraph.nodes.find(node => node.id === selectedId)?.address.split('//')[0];
    const rootById = new Map(fullGraph.nodes.map(node => [node.id, node.address.split('//')[0]]));
    const incoming = new Map<string, string[]>();
    fullGraph.links.forEach(link => {
      if (link.type === 'hierarchy') return;
      const source = typeof link.source === 'object' ? (link.source as GraphNode).id : link.source;
      const target = typeof link.target === 'object' ? (link.target as GraphNode).id : link.target;
      const children = incoming.get(target) ?? [];
      children.push(source); incoming.set(target, children);
    });
    const queue: Array<[string, number]> = [[selectedId, 0]];
    const visited = new Set([selectedId]);
    for (let cursor = 0; cursor < queue.length; cursor += 1) {
      const [parent, depth] = queue[cursor];
      (incoming.get(parent) ?? []).forEach(child => {
        if (rootById.get(child) !== selectedRoot) return;
        if (visited.has(child)) return;
        visited.add(child); depths.set(child, depth + 1); queue.push([child, depth + 1]);
      });
    }
    const hierarchyChildren = new Map<string, string[]>();
    fullGraph.links.forEach(link => {
      if (link.type !== 'hierarchy') return;
      const source = typeof link.source === 'object' ? (link.source as GraphNode).id : link.source;
      const target = typeof link.target === 'object' ? (link.target as GraphNode).id : link.target;
      const children = hierarchyChildren.get(source) ?? [];
      children.push(target); hierarchyChildren.set(source, children);
    });
    const hierarchyQueue: Array<[string, number]> = [[selectedId, 0]];
    const hierarchyVisited = new Set([selectedId]);
    for (let cursor = 0; cursor < hierarchyQueue.length; cursor += 1) {
      const [parent, depth] = hierarchyQueue[cursor];
      (hierarchyChildren.get(parent) ?? []).forEach(child => {
        if (hierarchyVisited.has(child)) return;
        hierarchyVisited.add(child);
        const nextDepth = depth + 1;
        depths.set(child, Math.min(depths.get(child) ?? Infinity, nextDepth));
        hierarchyQueue.push([child, nextDepth]);
      });
    }
    return depths;
  }, [fullGraph, selectedId]);
  const hoveredNode = useMemo(() => fullGraph?.nodes.find(node => node.id === hoveredId) ?? null, [fullGraph, hoveredId]);
  const generationPalette = ['#d9f99d', '#a3e635', '#4ade80', '#22d3ee', '#60a5fa', '#a78bfa', '#f472b6', '#fb923c'];
  const nodeVisualColor = useCallback((node: GraphNode) => {
    if (node.id === selectedId) return SELECT_HEX;
    const depth = backlinkDepthById.get(node.id);
    if (selectedId && depth !== undefined) return generationPalette[(depth - 1) % generationPalette.length];
    if (activeRoot && node.address.split('//')[0] !== activeRoot) return '#374151';
    return baseCssById.get(node.id) ?? `rgb(${SCALE_LOW.join(',')})`;
  }, [activeRoot, backlinkDepthById, baseCssById, selectedId]);
  useEffect(() => { graphRef.current?.refresh?.(); }, [hoveredId]);

  const handleNearestHover = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    if (selectionMode) return;
    // UI panels live over the canvas. Never infer a node through one of them.
    if (!(event.target instanceof HTMLCanvasElement)) {
      setHoveredId(current => current === null ? current : null);
      return;
    }
    const rect = containerRef.current?.getBoundingClientRect(), graph = graphRef.current;
    if (!rect || !graph || !filtered) return;
    const x = event.clientX - rect.left, y = event.clientY - rect.top;
    if (hoverCardRef.current) hoverCardRef.current.style.transform = `translate3d(${Math.max(4, Math.min(x + 12, rect.width - 170))}px,${Math.max(4, Math.min(y + 12, rect.height - 42))}px,0)`;
    // 3D hover identity comes from the renderer's native raycaster. Here we
    // only move the HTML card, an O(1) operation.
    if (dimension === '3d') return;
    if (performance.now() - hoverLastAtRef.current < 32) return;
    hoverLastAtRef.current = performance.now();
    cancelAnimationFrame(hoverFrameRef.current);
    hoverFrameRef.current = requestAnimationFrame(() => {
      const graphPoint = graph.screen2GraphCoords?.(x, y);
      if (!graphPoint) return;
      const zoom = Math.max(.01, graph.zoom?.() ?? 1);
      let nearest: string | null = null, nearestDistance = (expanded ? 28 : 18) / zoom;
      for (const node of filtered.nodes) {
        const positioned = node as GraphNode & { x?: number; y?: number };
        if (!Number.isFinite(positioned.x) || !Number.isFinite(positioned.y)) continue;
        const distance = Math.hypot(positioned.x! - graphPoint.x, positioned.y! - graphPoint.y);
        if (distance < nearestDistance) { nearestDistance = distance; nearest = node.id; }
      }
      setHoveredId(current => current === nearest ? current : nearest);
    });
  }, [dimension, expanded, filtered, selectionMode]);

  const handleMiniAreaHover = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    if (!miniAnalysisEnabled || !onAreaPreview || !(event.target instanceof HTMLCanvasElement)) return;
    const now = performance.now();
    if (now - areaPreviewAtRef.current < 90) return;
    areaPreviewAtRef.current = now;
    cancelAnimationFrame(areaPreviewFrameRef.current);
    const clientX = event.clientX, clientY = event.clientY;
    areaPreviewFrameRef.current = requestAnimationFrame(() => {
      const rect = containerRef.current?.getBoundingClientRect(), graph = graphRef.current;
      if (!rect || !graph || !filtered) return;
      const pointerX = clientX - rect.left, pointerY = clientY - rect.top;
      const screenRadiusSq = 34 * 34;
      const ids = new Set<string>();
      filtered.nodes.forEach(node => {
        const positioned = node as GraphNode & { x?: number; y?: number; z?: number };
        if (!Number.isFinite(positioned.x) || !Number.isFinite(positioned.y)) return;
        const point = graph.graph2ScreenCoords?.(positioned.x, positioned.y, positioned.z ?? 0);
        if (!point) return;
        const dx = point.x - pointerX, dy = point.y - pointerY;
        if (dx * dx + dy * dy <= screenRadiusSq) ids.add(node.id);
      });
      const signature = [...ids].sort().join('|');
      if (signature === lastAreaSignatureRef.current) return;
      lastAreaSignatureRef.current = signature;
      const nextIds = ids.size ? ids : null;
      setDensityAreaIds(nextIds);
      onAreaPreview(nextIds);
    });
  }, [dimension, expanded, filtered, miniAnalysisEnabled, onAreaPreview]);

  const densityBreakdown = useMemo(() => {
    if (!densityAreaIds?.size || !fullGraph) return [] as Array<{ root: string; count: number; percent: number }>;
    const counts = new Map<string, number>();
    fullGraph.nodes.forEach(node => {
      if (!densityAreaIds.has(node.id)) return;
      const root = node.address.split('//')[0];
      counts.set(root, (counts.get(root) ?? 0) + 1);
    });
    return [...counts].map(([root, count]) => ({ root, count, percent: count / densityAreaIds.size * 100 })).sort((a, b) => b.count - a.count || a.root.localeCompare(b.root));
  }, [densityAreaIds, fullGraph]);
  useEffect(() => () => {
    cancelAnimationFrame(hoverFrameRef.current);
    cancelAnimationFrame(areaPreviewFrameRef.current);
    cancelAnimationFrame(offscreenFrameRef.current);
    if (copyResetTimerRef.current !== null) window.clearTimeout(copyResetTimerRef.current);
    if (layoutSaveTimerRef.current !== null) window.clearTimeout(layoutSaveTimerRef.current);
    if (cameraTimerRef.current !== null) window.clearTimeout(cameraTimerRef.current);
  }, []);

  // Manual navigation always wins over cinematic focus. A short quiet period
  // keeps wheel/drag gestures from being undone by hover-driven React updates.
  const holdMiniCamera = useCallback((event: React.SyntheticEvent) => {
    if (!(event.target instanceof HTMLCanvasElement)) return;
    if (expanded) {
      // A topology change may have queued a fit for engine-stop. Any direct
      // camera/node gesture transfers ownership to the user and cancels that
      // late fit without interrupting the physical settlement itself.
      topologyCameraCancelledRef.current = true;
      return;
    }
    miniCameraHeldUntilRef.current = performance.now() + 900;
    miniCameraAutomationBlockedRef.current = true;
    setMiniCameraDirty(true);
    if (cameraTimerRef.current !== null) window.clearTimeout(cameraTimerRef.current);
  }, [expanded]);

  // Desktop-style marquee selection over the rendered image. Nodes are tested
  // after projection to screen coordinates, so the exact same gesture works
  // in 2D and in the camera's current 3D view (no expensive volume picking).
  useEffect(() => {
    const element = containerRef.current;
    if (!element || !expanded || !selectionMode || !filtered) return;
    let selecting = false;
    let startX = 0, startY = 0;
    const minimumDrag = 5;

    const onMouseDown = (event: MouseEvent) => {
      if (event.button !== 0 || !(event.target instanceof HTMLCanvasElement)) return;
      const rect = element.getBoundingClientRect();
      selecting = true;
      startX = event.clientX - rect.left;
      startY = event.clientY - rect.top;
      selectionBaseRef.current = event.shiftKey || event.ctrlKey || event.metaKey ? new Set(multiSelected) : new Set();
      event.preventDefault();
      event.stopPropagation();
    };
    const onMouseMove = (event: MouseEvent) => {
      if (!selecting) return;
      const rect = element.getBoundingClientRect();
      const next = { x0: startX, y0: startY, x1: event.clientX - rect.left, y1: event.clientY - rect.top };
      if (Math.abs(next.x1 - startX) > minimumDrag || Math.abs(next.y1 - startY) > minimumDrag) setDragSelect(next);
    };
    const onMouseUp = (event: MouseEvent) => {
      if (!selecting || event.button !== 0) return;
      selecting = false;
      const rect = element.getBoundingClientRect();
      const endX = event.clientX - rect.left, endY = event.clientY - rect.top;
      setDragSelect(null);
      if (Math.abs(endX - startX) <= minimumDrag && Math.abs(endY - startY) <= minimumDrag) {
        if (selectionBaseRef.current.size === 0) setMultiSelected(new Set());
        return;
      }
      const graph = graphRef.current;
      if (!graph?.graph2ScreenCoords) return;
      const left = Math.min(startX, endX), right = Math.max(startX, endX);
      const top = Math.min(startY, endY), bottom = Math.max(startY, endY);
      const ids = new Set(selectionBaseRef.current);
      filtered.nodes.forEach(node => {
        const positioned = node as GraphNode & { x?: number; y?: number; z?: number };
        if (!Number.isFinite(positioned.x) || !Number.isFinite(positioned.y)) return;
        const point = graph.graph2ScreenCoords(positioned.x, positioned.y, positioned.z ?? 0);
        if (point && point.x >= left && point.x <= right && point.y >= top && point.y <= bottom) ids.add(node.id);
      });
      setMultiSelected(ids);
      setCopyStats(null);
      graph.refresh?.();
      void copySelection(ids);
    };

    element.addEventListener('mousedown', onMouseDown, true);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      element.removeEventListener('mousedown', onMouseDown, true);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [copySelection, dimension, expanded, filtered, multiSelected, selectionMode]);

  useEffect(() => {
    const canvas = containerRef.current?.querySelector('canvas');
    if (canvas) {
      canvas.style.cursor = selectionMode ? 'crosshair' : (!expanded && hoveredId ? 'none' : expanded && hoveredId ? 'pointer' : 'grab');
    }
  }, [dimension, expanded, hoveredId, selectionMode]);

  useEffect(() => {
    if (!expanded) return;
    const onEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (dragSelect || multiSelected.size > 0) {
        event.preventDefault(); event.stopImmediatePropagation();
        selectionStartRef.current = null; selectionRectRef.current = null;
        setDragSelect(null); setMultiSelected(new Set()); setCopyStats(null);
        graphRef.current?.refresh?.();
        return;
      }
      if (selectionMode) {
        event.preventDefault(); event.stopImmediatePropagation();
        setSelectionMode(false);
      }
    };
    window.addEventListener('keydown', onEscape, true);
    return () => window.removeEventListener('keydown', onEscape, true);
  }, [dragSelect, expanded, multiSelected.size, selectionMode]);

  const handlePointerDown = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (selectionMode && dimension === '2d') {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const point = { x: event.clientX - rect.left, y: event.clientY - rect.top };
      selectionStartRef.current = point;
      selectionBaseRef.current = event.shiftKey || event.ctrlKey || event.metaKey ? new Set(multiSelected) : new Set();
      const selection = { x0: point.x, y0: point.y, x1: point.x, y1: point.y };
      selectionRectRef.current = selection; setDragSelect(selection);
      event.currentTarget.setPointerCapture(event.pointerId);
      return;
    }
    if (!(event.target instanceof HTMLCanvasElement)) return;
    proximityClickRef.current = { x: event.clientX, y: event.clientY };
  }, [dimension, multiSelected, selectionMode]);

  const handlePointerMove = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (!selectionStartRef.current || !selectionMode) return;
    const rect = containerRef.current?.getBoundingClientRect();
    const graph = graphRef.current;
    if (!rect || !graph || !filtered) return;
    const selection = { ...selectionStartRef.current, x1: event.clientX - rect.left, y1: event.clientY - rect.top };
    selectionRectRef.current = selection; setDragSelect(selection);
    const left = Math.min(selection.x0, selection.x1), right = Math.max(selection.x0, selection.x1);
    const top = Math.min(selection.y0, selection.y1), bottom = Math.max(selection.y0, selection.y1);
    const ids = new Set(selectionBaseRef.current);
    filtered.nodes.forEach(node => {
      const positioned = node as GraphNode & { x?: number; y?: number };
      if (!Number.isFinite(positioned.x) || !Number.isFinite(positioned.y)) return;
      const point = graph.graph2ScreenCoords?.(positioned.x, positioned.y);
      if (point && point.x >= left && point.x <= right && point.y >= top && point.y <= bottom) ids.add(node.id);
    });
    setMultiSelected(ids); setCopyStats(null); graph.refresh?.();
  }, [filtered, selectionMode]);

  const handlePointerUp = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    const selection = selectionRectRef.current;
    if (selectionStartRef.current && selection) {
      if (Math.abs(selection.x1 - selection.x0) <= 4 && Math.abs(selection.y1 - selection.y0) <= 4 && selectionBaseRef.current.size === 0) setMultiSelected(new Set());
      selectionStartRef.current = null; selectionRectRef.current = null; setDragSelect(null);
      if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
      return;
    }
    const start = proximityClickRef.current; proximityClickRef.current = null;
    if (start && hoveredId && Math.hypot(event.clientX - start.x, event.clientY - start.y) < 5) {
      setSelectedId(hoveredId);
      if (!expanded) {
        const node = filtered?.nodes.find(candidate => candidate.id === hoveredId);
        if (node) onNodeSelect?.(node);
      }
    }
  }, [expanded, filtered, hoveredId, onNodeSelect]);

  // Refit only when the structural node set changes. Query highlighting never
  // changes `filtered`, so typing cannot reset the camera or the simulation.
  useEffect(() => { setIsFramed(false); }, [filtered?.nodes.length, expanded, dimension]);
  const frameVisibleCore = useCallback((instance: any, duration = 0) => {
    if (!instance || !filtered?.nodes.length) return false;
    if (dimension === '3d') {
      // One camera animation only. Reading zoom immediately after zoomToFit
      // returned the old value and the second animation cancelled the fit.
      instance.zoomToFit?.(duration, expanded ? 72 : 10);
      return true;
    }
    const positioned = filtered.nodes.filter(node => Number.isFinite((node as any).x) && Number.isFinite((node as any).y)) as Array<GraphNode & { x: number; y: number }>;
    // A partial initialization produces exactly the corner-fragment failure
    // this routine is meant to prevent. Wait until practically all nodes have
    // usable coordinates, then frame once.
    if (positioned.length < filtered.nodes.length * .98) return false;
    if (expanded) {
      const xs = positioned.map(node => node.x), ys = positioned.map(node => node.y);
      const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
      const zoom = Math.max(.05, Math.min((containerWidth - 108) / Math.max(1, maxX - minX), (containerHeight - 108) / Math.max(1, maxY - minY)));
      instance.centerAt?.((minX + maxX) / 2, (minY + maxY) / 2, duration);
      instance.zoom?.(zoom, duration);
      return true;
    }
    const xs = positioned.map(node => node.x).sort((a, b) => a - b);
    const ys = positioned.map(node => node.y).sort((a, b) => a - b);
    // Frame the central 98% and keep a deliberate breathing margin. Only true
    // outliers stop dictating the camera; the constellation still reads whole.
    const lo = Math.floor((positioned.length - 1) * .01);
    const hi = Math.ceil((positioned.length - 1) * .99);
    const minX = xs[lo], maxX = xs[hi], minY = ys[lo], maxY = ys[hi];
    // The sidebar is an overview, not a crop: retain generous negative space
    // around the 98% core so the constellation reads as a whole on entry.
    const zoom = Math.max(.05, Math.min((containerWidth - 22) / Math.max(1, maxX - minX), (containerHeight - 22) / Math.max(1, maxY - minY)) * .76);
    instance.zoom?.(zoom, duration);
    instance.centerAt?.((minX + maxX) / 2, (minY + maxY) / 2, duration);
    return true;
  }, [containerHeight, containerWidth, dimension, expanded, filtered]);
  useEffect(() => {
    if (!filtered?.nodes.length) return;
    let innerFrame = 0;
    const frame = requestAnimationFrame(() => { innerFrame = requestAnimationFrame(() => {
      const instance = graphRef.current;
      if ((expanded || !miniCameraAutomationBlockedRef.current) && frameVisibleCore(instance, expanded ? 220 : 0)) setIsFramed(true);
    }); });
    return () => { cancelAnimationFrame(frame); cancelAnimationFrame(innerFrame); };
  }, [dimension, expanded, filtered?.nodes.length, frameVisibleCore]);

  // Zoom to fit after simulation settles — closer default
  const frameGraph = useCallback(() => {
    const instance = graphRef.current;
    if (!instance || !filtered?.nodes.length || isFramed) return;
    if (!expanded && miniCameraAutomationBlockedRef.current) return;
    if (frameVisibleCore(instance)) setIsFramed(true);
  }, [filtered, frameVisibleCore, isFramed]);

  // Cinematic directory camera shared by mini and expanded views. Changes are
  // coalesced so moving rapidly through the tree never queues stale journeys.
  useEffect(() => {
    if (!filtered?.nodes.length) return;
    if (miniAnalysisEnabled) {
      if (cameraTimerRef.current !== null) window.clearTimeout(cameraTimerRef.current);
      return;
    }
    const wasDirectoryFocused = hadDirectoryFocusRef.current;
    const hasDirectoryFocus = Boolean(cameraFocusIds?.size);
    if (!wasDirectoryFocused && hasDirectoryFocus) {
      const graph = graphRef.current;
      if (graph) {
        if (dimension === '2d') {
          const center = graph.screen2GraphCoords?.(containerWidth / 2, containerHeight / 2);
          const zoom = graph.zoom?.();
          if (center && Number.isFinite(zoom)) directoryCameraBookmarkRef.current = { dimension: '2d', x: center.x, y: center.y, zoom };
        } else {
          const camera = graph.cameraPosition?.();
          const target = graph.controls?.()?.target;
          if (camera && target) directoryCameraBookmarkRef.current = { dimension: '3d', position: { x: camera.x, y: camera.y, z: camera.z }, target: { x: target.x, y: target.y, z: target.z } };
        }
      }
    }
    hadDirectoryFocusRef.current = hasDirectoryFocus;
    if (wasDirectoryFocused && !cameraFocusIds?.size && (!searchQuery.trim() || expanded) && !miniAnalysisEnabled) {
      if (cameraTimerRef.current !== null) window.clearTimeout(cameraTimerRef.current);
      cameraTimerRef.current = window.setTimeout(() => {
        if (performance.now() < miniCameraHeldUntilRef.current) return;
        const graph = graphRef.current;
        const bookmark = directoryCameraBookmarkRef.current;
        directoryCameraBookmarkRef.current = null;
        const duration = expanded ? 720 : 950;
        if (bookmark?.dimension === '2d' && dimension === '2d') {
          graph?.centerAt?.(bookmark.x, bookmark.y, duration);
          graph?.zoom?.(bookmark.zoom, duration);
        } else if (bookmark?.dimension === '3d' && dimension === '3d') {
          graph?.cameraPosition?.(bookmark.position, bookmark.target, duration);
        } else {
          frameVisibleCore(graph, duration);
        }
      }, 170);
      return () => { if (cameraTimerRef.current !== null) window.clearTimeout(cameraTimerRef.current); };
    }
    // Expanded search highlights results but does not hijack the camera;
    // directory preview is the explicit navigation gesture there.
    const explicitFocus = cameraFocusIds ?? (!expanded && searchQuery.trim() ? resultIds : null);
    if (!explicitFocus) return;
    if (performance.now() < miniCameraHeldUntilRef.current) return;
    if (cameraTimerRef.current !== null) window.clearTimeout(cameraTimerRef.current);
    cameraTimerRef.current = window.setTimeout(() => {
      const graph = graphRef.current;
      if (!graph) return;
      if (performance.now() < miniCameraHeldUntilRef.current) return;
      const cameraIds = explicitFocus;
      const matches = cameraIds
        ? filtered.nodes.filter(node => cameraIds.has(node.id) && Number.isFinite((node as any).x) && Number.isFinite((node as any).y)) as Array<GraphNode & { x: number; y: number }>
        : [];
      if (!matches.length) return;
      // If the semantic target is already comfortably readable, emphasis is
      // sufficient. Avoid gratuitous camera motion, especially for deep leaf
      // nodes whose wider root context is already on screen.
      const legibilityIds = cameraAnchorIds?.size ? cameraAnchorIds : cameraIds;
      const projected = filtered.nodes.flatMap(node => {
        if (!legibilityIds?.has(node.id)) return [];
        const positioned = node as GraphNode & { x?: number; y?: number; z?: number };
        if (!Number.isFinite(positioned.x) || !Number.isFinite(positioned.y)) return [];
        const point = graph.graph2ScreenCoords?.(positioned.x, positioned.y, positioned.z ?? 0);
        return point ? [point] : [];
      });
      const safeX = containerWidth * .12, safeY = containerHeight * .12;
      const visibleCount = projected.filter(point => point.x >= safeX && point.x <= containerWidth - safeX && point.y >= safeY && point.y <= containerHeight - safeY).length;
      if (projected.length > 0 && visibleCount / projected.length >= .64) return;
      if (expanded && dimension === '3d') {
        graph.zoomToFit?.(720, 72, (object: any) => Boolean(object?.id && cameraIds.has(object.id)));
        return;
      }
      const xs = matches.map(node => node.x), ys = matches.map(node => node.y);
      const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
      const spreadX = Math.max(34, maxX - minX), spreadY = Math.max(28, maxY - minY);
      const targetZoom = Math.min(expanded ? 2.2 : 1.55, Math.max(.18, Math.min((containerWidth * (expanded ? .72 : .68)) / spreadX, (containerHeight * (expanded ? .68 : .62)) / spreadY)));
      const duration = expanded ? 720 : 950;
      graph.centerAt?.((minX + maxX) / 2, (minY + maxY) / 2, duration);
      graph.zoom?.(targetZoom, duration);
    }, 120);
    return () => { if (cameraTimerRef.current !== null) window.clearTimeout(cameraTimerRef.current); };
  }, [cameraAnchorIds, cameraFocusIds, containerHeight, containerWidth, dimension, expanded, filtered, frameVisibleCore, miniAnalysisEnabled, resultIds, searchQuery]);

  const saveSettledLayout = useCallback(() => {
    if (!fullGraph) return;
    fullGraph.nodes.forEach(node => {
      const positioned = node as GraphNode & { x?: number; y?: number; z?: number };
      if (!Number.isFinite(positioned.x) || !Number.isFinite(positioned.y)) return;
      const position = { x: positioned.x!, y: positioned.y!, ...(Number.isFinite(positioned.z) ? { z: positioned.z } : {}) };
      settledPositions.set(node.id, position);
    });
    if (expanded) window.dispatchEvent(new Event(POSITIONS_SYNC_EVENT));
    // localStorage is synchronous. Coalesce rapid engine stops and serialize
    // after interaction has gone quiet instead of blocking the settling frame.
    if (layoutSaveTimerRef.current !== null) window.clearTimeout(layoutSaveTimerRef.current);
    layoutSaveTimerRef.current = window.setTimeout(() => {
      layoutSaveTimerRef.current = null;
      const serialized: Record<string, { x: number; y: number; z?: number }> = {};
      fullGraph.nodes.forEach(node => {
        const position = settledPositions.get(node.id);
        if (position) serialized[node.id] = position;
      });
      try { localStorage.setItem(POSITIONS_STORAGE_KEY, JSON.stringify(serialized)); } catch { /* in-memory sync still works */ }
    }, 320);
  }, [expanded, fullGraph]);

  const centerGraph = useCallback(() => {
    const instance = graphRef.current;
    if (!instance || !filtered?.nodes.length) return;
    // The expanded portal already starts to the right of both application
    // sidebars. Inside this canvas only the compact tool rail occupies space.
    const occupiedLeft = expanded ? 58 : 0;
    const occupiedRight = 0;
    if (dimension === '2d') {
      const positioned = filtered.nodes.filter(node => Number.isFinite((node as any).x) && Number.isFinite((node as any).y)) as Array<GraphNode & { x: number; y: number }>;
      if (!positioned.length) return;
      const xs = positioned.map(node => node.x), ys = positioned.map(node => node.y);
      const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
      const graphWidth = Math.max(1, maxX - minX), graphHeight = Math.max(1, maxY - minY);
      const availableWidth = Math.max(180, containerWidth - occupiedLeft - occupiedRight - 20);
      const availableHeight = Math.max(180, containerHeight - 40);
      const zoom = Math.max(.05, Math.min((availableWidth - 56) / graphWidth, (availableHeight - 56) / graphHeight));
      const graphCenterX = (minX + maxX) / 2, graphCenterY = (minY + maxY) / 2;
      // centerAt controls the graph coordinate placed at the canvas center.
      // Moving it left by half the occupied UI width moves the graph's visual
      // center right, into the center of the genuinely available viewport.
      instance.zoom?.(zoom, 320);
      instance.centerAt?.(graphCenterX - (occupiedLeft - occupiedRight) / (2 * zoom), graphCenterY, 320);
      return;
    }
    // Isolated satellite notes remain navigable, but they must not dictate the
    // scale of the connected constellation when the user asks to center it.
    const connectedIds = new Set(filtered.nodes.filter(node => (node.inDegree ?? 0) + (node.outDegree ?? 0) > 0).map(node => node.id));
    instance.zoomToFit?.(420, occupiedLeft + 52, (object: any) => Boolean(object?.id && connectedIds.has(object.id)));
  }, [containerHeight, containerWidth, dimension, expanded, filtered]);

  const inspectNode = useCallback((node: GraphNode) => {
    setSelectedId(node.id);
    onNodeSelect?.(node);
  }, [onNodeSelect]);

  // Apply compact force settings — tighter layout
  useEffect(() => {
    let innerFrame = 0;
    const frame = requestAnimationFrame(() => {
      innerFrame = requestAnimationFrame(() => {
        const fg = graphRef.current;
        if (!fg?.d3Force) return;
        const hierarchyMode = visibility.hierarchy && !visibility.body && !visibility.interaction;
        const charge = fg.d3Force('charge');
        charge?.strength?.(hierarchyMode ? Math.min(physics.repulsion, -48) : Math.min(physics.repulsion, -36));
        // Barnes-Hut plus a finite interaction horizon keeps the many-body
        // force sub-quadratic and stops distant clusters spending work on one
        // another when a slider is being scrubbed.
        charge?.theta?.(.92);
        charge?.distanceMax?.(500);
        const link = fg.d3Force('link');
        link?.distance?.((edge: GraphLink) => hierarchyMode
          ? (edge.type === 'hierarchy' ? Math.min(46, physics.linkDistance) : Math.max(82, physics.linkDistance * 1.45))
          : (edge.type === 'hierarchy' ? Math.max(72, physics.linkDistance * 1.2) : Math.max(58, physics.linkDistance)));
        link?.strength?.((edge: GraphLink) => hierarchyMode
          ? (edge.type === 'hierarchy' ? Math.max(.2, physics.linkStrength * 1.8) : .0025)
          : (edge.type === 'hierarchy' ? .016 : Math.max(.085, physics.linkStrength)));
        fg.d3Force('center')?.strength?.(physics.gravity);
        // No global confinement: finite-range repulsion prevents isolated
        // nodes from accelerating forever without imposing a silhouette.
        if (fg.d3Force('boundary')) fg.d3Force('boundary', null);
        if (!fg.d3Force('isolated') || topologyChangedRef.current) {
          const linkedIds = new Set<string>();
          filtered?.links.forEach(link => {
            linkedIds.add(typeof link.source === 'object' ? (link.source as GraphNode).id : link.source);
            linkedIds.add(typeof link.target === 'object' ? (link.target as GraphNode).id : link.target);
          });
          fg.d3Force('isolated', forceIsolatedSatellites(linkedIds));
        }
        if (dimension === '2d') {
          const collide = fg.d3Force('collide');
          if (collide?.radius) collide.radius(physics.collision).strength(.76).iterations(1);
          else fg.d3Force('collide', forceCollide(physics.collision).strength(.76).iterations(1));
        }
        // Reheat only after every new coefficient has reached d3. Doing this in
        // the range-input handler raced React's commit and often reheated the
        // old model, whose tick budget was already exhausted.
        if (physicsTouchedRef.current) {
          physicsTouchedRef.current = false;
          fg.d3ReheatSimulation?.();
        }
      });
    });
    return () => { cancelAnimationFrame(frame); cancelAnimationFrame(innerFrame); };
  }, [dimension, expanded, filtered, physics, visibility.body, visibility.hierarchy, visibility.interaction]);

  const heatGraph = useCallback(() => {
    if (!physicsSettling) setPhysicsSettling(true);
    // Let React commit the non-zero tick budget before restarting the engine.
    requestAnimationFrame(() => graphRef.current?.d3ReheatSimulation?.());
  }, [physicsSettling]);

  // A full-window WebGL canvas at devicePixelRatio 2/3 renders 4x/9x as many
  // pixels. Cap only the 3D renderer; geometry remains at CSS resolution.
  useEffect(() => {
    if (!expanded || dimension !== '3d') return;
    let innerFrame = 0;
    const frame = requestAnimationFrame(() => {
      innerFrame = requestAnimationFrame(() => {
        const renderer = graphRef.current?.renderer?.();
        if (!renderer) return;
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.2));
        renderer.setSize(containerWidth, containerHeight, false);
        const controls = graphRef.current?.controls?.();
        if (controls) {
          // TrackballControls defaults to 1.2, which is excessively slow for
          // this graph's camera distance. Increase dolly sensitivity without
          // changing rotation/pan or introducing wheel-event React work.
          controls.zoomSpeed = 3;
        }
      });
    });
    return () => { cancelAnimationFrame(frame); cancelAnimationFrame(innerFrame); };
  }, [containerHeight, containerWidth, dimension, expanded]);

  // Highlight set
  const highlightSet = useMemo(() => previewIds ?? resultIds ?? new Set<string>(), [previewIds, resultIds]);
  const isHighlighting = previewIds !== null || resultIds !== null;

  // A highlight update is paint-only. Interpolate the visual mask while keeping
  // the simulation completely cold: positions, zoom, and pan never reset.
  useEffect(() => {
    cancelAnimationFrame(highlightFrameRef.current);
    const nodes = fullGraph?.nodes ?? [];
    if (miniAnalysisEnabled) {
      highlightVisualRef.current = {
        strength: isHighlighting ? 1 : 0,
        matches: new Map(nodes.map(node => [node.id, highlightSet.has(node.id) ? 1 : 0])),
      };
      // `refresh()` is not exposed consistently by every react-force-graph
      // wrapper/version. Open the redraw gate for exactly one committed frame;
      // this works in both mini and expanded canvases without running physics.
      setHighlightAnimating(true);
      highlightFrameRef.current = requestAnimationFrame(() => {
        graphRef.current?.refresh?.();
        highlightFrameRef.current = requestAnimationFrame(() => setHighlightAnimating(false));
      });
      return;
    }
    const startedAt = performance.now();
    const duration = 180;
    const startStrength = highlightVisualRef.current.strength;
    const targetStrength = isHighlighting ? 1 : 0;
    const starts = new Map<string, number>(nodes.map(node => [node.id, highlightVisualRef.current.matches.get(node.id) ?? 0]));
    const matches = new Map(starts);
    setHighlightAnimating(true);

    const animate = (now: number) => {
      const raw = Math.min(1, (now - startedAt) / duration);
      const eased = 1 - Math.pow(1 - raw, 3);
      nodes.forEach(node => {
        const start = starts.get(node.id) ?? 0;
        const target = highlightSet.has(node.id) ? 1 : 0;
        matches.set(node.id, start + (target - start) * eased);
      });
      highlightVisualRef.current = {
        strength: startStrength + (targetStrength - startStrength) * eased,
        matches,
      };
      if (raw < 1) highlightFrameRef.current = requestAnimationFrame(animate);
      // One extra frame so the final values paint before redraw auto-pauses again
      else highlightFrameRef.current = requestAnimationFrame(() => setHighlightAnimating(false));
    };
    highlightFrameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(highlightFrameRef.current);
  }, [fullGraph, highlightSet, isHighlighting, miniAnalysisEnabled]);

  // Node rendering — compact, no labels
  const nodeCanvasObject = useCallback((node: any, ctx: CanvasRenderingContext2D, globalScale = 1) => {
    const n = node as GraphNode & { x: number; y: number };
    const r = nodeRadiusById.get(n.id) ?? NODE_SCALE;
    const { strength, matches } = highlightVisualRef.current;
    const match = matches.get(n.id) ?? 0;
    const emphasis = strength * match;
    const depth = backlinkDepthById.get(n.id);
    const selected = n.id === selectedId;
    const groupSelected = multiSelected.has(n.id);
    const hovered = n.id === hoveredId;
    // Non-matching nodes keep their purple scale, only gently dimmed
    const nodeAlpha = selected ? 1 : selectedId ? (depth !== undefined ? Math.max(.84, .99 - depth * .035) : .78) : Math.max(0.9, 1 - strength * (1 - match) * 0.1);
    const baseHex = nodeVisualColor(n);
    const base = selectedId ? null : (baseRgbById.get(n.id) ?? SCALE_LOW);
    const branchEmphasis = selected ? 1 : depth !== undefined ? Math.max(.28, .72 - depth * .06) : 0;
    // Persistent results use cool periwinkle; transient previews use orchid.
    // Selection remains lime, so all three states can coexist without lying
    // about which interaction produced each highlight.
    const isPreviewing = previewIds !== null;
    const emphasisColor = isPreviewing ? PREVIEW_RGB : RESULT_RGB;
    const emphasisHex = isPreviewing ? PREVIEW_HEX : RESULT_HEX;
    // Transient hover must remain visible even while another node owns the
    // persistent branch selection. Previously selectedId bypassed this blend.
    const rawBase = baseRgbById.get(n.id) ?? SCALE_LOW;
    // While a preview is active, filtered/search results remain as a quiet
    // periwinkle context layer instead of disappearing behind the orchid lens.
    const resultContext = isPreviewing && Boolean(resultIds?.has(n.id));
    const transientBase = resultContext
      ? rawBase.map((channel, index) => channel + (RESULT_RGB[index] - channel) * .5)
      : rawBase;
    const fillColor = selected ? baseHex : emphasis > .02
      ? `rgb(${transientBase.map((channel, index) => Math.round(channel + (emphasisColor[index] - channel) * emphasis)).join(', ')})`
      : base && branchEmphasis > .001
        ? `rgb(${base.map((channel, index) => Math.round(channel + (emphasisColor[index] - channel) * branchEmphasis)).join(', ')})`
        : baseCssById.get(n.id) ?? baseHex;
    // Screen-space light energy follows zoom. At a distant overview the halo
    // nearly collapses into the solid core instead of merging neighbouring
    // nodes into a fuzzy cloud; close inspection restores the full glow.
    const zoomEnergy = Math.max(.06, Math.min(1, (globalScale - .16) / .84));
    // One cheap, screen-space halo. Avoid canvas shadowBlur, whose offscreen
    // blur pass is substantially more expensive while the graph is moving.
    ctx.beginPath();
    ctx.arc(n.x, n.y, r + (.35 + (1.7 + emphasis * .9) * zoomEnergy) / globalScale, 0, 2 * Math.PI);
    ctx.fillStyle = fillColor;
    ctx.globalAlpha = nodeAlpha * (.035 + (.16 + emphasis * .09) * zoomEnergy);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(n.x, n.y, r, 0, 2 * Math.PI);
    ctx.fillStyle = fillColor;
    ctx.globalAlpha = nodeAlpha;
    ctx.fill();

    if (emphasis > .08) {
      ctx.beginPath();
      ctx.arc(n.x, n.y, r + Math.max(.9, 1.55 / globalScale), 0, 2 * Math.PI);
      ctx.strokeStyle = emphasisHex;
      ctx.globalAlpha = .38 + emphasis * .58;
      ctx.lineWidth = Math.max(.65, 1.15 / globalScale);
      ctx.stroke();
    }

    if (selected) {
      ctx.beginPath();
      ctx.arc(n.x, n.y, r + Math.max(1.15, 2 / globalScale), 0, 2 * Math.PI);
      ctx.strokeStyle = '#d9f99d';
      ctx.globalAlpha = .98;
      ctx.lineWidth = Math.max(.9, 1.5 / globalScale);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(n.x, n.y, r + Math.max(2.2, 3.4 / globalScale), 0, 2 * Math.PI);
      ctx.strokeStyle = SELECT_HEX;
      ctx.globalAlpha = .28;
      ctx.lineWidth = Math.max(.55, .9 / globalScale);
      ctx.stroke();
    }

    if (groupSelected) {
      ctx.beginPath(); ctx.arc(n.x, n.y, r + Math.max(1.1, 1.8 / globalScale), 0, 2 * Math.PI);
      ctx.strokeStyle = '#67e8f9'; ctx.globalAlpha = .95; ctx.lineWidth = Math.max(.65, 1.25 / globalScale); ctx.stroke();
    }

    if (hovered) {
      const root = n.address.split('//')[0];
      const hoverStroke = expanded ? (rootHexByName.get(root) ?? SELECT_RING) : '#c4b5fd';
      ctx.strokeStyle = hoverStroke;
      ctx.lineWidth = Math.max(.7, 1.4 / globalScale);
      ctx.shadowColor = hoverStroke; ctx.shadowBlur = 5 / globalScale;
      ctx.stroke(); ctx.shadowBlur = 0;
    }

    if (emphasis > 0.02) {
      ctx.shadowColor = emphasisHex;
      ctx.shadowBlur = 5 * emphasis;
      ctx.strokeStyle = emphasisHex;
      ctx.lineWidth = 0.4 + 0.5 * emphasis;
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    if (selected || depth === 1) {
      ctx.shadowColor = SELECT_HEX;
      ctx.shadowBlur = selected ? 5 : 2;
      ctx.strokeStyle = SELECT_RING;
      ctx.lineWidth = selected ? .9 : .45;
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    if (expanded && (selected || depth === 1)) {
      const fontSize = Math.max(2.4, 9 / globalScale);
      ctx.font = `${fontSize}px ui-monospace, SFMono-Regular, monospace`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      ctx.fillStyle = selected ? '#f7fee7' : '#d1d5db';
      ctx.globalAlpha = selected ? 1 : depth !== undefined ? .88 : .66;
      ctx.fillText(n.name, n.x, n.y + r + 1.2 / globalScale);
    }

    ctx.globalAlpha = 1;
  }, [backlinkDepthById, baseCssById, baseRgbById, expanded, hoveredId, multiSelected, nodeRadiusById, nodeVisualColor, previewIds, resultIds, rootHexByName, selectedId]);

  const nodePointerAreaPaint = useCallback((node: any, color: string, ctx: CanvasRenderingContext2D) => {
    const n = node as GraphNode & { x: number; y: number };
    ctx.beginPath();
    ctx.arc(n.x, n.y, (nodeRadiusById.get(n.id) ?? NODE_SCALE) + 2, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill();
  }, [nodeRadiusById]);

  // Link rendering — thin, subtle
  const linkCanvasObject = useCallback((link: any, ctx: CanvasRenderingContext2D) => {
    const l = link as GraphLink & { source: { x: number; y: number }; target: { x: number; y: number } };
    if (!visibility[l.type]) return;
    if (!Number.isFinite(l.source?.x) || !Number.isFinite(l.source?.y) || !Number.isFinite(l.target?.x) || !Number.isFinite(l.target?.y)) return;
    const { strength, matches } = highlightVisualRef.current;
    const branch = Math.min(
      matches.get((l.source as any).id as string) ?? 0,
      matches.get((l.target as any).id as string) ?? 0,
    );
    const sourceId = (l.source as any).id as string, targetId = (l.target as any).id as string;
    const sourceDepth = sourceId === selectedId ? 0 : backlinkDepthById.get(sourceId), targetDepth = targetId === selectedId ? 0 : backlinkDepthById.get(targetId);
    const backlinkBranch = l.type === 'hierarchy'
      ? sourceDepth !== undefined && targetDepth !== undefined && targetDepth === sourceDepth + 1
      : sourceDepth !== undefined && targetDepth !== undefined && sourceDepth === targetDepth + 1;
    ctx.beginPath();
    ctx.moveTo(l.source.x, l.source.y);
    ctx.lineTo(l.target.x, l.target.y);
    const resultBranch = Boolean(previewIds && resultIds?.has(sourceId) && resultIds.has(targetId));
    ctx.strokeStyle = backlinkBranch ? SELECT_HEX : branch > 0.15 ? (previewIds ? PREVIEW_HEX : RESULT_HEX) : resultBranch ? 'rgba(165,180,252,.62)' : EDGE_COLORS[l.type];
    const baseAlpha = expanded ? .32 : .29;
    ctx.globalAlpha = Math.min(1, (selectedId ? (backlinkBranch ? .94 : .14) : baseAlpha * (1 - strength) + strength * (.14 + .66 * branch)) * EDGE_PRESENCE);
    ctx.lineWidth = (backlinkBranch ? 1.45 : (expanded ? .72 : .58) + .46 * branch) * Math.sqrt(EDGE_PRESENCE);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }, [backlinkDepthById, previewIds, resultIds, selectedId, visibility.body, visibility.hierarchy, visibility.interaction]);

  const nodeColor3d = useCallback((node: any) => {
    const id = (node as GraphNode).id;
    if (id === hoveredId) return '#f5f3ff';
    if ((highlightVisualRef.current.matches.get(id) ?? 0) > .08) return previewIds ? PREVIEW_HEX : RESULT_HEX;
    if (previewIds && resultIds?.has(id)) return '#818cf8';
    return nodeVisualColor(node as GraphNode);
  }, [hoveredId, nodeVisualColor, previewIds, resultIds]);
  const nodeVal3d = useCallback((node: any) => (1.2 + (node as GraphNode).centrality * 7) * NODE_SCALE * ((node as GraphNode).id === selectedId ? 1.55 : 1), [selectedId]);
  const nodeLabel3d = useCallback(() => '', []);
  const linkColor3d = useCallback((link: any) => {
    if (!visibility[(link as GraphLink).type]) return 'rgba(0,0,0,0)';
    const source = typeof link.source === 'object' ? link.source.id : link.source;
    const target = typeof link.target === 'object' ? link.target.id : link.target;
    const sourceDepth = source === selectedId ? 0 : backlinkDepthById.get(source), targetDepth = target === selectedId ? 0 : backlinkDepthById.get(target);
    const branch = link.type === 'hierarchy'
      ? sourceDepth !== undefined && targetDepth !== undefined && targetDepth === sourceDepth + 1
      : sourceDepth !== undefined && targetDepth !== undefined && sourceDepth === targetDepth + 1;
    const previewBranch = Math.min(highlightVisualRef.current.matches.get(source) ?? 0, highlightVisualRef.current.matches.get(target) ?? 0) > .15;
    const resultBranch = Boolean(previewIds && resultIds?.has(source) && resultIds.has(target));
    return branch ? SELECT_HEX : previewBranch ? (previewIds ? PREVIEW_HEX : RESULT_HEX) : resultBranch ? '#818cf8' : EDGE_COLORS[(link as GraphLink).type];
  }, [backlinkDepthById, previewIds, resultIds, selectedId, visibility.body, visibility.hierarchy, visibility.interaction]);

  if (!filtered) {
    return (
      <div
        ref={containerRef}
        className="flex items-center justify-center text-th-muted text-[10px] animate-pulse"
        style={{ height: expanded ? '100%' : MINI_HEIGHT }}
      >
        Loading...
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative ${selectionMode ? 'cursor-crosshair' : ''}`}
      style={{ height: expanded ? '100%' : MINI_HEIGHT }}
      onMouseMove={!miniAnalysisEnabled ? handleNearestHover : handleMiniAreaHover}
      onMouseLeave={() => { setHoveredId(null); lastAreaSignatureRef.current = ''; if (miniAnalysisEnabled) { setDensityAreaIds(null); onAreaPreview?.(null); } }}
      onWheelCapture={holdMiniCamera}
      onPointerDownCapture={holdMiniCamera}
      onPointerDown={!selectionMode && dimension === '2d' ? handlePointerDown : undefined}
      onPointerUp={!selectionMode && dimension === '2d' ? handlePointerUp : undefined}
    >
      <Suspense fallback={
        <div className="flex items-center justify-center h-full text-th-muted text-[10px] animate-pulse">
          Loading...
        </div>
      }>
        <div className="h-full">
          {dimension === '2d' || !expanded ? <ForceGraph2D
            ref={graphRef}
            graphData={filtered}
            width={containerWidth}
            height={containerHeight}
            nodeCanvasObject={nodeCanvasObject}
            nodePointerAreaPaint={nodePointerAreaPaint}
            nodeLabel={() => ''}
            linkCanvasObject={linkCanvasObject}
            onEngineStop={() => { if (topologyChangedRef.current) { topologyChangedRef.current = false; if (expanded ? !topologyCameraCancelledRef.current : !miniCameraAutomationBlockedRef.current) { if (expanded) centerGraph(); else frameVisibleCore(graphRef.current, 650); } topologyCameraCancelledRef.current = false; } else frameGraph(); updateOffscreenIndicators(); saveSettledLayout(); setPhysicsSettling(false); }}
            onZoomEnd={updateOffscreenIndicators}
            onNodeClick={(node: any) => (expanded || miniAnalysisEnabled) && inspectNode(node as GraphNode)}
            onNodeRightClick={(node: any) => expanded && onNodeOpen?.(node as GraphNode)}
            onNodeHover={() => undefined}
            autoPauseRedraw={!highlightAnimating}
            d3AlphaDecay={0.05}
            d3VelocityDecay={physics.damping}
            warmupTicks={0}
            cooldownTicks={physicsSettling ? (expanded ? 96 : 72) : 0}
            enableNodeDrag={expanded && !selectionMode}
            onNodeDrag={heatGraph}
            onNodeDragEnd={() => { heatGraph(); saveSettledLayout(); }}
            enableZoomInteraction={true}
            enablePanInteraction={!selectionMode}
            backgroundColor="transparent"
          /> : <ForceGraph3D
            ref={graphRef}
            graphData={filtered}
            width={containerWidth}
            height={containerHeight}
            nodeLabel={nodeLabel3d}
            nodeColor={nodeColor3d}
            nodeVal={nodeVal3d}
            nodeRelSize={6}
            nodeResolution={5}
            nodeOpacity={0.94}
            linkColor={linkColor3d}
            linkOpacity={Math.min(1, (selectedId ? .14 : .38) * EDGE_PRESENCE)}
            linkWidth={0}
            onEngineStop={() => { if (topologyChangedRef.current) { topologyChangedRef.current = false; if (!topologyCameraCancelledRef.current) centerGraph(); topologyCameraCancelledRef.current = false; } else frameGraph(); saveSettledLayout(); setPhysicsSettling(false); }}
            onNodeClick={(node: any) => inspectNode(node as GraphNode)}
            onNodeHover={(node: any) => setHoveredId(node ? (node as GraphNode).id : null)}
            onNodeRightClick={(node: any) => onNodeOpen?.(node as GraphNode)}
            d3AlphaDecay={0.05}
            d3VelocityDecay={physics.damping}
            warmupTicks={0}
            cooldownTicks={physicsSettling ? 96 : 0}
            enableNodeDrag={!selectionMode}
            onNodeDrag={heatGraph}
            onNodeDragEnd={() => { heatGraph(); saveSettledLayout(); }}
            enableNavigationControls={!selectionMode}
            showNavInfo
            rendererConfig={WEBGL_RENDERER_CONFIG}
            backgroundColor="#000011"
          />}
        </div>
        {!expanded && <nav aria-label="Mini graph tools" className="absolute bottom-1 left-1 z-20 flex items-center gap-px border border-th-hub-border bg-th-base/90 p-0.5 font-mono shadow-sm backdrop-blur-sm">
          <button
            type="button"
            aria-pressed={miniAnalysisEnabled}
            title="Inspect local density"
            onClick={() => {
              miniCameraAutomationBlockedRef.current = true;
              setMiniCameraDirty(true);
              setMiniAnalysisEnabled(current => {
                const next = !current;
                if (!next) { lastAreaSignatureRef.current = ''; setDensityAreaIds(null); onAreaPreview?.(null); }
                return next;
              });
            }}
            className={`grid h-5 w-5 place-items-center text-[10px] transition-colors ${miniAnalysisEnabled ? 'bg-violet-400/15 text-violet-300' : 'text-th-muted hover:bg-th-surface hover:text-th-primary'}`}
          ><AreaInspectIcon size={13} /></button>
          {(miniAnalysisEnabled || miniCameraDirty) && <button type="button" title="Return to full graph" onClick={() => { miniCameraAutomationBlockedRef.current = false; frameVisibleCore(graphRef.current, 950); setMiniCameraDirty(false); }} className="grid h-5 w-5 place-items-center text-[12px] text-th-muted transition-colors hover:bg-th-surface hover:text-violet-300">⌖</button>}
          <i className="mx-0.5 h-3 w-px bg-th-hub-border" />
          {(['content', 'hierarchy'] as const).map(mode => <button
            key={mode}
            type="button"
            aria-pressed={mode === 'hierarchy' ? visibility.hierarchy : visibility.body || visibility.interaction}
            title={mode === 'hierarchy' ? 'Path hierarchy' : 'Content references and interactions'}
            onClick={() => setEdgeMode(mode)}
            className={`relative grid h-5 w-5 place-items-center transition-[opacity,background-color] hover:bg-th-surface ${(mode === 'hierarchy' ? visibility.hierarchy : visibility.body || visibility.interaction) ? 'opacity-100' : 'opacity-25'}`}
          ><i className="block h-px w-3.5" style={{ backgroundColor: mode === 'hierarchy' ? EDGE_COLORS.hierarchy : EDGE_COLORS.body, transform: mode === 'hierarchy' ? 'rotate(35deg)' : undefined }} /><span className="sr-only">{mode}</span></button>)}
        </nav>}
        {expanded && <nav aria-label="Graph tools" className="absolute left-4 top-4 z-50 flex w-11 flex-col border border-th-hub-border bg-th-base p-1 font-mono shadow-xl">
          {onMinimize && <button type="button" onClick={onMinimize} title="Minimize graph" aria-label="Minimize graph" className="mb-2 grid h-8 w-full place-items-center border-b border-th-hub-border pb-1 text-th-muted transition-colors hover:bg-th-surface hover:text-violet-300"><svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"><path d="M1.5 4.5h3v-3M10.5 7.5h-3v3M4.5 4.5l-3-3M7.5 7.5l3 3" /></svg></button>}
          <div className="mb-1 border-b border-th-hub-border pb-1">
            {(['2d', '3d'] as const).map(mode => <button key={mode} type="button" title={`${mode.toUpperCase()} view`} onPointerEnter={() => { if (mode === '3d') void import('react-force-graph-3d'); }} onFocus={() => { if (mode === '3d') void import('react-force-graph-3d'); }} onClick={() => { if (mode === dimension) return; physicsTouchedRef.current = true; topologyChangedRef.current = true; topologyCameraCancelledRef.current = false; setPhysicsSettling(true); setDimension(mode); if (mode === '3d') setSelectionMode(false); }} className={`mb-0.5 grid h-8 w-full place-items-center text-[9px] font-semibold uppercase ${dimension === mode ? 'bg-violet-400/15 text-violet-300' : 'text-th-muted hover:bg-th-surface hover:text-th-primary'}`}>{mode}</button>)}
          </div>
          <button type="button" title="Center graph" onClick={centerGraph} className="mb-1 grid h-8 w-full place-items-center border-b border-th-hub-border pb-1 text-base leading-none text-th-muted hover:bg-th-surface hover:text-violet-300">⌖</button>
          <button type="button" title="Select area and copy notes" onClick={() => { setSelectionMode(value => !value); setMiniAnalysisEnabled(false); setDensityAreaIds(null); onAreaPreview?.(null); setHoveredId(null); setDragSelect(null); selectionStartRef.current = null; selectionRectRef.current = null; }} className={`mb-1 grid h-8 w-full place-items-center border-b border-th-hub-border pb-1 ${selectionMode ? 'bg-cyan-400/15 text-cyan-300' : 'text-th-muted hover:bg-th-surface hover:text-th-primary'}`}><CopyIcon /></button>
          <button type="button" aria-pressed={miniAnalysisEnabled} title="Inspect local density" onClick={() => { setMiniAnalysisEnabled(value => { const next = !value; if (!next) { setDensityAreaIds(null); onAreaPreview?.(null); } return next; }); setSelectionMode(false); setDragSelect(null); }} className={`mb-1 grid h-8 w-full place-items-center border-b border-th-hub-border pb-1 ${miniAnalysisEnabled ? 'bg-violet-400/15 text-violet-300' : 'text-th-muted hover:bg-th-surface hover:text-th-primary'}`}><AreaInspectIcon /></button>
          <div className="pt-0.5">
            {(['content', 'hierarchy'] as const).map(mode => { const active = mode === 'hierarchy' ? visibility.hierarchy : visibility.body || visibility.interaction; return <button key={mode} type="button" title={mode === 'hierarchy' ? 'Path hierarchy' : 'Content references and interactions'} aria-pressed={active} onClick={() => setEdgeMode(mode)} className={`relative mb-0.5 grid h-8 w-full place-items-center hover:bg-th-surface ${active ? 'opacity-100' : 'opacity-25'}`}><i className="block h-px w-5" style={{ backgroundColor: mode === 'hierarchy' ? EDGE_COLORS.hierarchy : EDGE_COLORS.body, transform: mode === 'hierarchy' ? 'rotate(35deg)' : undefined }} /><span className="absolute bottom-0.5 right-1 text-[6px] uppercase text-th-muted">{mode === 'hierarchy' ? 'P' : 'C'}</span></button>; })}
          </div>
        </nav>}
        {expanded && copyState !== 'idle' && <div role="status" className="pointer-events-none absolute bottom-6 left-1/2 z-[80] -translate-x-1/2 border border-cyan-400/30 bg-th-base/95 px-4 py-2 font-mono text-[10px] text-cyan-300 shadow-xl backdrop-blur-sm">{copyState === 'copying' ? `copying ${multiSelected.size} notes…` : `${multiSelected.size} notes copied${copyStats ? ` · ~${copyStats.tokens.toLocaleString()} tokens` : ''}`}</div>}
        {expanded && dragSelect && <div className="pointer-events-none absolute z-40 border border-cyan-300 bg-cyan-300/10" style={{ left: Math.min(dragSelect.x0, dragSelect.x1), top: Math.min(dragSelect.y0, dragSelect.y1), width: Math.abs(dragSelect.x1 - dragSelect.x0), height: Math.abs(dragSelect.y1 - dragSelect.y0) }} />}
        {expanded && dimension === '2d' && offscreenIndicators.map(indicator => { const vertical = indicator.side === 'left' || indicator.side === 'right'; const style: React.CSSProperties = vertical ? { top: `${indicator.position * 100}%`, [indicator.side]: 6, transform: 'translateY(-50%)' } : { left: `${indicator.position * 100}%`, [indicator.side]: 6, transform: 'translateX(-50%)' }; const arrow = { left: '◀', right: '▶', top: '▲', bottom: '▼' }[indicator.side]; return <div key={indicator.side} className="pointer-events-none absolute z-10 flex items-center gap-1 rounded-full border border-violet-400/25 bg-th-base px-1.5 py-1 font-mono text-[8px] tabular-nums text-violet-300 shadow-md" style={style}><span>{arrow}</span><span>{indicator.count}</span></div>; })}
        {miniAnalysisEnabled && densityBreakdown.length > 0 && <aside className={`pointer-events-none absolute z-[58] border border-th-hub-border bg-th-base/90 font-mono shadow-md backdrop-blur-sm ${expanded ? 'right-4 top-16 w-44 px-2.5 py-2' : 'right-1 top-1 w-28 px-1.5 py-1'}`}>
          <div className={`flex items-center justify-between border-b border-th-hub-border uppercase tracking-[.12em] text-th-muted ${expanded ? 'mb-1.5 pb-1 text-[8px]' : 'mb-1 pb-0.5 text-[7px]'}`}><span>local density</span><span>{densityAreaIds?.size ?? 0}</span></div>
          <div className={expanded ? 'space-y-1' : 'space-y-0.5'}>{densityBreakdown.slice(0, expanded ? 7 : 4).map(item => <div key={item.root} className={`flex min-w-0 items-center gap-1.5 ${expanded ? 'text-[9px]' : 'text-[7px]'}`}><i className="h-1.5 w-1.5 flex-none rounded-full" style={{ backgroundColor: rootHexByName.get(item.root) ?? ROOT_NEUTRAL }} /><span className="min-w-0 flex-1 truncate text-th-secondary">{item.root}</span><span className="tabular-nums text-violet-300">{item.percent.toFixed(0)}%</span></div>)}</div>
        </aside>}
        {hoveredNode && (expanded
          ? <div ref={hoverCardRef} className="pointer-events-none absolute left-0 top-0 z-[60] max-w-56 border border-th-hub-border bg-th-base/95 px-2 py-1 font-mono text-[9px] shadow-lg backdrop-blur-sm will-change-transform"><span style={{ color: rootHexByName.get(hoveredNode.address.split('//')[0]) ?? ROOT_NEUTRAL }}>{hoveredNode.address.split('//')[0]}</span><span className="mx-1 text-th-muted">/</span><span className="text-th-primary underline decoration-th-muted underline-offset-2">{hoveredNode.name}</span></div>
          : <div className="pointer-events-none absolute left-1 right-8 top-1 z-[60] truncate bg-th-base/82 px-1.5 py-1 font-mono text-[8px] shadow-sm backdrop-blur-sm"><span style={{ color: rootHexByName.get(hoveredNode.address.split('//')[0]) ?? ROOT_NEUTRAL }}>{hoveredNode.address.split('//')[0]}</span><span className="mx-1 text-th-muted">/</span><span className="text-th-primary">{hoveredNode.name}</span></div>
        )}
      </Suspense>
    </div>
  );
};

export default MiniGraph;
