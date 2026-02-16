/**
 * compute-graph-relevance.js
 * Build-time script: reads fieldnotes-index.generated.json, computes graph
 * relevance scores (PageRank + BFS proximity + shared neighbors), outputs
 * src/data/graph-relevance.generated.json.
 *
 * Called automatically at the end of build-content.js.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const INDEX_FILE = path.join(__dirname, '../src/data/fieldnotes-index.generated.json');
const OUTPUT_FILE = path.join(__dirname, '../src/data/graph-relevance.generated.json');

const TOP_N = 30;
const MAX_HOPS = 6;
const DAMPING = 0.85;
const PR_ITERATIONS = 20;

// Weight constants
const W_PROXIMITY = 0.5;
const W_CENTRALITY = 0.3;
const W_SHARED = 0.2;

function run() {
  if (!fs.existsSync(INDEX_FILE)) {
    console.log('  Skipping graph relevance — no fieldnotes index yet');
    return;
  }

  const index = JSON.parse(fs.readFileSync(INDEX_FILE, 'utf-8'));

  // Build bidirectional adjacency list
  const adj = new Map(); // uid -> Set<uid>
  const allUids = new Set();

  for (const note of index) {
    allUids.add(note.id);
    if (!adj.has(note.id)) adj.set(note.id, new Set());

    const refs = (note.references || []);
    const trailing = (note.trailingRefs || []).map(r => r.uid);
    const allRefs = [...refs, ...trailing];

    for (const target of allRefs) {
      if (target === note.id) continue;
      // Only add edges to UIDs that exist in the index
      if (!adj.has(target)) adj.set(target, new Set());
      adj.get(note.id).add(target);
      adj.get(target).add(note.id);
    }
  }

  // Filter adj to only include known UIDs
  for (const [uid, neighbors] of adj) {
    if (!allUids.has(uid)) {
      adj.delete(uid);
      continue;
    }
    for (const n of neighbors) {
      if (!allUids.has(n)) neighbors.delete(n);
    }
  }

  const uids = [...allUids];
  const N = uids.length;

  if (N === 0) {
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify({ centrality: {}, relevance: {} }));
    console.log('  Graph relevance: 0 notes, skipped');
    return;
  }

  // PageRank
  const pr = new Map();
  const initVal = 1 / N;
  for (const uid of uids) pr.set(uid, initVal);

  for (let iter = 0; iter < PR_ITERATIONS; iter++) {
    const next = new Map();
    for (const uid of uids) next.set(uid, (1 - DAMPING) / N);

    for (const uid of uids) {
      const neighbors = adj.get(uid);
      if (!neighbors || neighbors.size === 0) continue;
      const share = pr.get(uid) / neighbors.size;
      for (const neighbor of neighbors) {
        next.set(neighbor, next.get(neighbor) + DAMPING * share);
      }
    }

    for (const uid of uids) pr.set(uid, next.get(uid));
  }

  // Normalize PageRank to 0-1
  let maxPR = 0;
  for (const v of pr.values()) if (v > maxPR) maxPR = v;
  const centrality = {};
  for (const uid of uids) {
    centrality[uid] = maxPR > 0 ? pr.get(uid) / maxPR : 0;
  }

  // BFS distance from each node (up to MAX_HOPS)
  function bfs(start) {
    const dist = new Map();
    dist.set(start, 0);
    const queue = [start];
    let head = 0;
    while (head < queue.length) {
      const cur = queue[head++];
      const d = dist.get(cur);
      if (d >= MAX_HOPS) continue;
      const neighbors = adj.get(cur);
      if (!neighbors) continue;
      for (const n of neighbors) {
        if (!dist.has(n)) {
          dist.set(n, d + 1);
          queue.push(n);
        }
      }
    }
    return dist;
  }

  // Compute relevance for each note
  const relevance = {};

  for (const a of uids) {
    const neighborsA = adj.get(a) || new Set();
    if (neighborsA.size === 0) continue;

    const distances = bfs(a);
    const scores = [];

    for (const b of uids) {
      if (b === a) continue;

      const neighborsB = adj.get(b) || new Set();

      // Proximity
      const dist = distances.get(b);
      const proximity = dist != null ? 1 / (1 + dist) : 0;
      if (proximity === 0) continue; // unreachable

      // Shared neighbors (Jaccard-like)
      let shared = 0;
      for (const n of neighborsA) {
        if (neighborsB.has(n)) shared++;
      }
      const denom = Math.sqrt(neighborsA.size * neighborsB.size);
      const sharedScore = denom > 0 ? shared / denom : 0;

      const score = W_PROXIMITY * proximity + W_CENTRALITY * centrality[b] + W_SHARED * sharedScore;
      scores.push({ uid: b, score: Math.round(score * 10000) / 10000 });
    }

    scores.sort((a, b) => b.score - a.score);
    relevance[a] = scores.slice(0, TOP_N);
  }

  // Drift detection: find pairs not directly connected but with high neighbor overlap
  const driftSuggestions = {};
  const DRIFT_JACCARD_MIN = 0.25;
  const DRIFT_SHARED_MIN = 2;
  const DRIFT_TOP = 5;

  for (const a of uids) {
    const neighborsA = adj.get(a) || new Set();
    if (neighborsA.size === 0) continue;

    const candidates = [];

    for (const b of uids) {
      if (b === a) continue;
      if (neighborsA.has(b)) continue; // skip directly connected

      const neighborsB = adj.get(b) || new Set();
      if (neighborsB.size === 0) continue;

      // Jaccard index of neighbor sets
      const via = [];
      for (const n of neighborsA) {
        if (neighborsB.has(n)) via.push(n);
      }
      const sharedCount = via.length;
      if (sharedCount < DRIFT_SHARED_MIN) continue;

      const unionSize = neighborsA.size + neighborsB.size - sharedCount;
      const jaccard = unionSize > 0 ? sharedCount / unionSize : 0;
      if (jaccard < DRIFT_JACCARD_MIN) continue;

      candidates.push({
        uid: b,
        score: Math.round(jaccard * 10000) / 10000,
        sharedCount,
        via: via.slice(0, 3),
      });
    }

    if (candidates.length > 0) {
      candidates.sort((x, y) => y.score - x.score || y.sharedCount - x.sharedCount);
      driftSuggestions[a] = candidates.slice(0, DRIFT_TOP);
    }
  }

  // --- Island Detection: connected components + articulation points (Tarjan) ---

  // Step 1: Connected components via BFS
  const nodeToComponent = {};
  const components = []; // { id, size, members }
  const visited = new Set();

  for (const uid of uids) {
    if (visited.has(uid)) continue;
    const compId = components.length;
    const members = [];
    const queue = [uid];
    visited.add(uid);
    let head = 0;
    while (head < queue.length) {
      const cur = queue[head++];
      members.push(cur);
      nodeToComponent[cur] = compId;
      const neighbors = adj.get(cur) || new Set();
      for (const n of neighbors) {
        if (!visited.has(n)) {
          visited.add(n);
          queue.push(n);
        }
      }
    }
    components.push({ id: compId, size: members.length, members });
  }

  // Orphans: nodes with no edges
  const orphanUids = uids.filter(uid => {
    const neighbors = adj.get(uid);
    return !neighbors || neighbors.size === 0;
  });

  // Step 2: Tarjan's algorithm for articulation points per component (size > 1)
  const allCutNodes = new Set();

  for (const comp of components) {
    if (comp.size <= 1) continue;

    const disc = new Map();
    const low = new Map();
    const parent = new Map();
    let timer = 0;

    function dfs(u) {
      disc.set(u, timer);
      low.set(u, timer);
      timer++;
      let childCount = 0;

      for (const v of (adj.get(u) || new Set())) {
        if (nodeToComponent[v] !== comp.id) continue;
        if (!disc.has(v)) {
          childCount++;
          parent.set(v, u);
          dfs(v);
          low.set(u, Math.min(low.get(u), low.get(v)));
          // Articulation point conditions
          if (!parent.has(u) && childCount > 1) allCutNodes.add(u);
          if (parent.has(u) && low.get(v) >= disc.get(u)) allCutNodes.add(u);
        } else if (v !== parent.get(u)) {
          low.set(u, Math.min(low.get(u), disc.get(v)));
        }
      }
    }

    // Start DFS from first member
    dfs(comp.members[0]);
  }

  // Step 3: Side sizes per articulation point
  const cuts = [];

  for (const cutUid of allCutNodes) {
    const compId = nodeToComponent[cutUid];
    const comp = components[compId];

    // BFS the remaining subgraph after removing cutUid
    const remaining = new Set(comp.members.filter(m => m !== cutUid));
    const fragmentVisited = new Set();
    const sides = [];

    for (const start of remaining) {
      if (fragmentVisited.has(start)) continue;
      const fragment = [];
      const q = [start];
      fragmentVisited.add(start);
      let h = 0;
      while (h < q.length) {
        const cur = q[h++];
        fragment.push(cur);
        for (const n of (adj.get(cur) || new Set())) {
          if (remaining.has(n) && !fragmentVisited.has(n)) {
            fragmentVisited.add(n);
            q.push(n);
          }
        }
      }
      sides.push(fragment.length);
    }

    sides.sort((a, b) => b - a);
    const criticality = sides.length > 1
      ? Math.round((Math.min(...sides) / comp.size) * 10000) / 10000
      : 0;

    cuts.push({
      uid: cutUid,
      componentId: compId,
      criticality,
      sides,
    });
  }

  cuts.sort((a, b) => b.criticality - a.criticality);

  const islands = {
    components: components.map(c => ({ id: c.id, size: c.size, cutCount: cuts.filter(ct => ct.componentId === c.id).length })),
    cuts,
    nodeToComponent,
    orphanUids,
  };

  const driftCount = Object.keys(driftSuggestions).length;
  const output = { centrality, relevance, driftSuggestions, islands };
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output));
  console.log(`  Graph relevance: ${N} notes, ${Object.keys(relevance).length} with scores, ${driftCount} with drift, ${cuts.length} bridges → ${OUTPUT_FILE}`);
}

run();
