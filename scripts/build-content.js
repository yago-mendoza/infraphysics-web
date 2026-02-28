import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { marked, Renderer } from 'marked';
import { load as loadYaml } from 'js-yaml';
import { fileURLToPath } from 'url';
import { createHash } from 'crypto';
import { createHighlighter } from 'shiki';
import { validateFieldnotes } from '../src/lib/content/validate.js';
import {
  compileMarkdown as _compileMarkdown,
  processAllLinks as _processAllLinks,
  processOutsideCode,
  LANG_THEMES,
  DEFAULT_THEMES,
} from '../src/lib/content/compile.js';
import { resolveIssues } from './resolve-issues.js';
import compilerConfig from './compiler.config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ── marked configuration (renderer stays here — it uses compilerConfig) ──

const customRenderer = new Renderer();
const { titlePattern, classMap } = compilerConfig.imagePositions;

customRenderer.blockquote = function(token) {
  const body = this.parser.parse(token.tokens);
  return `<div class="small-text">${body}</div>\n`;
};

customRenderer.image = function({ href, title, text }) {
  let className = '';
  let style = '';
  let finalTitle = title;

  if (title) {
    const positionMatch = title.match(titlePattern);
    if (positionMatch) {
      const position = positionMatch[1];
      const width = positionMatch[2];
      className = classMap[position] || '';
      if (width && position !== 'full') style = `width: ${width};`;
      finalTitle = null;
    }
  }

  let alt = text || '';
  let caption = '';
  if (alt.includes('|')) {
    const pipeIndex = alt.indexOf('|');
    caption = alt.slice(pipeIndex + 1).trim();
    alt = alt.slice(0, pipeIndex).trim();
  }

  const styleAttr = style ? ` style="${style}"` : '';
  const titleAttr = finalTitle ? ` title="${finalTitle}"` : '';

  if (caption) {
    const figClass = className ? ` class="${className}"` : '';
    const imgTag = `<img src="${href}" alt="${alt}"${styleAttr}${titleAttr} loading="lazy" />`;
    return `<figure${figClass}>${imgTag}<figcaption>${caption}</figcaption></figure>`;
  }

  const classAttr = className ? ` class="${className}"` : '';
  const imgTag = `<img src="${href}" alt="${alt}"${classAttr}${styleAttr}${titleAttr} loading="lazy" />`;
  return imgTag;
};

marked.setOptions({
  renderer: customRenderer,
  ...compilerConfig.marked,
});

// ── Shiki highlighter ──

const allThemes = new Set([DEFAULT_THEMES.dark, DEFAULT_THEMES.light]);
for (const t of Object.values(LANG_THEMES)) {
  allThemes.add(t.dark);
  allThemes.add(t.light);
}

const highlighter = await createHighlighter({
  themes: [...allThemes],
  langs: ['typescript', 'javascript', 'python', 'rust', 'go', 'yaml', 'json', 'html', 'css', 'bash'],
});

// ── Build errors ──
const buildErrors = [];

// ── Local wrappers that bind the shared functions to this build's config ──

function compileMarkdown(rawMd, articleDate) {
  return _compileMarkdown(rawMd, articleDate, {
    markedInstance: marked,
    compilerConfig,
    highlighter,
  });
}

// uidToMeta is set in main() before link processing runs
let _uidToMeta = new Map();

function processAllLinks(html) {
  return _processAllLinks(html, _uidToMeta, compilerConfig.wikiLinks, buildErrors);
}

// ── File I/O ──

const PAGES_DIR = path.join(__dirname, '../src/data/pages');
const OUTPUT_FILE = path.join(__dirname, '../src/data/posts.generated.json');
const CATEGORIES_OUTPUT = path.join(__dirname, '../src/data/categories.generated.json');

