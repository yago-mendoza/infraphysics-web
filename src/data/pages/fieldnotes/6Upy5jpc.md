---
uid: "6Upy5jpc"
address: "Blockchain//Besu//Node Roles"
name: "Node Roles"
date: "2025-05-18"
---
- Every Besu node is a full node — the roles describe what additional responsibilities it carries
- One node can wear multiple hats (bootnode + validator + RPC), but separation is more secure
- Ideal topology: dedicated bootnode (no RPC), dedicated validator (no RPC), dedicated RPC node (no validator)
- Role assignment is about port exposure and genesis config — not different binaries

---
[[1gCBEfat]] :: separating roles minimizes attack surface — validators should never expose RPC
[[J2OCjPpb]] :: discovery entry point — other nodes list its enode in --bootnodes
[[dL13xOGB]] :: block signer — address listed in genesis extraData
[[0YSqmnyU]] :: external API gateway — port mapped for dApps and wallets
[[8rIt8ncJ]] :: baseline — stores and verifies the chain, no special privileges

