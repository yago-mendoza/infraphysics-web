/**
 * compute-graph-thumb.js
 * Build-time script: reads wikinotes-index.generated.json, lays out the whole
 * wikinote graph with a small deterministic force simulation and writes a
 * static picture of it (3D positions, radii, root colours, centrality percentile, typed edges) to
 * src/data/graph-thumb.generated.json. The Home page draws it as inline SVG
 * so it looks like the wiki's minimised graph without loading the index or
 * the force-graph library.
 *
 * Called automatically at the end of build-content.js.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const INDEX_FILE = path.join(__dirname, '../src/data/wikinotes-index.generated.json');
const OUTPUT_FILE = path.join(__dirname, '../src/data/graph-thumb.generated.json');

const ITERATIONS = 300;
// Same categorical palette and ranking rule as ROOT_PALETTE in src/components/graph/useGraphData.ts.
const ROOT_PALETTE = ['#3987e5', '#d95926', '#199e70', '#c98500', '#d55181', '#008300', '#9085e9', '#e66767'];
const ROOT_NEUTRAL = '#6b7280';
// Edge types match useGraphData.ts: body reference, trailing-ref interaction, address hierarchy.
const EDGE_TYPES = { body: 0, interaction: 1, hierarchy: 2 };

// Deterministic PRNG so the layout is identical on every build.
function mulberry32(seed) {
  return () => {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function run() {
  if (!fs.existsSync(INDEX_FILE)) {
    console.log('  Skipping graph thumb: no wikinotes index yet');
    return;
  }
  const notes = JSON.parse(fs.readFileSync(INDEX_FILE, 'utf8'));
  const ids = notes.map(note => note.id);
  const indexById = new Map(ids.map((id, index) => [id, index]));
  const idByAddress = new Map(notes.map(note => [note.address, note.id]));

  // One undirected edge per pair; interaction beats body, hierarchy is its own edge (wiki precedence).
  const edgeType = new Map();
  const pairKey = (a, b) => (a < b ? a + '|' + b : b + '|' + a);
  const link = (a, b, type) => {
    if (a === b || !indexById.has(a) || !indexById.has(b)) return;
    const key = pairKey(a, b);
    if (!edgeType.has(key) || type === 'interaction') edgeType.set(key, type);
  };
  for (const note of notes) {
    for (const ref of note.trailingRefs || []) link(note.id, ref.uid, 'interaction');
    for (const ref of note.references || []) link(note.id, ref, 'body');
    const parts = note.addressParts || [];
    if (parts.length > 1) {
      const parentId = idByAddress.get(parts.slice(0, -1).join('//'));
      if (parentId) link(note.id, parentId, 'hierarchy');
    }
  }
  const links = [...edgeType].map(([key, type]) => {
    const [a, b] = key.split('|');
    return [indexById.get(a), indexById.get(b), EDGE_TYPES[type]];
  });
  const degree = new Array(ids.length).fill(0);
  for (const [a, b] of links) { degree[a] += 1; degree[b] += 1; }

  // Root colours ranked by root size, the same rule as the wiki.
  const rootCounts = new Map();
  for (const note of notes) {
    const root = (note.address || '').split('//')[0];
    if (root) rootCounts.set(root, (rootCounts.get(root) || 0) + 1);
  }
  const ranked = [...rootCounts].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  const colorByRoot = new Map(ranked.map(([root], index) => [root, ROOT_PALETTE[index] ?? ROOT_NEUTRAL]));

  // Fruchterman-Reingold on a unit square, seeded. Isolated notes drift to a
  // hashed satellite position instead of piling up in the centre.
  const random = mulberry32(20260906);
  const n = ids.length;
  const pos = ids.map(() => ({ x: random() - .5, y: random() - .5, z: (random() - .5) * .6 }));
  const hash01 = (value, salt) => { let h = 2166136261 ^ salt; for (let i = 0; i < value.length; i += 1) { h ^= value.charCodeAt(i); h = Math.imul(h, 16777619); } return ((h >>> 0) % 10000) / 10000; };
  const satellite = ids.map((id, index) => degree[index] ? null : { x: (hash01(id, 71) - .5) * 1.6, y: (hash01(id, 97) - .5) * 1.6, z: (hash01(id, 131) - .5) * .8 });
  const k = Math.sqrt(1 / n) * .85;
  let temperature = .1;
  for (let iteration = 0; iteration < ITERATIONS; iteration += 1) {
    const disp = pos.map(() => ({ x: 0, y: 0, z: 0 }));
    for (let i = 0; i < n; i += 1) for (let j = i + 1; j < n; j += 1) {
      let dx = pos[i].x - pos[j].x, dy = pos[i].y - pos[j].y, dz = pos[i].z - pos[j].z;
      const d = Math.hypot(dx, dy, dz) || 1e-4;
      if (d > .35) continue; // short-range repulsion keeps this O(n²) pass cheap enough
      const force = (k * k) / d;
      dx /= d; dy /= d; dz /= d;
      disp[i].x += dx * force; disp[i].y += dy * force; disp[i].z += dz * force;
      disp[j].x -= dx * force; disp[j].y -= dy * force; disp[j].z -= dz * force;
    }
    for (const [i, j] of links) {
      let dx = pos[i].x - pos[j].x, dy = pos[i].y - pos[j].y, dz = pos[i].z - pos[j].z;
      const d = Math.hypot(dx, dy, dz) || 1e-4;
      const force = (d * d) / k;
      dx /= d; dy /= d; dz /= d;
      disp[i].x -= dx * force; disp[i].y -= dy * force; disp[i].z -= dz * force;
      disp[j].x += dx * force; disp[j].y += dy * force; disp[j].z += dz * force;
    }
    for (let i = 0; i < n; i += 1) {
      const anchor = satellite[i];
      if (anchor) { disp[i].x += (anchor.x - pos[i].x) * .3; disp[i].y += (anchor.y - pos[i].y) * .3; disp[i].z += (anchor.z - pos[i].z) * .3; }
      else { disp[i].x -= pos[i].x * .05; disp[i].y -= pos[i].y * .05; disp[i].z -= pos[i].z * .09; }
      const d = Math.hypot(disp[i].x, disp[i].y, disp[i].z) || 1e-4;
      const step = Math.min(d, temperature);
      pos[i].x += (disp[i].x / d) * step;
      pos[i].y += (disp[i].y / d) * step;
      pos[i].z += (disp[i].z / d) * step;
    }
    temperature *= .99;
  }

  // Normalise x/y into a 0..100 box with a small margin; z keeps the same scale, centred on 0.
  const xs = pos.map(p => p.x), ys = pos.map(p => p.y), zs = pos.map(p => p.z);
  const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
  const zMid = (Math.min(...zs) + Math.max(...zs)) / 2;
  const span = Math.max(maxX - minX, maxY - minY) || 1;
  const offsetX = (span - (maxX - minX)) / 2, offsetY = (span - (maxY - minY)) / 2;
  const byDegree = ids.map((_, index) => index).sort((a, b) => degree[a] - degree[b]);
  const percentile = new Array(n);
  byDegree.forEach((index, rank) => { percentile[index] = rank / Math.max(1, n - 1); });
  const nodes = ids.map((id, index) => {
    const note = notes[index];
    const root = (note.address || '').split('//')[0];
    return {
      id,
      x: Number((4 + ((pos[index].x - minX + offsetX) / span) * 92).toFixed(1)),
      y: Number((4 + ((pos[index].y - minY + offsetY) / span) * 92).toFixed(1)),
      z: Number((((pos[index].z - zMid) / span) * 92).toFixed(1)),
      r: Number((.32 + Math.pow(percentile[index], .78) * .95).toFixed(2)),
      c: colorByRoot.get(root) ?? ROOT_NEUTRAL,
      p: Number(percentile[index].toFixed(2)),
    };
  });

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify({ total: notes.length, nodes, links }));
  console.log(`  Graph thumb: ${nodes.length} nodes, ${links.length} edges → ${path.relative(process.cwd(), OUTPUT_FILE)}`);
}

run();