function processMarkdownFile(filePath) {
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const { data: frontmatter, content } = matter(fileContent);

  const htmlContent = compileMarkdown(content, frontmatter.date);

  return {
    id: frontmatter.id,
    title: frontmatter.title || frontmatter.id,
    displayTitle: frontmatter.displayTitle,
    category: frontmatter.category,
    date: frontmatter.date ? (frontmatter.date instanceof Date ? frontmatter.date.toISOString().slice(0, 10) : String(frontmatter.date).slice(0, 10)) : '',
    thumbnail: frontmatter.thumbnail || null,
    thumbnailAspect: frontmatter.thumbnailAspect || null,
    thumbnailShading: frontmatter.thumbnailShading || null,
    description: frontmatter.description,
    content: htmlContent,
    status: frontmatter.status || null,
    technologies: frontmatter.technologies || null,
    tags: frontmatter.tags || null,
    github: frontmatter.github || null,
    demo: frontmatter.demo || null,
    caseStudy: frontmatter.caseStudy || null,
    duration: frontmatter.duration || null,
    featured: frontmatter.featured || null,
    author: frontmatter.author || null,
    subtitle: frontmatter.subtitle || null,
    lead: frontmatter.lead || null,
    tldr: frontmatter.tldr || null,
    related: frontmatter.related || null,
  };
}

function loadCategoryConfig(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  return loadYaml(content);
}

function getAllMarkdownFiles(dir, isRoot = false) {
  const files = [];
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      if (item === 'fieldnotes' || item === 'FinBoard') continue;
      files.push(...getAllMarkdownFiles(fullPath));
    } else if (!isRoot && item.endsWith('.md') && !item.startsWith('_') && item !== 'README.md') {
      files.push(fullPath);
    }
  }

  return files;
}

function getAllCategoryConfigs(dir) {
  const configs = {};
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      const configPath = path.join(fullPath, '_category.yaml');
      if (fs.existsSync(configPath)) {
        const config = loadCategoryConfig(configPath);
        configs[config.name] = config;
      }
    }
  }

  return configs;
}

// --- Fieldnotes: read individual .md files ---

function extractFieldnoteMeta(filename, filePath) {
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const { data: frontmatter, content: bodyMd } = matter(fileContent);

  const address = frontmatter.address;
  if (!address) {
    console.error(`  \x1b[31mERROR: ${filename} missing 'address' in frontmatter\x1b[0m`);
    buildErrors.push(`${filename} missing 'address' in frontmatter`);
    return null;
  }

  const uid = frontmatter.uid;
  if (!uid) {
    console.error(`  \x1b[31mERROR: ${filename} missing 'uid' in frontmatter\x1b[0m`);
    buildErrors.push(`${filename} missing 'uid' in frontmatter`);
    return null;
  }

  const date = frontmatter.date ? (frontmatter.date instanceof Date ? frontmatter.date.toISOString().slice(0, 10) : String(frontmatter.date).slice(0, 10)) : '';
  const id = uid;
  const addressParts = address.split('//').map(s => s.trim());
  const name = frontmatter.name || addressParts[addressParts.length - 1];
  const displayTitle = name;

  const aliases = frontmatter.aliases || null;
  const supersedes = frontmatter.supersedes || null;
  const distinct = frontmatter.distinct || null;

  const bodyLines = bodyMd.split('\n');
  const firstTextLine = bodyLines.find(l => {
    const trimmed = l.trim();
    return trimmed && !trimmed.startsWith('#') && !trimmed.startsWith('!');
  });
  const description = firstTextLine
    ? firstTextLine.trim().replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (_m, ref, pipe) => pipe ? pipe.trim() : ref.trim())
    : '';

  const refRegex = /\[\[([^\]]+)\]\]/g;
  const refsSet = new Set();
  let match;
  while ((match = refRegex.exec(bodyMd)) !== null) {
    const raw = match[1];
    const pipeIdx = raw.indexOf('|');
    refsSet.add(pipeIdx !== -1 ? raw.slice(0, pipeIdx).trim() : raw);
  }
  const references = [...refsSet];

  const trailingRefs = [];
  const singleRefAnnotated = /^\s*\[\[([^\]]+)\]\]\s*::\s*(.+)\s*$/;
  const multiRefLine = /^\s*(\[\[[^\]]+\]\]\s*)+$/;
  let trailingRefStart = bodyLines.length;
  for (let i = bodyLines.length - 1; i >= 0; i--) {
    const line = bodyLines[i].trim();
    if (!line) continue;
    const annotatedMatch = singleRefAnnotated.exec(line);
    if (annotatedMatch) {
      const raw = annotatedMatch[1].trim();
      const pipeIdx = raw.indexOf('|');
      trailingRefs.push({ uid: pipeIdx !== -1 ? raw.slice(0, pipeIdx).trim() : raw, annotation: annotatedMatch[2].trim() });
      trailingRefStart = i;
    } else if (multiRefLine.test(line)) {
      const lineRefRegex = /\[\[([^\]]+)\]\]/g;
      let lineMatch;
      while ((lineMatch = lineRefRegex.exec(line)) !== null) {
        const raw = lineMatch[1].trim();
        const pipeIdx = raw.indexOf('|');
        trailingRefs.push({ uid: pipeIdx !== -1 ? raw.slice(0, pipeIdx).trim() : raw, annotation: null });
      }
      trailingRefStart = i;
    } else {
      break;
    }
  }

  let contentMd = bodyMd;
  if (trailingRefStart < bodyLines.length) {
    let cutoff = trailingRefStart;
    while (cutoff > 0 && !bodyLines[cutoff - 1].trim()) cutoff--;
    if (cutoff > 0 && /^-{3,}$/.test(bodyLines[cutoff - 1].trim())) cutoff--;
    contentMd = bodyLines.slice(0, cutoff).join('\n');
  }

  const preLinkHtml = compileMarkdown(contentMd.trim(), date);
  const searchText = preLinkHtml.replace(/<[^>]*>/g, '').toLowerCase();

  return {
    metadata: { id, title: address, displayTitle, name, category: 'fieldnotes', date, description, address, addressParts, references, trailingRefs, searchText, aliases, supersedes, distinct },
    preLinkHtml,
  };
}

