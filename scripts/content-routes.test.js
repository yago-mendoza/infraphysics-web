import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createContentRoutes, slugify } from '../src/lib/content/routes.js';
import { readContentFiles, routeEntries, chooseWikiSlug } from './content-files.js';
import { processAllLinks } from '../src/lib/content/compile.js';
import { serializeWikinote } from '../src/lib/content/wikinote-parser.js';
import { build } from 'esbuild';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import matter from 'gray-matter';

test('all content identities and historical prefixes resolve to the same canonical document', () => {
  const routes = createContentRoutes(routeEntries());
  for (const [old, entry] of routes.byPath) {
    assert.equal(routes.resolve(entry.canonical).id, entry.id, old);
    assert.equal(routes.canonicalize(old + '?via=test#section'), entry.canonical + '?via=test#section');
    assert.equal(routes.canonicalize('https://infraphysics.net' + old + '#section'), 'https://infraphysics.net' + entry.canonical + '#section');
    assert.equal(routes.path(entry.category, entry.id), entry.canonical);
    assert.equal(routes.storagePath(old), routes.storagePath(entry.canonical));
  }
  assert.equal(routes.path('wikinotes', 'Economy1'), '/wiki/economics');
  assert.equal(routes.path('projects', '7654321'), '/lab/projects/forecasting-visual-auras');
});

test('rename aliases, reserved paths and ambiguous routes', () => {
  const note = { category: 'wikinotes', id: 'OldUID7', slug: 'new-name', aliases: ['old-name'] };
  const routes = createContentRoutes([note]);
  assert.equal(routes.resolve('/wiki/old-name').id, note.id);
  assert.equal(routes.resolve('/wiki/new-name/').id, note.id);
  assert.equal(routes.resolve('/wiki/missing'), undefined);
  assert.equal(routes.canonicalize('https://elsewhere.net/wiki/old-name'), 'https://elsewhere.net/wiki/old-name');
  for (const slug of ['graph', 'con', 'readme', 'style', 'agents', 'Bad_Name', '', undefined, null, 123]) assert.throws(() => createContentRoutes([{ ...note, slug }]));
  for (const aliases of [null, 123, [123], [null]]) assert.throws(() => createContentRoutes([{ ...note, aliases }]), /Invalid route aliases/);
  assert.equal(chooseWikiSlug('tools//README', new Set()), 'readme-tools');
  assert.throws(() => chooseWikiSlug('README', new Set()));
  assert.throws(() => createContentRoutes([note, { ...note, id: 'other', slug: 'old-name' }]));
  assert.throws(() => createContentRoutes([note, { ...note, id: 'new-name', slug: 'another' }]));
  assert.equal(slugify('C++ & C#'), 'c-plus-plus-and-c-sharp');
});

test('cross-document references emit canonical URLs and report missing targets', () => {
  const routes = createContentRoutes(routeEntries());
  const errors = [];
  const html = processAllLinks('[[projects/7654321#method|Read]] [[essays/missing|Missing]]', new Map(), { enabled: true }, errors, routes);
  assert.match(html, /href="\/lab\/projects\/forecasting-visual-auras#method"/);
  assert.equal(errors.length, 1);
});

test('Wiki serialization retains URL history', () => {
  const text = serializeWikinote({ uid: 'same', slug: 'current', slugAliases: ['previous'], address: 'concept', name: 'concept', date: '2026-09-08' }, 'Body.', []);
  assert.match(text, /slug: current/);
  assert.match(text, /slugAliases: \["previous"\]/);
});

test('compiled public metadata uses canonical routes and Wiki payload identities', () => {
  const routes = createContentRoutes(routeEntries());
  const manifest = JSON.parse(fs.readFileSync('public/og-manifest.json', 'utf8'));
  const sitemap = fs.readFileSync('public/sitemap.xml', 'utf8');
  for (const file of readContentFiles().filter(f => !f.data.hidden)) {
    const canonical = routes.path(file.category, file.id);
    assert.ok(manifest[canonical], canonical);
    assert.ok(sitemap.includes(`https://infraphysics.net${canonical}</loc>`), canonical);
    if (file.category === 'wikinotes') {
      assert.equal(manifest[canonical].id, file.id);
      assert.ok(fs.existsSync(`public/wikinotes/${file.id}.json`));
    }
  }
});

