// Shared markdown compilation pipeline
// Used by both build-content.js (Node, with Shiki) and the browser editor (without Shiki).
//
// All functions are pure — no module-level state, no fs, no Node APIs.
// The `compileMarkdown` function accepts an options object with:
//   - highlighter: Shiki instance (null = skip highlighting)
//   - uidToMeta: Map<uid, {address, name}> for wiki-link resolution
//   - compilerConfig: the compiler.config.js object (pre/post processors, etc.)
//   - marked: the configured marked instance

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
  for (const rule of preProcessors) {
    result = result.replace(rule.pattern, rule.replace);
  }
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
  quote:      { label: null, isQuote: true },
  pullquote:  { label: null, isQuote: true },
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
    if (config.isQuote) {
      const attrib = customLabel ? `<span class="bkqt-attrib">${customLabel.trim()}</span>` : '';
      return `<div class="bkqt bkqt-${type}"><div class="bkqt-body">${body}${attrib}</div></div>`;
    }
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

const CROSS_DOC_ICONS = {
  projects: `<svg class="doc-ref-icon" viewBox="0 0 24 24" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,
  threads: `<svg class="doc-ref-icon" viewBox="0 0 24 24" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>`,
  bits2bricks: `<svg class="doc-ref-icon" viewBox="0 0 24 24" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 1.5 2.5 3 6 3s6-1.5 6-3v-5"/></svg>`,
};

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
      return `<a class="doc-ref doc-ref-${category}" href="${href}" target="_blank" rel="noopener noreferrer">${category}/${displayText.trim()}</a>`;
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

// ── Inline annotations {{ref|explanation}} ──

export function extractAnnotations(content) {
  const annotations = [];
  let counter = 0;
  let result = '';
  let i = 0;

  while (i < content.length) {
    if (content[i] === '{' && i + 1 < content.length && content[i + 1] === '{') {
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

export function processAnnotations(html) {
  let result = html.replace(/<(p|li|td)>([\s\S]*?)<\/\1>/g, (match, tag, inner) => {
    if (!inner.includes('{{')) return match;
    const { processed, annotations } = extractAnnotations(inner);
    if (annotations.length === 0) return match;
    const notesHtml = annotations.map(a =>
      `<div class="ann-note"><sup>${a.num}</sup>${a.text}</div>`
    ).join('');
    return `<${tag}>${processed}</${tag}>\n<div class="annotations">${notesHtml}</div>`;
  });

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

// ── Post-processors ──

export function applyPostProcessors(html, postProcessors) {
  let result = html;
  for (const rule of postProcessors) {
    result = result.replace(rule.pattern, rule.replace);
  }
  return result;
}

// ── Side-by-side image layouts ──

export function preprocessSideImages(markdown, markedInstance) {
  const blocks = markdown.split(/\n\n+/);
  const result = [];

  for (const block of blocks) {
    const match = block.match(/^!\[([^\]]*)\]\(([^\s)]+)(?:\s+"(left|right):?(\d+px)?")?\)([\s\S]*)/);

    if (match && (match[3] === 'left' || match[3] === 'right')) {
      const [, alt, src, position, width, restOfBlock] = match;
      const widthStyle = width ? `width: ${width};` : '';
      const textLines = restOfBlock.trim().split('\n').filter(l => l.trim());

      if (textLines.length > 0) {
        const paragraphs = textLines.map(line => {
          const processed = markedInstance.parseInline(line);
          return `<p>${processed}</p>`;
        }).join('\n');

        result.push(`<div class="img-side-layout img-side-${position}">
<img src="${src}" alt="${alt}" class="img-side-img" style="${widthStyle}" loading="lazy">
<div class="img-side-content">
${paragraphs}
</div>
</div>`);
      } else {
        result.push(block);
      }
    } else {
      result.push(block);
    }
  }

  return result.join('\n\n');
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
        return `<li>${markedInstance.parseInline(content)}</li>`;
      }).join('');
      return `<ol type="${type}">${items}</ol>`;
    }
  );
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
      return `<div class="ctx-note"><img src="https://avatars.githubusercontent.com/yago-mendoza" alt="" class="ctx-note-avatar" /><div class="ctx-note-body">${html}</div></div>`;
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

export function numberH1Headings(html) {
  let counter = 0;
  return html.replace(/<h1(\s[^>]*)?>(.+?)<\/h1>/gi, (match, attrs, inner) => {
    counter++;
    return `<h1${attrs || ''}>${counter}. ${inner}</h1>`;
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
 * Compile raw markdown through the 14-step pipeline.
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
  const { markedInstance, compilerConfig, highlighter = null } = options;

  rawMd = rawMd.replace(/\r\n/g, '\n');
  const { text, placeholders } = protectBackticks(rawMd);
  const withSyntax = applyPreProcessors(text, compilerConfig.preProcessors);
  const withBkqt = processCustomBlockquotes(withSyntax, placeholders, markedInstance);
  const restored = restoreBackticks(withBkqt, placeholders);
  const withUrls = processExternalUrls(restored);
  const withSide = preprocessSideImages(withUrls, markedInstance);
  const withDefs = processDefinitionLists(withSide, markedInstance);
  const withAlpha = processAlphabeticalLists(withDefs, markedInstance);
  const withCtx = processContextAnnotations(withAlpha, articleDate, markedInstance);
  const parsed = markedInstance.parse(withCtx);
  const clean = stripHeadingFormatting(parsed);
  const numbered = numberH1Headings(clean);
  const highlighted = highlightCodeBlocks(numbered, highlighter);
  const postProcessed = applyPostProcessors(highlighted, compilerConfig.postProcessors);
  return processOutsideCode(postProcessed, processAnnotations);
}
