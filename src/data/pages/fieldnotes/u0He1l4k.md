---
uid: "u0He1l4k"
address: "Blockchain//Besu//Race Condition"
name: "Race Condition"
date: "2025-09-07"
---
- Non-deterministic startup: launching nodes in rapid succession without pauses can leave some nodes isolated
- Root cause: the bootnode's P2P module may not be fully initialized when later nodes try to connect
- [[z1zenyXi|Self-referencing]] bootnode makes this worse — P2P enters flaky retry loops
- `sleep` doesn't fix a state problem — the bootnode may accept connections intermittently regardless of wait time
- Symptoms: some nodes connect, others report 0 peers — inconsistent across runs

---
[[z1zenyXi|Self-Reference]] :: the self-referencing bootnode is the most common trigger for race conditions in Besu deployments

