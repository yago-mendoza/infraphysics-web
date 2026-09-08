// Content processing — shared between Node build scripts and browser editor
export {
  compileMarkdown,
  processAllLinks,
  processOutsideCode,
  highlightCodeBlocks,
  LANG_THEMES,
  DEFAULT_THEMES,
} from './compile.js';

export {
  parseFrontmatter,
  parseReferences,
  parseTrailingRefs,
  extractDescription,
  stripTrailingRefs,
  extractWikinoteMeta,
  serializeWikinote,
} from './wikinote-parser.js';

export {
  validateWikinotes,
  checkReferenceIntegrity,
  checkRegularPostWikiLinks,
  checkSelfReferences,
  checkBareTrailingRefs,
  checkParentHierarchy,
  checkFrontmatterSchema,
} from './validate.js';

export {
  parseAddress,
  getParentAddress,
  getLeafSegment,
  getAncestors,
  checkSegmentCollisions,
} from './address.js';

export { generateUid } from './uid.js';
export { capitalizeFirst, displayName, startsSentence } from './casing.js';
