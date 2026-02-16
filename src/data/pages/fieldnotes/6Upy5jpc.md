---
uid: "6Upy5jpc"
address: "Blockchain//Besu//Node Roles"
name: "Node Roles"
date: "2025-05-18"
---
- **Bootnode**: other nodes list its enode in `--bootnodes` — discovery entry point
- **Validator**: address listed in genesis [[W30pa8xC|extraData]] — authorized to sign blocks
- **RPC Node**: port mapped with `-p` — external applications connect here
- **Full Node**: stores and verifies the chain — no special privileges
- One node can wear multiple hats (bootnode + validator + RPC), but separation is more secure
- Ideal: dedicated bootnode (no RPC), dedicated validator (no RPC), dedicated RPC node (no validator)

---
[[1gCBEfat|Security: Minimum Privilege]] :: separating roles minimizes attack surface — validators should never expose RPC

