// Frozen 3D view of the wiki graph for the Home closing plate: the build-time
// layout (x, y, z) projected once with perspective from a fixed viewpoint,
// depth-sorted, with size and opacity falling off with distance. Static SVG,
// no animation, no library.

import React, { useMemo } from 'react';
import thumb from '../../data/graph-thumb.generated.json';

interface ThumbNode { id: string; x: number; y: number; z: number; r: number; c: string; p: number }
interface ThumbData { total: number; nodes: ThumbNode[]; links: [number, number, number][] }

const data = thumb as ThumbData;
const YAW = -0.62, PITCH = 0.34, CAMERA = 230; // radians, radians, distance of the eye from the graph centre

interface Projected { x: number; y: number; depth: number; scale: number }

function project(): { nodes: Projected[]; order: number[] } {
  const cy = Math.cos(YAW), sy = Math.sin(YAW), cp = Math.cos(PITCH), sp = Math.sin(PITCH);
  const nodes = data.nodes.map(node => {
    // centre, rotate around Y then X, then perspective
    const x0 = node.x - 50, y0 = node.y - 50, z0 = node.z;
    const x1 = x0 * cy + z0 * sy, z1 = -x0 * sy + z0 * cy;
    const y2 = y0 * cp - z1 * sp, z2 = y0 * sp + z1 * cp;
    const scale = CAMERA / (CAMERA - z2);
    return { x: 50 + x1 * scale, y: 50 + y2 * scale, depth: z2, scale };
  });
  const order = nodes.map((_, i) => i).sort((a, b) => nodes[a].depth - nodes[b].depth); // far first
  return { nodes, order };
}

export const GraphThumb3D: React.FC<{ className?: string }> = ({ className }) => {
  const { nodes, order } = useMemo(project, []);
  const depths = nodes.map(n => n.depth);
  const minD = Math.min(...depths), maxD = Math.max(...depths);
  const near = (d: number) => (d - minD) / Math.max(1e-6, maxD - minD); // 0 far, 1 near
  const links = useMemo(() => data.links
    .map(([a, b, type]) => ({ a, b, type, depth: (nodes[a].depth + nodes[b].depth) / 2 }))
    .sort((l, m) => l.depth - m.depth), [nodes]);
  return (
    <svg className={className} viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
      <rect className="graph-thumb-field" width="100" height="100" />
      <g className="graph-thumb-links">
        {links.map((link, index) => {
          const from = nodes[link.a], to = nodes[link.b];
          return <line key={index} x1={from.x} y1={from.y} x2={to.x} y2={to.y} className={`graph-thumb-link-${link.type}`} style={{ opacity: .25 + near(link.depth) * .75 }} />;
        })}
      </g>
      <g className="graph-thumb-nodes">
        {order.map(i => {
          const node = data.nodes[i], p = nodes[i];
          return <circle key={node.id} cx={p.x} cy={p.y} r={node.r * p.scale * .8} fill={node.c} style={{ opacity: .3 + near(p.depth) * .7 }} />;
        })}
      </g>
    </svg>
  );
};
