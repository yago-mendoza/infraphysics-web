import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { marked, Renderer } from 'marked';
import { load as loadYaml } from 'js-yaml';
import { fileURLToPath } from 'url';
import { createHighlighter, bundledLanguages } from 'shiki';
import { validateFieldnotes } from './validate-fieldnotes.js';
import compilerConfig from './compiler.config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Custom renderer for images with positioning (center/full only - left/right handled by preprocessor)
const customRenderer = new Renderer();
const { titlePattern, classMap } = compilerConfig.imagePositions;

// Override blockquote renderer — > produces small text, not blockquotes
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

  // Figcaption support: ![alt|Caption text](url "position")
  let alt = text || '';
  let caption = '';
  if (alt.includes('|')) {
    const pipeIndex = alt.indexOf('|');
    caption = alt.slice(pipeIndex + 1).trim();
    alt = alt.slice(0, pipeIndex).trim();
  }

  const classAttr = className ? ` class="${className}"` : '';
  const styleAttr = style ? ` style="${style}"` : '';
  const titleAttr = finalTitle ? ` title="${finalTitle}"` : '';

  const imgTag = `<img src="${href}" alt="${alt}"${classAttr}${styleAttr}${titleAttr} />`;

  if (caption) {
    return `<figure>${imgTag}<figcaption>${caption}</figcaption></figure>`;
  }

  return imgTag;
};

marked.setOptions({
  renderer: customRenderer,
  ...compilerConfig.marked,
});

// Apply pre-processors (before marked.parse, on raw markdown)
function applyPreProcessors(markdown) {
  let result = markdown;
  for (const rule of compilerConfig.preProcessors) {
    result = result.replace(rule.pattern, rule.replace);
  }
  return result;
}

// ── Backtick protection ──
// Shields inline code and fenced code blocks from pre-processors

function protectBackticks(markdown) {
  const placeholders = [];

  // 1. Fenced code blocks (``` ... ```)
  let result = markdown.replace(/```[\s\S]*?```/g, (match) => {
    placeholders.push(match);
    return `%%CBLK_${placeholders.length - 1}%%`;
  });

  // 2. Inline code — double backticks then single
  result = result.replace(/``[^`]+``|`[^`\n]+`/g, (match) => {
    placeholders.push(match);
    return `%%CBLK_${placeholders.length - 1}%%`;
  });

  return { text: result, placeholders };
}

function restoreBackticks(text, placeholders) {
  return text.replace(/%%CBLK_(\d+)%%/g, (_, idx) => placeholders[parseInt(idx)]);
}

// ── Copy button icon ──

const COPY_ICON = `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`;
const COPY_BTN = `<button class="copy-btn" aria-label="Copiar">${COPY_ICON} Copiar</button>`;

// ── Typed blockquotes {bkqt:type:text} ──

const BKQT_TYPES = {
  note:       { label: 'Note' },
  tip:        { label: 'Tip' },
  warning:    { label: 'Warning' },
  danger:     { label: 'Danger' },
  deepdive:   { label: 'Deep dive' },
  keyconcept: { label: 'Key concept' },
};

function processCustomBlockquotes(markdown, placeholders) {
  return markdown.replace(
    /\{bkqt\/(note|tip|warning|danger|deepdive|keyconcept)(?:\|([^:]*))?\:([\s\S]*?)\}/g,
    (_, type, customLabel, text) => {
      const config = BKQT_TYPES[type];
      const label = customLabel ? customLabel.trim() : config.label;
      const withNewlines = text.trim()
        .replace(/\/n(?=\s*(?:- |\d+\. ))/g, '\n')
        .replace(/\/n/g, '\n\n');
      const restored = restoreBackticks(withNewlines, placeholders);
      const body = marked.parse(restored);
      return `<div class="bkqt bkqt-${type}"><div class="bkqt-header"><span class="bkqt-label">${label}/</span>${COPY_BTN}</div><div class="bkqt-body">${body}</div></div>`;
    }
  );
}

// ── HTML code-segment protection ──
// Wraps a processing function so it skips <pre> and <code> content

function processOutsideCode(html, fn) {
  const segments = [];
  let safe = html.replace(/<pre[\s\S]*?<\/pre>|<code[\s\S]*?<\/code>/g, (match) => {
    segments.push(match);
    return `%%CSEG_${segments.length - 1}%%`;
  });
  safe = fn(safe);
  return safe.replace(/%%CSEG_(\d+)%%/g, (_, idx) => segments[parseInt(idx)]);
}

// ── External URL links [[https://...|text]] ──
// Processed BEFORE marked.parse to prevent URL auto-linking corruption

function processExternalUrls(markdown) {
  return markdown.replace(/\[\[(https?:\/\/[^\]|]+)(?:\|([^\]]+))?\]\]/g, (_, url, displayText) => {
    const href = url.trim();
    const display = displayText ? displayText.trim() : href;
    return `<a class="doc-ref doc-ref-external" href="${href}" target="_blank" rel="noopener noreferrer">${display}</a>`;
  });
}

