---
uid: "Sm9pLx3R"
address: "Web Dev//SEO//sitemap"
name: "sitemap"
date: "2026-03-08"
---
- An XML file (`/sitemap.xml`) listing every URL on a site that should be indexed, with optional metadata (last modified date, change frequency, priority).
- Autodiscovery: reference it from [[Cx7nWr4L|robots.txt]] (`Sitemap: https://example.com/sitemap.xml`) and/or submit it via Google Search Console.
- Especially important for SPAs and JS-heavy sites where [[Cw5rNx6K|crawlers]] cannot discover pages by following links (there are no server-rendered links to follow).
- Best practice: auto-generate at build time so it stays in sync with actual content. Manual sitemaps go stale.
- Size limits: 50,000 URLs or 50MB per file. Use a sitemap index file to split larger sites.
- Not a ranking signal. It is a discovery signal. Being in the sitemap does not guarantee indexing, it just guarantees the crawler knows the URL exists.
