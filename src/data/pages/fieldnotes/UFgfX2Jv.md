---
uid: "UFgfX2Jv"
address: "Blockchain//Besu//Genesis"
name: "Genesis"
date: "2025-05-02"
---
- `genesis.json` defines the blockchain at birth — chainId, consensus type, initial state, gas limits
- The blockchain is "born" when the first node boots and processes this file
- `alloc` section: pre-fund accounts with ETH at block 0 — solves the bootstrap funding problem
- `clique.blockperiodSeconds`: interval between blocks (even empty ones)
- Immutable foundation: the chainId and consensus rules cannot be changed after launch
- Must be created AFTER generating node keys — needs at least one validator address for [[W30pa8xC|extraData]]

---
[[W30pa8xC|ExtraData]] :: the extraData field encodes the initial validator set
[[4ZR2Fcfz|Deployment]] :: genesis creation is step 3 of the deployment sequence — after keys, before launch

