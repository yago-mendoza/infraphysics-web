---
uid: "Ht6nWx3K"
address: "Web Dev//build"
name: "Build"
date: "2026-03-10"
---
Compiling source code (React, TypeScript, Sass...) into static files the browser can execute directly: HTML, CSS, and JavaScript.
- The browser runs JS on [[Rm3xBt7F|V8]] (Chrome, Edge) or SpiderMonkey (Firefox). It doesn't understand TypeScript or JSX -- it needs plain JS.
- Output goes into a `dist/` (or `build/`) folder: minified files, hashed filenames for cache-busting, optimized assets
- Tools: [[Vp8rBm5J|Vite]], Webpack, esbuild, Parcel, Rollup
- In production, `dist/` is what gets uploaded to the server. [[Fs8tBm3G|Cloudflare Pages]] serves these static files from the edge.
- Locally, [[Nx9sGt5L|Wrangler]] can serve `dist/` to simulate the production environment (`wrangler pages dev dist`)
---
## Interactions
- [[Vp8rBm5J|Vite]] : : Vite produces `dist/` in build mode, but in dev mode it doesn't generate `dist/` -- it serves files from memory with [[Qk4sTn9L|HMR]]
- [[Fs8tBm3G|Pages]] : : Pages serves `dist/` contents in production -- that's what Cloudflare distributes to the edge
