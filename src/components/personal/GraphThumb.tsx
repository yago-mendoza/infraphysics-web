// Static picture of the whole wiki graph for the Home page, painted the way
// the wiki's minimised graph looks: faint typed edges, small nodes, a ring on
// the hubs. Positions and colours are precomputed at build time
// (scripts/compute-graph-thumb.js), so this is plain inline SVG: no index
// fetch, no force simulation. Stylesheets recolour it per placement through
// the graph-thumb-* classes (a CSS fill beats the presentation attribute).

import React from 'react';
import thumb from '../../data/graph-thumb.generated.json';

interface ThumbNode { id: string; x: number; y: number; z: number; r: number; c: string; p: number }
interface ThumbData { total: number; nodes: ThumbNode[]; links: [number, number, number][] }

const data = thumb as ThumbData;
// Edge colours match EDGE_COLORS in components/graph/useGraphData.ts (body, interaction, hierarchy).
const EDGE_STROKES = ['#60a5fa', '#f59e0b', '#4ade80'];
const HUB_PERCENTILE = .88;

/** Total wikinotes in the graph at build time. */
export const wikiNoteCount = data.total;

export const GraphThumb: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
    <rect className="graph-thumb-field" width="100" height="100" />
    <g className="graph-thumb-links">
      {data.links.map(([a, b, type], index) => {
        const from = data.nodes[a], to = data.nodes[b];
        return <line key={index} x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke={EDGE_STROKES[type] ?? EDGE_STROKES[0]} className={`graph-thumb-link-${type}`} />;
      })}
    </g>
    <g className="graph-thumb-halos">
      {data.nodes.map(node => <circle key={node.id} cx={node.x} cy={node.y} r={node.r * 2.6} fill={node.c} />)}
    </g>
    <g className="graph-thumb-nodes">
      {data.nodes.map(node => <circle key={node.id} cx={node.x} cy={node.y} r={node.r} fill={node.c} />)}
    </g>
    <g className="graph-thumb-rings">
      {data.nodes.filter(node => node.p >= HUB_PERCENTILE).map(node => <circle key={node.id} cx={node.x} cy={node.y} r={node.r * 1.9} fill="none" stroke={node.c} />)}
    </g>
  </svg>
);
