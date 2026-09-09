// Mini force-directed graph for the Second Brain sidebar
// Compact overview plus the expanded 2D/3D workspace. Topology and positions
// stay stable while result, preview and selection layers change paint only.

import React, { useState, useEffect, useRef, useCallback, useMemo, Suspense } from 'react';
import * as THREE from 'three';
import { forceCenter, forceCollide, forceLink, forceManyBody, forceSimulation } from 'd3-force';
import { initBrainIndex, type BrainIndex } from '../../lib/brainIndex';
import { useGraphRelevance } from '../../hooks/useGraphRelevance';
import { buildGraphData, type GraphData, type GraphNode, type GraphLink, type EdgeVisibility, EDGE_COLORS, assignRootColors, hexToRgb, ROOT_NEUTRAL } from './useGraphData';
import { wikiRamp, wikiStepCss } from '../../lib/wikiAccent';
import { estimateExport } from '../../lib/exportNotes';
import { CopyConfirmModal } from '../wiki/CopyConfirmModal';
import { RocketIcon } from '../icons';
import { buildAdjacency, bfsDepths, shortestPath, componentOf, subtreeOf, edgeKey, dayIndex, isoFromDay } from './graphAnalysis';
import { TRAIL_SYNC_EVENT, type TrailItem } from '../../hooks/useNavigationTrail';
import { useSharedPref, GRAPH_PINS_KEY, togglePinned } from '../../hooks/useGraphPrefs';

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
const CopyIcon: React.FC = () => <RocketIcon size={14} />;
const PHYSICS_STORAGE_KEY = 'wiki-graph-physics-v4';
// v9 tethers truly isolated notes near the constellation so one unconnected
// point cannot dictate the camera bounds.
const POSITIONS_STORAGE_KEY = 'wiki-graph-positions-v9';
const POSITIONS_SYNC_EVENT = 'wiki-graph-positions-updated';
const EDGE_VISIBILITY_STORAGE_KEY = 'wiki-graph-edge-visibility-v1';
const EDGE_VISIBILITY_EVENT = 'wiki-graph-edge-visibility-change';