// ── Unified incremental cache ──

const CACHE_FILE = path.join(__dirname, '../.content-cache.json');

function computeConfigHash() {
  const configContent = fs.readFileSync(path.join(__dirname, 'compiler.config.js'), 'utf-8');
  return createHash('sha256').update(configContent).digest('hex').slice(0, 16);
}

function loadCache() {
  try {
    if (!fs.existsSync(CACHE_FILE)) return null;
    return JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8'));
  } catch { return null; }
}

function saveCache(cache) {
  fs.writeFileSync(CACHE_FILE, JSON.stringify(cache));
}

// --- Cached regular posts ---

function processRegularPosts(cache, configHash, forceRebuild) {
  const files = getAllMarkdownFiles(PAGES_DIR, true);
  const cacheValid = cache?.version === 1 && cache?.configHash === configHash && !forceRebuild;
  const cached = cacheValid ? (cache.posts || {}) : {};
  const newCache = {};
  const results = [];
  let hits = 0, compiled = 0;

  for (const filePath of files) {
    const key = path.relative(PAGES_DIR, filePath).replace(/\\/g, '/');
    const mtime = fs.statSync(filePath).mtimeMs;
    if (cached[key]?.mtime === mtime) {
      newCache[key] = cached[key];
      results.push(cached[key].result);
      hits++;
    } else {
      const result = processMarkdownFile(filePath);
      newCache[key] = { mtime, result };
      results.push(result);
      compiled++;
    }
  }
  console.log(`  Posts: ${compiled} compiled, ${hits} cached`);
  return { results, cachePosts: newCache };
}

// --- Cached fieldnotes ---

function processFieldnotesDir(cache, configHash, forceRebuild) {
  const fieldnotesDir = path.join(PAGES_DIR, 'fieldnotes');
  if (!fs.existsSync(fieldnotesDir)) return { results: [], cacheFieldnotes: {} };

  const files = fs.readdirSync(fieldnotesDir)
    .filter(f => f.endsWith('.md') && !f.startsWith('_') && f !== 'README.md');

  const cacheValid = cache?.version === 1 && cache?.configHash === configHash && !forceRebuild;
  const cachedNotes = cacheValid ? (cache.fieldnotes || {}) : {};

  let hits = 0, compiled = 0;
  const newCache = {};
  const results = [];

  for (const filename of files) {
    const filePath = path.join(fieldnotesDir, filename);
    const mtime = fs.statSync(filePath).mtimeMs;
    const entry = cachedNotes[filename];

    if (entry && entry.mtime === mtime) {
      newCache[filename] = entry;
      results.push({ ...entry.metadata, content: entry.preLinkHtml });
      hits++;
    } else {
      const result = extractFieldnoteMeta(filename, filePath);
      if (!result) continue;
      newCache[filename] = { mtime, metadata: result.metadata, preLinkHtml: result.preLinkHtml };
      results.push({ ...result.metadata, content: result.preLinkHtml });
      compiled++;
    }
  }
  console.log(`  Fieldnotes: ${compiled} compiled, ${hits} cached`);
  return { results, cacheFieldnotes: newCache };
}

