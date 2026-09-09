import test from 'node:test';
import assert from 'node:assert/strict';
import { computeFieldOfView, attachFieldExplanations, articleWikiConcepts, LINK_BONUS_MAX } from './compute-field-of-view.js';
import { placeFieldLabels } from '../src/lib/fieldLayout.js';

const note = (id, address, extra = {}) => ({ id, address, name: address.split('//').at(-1), ...extra });
const wiki = [note('a', 'alpha'), note('b', 'beta'), note('c', 'alpha//child', { aliases: ['child-alias'], references: ['b'] })];
const posts = [
  { id: '1', category: 'projects', tags: ['child', 'beta'] },
  { id: '2', category: 'bits2bricks', tags: ['alpha'] },
  { id: '3', category: 'essays', tags: ['beta'] },
];

test('permutations of articles, tags, notes and edges do not change the artifact', () => {
  const a = computeFieldOfView(posts, wiki);
  const b = computeFieldOfView([...posts].reverse().map(p => ({ ...p, tags: [...p.tags].reverse() })), [...wiki].reverse());
  assert.equal(JSON.stringify(a), JSON.stringify(b));
});

test('weights are conserved, including dangling nodes; unrelated Wiki bulk adds no support', () => {
  const result = computeFieldOfView(posts, [...wiki, ...Array.from({ length: 50 }, (_, i) => note(`z${i}`, `unrelated${i}`))]);
  assert.equal(result.totalWeight, 2.5);
  assert.ok(Math.abs(result.candidates.reduce((sum, n) => sum + n.support, 0) - 2.5) < 1e-12);
  assert.deepEqual(result.points, computeFieldOfView(posts, wiki).points);
});

test('repeated tags and synonyms cannot increase an article weight', () => {
  const a = computeFieldOfView([{ ...posts[0], tags: ['child'] }], wiki);
  const b = computeFieldOfView([{ ...posts[0], tags: ['child', 'child', 'child-alias'] }], wiki);
  assert.deepEqual(a.candidates, b.candidates);
});

test('Wiki relationships cannot transfer coverage to an unsupported root', () => {
  const result = computeFieldOfView([{ ...posts[0], tags: ['child'] }], wiki);
  assert.equal(result.candidates.find(n => n.id === 'b').support, 0);
  assert.equal(result.candidates.find(n => n.id === 'a').support, 1);
  assert.deepEqual(result.points.map(n => n.id), ['a']);
});

test('hidden content contributes nothing; missing and ambiguous tags fail', () => {
  assert.deepEqual(computeFieldOfView([...posts, { id: 'hidden', category: 'projects', hidden: true, tags: ['missing'] }], wiki), computeFieldOfView(posts, wiki));
  assert.throws(() => computeFieldOfView([{ ...posts[0], tags: ['missing'] }], wiki), /missing Wiki concept/);
  assert.throws(() => computeFieldOfView([{ ...posts[0], tags: [] }], wiki), /no resolved tags/);
  assert.throws(() => computeFieldOfView([{ ...posts[0], tags: ['child'] }], [...wiki, note('d', 'beta//child')]), /ambiguous Wiki concept/);
});

test('practical emphasis distinguishes essay evidence from implemented and technical work', () => {
  const result = computeFieldOfView([
    { id: 'p', category: 'projects', tags: ['alpha'] },
    { id: 'b', category: 'bits2bricks', tags: ['alpha'] },
    { id: 'e1', category: 'essays', tags: ['beta'] },
    { id: 'e2', category: 'essays', tags: ['beta'] },
  ], wiki.slice(0, 2));
  assert.equal(result.points[0].support, 1.9);
  assert.equal(result.points[0].practicalRatio, 1);
  assert.equal(result.points[1].practicalRatio, 0);
  assert.ok(result.points[0].x > result.points[1].x);
});

test('selection is bounded and tied scores use UID order; labels do not overlap', () => {
  const notes = Array.from({ length: 12 }, (_, i) => note(`n${i.toString().padStart(2, '0')}`, `domain${i}`));
  const articles = notes.map(n => ({ id: n.id, category: 'projects', tags: [n.name] }));
  const result = computeFieldOfView(articles, notes);
  assert.equal(result.points.length, 8);
  assert.deepEqual(result.points.map(n => n.id), notes.slice(0, 8).map(n => n.id));
  for (const width of [280, 340, 600]) {
    const input = result.points.map(p => ({ ...p, width: 84, height: 24 }));
    const positions = placeFieldLabels(input, width, 350);
    assert.deepEqual(positions, placeFieldLabels(input, width, 350));
    for (const [i, a] of positions.entries()) for (const b of positions.slice(i + 1)) {
      assert.ok(Math.abs(a.x - b.x) * width / 100 >= 91.99 || Math.abs(a.y - b.y) * 350 / 100 >= 31.99);
    }
  }
});

test('an empty corpus yields an empty map without NaN', () => {
  const result = computeFieldOfView([], []);
  assert.deepEqual(result.points, []);
  assert.equal(result.totalWeight, 0);
});

