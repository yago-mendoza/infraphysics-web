---
uid: "N8SypUVq"
address: "Blockchain//Node"
name: "Node"
date: "2025-02-22"
---
- **Full Node**: stores the current state, prunes old intermediate states — validates everything independently
- **Archive Node**: stores a state snapshot after every block — can query historical balances at any point, much larger
- **Light Client**: doesn't sync the full chain — trusts an RPC node (like Infura) for instant data access
- Full nodes re-execute every transaction in each received block to verify the state hash matches
- If computed state hash ≠ proposer's claimed hash → block rejected, discarded, wait for a valid one

---
[[vOBLLyKs|Blockchain Sync]] :: sync mode determines the tradeoff between trust, storage, and startup time

