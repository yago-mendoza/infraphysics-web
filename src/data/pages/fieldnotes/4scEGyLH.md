---
uid: "4scEGyLH"
address: "Blockchain//Besu//Empty Blocks"
name: "Empty Blocks"
date: "2025-10-11"
---
- Clique produces blocks at fixed intervals (`blockPeriodSeconds`) even when there are no transactions
- `blockPeriodSeconds=0`: blocks created at maximum CPU speed → infinite loop, disk fills rapidly
- Empty blocks maintain the chain's heartbeat — validators take turns, timestamps advance
- The block number keeps incrementing regardless of transaction activity

---
[[UFgfX2Jv|Besu Genesis]] :: `blockPeriodSeconds` in the Clique config of genesis.json controls the block creation rhythm

