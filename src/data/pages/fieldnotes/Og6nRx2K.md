---
uid: "Og6nRx2K"
address: "Web Dev//SEO//Open Graph"
name: "Open Graph"
date: "2026-03-08"
---
- A protocol (originally by Facebook, 2010) that controls how URLs preview when shared on social platforms: the title, description, and image that appear in link cards.
- Implemented as `<meta property="og:..."` tags in the `<head>`. Core properties: `og:title`, `og:description`, `og:image`, `og:url`, `og:type`.
- Twitter has its own variant (`twitter:card`, `twitter:title`, etc.) but falls back to OG tags if its own are not present.
- Why it matters: a link shared without OG tags shows a bare URL. With OG tags, it shows a rich card: dramatically higher click-through rates.
- SPA challenge: social [[Cw5rNx6K|crawlers]] do not execute JavaScript. They read raw HTML `<head>`. SPAs need server-side or edge-function injection of OG tags per page.
- Not a search ranking factor, but improves social discoverability and CTR, which indirectly affects SEO.

## Interactions

- [[Sd3mPx7R]] : : both are machine-readable metadata, but for different consumers: Open Graph targets social platforms, structured data targets search engines and AI
