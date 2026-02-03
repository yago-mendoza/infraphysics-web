// Centralized compiler configuration
// Controls all build-time processing of markdown content

export default {
  // marked.js options
  marked: {
    gfm: true,
    breaks: false,
  },

  // Wiki-links: [[address]] → <a class="wiki-ref">
  wikiLinks: {
    enabled: true,
    pattern: /\[\[([^\]]+)\]\]/g,
    toHtml: (address) => {
      const segments = address.split('//');
      const displayText = segments[segments.length - 1].trim();
      return `<a class="wiki-ref" data-address="${address}">${displayText}</a>`;
    },
  },

  // Image positioning (title-based)
  imagePositions: {
    positions: ['right', 'left', 'center', 'full'],
    titlePattern: /^(right|left|center|full):?(\d+px)?$/,
    classMap: {
      center: 'img-center',
      full: 'img-full',
      right: 'img-float-right',
      left: 'img-float-left',
    },
  },

  // Pre-processors: applied BEFORE marked.parse (on raw markdown)
  preProcessors: [
    { name: 'text-color',       pattern: /\{#([a-fA-F0-9]{3,6}|[a-z]+):([^}]+)\}/g,  replace: '<span style="color:#$1">$2</span>' },
    { name: 'underline-solid',  pattern: /\{_:([^}]+)\}/g,                             replace: '<span style="text-decoration:underline">$1</span>' },
    { name: 'highlight',        pattern: /\{==:([^}]+)\}/g,                             replace: '<mark>$1</mark>' },
    { name: 'small-caps',       pattern: /\{sc:([^}]+)\}/g,                             replace: '<span style="font-variant:small-caps">$1</span>' },
    { name: 'superscript',      pattern: /\{\^:([^}]+)\}/g,                             replace: '<sup>$1</sup>' },
    { name: 'subscript',        pattern: /\{v:([^}]+)\}/g,                              replace: '<sub>$1</sub>' },
    { name: 'keyboard',         pattern: /\{kbd:([^}]+)\}/g,                            replace: '<kbd>$1</kbd>' },
  ],

  // Post-processors: applied AFTER marked.parse (on HTML output)
  postProcessors: [
    {
      name: 'code-terminal-wrapper',
      pattern: /<pre><code class="language-(\w+)">([\s\S]*?)<\/code><\/pre>/g,
      replace: (_match, lang, code) => {
        const langLabel = lang.toUpperCase();
        return `<div class="code-terminal"><div class="code-terminal-bar"><div class="code-terminal-dots"><span></span><span></span><span></span></div><span class="code-terminal-lang">${langLabel}</span></div><pre><code class="language-${lang}">${code}</code></pre></div>`;
      },
    },
    {
      name: 'code-terminal-wrapper-no-lang',
      pattern: /<pre><code(?!\s+class="language-)>([\s\S]*?)<\/code><\/pre>/g,
      replace: (_match, code) => {
        return `<div class="code-terminal"><div class="code-terminal-bar"><div class="code-terminal-dots"><span></span><span></span><span></span></div><span class="code-terminal-lang"></span></div><pre><code>${code}</code></pre></div>`;
      },
    },
  ],

  // Validation flags
  validation: {
    validateRegularPostWikiLinks: true,
    validateFieldnoteRefs: true,
    validateParentSegments: true,
  },
};