test('edge redirects browsers and crawlers, preserves queries and fetches Wiki content by UID', async () => {
  const bundle = await build({ entryPoints: ['functions/[[catchall]].ts'], bundle: true, platform: 'node', format: 'esm', write: false });
  const { onRequest } = await import('data:text/javascript;base64,' + Buffer.from(bundle.outputFiles[0].text).toString('base64'));
  const routes = createContentRoutes(routeEntries());
  const fetched = [];
  const env = { ASSETS: { fetch: async request => {
    const url = new URL(request.url || request);
    fetched.push(url.pathname);
    if (url.pathname === '/og-manifest.json') return new Response(fs.readFileSync('public/og-manifest.json'));
    if (url.pathname.startsWith('/wikinotes/')) return new Response(fs.readFileSync('public' + url.pathname));
    return new Response('<html><head></head><body></body></html>', { headers: { 'content-type': 'text/html' } });
  } } };
  for (const [old, entry] of routes.byPath) if (old !== entry.canonical) {
    for (const ua of ['Mozilla/5.0', 'Googlebot']) {
      const response = await onRequest({ request: new Request('https://infraphysics.net' + old + '?via=test', { headers: { 'user-agent': ua } }), env });
      assert.equal(response.status, 301, old);
      assert.equal(response.headers.get('location'), 'https://infraphysics.net' + entry.canonical + '?via=test');
    }
  }
  assert.equal(fetched.length, 0, 'redirects precede all asset reads');
  const previous = globalThis.HTMLRewriter;
  globalThis.HTMLRewriter = class { on() { return this; } transform(response) { return response; } };
  try {
    const response = await onRequest({ request: new Request('https://infraphysics.net/wiki/economics', { headers: { 'user-agent': 'Googlebot' } }), env });
    assert.equal(response.status, 200);
    assert.ok(fetched.includes('/wikinotes/Economy1.json'));
  } finally { globalThis.HTMLRewriter = previous; }
});

test('Obsidian import keeps renamed source files, identities and slug history', () => {
  const root = path.resolve('room/content-slugs');
  fs.mkdirSync(root, { recursive: true });
  const fixture = fs.mkdtempSync(path.join(root, 'import-test-'));
  for (const file of ['scripts/obsidian-import.js', 'scripts/content-files.js', 'src/lib/content/routes.js']) {
    const target = path.join(fixture, file);
    fs.mkdirSync(path.dirname(target), { recursive: true }); fs.copyFileSync(file, target);
  }
  for (const cat of ['projects', 'essays', 'bits2bricks', 'wikinotes']) fs.mkdirSync(path.join(fixture, 'src/data/pages', cat), { recursive: true });
  const notes = path.join(fixture, 'src/data/pages/wikinotes');
  fs.writeFileSync(path.join(notes, 'current.md'), '---\nuid: Existing\nslug: current\nslugAliases: [previous]\naddress: concept\nname: concept\ndate: "2026-09-08"\n---\nBody.\n');
  const vault = path.join(fixture, 'vault'); fs.mkdirSync(vault);
  fs.writeFileSync(path.join(vault, 'concept.md'), '---\ninfraphysics-uid: Existing\ndate: "2026-09-08"\n---\nUpdated body.\n');
  fs.writeFileSync(path.join(vault, 'new concept.md'), '---\ndate: "2026-09-08"\n---\nNew body.\n');
  try {
    execFileSync(process.execPath, [path.join(fixture, 'scripts/obsidian-import.js'), vault], { cwd: fixture, stdio: 'pipe' });
    const current = matter(fs.readFileSync(path.join(notes, 'current.md'), 'utf8'));
    assert.equal(current.data.uid, 'Existing');
    assert.equal(current.data.slug, 'current');
    assert.deepEqual(current.data.slugAliases, ['previous']);
    assert.match(current.content, /Updated body/);
    assert.equal(fs.existsSync(path.join(notes, 'Existing.md')), false);
    const added = matter(fs.readFileSync(path.join(notes, 'new-concept.md'), 'utf8'));
    assert.equal(added.data.slug, 'new-concept');
    assert.match(added.data.uid, /^[a-zA-Z0-9]{8}$/);
  } finally {
    if (!path.resolve(fixture).startsWith(root + path.sep)) throw new Error('Unexpected fixture path');
    fs.rmSync(fixture, { recursive: true });
  }
});

