---
uid: "As8kTm3F"
address: "Web Dev//framework//Astro"
name: "Astro"
date: "2026-03-12"
---
[[ISjyfjZ6|Frontend]] framework that generates static HTML at build time and ships zero JavaScript by default. Only loads JS where you explicitly mark interactive "islands."
- Islands Architecture: most of the page is static HTML. Interactive components (search bar, graph viewer, toggles) load their own JS independently.
- Framework-agnostic: components can be [[Rc4pBn9L|React]], Vue, Svelte, Solid — mix and match in the same project
- Ideal for content-heavy sites: blogs, docs, portfolios. The HTML is ready on arrival — no waiting for JS to render.
- Contrast with React + [[Vp8rBm5J|Vite]]: React manda un bundle JS al navegador y el DOM se construye allí — el HTML inicial está vacío, React lo monta en el cliente. Astro manda el HTML ya montado desde el servidor — el navegador lo pinta directamente, sin esperar a JS. Less JS = faster load.
- Contrast with [[Nx5tWs7J|Next.js]]: Next.js is full-stack (frontend + [[Bk9sTm2J|backend]] + SSR). Astro is frontend-only and static-first. For apps with lots of interactivity (dashboards, editors), Next.js or React make more sense.
- InfraPhysics (React + Vite) would be a natural candidate for Astro — mostly static content with a few interactive islands (Second Brain, graph, search). But it works fine as-is.
---
## Interactions
- [[Rn8tKx5D|Rendering]] : : Astro is SSG by default — the HTML arrives with the content already inside. A pure React SPA (CSR) sends an empty shell and JS builds the page in the browser. Crawlers and tools like WebFetch can read Astro pages; they can't read CSR pages because they don't execute JS.
