---
uid: "chH7mwPq"
address: "Blockchain//Consensus//Clique"
name: "Clique"
date: "2025-04-14"
---
- Proof of Authority: a fixed set of authorized validators take deterministic turns signing blocks
- Turn order determined by block number and the list of signers
- "In-turn" signer has priority; "out-of-turn" signers add a random delay to avoid conflicts
- Adding/removing validators requires on-chain voting via `clique_propose` — majority needed
- Single malicious validator can censor transactions during their turn — but other validators will include them next

---
[[gpJAZA70|Quorum]] :: Clique's safety depends on the quorum rule: floor(N/2)+1 validators must agree
[[H7v6Q9oF|Voting]] :: validator set changes through on-chain governance, not by editing genesis.json

