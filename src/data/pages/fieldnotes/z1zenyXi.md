---
uid: "z1zenyXi"
address: "Blockchain//Besu//Self-Reference"
name: "Self-Reference"
date: "2025-09-07"
---
- Bootnode configured with its own enode in `--bootnodes` — causes P2P initialization anomalies
- The node attempts to "discover itself" → enters retry loops → accepts incoming connections only intermittently
- Not a timing issue — the corrupted P2P state persists regardless of how long you wait
- Fix: never include a node's own enode in its `--bootnodes` list

---
[[u0He1l4k|Race Condition]] :: self-referencing is the root cause of most "some nodes connect, others don't" problems

