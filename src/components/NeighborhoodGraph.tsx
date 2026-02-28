// NeighborhoodGraph — interactive SVG visualization of a concept's structural neighborhood
// Shows: parent (left, blue), current node (center, white), siblings (center, purple), children (right, purple)
// Clicking a zone reveals its details below the graph.
// Sibling-to-sibling navigation animates: the white bar slides to where the sibling dot was.

import React, { useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { noteLabel, type FieldNoteMeta } from '../types';
import type { Neighborhood } from '../lib/brainIndex';
import { secondBrainPath } from '../config/categories';
import { useTheme } from '../contexts/ThemeContext';

export type Zone = 'parent' | 'siblings' | 'children' | null;

interface Props {
  neighborhood: Neighborhood;
  currentNote: FieldNoteMeta;
  onNoteClick: (note: FieldNoteMeta) => void;
  isVisited?: (noteId: string) => boolean;
  activeZone: Zone;
  onActiveZoneChange: (zone: Zone) => void;
  homonymParents?: { parent: FieldNoteMeta; homonym: FieldNoteMeta }[];
  onHomonymNavigate?: (homonym: FieldNoteMeta) => void;
}

// Layout constants
const W = 300;
const H_MIN = 72;
const H_PER_NODE = 20;
const PARENT_X = 30;
const CENTER_X = 150;
const CHILDREN_X = 270;
const NODE_R = 3.5;
const CURRENT_W = 4;
const CURRENT_H = 22;
const HIT_R = 10;      // invisible hit-area radius for tooltip hover
const TRANSITION = '400ms ease';
const MAX_COL = 10;    // max nodes per center column before splitting
const COL_GAP = 14;    // horizontal gap between center sub-columns

// Colors
const COL_CURRENT_DARK = 'rgba(255,255,255,0.75)';
const COL_CURRENT_LIGHT = 'rgba(0,0,0,0.75)';
const COL_PARENT = 'rgba(139,92,246,0.8)';
const COL_PARENT_VISITED = 'rgba(96,165,250,0.8)';
const COL_SIBLING = 'rgba(139,92,246,0.6)';
const COL_CHILD = 'rgba(139,92,246,0.6)';
const COL_LINE_PARENT = 'rgba(139,92,246,0.15)';
const COL_LINE_CHILD = 'rgba(139,92,246,0.15)';
const COL_LINE_PARENT_HOVER = 'rgba(139,92,246,0.35)';
const COL_LINE_CHILD_HOVER = 'rgba(139,92,246,0.35)';

function distributeY(count: number, centerY: number, spacing: number): number[] {
  if (count === 0) return [];
  if (count === 1) return [centerY];
  const totalSpan = (count - 1) * spacing;
  const startY = centerY - totalSpan / 2;
  return Array.from({ length: count }, (_, i) => startY + i * spacing);
}

// Distribute nodes around centerY but leave a gap at centerY for the current node.
// Splits nodes into two halves above and below centerY.
function distributeYWithGap(count: number, centerY: number, spacing: number, gapH: number): number[] {
  if (count === 0) return [];
  const halfGap = gapH / 2 + spacing / 2;
  const above = Math.ceil(count / 2);
  const below = count - above;
  const ys: number[] = [];
  // above group: bottom-aligned just above the gap
  for (let i = 0; i < above; i++) {
    ys.push(centerY - halfGap - (above - 1 - i) * spacing);
  }
  // below group: top-aligned just below the gap
  for (let i = 0; i < below; i++) {
    ys.push(centerY + halfGap + i * spacing);
  }
  return ys;
}

function bezierH(x1: number, y1: number, x2: number, y2: number): string {
  const midX = (x1 + x2) / 2;
  return `M${x1},${y1} C${midX},${y1} ${midX},${y2} ${x2},${y2}`;
}

const COL_VISITED = 'rgba(96,165,250,0.55)';  // blue for visited nodes
const COL_GHOST_PARENT = 'rgba(139,92,246,0.35)'; // faded purple for ghost parent dots (unvisited)
const COL_GHOST_PARENT_VISITED = 'rgba(96,165,250,0.35)'; // faded blue for ghost parent dots (visited)
const PARENT_COL_GAP = 14; // horizontal gap between ghost parent columns

// Diamond column layout for ghost parents.
// Fills columns nearest to real parent first, then expands leftward.
// Col 1 (nearest to parent): max height 2, col 2: max 3, col k: max k+1
// Result is left-to-right order (farthest first, nearest last).
function ghostDiamondColumns(n: number): number[] {
  if (n === 0) return [];
  const cols: number[] = [];
  let remaining = n;
  let colIdx = 1;
  while (remaining > 0) {
    const maxH = colIdx + 1;
    const h = Math.min(maxH, remaining);
    cols.push(h); // nearest-first during build
    remaining -= h;
    colIdx++;
  }
  cols.reverse(); // flip to left-to-right
  return cols;
}

export const NeighborhoodGraph: React.FC<Props> = ({ neighborhood, currentNote, onNoteClick, isVisited, activeZone, onActiveZoneChange, homonymParents, onHomonymNavigate }) => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const COL_CURRENT = theme === 'light' ? COL_CURRENT_LIGHT : COL_CURRENT_DARK;
  const [hoveredZone, setHoveredZone] = useState<Zone>(null);
  const [highlightedNoteId, setHighlightedNoteId] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{ label: string; x: number; y: number } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const showTooltip = (note: FieldNoteMeta, svgX: number, svgY: number) => {
    setTooltip({ label: noteLabel(note), x: svgX, y: svgY });
  };
  const hideTooltip = () => setTooltip(null);

  const { parent, siblings, children } = neighborhood;

  // Unified center column: current + siblings, sorted stably by address.
  // Using key={note.id} on SVG elements means React reuses DOM nodes across renders,
  // so CSS transitions animate sibling→current and current→sibling smoothly.
  const centerEntries = useMemo(() => {
    const all = [
      { note: currentNote, isCurrent: true },
      ...siblings.map(s => ({ note: s, isCurrent: false })),
    ];
    all.sort((a, b) => (a.note.address || a.note.title).localeCompare(b.note.address || b.note.title));
    return all;
  }, [currentNote, siblings]);

  // Ghost parent diamond layout — compute before SVG height so it can influence sizing
  const ghostParents = homonymParents || [];
  const ghostColHeights = useMemo(() => ghostDiamondColumns(ghostParents.length), [ghostParents.length]);
  const maxGhostColHeight = ghostColHeights.length > 0 ? Math.max(...ghostColHeights) : 0;

  // Calculate SVG height — tallest columns are capped at MAX_COL
  const tallestCenter = Math.min(centerEntries.length, MAX_COL);
  const tallestChildren = Math.min(children.length, MAX_COL);
  const maxNodes = Math.max(tallestCenter, tallestChildren, parent ? 1 : 0, maxGhostColHeight);
  const svgH = Math.max(H_MIN, maxNodes * H_PER_NODE + 28);
  const centerY = svgH / 2;

  // Diamond multi-column layout for center entries.
  // Current node is always placed to the right of siblings and vertically centered,
  // so parent→sibling lines don't cross over the current node.
  const centerPositions = useMemo(() => {
    const siblingEntries = centerEntries.filter(e => !e.isCurrent);
    const currentEntry = centerEntries.find(e => e.isCurrent);
    const S = siblingEntries.length;

    // Position siblings in columns. The rightmost column uses distributeYWithGap
    // to leave a gap at centerY where the current node sits.
    const positions: { entry: typeof centerEntries[0]; x: number; y: number }[] = [];

    if (S === 0) {
      // No siblings — current alone at center
    } else if (S <= MAX_COL) {
      // Single column — leave gap for current at centerY
      const ys = distributeYWithGap(S, centerY, H_PER_NODE, CURRENT_H);
      siblingEntries.forEach((e, i) => positions.push({ entry: e, x: CENTER_X, y: ys[i] }));
    } else {
      let cols: number[];
      if (S <= MAX_COL + 8) {
        cols = [S - MAX_COL, MAX_COL];
      } else if (S <= MAX_COL + 16) {
        const rem = S - MAX_COL;
        cols = [Math.ceil(rem / 2), MAX_COL, Math.floor(rem / 2)];
      } else {
        const rem = S - MAX_COL;
        const innerCap = 8;
        const innerUsed = Math.min(rem, innerCap * 2);
        const outerRem = rem - innerUsed;
        const left = Math.ceil(innerUsed / 2);
        const right = innerUsed - left;
        const outerL = Math.ceil(outerRem / 2);
        const outerR = outerRem - outerL;
        cols = [outerL, left, MAX_COL, right, outerR].filter(c => c > 0);
      }
      const centerColIdx = cols.indexOf(Math.max(...cols));
      const colXs = cols.map((_, i) => CENTER_X + (i - centerColIdx) * COL_GAP);
      let idx = 0;
      const lastCol = cols.length - 1;
      for (let c = 0; c < cols.length; c++) {
        const count = cols[c];
        // Rightmost column: leave gap at centerY for current node
        const ys = c === lastCol
          ? distributeYWithGap(count, centerY, H_PER_NODE, CURRENT_H)
          : distributeY(count, centerY, H_PER_NODE);
        for (let j = 0; j < count && idx < S; j++) {
          positions.push({ entry: siblingEntries[idx], x: colXs[c], y: ys[j] });
          idx++;
        }
      }
    }

    // Current node: rightmost column, vertically centered
    if (currentEntry) {
      const curX = positions.length > 0
        ? Math.max(...positions.map(p => p.x))
        : CENTER_X;
      positions.push({ entry: currentEntry, x: curX, y: centerY });
    }

    return positions;
  }, [centerEntries, centerY]);

  const parentPos = parent ? { x: PARENT_X, y: centerY } : null;

  // Diamond multi-column layout for children (mirrors sibling layout)
  const childrenPositions = useMemo(() => {
    const C = children.length;
    if (C === 0) return [];
    if (C <= MAX_COL) {
      const ys = distributeY(C, centerY, H_PER_NODE);
      return ys.map(y => ({ x: CHILDREN_X, y }));
    }

    let cols: number[];
    if (C <= MAX_COL + 8) {
      cols = [C - MAX_COL, MAX_COL];
    } else if (C <= MAX_COL + 16) {
      const rem = C - MAX_COL;
      cols = [Math.ceil(rem / 2), MAX_COL, Math.floor(rem / 2)];
    } else {
      const rem = C - MAX_COL;
      const innerCap = 8;
      const innerUsed = Math.min(rem, innerCap * 2);
      const outerRem = rem - innerUsed;
      const left = Math.ceil(innerUsed / 2);
      const right = innerUsed - left;
      const outerL = Math.ceil(outerRem / 2);
      const outerR = outerRem - outerL;
      cols = [outerL, left, MAX_COL, right, outerR].filter(c => c > 0);
    }

    const centerColIdx = cols.indexOf(Math.max(...cols));
    const colXs = cols.map((_, i) => CHILDREN_X + (i - centerColIdx) * COL_GAP);

    const positions: { x: number; y: number }[] = [];
    let idx = 0;
    for (let c = 0; c < cols.length; c++) {
      const count = cols[c];
      const ys = distributeY(count, centerY, H_PER_NODE);
      for (let j = 0; j < count && idx < C; j++) {
        positions.push({ x: colXs[c], y: ys[j] });
        idx++;
      }
    }

    return positions;
  }, [children.length, centerY]);

  // Ghost parent positions — diamond formation to the left of the real parent
  const ghostParentPositions = useMemo(() => {
    if (ghostColHeights.length === 0) return [];
    const numCols = ghostColHeights.length;
    // Dynamic gap: shrink if too many columns would overflow the SVG left edge
    const gapX = Math.min(PARENT_COL_GAP, numCols > 0 ? (PARENT_X - 4) / numCols : PARENT_COL_GAP);
    const positions: { entry: typeof ghostParents[0]; x: number; y: number }[] = [];
    let ghostIdx = 0;

    for (let c = 0; c < numCols; c++) {
      const colHeight = ghostColHeights[c];
      // Columns are left-to-right; column c is (numCols - c) gaps left of parent
      const colX = PARENT_X - (numCols - c) * gapX;
      const ys = distributeY(colHeight, centerY, H_PER_NODE);
      for (const y of ys) {
        if (ghostIdx < ghostParents.length) {
          positions.push({ entry: ghostParents[ghostIdx], x: colX, y });
          ghostIdx++;
        }
      }
    }

    return positions;
  }, [ghostColHeights, ghostParents, centerY]);

  // Find current node's position for children lines
  const currentPos = centerPositions.find(p => p.entry.isCurrent);
  const currentX = currentPos ? currentPos.x : CENTER_X;
  const currentY = currentPos ? currentPos.y : centerY;

  const highlightZone = hoveredZone || activeZone;

  // Dynamic center zone width based on column spread
  const centerSpread = useMemo(() => {
    if (centerPositions.length <= 1) return 0;
    const xs = centerPositions.map(p => p.x);
    return Math.max(...xs) - Math.min(...xs);
  }, [centerPositions]);
  const sibZoneW = Math.max(76, centerSpread + 24);
  const sibZoneX = CENTER_X - sibZoneW / 2;

  // Zone column configs — shared between active indicator and hover indicator
  const zoneConfigs: Record<string, { x: number; w: number }> = {
    parent:   { x: 2,            w: sibZoneX - 4 },
    siblings: { x: sibZoneX,     w: sibZoneW },
    children: { x: sibZoneX + sibZoneW + 2, w: W - sibZoneX - sibZoneW - 4 },
  };
  const defaultPos = zoneConfigs.siblings;

  // Active indicator — moves only on click
  const activeIndicator = useMemo(() => {
    if (!activeZone) return { ...defaultPos, fill: 'rgba(139,92,246,0.07)', opacity: 0 };
    const cfg = zoneConfigs[activeZone];
    const fill = 'rgba(139,92,246,0.08)';
    return { ...cfg, fill, opacity: 1 };
  }, [activeZone, sibZoneW]);

  // Hover indicator — lighter shadow, only when hovering a zone different from active
  const hoverIndicator = useMemo(() => {
    if (!hoveredZone || hoveredZone === activeZone) return { ...defaultPos, fill: 'transparent', opacity: 0 };
    const cfg = zoneConfigs[hoveredZone];
    const fill = 'rgba(139,92,246,0.04)';
    return { ...cfg, fill, opacity: 1 };
  }, [hoveredZone, activeZone, sibZoneW]);

  const handleZoneClick = (zone: Zone) => {
    if (zone !== activeZone) onActiveZoneChange(zone);
  };

  const isEmpty = !parent && siblings.length === 0 && children.length === 0;

  if (isEmpty) {
    return (
      <div
        className="border border-th-hub-border rounded-sm flex items-center justify-center"
        style={{ height: 60, backgroundColor: 'rgba(0,0,0,0.15)' }}
      >
        <span className="text-[10px] text-th-muted">Root concept — no structural neighbors</span>
      </div>
    );
  }

  return (
    <div>
      {/* SVG Graph */}
      <div
        className="relative select-none border border-th-hub-border rounded-sm"
        style={{ backgroundColor: 'rgba(255,255,255,0.02)' }}
      >
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${svgH}`}
          className="w-full block"
          style={{ height: Math.min(svgH, 240) }}
        >
          <defs>
            <filter id="node-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Active zone column highlight — follows clicks only */}
          <rect
            x={activeIndicator.x}
            y={2}
            width={activeIndicator.w}
            height={svgH - 4}
            fill={activeIndicator.fill}
            opacity={activeIndicator.opacity}
            rx={3}
            style={{ transition: `x ${TRANSITION}, width ${TRANSITION}, fill ${TRANSITION}, opacity 300ms ease` }}
          />
          {/* Hover hint — lighter shadow on hovered zone when different from active */}
          <rect
            x={hoverIndicator.x}
            y={2}
            width={hoverIndicator.w}
            height={svgH - 4}
            fill={hoverIndicator.fill}
            opacity={hoverIndicator.opacity}
            rx={3}
            style={{ transition: `x ${TRANSITION}, width ${TRANSITION}, opacity 200ms ease` }}
          />

          {/* Invisible click zones — behind nodes so <title> tooltips work */}
          {parentPos && (
            <rect
              x={0} y={0} width={sibZoneX} height={svgH}
              fill="transparent"
              style={{ cursor: 'pointer' }}
              onClick={() => handleZoneClick('parent')}
              onMouseEnter={() => setHoveredZone('parent')}
              onMouseLeave={() => setHoveredZone(null)}
            />
          )}
          <rect
            x={sibZoneX} y={0} width={sibZoneW} height={svgH}
            fill="transparent"
            style={{ cursor: siblings.length > 0 ? 'pointer' : 'default' }}
            onClick={() => siblings.length > 0 && handleZoneClick('siblings')}
            onMouseEnter={() => siblings.length > 0 && setHoveredZone('siblings')}
            onMouseLeave={() => setHoveredZone(null)}
          />
          {children.length > 0 && (
            <rect
              x={sibZoneX + sibZoneW} y={0} width={W - sibZoneX - sibZoneW} height={svgH}
              fill="transparent"
              style={{ cursor: 'pointer' }}
              onClick={() => handleZoneClick('children')}
              onMouseEnter={() => setHoveredZone('children')}
              onMouseLeave={() => setHoveredZone(null)}
            />
          )}

          {/* Lines: center nodes → parent */}
          {parentPos && (
            <g>
              {centerPositions.map((pos) => (
                <path
                  key={`line-parent-${pos.entry.note.id}`}
                  d={bezierH(
                    pos.x - (pos.entry.isCurrent ? CURRENT_W / 2 : NODE_R) - 1,
                    pos.y,
                    parentPos.x + NODE_R + 1,
                    parentPos.y
                  )}
                  fill="none"
                  stroke={highlightZone === 'parent' ? COL_LINE_PARENT_HOVER : COL_LINE_PARENT}
                  strokeWidth={pos.entry.isCurrent ? 1.2 : 0.8}
                  style={{ transition: `stroke 300ms ease, d ${TRANSITION}` }}
                />
              ))}
            </g>
          )}

          {/* Lines: current → children */}
          <g>
            {childrenPositions.map((pos, i) => (
              <path
                key={`line-child-${children[i].id}`}
                d={bezierH(currentX + CURRENT_W / 2 + 1, currentY, pos.x - NODE_R - 1, pos.y)}
                fill="none"
                stroke={highlightZone === 'children' ? COL_LINE_CHILD_HOVER : COL_LINE_CHILD}
                strokeWidth={1}
                style={{ transition: `stroke 300ms ease, d ${TRANSITION}` }}
              />
            ))}
          </g>

          {/* Parent node */}
          {parentPos && (() => {
            const isHighlighted = highlightedNoteId === parent!.id;
            return (
              <g>
                <circle
                  cx={parentPos.x}
                  cy={parentPos.y}
                  r={5}
                  fill={isHighlighted ? 'rgba(139,92,246,1)' : isVisited?.(parent!.id) ? COL_PARENT_VISITED : COL_PARENT}
                  filter={isHighlighted ? 'url(#node-glow)' : 'none'}
                  style={{ transition: 'fill 200ms ease' }}
                />
                <circle
                  cx={parentPos.x} cy={parentPos.y} r={HIT_R}
                  fill="transparent" style={{ cursor: 'pointer' }}
                  onClick={() => { onNoteClick(parent!); navigate(secondBrainPath(parent!.id)); }}
                  onMouseEnter={() => { setHoveredZone('parent'); showTooltip(parent!, parentPos.x, parentPos.y); }}
                  onMouseLeave={() => { setHoveredZone(null); hideTooltip(); }}
                />
              </g>
            );
          })()}

          {/* Ghost parent dots — homonym alternate parents, diamond layout, no connectors */}
          {ghostParentPositions.map((pos) => (
            <g key={`ghost-${pos.entry.homonym.id}`}>
              <circle
                className="homonym-ghost-dot"
                cx={pos.x} cy={pos.y} r={5}
                fill={isVisited?.(pos.entry.parent.id) ? COL_GHOST_PARENT_VISITED : COL_GHOST_PARENT}
              />
              <circle
                cx={pos.x} cy={pos.y} r={HIT_R}
                fill="transparent" style={{ cursor: 'pointer' }}
                onClick={() => onHomonymNavigate?.(pos.entry.homonym)}
                onMouseEnter={() => showTooltip(pos.entry.parent, pos.x, pos.y)}
                onMouseLeave={hideTooltip}
              />
            </g>
          ))}

          {/* Center: current + siblings as uniform rects with stable keys (diamond layout) */}
          {centerPositions.map((pos) => {
            const isCur = pos.entry.isCurrent;
            const isHighlighted = !isCur && highlightedNoteId === pos.entry.note.id;
            const w = isCur ? CURRENT_W : NODE_R * 2;
            const h = isCur ? CURRENT_H : NODE_R * 2;
            const rx = isCur ? 2 : NODE_R;
            return (
              <g key={pos.entry.note.id}>
                <rect
                  x={pos.x - w / 2}
                  y={pos.y - h / 2}
                  width={w}
                  height={h}
                  rx={rx}
                  fill={isHighlighted ? 'rgba(139,92,246,1)' : isCur ? COL_CURRENT : (isVisited?.(pos.entry.note.id) ? COL_VISITED : COL_SIBLING)}
                  filter={isHighlighted ? 'url(#node-glow)' : 'none'}
                  style={{
                    transition: `x ${TRANSITION}, y ${TRANSITION}, width ${TRANSITION}, height ${TRANSITION}, rx ${TRANSITION}, fill 200ms ease`,
                  }}
                />
                <circle
                  cx={pos.x} cy={pos.y} r={HIT_R}
                  fill="transparent" style={{ cursor: isCur ? 'default' : 'pointer' }}
                  onClick={() => { if (!isCur) { onNoteClick(pos.entry.note); navigate(secondBrainPath(pos.entry.note.id)); } }}
                  onMouseEnter={() => { if (!isCur) setHoveredZone('siblings'); showTooltip(pos.entry.note, pos.x, pos.y); }}
                  onMouseLeave={() => { setHoveredZone(null); hideTooltip(); }}
                />
              </g>
            );
          })}

          {/* Children nodes */}
          {childrenPositions.map((pos, i) => {
            const isHighlighted = highlightedNoteId === children[i].id;
            return (
              <g key={`child-${children[i].id}`}>
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={NODE_R}
                  fill={isHighlighted ? 'rgba(139,92,246,1)' : isVisited?.(children[i].id) ? COL_VISITED : COL_CHILD}
                  filter={isHighlighted ? 'url(#node-glow)' : 'none'}
                  style={{ transition: 'fill 200ms ease' }}
                />
                <circle
                  cx={pos.x} cy={pos.y} r={HIT_R}
                  fill="transparent" style={{ cursor: 'pointer' }}
                  onClick={() => { onNoteClick(children[i]); navigate(secondBrainPath(children[i].id)); }}
                  onMouseEnter={() => { setHoveredZone('children'); showTooltip(children[i], pos.x, pos.y); }}
                  onMouseLeave={() => { setHoveredZone(null); hideTooltip(); }}
                />
              </g>
            );
          })}

          {/* Custom tooltip — instant, no browser delay */}
          {tooltip && (
            <g style={{ pointerEvents: 'none' }}>
              <rect
                x={tooltip.x + 8} y={tooltip.y - 14}
                width={tooltip.label.length * 5.5 + 12} height={18}
                rx={3}
                fill="rgba(0,0,0,0.85)"
              />
              <text
                x={tooltip.x + 14} y={tooltip.y - 2}
                fill="rgba(255,255,255,0.9)"
                fontSize={9}
                fontFamily="system-ui, sans-serif"
              >
                {tooltip.label}
              </text>
            </g>
          )}

        </svg>
      </div>

    </div>
  );
};
