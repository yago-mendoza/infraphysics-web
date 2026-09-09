---
slug: rendering-crawler
uid: "BG5gXls1"
address: "web dev//crawling//rendering crawler"
name: "rendering crawler"
date: "2026-09-08"
aliases: ["crawler with rendering", "JavaScript rendering", "headless crawling"]
---
A crawler that, besides [[JGc7uotQ|fetching]], uses a browser or renderer to execute the page's JavaScript before analyzing it. A normal crawler looks at the package that arrived; a rendering crawler opens the package, assembles everything, and only then inspects.
- It exists because of [[Dq9rVPgJ|client-side rendering]]: the fetched HTML can be a near-empty shell, and the content only appears in the [[jaoEDAPx|DOM]] after scripts run and data is fetched. Googlebot renders; many simpler bots and most LLM fetchers do not.
- Rendering is expensive (a browser per page, seconds instead of milliseconds), so it is rationed: a rendering queue behind the fetch queue, often days later. That delay is a reason sites move to [[nlHnOtKx|server-side rendering]] rather than hoping the crawler renders.
- The engine underneath is [[rSBc7TP1|browser automation]].

## Interactions

- [[Rn8tKx5D|Rendering]] : : SSR moves the work of building the page to the site; a rendering crawler moves it to the crawler. Both solve the empty-shell problem, and only one of them is under the site's control
