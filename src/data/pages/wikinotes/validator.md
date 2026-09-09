---
slug: validator
uid: "dL13xOGB"
address: "blockchain//Besu//node roles//validator"
name: "validator"
date: "2026-02-17"
---
- Address listed in genesis [[W30pa8xC|extraData]]: authorized to sign blocks in IBFT/QBFT consensus.
- Validators take turns proposing blocks; remaining validators verify and vote.
- Adding/removing validators requires a governance mechanism (voting or smart contract)
- One node can wear multiple hats (bootnode + validator + RPC), but separation is more secure.
- Ideal: dedicated validator with no RPC exposed. Reduces attack surface to zero from outside.

## Interactions

- [[1gCBEfat]] : : Validators should never expose RPC: minimum privilege applied to block signers
