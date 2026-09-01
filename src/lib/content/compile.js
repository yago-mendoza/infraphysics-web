// Shared markdown compilation pipeline
// Used by both build-content.js (Node, with Shiki) and the browser editor (without Shiki).
//
// All functions are pure — no module-level state, no fs, no Node APIs.
// The `compileMarkdown` function accepts an options object with:
//   - highlighter: Shiki instance (null = skip highlighting)
//   - uidToMeta: Map<uid, {address, name}> for wiki-link resolution
//   - compilerConfig: the compiler.config.js object (pre/post processors, etc.)
//   - marked: the configured marked instance
//
// ── Protection order ──
// The small set of inline preprocessors runs on raw markdown and can
// collide with syntax they don't own. Three zones are shielded with placeholders
// BEFORE preprocessors execute:
//
//   1. %%CBLK_N%%    — fenced & inline code (protectBackticks, before everything)
//   2. %%HEADING_N%% — ATX headings (inside applyPreProcessors)
//   3. %%MATH_N%%    — {math}...{/math} blocks & \(...\) inline (inside applyPreProcessors)
//
// If you add a preprocessor that touches `_`, `{`, `\(`, or any character used
// by math/code/headings, verify it doesn't invade these protected zones.
// Placeholders are restored after preprocessors finish, before marked.parse.

// ── Copy button icon (used in code terminal blocks) ──
const COPY_ICON = `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`;
const COPY_BTN = `<button class="copy-btn" aria-label="Copy">${COPY_ICON} Copy</button>`;

// ── Backtick protection ──

export function protectBackticks(markdown) {
  const placeholders = [];
  let result = markdown.replace(/```[\s\S]*?```/g, (match) => {
    placeholders.push(match);
    return `%%CBLK_${placeholders.length - 1}%%`;
  });
  result = result.replace(/``[^`]+``|`[^`\n]+`/g, (match) => {
    placeholders.push(match);
    return `%%CBLK_${placeholders.length - 1}%%`;
  });
  return { text: result, placeholders };
}

export function restoreBackticks(text, placeholders) {
  return text.replace(/%%CBLK_(\d+)%%/g, (_, idx) => placeholders[parseInt(idx)]);
}

// ── Pre-processors ──

export function applyPreProcessors(markdown, preProcessors) {
  const headings = [];
  let result = markdown.replace(/^(#{1,4}\s+.*)$/gm, (line) => {
    headings.push(line);
    return `%%HEADING_${headings.length - 1}%%`;
  });
  // Protect math expressions from preprocessors (e.g. underline eating _subscripts_)
  const mathBlocks = [];
  result = result.replace(/\{math\}\n[\s\S]*?\n\{\/math\}/g, (match) => {
    mathBlocks.push(match);
    return `%%MATH_${mathBlocks.length - 1}%%`;
  });
  result = result.replace(/\\\(.+?\\\)/g, (match) => {
    mathBlocks.push(match);
    return `%%MATH_${mathBlocks.length - 1}%%`;
  });
  for (const rule of preProcessors) {
    result = result.replace(rule.pattern, rule.replace);
  }
  result = result.replace(/%%MATH_(\d+)%%/g, (_, idx) => mathBlocks[parseInt(idx)]);
  result = result.replace(/%%HEADING_(\d+)%%/g, (_, idx) => headings[parseInt(idx)]);
  return result;
}

// ── Typed blockquotes {bkqt/TYPE}...{/bkqt} ──

const BKQT_TYPES = {
  note:       { label: 'Note' },
  tip:        { label: 'Tip' },
  warning:    { label: 'Warning' },
  danger:     { label: 'Danger' },
  keyconcept: { label: 'Key concept' },
};

function processBlockquoteContent(content, placeholders, markedInstance) {
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
          if (!m) return `<p>${markedInstance.parseInline(line)}</p>`;
          return `<p class="defn"><strong>${markedInstance.parseInline(m[1].trim())}</strong> — ${markedInstance.parseInline(m[2].trim())}</p>`;
        }).join('\n') + '</div>');
        continue;
      }
      htmlParts.push(markedInstance.parse(restored));
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
        const items = alphaLines.map(l => `<li>${markedInstance.parseInline(l.replace(/^[a-zA-Z]\. /, ''))}</li>`).join('');
        htmlParts.push(`<ol type="${type}">${items}</ol>`);
        continue;
      }
    }

    // Regular numbered list
    if (/^\d+\. /.test(restored)) {
      htmlParts.push(markedInstance.parse(restored));
      continue;
    }

    const lines = restored.split('\n');

    if (lines.length === 1) {
      htmlParts.push(markedInstance.parse(restored));
    } else {
      htmlParts.push(`<p>${markedInstance.parseInline(lines[0])}</p>`);
      for (let i = 1; i < lines.length; i++) {
        htmlParts.push(`<p class="bkqt-cont">${markedInstance.parseInline(lines[i])}</p>`);
      }
    }
  }

  return htmlParts.join('\n');
}

