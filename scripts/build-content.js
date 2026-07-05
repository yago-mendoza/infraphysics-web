import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { marked, Renderer } from 'marked';
import { load as loadYaml } from 'js-yaml';
import { fileURLToPath } from 'url';
import { createHash } from 'crypto';
import { createHighlighter } from 'shiki';
import katex from 'katex';
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

  // Escape HTML-significant chars so a quote/angle in the alt or caption can't break
  // the attribute or inject a tag (e.g. an alt with "double quotes" silently truncated
  // the whole figure). Not `&` — marked may already entity-encode it; avoid double-escaping.
  const esc = (s) => s.replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  alt = esc(alt);
  caption = esc(caption);

  const styleAttr = style ? ` style="${style}"` : '';
  const titleAttr = finalTitle ? ` title="${esc(finalTitle)}"` : '';

  if (caption) {
    const figClass = className ? ` class="${className}"` : '';
    const imgTag = `<img src="${href}" alt="${alt}"${styleAttr}${titleAttr} loading="lazy" />`;
    return `<figure${figClass}>${imgTag}<figcaption>${caption}</figcaption></figure>`;
  }

  const classAttr = className ? ` class="${className}"` : '';
  const imgTag = `<img src="${href}" alt="${alt}"${classAttr}${styleAttr}${titleAttr} loading="lazy" />`;
  return imgTag;
};

// Regular markdown links. Playground/static-HTML links open in a new tab by
// default (they are self-contained pages served outside the SPA).
customRenderer.link = function({ href, title, tokens }) {
  const text = this.parser.parseInline(tokens);
  const titleAttr = title ? ` title="${title.replace(/"/g, '&quot;')}"` : '';
  const newTab = /^https?:\/\//.test(href) || /^\/playgrounds\//.test(href) || /\.html($|[?#])/.test(href);
  const tabAttr = newTab ? ' target="_blank" rel="noopener noreferrer"' : '';
  return `<a href="${href}"${titleAttr}${tabAttr}>${text}</a>`;
};

customRenderer.table = function(token) {
  let headerCells = '';
  for (const cell of token.header) headerCells += this.tablecell(cell);
  const headerRow = this.tablerow({ text: headerCells });

  let bodyRows = '';
  for (const row of token.rows) {
    let rowCells = '';
    for (const cell of row) rowCells += this.tablecell(cell);
    bodyRows += this.tablerow({ text: rowCells });
  }

  const body = bodyRows ? `<tbody>${bodyRows}</tbody>` : '';
  return `<div class="table-wrapper"><table><thead>${headerRow}</thead>${body}</table></div>\n`;
};

marked.setOptions({
  renderer: customRenderer,
  ...compilerConfig.marked,
});

