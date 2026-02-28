// Validation for content integrity — runs at build time
// This file now re-exports from the shared module at src/lib/content/validate.js
// The shared module is browser-safe and can be used by both build scripts and the editor.

export { validateFieldnotes } from '../src/lib/content/validate.js';
