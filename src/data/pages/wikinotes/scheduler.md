---
slug: scheduler
uid: "C3thKIgo"
address: "web dev//crawling//scheduler"
name: "scheduler"
date: "2026-09-08"
aliases: ["crawl scheduler", "crawl budget"]
---
The component that decides which URL of the [[buJhwqNb|URL frontier]] to visit, when, and with what priority. The doorman of the queue.
- Its inputs are priority signals (importance, freshness, how often a page changes), politeness constraints per host (rate limits, the Crawl-delay directive of [[Cx7nWr4L|robots.txt]]) and a finite budget: a search engine allocates limited crawl resources per site, so large sites live or die by which pages the scheduler picks first.
- Scheduling is where "known" becomes "visited now". The next stage is [[JGc7uotQ|fetching]].

## Interactions

- [[Cx7nWr4L|robots.txt]] : : robots.txt is written by the site and enforced by the scheduler: Disallow removes URLs from the queue, Crawl-delay slows the rate. It only works because the scheduler chooses to read it
