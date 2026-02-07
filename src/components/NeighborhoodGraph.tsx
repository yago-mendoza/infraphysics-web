// NeighborhoodGraph — interactive SVG visualization of a concept's structural neighborhood
// Shows: parent (left, blue), current node (center, white), siblings (center, purple), children (right, purple)
// Clicking a zone reveals its details below the graph.
// Sibling-to-sibling navigation animates: the white bar slides to where the sibling dot was.

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { noteLabel, type FieldNoteMeta } from '../types';
import type { Neighborhood } from '../lib/brainIndex';

export type Zone = 'parent' | 'siblings' | 'children' | null;

// Centralized visited/unvisited color classes for note links
const noteTextCls = (visited: boolean) =>
  visited ? 'text-blue-400/70 group-hover:text-blue-400' : 'text-violet-400/70 group-hover:text-violet-400';
const noteBorderCls = (visited: boolean) =>
  visited ? 'hover:border-blue-400/30' : 'hover:border-violet-400/30';
const noteFocusCls = (visited: boolean) =>
  visited ? 'border-blue-400/40 bg-blue-400/5' : 'border-violet-400/40 bg-violet-400/5';

interface Props {
  neighborhood: Neighborhood;
  currentNote: FieldNoteMeta;
  onNoteClick: (note: FieldNoteMeta) => void;
  isVisited?: (noteId: string) => boolean;
  activeZone: Zone;
  onActiveZoneChange: (zone: Zone) => void;
  focusedDetailIdx: number;
  homonymParents?: { parent: FieldNoteMeta; homonym: FieldNoteMeta }[];
  homonymLeaf?: string;
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
const TRANSITION = '400ms ease';
const MAX_COL = 10;    // max nodes per center column before splitting
const COL_GAP = 14;    // horizontal gap between center sub-columns

// Colors
const COL_CURRENT = 'rgba(255,255,255,0.75)';
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

export const NeighborhoodGraph: React.FC<Props> = ({ neighborhood, currentNote, onNoteClick, isVisited, activeZone, onActiveZoneChange, focusedDetailIdx, homonymParents, homonymLeaf, onHomonymNavigate }) => {
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

  // Ghost parent diamond layout — compute before SVG height so it can influence sizing
  const ghostParents = homonymParents || [];
  const ghostColHeights = useMemo(() => ghostDiamondColumns(ghostParents.length), [ghostParents.length]);
  const maxGhostColHeight = ghostColHeights.length > 0 ? Math.max(...ghostColHeights) : 0;

  // Calculate SVG height — tallest center column is capped at MAX_COL
  const tallestCenter = Math.min(centerEntries.length, MAX_COL);
  const maxNodes = Math.max(tallestCenter, children.length, parent ? 1 : 0, maxGhostColHeight);
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

  const focusedDetailRef = useRef<HTMLAnchorElement>(null);
  useEffect(() => {
    focusedDetailRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [focusedDetailIdx]);

  // Only show fade overlay + bottom padding when scroll container actually overflows
  const scrollElRef = useRef<HTMLDivElement>(null);
  const [showFade, setShowFade] = useState(false);
  useEffect(() => {
    const el = scrollElRef.current;
    if (!el) { setShowFade(false); return; }
    requestAnimationFrame(() => {
      setShowFade(el.scrollHeight > el.clientHeight + 4);
    });
  }, [activeZone, parent?.id, siblings.length, children.length, ghostParents.length]);

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
              fill={isVisited?.(parent!.id) ? COL_PARENT_VISITED : COL_PARENT}
              style={{ cursor: 'pointer' }}
              onClick={() => handleZoneClick('parent')}
              onMouseEnter={() => setHoveredZone('parent')}
              onMouseLeave={() => setHoveredZone(null)}
            />
          )}

