// Mini force-directed graph for the Second Brain sidebar
// Compact overview, click to expand to full graph. Nodes sit on a purple
// centrality scale (inherited from the retired Centrality panel); active
// filter/search matches turn infraphysics lime while the rest keep purple.

import React, { useState, useEffect, useRef, useCallback, useMemo, Suspense } from 'react';
import { initBrainIndex, type BrainIndex } from '../../lib/brainIndex';
import { useGraphRelevance } from '../../hooks/useGraphRelevance';
import { buildGraphData, type GraphData, type GraphNode, type GraphLink, type EdgeVisibility, EDGE_COLORS, useFilteredGraph } from './useGraphData';

const ForceGraph2D = React.lazy(() => import('react-force-graph-2d'));

const MINI_HEIGHT = 150;
const INITIAL_ZOOM_MULTIPLIER = 1.78;

// Canvas colors are raw values by necessity (no CSS cascade inside canvas paint).
// Purple centrality scale: periphery (violet-800) → core (violet-300).
const SCALE_LOW = [91, 33, 182];
const SCALE_HIGH = [196, 181, 253];
// Selection color: infraphysics lime, mirrors --cat-projects-accent (theme-constant)
const SELECT_RGB = [163, 230, 53];
const SELECT_HEX = '#a3e635';
const SELECT_RING = '#d9f99d';

