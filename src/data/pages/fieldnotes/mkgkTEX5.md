---
uid: "mkgkTEX5"
address: "Blockchain//Besu//Stall"
name: "Stall"
date: "2025-05-18"
---
- Network "stall" = blocks stop being produced, transactions stuck in [[WVcyM3Sp|mempool]] forever
- Most common cause: quorum failure — not enough validators online to reach `floor(N/2)+1`
- 2-validator network: if either goes down, the network stalls immediately (quorum = 2)
- RPC still responds to read queries, but write operations (transactions) never confirm
- Diagnosis: check peer count on each validator, verify P2P connectivity between them

---
[[gpJAZA70|Quorum]] :: quorum is the first thing to check when a Clique network stalls