export function processCustomBlockquotes(markdown, placeholders, markedInstance) {
  const typePattern = Object.keys(BKQT_TYPES).join('|');
  const regex = new RegExp(
    `^\\{bkqt\\/(${typePattern})(?:\\|([^}]*))?\\}\\s*\\n([\\s\\S]*?)\\n\\s*\\{\\/bkqt\\}`,
    'gm'
  );
  return markdown.replace(regex, (_, type, customLabel, content) => {
    const config = BKQT_TYPES[type];
    const body = processBlockquoteContent(content, placeholders, markedInstance);
    const label = customLabel ? customLabel.trim() : config.label;
    return `<div class="bkqt bkqt-${type}"><div class="bkqt-body"><span class="bkqt-label">${label}</span>${body}</div></div>`;
  });
}

// ── HTML code-segment protection ──

export function processOutsideCode(html, fn) {
  const segments = [];
  let safe = html.replace(/<pre[\s\S]*?<\/pre>|<code[\s\S]*?<\/code>/g, (match) => {
    segments.push(match);
    return `%%CSEG_${segments.length - 1}%%`;
  });
  safe = fn(safe);
  return safe.replace(/%%CSEG_(\d+)%%/g, (_, idx) => segments[parseInt(idx)]);
}

// ── External URL links [[https://...|text]] ──

const EXTERNAL_LINK_ICON = `<svg class="doc-ref-icon" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>`;

export function processExternalUrls(markdown) {
  return markdown.replace(/\[\[(https?:\/\/[^\]|]+)(?:\|([^\]]+))?\]\]/g, (_, url, displayText) => {
    const href = url.trim();
    const display = displayText ? displayText.trim() : href;
    return `<a class="doc-ref doc-ref-external" href="${href}" target="_blank" rel="noopener noreferrer">${display} ${EXTERNAL_LINK_ICON}</a>`;
  });
}

// ── Unified [[link]] processing ──

const CROSS_DOC_CATEGORIES = {
  projects:    { path: '/lab/projects' },
  threads:     { path: '/blog/threads' },
  bits2bricks: { path: '/blog/bits2bricks' },
};

const CROSS_DOC_ICON = `<svg class="doc-ref-icon" viewBox="0 -960 960 960" fill="currentColor" aria-hidden="true"><path d="M280-280h280v-80H280v80Zm0-160h400v-80H280v80Zm0-160h400v-80H280v80Zm-80 480q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm0-80h560v-560H200v560Zm0-560v560-560Z"/></svg>`;

/**
 * Process all [[link]] references in HTML.
 * @param {string} html
 * @param {Map<string, {address: string, name: string}>} uidToMeta
 * @param {Object} [wikiLinksConfig] - { enabled: boolean }
 * @param {string[]} [buildErrors] - mutable array to push errors into
 * @returns {string}
 */
