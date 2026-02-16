import { useState, useEffect, useCallback, useMemo } from 'react';

interface RelevanceEntry {
  uid: string;
  score: number;
}

export interface DriftEntry {
  uid: string;
  score: number;
  sharedCount: number;
  via: string[];
}

export type BridgeTier = 'bridge' | 'connector' | 'peripheral';

export interface IslandComponent {
  id: number;
  size: number;
  members: string[];
  cutCount: number;
}

export interface CutSide {
  size: number;
  members: string[];
}

export interface IslandCut {
  uid: string;
  componentId: number;
  criticality: number;
  sides: CutSide[];
}

export interface NoteTopology {
  isOrphan: boolean;
  componentId: number | null;
  componentSize: number;
  isBridge: boolean;
  bridgeCriticality?: number;
}

export interface IslandsData {
  components: IslandComponent[];
  cuts: IslandCut[];
  nodeToComponent: Record<string, number>;
  orphanUids: string[];
}

interface GraphRelevanceData {
  centrality: Record<string, number>;
  relevance: Record<string, RelevanceEntry[]>;
  driftSuggestions: Record<string, DriftEntry[]>;
  islands?: IslandsData;
}

let cached: GraphRelevanceData | null = null;
let loading = false;
let listeners: (() => void)[] = [];

function notifyListeners() {
  listeners.forEach(fn => fn());
}

async function loadData() {
  if (cached || loading) return;
  loading = true;
  try {
    const mod = await import('../data/graph-relevance.generated.json');
    cached = mod.default as GraphRelevanceData;
  } catch {
    cached = { centrality: {}, relevance: {}, driftSuggestions: {} };
  }
  loading = false;
  notifyListeners();
}

export function useGraphRelevance() {
  const [, setTick] = useState(0);

  useEffect(() => {
    const listener = () => setTick(t => t + 1);
    listeners.push(listener);
    loadData();
    return () => { listeners = listeners.filter(l => l !== listener); };
  }, []);

  // Compute bridge tier thresholds + sorted values for percentile lookup
  const { thresholds, sortedVals } = useMemo(() => {
    if (!cached) return { thresholds: { bridge: 1, connector: 1 }, sortedVals: [] as number[] };
    const vals = Object.values(cached.centrality).sort((a, b) => a - b);
    if (vals.length === 0) return { thresholds: { bridge: 1, connector: 1 }, sortedVals: [] };
    const p85 = vals[Math.floor(vals.length * 0.85)];
    const p50 = vals[Math.floor(vals.length * 0.50)];
    return { thresholds: { bridge: p85, connector: p50 }, sortedVals: vals };
  }, [cached ? Object.keys(cached.centrality).length : 0]);

  const getRelevance = useCallback((uid: string): RelevanceEntry[] => {
    return cached?.relevance[uid] || [];
  }, []);

  const getCentrality = useCallback((uid: string): number => {
    return cached?.centrality[uid] ?? 0;
  }, []);

  const getDrift = useCallback((uid: string): DriftEntry[] => {
    return cached?.driftSuggestions?.[uid] || [];
  }, []);

  const getBridgeTier = useCallback((uid: string): BridgeTier => {
    const c = cached?.centrality[uid] ?? 0;
    if (c >= thresholds.bridge) return 'bridge';
    if (c >= thresholds.connector) return 'connector';
    return 'peripheral';
  }, [thresholds]);

  /** Returns percentile rank (0–100, higher = more central). "top X%" = 100 - percentile. */
  const getPercentile = useCallback((uid: string): number => {
    if (sortedVals.length === 0) return 0;
    const c = cached?.centrality[uid] ?? 0;
    // Binary search for position in sorted values
    let lo = 0, hi = sortedVals.length;
    while (lo < hi) {
      const mid = (lo + hi) >>> 1;
      if (sortedVals[mid] < c) lo = mid + 1;
      else hi = mid;
    }
    return Math.round((lo / sortedVals.length) * 100);
  }, [sortedVals]);

  const getIslands = useCallback((): IslandsData | null => {
    return cached?.islands ?? null;
  }, []);

  const getNoteTopology = useCallback((uid: string): NoteTopology => {
    const islands = cached?.islands;
    if (!islands) return { isOrphan: false, componentId: null, componentSize: 0, isBridge: false };

    const isOrphan = islands.orphanUids.includes(uid);
    const componentId = islands.nodeToComponent[uid] ?? null;
    const comp = componentId != null ? islands.components.find(c => c.id === componentId) : null;
    const cut = islands.cuts.find(c => c.uid === uid);

    return {
      isOrphan,
      componentId,
      componentSize: comp?.size ?? 0,
      isBridge: !!cut,
      ...(cut ? { bridgeCriticality: cut.criticality } : {}),
    };
  }, []);

  return { getRelevance, getCentrality, getDrift, getBridgeTier, getPercentile, getIslands, getNoteTopology, loaded: !!cached };
}
