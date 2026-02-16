import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { marked, Renderer } from 'marked';
import { load as loadYaml } from 'js-yaml';
import { fileURLToPath } from 'url';
import { createHash } from 'crypto';
import { createHighlighter } from 'shiki';
import { validateFieldnotes } from './validate-fieldnotes.js';
import { resolveIssues } from './resolve-issues.js';
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

// Strip all inline formatting from headings in parsed HTML.
// Headings must be plain text — no <code>, <em>, <strong>, <span>, etc.
function stripHeadingFormatting(html) {
  return html.replace(/<(h[1-4])(\s[^>]*)?>(.+?)<\/\1>/gi, (match, tag, attrs, inner) => {
    const plain = inner.replace(/<[^>]*>/g, '');
    return `<${tag}${attrs || ''}>${plain}</${tag}>`;
  });
}

// Auto-number <h1> headings sequentially (1. Title, 2. Title, ...)
function numberH1Headings(html) {
  let counter = 0;
  return html.replace(/<h1(\s[^>]*)?>(.+?)<\/h1>/gi, (match, attrs, inner) => {
    counter++;
    return `<h1${attrs || ''}>${counter}. ${inner}</h1>`;
  });
}

// Apply pre-processors (before marked.parse, on raw markdown)
// Heading lines (# …) are protected so no inline effect touches them.
function applyPreProcessors(markdown) {
  const headings = [];
  let result = markdown.replace(/^(#{1,4}\s+.*)$/gm, (line) => {
    headings.push(line);
    return `%%HEADING_${headings.length - 1}%%`;
  });
  for (const rule of compilerConfig.preProcessors) {
    result = result.replace(rule.pattern, rule.replace);
  }
  result = result.replace(/%%HEADING_(\d+)%%/g, (_, idx) => headings[parseInt(idx)]);
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

// ── Typed blockquotes {bkqt/TYPE}...{/bkqt} ──

const BKQT_TYPES = {
  note:       { label: 'Note' },
  tip:        { label: 'Tip' },
  warning:    { label: 'Warning' },
  danger:     { label: 'Danger' },
  keyconcept: { label: 'Key concept' },
  quote:      { label: null, isQuote: true },
  pullquote:  { label: null, isQuote: true },
};

function processBlockquoteContent(content, placeholders) {
  const paragraphs = content.split(/\n\n+/);
  const htmlParts = [];

  for (const para of paragraphs) {
    const trimmed = para.trim();
    if (!trimmed) continue;

    const restored = restoreBackticks(trimmed, placeholders);

    // Definition list: all "- " lines with ":: "
    if (/^- /.test(restored)) {
      const listLines = restored.split('\n').filter(l => l.trim());
      const allDefs = listLines.every(l => /^- .+?:: /.test(l));
      if (allDefs) {
        htmlParts.push('<div class="defn-list">' + listLines.map(line => {
          const m = line.match(/^- (.+?):: (.+)$/);
          if (!m) return `<p>${marked.parseInline(line)}</p>`;
          return `<p class="defn"><strong>${marked.parseInline(m[1].trim())}</strong> — ${marked.parseInline(m[2].trim())}</p>`;
        }).join('\n') + '</div>');
        continue;
      }
      htmlParts.push(marked.parse(restored));
      continue;
    }

    // Alphabetical list
    const alphaMatch = restored.match(/^([aA])\. /);
    if (alphaMatch) {
      const alphaLines = restored.split('\n').filter(l => l.trim());
      const isUpper = alphaMatch[1] === 'A';
      const startCode = (isUpper ? 'A' : 'a').charCodeAt(0);
      let sequential = true;
      for (let i = 0; i < alphaLines.length; i++) {
        if (!alphaLines[i].startsWith(String.fromCharCode(startCode + i) + '. ')) { sequential = false; break; }
      }
      if (sequential) {
        const type = isUpper ? 'A' : 'a';
        const items = alphaLines.map(l => `<li>${marked.parseInline(l.replace(/^[a-zA-Z]\. /, ''))}</li>`).join('');
        htmlParts.push(`<ol type="${type}">${items}</ol>`);
        continue;
      }
    }

    // Regular numbered list
    if (/^\d+\. /.test(restored)) {
      htmlParts.push(marked.parse(restored));
      continue;
    }

    const lines = restored.split('\n');

    if (lines.length === 1) {
      // Single line → normal paragraph
      htmlParts.push(marked.parse(restored));
    } else {
      // Multiple lines (single \n between them) → first line <p>, rest <p class="bkqt-cont">
      htmlParts.push(`<p>${marked.parseInline(lines[0])}</p>`);
      for (let i = 1; i < lines.length; i++) {
        htmlParts.push(`<p class="bkqt-cont">${marked.parseInline(lines[i])}</p>`);
      }
    }
  }

  return htmlParts.join('\n');
}

function processCustomBlockquotes(markdown, placeholders) {
  const typePattern = Object.keys(BKQT_TYPES).join('|');
  const regex = new RegExp(
    `^\\{bkqt\\/(${typePattern})(?:\\|([^}]*))?\\}\\s*\\n([\\s\\S]*?)\\n\\s*\\{\\/bkqt\\}`,
    'gm'
  );
  return markdown.replace(regex, (_, type, customLabel, content) => {
    const config = BKQT_TYPES[type];
    const body = processBlockquoteContent(content, placeholders);
    if (config.isQuote) {
      const attrib = customLabel ? `<span class="bkqt-attrib">${customLabel.trim()}</span>` : '';
      return `<div class="bkqt bkqt-${type}"><div class="bkqt-body">${body}${attrib}</div></div>`;
    }
    const label = customLabel ? customLabel.trim() : config.label;
    return `<div class="bkqt bkqt-${type}"><div class="bkqt-body"><span class="bkqt-label">${label}</span>${body}</div></div>`;
  });
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

const EXTERNAL_LINK_ICON = `<svg class="doc-ref-icon" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>`;

function processExternalUrls(markdown) {
  return markdown.replace(/\[\[(https?:\/\/[^\]|]+)(?:\|([^\]]+))?\]\]/g, (_, url, displayText) => {
    const href = url.trim();
    const display = displayText ? displayText.trim() : href;
    return `<a class="doc-ref doc-ref-external" href="${href}" target="_blank" rel="noopener noreferrer">${display} ${EXTERNAL_LINK_ICON}</a>`;
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

const CROSS_DOC_ICONS = {
  projects: `<svg class="doc-ref-icon" viewBox="0 0 24 24" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,
  threads: `<svg class="doc-ref-icon" viewBox="0 0 24 24" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>`,
  bits2bricks: `<svg class="doc-ref-icon" viewBox="0 0 24 24" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 1.5 2.5 3 6 3s6-1.5 6-3v-5"/></svg>`,
};

// uidToMeta map is set in main() before link processing runs
let _uidToMeta = new Map(); // uid → { address, name }

function processAllLinks(html) {
  if (!compilerConfig.wikiLinks.enabled) return html;

  return html.replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (match, ref, displayText) => {
    const crossDocMatch = ref.match(/^(projects|threads|bits2bricks)\/(.*)/);

    if (crossDocMatch) {
      const [, category, slug] = crossDocMatch;
      const config = CROSS_DOC_CATEGORIES[category];
      if (!config) return match;

      if (!displayText) {
        const msg = `cross-doc link [[${ref.trim()}]] missing display text — use [[${ref.trim()}|Display Text]]`;
        console.error(`  \x1b[31mERROR: ${msg}\x1b[0m`);
        buildErrors.push(msg);
        return match;
      }

      const href = `${config.path}/${slug.trim()}`;
      return `<a class="doc-ref doc-ref-${category}" href="${href}" target="_blank" rel="noopener noreferrer">${category}/${displayText.trim()}</a>`;
    }

    // UID-based wiki-ref
    // Pipe text is a readability hint when it matches meta.name — build always
    // uses the current name so renames propagate. Only truly different pipe text
    // (e.g. [[uid|other methods]]) is treated as a display override.
    const uid = ref.trim();
    const meta = _uidToMeta.get(uid);
    const currentName = meta ? meta.name : uid;
    const pipeText = displayText ? displayText.trim() : null;
    const display = pipeText && pipeText !== currentName ? pipeText : currentName;
    return `<a class="wiki-ref" data-uid="${uid}">${display}</a>`;
  });
}

// ── Inline annotations {{ref|explanation}} ──
// Runs on final HTML. Uses balanced-bracket parsing to handle nesting.
// First pass: <p> tags. Then loops over ann-note divs for sub-annotations.

function extractAnnotations(content) {
  const annotations = [];
  let counter = 0;
  let result = '';
  let i = 0;

  while (i < content.length) {
    if (content[i] === '{' && i + 1 < content.length && content[i + 1] === '{') {
      // Track depth to find the matching }}
      let depth = 1;
      let j = i + 2;
      let pipePos = -1;
      while (j < content.length && depth > 0) {
        if (content[j] === '{' && j + 1 < content.length && content[j + 1] === '{') {
          depth++;
          j += 2;
        } else if (content[j] === '}' && j + 1 < content.length && content[j + 1] === '}') {
          depth--;
          if (depth === 0) break;
          j += 2;
        } else {
          if (content[j] === '|' && depth === 1 && pipePos === -1) pipePos = j;
          j++;
        }
      }
      if (depth === 0 && pipePos !== -1) {
        counter++;
        const ref = content.substring(i + 2, pipePos);
        const explanation = content.substring(pipePos + 1, j);
        annotations.push({ num: counter, text: explanation.trim() });
        result += `<em class="ann-ref-text">${ref.trim()}</em><sup class="ann-ref">${counter}</sup>`;
        i = j + 2;
      } else {
        result += content[i];
        i++;
      }
    } else {
      result += content[i];
      i++;
    }
  }

  return { processed: result, annotations };
}

function processAnnotations(html) {
  // First pass: <p>, <li>, and <td> tags (outermost annotations extracted, inner ones stay in explanation text)
  let result = html.replace(/<(p|li|td)>([\s\S]*?)<\/\1>/g, (match, tag, inner) => {
    if (!inner.includes('{{')) return match;
    const { processed, annotations } = extractAnnotations(inner);
    if (annotations.length === 0) return match;
    const notesHtml = annotations.map(a =>
      `<div class="ann-note"><sup>${a.num}</sup>${a.text}</div>`
    ).join('');
    return `<${tag}>${processed}</${tag}>\n<div class="annotations">${notesHtml}</div>`;
  });

  // Nested passes: peel annotations inside ann-note divs level by level
  let changed = true;
  while (changed) {
    changed = false;
    result = result.replace(
      /<div class="ann-note">(<sup>\d+<\/sup>)((?:(?!<\/div>)[\s\S])*)<\/div>/g,
      (match, sup, content) => {
        if (!content.includes('{{')) return match;
        const { processed, annotations } = extractAnnotations(content);
        if (annotations.length === 0) return match;
        changed = true;
        const notesHtml = annotations.map(a =>
          `<div class="ann-note"><sup>${a.num}</sup>${a.text}</div>`
        ).join('');
        return `<div class="ann-note">${sup}${processed}</div>\n<div class="annotations annotations-nested">${notesHtml}</div>`;
      }
    );
  }

  return result;
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
<img src="${src}" alt="${alt}" class="img-side-img" style="${widthStyle}" loading="lazy">
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

// ── Definition lists (- TERM:: description) ──

function processDefinitionLists(markdown) {
  return markdown.replace(
    /^(- .+(?:\n- .+)*)/gm,
    (block) => {
      const lines = block.split('\n');
      const allDefs = lines.every(line => /^- .+?:: /.test(line));
      if (!allDefs) return block;

      return '<div class="defn-list">' + lines.map(line => {
        const match = line.match(/^- (.+?):: (.+)$/);
        if (!match) return line;
        const term = marked.parseInline(match[1].trim());
        const desc = marked.parseInline(match[2].trim());
        return `<p class="defn"><strong>${term}</strong> — ${desc}</p>`;
      }).join('\n') + '</div>';
    }
  );
}

// ── Alphabetical lists (a. / A.) ──

function processAlphabeticalLists(markdown) {
  return markdown.replace(
    /^([a-zA-Z])\. .+(?:\n[a-zA-Z]\. .+)*/gm,
    (block) => {
      const lines = block.split('\n');
      const firstChar = lines[0][0];
      const isUpper = firstChar >= 'A' && firstChar <= 'Z';
      const startCode = (isUpper ? 'A' : 'a').charCodeAt(0);

      if (firstChar !== 'a' && firstChar !== 'A') return block;
      for (let i = 0; i < lines.length; i++) {
        const expected = String.fromCharCode(startCode + i);
        if (!lines[i].startsWith(expected + '. ')) return block;
      }

      const type = isUpper ? 'A' : 'a';
      const items = lines.map(l => {
        const content = l.replace(/^[a-zA-Z]\. /, '');
        return `<li>${marked.parseInline(content)}</li>`;
      }).join('');
      return `<ol type="${type}">${items}</ol>`;
    }
  );
}

// ── Context annotations (>> YY.MM.DD - text) ──

const MONTH_NAMES = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'];

function computeRelativeTime(articleDateStr, yy, mm, dd) {
  if (!articleDateStr) return null;
  const articleDate = new Date(articleDateStr);
  if (isNaN(articleDate.getTime())) return null;
  const annotDate = new Date(2000 + parseInt(yy, 10), parseInt(mm, 10) - 1, parseInt(dd, 10));

  const diffMs = annotDate.getTime() - articleDate.getTime();

  // Same day (within 24h to account for timezone construction differences)
  if (Math.abs(diffMs) < 86400000) return '(day zero)';

  // Determine direction and compute from→to diff
  const isLater = diffMs > 0;
  const [from, to] = isLater ? [articleDate, annotDate] : [annotDate, articleDate];

  let years = to.getFullYear() - from.getFullYear();
  let months = to.getMonth() - from.getMonth();
  let days = to.getDate() - from.getDate();
  if (days < 0) { months--; days += new Date(to.getFullYear(), to.getMonth(), 0).getDate(); }
  if (months < 0) { years--; months += 12; }
  const parts = [];
  if (years > 0) parts.push(`${years}y`);
  if (months > 0) parts.push(`${months}m`);
  if (days > 0) parts.push(`${days}d`);
  if (parts.length === 0) return null;
  return `(${parts.join(' ')} ${isLater ? 'later' : 'earlier'})`;
}

function processContextAnnotations(markdown, articleDate) {
  return markdown.replace(
    /^(>> \d{2}\.\d{2}\.\d{2} - .+(?:\n>> \d{2}\.\d{2}\.\d{2} - .+)*)/gm,
    (block) => {
      const lines = block.split('\n');
      const entries = lines.map(line => {
        const m = line.match(/^>> (\d{2})\.(\d{2})\.(\d{2}) - (.+)$/);
        if (!m) return '';
        const [, yy, mm, dd, text] = m;
        const monthIdx = parseInt(mm, 10) - 1;
        const monthName = MONTH_NAMES[monthIdx] || mm;
        const dateDisplay = `${yy} · ${monthName} ${dd}`;
        const relative = computeRelativeTime(articleDate, yy, mm, dd);
        const relativeHtml = relative ? `<span class="ctx-note-relative">${relative}</span>` : '';
        const parsedText = marked.parseInline(text.trim());
        return `<div class="ctx-note-entry"><div class="ctx-note-date-row"><span class="ctx-note-date">${dateDisplay}</span>${relativeHtml}</div><span class="ctx-note-text">${parsedText}</span></div>`;
      });
      const html = entries.filter(Boolean).join('<hr class="ctx-note-divider">');
      return `<div class="ctx-note"><img src="https://avatars.githubusercontent.com/yago-mendoza" alt="" class="ctx-note-avatar" /><div class="ctx-note-body">${html}</div></div>`;
    }
  );
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
  langs: ['typescript', 'javascript', 'python', 'rust', 'go', 'yaml', 'json', 'html', 'css', 'bash'],
});

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
    date: frontmatter.date,
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
      // Skip fieldnotes/ — handled separately by processFieldnotesDir()
      // Skip FinBoard/ — source material, not content
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

// ── Shared compilation pipeline ──
// Both regular posts and fieldnotes use this exact 14-step pipeline.

function compileMarkdown(rawMd, articleDate) {
  rawMd = rawMd.replace(/\r\n/g, '\n');
  const { text, placeholders } = protectBackticks(rawMd);
  const withSyntax = applyPreProcessors(text);
  const withBkqt = processCustomBlockquotes(withSyntax, placeholders);
  const restored = restoreBackticks(withBkqt, placeholders);
  const withUrls = processExternalUrls(restored);
  const withSide = preprocessSideImages(withUrls);
  const withDefs = processDefinitionLists(withSide);
  const withAlpha = processAlphabeticalLists(withDefs);
  const withCtx = processContextAnnotations(withAlpha, articleDate);
  const parsed = marked.parse(withCtx);
  const clean = stripHeadingFormatting(parsed);
  const numbered = numberH1Headings(clean);
  const highlighted = highlightCodeBlocks(numbered, highlighter);
  const postProcessed = applyPostProcessors(highlighted);
  return processOutsideCode(postProcessed, processAnnotations);
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

  const date = frontmatter.date || '';
  const id = uid;
  const addressParts = address.split('//').map(s => s.trim());
  const name = frontmatter.name || addressParts[addressParts.length - 1];
  const displayTitle = name;

  // Optional frontmatter fields
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
    // Strip pipe display text (e.g. [[uid|custom text]] → uid)
    const raw = match[1];
    const pipeIdx = raw.indexOf('|');
    refsSet.add(pipeIdx !== -1 ? raw.slice(0, pipeIdx).trim() : raw);
  }
  const references = [...refsSet];

  // Trailing refs — support annotated form: [[uid]] :: annotation
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

  // Strip trailing refs (and preceding blank lines) from body before compiling
  let contentMd = bodyMd;
  if (trailingRefStart < bodyLines.length) {
    let cutoff = trailingRefStart;
    while (cutoff > 0 && !bodyLines[cutoff - 1].trim()) cutoff--;
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
// This always runs on all content — link targets may change when notes are added/removed
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
    // Files were modified — stale data in memory, skip writing outputs
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
  };
}
for (const note of fieldnotesIndex) {
  const urlPath = `/lab/second-brain/${note.id}`;
  ogManifest[urlPath] = {
    t: note.title,
    d: note.description || '',
    img: null,
    cat: 'fieldnotes',
  };
}

const OG_MANIFEST_FILE = path.join(__dirname, '../public/og-manifest.json');
fs.writeFileSync(OG_MANIFEST_FILE, JSON.stringify(ogManifest));

console.log(`Generated ${linkedRegularPosts.length} posts → ${OUTPUT_FILE}`);
console.log(`Generated ${linkedFieldnotePosts.length} fieldnotes → ${FIELDNOTES_INDEX_FILE} + public/fieldnotes/`);
console.log(`Generated ${Object.keys(categories).length} categories → ${CATEGORIES_OUTPUT}`);
console.log(`Generated ${Object.keys(ogManifest).length} entries → ${OG_MANIFEST_FILE}`);