// ── Unified [[link]] processing ──
// All [[...]] links are processed in a single pass.
// Address pattern determines the type:
//   projects/slug, threads/slug, bits2bricks/slug → cross-doc link (display text required)
//   anything else (word, parent//child)           → second-brain wiki-ref

const buildErrors = [];

const CROSS_DOC_CATEGORIES = {
  projects:    { path: '/lab/projects' },
  threads:     { path: '/blog/threads' },
  bits2bricks: { path: '/blog/bits2bricks' },
};

function processAllLinks(html) {
  if (!compilerConfig.wikiLinks.enabled) return html;

  return html.replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (match, address, displayText) => {
    const crossDocMatch = address.match(/^(projects|threads|bits2bricks)\/(.*)/);

    if (crossDocMatch) {
      const [, category, slug] = crossDocMatch;
      const config = CROSS_DOC_CATEGORIES[category];
      if (!config) return match;

      if (!displayText) {
        const msg = `cross-doc link [[${address.trim()}]] missing display text — use [[${address.trim()}|Display Text]]`;
        console.error(`  \x1b[31mERROR: ${msg}\x1b[0m`);
        buildErrors.push(msg);
        return match;
      }

      const href = `${config.path}/${slug.trim()}`;
      return `<a class="doc-ref doc-ref-${category}" href="${href}">${displayText.trim()}</a>`;
    }

    // Second-brain wiki-ref
    const segments = address.split('//');
    const display = displayText ? displayText.trim() : segments[segments.length - 1].trim();
    return `<a class="wiki-ref" data-address="${address}">${display}</a>`;
  });
}

// Apply post-processors (after marked.parse, on HTML)
function applyPostProcessors(html) {
  let result = html;
  for (const rule of compilerConfig.postProcessors) {
    result = result.replace(rule.pattern, rule.replace);
  }
  return result;
}

// Preprocess markdown to handle side-by-side image layouts
// Pattern: ![alt](src "left|right:width") followed by text lines until empty line
function preprocessSideImages(markdown) {
  const blocks = markdown.split(/\n\n+/);
  const result = [];

  for (const block of blocks) {
    // Match image with left/right position at start of block
    const match = block.match(/^!\[([^\]]*)\]\(([^\s)]+)(?:\s+"(left|right):?(\d+px)?")?\)([\s\S]*)/);

    if (match && (match[3] === 'left' || match[3] === 'right')) {
      const [, alt, src, position, width, restOfBlock] = match;
      const widthStyle = width ? `width: ${width};` : '';

      // Get text lines after the image (same block = no empty line between)
      const textLines = restOfBlock.trim().split('\n').filter(l => l.trim());

      if (textLines.length > 0) {
        // Process each line through marked for inline formatting (bold, italic, links, etc.)
        const paragraphs = textLines.map(line => {
          const processed = marked.parseInline(line);
          return `<p>${processed}</p>`;
        }).join('\n');

        // Create flexbox container with image and text side by side
        result.push(`<div class="img-side-layout img-side-${position}">
<img src="${src}" alt="${alt}" class="img-side-img" style="${widthStyle}">
<div class="img-side-content">
${paragraphs}
</div>
</div>`);
      } else {
        // No text after image, let marked handle it normally
        result.push(block);
      }
    } else {
      result.push(block);
    }
  }

  return result.join('\n\n');
}

// ── Shiki syntax highlighting ──

// Per-language theme pairs (dark key → --shiki-dark, light key → --shiki-light)
const LANG_THEMES = {
  typescript: { dark: 'one-dark-pro',      light: 'one-light'        },
  javascript: { dark: 'one-dark-pro',      light: 'one-light'        },
  python:     { dark: 'catppuccin-mocha',  light: 'catppuccin-latte' },
  rust:       { dark: 'rose-pine',         light: 'rose-pine-dawn'   },
  go:         { dark: 'min-dark',          light: 'min-light'        },
  yaml:       { dark: 'github-dark',       light: 'github-light'     },
  json:       { dark: 'github-dark',       light: 'github-light'     },
};
const DEFAULT_THEMES = { dark: 'vitesse-dark', light: 'vitesse-light' };

