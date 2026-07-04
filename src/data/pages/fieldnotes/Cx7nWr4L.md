---
uid: "Cx7nWr4L"
address: "Web Dev//SEO//robots.txt"
name: "robots.txt"
date: "2026-03-08"
---
- A plain text file at the site root (`/robots.txt`) that tells [[Cw5rNx6K|crawlers]] which paths they may or may not access.
- Directives: `User-agent` (which crawler), `Allow` / `Disallow` (which paths), `Crawl-delay` (politeness throttle), `Sitemap` (pointer to [[Sm9pLx3R|sitemap]]).
- It is a gentleman's agreement, not access control. Malicious bots ignore it. Well-behaved bots (Googlebot, GPTBot, ClaudeBot) respect it.
- AI-era relevance: you can selectively block AI crawlers while allowing search engines. `User-agent: GPTBot / Disallow: /` blocks OpenAI's crawler from training on your content.
- Common mistake: blocking crawlers from CSS/JS files makes your page unrenderable for Googlebot (it needs to render the page to index it).
- The file itself is public. Anyone can read your robots.txt to see what you are hiding. Do not use it for security.