test('slug renames preserve multiline YAML history, other metadata and body; repeated migration is a no-op', () => {
  const root = path.resolve('room/content-slugs');
  fs.mkdirSync(root, { recursive: true });
  const fixture = fs.mkdtempSync(path.join(root, 'rename-test-'));
  for (const file of ['scripts/rename-content-slug.js', 'scripts/migrate-content-slugs.js', 'scripts/content-files.js', 'src/lib/content/routes.js']) {
    const target = path.join(fixture, file);
    fs.mkdirSync(path.dirname(target), { recursive: true }); fs.copyFileSync(file, target);
  }
  for (const cat of ['projects', 'essays', 'bits2bricks', 'wikinotes']) fs.mkdirSync(path.join(fixture, 'src/data/pages', cat), { recursive: true });
  const notes = path.join(fixture, 'src/data/pages/wikinotes');
  const script = path.join(fixture, 'scripts/rename-content-slug.js');
  try {
    for (const newline of ['\n', '\r\n']) for (const indent of ['', '  ']) {
      const raw = ['---', 'uid: Existing', 'slug: current', 'slugAliases:', indent + '- previous', '# earlier public address', '', indent + '- oldest', 'address: concept', 'name: concept', 'date: "2026-09-08"', 'proper: true', 'aliases: [alternative]', '---', 'Body. Keep [[Existing|this]] unchanged.', ''].join(newline);
      const source = path.join(notes, 'current.md');
      const target = path.join(notes, 'renamed.md');
      fs.writeFileSync(source, raw);
      execFileSync(process.execPath, [script, 'wikinotes', 'Existing', 'renamed'], { cwd: fixture, stdio: 'pipe' });
      assert.equal(fs.readFileSync(source, 'utf8'), raw, 'dry run must not write');
      execFileSync(process.execPath, [script, 'wikinotes', 'Existing', 'renamed', '--apply'], { cwd: fixture, stdio: 'pipe' });
      assert.equal(fs.existsSync(source), false);
      const result = matter(fs.readFileSync(target, 'utf8'));
      const before = matter(raw);
      assert.deepEqual(result.data, { ...before.data, slug: 'renamed', slugAliases: ['previous', 'oldest', 'current'] });
      assert.equal(result.content, before.content);
      fs.unlinkSync(target);
    }
    fs.writeFileSync(path.join(notes, 'current.md'), '---\nuid: Existing\nslug: current\naddress: concept\n---\nBody.\n');
    const report = path.join(fixture, 'room/content-slugs/migration.json');
    fs.mkdirSync(path.dirname(report), { recursive: true }); fs.writeFileSync(report, 'original migration evidence');
    execFileSync(process.execPath, [path.join(fixture, 'scripts/migrate-content-slugs.js')], { cwd: fixture, stdio: 'pipe' });
    assert.equal(fs.readFileSync(report, 'utf8'), 'original migration evidence');
  } finally {
    if (!path.resolve(fixture).startsWith(root + path.sep)) throw new Error('Unexpected fixture path');
    fs.rmSync(fixture, { recursive: true });
  }
});