export function processAllLinks(html, uidToMeta, wikiLinksConfig, buildErrors) {
  if (wikiLinksConfig && !wikiLinksConfig.enabled) return html;

  return html.replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (match, ref, displayText) => {
    const crossDocMatch = ref.match(/^(projects|threads|bits2bricks)\/(.*)/);

    if (crossDocMatch) {
      const [, category, slug] = crossDocMatch;
      const config = CROSS_DOC_CATEGORIES[category];
      if (!config) return match;

      if (!displayText) {
        const msg = `cross-doc link [[${ref.trim()}]] missing display text — use [[${ref.trim()}|Display Text]]`;
        if (buildErrors) buildErrors.push(msg);
        return match;
      }

      const href = `${config.path}/${slug.trim()}`;
      return `<a class="doc-ref doc-ref-${category}" href="${href}" target="_blank" rel="noopener noreferrer">${CROSS_DOC_ICON}${displayText.trim()}</a>`;
    }

    // UID-based wiki-ref
    const uid = ref.trim();
    const meta = uidToMeta.get(uid);
    const currentName = meta ? meta.name : uid;
    const pipeText = displayText ? displayText.trim() : null;
    const display = pipeText && pipeText !== currentName ? pipeText : currentName;
    return `<a class="wiki-ref" data-uid="${uid}">${display}</a>`;
  });
}

// ── Inline annotations ^[explanation] ──

