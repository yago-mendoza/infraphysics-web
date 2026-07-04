---
uid: "ZGDGyhGV"
address: "infraphysics//Localhost Editor"
name: "Localhost Editor"
date: "2026-03-19"
---

A CodeMirror-based editor that only activates on localhost, invisible in production. Allows editing fieldnotes in the browser using the full [[JkzQf7qt|custom syntax]], with live recompilation.

- Detected via `useIsLocalhost`: when the site runs on `localhost:5173`, the editor panel appears inside the Second Brain UI
- The editor is a CodeMirror instance with syntax-aware features: typing double-bracket triggers wiki-link autocomplete (fuzzy-matches names, aliases, addresses), unlinked term detection highlights concepts that should be wiki-links, and diagnostics catch structural issues (missing parents, broken refs)
- On save (Ctrl+S): the editor POSTs the raw markdown to a local endpoint on the [[Vp8rBm5J|Vite]] dev server → the server writes the `.md` file back to disk → [[Qk4sTn9L|HMR]] detects the file change → the [[E9olQ6Ox|compiler]] recompiles that single note → the browser fetches the fresh `.json` → the rendered note updates in place
- The full cycle (edit → save → see rendered result) takes under a second

The editor doesn't compile anything itself. It's a comfortable interface for writing markdown that respects the [[JkzQf7qt|custom syntax]] rules. The compilation always happens through the same build pipeline, whether the edit came from CodeMirror, Claude Code, or a text editor.

## Interactions

- [[Qk4sTn9L|HMR]] : : HMR closes the feedback loop: file change on disk triggers recompilation and browser update without a full page reload
- [[JkzQf7qt|Custom Syntax]] : : the editor lets you write in the full custom syntax (colored text, blockquotes, wiki-links) and see it rendered after the build pipeline processes it