// Reading aids. Shared preferences (radius, pins, freeze, node size) come from useGraphPrefs;
// expanded-only modes are local state cached across close and reopen (expandedCache).
const TRAIL_STORAGE_KEY = 'wiki-navigation-trail-v1';
type LensKind = 'orphans' | 'bridges' | 'cited' | 'trail';
type SizeMode = 'centrality' | 'degree' | 'length';
type Isolation = { kind: 'subtree' | 'component'; rootId: string } | null;
const LENS_COLORS: Record<LensKind, string> = { orphans: '#f59e0b', bridges: '#fb7185', cited: '#22d3ee', trail: '#c4b5fd' };
const LENS_LABELS: Record<LensKind, string> = { orphans: 'orphans', bridges: 'bridges', cited: 'cited by articles', trail: 'session trail' };
const PATH_HEX = '#67e8f9';
const PIN_HEX = '#f472b6';
const MAX_PINS = 3;
const AGE_OLD = [71, 85, 105];
const AGE_NEW = [251, 191, 36];
// The expanded workspace unmounts on close; its reading state and camera come back on the next open.
type ExpandedCache = { lens: LensKind | null; pathMode: boolean; pathStart: string | null; pathEnd: string | null; isolation: Isolation; timelineOn: boolean; timelineDay: number | null; timelineAge: boolean; legendOpen: boolean; densityRadius: number; camera: CameraBookmark | null };
let expandedCache: ExpandedCache | null = null;
const readTrail = (): TrailItem[] => { try { return JSON.parse(sessionStorage.getItem(TRAIL_STORAGE_KEY) ?? '[]'); } catch { return []; } };
// Paints the panels open over the canvas into an image: a copy of the container's DOM with every computed
// style inlined, wrapped in an SVG foreignObject. No library; page fonts fall back to the system stack.
const rasterizeOverlay = (root: HTMLElement, width: number, height: number): Promise<HTMLImageElement | null> => new Promise(resolve => {
  try {
    const clone = root.cloneNode(true) as HTMLElement;
    const sources = [root, ...Array.from(root.querySelectorAll<HTMLElement>('*'))];
    const targets = [clone, ...Array.from(clone.querySelectorAll<HTMLElement>('*'))];
    sources.forEach((source, i) => {
      const target = targets[i];
      if (!target || !(source instanceof Element)) return;
      const computed = getComputedStyle(source);
      let css = '';
      for (let k = 0; k < computed.length; k += 1) { const property = computed[k]; css += `${property}:${computed.getPropertyValue(property)};`; }
      target.setAttribute('style', css);
    });
    targets.forEach(target => { if (target instanceof HTMLCanvasElement) target.remove(); });
    clone.style.width = `${width}px`; clone.style.height = `${height}px`; clone.style.position = 'relative'; clone.style.margin = '0'; clone.style.background = 'transparent';
    const markup = new XMLSerializer().serializeToString(clone);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><foreignObject width="100%" height="100%"><div xmlns="http://www.w3.org/1999/xhtml">${markup}</div></foreignObject></svg>`;
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => resolve(null);
    image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  } catch { resolve(null); }
});
const darken = (css: string, factor: number) => {
  try { const color = new THREE.Color(css); color.multiplyScalar(Math.max(0, Math.min(1, factor))); return `#${color.getHexString()}`; } catch { return css; }
};
const PinIcon: React.FC = () => <svg width="10" height="10" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true"><path d="M6 11 2.5 4h7z" /></svg>;
const PathIcon: React.FC = () => <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="2.5" cy="11.5" r="1.5" /><circle cx="11.5" cy="2.5" r="1.5" /><path d="M4 11.5h3.5L10 2.5" /><circle cx="7.5" cy="11.5" r=".6" fill="currentColor" /></svg>;
const IsolateIcon: React.FC<{ kind: 'subtree' | 'component' | null }> = ({ kind }) => <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" aria-hidden="true"><circle cx="7" cy="7" r="5.5" strokeDasharray={kind ? undefined : '2 2'} /><circle cx="7" cy="7" r="2" fill={kind ? 'currentColor' : 'none'} />{kind === 'subtree' && <path d="M7 2.5V5M4 9.5l3-2.5 3 2.5" />}</svg>;
const ClockIcon: React.FC = () => <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" aria-hidden="true"><circle cx="7" cy="7" r="5.5" /><path d="M7 4v3l2 1.5" /></svg>;
const LensIcon: React.FC = () => <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true"><circle cx="7" cy="7" r="5.5" /><path d="M7 1.5v11" /><path d="M7 1.5a5.5 5.5 0 0 1 0 11z" fill="currentColor" stroke="none" /></svg>;
const MapIcon: React.FC = () => <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" aria-hidden="true"><path d="M2.2 5.2c.4-1.6 1.9-2.6 3.6-2.5 1.2.1 1.8 1 3.1.9 1.6-.1 2.9.9 2.9 2.4 0 1.3-1 1.7-1.3 2.9-.3 1.3.6 2.5-.9 3.1-1.6.6-2.6-.9-4.2-.8-1.4.1-2.3.9-3.1-.2-.8-1.1.2-2.1.1-3.4-.1-.9-.5-1.5-.2-2.4z" fill="currentColor" fillOpacity=".18" /><circle cx="5.4" cy="6.3" r=".8" fill="currentColor" stroke="none" /><circle cx="8.8" cy="8.6" r=".8" fill="currentColor" stroke="none" /></svg>;
const CameraIcon: React.FC = () => <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M1.5 4.5h2.5l1-1.5h4l1 1.5h2.5v7h-11z" /><circle cx="7" cy="8" r="2" /></svg>;
const SizeIcon: React.FC<{ mode: SizeMode }> = ({ mode }) => <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" aria-hidden="true">{mode === 'centrality' ? <><circle cx="7" cy="7" r="4.5" opacity=".35" /><circle cx="7" cy="7" r="2" /></> : mode === 'degree' ? <><circle cx="7" cy="7" r="2" /><circle cx="2" cy="3" r="1" /><circle cx="12" cy="3" r="1" /><circle cx="2" cy="11" r="1" /><circle cx="12" cy="11" r="1" /><path d="M7 7 2 3M7 7l5-4M7 7l-5 4M7 7l5 4" stroke="currentColor" strokeWidth=".8" /></> : <><rect x="2" y="3" width="10" height="1.4" rx=".7" /><rect x="2" y="6.3" width="7" height="1.4" rx=".7" /><rect x="2" y="9.6" width="9" height="1.4" rx=".7" /></>}</svg>;

const ForceGraph2D = React.lazy(() => import('react-force-graph-2d'));
const ForceGraph3D = React.lazy(() => import('react-force-graph-3d'));

const MINI_HEIGHT = 150;
// Canvas colors are raw values by necessity (no CSS cascade inside canvas paint).
// Centrality scale: periphery (wiki 800) → core (wiki 300), derived from --wiki-accent.
const { low: SCALE_LOW, high: SCALE_HIGH } = wikiRamp();
// Selection color: infraphysics lime, mirrors --cat-projects-accent (theme-constant)
const SELECT_RGB = [163, 230, 53];
const SELECT_HEX = '#a3e635';
const SELECT_RING = '#d9f99d';
// Semantic overlays stay inside the Wiki palette without collapsing into the
// purple centrality ramp: cool periwinkle = result; a preview brightens each node in its own colour.
const RESULT_RGB = [129, 140, 248];
const RESULT_HEX = '#a5b4fc';
/** A hover preview brightens each node in its own colour; the links between previewed nodes go light. */
const PREVIEW_LINK = 'rgba(236,231,218,.8)';
const brighten = (rgb: number[], amount = .62) => rgb.map(channel => Math.round(channel + (255 - channel) * amount));
const rgbCss = (rgb: number[]) => `rgb(${rgb.join(',')})`;
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
  /** Mini view only: renders the expand control inside the mini toolbar. */
  onExpand?: () => void;
  /** Mini view only: expand straight into the 3D view. */
  onExpand3d?: () => void;
  /** Expanded workspace: which renderer to open with. */
  initialDimension?: '2d' | '3d';
  /** Expanded workspace only: lets the toolbar switch between root-family and centrality coloring. */
  onColorModeChange?: (mode: GraphColorMode) => void;
  /** Expanded workspace only: a click on empty canvas drops the current node selection. */
  onClearSelection?: () => void;
  /** Mini view only: shows a reset control in the toolbar while any filter, root or search is active. */
  filtersActive?: boolean;
  onResetFilters?: () => void;
  /** Notes opened in this tab's session; drives the session-trail lens. */
  visitedIds?: Set<string> | null;
  onClearVisited?: () => void;
  /** Public articles that link each note (hub's articleUsage); drives the cited-by-articles lens. */
  articleUsage?: Map<string, Array<{ id: string; title: string; category: string }>>;
  /** Concept hovered in the directory: its own node is marked on the canvas. */
  previewNodeId?: string | null;
}> = ({ resultIds, previewIds = null, searchQuery, cameraFocusIds = null, cameraAnchorIds = null, colorMode = 'centrality', expanded = false, activeRoot = '', onNodeOpen, activeNodeId, onNodeSelect, onAreaPreview, onMinimize, onExpand, onColorModeChange, onClearSelection, filtersActive = false, onResetFilters, onExpand3d, initialDimension = '2d', visitedIds = null, onClearVisited, articleUsage, previewNodeId = null }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<any>(null);

  // Data
  const [index, setIndex] = useState<BrainIndex | null>(cachedBrainIndex);
  const { getCentrality, getPercentile, getIslands, loaded: relevanceLoaded } = useGraphRelevance();
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
  // On a phone the mini map lives in the full-screen console and takes near half the viewport.
  const miniHeight = useMemo(() => !expanded && typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches ? Math.round(window.innerHeight * 0.42) : MINI_HEIGHT, [expanded]);
  const [containerHeight, setContainerHeight] = useState(() => expanded && typeof window !== 'undefined' ? Math.max(240, window.innerHeight - 48) : miniHeight);
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
  const entryHeatDoneRef = useRef(false);
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
  const [dimension, setDimension] = useState<'2d' | '3d'>(initialDimension);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectionMode, setSelectionMode] = useState(false);
  const [multiSelected, setMultiSelected] = useState<Set<string>>(() => new Set());
  const [dragSelect, setDragSelect] = useState<SelectionRect | null>(null);
  const [copyState, setCopyState] = useState<'idle' | 'copying' | 'copied'>('idle');
  const [copyStats, setCopyStats] = useState<{ chars: number; tokens: number } | null>(null);
  const [pendingCopy, setPendingCopy] = useState<Set<string> | null>(null); // a selection waiting for its confirmation
  const [offscreenIndicators, setOffscreenIndicators] = useState<OffscreenIndicator[]>([]);
  const [physics, setPhysics] = useState<PhysicsSettings>(() => {
    try { return { ...DEFAULT_PHYSICS, ...JSON.parse(localStorage.getItem(PHYSICS_STORAGE_KEY) ?? '{}') }; }
    catch { return DEFAULT_PHYSICS; }
  });
  const [physicsSettling, setPhysicsSettling] = useState(false);

  // Reading aids. Shared preferences survive reloads and stay in step between the two canvases;
  // modes that only make sense on one canvas (path, isolation, timeline, lenses) are local state.
  const [hopRadius, setHopRadius] = useSharedPref<number>('wiki-graph-hop-radius', 0);
  const [frozen, setFrozen] = useSharedPref<boolean>('wiki-graph-frozen', false);
  const [sizeMode, setSizeMode] = useSharedPref<SizeMode>('wiki-graph-size-mode', 'centrality');
  const [pins, setPins] = useSharedPref<string[]>(GRAPH_PINS_KEY, []);
  const [showPins, setShowPins] = useSharedPref<boolean>('wiki-graph-show-pins', true);
  const restored = expanded ? expandedCache : null;
  const [lens, setLens] = useState<LensKind | null>(restored?.lens ?? null);
  const [lensOpen, setLensOpen] = useState(false);
  const [pathMode, setPathMode] = useState(restored?.pathMode ?? false);
  const [pathStart, setPathStart] = useState<string | null>(restored?.pathStart ?? null);
  const [pathEnd, setPathEnd] = useState<string | null>(restored?.pathEnd ?? null);
  const [isolation, setIsolation] = useState<Isolation>(restored?.isolation ?? null);
  const [timelineOn, setTimelineOn] = useState(restored?.timelineOn ?? false);
  const [timelineDay, setTimelineDay] = useState<number | null>(restored?.timelineDay ?? null);
  const [timelineAge, setTimelineAge] = useState(restored?.timelineAge ?? false);
  const [timelinePlaying, setTimelinePlaying] = useState(false);
  const [legendOpen, setLegendOpen] = useState(restored?.legendOpen ?? true);
  const [densityRadius, setDensityRadius] = useState(restored?.densityRadius ?? 34);
  const [imagePrompt, setImagePrompt] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [trailItems, setTrailItems] = useState<TrailItem[]>(readTrail);
  const toastTimerRef = useRef<number | null>(null);
  const restoreCameraRef = useRef<CameraBookmark | null>(restored?.camera ?? null);
  // Closing the workspace keeps everything: the next open starts where this one ended.
  const cacheRef = useRef<Omit<ExpandedCache, 'camera'>>({ lens, pathMode, pathStart, pathEnd, isolation, timelineOn, timelineDay, timelineAge, legendOpen, densityRadius });
  cacheRef.current = { lens, pathMode, pathStart, pathEnd, isolation, timelineOn, timelineDay, timelineAge, legendOpen, densityRadius };
  const dimensionRef = useRef(dimension);
  dimensionRef.current = dimension;
  const widthRef = useRef(containerWidth), heightRef = useRef(containerHeight);
  widthRef.current = containerWidth; heightRef.current = containerHeight;
  useEffect(() => {
    if (!expanded) return;
    return () => {
      const graph = graphRef.current;
      let camera: CameraBookmark | null = null;
      if (dimensionRef.current === '2d') {
        const center = graph?.screen2GraphCoords?.(widthRef.current / 2, heightRef.current / 2);
        const zoom = graph?.zoom?.();
        if (center && Number.isFinite(zoom)) camera = { dimension: '2d', x: center.x, y: center.y, zoom };
      } else {
        const position = graph?.cameraPosition?.();
        const target = graph?.controls?.()?.target;
        if (position && target) camera = { dimension: '3d', position: { x: position.x, y: position.y, z: position.z }, target: { x: target.x, y: target.y, z: target.z } };
      }
      expandedCache = { ...cacheRef.current, camera };
    };
  }, [expanded]);
  const showToast = useCallback((message: string) => {
    setToast(message);
    if (toastTimerRef.current !== null) window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => { toastTimerRef.current = null; setToast(null); }, 1800);
  }, []);
  useEffect(() => () => { if (toastTimerRef.current !== null) window.clearTimeout(toastTimerRef.current); }, []);
  useEffect(() => {
    const sync = (event: Event) => { const next = (event as CustomEvent<TrailItem[]>).detail; if (Array.isArray(next)) setTrailItems(next); };
    window.addEventListener(TRAIL_SYNC_EVENT, sync);
    return () => window.removeEventListener(TRAIL_SYNC_EVENT, sync);
  }, []);
  // Per-note facts used by the node size modes and the timeline.
  const wordCountById = useMemo(() => new Map((index?.allWikiNotes ?? []).map(note => [note.id, (note.searchText || '').split(/\s+/).filter(Boolean).length])), [index]);
  const dayById = useMemo(() => new Map((index?.allWikiNotes ?? []).flatMap(note => { const day = dayIndex(note.date); return day === null ? [] : [[note.id, day] as [string, number]]; })), [index]);
  const dayRange = useMemo(() => {
    let min = Infinity, max = -Infinity;
    dayById.forEach(day => { if (day < min) min = day; if (day > max) max = day; });
    return Number.isFinite(min) ? { min, max } : null;
  }, [dayById]);

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
    index.allWikiNotes.forEach(n => { centralityMap[n.id] = getCentrality(n.id); });
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
  // Node size: centrality percentile (default), number of connections, or length of the note text.
  const nodeRadiusById = useMemo(() => {
    const radii = new Map<string, number>();
    if (!fullGraph) return radii;
    const maxRefs = Math.max(1, ...fullGraph.nodes.map(node => node.refCount));
    const maxWords = Math.max(1, ...wordCountById.values());
    fullGraph.nodes.forEach(node => {
      const t = sizeMode === 'degree' ? Math.min(1, node.refCount / maxRefs)
        : sizeMode === 'length' ? Math.min(1, (wordCountById.get(node.id) ?? 0) / maxWords)
          : getPercentile(node.id) / 100;
      radii.set(node.id, (1.05 + Math.pow(t, sizeMode === 'centrality' ? .78 : .55) * 3.6) * NODE_SCALE);
    });
    return radii;
  }, [fullGraph, getPercentile, sizeMode, wordCountById]);

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
        const response = await fetch(`/wikinotes/${note.id}.json`);
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
  // ── Reading aids: derived sets ──────────────────────────────────────────
  const adjacency = useMemo(() => filtered ? buildAdjacency(filtered.links, visibility) : new Map<string, string[]>(), [filtered, visibility]);
  const focusId = expanded ? selectedId : (activeNodeId ?? selectedId);
  // Neighbourhood radius (mini): depth of every node within `hopRadius` hops of the open note.
  const hopDepths = useMemo(() => !expanded && hopRadius > 0 && focusId ? bfsDepths(adjacency, focusId, hopRadius) : null, [adjacency, expanded, focusId, hopRadius]);
  // Shortest path (expanded): to the pinned end, or live to the hovered node once a start is chosen.
  const pathTarget = pathEnd ?? (pathMode && pathStart ? hoveredId : null);
  const pathIds = useMemo(() => pathStart && pathTarget && pathTarget !== pathStart ? shortestPath(adjacency, pathStart, pathTarget) : null, [adjacency, pathStart, pathTarget]);
  const pathSet = useMemo(() => pathIds ? new Set(pathIds) : null, [pathIds]);
  const pathEdges = useMemo(() => { const keys = new Set<string>(); pathIds?.forEach((id, i) => { if (i) keys.add(edgeKey(pathIds[i - 1], id)); }); return keys; }, [pathIds]);
  const pathUnreachable = Boolean(pathStart && pathEnd && pathEnd !== pathStart && !pathIds);
  // Isolation (expanded): only the address subtree or the connected component of a node stays drawn.
  const isolationIds = useMemo(() => {
    if (!isolation || !filtered) return null;
    return isolation.kind === 'subtree' ? subtreeOf(filtered.links, isolation.rootId) : componentOf(adjacency, isolation.rootId);
  }, [adjacency, filtered, isolation]);
  // Timeline (expanded): notes dated after the cutoff are not drawn.
  const timelineCutoff = timelineOn && timelineDay !== null ? timelineDay : null;
  const hiddenIds = useMemo(() => {
    const hidden = new Set<string>();
    if (!filtered || (!isolationIds && timelineCutoff === null)) return hidden;
    filtered.nodes.forEach(node => {
      if (isolationIds && !isolationIds.has(node.id)) { hidden.add(node.id); return; }
      if (timelineCutoff !== null) { const day = dayById.get(node.id); if (day !== undefined && day > timelineCutoff) hidden.add(node.id); }
    });
    return hidden;
  }, [dayById, filtered, isolationIds, timelineCutoff]);
  const visibleCount = (filtered?.nodes.length ?? 0) - hiddenIds.size;
  // Lenses single nodes out. Orphans and bridges come from the build's island analysis, cited from the
  // articles' body links, trail from this tab's visits. The mini map only knows the trail lens.
  const activeLens: LensKind | null = expanded ? lens : null;
  const lensIds = useMemo(() => {
    if (!activeLens) return null;
    if (activeLens === 'orphans') return new Set(getIslands()?.isolatedUids ?? []);
    if (activeLens === 'bridges') return new Set((getIslands()?.cuts ?? []).map(cut => cut.uid));
    if (activeLens === 'cited') return new Set(articleUsage ? [...articleUsage.keys()] : []);
    return new Set(visitedIds ?? []);
  }, [activeLens, articleUsage, getIslands, visitedIds]);
  const lensCounts = useMemo(() => ({
    orphans: getIslands()?.isolatedUids.length ?? 0,
    bridges: getIslands()?.cuts.length ?? 0,
    cited: articleUsage?.size ?? 0,
    trail: visitedIds?.size ?? 0,
  }), [articleUsage, getIslands, visitedIds]);
  const pinSet = useMemo(() => new Set(pins), [pins]);
  // Per-node alpha multiplier from the reading aids: unrelated nodes recede, they never vanish.
  const viewDim = useCallback((id: string) => {
    let factor = 1;
    if (hopDepths && !hopDepths.has(id)) factor *= .2;
    if (pathSet && !pathSet.has(id)) factor *= .16;
    if (lensIds && !lensIds.has(id)) factor *= .3;
    return factor;
  }, [hopDepths, lensIds, pathSet]);
  const ageColor = useCallback((id: string) => {
    if (!dayRange) return null;
    const day = dayById.get(id);
    if (day === undefined) return null;
    const t = dayRange.max === dayRange.min ? 1 : (day - dayRange.min) / (dayRange.max - dayRange.min);
    return `rgb(${AGE_OLD.map((channel, i) => Math.round(channel + (AGE_NEW[i] - channel) * t)).join(',')})`;
  }, [dayById, dayRange]);
  const hoveredNode = useMemo(() => fullGraph?.nodes.find(node => node.id === hoveredId) ?? null, [fullGraph, hoveredId]);
  const generationPalette = ['#d9f99d', '#a3e635', '#4ade80', '#22d3ee', '#60a5fa', '#a78bfa', '#f472b6', '#fb923c'];
  const nodeVisualColor = useCallback((node: GraphNode) => {
    if (node.id === selectedId) return SELECT_HEX;
    const depth = backlinkDepthById.get(node.id);
    if (selectedId && depth !== undefined) return generationPalette[(depth - 1) % generationPalette.length];
    if (activeRoot && node.address.split('//')[0] !== activeRoot) return '#374151';
    return baseCssById.get(node.id) ?? `rgb(${SCALE_LOW.join(',')})`;
  }, [activeRoot, backlinkDepthById, baseCssById, selectedId]);
  useEffect(() => { if (dimension === '2d') graphRef.current?.refresh?.(); }, [dimension, hoveredId]);

  // Nearest 2D node to a canvas point, within a small screen radius.
  const findNearestNodeId = useCallback((x: number, y: number): string | null => {
    const graph = graphRef.current;
    if (!graph || !filtered) return null;
    const graphPoint = graph.screen2GraphCoords?.(x, y);
    if (!graphPoint) return null;
    const zoom = Math.max(.01, graph.zoom?.() ?? 1);
    let nearest: string | null = null, nearestDistance = (expanded ? 28 : 18) / zoom;
    for (const node of filtered.nodes) {
      const positioned = node as GraphNode & { x?: number; y?: number };
      if (!Number.isFinite(positioned.x) || !Number.isFinite(positioned.y)) continue;
      const distance = Math.hypot(positioned.x! - graphPoint.x, positioned.y! - graphPoint.y);
      if (distance < nearestDistance) { nearestDistance = distance; nearest = node.id; }
    }
    return nearest;
  }, [expanded, filtered]);

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
      const nearest = findNearestNodeId(x, y);
      setHoveredId(current => current === nearest ? current : nearest);
    });
  }, [dimension, filtered, findNearestNodeId, selectionMode]);

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
      const screenRadiusSq = densityRadius * densityRadius;
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
  }, [densityRadius, dimension, expanded, filtered, miniAnalysisEnabled, onAreaPreview]);

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
      if (ids.size > 0) setPendingCopy(ids);
    };

    element.addEventListener('mousedown', onMouseDown, true);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      element.removeEventListener('mousedown', onMouseDown, true);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [dimension, expanded, filtered, multiSelected, selectionMode]);

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
        return;
      }
      // Reading aids close one at a time, most recent first, before Escape reaches the workspace.
      if (imagePrompt) { event.preventDefault(); event.stopImmediatePropagation(); setImagePrompt(false); return; }
      if (lensOpen) { event.preventDefault(); event.stopImmediatePropagation(); setLensOpen(false); return; }
      if (pathMode) { event.preventDefault(); event.stopImmediatePropagation(); setPathMode(false); setPathStart(null); setPathEnd(null); return; }
      if (isolation) { event.preventDefault(); event.stopImmediatePropagation(); setIsolation(null); return; }
      if (timelineOn) { event.preventDefault(); event.stopImmediatePropagation(); setTimelineOn(false); setTimelinePlaying(false); return; }
      if (lens) { event.preventDefault(); event.stopImmediatePropagation(); setLens(null); return; }
      if (legendOpen) { event.preventDefault(); event.stopImmediatePropagation(); setLegendOpen(false); }
    };
    window.addEventListener('keydown', onEscape, true);
    return () => window.removeEventListener('keydown', onEscape, true);
  }, [dragSelect, expanded, imagePrompt, isolation, legendOpen, lens, lensOpen, multiSelected.size, pathMode, selectionMode, timelineOn]);

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

  // Expanded workspace: the first click on a node selects it (lime), a second click on the
  // already selected node opens it. Nothing navigates on a single click.
  // Path mode: the first click sets the start, the second the end; a third starts over.
  const pickPathNode = useCallback((id: string) => {
    if (!pathStart || pathEnd) { setPathStart(id); setPathEnd(null); return; }
    if (id !== pathStart) setPathEnd(id);
  }, [pathEnd, pathStart]);
  const selectOrOpen = useCallback((node: GraphNode) => {
    if (pathMode) { pickPathNode(node.id); return; }
    if (selectedId === node.id) { onNodeOpen?.(node); return; }
    setSelectedId(node.id);
  }, [onNodeOpen, pathMode, pickPathNode, selectedId]);
  const handlePointerUp = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    const selection = selectionRectRef.current;
    if (selectionStartRef.current && selection) {
      if (Math.abs(selection.x1 - selection.x0) <= 4 && Math.abs(selection.y1 - selection.y0) <= 4 && selectionBaseRef.current.size === 0) setMultiSelected(new Set());
      selectionStartRef.current = null; selectionRectRef.current = null; setDragSelect(null);
      if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
      return;
    }
    const start = proximityClickRef.current; proximityClickRef.current = null;
    if (!start || Math.hypot(event.clientX - start.x, event.clientY - start.y) >= 5) return;
    // Touch has no hover before the tap: resolve the node under the finger now.
    let targetId = hoveredId;
    if (!targetId && !expanded) {
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) targetId = findNearestNodeId(event.clientX - rect.left, event.clientY - rect.top);
    }
    if (!targetId) return;
    const node = filtered?.nodes.find(candidate => candidate.id === targetId);
    if (expanded) { if (node) selectOrOpen(node); return; }
    setSelectedId(targetId);
    if (node) onNodeSelect?.(node);
  }, [expanded, filtered, findNearestNodeId, hoveredId, onNodeSelect, selectOrOpen]);

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
      // Reopened workspace: put the camera back where it was instead of framing the whole graph.
      const remembered = restoreCameraRef.current;
      if (expanded && instance && remembered?.dimension === dimension) {
        restoreCameraRef.current = null;
        if (remembered.dimension === '2d') { instance.centerAt?.(remembered.x, remembered.y, 0); instance.zoom?.(remembered.zoom, 0); }
        else instance.cameraPosition?.(remembered.position, remembered.target, 0);
        topologyCameraCancelledRef.current = true;
        setIsFramed(true);
        return;
      }
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

  // ── Reading aids: camera, links, images, pins ──────────────────────────
  const nodeById = useMemo(() => new Map((filtered?.nodes ?? []).map(node => [node.id, node as GraphNode & { x?: number; y?: number }])), [filtered]);
  // Frame a set of nodes in either renderer. Used by the follow lock, isolation, paths and shared links.
  const frameIds = useCallback((ids: Set<string>, duration: number) => {
    const graph = graphRef.current;
    if (!graph || !filtered || ids.size === 0) return;
    if (dimension === '3d') { graph.zoomToFit?.(duration, expanded ? 72 : 14, (object: any) => Boolean(object?.id && ids.has(object.id))); return; }
    const matches = filtered.nodes.filter(node => ids.has(node.id) && Number.isFinite((node as any).x) && Number.isFinite((node as any).y)) as Array<GraphNode & { x: number; y: number }>;
    if (!matches.length) return;
    const xs = matches.map(node => node.x), ys = matches.map(node => node.y);
    const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
    const spreadX = Math.max(34, maxX - minX), spreadY = Math.max(28, maxY - minY);
    const zoom = Math.min(expanded ? 2.6 : 1.9, Math.max(.12, Math.min((containerWidth * (expanded ? .7 : .66)) / spreadX, (containerHeight * (expanded ? .66 : .6)) / spreadY)));
    graph.centerAt?.((minX + maxX) / 2, (minY + maxY) / 2, duration);
    graph.zoom?.(zoom, duration);
  }, [containerHeight, containerWidth, dimension, expanded, filtered]);
  useEffect(() => { if (isolationIds) frameIds(isolationIds, 600); }, [frameIds, isolationIds]);
  useEffect(() => { if (pathEnd && pathSet) frameIds(pathSet, 500); }, [frameIds, pathEnd, pathSet]);
  // Timeline playback: a short sweep from the first note to the last.
  useEffect(() => {
    if (!timelinePlaying || !dayRange) return;
    const step = Math.max(1, Math.round((dayRange.max - dayRange.min) / 110));
    const timer = window.setInterval(() => setTimelineDay(current => Math.min(dayRange.max, (current ?? dayRange.min) + step)), 80);
    return () => window.clearInterval(timer);
  }, [dayRange, timelinePlaying]);
  useEffect(() => { if (timelinePlaying && dayRange && timelineDay !== null && timelineDay >= dayRange.max) setTimelinePlaying(false); }, [dayRange, timelineDay, timelinePlaying]);
  const toggleTimeline = useCallback(() => {
    if (timelineOn) { setTimelineOn(false); setTimelinePlaying(false); return; }
    if (dayRange && timelineDay === null) setTimelineDay(dayRange.max);
    setTimelineOn(true);
  }, [dayRange, timelineDay, timelineOn]);
  const cycleIsolation = useCallback(() => {
    if (!selectedId) return;
    setIsolation(current => !current || current.rootId !== selectedId ? { kind: 'subtree', rootId: selectedId } : current.kind === 'subtree' ? { kind: 'component', rootId: selectedId } : null);
  }, [selectedId]);
  const togglePathMode = useCallback(() => {
    if (pathMode) { setPathMode(false); setPathStart(null); setPathEnd(null); return; }
    setPathMode(true);
    setSelectionMode(false);
    // A node already selected is the natural start.
    setPathStart(selectedId);
    setPathEnd(null);
  }, [pathMode, selectedId]);
  const togglePin = useCallback(() => {
    const id = focusId;
    if (!id) return;
    setPins(current => togglePinned(current, id));
  }, [focusId, setPins]);
  // Snapshot of the 2D canvas: the whole view, or the box around the area selection or the isolated
  // notes. With the interface, the open panels are painted on top from a styled copy of the DOM.
  const copyViewImage = useCallback(async (withInterface: boolean) => {
    const container = containerRef.current;
    const canvas = container?.querySelector('canvas');
    const graph = graphRef.current;
    if (!container || !canvas || !graph || dimension !== '2d' || !filtered) return;
    const scale = canvas.width / Math.max(1, containerWidth);
    let left = 0, top = 0, right = containerWidth, bottom = containerHeight;
    const focus = multiSelected.size ? multiSelected : isolationIds;
    if (focus?.size && !withInterface) {
      const points = filtered.nodes.flatMap(node => {
        if (!focus.has(node.id)) return [];
        const positioned = node as GraphNode & { x?: number; y?: number };
        if (!Number.isFinite(positioned.x) || !Number.isFinite(positioned.y)) return [];
        const point = graph.graph2ScreenCoords?.(positioned.x, positioned.y);
        return point ? [point] : [];
      });
      if (points.length) {
        const pad = 36;
        left = Math.max(0, Math.min(...points.map(point => point.x)) - pad); right = Math.min(containerWidth, Math.max(...points.map(point => point.x)) + pad);
        top = Math.max(0, Math.min(...points.map(point => point.y)) - pad); bottom = Math.min(containerHeight, Math.max(...points.map(point => point.y)) + pad);
      }
    }
    const out = document.createElement('canvas');
    out.width = Math.max(1, Math.round((right - left) * scale)); out.height = Math.max(1, Math.round((bottom - top) * scale));
    const ctx = out.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--bg-base').trim() || '#0a0a0b';
    ctx.fillRect(0, 0, out.width, out.height);
    ctx.drawImage(canvas, left * scale, top * scale, out.width, out.height, 0, 0, out.width, out.height);
    let interfaceMissing = false;
    if (withInterface) {
      const overlay = await rasterizeOverlay(container, containerWidth, containerHeight);
      if (overlay) ctx.drawImage(overlay, 0, 0, out.width, out.height); else interfaceMissing = true;
    }
    let blob: Blob | null = null;
    try { blob = await new Promise<Blob | null>(resolve => out.toBlob(resolve, 'image/png')); }
    catch { blob = null; }
    if (!blob) { showToast(withInterface ? 'this browser cannot capture the interface; try graph only' : 'could not build the image'); return; }
    if (interfaceMissing) showToast('interface could not be drawn; graph only');
    try {
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      showToast(focus?.size ? 'selection copied as an image' : 'view copied as an image');
    } catch {
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'wiki-graph.png'; anchor.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 2000);
      showToast('image downloaded');
    }
  }, [containerHeight, containerWidth, dimension, filtered, isolationIds, multiSelected, showToast]);
  // Session trail (2D): a dashed line through the notes of this tab's trail, in visiting order.
  const renderOverlay = useCallback((ctx: CanvasRenderingContext2D, globalScale: number) => {
    if (activeLens !== 'trail' || trailItems.length < 2) return;
    ctx.save(); ctx.beginPath();
    let started = false;
    trailItems.forEach(item => {
      const node = nodeById.get(item.id);
      if (!node || !Number.isFinite(node.x) || !Number.isFinite(node.y)) return;
      if (started) ctx.lineTo(node.x!, node.y!); else { ctx.moveTo(node.x!, node.y!); started = true; }
    });
    ctx.setLineDash([3 / globalScale, 3 / globalScale]); ctx.strokeStyle = LENS_COLORS.trail; ctx.globalAlpha = .75; ctx.lineWidth = Math.max(.6, 1 / globalScale); ctx.stroke();
    ctx.restore();
  }, [activeLens, nodeById, trailItems]);
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
    // Connectivity from our own edge list: the library only fills inDegree/outDegree on its link pass, which 3D no longer runs.
    const connectedIds = new Set<string>();
    for (const link of filtered.links as any[]) {
      connectedIds.add(typeof link.source === 'object' ? link.source.id : link.source);
      connectedIds.add(typeof link.target === 'object' ? link.target.id : link.target);
    }
    instance.zoomToFit?.(420, occupiedLeft + 52, (object: any) => Boolean(object?.id && connectedIds.has(object.id)));
  }, [containerHeight, containerWidth, dimension, expanded, filtered]);

  const inspectNode = useCallback((node: GraphNode) => {
    if (expanded) { selectOrOpen(node); return; }
    // Mini view: when a select handler navigates away, painting the branch first only distracts.
    if (onNodeSelect) { onNodeSelect(node); return; }
    setSelectedId(node.id);
  }, [expanded, onNodeSelect, selectOrOpen]);
  useEffect(() => {
    if (dimension !== '3d') return;
    setMiniAnalysisEnabled(false);
    setSelectionMode(false);
    setDensityAreaIds(null);
    setDragSelect(null);
    onAreaPreview?.(null);
  }, [dimension, onAreaPreview]);
  const clearSelection = useCallback(() => {
    if (!expanded || !selectedId) return;
    setSelectedId(null);
    onClearSelection?.();
  }, [expanded, onClearSelection, selectedId]);

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
          if (!frozen) fg.d3ReheatSimulation?.();
        }
        // On entry the restored layout was settled under whichever edge mode
        // was active when it was saved (or under the content-mode seed), and
        // the engine starts with a zero tick budget, so hierarchy mode looked
        // mixed until a drag reheated it. Run that same reheat once on mount
        // of the sidebar graph; the expanded graph inherits the result.
        if (!expanded && !entryHeatDoneRef.current && !frozen) {
          entryHeatDoneRef.current = true;
          setPhysicsSettling(true);
          requestAnimationFrame(() => fg.d3ReheatSimulation?.());
        }
      });
    });
    return () => { cancelAnimationFrame(frame); cancelAnimationFrame(innerFrame); };
  }, [dimension, expanded, filtered, frozen, physics, visibility.body, visibility.hierarchy, visibility.interaction]);

  const heatGraph = useCallback(() => {
    if (frozen) return;
    if (!physicsSettling) setPhysicsSettling(true);
    // Let React commit the non-zero tick budget before restarting the engine.
    requestAnimationFrame(() => graphRef.current?.d3ReheatSimulation?.());
  }, [frozen, physicsSettling]);
  // Leaving the frozen state settles whatever was dragged while frozen.
  const frozenMountRef = useRef(true);
  useEffect(() => {
    if (frozenMountRef.current) { frozenMountRef.current = false; return; }
    if (frozen) return;
    physicsTouchedRef.current = true;
    setPhysicsSettling(true);
    requestAnimationFrame(() => graphRef.current?.d3ReheatSimulation?.());
  }, [frozen]);

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
    if (hiddenIds.has(n.id)) return;
    const r = nodeRadiusById.get(n.id) ?? NODE_SCALE;
    const { strength, matches } = highlightVisualRef.current;
    const match = matches.get(n.id) ?? 0;
    const emphasis = strength * match;
    const depth = backlinkDepthById.get(n.id);
    const selected = n.id === selectedId;
    const groupSelected = multiSelected.has(n.id);
    const hovered = n.id === hoveredId;
    // Non-matching nodes keep their purple scale, only gently dimmed
    const nodeAlpha = (selected ? 1 : selectedId ? (depth !== undefined ? Math.max(.84, .99 - depth * .035) : .78) : Math.max(0.9, 1 - strength * (1 - match) * 0.1)) * (selected || pathSet?.has(n.id) ? 1 : viewDim(n.id));
    const baseHex = nodeVisualColor(n);
    const base = selectedId ? null : (baseRgbById.get(n.id) ?? SCALE_LOW);
    const branchEmphasis = selected ? 1 : depth !== undefined ? Math.max(.28, .72 - depth * .06) : 0;
    // Persistent results use cool periwinkle; a transient preview lights each node up in its own colour.
    // Selection remains lime, so all three states can coexist without lying
    // about which interaction produced each highlight.
    const isPreviewing = previewIds !== null;
    const ownBright = brighten(baseRgbById.get(n.id) ?? SCALE_LOW);
    const emphasisColor = isPreviewing ? ownBright : RESULT_RGB;
    const emphasisHex = isPreviewing ? rgbCss(ownBright) : RESULT_HEX;
    // Transient hover must remain visible even while another node owns the
    // persistent branch selection. Previously selectedId bypassed this blend.
    const rawBase = baseRgbById.get(n.id) ?? SCALE_LOW;
    // While a preview is active, filtered/search results remain as a quiet
    // periwinkle context layer instead of disappearing behind the preview.
    const resultContext = isPreviewing && Boolean(resultIds?.has(n.id));
    const transientBase = resultContext
      ? rawBase.map((channel, index) => channel + (RESULT_RGB[index] - channel) * .5)
      : rawBase;
    const fillColor = selected ? baseHex : emphasis > .02
      ? `rgb(${transientBase.map((channel, index) => Math.round(channel + (emphasisColor[index] - channel) * emphasis)).join(', ')})`
      : base && branchEmphasis > .001
        ? `rgb(${base.map((channel, index) => Math.round(channel + (emphasisColor[index] - channel) * branchEmphasis)).join(', ')})`
        : baseCssById.get(n.id) ?? baseHex;
    // Timeline colour-by-age replaces the base colour only where no other layer already speaks.
    const paintColor = timelineAge && !selected && emphasis <= .02 && branchEmphasis <= .001 ? (ageColor(n.id) ?? fillColor) : fillColor;
    // Screen-space light energy follows zoom. At a distant overview the halo
    // nearly collapses into the solid core instead of merging neighbouring
    // nodes into a fuzzy cloud; close inspection restores the full glow.
    const zoomEnergy = Math.max(.06, Math.min(1, (globalScale - .16) / .84));
    // One cheap, screen-space halo. Avoid canvas shadowBlur, whose offscreen
    // blur pass is substantially more expensive while the graph is moving.
    ctx.beginPath();
    ctx.arc(n.x, n.y, r + (.35 + (1.7 + emphasis * .9) * zoomEnergy) / globalScale, 0, 2 * Math.PI);
    ctx.fillStyle = paintColor;
    ctx.globalAlpha = nodeAlpha * (.035 + (.16 + emphasis * .09) * zoomEnergy);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(n.x, n.y, r, 0, 2 * Math.PI);
    ctx.fillStyle = paintColor;
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
      const hoverStroke = expanded ? (rootHexByName.get(root) ?? SELECT_RING) : wikiStepCss(300);
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

    // Reading aids: path members, lens members, pins.
    if (pathSet?.has(n.id)) {
      ctx.beginPath(); ctx.arc(n.x, n.y, r + Math.max(1.3, 2.2 / globalScale), 0, 2 * Math.PI);
      ctx.strokeStyle = PATH_HEX; ctx.globalAlpha = n.id === pathStart || n.id === pathTarget ? 1 : .85; ctx.lineWidth = Math.max(.9, 1.6 / globalScale); ctx.stroke();
    }
    if (activeLens && lensIds?.has(n.id)) {
      const weight = activeLens === 'cited' ? 1 + Math.min(6, articleUsage?.get(n.id)?.length ?? 0) * .3 : 1;
      ctx.beginPath(); ctx.arc(n.x, n.y, r + Math.max(1, 1.7 / globalScale) * weight, 0, 2 * Math.PI);
      ctx.strokeStyle = LENS_COLORS[activeLens]; ctx.globalAlpha = .9; ctx.lineWidth = Math.max(.7, 1.1 / globalScale) * weight; ctx.stroke();
    }
    if (previewNodeId === n.id && !selected) {
      ctx.beginPath(); ctx.arc(n.x, n.y, r + Math.max(1.2, 2 / globalScale), 0, 2 * Math.PI);
      ctx.strokeStyle = SELECT_HEX; ctx.globalAlpha = .95; ctx.lineWidth = Math.max(.9, 1.5 / globalScale); ctx.stroke();
    }
    if (showPins && pinSet.has(n.id)) {
      const size = Math.max(2.4, 4.2 / globalScale);
      ctx.beginPath(); ctx.moveTo(n.x, n.y - r - size * .35); ctx.lineTo(n.x - size * .55, n.y - r - size * 1.35); ctx.lineTo(n.x + size * .55, n.y - r - size * 1.35); ctx.closePath();
      ctx.fillStyle = PIN_HEX; ctx.globalAlpha = 1; ctx.fill();
      ctx.font = `${Math.max(3, 5 / globalScale)}px ui-monospace, monospace`; ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
      ctx.fillText(String(pins.indexOf(n.id) + 1), n.x, n.y - r - size * 1.45);
    }

    ctx.globalAlpha = 1;
  }, [activeLens, ageColor, articleUsage, backlinkDepthById, baseCssById, baseRgbById, expanded, hiddenIds, hoveredId, lensIds, multiSelected, nodeRadiusById, nodeVisualColor, pathSet, pathStart, pathTarget, pinSet, pins, previewIds, previewNodeId, resultIds, rootHexByName, selectedId, showPins, timelineAge, viewDim]);

  const nodePointerAreaPaint = useCallback((node: any, color: string, ctx: CanvasRenderingContext2D) => {
    const n = node as GraphNode & { x: number; y: number };
    if (hiddenIds.has(n.id)) return;
    ctx.beginPath();
    ctx.arc(n.x, n.y, (nodeRadiusById.get(n.id) ?? NODE_SCALE) + 2, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill();
  }, [hiddenIds, nodeRadiusById]);

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
    if (hiddenIds.has(sourceId) || hiddenIds.has(targetId)) return;
    const onPath = pathEdges.size > 0 && pathEdges.has(edgeKey(sourceId, targetId));
    const sourceDepth = sourceId === selectedId ? 0 : backlinkDepthById.get(sourceId), targetDepth = targetId === selectedId ? 0 : backlinkDepthById.get(targetId);
    const backlinkBranch = l.type === 'hierarchy'
      ? sourceDepth !== undefined && targetDepth !== undefined && targetDepth === sourceDepth + 1
      : sourceDepth !== undefined && targetDepth !== undefined && sourceDepth === targetDepth + 1;
    ctx.beginPath();
    ctx.moveTo(l.source.x, l.source.y);
    ctx.lineTo(l.target.x, l.target.y);
    const resultBranch = Boolean(previewIds && resultIds?.has(sourceId) && resultIds.has(targetId));
    ctx.strokeStyle = onPath ? PATH_HEX : backlinkBranch ? SELECT_HEX : branch > 0.15 ? (previewIds ? PREVIEW_LINK : RESULT_HEX) : resultBranch ? 'rgba(165,180,252,.62)' : EDGE_COLORS[l.type];
    const baseAlpha = expanded ? .32 : .29;
    ctx.globalAlpha = onPath ? .96 : Math.min(1, (selectedId ? (backlinkBranch ? .94 : .14) : baseAlpha * (1 - strength) + strength * (.14 + .66 * branch)) * EDGE_PRESENCE) * Math.min(viewDim(sourceId), viewDim(targetId));
    ctx.lineWidth = (onPath ? 2.1 : backlinkBranch ? 1.45 : (expanded ? .72 : .58) + .46 * branch) * Math.sqrt(EDGE_PRESENCE);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }, [backlinkDepthById, hiddenIds, pathEdges, previewIds, resultIds, selectedId, viewDim, visibility.body, visibility.hierarchy, visibility.interaction]);

  const nodeColor3d = useCallback((node: any) => {
    const id = (node as GraphNode).id;
    if (pathSet?.has(id)) return PATH_HEX;
    if (id === previewNodeId) return SELECT_HEX;
    if (activeLens && lensIds?.has(id)) return LENS_COLORS[activeLens];
    if ((highlightVisualRef.current.matches.get(id) ?? 0) > .08) return previewIds ? rgbCss(brighten(baseRgbById.get(id) ?? SCALE_LOW)) : RESULT_HEX;
    if (previewIds && resultIds?.has(id)) return '#818cf8';
    const base = timelineAge ? (ageColor(id) ?? nodeVisualColor(node as GraphNode)) : nodeVisualColor(node as GraphNode);
    // Meshes cannot fade per node; recede by darkening instead.
    const dim = viewDim(id);
    return dim < 1 ? darken(base, .25 + dim * .75) : base;
  }, [activeLens, ageColor, baseRgbById, lensIds, nodeVisualColor, pathSet, previewIds, previewNodeId, resultIds, timelineAge, viewDim]);
  const nodeVal3d = useCallback((node: any) => (nodeRadiusById.get((node as GraphNode).id) ?? NODE_SCALE) * 1.4 * ((node as GraphNode).id === selectedId ? 1.55 : 1), [nodeRadiusById, selectedId]);
  const nodeVisibility3d = useCallback((node: any) => !hiddenIds.has((node as GraphNode).id), [hiddenIds]);
  const nodeLabel3d = useCallback(() => '', []);
  const linkColor3d = useCallback((link: any) => {
    if (!visibility[(link as GraphLink).type]) return 'rgba(0,0,0,0)';
    const source = typeof link.source === 'object' ? link.source.id : link.source;
    const target = typeof link.target === 'object' ? link.target.id : link.target;
    const sourceDepth = source === selectedId ? 0 : backlinkDepthById.get(source), targetDepth = target === selectedId ? 0 : backlinkDepthById.get(target);
    const branch = link.type === 'hierarchy'
      ? sourceDepth !== undefined && targetDepth !== undefined && targetDepth === sourceDepth + 1
      : sourceDepth !== undefined && targetDepth !== undefined && sourceDepth === targetDepth + 1;
    if (hiddenIds.has(source) || hiddenIds.has(target)) return 'rgba(0,0,0,0)';
    if (pathEdges.size > 0 && pathEdges.has(edgeKey(source, target))) return PATH_HEX;
    const previewBranch = Math.min(highlightVisualRef.current.matches.get(source) ?? 0, highlightVisualRef.current.matches.get(target) ?? 0) > .15;
    const resultBranch = Boolean(previewIds && resultIds?.has(source) && resultIds.has(target));
    const base = branch ? SELECT_HEX : previewBranch ? (previewIds ? PREVIEW_LINK : RESULT_HEX) : resultBranch ? '#818cf8' : EDGE_COLORS[(link as GraphLink).type];
    const dim = Math.min(viewDim(source), viewDim(target));
    return dim < 1 ? darken(base, .2 + dim * .8) : base;
  }, [backlinkDepthById, hiddenIds, pathEdges, previewIds, resultIds, selectedId, viewDim, visibility.body, visibility.hierarchy, visibility.interaction]);

  // 3D edges: one LineSegments for the whole graph instead of one Line object
  // per link. 2,000+ draw calls per frame collapse into one, which is what
  // keeps rotation smooth and lets the graph grow. Hidden edge types are
  // painted black under additive blending, so they vanish on the dark field.
  const edgeMeshRef = useRef<{ mesh: THREE.LineSegments; positions: Float32Array; colors: Float32Array; count: number } | null>(null);
  const linkColor3dRef = useRef(linkColor3d);
  useEffect(() => { linkColor3dRef.current = linkColor3d; }, [linkColor3d]);
  const dropEdgeMesh = useCallback(() => {
    const entry = edgeMeshRef.current;
    if (!entry) return;
    entry.mesh.parent?.remove(entry.mesh);
    entry.mesh.geometry.dispose();
    (entry.mesh.material as THREE.Material).dispose();
    edgeMeshRef.current = null;
  }, []);
  const syncEdgeColors = useCallback(() => {
    const entry = edgeMeshRef.current;
    if (!entry || !filtered) return;
    const links = filtered.links as any[];
    const color = new THREE.Color();
    links.forEach((link, i) => {
      const css = linkColor3dRef.current(link);
      if (css === 'rgba(0,0,0,0)') color.setRGB(0, 0, 0); else color.set(css);
      const o = i * 6;
      entry.colors[o] = entry.colors[o + 3] = color.r;
      entry.colors[o + 1] = entry.colors[o + 4] = color.g;
      entry.colors[o + 2] = entry.colors[o + 5] = color.b;
    });
    entry.mesh.geometry.getAttribute('color').needsUpdate = true;
    (entry.mesh.material as THREE.LineBasicMaterial).opacity = Math.min(1, (selectedId ? .12 : .3) * EDGE_PRESENCE);
  }, [filtered, selectedId]);
  const syncEdgePositions = useCallback(() => {
    const instance = graphRef.current;
    if (!filtered || typeof instance?.scene !== 'function') return;
    const links = filtered.links as any[];
    const nodeById = new Map(filtered.nodes.map(node => [node.id, node as any]));
    let entry = edgeMeshRef.current;
    if (!entry || entry.count !== links.length) {
      dropEdgeMesh();
      const positions = new Float32Array(links.length * 6);
      const colors = new Float32Array(links.length * 6);
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      const material = new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: .3, blending: THREE.AdditiveBlending, depthWrite: false });
      const mesh = new THREE.LineSegments(geometry, material);
      mesh.frustumCulled = false;
      instance.scene().add(mesh);
      entry = edgeMeshRef.current = { mesh, positions, colors, count: links.length };
      syncEdgeColors();
    }
    for (let i = 0; i < links.length; i += 1) {
      const a = typeof links[i].source === 'object' ? links[i].source : nodeById.get(links[i].source);
      const b = typeof links[i].target === 'object' ? links[i].target : nodeById.get(links[i].target);
      if (!a || !b) continue;
      const o = i * 6;
      entry.positions[o] = a.x ?? 0; entry.positions[o + 1] = a.y ?? 0; entry.positions[o + 2] = a.z ?? 0;
      entry.positions[o + 3] = b.x ?? 0; entry.positions[o + 4] = b.y ?? 0; entry.positions[o + 5] = b.z ?? 0;
    }
    entry.mesh.geometry.getAttribute('position').needsUpdate = true;
    entry.mesh.geometry.computeBoundingSphere();
  }, [dropEdgeMesh, filtered, syncEdgeColors]);
  useEffect(() => { if (dimension === '3d') syncEdgeColors(); }, [dimension, linkColor3d, syncEdgeColors]);
  useEffect(() => { if (dimension !== '3d') dropEdgeMesh(); return dropEdgeMesh; }, [dimension, dropEdgeMesh]);
  // With a settled layout the engine emits no ticks, so build the mesh once the 3D scene and node positions exist.
  useEffect(() => {
    if (dimension !== '3d') return;
    let inner = 0;
    const outer = requestAnimationFrame(() => { inner = requestAnimationFrame(() => { syncEdgePositions(); window.setTimeout(syncEdgePositions, 400); }); });
    return () => { cancelAnimationFrame(outer); cancelAnimationFrame(inner); };
  }, [dimension, expanded, filtered, syncEdgePositions]);


  if (!filtered) {
    return (
      <div
        ref={containerRef}
        className="flex items-center justify-center text-th-muted text-[10px] animate-pulse"
        style={{ height: expanded ? '100%' : miniHeight }}
      >
        Loading...
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative ${selectionMode ? 'cursor-crosshair' : ''}`}
      style={{ height: expanded ? '100%' : miniHeight }}
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
            onRenderFramePost={renderOverlay}
            onEngineStop={() => { if (topologyChangedRef.current) { topologyChangedRef.current = false; if (expanded ? !topologyCameraCancelledRef.current : !miniCameraAutomationBlockedRef.current) { if (expanded) centerGraph(); else frameVisibleCore(graphRef.current, 650); } topologyCameraCancelledRef.current = false; } else frameGraph(); updateOffscreenIndicators(); saveSettledLayout(); setPhysicsSettling(false); }}
            onZoomEnd={updateOffscreenIndicators}
            onNodeClick={(node: any) => !expanded && miniAnalysisEnabled && inspectNode(node as GraphNode)}
            onBackgroundClick={clearSelection}
            onNodeRightClick={(node: any) => expanded && onNodeOpen?.(node as GraphNode)}
            onNodeHover={() => undefined}
            autoPauseRedraw={!highlightAnimating}
            d3AlphaDecay={0.035}
            d3VelocityDecay={physics.damping}
            warmupTicks={0}
            cooldownTicks={physicsSettling && !frozen ? Infinity : 0}
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
            nodeVisibility={nodeVisibility3d}
            nodeRelSize={6}
            nodeResolution={5}
            nodeOpacity={0.94}
            linkColor={linkColor3d}
            linkVisibility={false}
            onEngineTick={syncEdgePositions}
            onEngineStop={() => { syncEdgePositions(); if (topologyChangedRef.current) { topologyChangedRef.current = false; if (!topologyCameraCancelledRef.current) centerGraph(); topologyCameraCancelledRef.current = false; } else frameGraph(); saveSettledLayout(); setPhysicsSettling(false); }}
            onNodeClick={(node: any) => inspectNode(node as GraphNode)}
            onBackgroundClick={clearSelection}
            onNodeHover={(node: any) => setHoveredId(node ? (node as GraphNode).id : null)}
            onNodeRightClick={(node: any) => onNodeOpen?.(node as GraphNode)}
            d3AlphaDecay={0.035}
            d3VelocityDecay={physics.damping}
            warmupTicks={0}
            cooldownTicks={physicsSettling && !frozen ? Infinity : 0}
            enableNodeDrag={!selectionMode}
            onNodeDrag={heatGraph}
            onNodeDragEnd={() => { heatGraph(); saveSettledLayout(); }}
            enableNavigationControls={!selectionMode}
            showNavInfo
            rendererConfig={WEBGL_RENDERER_CONFIG}
            backgroundColor="#000011"
          />}
        </div>
        {!expanded && <nav aria-label="Mini graph tools" className="absolute bottom-1 left-1 z-20 flex items-center gap-px border border-th-hub-border bg-th-base p-0.5 font-mono shadow-md">
          {filtersActive && onResetFilters && <><button type="button" title="Reset filters" aria-label="Reset filters" onClick={onResetFilters} className="graph-reset graph-reset-mini">⟲ reset</button><i className="mx-0.5 h-3 w-px bg-th-hub-border" /></>}
          {miniCameraDirty && <button type="button" title="Return to full graph" onClick={() => { miniCameraAutomationBlockedRef.current = false; frameVisibleCore(graphRef.current, 950); setMiniCameraDirty(false); }} className="grid h-5 w-5 place-items-center text-[12px] text-th-muted transition-colors hover:bg-th-surface hover:text-violet-300">⌖</button>}
          <i className="mx-0.5 h-3 w-px bg-th-hub-border" />
          {(['content', 'hierarchy'] as const).map(mode => <button
            key={mode}
            type="button"
            aria-pressed={mode === 'hierarchy' ? visibility.hierarchy : visibility.body || visibility.interaction}
            title={mode === 'hierarchy' ? 'Path hierarchy' : 'Content references and interactions'}
            onClick={() => setEdgeMode(mode)}
            className={`relative grid h-5 w-5 place-items-center transition-[opacity,background-color] hover:bg-th-surface ${(mode === 'hierarchy' ? visibility.hierarchy : visibility.body || visibility.interaction) ? 'opacity-100' : 'opacity-25'}`}
          ><i className="block h-px w-3.5" style={{ backgroundColor: mode === 'hierarchy' ? EDGE_COLORS.hierarchy : EDGE_COLORS.body, transform: mode === 'hierarchy' ? 'rotate(35deg)' : undefined }} /><span className="sr-only">{mode}</span></button>)}
          {onExpand && <><i className="mx-0.5 h-3 w-px bg-th-hub-border" /><button type="button" onClick={onExpand3d} title="Expand in 3D" aria-label="Expand in 3D" className="grid h-5 min-w-5 place-items-center px-1 text-[8px] font-semibold tracking-[.08em] text-th-muted transition-colors hover:bg-th-surface hover:text-violet-300">3D</button>{onExpand3d && <button type="button" onClick={onExpand} title="Expand graph" aria-label="Expand graph" className="grid h-5 w-5 place-items-center text-th-muted transition-colors hover:bg-th-surface hover:text-violet-300"><svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M7 1h4v4M5 11H1V7M11 1L7 5M1 11l4-4" /></svg></button>}</>}
        </nav>}
        {/* Mini: neighbourhood radius around the open note, and whether pinned notes are shown. */}
        {!expanded && <nav aria-label="Mini graph reading aids" className="absolute bottom-1 right-1 z-20 flex items-center gap-px border border-th-hub-border bg-th-base p-0.5 font-mono shadow-md">
          <button type="button" aria-pressed={hopRadius > 0} disabled={!focusId} title={!focusId ? 'Open a note to use the neighbourhood radius' : hopRadius ? `Neighbourhood: ${hopRadius} hop${hopRadius > 1 ? 's' : ''} around the open note. Click to widen, r3 wraps to off` : 'Neighbourhood radius: off. Click for 1 hop around the open note'} onClick={() => setHopRadius((hopRadius + 1) % 4)} className={`grid h-5 min-w-5 place-items-center px-1 text-[8px] font-semibold tracking-[.06em] transition-colors disabled:opacity-30 ${hopRadius ? 'bg-violet-400/15 text-violet-300' : 'text-th-muted hover:bg-th-surface hover:text-violet-300'}`}>{hopRadius ? `r${hopRadius}` : 'r·'}</button>
          <button type="button" aria-pressed={showPins} disabled={pins.length === 0} title={pins.length === 0 ? 'No pinned notes yet (pin from a note card or the expanded graph)' : showPins ? `Hide the ${pins.length} pinned note${pins.length > 1 ? 's' : ''}` : `Show the ${pins.length} pinned note${pins.length > 1 ? 's' : ''}`} onClick={() => setShowPins(!showPins)} className={`grid h-5 w-5 place-items-center transition-colors disabled:opacity-30 ${showPins && pins.length ? 'bg-pink-400/15 text-pink-300' : 'text-th-muted hover:bg-th-surface hover:text-pink-300'}`}><PinIcon /></button>
        </nav>}
        {expanded && <nav aria-label="Graph tools" className="absolute left-4 top-[3.6rem] z-50 flex max-h-[calc(100%-5rem)] w-11 flex-col overflow-y-auto border border-th-hub-border bg-th-base p-1 font-mono shadow-xl">
          <div className="mb-1 border-b border-th-hub-border pb-1">
            {(['2d', '3d'] as const).map(mode => <button key={mode} type="button" title={`${mode.toUpperCase()} view`} onPointerEnter={() => { if (mode === '3d') void import('react-force-graph-3d'); }} onFocus={() => { if (mode === '3d') void import('react-force-graph-3d'); }} onClick={() => { if (mode === dimension) return; physicsTouchedRef.current = true; topologyChangedRef.current = true; topologyCameraCancelledRef.current = false; setPhysicsSettling(true); setDimension(mode); if (mode === '3d') setSelectionMode(false); }} className={`mb-0.5 grid h-8 w-full place-items-center text-[9px] font-semibold uppercase ${dimension === mode ? 'bg-violet-400/15 text-violet-300' : 'text-th-muted hover:bg-th-surface hover:text-th-primary'}`}>{mode}</button>)}
          </div>
          {onColorModeChange && <div className="mb-1 border-b border-th-hub-border pb-1">
            {(['roots', 'centrality'] as const).map(mode => <button key={mode} type="button" aria-pressed={colorMode === mode} title={mode === 'roots' ? 'Color nodes by root family' : 'Color nodes by centrality (lighter = more central)'} onClick={() => onColorModeChange(mode)} className={`mb-0.5 grid h-8 w-full place-items-center ${colorMode === mode ? 'bg-violet-400/15' : 'hover:bg-th-surface'}`}>{mode === 'roots'
              ? <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><circle cx="4" cy="4.5" r="2.3" fill="#f472b6" /><circle cx="10" cy="4.5" r="2.3" fill="#34d399" /><circle cx="7" cy="10" r="2.3" fill="#60a5fa" /></svg>
              : <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><circle cx="7" cy="7" r="5.5" fill="var(--wiki-800)" /><circle cx="7" cy="7" r="3.4" fill="var(--wiki-500)" /><circle cx="7" cy="7" r="1.5" fill="var(--wiki-200)" /></svg>}<span className="sr-only">{mode}</span></button>)}
          </div>}
          <button type="button" title="Center graph" onClick={centerGraph} className="mb-1 grid h-8 w-full place-items-center border-b border-th-hub-border pb-1 text-base leading-none text-th-muted hover:bg-th-surface hover:text-violet-300">⌖</button>
          {dimension === '2d' && <button type="button" title="Select area and copy notes" onClick={() => { setSelectionMode(value => !value); setMiniAnalysisEnabled(false); setDensityAreaIds(null); onAreaPreview?.(null); setHoveredId(null); setDragSelect(null); selectionStartRef.current = null; selectionRectRef.current = null; }} className={`mb-1 grid h-8 w-full place-items-center border-b border-th-hub-border pb-1 ${selectionMode ? 'bg-cyan-400/15 text-cyan-300' : 'text-th-muted hover:bg-th-surface hover:text-th-primary'}`}><CopyIcon /></button>}
          {dimension === '2d' && <button type="button" aria-pressed={miniAnalysisEnabled} title="Inspect local density" onClick={() => { setMiniAnalysisEnabled(value => { const next = !value; if (!next) { setDensityAreaIds(null); onAreaPreview?.(null); } return next; }); setSelectionMode(false); setDragSelect(null); }} className={`mb-1 grid h-8 w-full place-items-center border-b border-th-hub-border pb-1 ${miniAnalysisEnabled ? 'bg-violet-400/15 text-violet-300' : 'text-th-muted hover:bg-th-surface hover:text-th-primary'}`}><AreaInspectIcon /></button>}
          {/* Reading aids: node size, path, isolation, timeline, lenses, legend, image, link, freeze. */}
          <div className="mb-1 border-b border-th-hub-border pb-1">
            {(['centrality', 'degree', 'length'] as const).map(mode => <button key={mode} type="button" aria-pressed={sizeMode === mode} title={mode === 'centrality' ? 'Node size: centrality' : mode === 'degree' ? 'Node size: number of connections' : 'Node size: length of the note'} onClick={() => setSizeMode(mode)} className={`mb-0.5 grid h-8 w-full place-items-center ${sizeMode === mode ? 'bg-violet-400/15 text-violet-300' : 'text-th-muted hover:bg-th-surface hover:text-th-primary'}`}><SizeIcon mode={mode} /><span className="sr-only">{mode}</span></button>)}
          </div>
          <button type="button" aria-pressed={pathMode} title={pathMode ? 'Leave path mode (Esc)' : 'Shortest path: click a start note, then an end note. Hovering previews the route'} onClick={togglePathMode} className={`mb-1 grid h-8 w-full place-items-center border-b border-th-hub-border pb-1 ${pathMode ? 'bg-cyan-400/15 text-cyan-300' : 'text-th-muted hover:bg-th-surface hover:text-th-primary'}`}><PathIcon /></button>
          <button type="button" aria-pressed={!!isolation} disabled={!selectedId} title={!selectedId ? 'Select a note to isolate its branch' : !isolation || isolation.rootId !== selectedId ? 'Isolate: keep only the address subtree of the selected note' : isolation.kind === 'subtree' ? 'Isolate: widen to the whole connected component' : 'Show the whole graph again'} onClick={cycleIsolation} className={`mb-1 grid h-8 w-full place-items-center border-b border-th-hub-border pb-1 disabled:opacity-30 ${isolation ? 'bg-amber-400/15 text-amber-300' : 'text-th-muted hover:bg-th-surface hover:text-th-primary'}`}><IsolateIcon kind={isolation?.kind ?? null} /></button>
          <button type="button" aria-pressed={timelineOn} disabled={!dayRange} title={timelineOn ? 'Close the timeline (Esc)' : 'Timeline: see the graph as it was on a date, or colour notes by age'} onClick={toggleTimeline} className={`mb-1 grid h-8 w-full place-items-center border-b border-th-hub-border pb-1 disabled:opacity-30 ${timelineOn ? 'bg-amber-400/15 text-amber-300' : 'text-th-muted hover:bg-th-surface hover:text-th-primary'}`}><ClockIcon /></button>
          <button type="button" aria-pressed={!!lens} aria-expanded={lensOpen} title="Lenses: orphans, bridges, notes cited by articles, this session's trail" onClick={() => setLensOpen(open => !open)} className={`mb-1 grid h-8 w-full place-items-center border-b border-th-hub-border pb-1 ${lens ? 'text-th-primary' : 'text-th-muted hover:bg-th-surface hover:text-th-primary'}`} style={lens ? { color: LENS_COLORS[lens], backgroundColor: `color-mix(in srgb, ${LENS_COLORS[lens]} 15%, transparent)` } : undefined}><LensIcon /></button>
          <button type="button" aria-pressed={legendOpen} title={legendOpen ? 'Hide the legend' : 'Legend: what the colours and rings mean'} onClick={() => setLegendOpen(open => !open)} className={`mb-1 grid h-8 w-full place-items-center border-b border-th-hub-border pb-1 ${legendOpen ? 'bg-violet-400/15 text-violet-300' : 'text-th-muted hover:bg-th-surface hover:text-th-primary'}`}><MapIcon /></button>
          <div className="mb-1 border-b border-th-hub-border pb-1">
            <button type="button" aria-pressed={!!selectedId && pinSet.has(selectedId)} disabled={!selectedId} title={!selectedId ? 'Select a note to pin it' : pinSet.has(selectedId) ? 'Unpin the selected note' : `Pin the selected note (up to ${MAX_PINS}, numbered)`} onClick={togglePin} className={`mb-0.5 grid h-8 w-full place-items-center disabled:opacity-30 ${selectedId && pinSet.has(selectedId) ? 'bg-pink-400/15 text-pink-300' : 'text-th-muted hover:bg-th-surface hover:text-pink-300'}`}><PinIcon /></button>
            <button type="button" aria-pressed={showPins} disabled={pins.length === 0} title={pins.length === 0 ? 'No pinned notes yet' : showPins ? `Hide the ${pins.length} pinned note${pins.length > 1 ? 's' : ''}` : `Show the ${pins.length} pinned note${pins.length > 1 ? 's' : ''}`} onClick={() => setShowPins(!showPins)} className={`grid h-8 w-full place-items-center text-[8px] font-semibold uppercase tracking-[.08em] disabled:opacity-30 ${showPins && pins.length ? 'text-pink-300' : 'text-th-muted hover:bg-th-surface hover:text-pink-300'}`}>{showPins ? 'on' : 'off'}</button>
          </div>
          {dimension === '2d' && <button type="button" aria-expanded={imagePrompt} title="Copy as an image" onClick={() => setImagePrompt(open => !open)} className={`mb-1 grid h-8 w-full place-items-center border-b border-th-hub-border pb-1 ${imagePrompt ? 'bg-violet-400/15 text-violet-300' : 'text-th-muted hover:bg-th-surface hover:text-th-primary'}`}><CameraIcon /></button>}
          <button type="button" aria-pressed={frozen} title={frozen ? 'Resume the layout physics' : 'Freeze the layout so nothing drifts'} onClick={() => setFrozen(!frozen)} className={`grid h-8 w-full place-items-center text-sm leading-none ${frozen ? 'bg-sky-400/15 text-sky-300' : 'text-th-muted hover:bg-th-surface hover:text-sky-300'}`}>❄</button>
        </nav>}
        {/* Density radius: slides out beside the density tool while it is on. */}
        {expanded && dimension === '2d' && <div data-nav-quiet className={`absolute left-16 z-50 flex items-center gap-2 border border-th-hub-border bg-th-base px-2 py-1 font-mono shadow-xl transition-[opacity,transform] duration-300 ease-out ${miniAnalysisEnabled ? 'translate-x-0 opacity-100' : 'pointer-events-none -translate-x-3 opacity-0'}`} style={{ top: `calc(3.6rem + ${(onColorModeChange ? 4 : 2) * 2.15}rem + 4.9rem)` }} aria-hidden={!miniAnalysisEnabled}>
          <span className="text-[8px] uppercase tracking-[.1em] text-th-muted">area</span>
          <input type="range" min={16} max={140} step={2} value={densityRadius} onChange={event => setDensityRadius(Number(event.target.value))} className="wiki-graph-range w-28" aria-label="Density study radius" />
          <span className="w-8 text-right text-[9px] tabular-nums text-violet-300">{densityRadius}px</span>
        </div>}
        {/* Image: the graph alone, or the graph with the panels that are open. */}
        {expanded && imagePrompt && <div role="group" aria-label="Copy as an image" className="absolute left-16 top-[3.6rem] z-50 w-52 border border-th-hub-border bg-th-base p-1 font-mono shadow-xl">
          <div className="mb-1 flex items-center justify-between border-b border-th-hub-border px-1.5 pb-1 text-[8px] uppercase tracking-[.12em] text-th-muted"><span>copy as image</span><button type="button" onClick={() => setImagePrompt(false)} className="text-[10px] hover:text-th-primary" aria-label="Cancel">×</button></div>
          <button type="button" onClick={() => { setImagePrompt(false); window.setTimeout(() => void copyViewImage(false), 80); }} className="flex w-full flex-col items-start px-1.5 py-1.5 text-left transition-colors hover:bg-th-surface"><span className="text-[9px] text-th-primary">{multiSelected.size ? 'Selected area, graph only' : 'Graph only'}</span><span className="text-[8px] text-th-muted">Nodes and edges, nothing else.</span></button>
          <button type="button" onClick={() => { setImagePrompt(false); window.setTimeout(() => void copyViewImage(true), 80); }} className="flex w-full flex-col items-start px-1.5 py-1.5 text-left transition-colors hover:bg-th-surface"><span className="text-[9px] text-th-primary">With the interface</span><span className="text-[8px] text-th-muted">Also the panels that are open: legend, path, timeline, tools.</span></button>
        </div>}
        {/* Lens picker, beside the tool rail. */}
        {expanded && lensOpen && <div role="group" aria-label="Lenses" className="absolute left-16 top-[3.6rem] z-50 w-56 border border-th-hub-border bg-th-base p-1 font-mono shadow-xl">
          <div className="mb-1 flex items-center justify-between border-b border-th-hub-border px-1.5 pb-1 text-[8px] uppercase tracking-[.12em] text-th-muted"><span>lens</span><button type="button" onClick={() => setLensOpen(false)} className="text-[10px] hover:text-th-primary" aria-label="Close lenses">×</button></div>
          {(['orphans', 'bridges', 'cited', 'trail'] as LensKind[]).map(kind => { const on = lens === kind; const unavailable = kind === 'cited' ? !articleUsage : kind === 'trail' ? !visitedIds : false; return <button key={kind} type="button" aria-pressed={on} disabled={unavailable} onClick={() => setLens(on ? null : kind)} className={`flex w-full items-center gap-2 px-1.5 py-1.5 text-left text-[9px] transition-colors disabled:opacity-30 ${on ? 'bg-th-surface text-th-primary' : 'text-th-secondary hover:bg-th-surface hover:text-th-primary'}`}><i className="h-2 w-2 flex-none rounded-full border" style={{ borderColor: LENS_COLORS[kind], backgroundColor: on ? LENS_COLORS[kind] : 'transparent' }} /><span className="flex-1">{LENS_LABELS[kind]}</span><span className="tabular-nums text-th-muted">{lensCounts[kind]}</span></button>; })}
          <p className="px-1.5 pt-1 text-[8px] leading-snug text-th-muted">{lens === 'orphans' ? 'Notes with no link in or out.' : lens === 'bridges' ? 'Notes whose removal would split their component.' : lens === 'cited' ? 'Thicker ring, more articles link the note.' : lens === 'trail' ? 'The notes opened in this tab.' : 'Members keep their colour; the rest recede.'}</p>
          {lens === 'trail' && onClearVisited && (visitedIds?.size ?? 0) > 0 && <button type="button" onClick={onClearVisited} className="mt-1 w-full border-t border-th-hub-border px-1.5 pt-1.5 text-left text-[8px] uppercase tracking-[.08em] text-th-muted hover:text-th-primary">forget this session's visits</button>}
        </div>}
        {/* Expanded: the two controls that must never be missed, top right. */}
        {expanded && <div className="graph-topright absolute right-4 top-4 z-50 flex items-center gap-2">
          {filtersActive && onResetFilters && <button type="button" onClick={onResetFilters} className="graph-reset">⟲ Reset filters</button>}
          {onMinimize && <button type="button" onClick={onMinimize} title="Close the graph (Esc)" aria-label="Close the graph" className="graph-close"><svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><path d="M1.5 4.5h3v-3M10.5 7.5h-3v3M4.5 4.5l-3-3M7.5 7.5l3 3" /></svg> Close</button>}
        </div>}
        {/* Expanded: the edge switches, top left, above the tools column. */}
        {expanded && <div className="graph-edges" role="group" aria-label="Edges shown">
          {(['content', 'hierarchy'] as const).map(mode => { const active = mode === 'hierarchy' ? visibility.hierarchy : visibility.body || visibility.interaction; return <button key={mode} type="button" aria-pressed={active} title={mode === 'hierarchy' ? 'Path hierarchy' : 'Content references and interactions'} onClick={() => setEdgeMode(mode)} className={active ? 'is-on' : ''}><i style={{ backgroundColor: mode === 'hierarchy' ? EDGE_COLORS.hierarchy : EDGE_COLORS.body, transform: mode === 'hierarchy' ? 'rotate(35deg)' : undefined }} /><span>{mode === 'hierarchy' ? 'hierarchy' : 'references'}</span></button>; })}
        </div>}
        {/* Path panel: the route itself; each stop opens its note. Sits above the timeline bar when both are open. */}
        {expanded && pathMode && (pathStart || pathIds) && <div data-nav-quiet className={`absolute left-1/2 z-40 max-w-[min(40rem,calc(100%-10rem))] -translate-x-1/2 border border-cyan-400/30 bg-th-base/95 px-3 py-2 font-mono text-[9px] shadow-xl backdrop-blur-sm ${timelineOn ? 'bottom-[8.25rem]' : 'bottom-[4.5rem]'}`}>
          {pathIds ? <div className="flex flex-wrap items-center gap-x-1 gap-y-1">{pathIds.map((id, i) => { const node = nodeById.get(id); return <React.Fragment key={id}>{i > 0 && <i className="h-px w-3 bg-cyan-400/50" />}<button type="button" onClick={() => node && onNodeOpen?.(node as GraphNode)} className={`max-w-[9rem] truncate border px-1.5 py-0.5 transition-colors hover:bg-cyan-400/15 ${i === 0 || i === pathIds.length - 1 ? 'border-cyan-400/60 text-cyan-200' : 'border-th-hub-border text-th-secondary'}`} title={node ? `Open ${node.name}` : id}>{node?.name ?? id}</button></React.Fragment>; })}<span className="ml-2 text-th-muted">{pathEnd ? 'click a note to start over' : 'click to pin this end'}</span></div>
            : pathUnreachable ? <span className="text-th-muted">no route over the edges shown; try the other edge mode</span>
              : <span className="text-th-muted">from <span className="text-cyan-200">{nodeById.get(pathStart!)?.name}</span>: hover a note to preview the route, click to pin it</span>}
        </div>}
        {/* Timeline bar. */}
        {expanded && timelineOn && dayRange && <div data-nav-quiet className="absolute bottom-[4.5rem] left-1/2 z-40 flex w-[min(38rem,calc(100%-11rem))] -translate-x-1/2 items-center gap-3 border border-amber-400/30 bg-th-base/95 px-3 py-2 font-mono text-[9px] shadow-xl backdrop-blur-sm">
          <button type="button" onClick={() => { if (timelineDay !== null && timelineDay >= dayRange.max && !timelinePlaying) setTimelineDay(dayRange.min); setTimelinePlaying(playing => !playing); }} className="grid h-6 w-6 flex-none place-items-center border border-th-hub-border text-amber-300 hover:bg-th-surface" title={timelinePlaying ? 'Pause' : 'Play the graph growing from the first note'} aria-label={timelinePlaying ? 'Pause' : 'Play'}>{timelinePlaying ? '❚❚' : '▶'}</button>
          <input type="range" min={dayRange.min} max={dayRange.max} value={timelineDay ?? dayRange.max} onChange={event => { setTimelinePlaying(false); setTimelineDay(Number(event.target.value)); }} className="wiki-graph-range min-w-0 flex-1" aria-label="Timeline cutoff date" />
          <span className="w-[5.2rem] flex-none tabular-nums text-amber-200">{isoFromDay(timelineDay ?? dayRange.max)}</span>
          <span className="flex-none tabular-nums text-th-muted">{visibleCount} / {filtered.nodes.length}</span>
          <button type="button" aria-pressed={timelineAge} onClick={() => setTimelineAge(age => !age)} title="Colour notes by age: cool is old, warm is new" className={`flex-none border px-1.5 py-0.5 text-[8px] uppercase tracking-[.08em] ${timelineAge ? 'border-amber-400/60 text-amber-200' : 'border-th-hub-border text-th-muted hover:text-th-primary'}`}>age</button>
          <button type="button" onClick={toggleTimeline} aria-label="Close the timeline" className="flex-none text-th-muted hover:text-th-primary">×</button>
        </div>}
        {/* Legend. */}
        {expanded && legendOpen && <aside data-nav-quiet className="absolute bottom-[4.5rem] right-4 z-40 w-60 border border-th-hub-border bg-th-base/95 p-2.5 font-mono text-[9px] shadow-xl backdrop-blur-sm">
          <div className="mb-1.5 flex items-center justify-between border-b border-th-hub-border pb-1 text-[8px] uppercase tracking-[.12em] text-th-muted"><span>legend</span><button type="button" onClick={() => setLegendOpen(false)} className="text-[10px] hover:text-th-primary" aria-label="Close legend">×</button></div>
          <p className="mb-1 text-[8px] uppercase tracking-[.1em] text-th-muted">nodes · {colorMode === 'roots' ? 'root family' : 'centrality'} · size by {sizeMode}</p>
          {colorMode === 'roots'
            ? <div className="mb-2 grid grid-cols-2 gap-x-2 gap-y-0.5">{[...rootHexByName].slice(0, 8).map(([root, hex]) => <span key={root} className="flex min-w-0 items-center gap-1.5 text-th-secondary"><i className="h-2 w-2 flex-none rounded-full" style={{ backgroundColor: hex }} /><span className="truncate">{root}</span></span>)}{rootHexByName.size > 8 && <span className="flex items-center gap-1.5 text-th-muted"><i className="h-2 w-2 flex-none rounded-full" style={{ backgroundColor: ROOT_NEUTRAL }} />other roots</span>}</div>
            : <div className="mb-2"><div className="h-1.5 rounded-full" style={{ background: `linear-gradient(90deg, rgb(${SCALE_LOW.join(',')}), rgb(${SCALE_HIGH.join(',')}))` }} /><div className="mt-0.5 flex justify-between text-[8px] text-th-muted"><span>peripheral</span><span>central</span></div></div>}
          {timelineOn && timelineAge && <div className="mb-2"><div className="h-1.5 rounded-full" style={{ background: `linear-gradient(90deg, rgb(${AGE_OLD.join(',')}), rgb(${AGE_NEW.join(',')}))` }} /><div className="mt-0.5 flex justify-between text-[8px] text-th-muted"><span>oldest</span><span>newest</span></div></div>}
          <p className="mb-1 text-[8px] uppercase tracking-[.1em] text-th-muted">edges</p>
          <div className="mb-2 space-y-0.5 text-th-secondary">{([['body', 'reference in the text'], ['interaction', 'interaction'], ['hierarchy', 'address hierarchy']] as const).map(([type, label]) => <span key={type} className="flex items-center gap-1.5"><i className="h-px w-4 flex-none" style={{ backgroundColor: EDGE_COLORS[type] }} />{label}</span>)}</div>
          <p className="mb-1 text-[8px] uppercase tracking-[.1em] text-th-muted">rings</p>
          <div className="space-y-0.5 text-th-secondary">
            {([[SELECT_HEX, 'selected note and its branch'], [RESULT_HEX, 'search or filter results'], ['#67e8f9', 'area selection'], [PATH_HEX, 'shortest path'], [PIN_HEX, 'pinned note']] as const).map(([hex, label]) => <span key={label} className="flex items-center gap-1.5"><i className="h-2 w-2 flex-none rounded-full border" style={{ borderColor: hex }} />{label}</span>)}
            {lens && <span className="flex items-center gap-1.5"><i className="h-2 w-2 flex-none rounded-full border" style={{ borderColor: LENS_COLORS[lens] }} />lens: {LENS_LABELS[lens]}</span>}
          </div>
        </aside>}
        {toast && <div role="status" className="pointer-events-none absolute bottom-6 left-1/2 z-[80] -translate-x-1/2 border border-violet-400/30 bg-th-base/95 px-4 py-2 font-mono text-[10px] text-violet-300 shadow-xl backdrop-blur-sm">{toast}</div>}
        {pendingCopy && index && <CopyConfirmModal
          estimate={estimateExport([...pendingCopy].map(id => index.noteById.get(id)).filter((n): n is NonNullable<typeof n> => !!n), new Map(), true)}
          source="Graph area selection"
          onConfirm={() => { const ids = pendingCopy; setPendingCopy(null); void copySelection(ids); }}
          onCancel={() => { setPendingCopy(null); setMultiSelected(new Set()); graphRef.current?.refresh?.(); }}
        />}
        {expanded && copyState !== 'idle' && <div role="status" className="pointer-events-none absolute bottom-6 left-1/2 z-[80] -translate-x-1/2 border border-cyan-400/30 bg-th-base/95 px-4 py-2 font-mono text-[10px] text-cyan-300 shadow-xl backdrop-blur-sm">{copyState === 'copying' ? `copying ${multiSelected.size} notes…` : `${multiSelected.size} notes copied${copyStats ? ` · ~${copyStats.tokens.toLocaleString()} tokens` : ''}`}</div>}
        {expanded && dragSelect && <div className="pointer-events-none absolute z-40 border border-cyan-300 bg-cyan-300/10" style={{ left: Math.min(dragSelect.x0, dragSelect.x1), top: Math.min(dragSelect.y0, dragSelect.y1), width: Math.abs(dragSelect.x1 - dragSelect.x0), height: Math.abs(dragSelect.y1 - dragSelect.y0) }} />}
        {expanded && dimension === '2d' && offscreenIndicators.map(indicator => { const vertical = indicator.side === 'left' || indicator.side === 'right'; const style: React.CSSProperties = vertical ? { top: `${indicator.position * 100}%`, [indicator.side]: 6, transform: 'translateY(-50%)' } : { left: `${indicator.position * 100}%`, [indicator.side]: 6, transform: 'translateX(-50%)' }; const arrow = { left: '◀', right: '▶', top: '▲', bottom: '▼' }[indicator.side]; return <div key={indicator.side} className="pointer-events-none absolute z-10 flex items-center gap-1 rounded-full border border-violet-400/25 bg-th-base px-1.5 py-1 font-mono text-[8px] tabular-nums text-violet-300 shadow-md" style={style}><span>{arrow}</span><span>{indicator.count}</span></div>; })}
        {miniAnalysisEnabled && densityBreakdown.length > 0 && <aside className={`pointer-events-none absolute z-[58] border border-th-hub-border bg-th-base/90 font-mono shadow-md backdrop-blur-sm ${expanded ? 'right-4 top-16 w-44 px-2.5 py-2' : 'right-1 top-1 w-28 px-1.5 py-1'}`}>
          <div className={`flex items-center justify-between border-b border-th-hub-border uppercase tracking-[.12em] text-th-muted ${expanded ? 'mb-1.5 pb-1 text-[8px]' : 'mb-1 pb-0.5 text-[7px]'}`}><span>local density</span><span>{densityAreaIds?.size ?? 0}</span></div>
          <div className={expanded ? 'space-y-1' : 'space-y-0.5'}>{densityBreakdown.slice(0, expanded ? 7 : 4).map(item => <div key={item.root} className={`flex min-w-0 items-center gap-1.5 ${expanded ? 'text-[9px]' : 'text-[7px]'}`}><i className="h-1.5 w-1.5 flex-none rounded-full" style={{ backgroundColor: rootHexByName.get(item.root) ?? ROOT_NEUTRAL }} /><span className="min-w-0 flex-1 truncate text-th-secondary">{item.root}</span><span className="tabular-nums text-violet-300">{item.percent.toFixed(0)}%</span></div>)}</div>
        </aside>}
        {hoveredNode && (expanded
          ? <div ref={hoverCardRef} className="pointer-events-none absolute left-0 top-0 z-[60] max-w-56 border border-th-hub-border bg-th-base/95 px-2 py-1 font-mono text-[9px] shadow-lg backdrop-blur-sm will-change-transform"><span style={{ color: rootHexByName.get(hoveredNode.address.split('//')[0]) ?? ROOT_NEUTRAL }}>{hoveredNode.address.split('//')[0]}</span><span className="mx-1 text-th-muted">/</span><span className="text-th-primary underline decoration-th-muted underline-offset-2">{hoveredNode.name}</span></div>
          : <div className="pointer-events-none absolute left-1 top-1 z-[60] max-w-[calc(100%-2.5rem)] truncate bg-th-base/82 px-1.5 py-1 font-mono text-[8px] shadow-sm backdrop-blur-sm"><span style={{ color: rootHexByName.get(hoveredNode.address.split('//')[0]) ?? ROOT_NEUTRAL }}>{hoveredNode.address.split('//')[0]}</span><span className="mx-1 text-th-muted">/</span><span className="text-th-primary">{hoveredNode.name}</span></div>
        )}
      </Suspense>
    </div>
  );
};

export default MiniGraph;
