---
uid: "dL13xOGB"
address: "Blockchain//Besu//Node Roles//Validator"
name: "Validator"
date: "2026-02-17"
---
- Address listed in genesis [[W30pa8xC|extraData]] — authorized to sign blocks in IBFT/QBFT consensus
- Validators take turns proposing blocks; remaining validators verify and vote
- Adding/removing validators requires a governance mechanism (voting or smart contract)
- One node can wear multiple hats (bootnode + validator + RPC), but separation is more secure
- Ideal: dedicated validator with no RPC exposed — reduces attack surface to zero from outside

---
[[1gCBEfat]] :: validators should never expose RPC — minimum privilege applied to block signers
