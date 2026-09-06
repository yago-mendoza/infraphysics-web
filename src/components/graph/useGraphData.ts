// Builds the immutable topology consumed by both graph viewports.

import type { BrainIndex } from '../../lib/brainIndex';

export type EdgeType = 'body' | 'interaction' | 'hierarchy';

export interface GraphNode {
  id: string;
  name: string;
  address: string;
  centrality: number;
  refCount: number;
  depth: number;
  isParent: boolean;
}

export interface GraphLink {
  source: string;
  target: string;
  type: EdgeType;
  annotation?: string | null;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

export interface EdgeVisibility {
  body: boolean;
  interaction: boolean;
  hierarchy: boolean;
}

export function buildGraphData(index: BrainIndex, centralityMap: Record<string, number>): GraphData {
  const nodes: GraphNode[] = index.allFieldNotes.map(note => ({
    id: note.id,
    name: note.name,
    address: note.address || note.title,
    centrality: centralityMap[note.id] ?? 0,
    refCount: (note.references?.length || 0) + (index.backlinksMap.get(note.id)?.length || 0),
    depth: (note.addressParts || [note.title]).length,
    isParent: index.parentIds.has(note.id),
  }));

  const links: GraphLink[] = [];
  const seen = new Set<string>();
  const addLink = (source: string, target: string, type: EdgeType, annotation?: string | null) => {
    // The force layout is undirected: collapse reciprocal content links so they
    // do not add duplicate springs or duplicate draw work. Hierarchy remains
    // directional because parent -> child is part of its meaning.
    const endpoints = type === 'hierarchy' ? `${source}\u0000${target}` : [source, target].sort().join('\u0000');
    const key = `${type}:${endpoints}`;
    if (seen.has(key)) return;
    seen.add(key);
    links.push({ source, target, type, annotation });
  };

  index.allFieldNotes.forEach(note => {
    const interactionIds = new Set((note.trailingRefs || []).map(reference => reference.uid));
    (note.references || []).forEach(target => {
      if (target !== note.id && !interactionIds.has(target) && index.noteById.has(target)) addLink(note.id, target, 'body');
    });
    (note.trailingRefs || []).forEach(reference => {
      if (reference.uid !== note.id && index.noteById.has(reference.uid)) addLink(note.id, reference.uid, 'interaction', reference.annotation);
    });
    const parent = index.neighborhoodMap.get(note.id)?.parent;
    if (parent) addLink(parent.id, note.id, 'hierarchy');
  });

  return { nodes, links };
}

// Stable categorical colors. The busiest roots receive the most distinct
// slots; small overflow roots share a neutral color rather than unstable hues.
export const ROOT_PALETTE = ['#3987e5', '#d95926', '#199e70', '#c98500', '#d55181', '#008300', '#9085e9', '#e66767'];
export const ROOT_NEUTRAL = '#6b7280';

export function hexToRgb(hex: string): number[] {
  const value = Number.parseInt(hex.slice(1), 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

export function assignRootColors(addresses: Iterable<string>): Map<string, string> {
  const counts = new Map<string, number>();
  for (const address of addresses) {
    const root = address.split('//')[0];
    if (root) counts.set(root, (counts.get(root) || 0) + 1);
  }
  const ranked = [...counts].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  return new Map(ranked.map(([root], index) => [root, ROOT_PALETTE[index] ?? ROOT_NEUTRAL]));
}

export const EDGE_COLORS: Record<EdgeType, string> = {
  body: '#60a5fa',
  interaction: '#f59e0b',
  hierarchy: '#4ade80',
};
