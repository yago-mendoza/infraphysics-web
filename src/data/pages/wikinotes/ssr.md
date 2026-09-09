---
slug: ssr
uid: "nlHnOtKx"
address: "web dev//rendering//SSR"
name: "SSR"
date: "2026-09-08"
aliases: ["server-side rendering"]
---
Server-side rendering: the server generates HTML with the content already in it before sending it to the client. The house arrives assembled.

{bkqt/keyconcept|The SSR sequence}
Server, then HTML with content, then the browser can read it right away.
{/bkqt}

- It helps enormously with crawling, SEO and every tool that does not run JavaScript well: the fetched document already carries the text ([[Cw5rNx6K|Crawler]]). Static generation (SSG) is the same idea done once at build time instead of per request.
- What the server sends is inert HTML; making it interactive again is [[w3zHyIAB|hydration]]. Frameworks such as [[As8kTm3F|Astro]] and [[Nx5tWs7J|Next.js]] exist largely to manage that handoff.
- SSR costs server work per request and complicates anything that depends on the browser (window size, local storage) at render time. The trade is the subject of [[Rn8tKx5D|Rendering]].

## Interactions

- [[Dq9rVPgJ|CSR]] : : CSR ships instructions and lets every visitor build the page; SSR builds it once on the server and ships the result. CSR is cheaper for the server and invisible to non-rendering crawlers; SSR is the reverse on both counts
