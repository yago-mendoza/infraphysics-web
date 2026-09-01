---
uid: "Rn8tKx5D"
address: "Web Dev//rendering"
name: "Rendering"
date: "2026-03-12"
---
Where and when HTML gets built. The single most important architectural decision for a web app: it determines what crawlers see, how fast the page loads, and how much JS the browser needs.

**CSR (Client-Side Rendering)**: the server sends an empty `<div id="root"></div>` + a JS bundle. The browser executes the JS, builds the DOM, and fills the page. Until JS runs, there's no content. [[Rc4pBn9L|React]] SPAs and Notion work this way. [[Cw5rNx6K|Crawlers]] and tools like WebFetch can't read them: they don't execute JS, so they see an empty shell.

**SSR (Server-Side Rendering)**: the server builds the HTML on every request and sends it ready-made. The browser paints it immediately. JS hydrates the page after (adds interactivity). [[Nx5tWs7J|Next.js]] with SSR does this. Crawlers see the full content.

**SSG (Static Site Generation)**: the HTML is pre-built at build time: no server needed per request. The result is static files served from a CDN. [[As8kTm3F|Astro]] does this by default. Crawlers see everything. Fastest possible load.

The spectrum: CSR (all browser, no content without JS) → SSR (server per request, content ready) → SSG (pre-built, content baked in). [[As8kTm3F|Astro]] defaults to SSG. [[Nx5tWs7J|Next.js]] supports all three. Pure [[Rc4pBn9L|React]] + [[Vp8rBm5J|Vite]] is CSR.

## Interactions
- [[Cw5rNx6K|Crawler]] : : crawlers don't run JS. CSR pages (empty shell + JS) are invisible to them. SSR/SSG pages have the content in the HTML: crawlers read them fine. This is why the rendering model matters for SEO.