// Strikethrough is DOUBLE-tilde only (~~text~~); a single `~` is ALWAYS literal.
// marked's built-in strikethrough fires on a lone `~`, which silently corrupts two
// unrelated tildes into a malformed <del> that truncates the whole article in the
// browser (no build error). Two sources of stray single tildes make this a real trap:
// KaTeX emits `~` in MathML (\tilde), and authors write `~` for "approximately"
// (`~30W`, `~$6`). This inline extension intercepts every `~` before the built-in
// tokenizer can: `~~…~~` → <del>, a lone `~` → literal text. See SYNTAX.md + CLAUDE.md.
marked.use({
  extensions: [{
    name: 'strictStrikethrough',
    level: 'inline',
    start(src) { const i = src.indexOf('~'); return i < 0 ? undefined : i; },
    tokenizer(src) {
      const dbl = /^~~(?=\S)([\s\S]*?\S)~~/.exec(src);
      if (dbl) {
        return { type: 'del', raw: dbl[0], text: dbl[1], tokens: this.lexer.inlineTokens(dbl[1]) };
      }
      if (src[0] === '~') {
        return { type: 'text', raw: '~', text: '~' };
      }
      return undefined;
    },
  }],
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
    katex,
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
    thumbnailFocus: frontmatter.thumbnailFocus ?? null,
    description: frontmatter.description || frontmatter.subtitle || '',
    content: htmlContent,
    status: frontmatter.status || null,
    technologies: frontmatter.technologies || null,
    accent: frontmatter.accent || null,
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
    lang: frontmatter.lang || null,
    complexity: frontmatter.complexity || null,
    hidden: frontmatter.hidden || false,
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
  const listRefAnnotated = /^\s*-\s*\[\[([^\]]+)\]\]\s*:\s*:\s*(.+)\s*$/;
  const listRefBare = /^\s*-\s*\[\[([^\]]+)\]\]\s*$/;
  const legacySingleRef = /^\s*\[\[([^\]]+)\]\]\s*::\s*(.+)\s*$/;
  const legacyMultiRef = /^\s*(\[\[[^\]]+\]\]\s*)+$/;
  let trailingRefStart = bodyLines.length;
  for (let i = bodyLines.length - 1; i >= 0; i--) {
    const line = bodyLines[i].trim();
    if (!line) continue;
    const listAnnotatedMatch = listRefAnnotated.exec(line);
    if (listAnnotatedMatch) {
      const raw = listAnnotatedMatch[1].trim();
      const pipeIdx = raw.indexOf('|');
      trailingRefs.push({ uid: pipeIdx !== -1 ? raw.slice(0, pipeIdx).trim() : raw, annotation: listAnnotatedMatch[2].trim() });
      trailingRefStart = i;
    } else if (listRefBare.test(line)) {
      const m = listRefBare.exec(line);
      const raw = m[1].trim();
      const pipeIdx = raw.indexOf('|');
      trailingRefs.push({ uid: pipeIdx !== -1 ? raw.slice(0, pipeIdx).trim() : raw, annotation: null });
      trailingRefStart = i;
    } else if (legacySingleRef.test(line)) {
      const m = legacySingleRef.exec(line);
      const raw = m[1].trim();
      const pipeIdx = raw.indexOf('|');
      trailingRefs.push({ uid: pipeIdx !== -1 ? raw.slice(0, pipeIdx).trim() : raw, annotation: m[2].trim() });
      trailingRefStart = i;
    } else if (legacyMultiRef.test(line)) {
      const lineRefRegex = /\[\[([^\]]+)\]\]/g;
      let lineMatch;
      while ((lineMatch = lineRefRegex.exec(line)) !== null) {
        const raw = lineMatch[1].trim();
        const pipeIdx = raw.indexOf('|');
        trailingRefs.push({ uid: pipeIdx !== -1 ? raw.slice(0, pipeIdx).trim() : raw, annotation: null });
      }
      trailingRefStart = i;
    } else if (/^#{1,2}\s*interactions\s*$/i.test(line)) {
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

  // Fieldnotes use breaks:true — single newline → <br>, double newline → new <p>
  marked.setOptions({ ...compilerConfig.marked, breaks: true });
  const preLinkHtml = compileMarkdown(contentMd.trim(), date);
  marked.setOptions(compilerConfig.marked); // restore
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

// ── Syntax guard: detect custom-syntax tokens that survived compilation ──
// These render as literal text instead of styled blocks (e.g. an unclosed {bkqt}),
// which the compiler does NOT treat as an error. Non-fatal warnings, code blocks ignored.
const SYNTAX_GUARD = [
  { re: /\{\/?bkqt\b[^}]*\}/, label: 'literal {bkqt} tag — unclosed or malformed blockquote' },
  { re: /\{\/?math\}/,        label: 'literal {math} tag — unclosed math block' },
  { re: /\{shout:[^}]*\}/,    label: 'literal {shout:…} tag' },
  { re: /\{dots\}/,           label: 'literal {dots} tag' },
  { re: /\[\[[^\]\n]+\]\]/,   label: 'unresolved [[wiki-link]]' },
  { re: /\]\((?:https?:\/\/|\/)[^)\s]+(?:\s+"[^"]*")?\)/, label: 'literal markdown link/image survived (a [[wiki-link]] or stray "]" inside an alt/caption breaks the image)' },
];
let syntaxWarnings = 0;
for (const post of allLinkedPosts) {
  // strip code/pre regions, where these tokens can legitimately appear as examples
  const scan = String(post.content || '')
    .replace(/<pre[\s\S]*?<\/pre>/g, '')
    .replace(/<code[\s\S]*?<\/code>/g, '');
  for (const { re, label } of SYNTAX_GUARD) {
    const m = scan.match(re);
    if (!m) continue;
    if (syntaxWarnings === 0) console.log('\n\x1b[1m[SYNTAX]\x1b[0m \x1b[90mscripts/build-content.js\x1b[0m');
    const where = post.address || post.id || post.displayTitle || '?';
    console.log(`  \x1b[33mWARN \x1b[0m  [LITERAL_TAG] ${label} in "${where}" → ${m[0].slice(0, 60)}`);
    syntaxWarnings++;
  }
}
if (syntaxWarnings > 0) {
  console.log('\n  \x1b[90mLegend:\x1b[0m');
  console.log('  \x1b[90m  LITERAL_TAG — custom syntax leaked into output (check for a missing closing tag)\x1b[0m');
  console.log(`\x1b[1m[SYNTAX]\x1b[0m \x1b[33m${syntaxWarnings} warning(s)\x1b[0m`);
}

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

