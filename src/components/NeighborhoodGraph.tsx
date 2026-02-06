// NeighborhoodGraph — interactive SVG visualization of a concept's structural neighborhood
// Shows: parent (left, blue), current node (center, white), siblings (center, purple), children (right, purple)
// Clicking a zone reveals its details below the graph.
// Sibling-to-sibling navigation animates: the white bar slides to where the sibling dot was.

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { noteLabel, type FieldNoteMeta } from '../types';
import type { Neighborhood } from '../lib/brainIndex';

export type Zone = 'parent' | 'siblings' | 'children' | null;

interface Props {
  neighborhood: Neighborhood;
  currentNote: FieldNoteMeta;
  onNoteClick: (note: FieldNoteMeta) => void;
  isVisited?: (noteId: string) => boolean;
  activeZone: Zone;
  onActiveZoneChange: (zone: Zone) => void;
  focusedDetailIdx: number;
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
const TRANSITION = '400ms ease';
const MAX_COL = 10;    // max nodes per center column before splitting
const COL_GAP = 14;    // horizontal gap between center sub-columns

// Colors
const COL_CURRENT = 'rgba(255,255,255,0.75)';
const COL_PARENT = 'rgba(96,165,250,0.8)';
const COL_SIBLING = 'rgba(139,92,246,0.6)';
const COL_CHILD = 'rgba(139,92,246,0.6)';
const COL_LINE_PARENT = 'rgba(96,165,250,0.15)';
const COL_LINE_CHILD = 'rgba(139,92,246,0.15)';
const COL_LINE_PARENT_HOVER = 'rgba(96,165,250,0.35)';
const COL_LINE_CHILD_HOVER = 'rgba(139,92,246,0.35)';

function distributeY(count: number, centerY: number, spacing: number): number[] {
  if (count === 0) return [];
  if (count === 1) return [centerY];
  const totalSpan = (count - 1) * spacing;
  const startY = centerY - totalSpan / 2;
  return Array.from({ length: count }, (_, i) => startY + i * spacing);
}

function bezierH(x1: number, y1: number, x2: number, y2: number): string {
  const midX = (x1 + x2) / 2;
  return `M${x1},${y1} C${midX},${y1} ${midX},${y2} ${x2},${y2}`;
}

const COL_VISITED = 'rgba(96,165,250,0.55)';  // dark blue for visited siblings/children

export const NeighborhoodGraph: React.FC<Props> = ({ neighborhood, currentNote, onNoteClick, isVisited, activeZone, onActiveZoneChange, focusedDetailIdx }) => {
  const [hoveredZone, setHoveredZone] = useState<Zone>(null);

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

  // Calculate SVG height — tallest center column is capped at MAX_COL
  const tallestCenter = Math.min(centerEntries.length, MAX_COL);
  const maxNodes = Math.max(tallestCenter, children.length, parent ? 1 : 0);
  const svgH = Math.max(H_MIN, maxNodes * H_PER_NODE + 28);
  const centerY = svgH / 2;

  // Diamond multi-column layout for center entries
  const centerPositions = useMemo(() => {
    const N = centerEntries.length;
    if (N <= MAX_COL) {
      const ys = distributeY(N, centerY, H_PER_NODE);
      return centerEntries.map((e, i) => ({ entry: e, x: CENTER_X, y: ys[i] }));
    }
    // Build diamond column counts: center=MAX_COL, sides taper by 2
    let cols: number[];
    if (N <= MAX_COL + 8) {
      cols = [N - MAX_COL, MAX_COL];
    } else if (N <= MAX_COL + 16) {
      const rem = N - MAX_COL;
      cols = [Math.ceil(rem / 2), MAX_COL, Math.floor(rem / 2)];
    } else {
      const rem = N - MAX_COL;
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
    const result: { entry: typeof centerEntries[0]; x: number; y: number }[] = [];
    for (let c = 0; c < cols.length; c++) {
      const count = cols[c];
      const ys = distributeY(count, centerY, H_PER_NODE);
      for (let j = 0; j < count && idx < N; j++) {
        result.push({ entry: centerEntries[idx], x: colXs[c], y: ys[j] });
        idx++;
      }
    }
    return result;
  }, [centerEntries, centerY]);

  const parentPos = parent ? { x: PARENT_X, y: centerY } : null;
  const childrenYs = useMemo(() => distributeY(children.length, centerY, H_PER_NODE), [children.length, centerY]);

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
    const fill = activeZone === 'parent' ? 'rgba(96,165,250,0.08)' : 'rgba(139,92,246,0.08)';
    return { ...cfg, fill, opacity: 1 };
  }, [activeZone, sibZoneW]);

