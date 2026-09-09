import fs from 'node:fs';

export const WEIGHTS = { projects: 1, bits2bricks: 0.9, essays: 0.6 };
export const LINK_BONUS_MAX = 0.25;
export const LINK_HALF_SATURATION = 8;
export const normalizeTag = value => value.trim().toLowerCase().replace(/[\s_-]+/g, ' ');
const compare = (a, b) => a < b ? -1 : a > b ? 1 : 0;

// Only resolved Wiki anchors in compiled article prose count, never code examples.
export function articleWikiConcepts(content = '') {
  const prose = content.replace(/<(pre|code)\b[^>]*>[\s\S]*?<\/\1>/gi, '').replace(/<!--[\s\S]*?-->/g, '');
  const ids = new Set();
  for (const match of prose.matchAll(/<a\b[^>]*>/gi)) {
    const anchor = match[0];
    const classes = anchor.match(/\bclass\s*=\s*["']([^"']*)["']/i)?.[1].split(/\s+/) || [];
    const id = anchor.match(/\bdata-uid\s*=\s*["']([^"']+)["']/i)?.[1];
    if (classes.includes('wiki-ref') && id) ids.add(id);
  }
  return [...ids].sort(compare);
}

/** Pure, order-independent content model. No clock, randomness or manual coordinates. */
export function computeFieldOfView(posts, notes) {
  const wiki = [...notes].sort((a, b) => compare(a.id, b.id));
  const byId = new Map(wiki.map(n => [n.id, n]));
  const byAddress = new Map(wiki.map(n => [n.address, n]));
  const names = new Map();
  for (const n of wiki) for (const name of [n.name, n.address, ...(n.aliases || [])]) {
    const key = normalizeTag(name);
    if (!names.has(key)) names.set(key, new Set());
    names.get(key).add(n.id);
  }
  const roots = wiki.filter(n => !n.address.includes('//'));
  const rootOf = new Map(wiki.map(n => [n.id, byAddress.get(n.address.split('//')[0])?.id]));
  for (const n of wiki) {
    if (!rootOf.get(n.id)) throw new Error(`Missing Wiki root for ${n.address}`);
  }
  const contributions = new Map(roots.map(n => [n.id, []]));
  const tagResolution = {};
  const errors = [];
  const articles = posts.filter(p => !p.hidden && WEIGHTS[p.category]).sort((a, b) => compare(a.id, b.id));
  let totalWeight = 0;
  for (const post of articles) {
    const seeds = new Set();
    for (const tag of [...new Set(post.tags || [])].sort(compare)) {
      const key = normalizeTag(tag);
      const ids = names.get(key);
      if (!ids || ids.size !== 1 || !byId.has([...ids][0])) {
        errors.push(`${post.id}: ${tag} (${ids?.size > 1 ? 'ambiguous' : 'missing'} Wiki concept)`);
      } else {
        const id = [...ids][0];
        seeds.add(id);
        tagResolution[tag] = id;
      }
    }
    if (!seeds.size) { errors.push(`${post.id}: no resolved tags`); continue; }
    const bodyConcepts = articleWikiConcepts(post.content);
    for (const id of bodyConcepts) if (!byId.has(id)) errors.push(`${post.id}: broken body Wiki link ${id}`);
    const links = new Set(bodyConcepts.filter(id => byId.has(id)));
    const linkBonus = LINK_BONUS_MAX * links.size / (links.size + LINK_HALF_SATURATION);
    const baseWeight = WEIGHTS[post.category];
    const weight = baseWeight * (1 + linkBonus);
    totalWeight += weight;
    // Each concept belongs to its address root. Wiki-to-Wiki links never transfer credit.
    for (const root of roots) {
      const taggedConcepts = [...seeds].filter(id => rootOf.get(id) === root.id).sort(compare);
      const linkedConcepts = [...links].filter(id => rootOf.get(id) === root.id).sort(compare);
      const tagWeight = baseWeight * taggedConcepts.length / seeds.size;
      const linkWeight = links.size ? baseWeight * linkBonus * linkedConcepts.length / links.size : 0;
      contributions.get(root.id).push({
        id: post.id, title: post.displayTitle || post.title, category: post.category,
        weight: tagWeight + linkWeight, tagWeight, linkWeight,
        direct: taggedConcepts.length > 0,
        linked: linkedConcepts.length > 0,
        taggedConcepts, linkedConcepts,
        baseWeight, linkBonus,
      });
    }
  }
  if (errors.length) throw new Error(`Article tags must resolve to one Wiki concept:\n${errors.join('\n')}`);
  const candidates = roots.map(n => {
    const evidence = contributions.get(n.id);
    const support = evidence.reduce((sum, p) => sum + p.weight, 0);
    const practical = evidence.filter(p => p.category !== 'essays').reduce((sum, p) => sum + p.weight, 0);
    const direct = evidence.filter(p => p.direct);
    const related = evidence.filter(p => p.direct || p.linked);
    return { id: n.id, label: n.name, support, share: totalWeight ? support / totalWeight : 0,
      practicalRatio: support ? practical / support : 0,
      directArticles: direct.length,
      linkedArticles: evidence.filter(p => p.linked).length,
      relatedArticles: related.length,
      eligible: related.length >= 2 || related.some(p => p.category === 'projects'),
      sources: evidence.filter(p => p.weight > 0).sort((a, b) => b.weight - a.weight || compare(a.id, b.id)),
    };
  }).sort((a, b) => b.support - a.support || compare(a.id, b.id));
  const selected = candidates.filter(n => n.eligible && n.share >= 0.025).slice(0, 8);
  // Horizontal spacing is ordinal: one equal step per coverage rank, not per percentage.
  const points = selected.map((n, index) => ({ ...n, x: selected.length === 1 ? 50 : 86 - 72 * index / (selected.length - 1), y: 14 + 72 * n.practicalRatio,
  }));
  return { wikiRoots: roots.map(n => ({ id: n.id, label: n.name, count: wiki.filter(note => rootOf.get(note.id) === n.id).length, description: plainLead(n.description) })), version: 3, weights: WEIGHTS, linkBonusMax: LINK_BONUS_MAX, linkHalfSaturation: LINK_HALF_SATURATION, totalWeight, tagResolution, candidates, points };
}


