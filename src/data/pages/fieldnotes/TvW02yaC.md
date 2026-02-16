---
uid: "TvW02yaC"
address: "Blockchain//Fork"
name: "Fork"
date: "2025-03-09"
---
- Temporary forks happen when two validators create competing blocks at the same height due to network latency
- Resolution: the chain that gets the next block built on top of it becomes canonical (longest chain rule)
- The "losing" block is discarded (becomes an uncle/ommer)
- In Clique PoA, this is rare due to turn-based signing — but latency can still cause brief bifurcations

---
[[chH7mwPq|Clique]] :: Clique's deterministic turns minimize forks, but network latency can still cause them

