---
uid: "Nohc505O"
address: "Blockchain//Besu//Funding"
name: "Funding"
date: "2025-09-07"
---
- "Chicken and egg": need an address to fund it in genesis, but can't create genesis until keys are generated
- Solution: two-phase script — 1) generate keys to get addresses → 2) build genesis.json with those addresses in `alloc`
- Gotcha: if Docker mounts a stale genesis.json from a cached path, nodes get the old version without balances
- Admin Faucet: a backend that signs funding transactions with a pre-funded private key stored in `.env`

---
[[UFgfX2Jv|Besu Genesis]] :: the `alloc` section is where you pre-fund accounts to bootstrap the network economy

