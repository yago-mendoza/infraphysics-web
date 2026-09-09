---
slug: indexing
uid: "GYSeFtBh"
address: "web dev//crawling//indexing"
name: "indexing"
date: "2026-09-08"
aliases: ["search index", "indexer"]
---
Transforming and storing content so it can be retrieved efficiently later through searches. It is not "understanding the page"; it is putting it in a library with a useful catalog.
- The index is a data structure (an inverted index from terms to documents, plus signals) built from what [[KAtZ68eQ|parsing]] produced. It answers "which documents mention this" in milliseconds, which no pile of fetched pages can.
- Crawler and indexer are different jobs: the crawler gets documents, the indexer prepares them to be found. The chain is crawler, then pages, then indexer, then index, then the [[yuBE6OTQ|search engine]].
- Whether a page may enter the index at all is [[qmp1wh7j|indexability]]; which of several copies represents it is [[7CmKo3ct|canonical]]. A page can be crawled and never indexed.

## Interactions

- [[Cw5rNx6K|Crawler]] : : The crawler collects documents and the indexer prepares them for retrieval; a site can be fully crawled and absent from search if the second job never happens. Crawl budget and index budget are separate scarcities