  // Hover indicator — lighter shadow, only when hovering a zone different from active
  const hoverIndicator = useMemo(() => {
    if (!hoveredZone || hoveredZone === activeZone) return { ...defaultPos, fill: 'transparent', opacity: 0 };
    const cfg = zoneConfigs[hoveredZone];
    const fill = hoveredZone === 'parent' ? 'rgba(96,165,250,0.04)' : 'rgba(139,92,246,0.04)';
    return { ...cfg, fill, opacity: 1 };
  }, [hoveredZone, activeZone, sibZoneW]);

  const handleZoneClick = (zone: Zone) => {
    if (zone !== activeZone) onActiveZoneChange(zone);
  };

  const focusedDetailRef = useRef<HTMLAnchorElement>(null);
  useEffect(() => {
    focusedDetailRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [focusedDetailIdx]);

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
          viewBox={`0 0 ${W} ${svgH}`}
          className="w-full block"
          style={{ height: Math.min(svgH, 240) }}
        >
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
            {childrenYs.map((cy, i) => (
              <path
                key={`line-child-${children[i].id}`}
                d={bezierH(currentX + CURRENT_W / 2 + 1, currentY, CHILDREN_X - NODE_R - 1, cy)}
                fill="none"
                stroke={highlightZone === 'children' ? COL_LINE_CHILD_HOVER : COL_LINE_CHILD}
                strokeWidth={1}
                style={{ transition: `stroke 300ms ease, d ${TRANSITION}` }}
              />
            ))}
          </g>

          {/* Parent node */}
          {parentPos && (
            <circle
              cx={parentPos.x}
              cy={parentPos.y}
              r={5}
              fill={COL_PARENT}
              style={{ cursor: 'pointer' }}
              onClick={() => handleZoneClick('parent')}
              onMouseEnter={() => setHoveredZone('parent')}
              onMouseLeave={() => setHoveredZone(null)}
            />
          )}

          {/* Center: current + siblings as uniform rects with stable keys (diamond layout) */}
          {centerPositions.map((pos) => {
            const isCur = pos.entry.isCurrent;
            const w = isCur ? CURRENT_W : NODE_R * 2;
            const h = isCur ? CURRENT_H : NODE_R * 2;
            const rx = isCur ? 2 : NODE_R;
            return (
              <rect
                key={pos.entry.note.id}
                x={pos.x - w / 2}
                y={pos.y - h / 2}
                width={w}
                height={h}
                rx={rx}
                fill={isCur ? COL_CURRENT : (isVisited?.(pos.entry.note.id) ? COL_VISITED : COL_SIBLING)}
                style={{
                  transition: `x ${TRANSITION}, y ${TRANSITION}, width ${TRANSITION}, height ${TRANSITION}, rx ${TRANSITION}, fill ${TRANSITION}`,
                  cursor: isCur ? 'default' : 'pointer',
                }}
                onClick={() => !isCur && handleZoneClick('siblings')}
                onMouseEnter={() => !isCur && setHoveredZone('siblings')}
                onMouseLeave={() => setHoveredZone(null)}
              />
            );
          })}

          {/* Children nodes */}
          {childrenYs.map((cy, i) => (
            <circle
              key={`child-${children[i].id}`}
              cx={CHILDREN_X}
              cy={cy}
              r={NODE_R}
              fill={isVisited?.(children[i].id) ? COL_VISITED : COL_CHILD}
              style={{ cursor: 'pointer' }}
              onClick={() => handleZoneClick('children')}
              onMouseEnter={() => setHoveredZone('children')}
              onMouseLeave={() => setHoveredZone(null)}
            />
          ))}

          {/* Invisible click zones — sized to match dynamic center zone */}
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

        </svg>
      </div>

      {/* Detail section below graph — outer div handles collapse */}
      <div
        className="overflow-hidden transition-all duration-300 ease-in-out relative"
        style={{
          maxHeight: activeZone ? 'calc(100dvh - 20rem)' : '0px',
          opacity: activeZone ? 1 : 0,
        }}
      >
        {/* Zone title — pinned above scroll */}
        {activeZone === 'parent' && parent && (
          <div className="pt-4 pb-2">
            <div className="text-[9px] text-blue-400/60 uppercase tracking-wider">Parent</div>
          </div>
        )}
        {activeZone === 'siblings' && siblings.length > 0 && (
          <div className="pt-4 pb-2">
            <div className="text-[9px] text-violet-400/60 uppercase tracking-wider">Siblings ({siblings.length})</div>
          </div>
        )}
        {activeZone === 'children' && children.length > 0 && (
          <div className="pt-4 pb-2">
            <div className="text-[9px] text-violet-400/60 uppercase tracking-wider">Children ({children.length})</div>
          </div>
        )}

        {/* Scrollable items only */}
        <div className="overflow-y-auto no-scrollbar scroll-smooth pb-10" style={{ maxHeight: 'calc(100dvh - 22rem)' }}>
          {activeZone === 'parent' && parent && (
            <Link
              ref={focusedDetailIdx === 0 ? focusedDetailRef : undefined}
              to={`/lab/second-brain/${parent.id}`}
              onClick={() => onNoteClick(parent)}
              className={`card-link group p-2.5 hover:border-blue-400/30${focusedDetailIdx === 0 ? ' border-blue-400/40 bg-blue-400/5' : ''}`}
            >
              <div className={`text-xs font-medium transition-colors ${isVisited?.(parent.id) ? 'text-blue-400/70 group-hover:text-blue-400' : 'text-th-secondary group-hover:text-blue-400'}`}>
                {noteLabel(parent)}
              </div>
              {parent.address && (
                <div className="text-[10px] text-th-muted">{parent.address}</div>
              )}
            </Link>
          )}

          {activeZone === 'siblings' && siblings.length > 0 && (
            <div className="space-y-1.5">
              {siblings.map((sib, idx) => (
                <Link
                  key={sib.id}
                  ref={idx === focusedDetailIdx ? focusedDetailRef : undefined}
                  to={`/lab/second-brain/${sib.id}`}
                  onClick={() => onNoteClick(sib)}
                  className={`card-link group p-2.5 hover:border-violet-400/30${idx === focusedDetailIdx ? ' border-violet-400/40 bg-violet-400/5' : ''}`}
                >
                  <div className={`text-xs font-medium transition-colors ${isVisited?.(sib.id) ? 'text-blue-400/70 group-hover:text-blue-400' : 'text-th-secondary group-hover:text-violet-400'}`}>
                    {noteLabel(sib)}
                  </div>
                </Link>
              ))}
            </div>
          )}

          {activeZone === 'children' && children.length > 0 && (
            <div className="space-y-1.5">
              {children.map((child, idx) => (
                <Link
                  key={child.id}
                  ref={idx === focusedDetailIdx ? focusedDetailRef : undefined}
                  to={`/lab/second-brain/${child.id}`}
                  onClick={() => onNoteClick(child)}
                  className={`card-link group p-2.5 hover:border-violet-400/30${idx === focusedDetailIdx ? ' border-violet-400/40 bg-violet-400/5' : ''}`}
                >
                  <div className={`text-xs font-medium transition-colors ${isVisited?.(child.id) ? 'text-blue-400/70 group-hover:text-blue-400' : 'text-th-secondary group-hover:text-violet-400'}`}>
                    {noteLabel(child)}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Bottom fade overlay */}
        <div
          className="pointer-events-none absolute bottom-0 left-0 right-0 h-10"
          style={{ background: 'linear-gradient(to top, var(--bg-base), transparent)' }}
        />
      </div>
    </div>
  );
};
