---
slug: discovery
uid: "OkRULEb0"
address: "web dev//crawling//discovery"
name: "discovery"
date: "2026-09-08"
aliases: ["URL discovery"]
---
The moment a system learns that a URL exists. Nothing has been visited yet; an address has simply been written down.
- Sources of discovery: a link on a page already fetched, an entry in a [[Sm9pLx3R|sitemap]] or an [[BIEsPI9o|RSS feed]], a redirect, a submission, a URL seen in another dataset.
- Discovery is the entry point of the [[RBmlX4Ar|crawling]] pipeline: a discovered URL goes to the [[buJhwqNb|URL frontier]] and waits for the [[C3thKIgo|scheduler]] to decide whether and when to fetch it.
- Knowing a URL, being allowed to crawl it and being able to index it are three different things ([[qmp1wh7j|indexability]]).

## Interactions

- [[Sm9pLx3R|sitemap]] : : Links give discovery as a side effect of crawling; a sitemap gives discovery without crawling, which is why it matters exactly for the pages no server-rendered link points to
