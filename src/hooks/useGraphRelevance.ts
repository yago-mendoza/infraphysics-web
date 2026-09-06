import { useCallback, useMemo, useSyncExternalStore } from 'react';

interface RelevanceEntry {
  uid: string;
  score: number;
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

export interface IslandsData {
  components: IslandComponent[];
  cuts: IslandCut[];
  nodeToComponent: Record<string, number>;
  isolatedUids: string[];
}

interface GraphRelevanceData {
  centrality: Record<string, number>;
  relevance: Record<string, RelevanceEntry[]>;
  islands?: IslandsData;
}

let cached: GraphRelevanceData | null = null;
let loadingPromise: Promise<void> | null = null;
const listeners = new Set<() => void>();

function notifyListeners() {
  listeners.forEach(fn => fn());
}

function loadData(): Promise<void> {
  if (cached) return Promise.resolve();
  if (loadingPromise) return loadingPromise;
  loadingPromise = import('../data/graph-relevance.generated.json')
    .then(mod => { cached = mod.default as GraphRelevanceData; })
    .catch(() => { cached = { centrality: {}, relevance: {} }; })
    .finally(() => {
      loadingPromise = null;
      notifyListeners();
    });
  return loadingPromise;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  void loadData();
  return () => { listeners.delete(listener); };
}

const getSnapshot = () => cached;

export function useGraphRelevance() {
  const data = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  // Compute bridge tier thresholds + sorted values for percentile lookup
  const { thresholds, sortedVals } = useMemo(() => {
    if (!data) return { thresholds: { bridge: 1, connector: 1 }, sortedVals: [] as number[] };
    const vals = (Object.values(data.centrality) as number[]).sort((a, b) => a - b);
    if (vals.length === 0) return { thresholds: { bridge: 1, connector: 1 }, sortedVals: [] };
    const p85 = vals[Math.floor(vals.length * 0.85)];
    const p50 = vals[Math.floor(vals.length * 0.50)];
    return { thresholds: { bridge: p85, connector: p50 }, sortedVals: vals };
  }, [data]);

  const getRelevance = useCallback((uid: string): RelevanceEntry[] => {
    return data?.relevance[uid] || [];
  }, [data]);

  const getCentrality = useCallback((uid: string): number => {
    return data?.centrality[uid] ?? 0;
  }, [data]);

  const getBridgeTier = useCallback((uid: string): BridgeTier => {
    const c = data?.centrality[uid] ?? 0;
    if (c >= thresholds.bridge) return 'bridge';
    if (c >= thresholds.connector) return 'connector';
    return 'peripheral';
  }, [data, thresholds]);

  /** Returns percentile rank (0–100, higher = more central). "top X%" = 100 - percentile. */
  const getPercentile = useCallback((uid: string): number => {
    if (sortedVals.length === 0) return 0;
    const c = data?.centrality[uid] ?? 0;
    // Binary search for position in sorted values
    let lo = 0, hi = sortedVals.length;
    while (lo < hi) {
      const mid = (lo + hi) >>> 1;
      if (sortedVals[mid] < c) lo = mid + 1;
      else hi = mid;
    }
    return Math.round((lo / sortedVals.length) * 100);
  }, [data, sortedVals]);

  const getIslands = useCallback((): IslandsData | null => {
    return data?.islands ?? null;
  }, [data]);

  return { getRelevance, getCentrality, getBridgeTier, getPercentile, getIslands, loaded: !!data };
}
