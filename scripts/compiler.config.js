// Centralized compiler configuration
// Controls all build-time processing of markdown content

export default {
  // marked.js options
  marked: {
    gfm: true,
    breaks: false,
  },

  // Wiki-links: [[uid]] → <a class="wiki-ref"> (processed by processAllLinks in build-content.js)
  wikiLinks: {
    enabled: true,
    pattern: /\[\[([^\]]+)\]\]/g,
  },

  // Image positioning (title-based)
  imagePositions: {
    positions: ['center', 'full', 'pair'],
    titlePattern: /^(center|full|pair)$/,
    classMap: {
      center: 'img-center',
      full: 'img-full',
      pair: 'img-pair-item',
    },
  },

  // Pre-processors: applied BEFORE marked.parse (on raw markdown)
  // Order matters: curly-brace patterns first (unambiguous), then bare-delimiter patterns
  preProcessors: [
    { name: 'superscript',      pattern: /\{\^:([^}]+)\}/g,                             replace: '<sup>$1</sup>' },
    { name: 'subscript',        pattern: /\{v:([^}]+)\}/g,                              replace: '<sub>$1</sub>' },
    { name: 'keyboard',         pattern: /\{kbd:([^}]+)\}/g,                            replace: '<kbd>$1</kbd>' },
  ],

  // Validation flags
  validation: {
    validateRegularPostWikiLinks: true,
    validateFieldnoteRefs: true,
    validateParentSegments: true,
    detectCircularRefs: false,  // off by default — knowledge graphs naturally have cycles
    detectSegmentCollisions: true,
    detectIsolated: true,
    // Segment names too generic to flag as collisions (organizational terms)
    segmentCollisionExclusions: [
      'overview', 'intro', 'basics', 'summary', 'notes',
      'example', 'examples', 'reference', 'references',
      'config', 'configuration', 'settings', 'setup',
      'types', 'glossary', 'faq', 'history',
    ],
  },
};
