---
uid: "Vp8rBm5J"
address: "Web Dev//Vite"
name: "Vite"
date: "2026-03-10"
---
Bundler and dev server for frontend. Does two different things depending on the mode:

**Dev mode** (`npm run dev`, port 5173 by default):
- Serves files from memory, no `dist/` generated
- [[Qk4sTn9L|HMR]] -- change a file, the browser updates the component without a full page reload
- Built-in [[Mn3gRp6H|dev proxy]] -- can forward `/api/*` requests to another port (e.g. [[Nx9sGt5L|Wrangler]] on 8788)
- Fast because it uses native ES modules instead of bundling everything

**Build mode** (`npm run build`):
- Compiles all source into static files in `dist/` ([[Ht6nWx3K|build]])
- Minifies, tree-shakes, code-splits, generates hashes for cache-busting
- Uses Rollup under the hood

Vite only handles frontend. For backend (API, database), you need a separate process -- in the Cloudflare stack, that's [[Nx9sGt5L|Wrangler]].
---
## Interactions
- [[Nx9sGt5L|Wrangler]] : : In development they run in two terminals: Vite (port 5173, frontend + HMR) and Wrangler (port 8788, API + D1). Vite proxies `/api/*` to Wrangler. In production, Wrangler/Pages serves everything together from `dist/`