export function extractAnnotations(content) {
  const annotations = [];
  let counter = 0;
  let result = '';
  let i = 0;

  while (i < content.length) {
    if (content[i] === '^' && i + 1 < content.length && content[i + 1] === '[') {
      // Find matching ] with bracket balancing
      let depth = 1;
      let j = i + 2;
      while (j < content.length && depth > 0) {
        if (content[j] === '[') depth++;
        else if (content[j] === ']') depth--;
        if (depth > 0) j++;
      }
      if (depth === 0) {
        counter++;
        const explanation = content.substring(i + 2, j);
        annotations.push({ num: counter, text: explanation.trim() });
        result += `<sup class="ann-ref">${counter}</sup>`;
        i = j + 1;
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

export function processAnnotations(html) {
  return html.replace(/<(p|li|td)>([\s\S]*?)<\/\1>/g, (match, tag, inner) => {
    if (!inner.includes('^[')) return match;
    const { processed, annotations } = extractAnnotations(inner);
    if (annotations.length === 0) return match;
    const notesHtml = annotations.map(a =>
      `<div class="ann-note"><sup>${a.num}</sup>${a.text}</div>`
    ).join('');
    return `<${tag}>${processed}</${tag}>\n<div class="annotations">${notesHtml}</div>`;
  });
}

// ── Math rendering ──

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/**
 * Process math expressions: \(...\) inline, {math}...{/math} block.
 * If katex is null (live preview), renders raw LaTeX in styled <code>.
 */
export function processMath(markdown, katex) {
  // KaTeX runs before marked.parse, so its rendered HTML is later seen by marked's
  // inline tokenizers. A `\tilde`/`~` emits a literal `~` in the MathML, which marked's
  // GFM strikethrough (single-tilde) pairs across two math expressions into a malformed
  // <del> — silently truncating the article. Neutralize tildes to the entity (renders
  // identically) so marked leaves the math alone.
  const sanitizeMath = (html) => html.replace(/~/g, '&#x7e;');

  // Block math: {math}\n...\n{/math}
  let result = markdown.replace(/\{math\}\n([\s\S]*?)\n\{\/math\}/g, (_, expr) => {
    const trimmed = expr.trim();
    if (!katex) return `<div class="math-block"><code class="math-raw">${escapeHtml(trimmed)}</code></div>`;
    try {
      return `<div class="math-block">${sanitizeMath(katex.renderToString(trimmed, { displayMode: true, throwOnError: false }))}</div>`;
    } catch {
      return `<div class="math-block math-error"><code>${escapeHtml(trimmed)}</code></div>`;
    }
  });

  // Inline math: \(...\)
  result = result.replace(/\\\((.+?)\\\)/g, (_, expr) => {
    const trimmed = expr.trim();
    if (!katex) return `<code class="math-raw">${escapeHtml(trimmed)}</code>`;
    try {
      return sanitizeMath(katex.renderToString(trimmed, { displayMode: false, throwOnError: false }));
    } catch {
      return `<code class="math-error">${escapeHtml(trimmed)}</code>`;
    }
  });

  return result;
}

export function protectReferencePipesInTables(markdown) {
  return markdown.split('\n').map(line => {
    if (!/^\s*\|/.test(line)) return line;
    return line.replace(/\[\[([^\]\n]+?)\|([^\]\n]+?)\]\]/g, (_match, target, label) => `[[${target}%%REF_PIPE%%${label}]]`);
  }).join('\n');
}

// ── Definition lists ──

export function processDefinitionLists(markdown, markedInstance) {
  return markdown.replace(
    /^(- .+(?:\n- .+)*)/gm,
    (block) => {
      const lines = block.split('\n');
      const allDefs = lines.every(line => /^- .+?:: /.test(line));
      if (!allDefs) return block;

      return '<div class="defn-list">' + lines.map(line => {
        const match = line.match(/^- (.+?):: (.+)$/);
        if (!match) return line;
        const term = markedInstance.parseInline(match[1].trim());
        const desc = markedInstance.parseInline(match[2].trim());
        return `<p class="defn"><strong>${term}</strong> — ${desc}</p>`;
      }).join('\n') + '</div>';
    }
  );
}

// ── Alphabetical lists ──

export function processAlphabeticalLists(markdown, markedInstance) {
  const lines = markdown.split('\n');
  const output = [];
  for (let index = 0; index < lines.length;) {
    const first = lines[index].match(/^([aA])\. (.+)$/);
    if (!first) { output.push(lines[index++]); continue; }

    const isUpper = first[1] === 'A';
    const startCode = (isUpper ? 'A' : 'a').charCodeAt(0);
    const items = [first[2]];
    let cursor = index + 1;
    let expectedOffset = 1;

    while (cursor < lines.length) {
      let candidate = cursor;
      if (!lines[candidate].trim() && candidate + 1 < lines.length) candidate++;
      const expected = String.fromCharCode(startCode + expectedOffset);
      const match = lines[candidate].match(new RegExp(`^${expected}\\. (.+)$`));
      if (!match) break;
      items.push(match[1]);
      expectedOffset++;
      cursor = candidate + 1;
    }

    if (items.length < 2) { output.push(lines[index++]); continue; }
    const type = isUpper ? 'A' : 'a';
    output.push(`<ol type="${type}">${items.map(item => `<li>${markedInstance.parseInline(item)}</li>`).join('')}</ol>`);
    index = cursor;
  }
  return output.join('\n');
}

export function normalizeListIndentation(markdown) {
  return markdown.replace(/^( +)(?=(?:[-+*]|\d+\.)\s)/gm, (_match, spaces) => {
    const levels = Math.max(1, Math.ceil(spaces.length / 2));
    return ' '.repeat(levels * 4);
  });
}

// ── Context annotations ──

const MONTH_NAMES = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'];

export function computeRelativeTime(articleDateStr, yy, mm, dd) {
  if (!articleDateStr) return null;
  const articleDate = new Date(articleDateStr);
  if (isNaN(articleDate.getTime())) return null;
  const annotDate = new Date(2000 + parseInt(yy, 10), parseInt(mm, 10) - 1, parseInt(dd, 10));

  const diffMs = annotDate.getTime() - articleDate.getTime();
  if (Math.abs(diffMs) < 86400000) return '(day zero)';

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

export function processContextAnnotations(markdown, articleDate, markedInstance) {
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
        const parsedText = markedInstance.parseInline(text.trim());
        return `<div class="ctx-note-entry"><div class="ctx-note-date-row"><span class="ctx-note-date">${dateDisplay}</span>${relativeHtml}</div><span class="ctx-note-text">${parsedText}</span></div>`;
      });
      const html = entries.filter(Boolean).join('<hr class="ctx-note-divider">');
      return `<div class="ctx-note"><img src="https://avatars.githubusercontent.com/yago-mendoza" alt="" class="ctx-note-avatar" /><div class="ctx-note-body">${html}</div></div>\n\n`;
    }
  );
}

// ── Heading formatting ──

