---
slug: parsing
uid: "KAtZ68eQ"
address: "web dev//crawling//parsing"
name: "parsing"
date: "2026-09-08"
aliases: ["HTML parsing", "parse"]
---
Turning raw content (HTML, JSON, XML) into a structure a program can interpret. From "a string of characters" to "this is a title, this is a link, this is a paragraph".
- The parser does not decide what matters; it only makes the structure available. What comes out is a tree (for HTML, the same kind of tree a browser builds as its [[jaoEDAPx|DOM]]) that later stages walk.
- It follows [[JGc7uotQ|fetching]] and precedes both [[baInedI5|scraping]], which picks specific data out of the tree, and [[GYSeFtBh|indexing]], which files the whole document. Links found while parsing feed [[OkRULEb0|discovery]] again.
- Structured formats make parsing cheap and unambiguous, which is the whole argument for [[Sd3mPx7R|Structured Data]] and for [[Ap8rTm3K|APIs]] over pages.
