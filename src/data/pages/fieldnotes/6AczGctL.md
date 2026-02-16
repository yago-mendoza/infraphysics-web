---
uid: "6AczGctL"
address: "Blockchain//Gossip"
name: "Gossip"
date: "2025-03-08"
---
- Cascade propagation: a node tells its neighbors, they tell theirs — information spreads exponentially
- Both new transactions and newly created blocks propagate this way
- Primarily over TCP — reliable, ordered delivery is critical for reconstructing blocks correctly
- [[Wp2y5eP8|Bootnode]] initiates the cascade by introducing new nodes to a subset of peers
- Fully decentralized — no central broadcaster, no single point of failure

---
[[Wp2y5eP8|Bootnode]] :: the bootnode seeds the initial gossip connections — after that, peers discover each other organically

