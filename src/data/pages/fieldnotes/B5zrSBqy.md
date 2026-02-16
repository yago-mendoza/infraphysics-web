---
uid: "B5zrSBqy"
address: "Crypto//Key Pair"
name: "Key Pair"
date: "2025-06-14"
---
- Private key: 256-bit random number — generated off-chain, never shared, never sent over the network
- Public key: derived from private key via elliptic curve multiplication (one-way function)
- Address: last 20 bytes of `keccak256(publicKey)` — the short form used on-chain
- Same seed string → same deterministic key pair (`keccak256(utf8Bytes(seed))`) — useful for reproducible test environments
- Two nodes sharing the same private key = irreconcilable conflict (duplicate nonces, indistinguishable signatures)

---
[[kQcY7a5n|HD Wallet]] :: HD wallets generate an entire tree of key pairs from a single master seed