// ── Main ──

console.log('Building content...');

const FIELDNOTES_INDEX_FILE = path.join(__dirname, '../src/data/fieldnotes-index.generated.json');
const FIELDNOTES_CONTENT_DIR = path.join(__dirname, '../public/fieldnotes');

const forceRebuild = process.argv.includes('--force');
const interactive = process.argv.includes('--interactive');
const configHash = computeConfigHash();
const cache = loadCache();

const { results: regularPosts, cachePosts } = processRegularPosts(cache, configHash, forceRebuild);
const { results: fieldnotePosts, cacheFieldnotes } = processFieldnotesDir(cache, configHash, forceRebuild);

// Duplicate UID detection
const seenUids = new Map();
for (const post of fieldnotePosts) {
  if (seenUids.has(post.id)) {
    const msg = `duplicate fieldnote UID "${post.id}" — addresses "${seenUids.get(post.id)}" and "${post.address}"`;
    console.error(`  \x1b[31mERROR: ${msg}\x1b[0m`);
    buildErrors.push(msg);
  } else {
    seenUids.set(post.id, post.address);
  }
}

// Save unified cache
saveCache({ version: 1, configHash, posts: cachePosts, fieldnotes: cacheFieldnotes });

// Build uidToMeta map for processAllLinks display resolution
const uidToMeta = new Map();
for (const post of fieldnotePosts) {
  uidToMeta.set(post.id, { address: post.address, name: post.name || post.displayTitle });
}

// Set uidToMeta for processAllLinks
_uidToMeta = uidToMeta;

// Apply unified [[link]] processing to all content (skipping <code> blocks)
const linkedRegularPosts = regularPosts.map(post => ({
  ...post,
  content: processOutsideCode(post.content, processAllLinks),
}));
const linkedFieldnotePosts = fieldnotePosts.map(post => ({
  ...post,
  content: processOutsideCode(post.content, processAllLinks),
  trailingRefs: (post.trailingRefs || []).map(r => r.annotation ? { ...r, annotation: processAllLinks(r.annotation) } : r),
}));

const categories = getAllCategoryConfigs(PAGES_DIR);

// Validate fieldnotes + wiki-links (uses combined set for cross-reference checks)
const allLinkedPosts = [...linkedRegularPosts, ...linkedFieldnotePosts];
const validation = validateFieldnotes(fieldnotePosts, allLinkedPosts, compilerConfig.validation);

const totalErrors = buildErrors.length + validation.errors;
if (totalErrors > 0) {
  console.error(`\x1b[31mBuild failed with ${totalErrors} error(s)\x1b[0m`);
  process.exit(1);
}

// Interactive resolver — prompt user to fix promptable issues
if (interactive && validation.issues.some(i => i.promptable)) {
  const { filesModified } = await resolveIssues(validation.issues);
  if (filesModified > 0) {
    console.log('Skipping output generation — rebuild needed after fixes.');
    process.exit(0);
  }
}

// Output 1: posts.generated.json (regular posts only — no fieldnotes)
fs.writeFileSync(OUTPUT_FILE, JSON.stringify(linkedRegularPosts, null, 2));

// Output 2: fieldnotes-index.generated.json (metadata only — no content)
const fieldnotesIndex = linkedFieldnotePosts.map(({ content, searchText, ...meta }) => ({ ...meta, searchText }));
fs.writeFileSync(FIELDNOTES_INDEX_FILE, JSON.stringify(fieldnotesIndex, null, 2));

// Output 3: public/fieldnotes/{id}.json (individual content files)
if (!fs.existsSync(FIELDNOTES_CONTENT_DIR)) {
  fs.mkdirSync(FIELDNOTES_CONTENT_DIR, { recursive: true });
}

const currentIds = new Set();
for (const post of linkedFieldnotePosts) {
  currentIds.add(post.id);
  const contentFile = path.join(FIELDNOTES_CONTENT_DIR, `${post.id}.json`);
  fs.writeFileSync(contentFile, JSON.stringify({ content: post.content }));
}

// Clean stale content files
const existingFiles = fs.readdirSync(FIELDNOTES_CONTENT_DIR).filter(f => f.endsWith('.json'));
for (const file of existingFiles) {
  const id = file.replace('.json', '');
  if (!currentIds.has(id)) {
    fs.unlinkSync(path.join(FIELDNOTES_CONTENT_DIR, file));
    console.log(`  Removed stale: ${file}`);
  }
}

