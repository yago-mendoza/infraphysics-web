---
slug: soft-404
uid: "Sf8jLb4P"
address: "web dev//SEO//soft 404"
name: "soft 404"
date: "2026-09-19"
---
A soft 404 is a URL that does not exist and still answers with status 200 and real content, typically the home page. It is the default behaviour of a single-page site whose server returns the same document for any path: `/does-not-exist` shows the front page and tells the client that everything went well.

The harm depends on whether the host is indexable. Every mistyped or invented address becomes one more copy of the home page that a search engine may index, and Google names the pattern and penalises it. The fix is for unknown paths to answer with a real 404 status.

## Interactions

- [[Pd4kVz8N|pages.dev]] : : The same behaviour is harmless on a host served with noindex, where no engine is looking, and becomes a defect the day the site moves to its own indexable domain
- [[GYSeFtBh|indexing]] : : A soft 404 is a duplicate manufactured by the server: the indexer receives a valid page at an address that should not exist