export function stripHeadingFormatting(html) {
  return html.replace(/<(h[1-4])(\s[^>]*)?>(.+?)<\/\1>/gi, (match, tag, attrs, inner) => {
    const plain = inner.replace(/<[^>]*>/g, '');
    return `<${tag}${attrs || ''}>${plain}</${tag}>`;
  });
}

// ── Shiki syntax highlighting ──

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

/** Exported for build-content.js to create Shiki highlighter with correct themes */
export { LANG_THEMES, DEFAULT_THEMES };

function decodeHtmlEntities(str) {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

export function highlightCodeBlocks(html, highlighter) {
  // With language tag
  html = html.replace(
    /<pre><code class="language-(\w+)">([\s\S]*?)<\/code><\/pre>/g,
    (_match, lang, escapedCode) => {
      const rawCode = decodeHtmlEntities(escapedCode).replace(/\n$/, '');
      const langLabel = lang.toUpperCase();
      const themes = LANG_THEMES[lang] || DEFAULT_THEMES;

      let codeContent;
      if (highlighter) {
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
      } else {
        codeContent = escapedCode;
      }

      return `<div class="code-terminal"><div class="code-terminal-bar"><div class="code-terminal-dots"><span></span><span></span><span></span></div><div class="code-terminal-right"><span class="code-terminal-lang">${langLabel}</span>${COPY_BTN}</div></div><pre><code class="language-${lang}">${codeContent}</code></pre></div>`;
    }
  );

  // Without language tag
  html = html.replace(
    /<pre><code(?!\s+class="language-)>([\s\S]*?)<\/code><\/pre>/g,
    (_match, code) => {
      return `<div class="code-terminal"><div class="code-terminal-bar"><div class="code-terminal-dots"><span></span><span></span><span></span></div><div class="code-terminal-right"><span class="code-terminal-lang"></span>${COPY_BTN}</div></div><pre><code>${code}</code></pre></div>`;
    }
  );

  return html;
}

// ── Main compilation pipeline ──

/**
 * Compile raw markdown through the content pipeline.
 *
 * @param {string} rawMd - raw markdown content (no frontmatter)
 * @param {string} articleDate - date string for context annotations
 * @param {Object} options
 * @param {Object} options.markedInstance - configured marked instance
 * @param {Object} options.compilerConfig - compiler.config.js object
 * @param {Object|null} [options.highlighter] - Shiki highlighter (null = skip)
 * @returns {string} - compiled HTML
 */
export function compileMarkdown(rawMd, articleDate, options) {
  const { markedInstance, compilerConfig, highlighter = null, katex = null } = options;

  rawMd = rawMd.replace(/\r\n/g, '\n');
  const { text, placeholders } = protectBackticks(rawMd);
  const withSyntax = applyPreProcessors(text, compilerConfig.preProcessors);
  const withMath = processMath(withSyntax, katex);
  const withBkqt = processCustomBlockquotes(withMath, placeholders, markedInstance);
  const restored = restoreBackticks(withBkqt, placeholders);
  const withUrls = processExternalUrls(restored);
  const withSafeTableRefs = protectReferencePipesInTables(withUrls);
  const withDefs = processDefinitionLists(withSafeTableRefs, markedInstance);
  const withAlpha = processAlphabeticalLists(withDefs, markedInstance);
  const withCtx = processContextAnnotations(withAlpha, articleDate, markedInstance);
  const withListIndent = normalizeListIndentation(withCtx);
  const parsed = markedInstance.parse(withListIndent)
    .replace(/%%REF_PIPE%%/g, '|')
    // A pair is deliberately the only supported multi-image layout. Keeping
    // the grouping here makes authoring independent from fragile left/right
    // floats and lets the same markup collapse cleanly on small screens.
    .replace(
      /(<figure class="img-pair-item">[\s\S]*?<\/figure>)\s*(<figure class="img-pair-item">[\s\S]*?<\/figure>)/g,
      '<div class="img-pair">$1$2</div>',
    );
  const clean = stripHeadingFormatting(parsed);
  const highlighted = highlightCodeBlocks(clean, highlighter);
  return processOutsideCode(highlighted, processAnnotations);
}
