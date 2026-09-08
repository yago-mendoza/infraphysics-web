---
uid: "Cw5rNx6K"
address: "Web Dev//SEO//Crawler"
name: "Crawler"
date: "2026-03-08"
---
- Automated programs that systematically browse the web to discover and index content. Also called spiders or bots.
- Three generations of crawlers:
  - **Search engine crawlers**: Googlebot, Bingbot. Index pages for search results. Oldest, most mature.
  - **Social crawlers**: WhatsApp, Twitter, Discord bots. Fetch [[Og6nRx2K|Open Graph]] tags to generate link previews. Only read `<head>`, do not index body content.
  - **AI crawlers**: GPTBot (OpenAI), ClaudeBot (Anthropic), PerplexityBot, Google-Extended. Fetch content for LLM training data or real-time retrieval. Read everything. This is the [[Ax4kJn8M|AEO]] audience.
- Identification: crawlers identify themselves via `User-Agent` HTTP header. [[Cx7nWr4L|robots.txt]] uses this to grant or deny access per crawler.
- SPA problem: crawlers that do not execute JavaScript see an empty `<div id="root"></div>`. Solutions: SSR, static pre-rendering, or edge functions that inject content for bot user-agents.
- Crawl budget: search engines allocate limited crawl resources per site. Large sites need to prioritize which pages get crawled via [[Sm9pLx3R|sitemap]] and internal linking.
