// CopyExportModal — scope-selector modal for exporting fieldnote context to clipboard.
// Portal modal (follows DeleteConfirmModal pattern). Violet accent.
// Zones: self, parent, siblings, children + uncles, nephews, descendants + links, interactions, backlinks.

import React, { useState, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { type FieldNoteMeta } from '../types';
import type { Connection, Neighborhood } from '../lib/brainIndex';
import { exportNotesAsMarkdown, estimateWords } from '../lib/exportNotes';
import { ClipboardIcon, CheckIcon, CloseIcon } from './icons';

type ZoneKey =
  | 'self' | 'parent' | 'siblings' | 'children'
  | 'uncles' | 'nephews' | 'descendants'
  | 'links' | 'trailing' | 'backlinks';

type CopyState = 'idle' | 'copying' | 'copied';

/** Rough token estimate: ~4 chars per token for English text */
function estimateTokens(text: string): number {
  return Math.round(text.length / 4);
}

function fmtNum(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

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
const DOT_R = 4;
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
    <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="mx-auto block h-auto w-full max-w-[34rem]" role="img" aria-label="Choose the note relationships to include">
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
            stroke={active ? 'rgba(139,92,246,0.35)' : 'var(--bg-surface-alt)'}
            strokeWidth={1}
            strokeDasharray={dashed ? '4 3' : undefined}
          />
        );
      })}

      {/* Self node — always active, larger */}
      <circle cx={CX} cy={CY} r={8} fill="rgba(139,92,246,0.9)" />
      <text x={CX} y={CY + 24} textAnchor="middle" fill="rgba(139,92,246,0.8)" fontSize={11} fontFamily="monospace">
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
        const fill = active ? fillActive : 'var(--bg-surface-alt)';
        const textFill = active
          ? (isExt ? 'rgba(139,92,246,0.7)' : 'rgba(139,92,246,0.9)')
          : 'var(--text-tertiary)';
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
                fill={textFill} fontSize={9.5} fontFamily="monospace"
              >
                +{overflow}
              </text>
            )}
            <text
              x={pos.x}
              y={labelY}
              textAnchor="middle"
              fill={textFill}
              fontSize={isExt ? 9.5 : 10.5}
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
  const [copyStats, setCopyStats] = useState<{ chars: number; tokens: number } | null>(null);

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
  const pctLabel = selectedNotes.length > 0 && pct === 0 ? '<1%' : `${pct}%`;
  const pctWidth = totalNotes > 0 ? Math.min((selectedNotes.length / totalNotes) * 100, 100) : 0;

  const handleCopy = useCallback(async () => {
    setCopyState('copying');
    try {
      const result = await exportNotesAsMarkdown(selectedNotes, connectionsMap, {
        fullMode,
        header: `Context from: ${note.address || note.title}`,
      });
      await navigator.clipboard.writeText(result.markdown);
      setCopyStats({ chars: result.markdown.length, tokens: estimateTokens(result.markdown) });
      setCopyState('copied');
      setTimeout(() => { setCopyState('idle'); setCopyStats(null); }, 3000);
    } catch {
      setCopyState('idle');
    }
  }, [selectedNotes, connectionsMap, fullMode, note]);

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{ backgroundColor: 'var(--overlay-bg)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-2xl max-h-[calc(100dvh-2rem)] mx-4 border overflow-y-auto"
        style={{
          backgroundColor: 'var(--hub-sidebar-bg)',
          borderColor: 'rgba(139,92,246,0.3)',
        }}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b flex items-start justify-between gap-5" style={{ borderColor: 'rgba(139,92,246,0.2)', backgroundColor: 'rgba(139,92,246,0.05)' }}>
          <div className="min-w-0">
            <div className="text-[15px] font-semibold text-violet-400">Copy for context</div>
            <div className="text-[12px] leading-relaxed text-th-secondary mt-1 break-words">
              {note.address || note.title}
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-th-tertiary hover:text-th-heading transition-colors" aria-label="Close copy dialog"><CloseIcon /></button>
        </div>

        {/* SVG scope graph */}
        <div className="px-4 py-5 sm:px-6">
          <ScopeGraph zones={zones} activeZones={activeZones} onToggle={toggleZone} />
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t grid grid-cols-1 sm:grid-cols-[auto_1fr_auto] items-center gap-4" style={{ borderColor: 'var(--bg-surface-alt)' }}>
          {/* Mode toggle */}
          <div className="flex w-fit items-center gap-1 rounded-sm bg-th-surface-alt p-0.5 text-[11px]">
            <button
              onClick={() => setFullMode(false)}
              aria-pressed={!fullMode}
              className={`px-2 py-1 rounded-sm transition-colors ${!fullMode ? 'text-violet-400 bg-violet-400/10' : 'text-th-tertiary hover:text-th-secondary'}`}
            >
              metadata
            </button>
            <button
              onClick={() => setFullMode(true)}
              aria-pressed={fullMode}
              className={`px-2 py-1 rounded-sm transition-colors ${fullMode ? 'text-violet-400 bg-violet-400/10' : 'text-th-tertiary hover:text-th-secondary'}`}
            >
              full
            </button>
          </div>

          {/* Stats + progress */}
          <div className="flex min-w-0 flex-wrap items-center gap-2 sm:justify-center">
            <span className="text-[10px] text-th-secondary tabular-nums">
              {selectedNotes.length} {selectedNotes.length === 1 ? 'note' : 'notes'} · ~{wordEst > 1000 ? `${(wordEst / 1000).toFixed(1)}k` : wordEst} words
            </span>
            <span className="text-[10px] text-th-muted tabular-nums">{pctLabel} of wiki</span>
            <span className="inline-block w-16 h-1 rounded-full" style={{ backgroundColor: 'var(--bg-surface-alt)' }}>
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
            className="sm:ml-auto flex w-fit items-center gap-1.5 text-[11px] px-3.5 py-2 border border-violet-400/50 text-violet-400 hover:bg-violet-400/10 transition-colors disabled:opacity-50"
          >
            {copyState === 'copied' && copyStats ? (
              <><CheckIcon size={12} /> {fmtNum(copyStats.chars)} chars · ~{fmtNum(copyStats.tokens)} tokens</>
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
