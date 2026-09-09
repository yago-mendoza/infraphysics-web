---
slug: spa
uid: "doG8Catf"
address: "web dev//rendering//SPA"
name: "SPA"
date: "2026-09-08"
aliases: ["single-page application"]
---
A web application where most navigations happen without reloading a complete HTML document. It looks like you change pages, but you stay inside the same application.
- Routing happens in the browser: the URL changes, JavaScript swaps the view, and the document never reloads. This site is one: the same shell serves every route.
- SPA is not the same as [[Dq9rVPgJ|CSR]]. One is about navigation, the other about where HTML is built. You can have SPA with CSR (empty shell, everything client-built) or SPA with [[nlHnOtKx|SSR]] plus [[w3zHyIAB|hydration]] (server-rendered first load, client navigation afterwards).
- For crawlers the SPA problem is really the CSR problem: a non-rendering crawler sees the empty shell, and internal links that exist only after JavaScript runs are never followed, which is why a [[Sm9pLx3R|sitemap]] matters more for SPAs.

## Interactions

- [[Dq9rVPgJ|CSR]] : : SPA answers "does navigation reload the document" and CSR answers "who builds the HTML". They are usually found together, which is why they get confused, and SSR plus hydration is exactly the SPA that is not CSR
