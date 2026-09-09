---
slug: indexability
uid: "qmp1wh7j"
address: "web dev//SEO//indexability"
name: "indexability"
date: "2026-09-08"
aliases: ["indexable", "crawlable", "noindex"]
---
Three different permissions that are easy to confuse: knowing a URL exists is not the same as being able to crawl it, and being able to crawl it is not the same as being able to index it.

{bkqt/keyconcept|Three gates}
Known: the URL has been discovered.
Crawlable: the crawler can access the resource and retrieve it. "I can get in."
Indexable: the content may be incorporated into a search index. "I can file it in my catalog."
{/bkqt}

- [[Cx7nWr4L|robots.txt]] governs crawlability. A noindex tag or header governs indexability, and it only works if the page can be crawled: a page blocked in robots.txt cannot show its noindex, so it may stay in the index from links alone.
- A page can be crawled and never indexed (thin, duplicate, low priority); a page can be indexed without being fetched recently. The stages are [[OkRULEb0|discovery]], [[JGc7uotQ|fetching]] and [[GYSeFtBh|indexing]].

## Interactions

- [[OkRULEb0|discovery]] : : Discovery is the first gate and says nothing about the other two: an engine can know a URL for years, be forbidden to fetch it, and still list it from anchor text alone
