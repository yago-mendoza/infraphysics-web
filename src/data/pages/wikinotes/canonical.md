---
slug: canonical
uid: "7CmKo3ct"
address: "web dev//SEO//canonical"
name: "canonical"
date: "2026-09-08"
aliases: ["canonical URL", "rel=canonical"]
---
A signal that says which URL should be considered the main version of duplicated or equivalent content. "This is the official copy."
- The same page often lives under several URLs: with and without trailing slash, with tracking parameters, under a print view, on http and https. The canonical tag (or header) tells the [[GYSeFtBh|indexer]] to consolidate them into one entry and to credit that one.
- Both URLs keep working; the visitor is not sent anywhere. That is the difference with a [[lEhsh37n|redirect]], which actually moves the client to the other address.
- It is a hint, not an order: an engine can pick another canonical if signals disagree. Consistent internal links and the [[Sm9pLx3R|sitemap]] should all point at the same version.

## Interactions

- [[lEhsh37n|redirect]] : : Canonical declares a preference while both URLs stay alive; a redirect enforces it by sending the client away. Use canonical when the variants must keep working, redirect when the old address should stop existing
