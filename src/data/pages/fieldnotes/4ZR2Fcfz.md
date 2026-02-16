---
uid: "4ZR2Fcfz"
address: "Blockchain//Besu//Deployment"
name: "Deployment"
date: "2025-05-18"
---
- Correct order: 1) Create Docker network → 2) Generate keys → 3) Build genesis.json with those keys → 4) Launch bootnode → 5) Launch remaining nodes
- Keys must exist before genesis: genesis needs the validator's address in [[W30pa8xC|extraData]]
- Identity creation: `besu public-key export-address --data-path=/data/n1 --to=/data/n1/addr`
- `--data-path` creates the key files; `--to` exports the human-readable address as a convenience

---
[[Nohc505O|Besu Funding]] :: after generating keys, use their addresses in genesis `alloc` to pre-fund accounts

