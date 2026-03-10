// Mini force-directed graph for the Second Brain sidebar
// Compact overview with search highlighting, click to expand to full graph

import React, { useState, useEffect, useRef, useCallback, useMemo, Suspense } from 'react';
import { initBrainIndex, type BrainIndex } from '../../lib/brainIndex';
import { useGraphRelevance } from '../../hooks/useGraphRelevance';
import { buildGraphData, type GraphData, type GraphNode, type GraphLink, type EdgeVisibility, EDGE_COLORS, useFilteredGraph } from './useGraphData';

const ForceGraph2D = React.lazy(() => import('react-force-graph-2d'));

const MINI_HEIGHT = 150;

const MiniGraph: React.FC<{
  /** Set of UIDs to highlight (from sidebar search results) */
  highlightIds: Set<string> | null;
  /** Set of UIDs to keep in the graph (from sidebar filters). null = show all. */
  filteredIds: Set<string> | null;
  /** Current search query (passed to full graph via URL) */
  searchQuery: string;
}> = ({ highlightIds, filteredIds }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<any>(null);

  // Data
  const [index, setIndex] = useState<BrainIndex | null>(null);
  const { getCentrality, loaded: relevanceLoaded } = useGraphRelevance();
  const [fullGraph, setFullGraph] = useState<GraphData | null>(null);
  const [visibility] = useState<EdgeVisibility>({ body: true, interaction: true, hierarchy: false });
  const [containerWidth, setContainerWidth] = useState(220);

  // Load index
  useEffect(() => {
    initBrainIndex().then(setIndex);
  }, []);

  // Track container width
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(entries => {
      const { width } = entries[0].contentRect;
      if (width > 0) setContainerWidth(width);
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

  // Refit when filtered set changes
  const prevFilteredSize = useRef(filtered?.nodes.length ?? 0);
  useEffect(() => {
    const curSize = filtered?.nodes.length ?? 0;
    if (curSize > 0 && curSize !== prevFilteredSize.current) {
      prevFilteredSize.current = curSize;
      setTimeout(() => graphRef.current?.zoomToFit?.(400, 2), 300);
    }
  }, [filtered?.nodes.length]);

  // Zoom to fit after simulation settles — closer default
  const hasZoomed = useRef(false);
  useEffect(() => {
    if (!filtered || hasZoomed.current) return;
    const timer = setTimeout(() => {
      graphRef.current?.zoomToFit?.(400, 2);
      hasZoomed.current = true;
    }, 1200);
    return () => clearTimeout(timer);
  }, [filtered]);

  // Apply compact force settings — tighter layout
  useEffect(() => {
    const fg = graphRef.current;
    if (!fg || !fg.d3Force) return;
    const charge = fg.d3Force('charge');
    if (charge) charge.strength(-8);
    const link = fg.d3Force('link');
    if (link) link.distance(6);
    fg.d3ReheatSimulation?.();
  }, [filtered]);

  // Highlight set
  const highlightSet = useMemo(() => highlightIds ?? new Set<string>(), [highlightIds]);
  const isHighlighting = highlightIds !== null && highlightIds.size > 0;

  // Node rendering — compact, no labels
  const nodeCanvasObject = useCallback((node: any, ctx: CanvasRenderingContext2D) => {
    const n = node as GraphNode & { x: number; y: number };
    const r = 1.2 + n.centrality * 4;
    const isMatch = isHighlighting && highlightSet.has(n.id);

    if (isHighlighting && !isMatch) {
      ctx.globalAlpha = 0.1;
    }

    ctx.beginPath();
    ctx.arc(n.x, n.y, r, 0, 2 * Math.PI);
    ctx.fillStyle = isMatch ? '#f59e0b' : n.isParent ? '#8b5cf6' : '#6d28d9';
    ctx.fill();

    if (isMatch) {
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    ctx.globalAlpha = 1;
  }, [isHighlighting, highlightSet]);

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
    ctx.beginPath();
    ctx.moveTo(l.source.x, l.source.y);
    ctx.lineTo(l.target.x, l.target.y);
    ctx.strokeStyle = EDGE_COLORS[l.type];
    ctx.globalAlpha = 0.12;
    ctx.lineWidth = 0.4;
    ctx.stroke();
    ctx.globalAlpha = 1;
  }, []);

  if (!filtered) {
    return (
      <div
        ref={containerRef}
        className="flex items-center justify-center text-th-muted text-[10px] animate-pulse"
        style={{ height: MINI_HEIGHT }}
      >
        Loading...
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative"
      style={{ height: MINI_HEIGHT }}
    >
      <Suspense fallback={
        <div className="flex items-center justify-center h-full text-th-muted text-[10px] animate-pulse">
          Loading...
        </div>
      }>
        <ForceGraph2D
          ref={graphRef}
          graphData={filtered}
          width={containerWidth}
          height={MINI_HEIGHT}
          nodeCanvasObject={nodeCanvasObject}
          nodePointerAreaPaint={nodePointerAreaPaint}
          linkCanvasObject={linkCanvasObject}
          d3AlphaDecay={0.05}
          d3VelocityDecay={0.4}
          warmupTicks={80}
          cooldownTicks={120}
          enableNodeDrag={false}
          enableZoomInteraction={true}
          enablePanInteraction={true}
          backgroundColor="transparent"
        />
      </Suspense>
    </div>
  );
};

export default MiniGraph;
