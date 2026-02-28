// CopyExportModal — scope-selector modal for exporting fieldnote context to clipboard.
// Portal modal (follows DeleteConfirmModal pattern). Violet accent.
// Zones: self, parent, siblings, children + uncles, nephews, descendants + links, interactions, backlinks.

import React, { useState, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { type FieldNoteMeta } from '../types';
import type { Connection, Neighborhood } from '../lib/brainIndex';
import { exportNotesAsMarkdown, estimateWords } from '../lib/exportNotes';
import { ClipboardIcon, CheckIcon } from './icons';

type ZoneKey =
  | 'self' | 'parent' | 'siblings' | 'children'
  | 'uncles' | 'nephews' | 'descendants'
  | 'links' | 'trailing' | 'backlinks';

type CopyState = 'idle' | 'copying' | 'copied';

interface Props {
  note: FieldNoteMeta;
  neighborhood: Neighborhood;
  connections: Connection[];
  backlinks: FieldNoteMeta[];
  connectionsMap: Map<string, Connection[]>;
  neighborhoodMap: Map<string, Neighborhood>;
  noteById: Map<string, FieldNoteMeta>;
  totalNotes: number;
  onClose: () => void;
}

// --- Zone metadata ---
interface ZoneInfo {
  key: ZoneKey;
  label: string;
  notes: FieldNoteMeta[];
  toggleable: boolean;
  /** Which zone this extends from (for drawing lines) */
  connectsTo: ZoneKey;
}

/** Recursively collect all descendants via neighborhoodMap */
function collectDescendants(
  roots: FieldNoteMeta[],
  neighborhoodMap: Map<string, Neighborhood>,
  exclude: Set<string>,
): FieldNoteMeta[] {
  const result: FieldNoteMeta[] = [];
  const seen = new Set<string>(exclude);
  const queue = [...roots];
  while (queue.length > 0) {
    const node = queue.shift()!;
    if (seen.has(node.id)) continue;
    seen.add(node.id);
    const nh = neighborhoodMap.get(node.id);
    if (nh) {
      for (const child of nh.children) {
        if (!seen.has(child.id)) {
          result.push(child);
          queue.push(child);
        }
      }
    }
  }
  return result;
}

function buildZones(
  note: FieldNoteMeta,
  neighborhood: Neighborhood,
  connections: Connection[],
  backlinks: FieldNoteMeta[],
  neighborhoodMap: Map<string, Neighborhood>,
  noteById: Map<string, FieldNoteMeta>,
): ZoneInfo[] {
  const selfId = note.id;

  // Uncles = parent's siblings
  const uncles: FieldNoteMeta[] = [];
  if (neighborhood.parent) {
    const parentNh = neighborhoodMap.get(neighborhood.parent.id);
    if (parentNh) {
      for (const s of parentNh.siblings) {
        if (s.id !== selfId) uncles.push(s);
      }
    }
  }

  // Nephews = siblings' children
  const nephews: FieldNoteMeta[] = [];
  const nephewSeen = new Set<string>();
  for (const sib of neighborhood.siblings) {
    const sibNh = neighborhoodMap.get(sib.id);
    if (sibNh) {
      for (const c of sibNh.children) {
        if (c.id !== selfId && !nephewSeen.has(c.id)) {
          nephewSeen.add(c.id);
          nephews.push(c);
        }
      }
    }
  }

  // Descendants = recursive children (all levels), excluding direct children (shown separately)
  const directChildIds = new Set(neighborhood.children.map(c => c.id));
  directChildIds.add(selfId);
  const descendants = collectDescendants(neighborhood.children, neighborhoodMap, directChildIds);

  // Links = outgoing body references, excluding trailing ref targets and self
  const trailingIds = new Set(connections.map(c => c.note.id));
  const links: FieldNoteMeta[] = [];
  const linkSeen = new Set<string>();
  for (const refUid of (note.references || [])) {
    if (refUid === selfId || trailingIds.has(refUid) || linkSeen.has(refUid)) continue;
    const target = noteById.get(refUid);
    if (target) {
      linkSeen.add(refUid);
      links.push(target);
    }
  }

  return [
    { key: 'self',        label: 'self',         notes: [note],                                       toggleable: false, connectsTo: 'self' },
    { key: 'parent',      label: 'parent',       notes: neighborhood.parent ? [neighborhood.parent] : [], toggleable: true, connectsTo: 'self' },
    { key: 'siblings',    label: 'siblings',     notes: neighborhood.siblings,                        toggleable: true, connectsTo: 'self' },
    { key: 'children',    label: 'children',     notes: neighborhood.children,                        toggleable: true, connectsTo: 'self' },
    { key: 'uncles',      label: 'uncles',       notes: uncles,                                       toggleable: true, connectsTo: 'parent' },
    { key: 'nephews',     label: 'nephews',      notes: nephews,                                      toggleable: true, connectsTo: 'siblings' },
    { key: 'descendants', label: 'descendants',  notes: descendants,                                  toggleable: true, connectsTo: 'children' },
    { key: 'links',       label: 'links',        notes: links,                                        toggleable: true, connectsTo: 'self' },
    { key: 'trailing',    label: 'interactions',  notes: connections.map(c => c.note),                  toggleable: true, connectsTo: 'self' },
    { key: 'backlinks',   label: 'backlinks',     notes: backlinks,                                    toggleable: true, connectsTo: 'self' },
  ];
}

// --- SVG Scope Graph ---
const SVG_W = 480;
const SVG_H = 300;
const CX = 195;
const CY = SVG_H / 2;
const DOT_R = 3.5;
const MAX_DOTS = 6;

// Layout:
//
//  uncles          parent                     links
//                    |                          |
//  siblings ────── SELF ──────── interactions
//                    |                          |
//  nephews        children                  backlinks
//                    |
//                descendants

const ZONE_POSITIONS: Record<ZoneKey, { x: number; y: number }> = {
  self:        { x: CX,         y: CY },
  parent:      { x: CX,         y: 46 },
  siblings:    { x: 55,         y: CY },
  children:    { x: CX,         y: SVG_H - 72 },
  uncles:      { x: 55,         y: 46 },
  nephews:     { x: 55,         y: SVG_H - 72 },
  descendants: { x: CX,         y: SVG_H - 22 },
  links:       { x: SVG_W - 80, y: CY - 70 },
  trailing:    { x: SVG_W - 80, y: CY },
  backlinks:   { x: SVG_W - 80, y: CY + 70 },
};

const EXTENDED_KEYS: Set<ZoneKey> = new Set(['uncles', 'nephews', 'descendants']);
/** Graph-based zones (not directory hierarchy) — drawn with dashed lines */
const GRAPH_KEYS: Set<ZoneKey> = new Set(['links', 'trailing', 'backlinks']);

const ScopeGraph: React.FC<{
  zones: ZoneInfo[];
  activeZones: Set<ZoneKey>;
  onToggle: (key: ZoneKey) => void;
}> = ({ zones, activeZones, onToggle }) => {
  return (
    <svg width={SVG_W} height={SVG_H} className="mx-auto block">
      {/* Lines from each zone to its connectsTo target */}
      {zones.filter(z => z.key !== 'self' && z.notes.length > 0).map(z => {
        const from = ZONE_POSITIONS[z.connectsTo];
        const to = ZONE_POSITIONS[z.key];
        const active = activeZones.has(z.key);
        const dashed = GRAPH_KEYS.has(z.key);
        return (
          <line
            key={`line-${z.key}`}
            x1={from.x} y1={from.y} x2={to.x} y2={to.y}
            stroke={active ? 'rgba(139,92,246,0.35)' : 'rgba(255,255,255,0.08)'}
            strokeWidth={1}
            strokeDasharray={dashed ? '4 3' : undefined}
          />
        );
      })}

      {/* Self node — always active, larger */}
      <circle cx={CX} cy={CY} r={8} fill="rgba(139,92,246,0.9)" />
      <text x={CX} y={CY + 22} textAnchor="middle" fill="rgba(139,92,246,0.8)" fontSize={9} fontFamily="monospace">
        self
      </text>

      {/* Zone clusters */}
      {zones.filter(z => z.key !== 'self').map(z => {
        const pos = ZONE_POSITIONS[z.key];
        const count = z.notes.length;
        if (count === 0) return null;
        const active = activeZones.has(z.key);
        const isExt = EXTENDED_KEYS.has(z.key);
        const fillActive = isExt ? 'rgba(139,92,246,0.5)' : 'rgba(139,92,246,0.7)';
        const fill = active ? fillActive : 'rgba(255,255,255,0.15)';
        const textFill = active
          ? (isExt ? 'rgba(139,92,246,0.7)' : 'rgba(139,92,246,0.9)')
          : 'rgba(255,255,255,0.3)';
        const dotCount = Math.min(count, MAX_DOTS);
        const overflow = count > MAX_DOTS ? count - MAX_DOTS : 0;

        // Arrange dots in a small cluster
        const dots: { dx: number; dy: number }[] = [];
        if (dotCount <= 3) {
          for (let i = 0; i < dotCount; i++) dots.push({ dx: (i - (dotCount - 1) / 2) * 10, dy: 0 });
        } else {
          const topRow = Math.ceil(dotCount / 2);
          const botRow = dotCount - topRow;
          for (let i = 0; i < topRow; i++) dots.push({ dx: (i - (topRow - 1) / 2) * 10, dy: -5 });
          for (let i = 0; i < botRow; i++) dots.push({ dx: (i - (botRow - 1) / 2) * 10, dy: 5 });
        }

        // Label position
        const isTop = z.key === 'parent' || z.key === 'uncles';
        const labelY = isTop ? pos.y - 12 : pos.y + (dotCount > 3 ? 18 : 14);

        return (
          <g
            key={z.key}
            className="cursor-pointer"
            onClick={() => z.toggleable && onToggle(z.key)}
          >
            {/* Invisible hit area */}
            <rect
              x={pos.x - 44} y={pos.y - 18} width={88} height={36}
              fill="transparent"
            />
            {dots.map((d, i) => (
              <circle
                key={i}
                cx={pos.x + d.dx} cy={pos.y + d.dy}
                r={isExt ? DOT_R - 0.5 : DOT_R}
                fill={fill}
              />
            ))}
            {overflow > 0 && (
              <text
                x={pos.x + (dots[dots.length - 1]?.dx || 0) + 12}
                y={pos.y + 3}
                fill={textFill} fontSize={8} fontFamily="monospace"
              >
                +{overflow}
              </text>
            )}
            <text
              x={pos.x}
              y={labelY}
              textAnchor="middle"
              fill={textFill}
              fontSize={isExt ? 8 : 9}
              fontFamily="monospace"
            >
              {z.label} ({count})
            </text>
          </g>
        );
      })}
    </svg>
  );
};

// --- Modal ---
export const CopyExportModal: React.FC<Props> = ({
  note, neighborhood, connections, backlinks, connectionsMap, neighborhoodMap, noteById, totalNotes, onClose,
}) => {
  const [activeZones, setActiveZones] = useState<Set<ZoneKey>>(() => new Set(['self']));
  const [fullMode, setFullMode] = useState(true);
  const [copyState, setCopyState] = useState<CopyState>('idle');

  const zones = useMemo(
    () => buildZones(note, neighborhood, connections, backlinks, neighborhoodMap, noteById),
    [note, neighborhood, connections, backlinks, neighborhoodMap, noteById],
  );

  const toggleZone = useCallback((key: ZoneKey) => {
    setActiveZones(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  // Deduplicated selected notes
  const selectedNotes = useMemo(() => {
    const seen = new Set<string>();
    const result: FieldNoteMeta[] = [];
    for (const z of zones) {
      if (!activeZones.has(z.key)) continue;
      for (const n of z.notes) {
        if (!seen.has(n.id)) {
          seen.add(n.id);
          result.push(n);
        }
      }
    }
    return result;
  }, [zones, activeZones]);

  const wordEst = useMemo(() => estimateWords(selectedNotes), [selectedNotes]);
  const pct = totalNotes > 0 ? Math.round((selectedNotes.length / totalNotes) * 100) : 0;
  const pctWidth = totalNotes > 0 ? Math.min((selectedNotes.length / totalNotes) * 100, 100) : 0;

  const handleCopy = useCallback(async () => {
    setCopyState('copying');
    try {
      const result = await exportNotesAsMarkdown(selectedNotes, connectionsMap, {
        fullMode,
        header: `Context from: ${note.address || note.title}`,
      });
      await navigator.clipboard.writeText(result.markdown);
      setCopyState('copied');
      setTimeout(() => setCopyState('idle'), 2000);
    } catch {
      setCopyState('idle');
    }
  }, [selectedNotes, connectionsMap, fullMode, note]);

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-xl mx-4 border overflow-hidden"
        style={{
          backgroundColor: '#1a1a1a',
          borderColor: 'rgba(139,92,246,0.3)',
        }}
      >
        {/* Header */}
        <div className="px-5 py-3 border-b" style={{ borderColor: 'rgba(139,92,246,0.2)', backgroundColor: 'rgba(139,92,246,0.05)' }}>
          <div className="text-[13px] font-semibold text-violet-400">Copy for context</div>
          <div className="text-[11px] text-th-secondary mt-0.5">
            {note.address || note.title}
          </div>
        </div>

        {/* SVG scope graph */}
        <div className="px-5 py-5">
          <ScopeGraph zones={zones} activeZones={activeZones} onToggle={toggleZone} />
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t flex items-center gap-3" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          {/* Mode toggle */}
          <div className="flex items-center gap-2 text-[10px]">
            <button
              onClick={() => setFullMode(false)}
              className={`px-1.5 py-0.5 rounded-sm transition-colors ${!fullMode ? 'text-violet-400 bg-violet-400/10' : 'text-th-tertiary hover:text-th-secondary'}`}
            >
              metadata
            </button>
            <button
              onClick={() => setFullMode(true)}
              className={`px-1.5 py-0.5 rounded-sm transition-colors ${fullMode ? 'text-violet-400 bg-violet-400/10' : 'text-th-tertiary hover:text-th-secondary'}`}
            >
              full
            </button>
          </div>

          {/* Stats + progress */}
          <div className="flex items-center gap-2">
            <span className="text-[9px] text-th-muted tabular-nums">
              {selectedNotes.length} notes ~{wordEst > 1000 ? `${(wordEst / 1000).toFixed(1)}k` : wordEst} w
            </span>
            <span className="text-[9px] text-th-muted tabular-nums">{pct}%</span>
            <span className="inline-block w-12 h-1 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}>
              <span
                className="block h-full rounded-full transition-all"
                style={{ width: `${pctWidth}%`, backgroundColor: 'rgba(139,92,246,0.6)' }}
              />
            </span>
          </div>

          {/* Copy button */}
          <button
            onClick={handleCopy}
            disabled={copyState === 'copying' || selectedNotes.length === 0}
            className="ml-auto flex items-center gap-1.5 text-[10px] px-3 py-1 border border-violet-400/50 text-violet-400 hover:bg-violet-400/10 transition-colors disabled:opacity-50"
          >
            {copyState === 'copied' ? (
              <><CheckIcon size={12} /> Copied</>
            ) : copyState === 'copying' ? (
              <>...</>
            ) : (
              <><ClipboardIcon size={12} /> Copy</>
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
