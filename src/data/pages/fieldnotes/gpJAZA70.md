---
uid: "gpJAZA70"
address: "Blockchain//Consensus//Quorum"
name: "Quorum"
date: "2025-04-14"
---
- Quorum = `floor(N/2) + 1` — the minimum valid signatures to produce a block
- 2 validators → quorum = 2 → ZERO fault tolerance (either goes down → network stalls)
- 3 validators → quorum = 2 → can tolerate 1 failure
- 4 validators → quorum = 3 → still only tolerates 1 failure
- Key insight: 2-validator networks have NO high availability — both must be online at all times

---
[[mkgkTEX5|Besu Stall]] :: quorum failure is the #1 cause of network stalls in small Clique networks

