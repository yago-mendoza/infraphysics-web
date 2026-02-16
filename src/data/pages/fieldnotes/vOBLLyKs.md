---
uid: "vOBLLyKs"
address: "Blockchain//Sync"
name: "Sync"
date: "2025-10-11"
---
- Full sync: download all blocks from genesis, re-execute every transaction — days to weeks for Mainnet
- Slow because verification is CPU-bound: millions of transactions must be re-executed to rebuild current state
- Light clients (like [[uCuLAMTU|Metamask]]) skip all this: trust an already-synced RPC node for instant access
- Archive sync: even slower and larger — stores the full state after every block, not just the latest

---
[[N8SypUVq|Node]] :: sync mode determines the tradeoff between trustlessness, storage, and startup time

