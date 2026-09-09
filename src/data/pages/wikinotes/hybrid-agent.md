---
slug: hybrid-agent
uid: "rpdysn6f"
address: "ML//agent//hybrid agent"
name: "hybrid agent"
date: "2026-09-08"
aliases: ["tool-mixing agent"]
---
An agent that combines several sources and mechanisms: an existing search index, direct navigation, browser automation, APIs. It does not traverse the Internet from scratch; at each step it picks the cheapest or most useful tool.

{bkqt/keyconcept|A typical run}
A question, then a search engine, then five candidates, then reasoning, then two pages opened, then one of them rendered in a browser, then an API queried for one more figure, then the answer.
{/bkqt}

- Each tool has a cost and a coverage: search is cheap and shallow, a fetch is cheap and precise, rendering is expensive and complete, an API is exact when it exists. The hybrid agent's skill is the routing, not any single tool ([[mydQy6ia|Tool Use]]).
- It is the practical form of a [[QOPrOeTc|web agent]], and the reason the reading side of the web is no longer only crawlers and browsers but a third kind of client with judgment.

## Interactions

- [[ActP3rcp|Active Perception]] : : Choosing between search, fetch and render is choosing which observation to buy at which price; active perception is the general principle, the hybrid agent is it applied to the tools of the web