function decodeHtmlEntities(str) {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function highlightCodeBlocks(html, highlighter) {
  // Code blocks with language tag
  html = html.replace(
    /<pre><code class="language-(\w+)">([\s\S]*?)<\/code><\/pre>/g,
    (_match, lang, escapedCode) => {
      const rawCode = decodeHtmlEntities(escapedCode).replace(/\n$/, '');
      const langLabel = lang.toUpperCase();
      const themes = LANG_THEMES[lang] || DEFAULT_THEMES;

      let codeContent;
      try {
        const highlighted = highlighter.codeToHtml(rawCode, {
          lang,
          themes,
          defaultColor: false,
        });
        const inner = highlighted.match(/<code>([\s\S]*?)<\/code>/);
        codeContent = inner ? inner[1] : escapedCode;
      } catch {
        codeContent = escapedCode;
      }

      return `<div class="code-terminal"><div class="code-terminal-bar"><div class="code-terminal-dots"><span></span><span></span><span></span></div><div class="code-terminal-right"><span class="code-terminal-lang">${langLabel}</span>${COPY_BTN}</div></div><pre><code class="language-${lang}">${codeContent}</code></pre></div>`;
    }
  );

  // Code blocks without language tag
  html = html.replace(
    /<pre><code(?!\s+class="language-)>([\s\S]*?)<\/code><\/pre>/g,
    (_match, code) => {
      return `<div class="code-terminal"><div class="code-terminal-bar"><div class="code-terminal-dots"><span></span><span></span><span></span></div><div class="code-terminal-right"><span class="code-terminal-lang"></span>${COPY_BTN}</div></div><pre><code>${code}</code></pre></div>`;
    }
  );

  return html;
}

// Collect all themes needed and create highlighter
const allThemes = new Set([DEFAULT_THEMES.dark, DEFAULT_THEMES.light]);
for (const t of Object.values(LANG_THEMES)) {
  allThemes.add(t.dark);
  allThemes.add(t.light);
}

const highlighter = await createHighlighter({
  themes: [...allThemes],
  langs: Object.keys(bundledLanguages),
});

const PAGES_DIR = path.join(__dirname, '../src/data/pages');
const OUTPUT_FILE = path.join(__dirname, '../src/data/posts.generated.json');
const CATEGORIES_OUTPUT = path.join(__dirname, '../src/data/categories.generated.json');
const HOME_FEATURED_OUTPUT = path.join(__dirname, '../src/data/home-featured.generated.json');

function processMarkdownFile(filePath) {
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const { data: frontmatter, content } = matter(fileContent);

  // Pipeline: protect → preProcessors → bkqt (with placeholders) → restore → externalUrls → sideImages → marked → shiki → postProcessors
  const { text: safeContent, placeholders } = protectBackticks(content);
  const withCustomSyntax = applyPreProcessors(safeContent);
  const withBkqt = processCustomBlockquotes(withCustomSyntax, placeholders);
  const restored = restoreBackticks(withBkqt, placeholders);
  const withExternalUrls = processExternalUrls(restored);
  const withSideImages = preprocessSideImages(withExternalUrls);
  const parsed = marked.parse(withSideImages);
  const highlighted = highlightCodeBlocks(parsed, highlighter);
  const htmlContent = applyPostProcessors(highlighted);

  return {
    id: frontmatter.id,
    title: frontmatter.title,
    displayTitle: frontmatter.displayTitle,
    category: frontmatter.category,
    date: frontmatter.date,
    thumbnail: frontmatter.thumbnail || null,
    description: frontmatter.description,
    content: htmlContent,
    status: frontmatter.status || null,
    technologies: frontmatter.technologies || null,
    tags: frontmatter.tags || null,
    github: frontmatter.github || null,
    demo: frontmatter.demo || null,
    duration: frontmatter.duration || null,
    featured: frontmatter.featured || null,
    author: frontmatter.author || null,
    subtitle: frontmatter.subtitle || null,
    notes: frontmatter.notes || null,
  };
}

function loadCategoryConfig(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  return loadYaml(content);
}

function getAllMarkdownFiles(dir) {
  const files = [];
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      files.push(...getAllMarkdownFiles(fullPath));
    } else if (item.endsWith('.md') && !item.startsWith('_')) {
      // Skip _fieldnotes.md and other _*.md files
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

// --- Fieldnotes: parse _fieldnotes.md ---

function processFieldnotesFile() {
  const fieldnotesDir = path.join(PAGES_DIR, 'fieldnotes');
  if (!fs.existsSync(fieldnotesDir)) return [];

  // Find _*.md files (not _category.yaml)
  const dirFiles = fs.readdirSync(fieldnotesDir);
  const fieldnotesFile = dirFiles.find(f => f.startsWith('_') && f.endsWith('.md'));
  if (!fieldnotesFile) return [];

  const filePath = path.join(fieldnotesDir, fieldnotesFile);
  const content = fs.readFileSync(filePath, 'utf-8');
  const blocks = content.split(/\n---\n/).map(b => b.trim()).filter(Boolean);

  return blocks.map(block => {
    const lines = block.split('\n');
    const address = lines[0].trim();
    const bodyLines = lines.slice(1);
    const bodyMd = bodyLines.join('\n').trim();

    // Generate ID: lowercase, // → --, / → -, space → -
    const id = address.toLowerCase().replace(/\/\//g, '--').replace(/\//g, '-').replace(/\s+/g, '-');

    // Address parts
    const addressParts = address.split('//').map(s => s.trim());
    const displayTitle = addressParts[addressParts.length - 1];

    // Description: first non-empty, non-heading, non-image text line
    const firstTextLine = bodyLines.find(l => {
      const trimmed = l.trim();
      return trimmed && !trimmed.startsWith('#') && !trimmed.startsWith('!');
    });
    const description = firstTextLine
      ? firstTextLine.trim().replace(/\[\[([^\]]+)\]\]/g, (_m, addr) => addr.split('//').pop().trim())
      : '';

    // Extract ALL [[...]] references from body markdown
    const refRegex = /\[\[([^\]]+)\]\]/g;
    const references = [];
    let match;
    while ((match = refRegex.exec(bodyMd)) !== null) {
      references.push(match[1]);
    }

    // Extract trailing refs (standalone [[...]] lines at end of block)
    const trailingRefs = [];
    const trailingRefPattern = /^\s*(\[\[[^\]]+\]\]\s*)+$/;
    for (let i = bodyLines.length - 1; i >= 0; i--) {
      const line = bodyLines[i].trim();
      if (!line) continue;
      if (trailingRefPattern.test(line)) {
        const lineRefRegex = /\[\[([^\]]+)\]\]/g;
        let lineMatch;
        while ((lineMatch = lineRefRegex.exec(line)) !== null) {
          trailingRefs.push(lineMatch[1]);
        }
      } else {
        break;
      }
    }

    // Pipeline: protect → preProcessors → bkqt (with placeholders) → restore → externalUrls → sideImages → marked → shiki → postProcessors
    const { text: safeBody, placeholders } = protectBackticks(bodyMd);
    const withCustomSyntax = applyPreProcessors(safeBody);
    const withBkqt = processCustomBlockquotes(withCustomSyntax, placeholders);
    const restoredBody = restoreBackticks(withBkqt, placeholders);
    const withExternalUrls = processExternalUrls(restoredBody);
    const withSideImages = preprocessSideImages(withExternalUrls);
    const parsed = marked.parse(withSideImages);
    const highlighted = highlightCodeBlocks(parsed, highlighter);
    const htmlContent = applyPostProcessors(highlighted);

    return {
      id,
      title: address,
      displayTitle,
      category: 'fieldnotes',
      date: '',
      thumbnail: null,
      description,
      content: htmlContent,
      address,
      addressParts,
      references,
      trailingRefs,
    };
  });
}

