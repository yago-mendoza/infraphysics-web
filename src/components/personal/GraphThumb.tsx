// Static picture of the whole wiki graph for the Home page, painted the way
// the wiki's minimised graph looks: dark field, faint typed edges, small nodes
// with a soft halo. Positions and colours are precomputed at build time
// (scripts/compute-graph-thumb.js), so this is plain inline SVG: no index
// fetch, no force simulation. `tone` picks root-family colours or the wiki's
// purple centrality ramp.

import React from 'react';
import thumb from '../../data/graph-thumb.generated.json';

interface ThumbNode { id: string; x: number; y: number; r: number; c: string; p: number }
interface ThumbData { total: number; nodes: ThumbNode[]; links: [number, number, number][] }

const data = thumb as ThumbData;
// Edge colours match EDGE_COLORS in components/graph/useGraphData.ts (body, interaction, hierarchy).
const EDGE_STROKES = ['#60a5fa', '#f59e0b', '#4ade80'];
// Purple centrality ramp, same endpoints as SCALE_LOW / SCALE_HIGH in MiniGraph.tsx.
const PURPLE_LOW = [91, 33, 182], PURPLE_HIGH = [196, 181, 253];
const purple = (p: number) => `rgb(${PURPLE_LOW.map((channel, i) => Math.round(channel + (PURPLE_HIGH[i] - channel) * p)).join(',')})`;

/** Total wikinotes in the graph at build time. */
export const wikiNoteCount = data.total;

export const GraphThumb: React.FC<{ className?: string; tone?: 'roots' | 'purple' }> = ({ className, tone = 'roots' }) => {
  const fill = (node: ThumbNode) => (tone === 'purple' ? purple(node.p) : node.c);
  return (
    <svg className={className} viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
      <rect className="graph-thumb-field" width="100" height="100" />
      <g className="graph-thumb-links">
        {data.links.map(([a, b, type], index) => {
          const from = data.nodes[a], to = data.nodes[b];
          return <line key={index} x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke={tone === 'purple' ? '#a78bfa' : (EDGE_STROKES[type] ?? EDGE_STROKES[0])} />;
        })}
      </g>
      <g className="graph-thumb-halos">
        {data.nodes.map(node => <circle key={node.id} cx={node.x} cy={node.y} r={node.r * 2.6} fill={fill(node)} />)}
      </g>
      <g className="graph-thumb-nodes">
        {data.nodes.map(node => <circle key={node.id} cx={node.x} cy={node.y} r={node.r} fill={fill(node)} />)}
      </g>
    </svg>
  );
};