fs.writeFileSync(CATEGORIES_OUTPUT, JSON.stringify(categories, null, 2));

// Output 5: public/og-manifest.json (OG metadata for social previews)
const BLOG_CATS = new Set(['threads', 'bits2bricks']);
const catGroup = (cat) => BLOG_CATS.has(cat) ? 'blog' : 'lab';

const ogManifest = {};
for (const post of linkedRegularPosts) {
  const urlPath = `/${catGroup(post.category)}/${post.category}/${post.id}`;
  ogManifest[urlPath] = {
    t: post.title,
    d: post.description || '',
    img: post.thumbnail || null,
    cat: post.category,
    date: post.date || null,
  };
}
for (const note of fieldnotesIndex) {
  const urlPath = `/lab/second-brain/${note.id}`;
  ogManifest[urlPath] = {
    t: note.title,
    d: note.description || '',
    img: null,
    cat: 'fieldnotes',
    date: note.date || null,
  };
}

const OG_MANIFEST_FILE = path.join(__dirname, '../public/og-manifest.json');
fs.writeFileSync(OG_MANIFEST_FILE, JSON.stringify(ogManifest));

// Output 6b: public/fieldnotes-index.json (HTTP-fetchable copy of the index)
const FIELDNOTES_INDEX_PUBLIC = path.join(__dirname, '../public/fieldnotes-index.json');
fs.writeFileSync(FIELDNOTES_INDEX_PUBLIC, JSON.stringify(fieldnotesIndex));

// Output 7: public/sitemap.xml
const SITE_URL = 'https://infraphysics.net';
const SITEMAP_FILE = path.join(__dirname, '../public/sitemap.xml');
const staticPages = [
  { loc: '/home', priority: '1.0', changefreq: 'weekly' },
  { loc: '/about', priority: '0.8', changefreq: 'monthly' },
  { loc: '/contact', priority: '0.5', changefreq: 'yearly' },
  { loc: '/lab/projects', priority: '0.9', changefreq: 'weekly' },
  { loc: '/lab/second-brain', priority: '0.8', changefreq: 'daily' },
  { loc: '/blog/threads', priority: '0.9', changefreq: 'weekly' },
  { loc: '/blog/bits2bricks', priority: '0.9', changefreq: 'weekly' },
];

const sitemapEntries = [];
for (const page of staticPages) {
  sitemapEntries.push(`  <url><loc>${SITE_URL}${page.loc}</loc><changefreq>${page.changefreq}</changefreq><priority>${page.priority}</priority></url>`);
}
for (const post of linkedRegularPosts) {
  const urlPath = `/${catGroup(post.category)}/${post.category}/${post.id}`;
  const lastmod = post.date ? `<lastmod>${post.date.slice(0, 10)}</lastmod>` : '';
  sitemapEntries.push(`  <url><loc>${SITE_URL}${urlPath}</loc>${lastmod}<changefreq>monthly</changefreq><priority>0.7</priority></url>`);
}
for (const note of fieldnotesIndex) {
  const urlPath = `/lab/second-brain/${note.id}`;
  const lastmod = note.date ? `<lastmod>${note.date.slice(0, 10)}</lastmod>` : '';
  sitemapEntries.push(`  <url><loc>${SITE_URL}${urlPath}</loc>${lastmod}<changefreq>weekly</changefreq><priority>0.5</priority></url>`);
}

const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapEntries.join('\n')}\n</urlset>\n`;
fs.writeFileSync(SITEMAP_FILE, sitemapXml);

console.log(`Generated ${linkedRegularPosts.length} posts → ${OUTPUT_FILE}`);
console.log(`Generated ${linkedFieldnotePosts.length} fieldnotes → ${FIELDNOTES_INDEX_FILE} + public/fieldnotes/`);
console.log(`Generated ${Object.keys(categories).length} categories → ${CATEGORIES_OUTPUT}`);
console.log(`Generated ${Object.keys(ogManifest).length} entries → ${OG_MANIFEST_FILE}`);
console.log(`Generated sitemap (${sitemapEntries.length} URLs) → ${SITEMAP_FILE}`);

// Output 6: graph-relevance.generated.json (PageRank + proximity + shared neighbors)
await import('./compute-graph-relevance.js');
