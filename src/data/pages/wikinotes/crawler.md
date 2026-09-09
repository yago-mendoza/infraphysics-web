---
slug: crawler
uid: "Cw5rNx6K"
address: "web dev//SEO//crawler"
name: "crawler"
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
- Crawler, scraper and indexer are different jobs, not different bots. The crawler decides where to go and traverses URLs; the [[baInedI5|scraper]] decides what to take out of the pages; the [[GYSeFtBh|indexer]] prepares the documents to be found later. One program can do all three. The stages in order are the [[RBmlX4Ar|crawling]] pipeline: discovery, frontier, scheduling, fetching, rendering, parsing.
- A [[BG5gXls1|rendering crawler]] runs the page's JavaScript before looking, which is the crawler-side answer to the SPA problem above; the site-side answer is [[nlHnOtKx|SSR]].