          {/* Ghost parent dots — homonym alternate parents, diamond layout, no connectors */}
          {ghostParentPositions.map((pos) => (
            <circle
              key={`ghost-${pos.entry.homonym.id}`}
              className="homonym-ghost-dot"
              cx={pos.x}
              cy={pos.y}
              r={5}
              fill={isVisited?.(pos.entry.parent.id) ? COL_GHOST_PARENT_VISITED : COL_GHOST_PARENT}
              onClick={() => onHomonymNavigate?.(pos.entry.homonym)}
            >
              <title>{noteLabel(pos.entry.parent)}</title>
            </circle>
          ))}

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
        className="overflow-hidden relative"
        style={{
          maxHeight: activeZone ? 'calc(100dvh - 20rem)' : '0px',
          opacity: activeZone ? 1 : 0,
          transition: 'max-height 300ms ease-in-out, opacity 300ms ease-in-out',
        }}
      >
        {/* Zone title — pinned above scroll */}
        {activeZone === 'parent' && parent && (
          <div className="pt-4 pb-2">
            <div className="text-[9px] text-violet-400/60 uppercase tracking-wider">
              {ghostParents.length > 0 ? `Parents (${1 + ghostParents.length})` : 'Parent'}
            </div>
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

        {/* Scrollable items */}
        <div ref={scrollElRef} className={`overflow-y-auto no-scrollbar scroll-smooth${showFade ? ' pb-4' : ''}`} style={{ maxHeight: 'calc(100dvh - 22rem)' }}>
          {activeZone === 'parent' && parent && (
            ghostParents.length > 0 ? (
              <div className="space-y-1.5">
                {/* Row 1: real parent + darkened empty chip (top right — you're on this path) */}
                <div className="flex gap-1.5">
                  <Link
                    ref={focusedDetailIdx === 0 ? focusedDetailRef : undefined}
                    to={`/lab/second-brain/${parent.id}`}
                    onClick={() => onNoteClick(parent)}
                    className={`card-link group p-2.5 ${noteBorderCls(!!isVisited?.(parent.id))} flex-1 min-w-0${focusedDetailIdx === 0 ? ` ${noteFocusCls(!!isVisited?.(parent.id))}` : ''}`}
                  >
                    <div className={`text-xs font-medium transition-colors ${noteTextCls(!!isVisited?.(parent.id))}`}>
                      {noteLabel(parent)}
                    </div>
                  </Link>
                  <div
                    className="flex-shrink-0 w-10 rounded-sm flex items-center justify-center"
                    style={{ border: '1px solid var(--border-default)' }}
                  >
                    <div className="rounded-sm" style={{ width: 4, height: 22, backgroundColor: 'rgba(255,255,255,0.75)' }} />
                  </div>
                </div>
                {/* Remaining rows: ghost parents + clickable chip with leaf name */}
                {ghostParents.map((gp, idx) => {
                  const focusIdx = idx + 1;
                  const pv = !!isVisited?.(gp.parent.id);
                  const hv = !!isVisited?.(gp.homonym.id);
                  return (
                    <div key={gp.homonym.id} className="flex gap-1.5">
                      <Link
                        ref={focusIdx === focusedDetailIdx ? focusedDetailRef : undefined}
                        to={`/lab/second-brain/${gp.parent.id}`}
                        onClick={() => onNoteClick(gp.parent)}
                        className={`card-link group p-2.5 ${noteBorderCls(pv)} flex-1 min-w-0${focusIdx === focusedDetailIdx ? ` ${noteFocusCls(pv)}` : ''}`}
                      >
                        <div className={`text-xs font-medium transition-colors ${noteTextCls(pv)}`}>
                          {noteLabel(gp.parent)}
                        </div>
                      </Link>
                      <button
                        className={`card-link group !flex flex-shrink-0 w-10 items-center justify-center text-[10px] font-mono cursor-pointer ${noteTextCls(hv)} ${noteBorderCls(hv)}`}
                        onClick={() => onHomonymNavigate?.(gp.homonym)}
                      >
                        {homonymLeaf}
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <Link
                ref={focusedDetailIdx === 0 ? focusedDetailRef : undefined}
                to={`/lab/second-brain/${parent.id}`}
                onClick={() => onNoteClick(parent)}
                className={`card-link group p-2.5 ${noteBorderCls(!!isVisited?.(parent.id))}${focusedDetailIdx === 0 ? ` ${noteFocusCls(!!isVisited?.(parent.id))}` : ''}`}
              >
                <div className={`text-xs font-medium transition-colors ${noteTextCls(!!isVisited?.(parent.id))}`}>
                  {noteLabel(parent)}
                </div>
                {parent.address && (
                  <div className="text-[10px] text-th-muted">{parent.address.replace(/\/\//g, ' / ')}</div>
                )}
              </Link>
            )
          )}

          {activeZone === 'siblings' && siblings.length > 0 && (
            <div className="space-y-1.5">
              {siblings.map((sib, idx) => {
                const v = !!isVisited?.(sib.id);
                return (
                  <Link
                    key={sib.id}
                    ref={idx === focusedDetailIdx ? focusedDetailRef : undefined}
                    to={`/lab/second-brain/${sib.id}`}
                    onClick={() => onNoteClick(sib)}
                    className={`card-link group p-2.5 ${noteBorderCls(v)}${idx === focusedDetailIdx ? ` ${noteFocusCls(v)}` : ''}`}
                  >
                    <div className={`text-xs font-medium transition-colors ${noteTextCls(v)}`}>
                      {noteLabel(sib)}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {activeZone === 'children' && children.length > 0 && (
            <div className="space-y-1.5">
              {children.map((child, idx) => {
                const v = !!isVisited?.(child.id);
                return (
                  <Link
                    key={child.id}
                    ref={idx === focusedDetailIdx ? focusedDetailRef : undefined}
                    to={`/lab/second-brain/${child.id}`}
                    onClick={() => onNoteClick(child)}
                    className={`card-link group p-2.5 ${noteBorderCls(v)}${idx === focusedDetailIdx ? ` ${noteFocusCls(v)}` : ''}`}
                  >
                    <div className={`text-xs font-medium transition-colors ${noteTextCls(v)}`}>
                      {noteLabel(child)}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Bottom fade overlay — only when scroll container overflows */}
        {showFade && (
          <div
            className="pointer-events-none absolute bottom-0 left-0 right-0 h-4"
            style={{ background: 'linear-gradient(to top, var(--bg-base), transparent)' }}
          />
        )}
      </div>
    </div>
  );
};