// Main
console.log('Building content...');

const markdownFiles = getAllMarkdownFiles(PAGES_DIR);
const regularPosts = markdownFiles.map(processMarkdownFile);
const fieldnotePosts = processFieldnotesFile();

// Apply unified [[link]] processing to all posts (skipping <code> content)
const allPosts = [...regularPosts, ...fieldnotePosts].map(post => ({
  ...post,
  content: processOutsideCode(post.content, processAllLinks),
}));

const categories = getAllCategoryConfigs(PAGES_DIR);

// Validate fieldnotes + wiki-links
const validation = validateFieldnotes(fieldnotePosts, allPosts, compilerConfig.validation);

const totalErrors = buildErrors.length + validation.errors;
if (totalErrors > 0) {
  console.error(`\x1b[31mBuild failed with ${totalErrors} error(s)\x1b[0m`);
  process.exit(1);
}

// --- Home featured posts ---

const homeFeaturedPath = path.join(PAGES_DIR, 'home', '_home-featured.yaml');
let homeFeatured = { featured: [] };

if (fs.existsSync(homeFeaturedPath)) {
  const raw = loadYaml(fs.readFileSync(homeFeaturedPath, 'utf-8'));
  homeFeatured = raw;
}

fs.writeFileSync(OUTPUT_FILE, JSON.stringify(allPosts, null, 2));
fs.writeFileSync(CATEGORIES_OUTPUT, JSON.stringify(categories, null, 2));
fs.writeFileSync(HOME_FEATURED_OUTPUT, JSON.stringify(homeFeatured, null, 2));

console.log(`Generated ${allPosts.length} posts → ${OUTPUT_FILE}`);
console.log(`Generated ${Object.keys(categories).length} categories → ${CATEGORIES_OUTPUT}`);
console.log(`Generated home featured config → ${HOME_FEATURED_OUTPUT}`);