test('a dynamically selected domain cannot publish without a concise editorial explanation', () => {
  const result = computeFieldOfView(posts, wiki);
  assert.throws(() => attachFieldExplanations(result, {}), /alpha \(a\).*beta \(b\)/);
  assert.throws(() => attachFieldExplanations(result, { a: ' ', b: 'Why beta matters.' }), /alpha \(a\)/);
  assert.throws(() => attachFieldExplanations(result, { a: 'x'.repeat(141), b: 'Why beta matters.' }), /140 characters/);
  const explained = attachFieldExplanations(result, { a: 'Why alpha matters.', b: 'Why beta matters.' });
  assert.equal(explained.points[0].rationale, 'Why alpha matters.');
  assert.equal(explained.points[0].support, result.points[0].support);
});

const link = id => `<a class="wiki-ref" data-uid="${id}">concept</a>`;

test('body evidence uses distinct resolved Wiki anchors, excluding code and ordinary links', () => {
  assert.deepEqual(articleWikiConcepts(`${link('c')}${link('c')}<pre>${link('b')}</pre><code>${link('a')}</code><a href="/wiki/a">ordinary link</a><!-- ${link('b')} -->`), ['c']);
});

test('nested tags and links count an article once per branch, with no full-credit duplication across roots', () => {
  const result = computeFieldOfView([{ ...posts[0], tags: ['child'], content: link('c') + link('c') + link('b') }], wiki);
  const alpha = result.candidates.find(p => p.id === 'a');
  const beta = result.candidates.find(p => p.id === 'b');
  assert.equal(alpha.directArticles, 1);
  assert.equal(alpha.linkedArticles, 1);
  assert.equal(alpha.relatedArticles, 1);
  assert.equal(beta.directArticles, 0);
  assert.equal(beta.relatedArticles, 1);
  assert.ok(Math.abs(result.candidates.reduce((sum, n) => sum + n.support, 0) - result.totalWeight) < 1e-12);
});

test('body-link bonus saturates, tags remain primary, and repetition adds no weight', () => {
  const notes = [note('a', 'alpha'), note('b', 'beta'), ...Array.from({ length: 80 }, (_, i) => note(`c${i}`, `beta//child${i}`))];
  const calc = count => computeFieldOfView([{ ...posts[0], tags: ['alpha'], content: Array.from({ length: count }, (_, i) => link(`c${i}`)).join('') }], notes);
  const r8 = calc(8), r16 = calc(16), r80 = calc(80);
  assert.equal(r8.totalWeight, 1.125);
  assert.ok(r16.totalWeight - r8.totalWeight < r8.totalWeight - 1);
  assert.ok(r80.totalWeight < 1 + LINK_BONUS_MAX);
  assert.ok(r80.candidates.find(p => p.id === 'a').support > r80.candidates.find(p => p.id === 'b').support);
  const repeated = computeFieldOfView([{ ...posts[0], tags: ['alpha'], content: link('c0').repeat(100) }], notes);
  assert.deepEqual(repeated, calc(1));
});

test('body-link order and reference order cannot alter hybrid output', () => {
  const p = [{ ...posts[0], content: link('c') + link('b') }];
  assert.deepEqual(computeFieldOfView(p, wiki), computeFieldOfView([{ ...p[0], content: link('b') + link('c') }], [...wiki].reverse()));
});

test('essays add coverage and reduce practical emphasis, including their body evidence', () => {
  const articles = [{ id: 'p', category: 'projects', tags: ['alpha'] }, { id: 'e', category: 'essays', tags: ['alpha'], content: link('a') }];
  const result = computeFieldOfView(articles, wiki.slice(0, 1));
  assert.ok(result.points[0].support > 1.6);
  assert.ok(result.points[0].practicalRatio < 1 / 1.6);
  assert.equal(result.points[0].relatedArticles, 2);
});

test('editing only Wiki references leaves the complete result unchanged', () => {
  const articles = [{ ...posts[0], content: link('c') }];
  const rewrittenWiki = wiki.map(n => ({ ...n, references: ['a', 'b', 'c'], trailingRefs: [{ uid: 'a' }, { uid: 'b' }] }));
  assert.deepEqual(computeFieldOfView(articles, rewrittenWiki), computeFieldOfView(articles, wiki));
});

test('reparenting a concept changes its domain assignment rather than duplicating credit', () => {
  const articles = [{ ...posts[0], tags: ['child'] }];
  const reparented = wiki.map(n => n.id === 'c' ? { ...n, address: 'beta//child' } : n);
  const result = computeFieldOfView(articles, reparented);
  assert.equal(result.candidates.find(n => n.id === 'a').support, 0);
  assert.equal(result.candidates.find(n => n.id === 'b').support, 1);
});

test('every source contribution is fully explained by its article tags and body links', () => {
  const result = computeFieldOfView([{ ...posts[0], tags: ['child'], content: link('b') }], wiki);
  const alpha = result.candidates.find(n => n.id === 'a').sources[0];
  const beta = result.candidates.find(n => n.id === 'b').sources[0];
  assert.equal(alpha.tagWeight, 1);
  assert.equal(alpha.linkWeight, 0);
  assert.equal(beta.tagWeight, 0);
  assert.equal(beta.linkWeight, 0.25 / 9);
  for (const domain of result.candidates) {
    assert.equal(domain.sources.length, domain.relatedArticles);
    for (const source of domain.sources) {
      assert.equal(source.weight, source.tagWeight + source.linkWeight);
      assert.ok(source.taggedConcepts.length || source.linkedConcepts.length);
    }
  }
});