// HTML → plain text (strip tags, decode entities, collapse whitespace)
function htmlToText(html) {
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(?:p|div|h[1-6]|li|tr|blockquote)>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]+/g, ' ')
    .trim();
}

const ogManifest = {};

// Static pages — enables OG/schema injection for non-article routes
ogManifest['/home'] = {
  t: 'InfraPhysics',
  d: 'Yago Mendoza — industrial engineer, systems builder. From systems to atoms and back. Lab, notebook, and proof of work.',
  img: null,
  cat: null,
  date: null,
  text: `InfraPhysics — Yago Mendoza, industrial engineer and systems builder.

From systems to atoms and back. I picked up code because every engineer should — not to become a developer, but to move faster. Now I build at the boundary. This is my lab, my notebook, and my proof of work.

Yago Mendoza writes about machine learning infrastructure, distributed systems, scaling laws, AI alignment, and cross-domain pattern recognition. His work emphasizes that engineering principles transfer across substrates — supply chains and data pipelines follow the same optimization patterns.

Site sections:

Projects — Engineering projects with technical deep-dives. InfraPhysics Web (custom markdown compiler, wiki-link knowledge graph, AI-assisted development) and FinBoard (zero-dependency personal finance dashboard).

Threads — Long-form essays on technology, AI, economics, and systems thinking. Topics include transformer architecture, AI alignment, Rust and memory safety, AI agent security, scaling laws, reward hacking, and the neuroscience of learning.

Bits2Bricks — Technical tutorials bridging software and physical engineering. How LLMs learn (SFT, DPO, RL, RLHF), transformers from scratch, and AI agent containment.

Second Brain — Knowledge graph of 300+ interconnected atomic concept notes covering machine learning, hardware architecture, blockchain, distributed systems, and optimization. Each note is one concept with bidirectional wiki-links.

Contact: contact@infraphysics.net | GitHub: github.com/yago-mendoza | LinkedIn: linkedin.com/in/yago-mendoza | X: x.com/ymdatweets`,
};
ogManifest['/about'] = {
  t: 'About — Yago Mendoza',
  d: 'Yago Mendoza — industrial engineer who bridges hardware and software. Machine learning, distributed systems, scaling laws, and cross-domain pattern recognition.',
  img: null,
  cat: null,
  date: null,
  text: `Yago Mendoza — Industrial Engineer & Systems Builder

"My competitive advantage is that I'm having fun."

I'm into building things and making them move faster. I use AI to unlock compute, document everything I learn, and publish it here — because building in public is how I think best, and if it helps make complex topics more approachable along the way, even better.

The Convergence

I learned to build by watching systems fail. My industrial engineering training: design from the failure point backward — find the bottleneck, then architect around it. Hardware and software aren't separate worlds to me; they're two sides of the same constraint. The critical problems live where bits meet atoms.

The Work

Those worlds are converging faster than anyone expected. AI, infrastructure, distributed systems. This is where I build. I'm drawn to problems where software meets physical limits. Whether it's in a hyperscale data center or a constrained edge device, I want to understand the physics, not just abstract it away.

The Record

This site is a living, interconnected record. I document the process because clear thinking requires writing it down. I'm not an expert in any of this — I'm a generalist who stacks knowledge across domains and connects the dots. This site reflects that: work in progress, not finished reference.

What I Believe

- To truly build, you have to understand the full stack — not just your slice of it. Removing black boxes, from hardware to the models running on it, is what gives you real agency over what you're building.
- The bottleneck is rarely software — it's physics. We cannot cheat thermodynamics. The real work is building infrastructure that satisfies physical constraints at scale, from data centers to edge devices.
- Intelligence should be as ubiquitous and invisible as electricity. Making compute a silent, fundamental resource — that's the infrastructure I want to build.
- Complexity is debt, not progress. The instinct to question what exists before optimizing it — to ask why before how — matters more than any specific skill.
- The patterns that scale are the ones that transfer. The same structural thinking that optimizes a supply chain can redesign a data pipeline — not because the tools overlap, but because the constraints do.
- In a world of infinite problems and finite time, passion is the only sustainable filter. I work on what I can't stop thinking about — because that's the only way to outlast hard problems. Obsession compounds.
- The future is bright.

Beyond the Stack

I study how organizations scale, how technologies fail, and how to make hard things feel simple. Patterns surface everywhere. The best engineers I know aren't just good at code — they're good at understanding why systems exist the way they do.

Outside of engineering, I try to keep things simple. I read because good writing forces clear thinking, and I write to figure out what I actually believe. Most of what I learn gets documented because patterns are easier to catch when they're on paper.

Contact: contact@infraphysics.net
GitHub: https://github.com/yago-mendoza
LinkedIn: https://linkedin.com/in/yago-mendoza
X: https://x.com/ymdatweets`,
};

