---
slug: crawling
uid: "RBmlX4Ar"
address: "web dev//crawling"
name: "crawling"
date: "2026-09-08"
aliases: ["crawl pipeline", "web crawling"]
---
Traversing URLs systematically to discover and retrieve resources, and everything that happens to a page after that. The idea worth memorizing: crawler, parser, scraper and indexer are not four bots; they are four different jobs that one system may combine.

{bkqt/keyconcept|The full pipeline, one URL at a time}
Discovery: "I know it exists."
Frontier: "I might visit it."
Scheduling: "I visit it now."
Fetching: "I download the resource."
Rendering: "I run the JavaScript if needed."
Parsing: "I understand its structure."
Scraping: "I extract specific data" (optional).
Indexing: "I prepare it to be found later" (optional).
Ranking and retrieval: "I decide which result matters."
Agent: "I use that information to reach a goal."
{/bkqt}

- One note per stage: [[OkRULEb0|discovery]], [[buJhwqNb|URL frontier]], [[C3thKIgo|scheduler]], [[JGc7uotQ|fetching]], [[BG5gXls1|rendering crawler]], [[KAtZ68eQ|parsing]], [[baInedI5|scraping]], [[GYSeFtBh|indexing]], and on top of them the [[yuBE6OTQ|search engine]] with its [[PTYwZyrc|ranking]].
- Crawling is exploring a map by following its roads; the program that does it is the [[Cw5rNx6K|crawler]]. Fetching is knocking on one door. Parsing is reading what they hand you. Scraping is keeping only the dish name and the price. Indexing is filing it in a library with a useful catalog.
- The site's side of the same story is [[Sx8mKr2Q|SEO]]: robots.txt, sitemaps, canonical URLs and feeds are the signals a crawler consumes. The reader's side, when the reader has a goal instead of a route, is the [[QOPrOeTc|web agent]].
- A browser that acts like a mechanical user is [[rSBc7TP1|browser automation]]; it serves crawlers, scrapers and agents alike.

## Interactions

- [[Sx8mKr2Q|SEO]] : : SEO is what a site does to be found; crawling is what the finder does. The same robots.txt, sitemap and canonical are written by one side and read by the other, and the pipeline notes describe the reading side stage by stage
