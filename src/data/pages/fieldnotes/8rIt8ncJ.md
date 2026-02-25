---
uid: "8rIt8ncJ"
address: "Blockchain//Besu//Node Roles//Full Node"
name: "Full Node"
date: "2026-02-17"
---
- Stores and verifies the entire chain — downloads every block, validates every transaction
- No special privileges — it's the baseline that every other role builds on
- A validator is a full node + signing authority; an RPC node is a full node + exposed API
- "Full" distinguishes from light clients (which only fetch headers) — Besu nodes are always full
- Every node in a private IBFT/QBFT network is a full node by default — the distinction matters more in public chains

