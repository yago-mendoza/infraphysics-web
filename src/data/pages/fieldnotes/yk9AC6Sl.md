---
uid: "yk9AC6Sl"
address: "Blockchain//Transaction"
name: "Transaction"
date: "2025-03-08"
---
- Lifecycle: wallet signs → RPC node receives → mempool → gossip to peers → validator includes in block → confirmed
- `eth_sendRawTransaction`: accepts a pre-signed transaction — the RPC node just relays it
- `eth_sendTransaction`: requires the node to have the signing key — legacy, rarely used now
- Valid signature alone isn't enough — sender must have ETH to cover `gas × gasPrice` (upfront cost)
- Nonce: sequential counter per account — prevents replay and enforces transaction ordering

---
[[PYsPVUGS|Wallet Signing]] :: modern flow: wallet (Metamask) signs locally, then sends the raw signed transaction to an RPC node

