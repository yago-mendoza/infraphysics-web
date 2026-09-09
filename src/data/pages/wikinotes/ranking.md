---
slug: ranking
uid: "PTYwZyrc"
address: "web dev//crawling//search engine//ranking"
name: "ranking"
date: "2026-09-08"
aliases: ["relevance ranking", "PageRank"]
---
Ordering results or URLs by some estimate of relevance or priority. Of a hundred possible things, which deserve attention first?
- Ranking happens twice in a [[yuBE6OTQ|search engine]]: once in the [[C3thKIgo|scheduler]], to decide which URLs to fetch first, and once at query time, to order the documents the [[GYSeFtBh|index]] returns.
- The classic link-based signal, PageRank, treats the web as a graph and scores a page by the probability that a random surfer following links ends up on it. Text relevance, freshness, user signals and hundreds of other features are layered on top; the exact function is the engine's secret.
- Anything designed to manipulate that estimate rather than to earn it is [[dSiDXsDk|spam]].

## Interactions

- [[4lWVJGgV|stationary distribution]] : : PageRank is the stationary distribution of a random walk on the link graph, with a teleport term to make the chain irreducible and aperiodic. The abstract note explains why that distribution exists and is unique; this one is what it was invented for
