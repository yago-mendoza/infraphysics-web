---
uid: "0YSqmnyU"
address: "Blockchain//Besu//Node Roles//RPC Node"
name: "RPC Node"
date: "2026-02-17"
---
- Port mapped with `-p` in Docker — external applications (dApps, wallets, scripts) connect here
- Serves JSON-RPC API: `eth_sendTransaction`, `eth_getBalance`, `eth_call`, etc.
- Does not need to be a validator or bootnode — just a full node with API ports exposed
- One node can wear multiple hats (bootnode + validator + RPC), but separation is more secure
- Ideal: dedicated RPC node that's neither validator nor bootnode — single purpose, minimal exposure

---
[[1gCBEfat]] :: only map RPC ports on nodes that external clients actually connect to
