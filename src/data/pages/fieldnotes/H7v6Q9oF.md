---
uid: "H7v6Q9oF"
address: "Blockchain//Consensus//Voting"
name: "Voting"
date: "2025-04-14"
---
- `clique_propose(address, true)` from an existing validator starts the voting process to add a new one
- Requires >50% of current validators to vote yes — strict majority rule
- Single validator network: one vote = 100% → proposal accepted immediately
- Three validators: need 2 votes (>50% of 3) to approve any change
- Voting is on-chain — no need to modify genesis.json or restart nodes

---
[[chH7mwPq|Clique]] :: Clique's governance is fully on-chain and dynamic — no downtime for validator changes