const MiniGraph: React.FC<{
  /** Set of UIDs to highlight (from sidebar search results) */
  highlightIds: Set<string> | null;
  /** Set of UIDs to keep in the graph (from sidebar filters). null = show all. */
  filteredIds: Set<string> | null;
  /** Current search query (passed to full graph via URL) */
  searchQuery: string;
  expanded?: boolean;
  onNodeOpen?: (node: GraphNode) => void;
}> = ({ highlightIds, filteredIds, expanded = false, onNodeOpen }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<any>(null);

  // Data
  const [index, setIndex] = useState<BrainIndex | null>(null);
  const { getCentrality, getPercentile, loaded: relevanceLoaded } = useGraphRelevance();
  const [fullGraph, setFullGraph] = useState<GraphData | null>(null);
  const [visibility] = useState<EdgeVisibility>({ body: true, interaction: true, hierarchy: false });
  const [containerWidth, setContainerWidth] = useState(220);
  const [containerHeight, setContainerHeight] = useState(MINI_HEIGHT);
  const [isFramed, setIsFramed] = useState(false);
  const highlightFrameRef = useRef(0);
  const highlightVisualRef = useRef({ strength: 0, matches: new Map<string, number>() });
  // While the highlight animation runs, autoPauseRedraw is disabled so the
  // canvas repaints without user interaction (the ref exposes no refresh()).
  const [highlightAnimating, setHighlightAnimating] = useState(false);

  // Load index
  useEffect(() => {
    initBrainIndex().then(setIndex);
  }, []);

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
    setFullGraph(buildGraphData(index, centralityMap));
  }, [index, relevanceLoaded, getCentrality]);

  const edgeFiltered = useFilteredGraph(fullGraph, visibility);

  // Percentile per node (0–1) drives the purple scale — uniform ramp, unlike raw PageRank
  const pctById = useMemo(() => {
    const map = new Map<string, number>();
    fullGraph?.nodes.forEach(n => map.set(n.id, getPercentile(n.id) / 100));
    return map;
  }, [fullGraph, getPercentile]);

  // Apply hub filters — remove nodes not in the filtered set
  const filtered = useMemo(() => {
    if (!edgeFiltered || !filteredIds) return edgeFiltered;
    const nodes = edgeFiltered.nodes.filter(n => filteredIds.has(n.id));
    const nodeSet = new Set(nodes.map(n => n.id));
    const links = edgeFiltered.links.filter((l: any) => {
      const src = typeof l.source === 'object' ? l.source.id : l.source;
      const tgt = typeof l.target === 'object' ? l.target.id : l.target;
      return nodeSet.has(src) && nodeSet.has(tgt);
    });
    return { nodes, links };
  }, [edgeFiltered, filteredIds]);

  // Refit only when the structural node set changes. Query highlighting never
  // changes `filtered`, so typing cannot reset the camera or the simulation.
  useEffect(() => { setIsFramed(false); }, [filtered?.nodes.length, expanded]);

  // Zoom to fit after simulation settles — closer default
  const frameGraph = useCallback(() => {
    const instance = graphRef.current;
    if (!instance || !filtered?.nodes.length || isFramed) return;
    instance.zoomToFit?.(0, 0);
    requestAnimationFrame(() => {
      const fittedZoom = instance.zoom?.();
      if (typeof fittedZoom === 'number') instance.zoom(fittedZoom * (expanded ? 1.08 : INITIAL_ZOOM_MULTIPLIER), 0);
      setIsFramed(true);
    });
  }, [expanded, filtered?.nodes.length, isFramed]);

  // Apply compact force settings — tighter layout
  useEffect(() => {
    const fg = graphRef.current;
    if (!fg || !fg.d3Force) return;
    const charge = fg.d3Force('charge');
    if (charge) charge.strength(expanded ? -34 : -8);
    const link = fg.d3Force('link');
    if (link) link.distance(expanded ? 18 : 6);
    fg.d3ReheatSimulation?.();
  }, [expanded, filtered]);

  // Highlight set
  const highlightSet = useMemo(() => highlightIds ?? new Set<string>(), [highlightIds]);
  const isHighlighting = highlightIds !== null;

  // A highlight update is paint-only. Interpolate the visual mask while keeping
  // the simulation completely cold: positions, zoom, and pan never reset.
  useEffect(() => {
    cancelAnimationFrame(highlightFrameRef.current);
    const nodes = fullGraph?.nodes ?? [];
    const startedAt = performance.now();
    const duration = 180;
    const startStrength = highlightVisualRef.current.strength;
    const targetStrength = isHighlighting ? 1 : 0;
    const starts = new Map<string, number>(nodes.map(node => [node.id, highlightVisualRef.current.matches.get(node.id) ?? 0]));
    setHighlightAnimating(true);

    const animate = (now: number) => {
      const raw = Math.min(1, (now - startedAt) / duration);
      const eased = 1 - Math.pow(1 - raw, 3);
      const matches = new Map<string, number>();
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
  }, [fullGraph, highlightSet, isHighlighting]);

  // Node rendering — compact, no labels
  const nodeCanvasObject = useCallback((node: any, ctx: CanvasRenderingContext2D) => {
    const n = node as GraphNode & { x: number; y: number };
    const r = 1.2 + n.centrality * 4;
    const { strength, matches } = highlightVisualRef.current;
    const match = matches.get(n.id) ?? 0;
    const emphasis = strength * match;
    // Non-matching nodes keep their purple scale, only gently dimmed
    ctx.globalAlpha = Math.max(0.4, 1 - strength * (1 - match) * 0.6);

    ctx.beginPath();
    ctx.arc(n.x, n.y, r, 0, 2 * Math.PI);
    const t = pctById.get(n.id) ?? 0;
    const base = SCALE_LOW.map((channel, index) => channel + (SCALE_HIGH[index] - channel) * t);
    ctx.fillStyle = `rgb(${base.map((channel, index) => Math.round(channel + (SELECT_RGB[index] - channel) * emphasis)).join(', ')})`;
    ctx.fill();

    if (emphasis > 0.02) {
      ctx.shadowColor = SELECT_HEX;
      ctx.shadowBlur = 5 * emphasis;
      ctx.strokeStyle = SELECT_RING;
      ctx.lineWidth = 0.4 + 0.5 * emphasis;
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    ctx.globalAlpha = 1;
  }, [pctById]);

  const nodePointerAreaPaint = useCallback((node: any, color: string, ctx: CanvasRenderingContext2D) => {
    const n = node as GraphNode & { x: number; y: number };
    ctx.beginPath();
    ctx.arc(n.x, n.y, (1.2 + n.centrality * 4) + 2, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill();
  }, []);

  // Link rendering — thin, subtle
  const linkCanvasObject = useCallback((link: any, ctx: CanvasRenderingContext2D) => {
    const l = link as GraphLink & { source: { x: number; y: number }; target: { x: number; y: number } };
    if (!l.source?.x || !l.target?.x) return;
    const { strength, matches } = highlightVisualRef.current;
    const branch = Math.min(
      matches.get((l.source as any).id as string) ?? 0,
      matches.get((l.target as any).id as string) ?? 0,
    );
    ctx.beginPath();
    ctx.moveTo(l.source.x, l.source.y);
    ctx.lineTo(l.target.x, l.target.y);
    ctx.strokeStyle = branch > 0.15 ? SELECT_HEX : EDGE_COLORS[l.type];
    ctx.globalAlpha = 0.12 * (1 - strength) + strength * (0.05 + 0.5 * branch);
    ctx.lineWidth = 0.4 + 0.35 * branch;
    ctx.stroke();
    ctx.globalAlpha = 1;
  }, []);

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
      className="relative"
      style={{ height: expanded ? '100%' : MINI_HEIGHT }}
    >
      <Suspense fallback={
        <div className="flex items-center justify-center h-full text-th-muted text-[10px] animate-pulse">
          Loading...
        </div>
      }>
        <div style={{ opacity: isFramed ? 1 : 0, transition: 'opacity 180ms ease' }}>
          <ForceGraph2D
            ref={graphRef}
            graphData={filtered}
            width={containerWidth}
            height={containerHeight}
            nodeCanvasObject={nodeCanvasObject}
            nodePointerAreaPaint={nodePointerAreaPaint}
            linkCanvasObject={linkCanvasObject}
            onEngineStop={frameGraph}
            onNodeClick={(node: any) => expanded && onNodeOpen?.(node as GraphNode)}
            onNodeHover={(node: any) => { const canvas = containerRef.current?.querySelector('canvas'); if (canvas) canvas.style.cursor = expanded && node ? 'pointer' : 'grab'; }}
            autoPauseRedraw={!highlightAnimating}
            d3AlphaDecay={0.05}
            d3VelocityDecay={0.4}
            warmupTicks={80}
            cooldownTicks={120}
            enableNodeDrag={expanded}
            enableZoomInteraction={true}
            enablePanInteraction={true}
            backgroundColor="transparent"
          />
        </div>
        {!isFramed && filtered.nodes.length > 0 && (
          <div className="absolute inset-0 grid place-items-center pointer-events-none text-th-muted text-[10px]">Loading map...</div>
        )}
      </Suspense>
    </div>
  );
};

export default MiniGraph;
