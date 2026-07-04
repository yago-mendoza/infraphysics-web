---
uid: "BoSed9wO"
address: "infraphysics//Content Pipeline"
name: "Content Pipeline"
date: "2026-03-19"
---

The full path from a markdown file on disk to rendered content in the browser.

```
.md on disk
  → npm run build
  → compiler (marked + Shiki + custom syntax preprocessors)
  → public/fieldnotes/{uid}.json (pre-rendered HTML + metadata)
  → Vite bundles the React SPA into dist/
  → browser loads the SPA shell (CSR — single index.html)
  → user navigates to a fieldnote
  → fetch("/fieldnotes/{uid}.json") — on-demand, not upfront
  → React injects the pre-rendered HTML into the DOM
```

- The [[E9olQ6Ox|compiler]] runs at build time. The browser never parses markdown. It receives finished HTML inside a JSON envelope.
- The SPA index loads eagerly. Fieldnote content loads on demand, only when the user opens a specific note. This keeps initial load fast (the index is metadata only, ~50KB for 500+ notes).
- [[Vp8rBm5J|Vite]] handles two separate concerns: bundling the React app into `dist/`, and serving files in dev mode with [[Qk4sTn9L|HMR]] so changes appear instantly without a full page reload.
- The [[dlBw5GXu|pipeline]] order matters: custom syntax is resolved before marked runs (so HTML spans survive the markdown parser), wiki-links are injected after all HTML is generated.

## Interactions

- [[dlBw5GXu|pipeline]] : : the compiler pipeline defines the transformation order: preprocessors, marked, postprocessors, wiki-link injection
- [[Rn8tKx5D|Rendering]] : : infraphysics uses CSR (client-side rendering): the server sends an empty shell, React builds the page, and fetches pre-compiled JSON on demand
