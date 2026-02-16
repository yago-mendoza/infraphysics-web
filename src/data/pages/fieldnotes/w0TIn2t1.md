---
uid: "w0TIn2t1"
address: "Blockchain//State"
name: "State"
date: "2025-03-09"
---
- "World state" = snapshot of all account balances, contract storage, nonces at a given block height
- Full nodes independently verify state by re-executing all transactions in each received block
- If a full node's computed state hash ≠ the proposer's claimed hash → block is rejected
- This is why blockchain is trustless: every node can verify every claim from scratch

---
[[Ixdu9hgo|ECDSA]] :: blocks are signed with ECDSA — nodes verify the signature to confirm the proposer's identity before re-executing

