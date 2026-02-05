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
  // Order matters: curly-brace patterns first (unambiguous), then bare-delimiter patterns
  preProcessors: [
    { name: 'text-color',       pattern: /\{#([a-fA-F0-9]{3,6}|[a-z]+):([^}]+)\}/g,  replace: '<span style="color:#$1">$2</span>' },
    { name: 'small-caps',       pattern: /\{sc:([^}]+)\}/g,                             replace: '<span style="font-variant:small-caps">$1</span>' },
    { name: 'superscript',      pattern: /\{\^:([^}]+)\}/g,                             replace: '<sup>$1</sup>' },
    { name: 'subscript',        pattern: /\{v:([^}]+)\}/g,                              replace: '<sub>$1</sub>' },
    { name: 'keyboard',         pattern: /\{kbd:([^}]+)\}/g,                            replace: '<kbd>$1</kbd>' },
    { name: 'shout',            pattern: /\{shout:([^}]+)\}/g,                          replace: '<p class="shout">$1</p>' },
    { name: 'underline',        pattern: /(?<!\w)_([^_\n]+?)_(?!\w)/g,                  replace: '<span style="text-decoration:underline">$1</span>' },
    { name: 'accent-text',      pattern: /(?<!-)--((?:(?!--)[^\n])+?)--(?!-)/g,                  replace: '<span class="accent-text">$1</span>' },
  ],

  // Post-processors: applied AFTER marked.parse (on HTML output)
  // Note: code-terminal wrapping + Shiki highlighting is handled in build-content.js
  postProcessors: [],

  // Validation flags
  validation: {
    validateRegularPostWikiLinks: true,
    validateFieldnoteRefs: true,
    validateParentSegments: true,
  },
};
