---
uid: "x8NRc1xE"
address: "infraphysics"
name: "infraphysics"
date: "2026-03-19"
---

Personal website and Second Brain. Built with [[Rc4pBn9L|React]] + TypeScript, bundled by [[Vp8rBm5J|Vite]], hosted on Cloudflare Pages.

- The site has two faces: a public portfolio (projects, threads, tutorials) and a private-in-public knowledge graph (500+ fieldnotes with bilateral references, a force-directed graph view, and full-text search)
- Content is authored in markdown with 16 [[JkzQf7qt|custom syntax]] extensions and compiled at [[Ht6nWx3K|build]] time by a [[E9olQ6Ox|compiler]] pipeline (marked + Shiki) into JSON payloads with pre-rendered HTML
- [[gk4wYqzk|Claude Code]] is the primary development interface, configured with [[IrqO45BY|skills]], hooks, and automation rules in CLAUDE.md that enforce build validation, editorial standards, and fieldnote integrity on every change
- The result is a system where an AI agent and a human share a codebase with explicit contracts: Claude Code knows how to run the build, validate references, check segment collisions, and create fieldnotes that comply with the graph's structural rules

## Interactions

- [[gk4wYqzk|Claude Code]] : : Claude Code is the authoring and development interface: skills trigger builds, validate references, and enforce editorial rules defined in CLAUDE.md
- [[E9olQ6Ox|Compiler]] : : the compiler transforms markdown fieldnotes into the JSON/HTML payloads that the site serves