// The opening line of a root note as plain text for the home mosaic: no list marker, no
// emphasis, wiki-links reduced to their label, the double hyphen read as a colon, and only
// the first sentence, capped so it fits the reading column.
export function plainLead(text) {
  let t = String(text || '').replace(/\r?\n/g, ' ').trim();
  t = t.replace(/^(?:[-*+]\s+|\d+\.\s+)/, '');
  t = t.replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, '$2').replace(/\[\[([^\]]+)\]\]/g, '$1');
  t = t.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1');
  t = t.replace(/\*\*|__|`/g, '').replace(/(^|\s)\*(\S[^*]*)\*/g, '$1$2');
  t = t.replace(/\s+--\s+/g, ': ').replace(/\s+/g, ' ').trim();
  const m = t.match(/^.*?[.!?](?=\s|$)/);
  t = (m ? m[0] : t).trim();
  return t.length > 180 ? t.slice(0, 177).replace(/\s+\S*$/, '') + '…' : t;
}
export function attachFieldExplanations(result, explanations) {
  const missing = result.points.filter(point => typeof explanations[point.id] !== 'string' || !explanations[point.id].trim());
  if (missing.length) throw new Error(`Field of View needs an editorial explanation for: ${missing.map(p => `${p.label} (${p.id})`).join(', ')}. Add a short, content-grounded sentence to src/data/field-of-view-context.json.`);
  const tooLong = result.points.filter(point => explanations[point.id].trim().length > 140);
  if (tooLong.length) throw new Error(`Keep Field of View explanations within 140 characters: ${tooLong.map(p => p.label).join(', ')}`);
  return { ...result, points: result.points.map(point => ({ ...point, rationale: explanations[point.id].trim() })) };
}

export function writeFieldOfView(posts, notes) {
  const explanations = JSON.parse(fs.readFileSync(new URL('../src/data/field-of-view-context.json', import.meta.url), 'utf8'));
  const result = attachFieldExplanations(computeFieldOfView(posts, notes), explanations);
  fs.writeFileSync(new URL('../src/data/field-of-view.generated.json', import.meta.url), JSON.stringify(result, null, 2) + '\n');
  console.log(`  Field of View: ${result.points.map(p => p.label).join(', ')}`);
}
