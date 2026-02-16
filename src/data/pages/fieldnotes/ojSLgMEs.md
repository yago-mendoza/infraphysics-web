---
uid: "ojSLgMEs"
address: "Blockchain//Block"
name: "Block"
date: "2025-03-08"
---
- Blocks bundle transactions — created by validators at regular intervals
- `gasLimit` caps the total computation per block — sum of all transaction gas can't exceed it
- `blockPeriodSeconds` controls creation interval — even empty blocks if configured (Clique)
- If a transaction fills the gas limit, remaining transactions wait in the [[WVcyM3Sp|mempool]] for the next block

---
[[WVcyM3Sp|Mempool]] :: transactions that don't fit in the current block stay in the mempool for the next

