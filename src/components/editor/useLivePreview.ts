// Live preview hook — compiles raw fieldnote markdown to HTML in the browser.
// Uses the same pipeline as build-content.js but without Shiki highlighting.

import { useMemo, useDeferredValue } from 'react';
import { Marked, Renderer } from 'marked';
import compilerConfig from '../../../scripts/compiler.config.js';
import {
  parseFrontmatter,
  parseTrailingRefs,
  stripTrailingRefs,
} from '../../lib/content/fieldnote-parser.js';
import {
  compileMarkdown,
  processOutsideCode,
  processAllLinks,
} from '../../lib/content/compile.js';
import { resolveWikiLinks } from '../../lib/wikilinks';
import type { FieldNoteMeta } from '../../types';

// ── Module-level singletons (created once, reused across renders) ──

const previewRenderer = new Renderer();
const { titlePattern, classMap } = compilerConfig.imagePositions;

previewRenderer.blockquote = function (token) {
  const body = this.parser.parse(token.tokens);
  return `<div class="small-text">${body}</div>\n`;
};

previewRenderer.image = function ({ href, title, text }) {
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
  return `<img src="${href}" alt="${alt}"${classAttr}${styleAttr}${titleAttr} loading="lazy" />`;
};

const previewMarked = new Marked({ renderer: previewRenderer, ...compilerConfig.marked });

// ── Hook ──

export function useLivePreview(
  rawContent: string,
  allNotes: FieldNoteMeta[],
  noteById: Map<string, FieldNoteMeta>,
): { previewHtml: string } {
  const deferred = useDeferredValue(rawContent);

  const uidToMeta = useMemo(() => {
    const map = new Map<string, { address: string; name: string }>();
    for (const n of allNotes) {
      map.set(n.id, { address: n.address, name: n.name || n.displayTitle });
    }
    return map;
  }, [allNotes]);

  const previewHtml = useMemo(() => {
    if (!deferred) return '';

    // 1. Parse frontmatter → extract body + date
    const parsed = parseFrontmatter(deferred);
    if (!parsed) return '<p class="text-th-muted">Invalid frontmatter</p>';
    const { frontmatter, body } = parsed;
    const date = frontmatter.date || '';

    // 2. Strip trailing refs
    const { trailingRefStart } = parseTrailingRefs(body);
    const content = stripTrailingRefs(body, trailingRefStart);

    // 3. Compile markdown (no Shiki)
    const compiled = compileMarkdown(content, date, {
      markedInstance: previewMarked,
      compilerConfig,
      highlighter: null,
    });

    // 4. Resolve [[uid]] → <a class="wiki-ref">
    const withLinks = processOutsideCode(compiled, (h: string) =>
      processAllLinks(h, uidToMeta, { enabled: true }),
    );

    // 5. Add hover-preview data attrs
    const { html } = resolveWikiLinks(withLinks, allNotes, noteById);

    return html;
  }, [deferred, uidToMeta, allNotes, noteById]);

  return { previewHtml };
}
