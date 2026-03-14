---
uid: "Rc4pBn9L"
address: "Web Dev//framework//React"
name: "React"
date: "2026-03-12"
distinct: ["ML//agent//ReAct"]
---
JavaScript library for building user interfaces. Declarative, component-based. [[ISjyfjZ6|Frontend]] only — runs in the browser, never on the server by itself.
- Components return JSX (HTML-like syntax in JS). State changes trigger re-renders. The browser does all the work.
- SPA (Single Page Application): React controls the entire page. Navigation happens client-side — no full page reloads.
- Needs a bundler to ship ([[Vp8rBm5J|Vite]], Webpack) or a framework to add [[Bk9sTm2J|backend]] ([[Nx5tWs7J|Next.js]])
- InfraPhysics uses React 19 + [[Vp8rBm5J|Vite]] 6. All content compiles at build time to static HTML/JSON. The browser loads React, which renders the UI. No backend — just static files on [[Fs8tBm3G|Cloudflare Pages]]. Including the Second Brain — 100% frontend, fieldnotes compiled to JSON, graph and search all in the browser.
---
## Interactions
- [[As8kTm3F|Astro]] : : React ships the full JS bundle — the browser builds everything. Astro ships zero JS by default and only hydrates interactive islands. For content sites, Astro wins on performance; for interactive apps (dashboards, editors), React.
