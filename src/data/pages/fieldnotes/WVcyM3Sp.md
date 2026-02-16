---
uid: "WVcyM3Sp"
address: "Blockchain//Mempool"
name: "Mempool"
date: "2025-03-08"
---
- The "waiting room" for unconfirmed transactions — every node maintains its own
- Transactions enter via RPC, then get gossipped to other nodes' mempools
- Validators pull from their own mempool to build blocks
- If the network stalls (no new blocks), transactions sit in mempool indefinitely — accepted but never confirmed

---
[[6AczGctL|Gossip]] :: mempools synchronize across the network through the gossip protocol