for (const post of linkedRegularPosts) {
  const urlPath = `/${catGroup(post.category)}/${post.category}/${post.id}`;
  ogManifest[urlPath] = {
    t: post.displayTitle || post.title,
    d: post.description || '',
    img: post.thumbnail || null,
    cat: post.category,
    date: post.date || null,
    text: htmlToText(post.content),
  };
}

// Section listing pages — so crawlers see article directories
const sectionListings = {
  '/blog/threads': { t: 'Threads', d: 'Long-form essays on technology, AI, economics, and systems thinking by Yago Mendoza.' },
  '/blog/bits2bricks': { t: 'Bits2Bricks', d: 'Technical tutorials bridging software and physical engineering by Yago Mendoza.' },
  '/lab/projects': { t: 'Projects', d: 'Engineering projects with technical deep-dives by Yago Mendoza.' },
  '/lab/second-brain': { t: 'Second Brain', d: 'Knowledge graph of 300+ interconnected concept notes on ML, hardware, blockchain, and systems.' },
};
for (const [urlPath, meta] of Object.entries(sectionListings)) {
  const sectionCat = urlPath.split('/').pop();
  const sectionPosts = linkedRegularPosts.filter(p => p.category === sectionCat);
  const listing = sectionPosts.map(p => `- ${p.displayTitle || p.title}: ${p.description || ''}`).join('\n');
  ogManifest[urlPath] = {
    t: meta.t,
    d: meta.d,
    img: null,
    cat: null,
    date: null,
    text: listing || undefined,
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

// Output 8: public/feed.xml (RSS feed for AI aggregators and readers)
const FEED_FILE = path.join(__dirname, '../public/feed.xml');
const feedItems = linkedRegularPosts
  .filter(p => p.date)
  .sort((a, b) => b.date.localeCompare(a.date))
  .slice(0, 30)
  .map(p => {
    const urlPath = `/${catGroup(p.category)}/${p.category}/${p.id}`;
    const pubDate = new Date(p.date).toUTCString();
    const desc = (p.description || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const titleEsc = (p.displayTitle || p.title || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return `    <item>
      <title>${titleEsc}</title>
      <link>${SITE_URL}${urlPath}</link>
      <guid>${SITE_URL}${urlPath}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${desc}</description>
      <category>${p.category}</category>
    </item>`;
  });

const feedXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>InfraPhysics</title>
    <link>${SITE_URL}</link>
    <description>From systems to atoms and back. Lab, notebook, and proof of work by Yago Mendoza.</description>
    <language>en</language>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml" />
${feedItems.join('\n')}
  </channel>
</rss>
`;
fs.writeFileSync(FEED_FILE, feedXml);

// Output 9: public/llms-full.txt (full content for LLM crawlers)
const LLMS_FULL_FILE = path.join(__dirname, '../public/llms-full.txt');
const llmsFullSections = linkedRegularPosts
  .filter(p => p.date)
  .sort((a, b) => b.date.localeCompare(a.date))
  .map(p => {
    const urlPath = `${SITE_URL}/${catGroup(p.category)}/${p.category}/${p.id}`;
    const plainText = htmlToText(p.content);
    return `## ${p.displayTitle || p.title}\n\nURL: ${urlPath}\nCategory: ${p.category}\nDate: ${p.date}\nDescription: ${p.description || ''}\n\n${plainText}`;
  });

const llmsFullContent = `# InfraPhysics — Full Content

> All published articles by Yago Mendoza — industrial engineer and systems builder.
> For a summary, see /llms.txt

---

${llmsFullSections.join('\n\n---\n\n')}
`;
fs.writeFileSync(LLMS_FULL_FILE, llmsFullContent);

// Output 10: public/llms.txt (curated summary + auto-generated article listings)
const LLMS_FILE = path.join(__dirname, '../public/llms.txt');
const llmsListing = (cat) => linkedRegularPosts
  .filter(p => p.category === cat && p.date)
  .sort((a, b) => b.date.localeCompare(a.date))
  .map(p => {
    const urlPath = `${SITE_URL}/${catGroup(p.category)}/${p.category}/${p.id}`;
    const desc = p.description ? `: ${p.description}` : '';
    return `- [${p.displayTitle || p.title}](${urlPath})${desc}`;
  })
  .join('\n');

const llmsContent = `# InfraPhysics

> Personal lab, notebook, and knowledge graph by Yago Mendoza -- industrial engineer and systems builder.

## About

Yago Mendoza is an industrial engineer who bridges hardware and software. He writes about machine learning infrastructure, distributed systems, scaling laws, AI alignment, and cross-domain pattern recognition. His work emphasizes that engineering principles transfer across substrates -- supply chains and data pipelines follow the same optimization patterns.

Tagline: "From systems to atoms and back. Engineering is engineering. The substrate doesn't matter."

## Site Structure

- /home -- Landing page and navigation hub
- /about -- Background, beliefs, and expertise areas
- /lab/projects -- Engineering projects with technical deep-dives
- /lab/second-brain -- Knowledge graph of ${linkedFieldnotePosts.length}+ interconnected concept notes
- /lab/second-brain/graph -- Visual graph explorer
- /blog/threads -- Long-form essays on technology, AI, economics, and systems thinking
- /blog/bits2bricks -- Technical tutorials bridging software and physical engineering

## Projects

${llmsListing('projects')}

## Threads (Essays)

${llmsListing('threads')}

## Bits2Bricks (Tutorials)

${llmsListing('bits2bricks')}

## Second Brain (Knowledge Graph)

${linkedFieldnotePosts.length}+ atomic concept notes covering machine learning, hardware architecture, blockchain, distributed systems, and optimization. Each note is one concept with bidirectional wiki-links. The graph reveals structural relationships between domains. Explorable at /lab/second-brain and /lab/second-brain/graph.

## Contact

- Email: contact@infraphysics.net
- GitHub: https://github.com/yago-mendoza
- LinkedIn: https://linkedin.com/in/yago-mendoza
- X: https://x.com/ymdatweets
`;
fs.writeFileSync(LLMS_FILE, llmsContent);

console.log(`Generated ${linkedRegularPosts.length} posts → ${OUTPUT_FILE}`);
console.log(`Generated ${linkedFieldnotePosts.length} fieldnotes → ${FIELDNOTES_INDEX_FILE} + public/fieldnotes/`);
console.log(`Generated ${Object.keys(categories).length} categories → ${CATEGORIES_OUTPUT}`);
console.log(`Generated ${Object.keys(ogManifest).length} entries → ${OG_MANIFEST_FILE}`);
console.log(`Generated sitemap (${sitemapEntries.length} URLs) → ${SITEMAP_FILE}`);
console.log(`Generated RSS feed (${feedItems.length} items) → ${FEED_FILE}`);

// Output 6: graph-relevance.generated.json (PageRank + proximity + shared neighbors)
await import('./compute-graph-relevance.js');
