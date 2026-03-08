// Builds force-graph data structures from BrainIndex
// Three edge types: body refs, interactions (trailing refs), address hierarchy

import { useMemo } from 'react';
import type { BrainIndex } from '../../lib/brainIndex';

export type EdgeType = 'body' | 'interaction' | 'hierarchy';

export interface GraphNode {
  id: string;
  name: string;
  address: string;
  centrality: number; // 0–1 PageRank
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

export function buildGraphData(
  index: BrainIndex,
  centralityMap: Record<string, number>,
): GraphData {
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
  const linkSet = new Set<string>(); // dedup

  const addLink = (src: string, tgt: string, type: EdgeType, annotation?: string | null) => {
    // For body/interaction, use sorted key to dedup bidirectional
    const key = type === 'hierarchy'
      ? `h:${src}>${tgt}`
      : `${type}:${[src, tgt].sort().join('-')}`;
    if (linkSet.has(key)) return;
    linkSet.add(key);
    links.push({ source: src, target: tgt, type, annotation });
  };

  // Body references (mentions — refs minus trailing refs)
  index.allFieldNotes.forEach(note => {
    const trailingIds = new Set((note.trailingRefs || []).map(r => r.uid));
    (note.references || []).forEach(refUid => {
      if (trailingIds.has(refUid)) return; // skip — will be an interaction edge
      if (refUid === note.id) return; // skip self
      if (index.noteById.has(refUid)) {
        addLink(note.id, refUid, 'body');
      }
    });
  });

  // Interactions (trailing refs)
  index.allFieldNotes.forEach(note => {
    (note.trailingRefs || []).forEach(ref => {
      if (ref.uid === note.id) return;
      if (index.noteById.has(ref.uid)) {
        addLink(note.id, ref.uid, 'interaction', ref.annotation);
      }
    });
  });

  // Address hierarchy (parent → child)
  index.allFieldNotes.forEach(note => {
    const neighborhood = index.neighborhoodMap.get(note.id);
    if (neighborhood?.parent) {
      addLink(neighborhood.parent.id, note.id, 'hierarchy');
    }
  });

  return { nodes, links };
}

export interface EdgeVisibility {
  body: boolean;
  interaction: boolean;
  hierarchy: boolean;
}

export function filterGraphData(
  full: GraphData,
  visibility: EdgeVisibility,
): { nodes: GraphNode[]; links: GraphLink[] } {
  const activeLinks = full.links.filter(l => visibility[l.type]);

  // Only show nodes that have at least one visible edge (or show all if no filter active)
  const allVisible = visibility.body && visibility.interaction && visibility.hierarchy;
  if (allVisible) return { nodes: full.nodes, links: activeLinks };

  const connectedIds = new Set<string>();
  activeLinks.forEach(l => {
    connectedIds.add(typeof l.source === 'string' ? l.source : (l.source as any).id);
    connectedIds.add(typeof l.target === 'string' ? l.target : (l.target as any).id);
  });

  // Always show all nodes — isolated ones just float freely
  return { nodes: full.nodes, links: activeLinks };
}

export const EDGE_COLORS: Record<EdgeType, string> = {
  body: '#60a5fa',      // blue-400
  interaction: '#f59e0b', // amber-500
  hierarchy: '#4ade80',   // green-400
};

export const EDGE_LABELS: Record<EdgeType, string> = {
  body: 'Body refs',
  interaction: 'Interactions',
  hierarchy: 'Address hierarchy',
};

export function useFilteredGraph(
  full: GraphData | null,
  visibility: EdgeVisibility,
) {
  return useMemo(() => {
    if (!full) return null;
    return filterGraphData(full, visibility);
  }, [full, visibility.body, visibility.interaction, visibility.hierarchy]);
}
