---
slug: url-frontier
uid: "buJhwqNb"
address: "web dev//crawling//URL frontier"
name: "URL frontier"
date: "2026-09-08"
aliases: ["crawl queue", "frontier"]
---
The set of known URLs still waiting for a decision about whether they will be visited. The list of places you might go later.
- It grows with every [[OkRULEb0|discovery]] and shrinks with every [[JGc7uotQ|fetch]]. On the open web it never empties: the frontier is always larger than what will ever be crawled, so the decision of what to take from it matters more than the list itself.
- The [[C3thKIgo|scheduler]] is the doorman of that queue: priority, politeness per host, freshness and crawl budget are its criteria.
- A frontier is a queue with a policy, not a to-do list. Deduplication (the same page under several URLs, see [[7CmKo3ct|canonical]]) and robots rules ([[Cx7nWr4L|robots.txt]]) prune it before anything is fetched.

## Interactions

- [[Vo1nf0rm|Value of Information]] : : A crawler prunes its frontier with rules (depth, host, freshness); an agent prunes the same list by asking which fetch would change its answer most. Same queue, a policy versus a judgment
