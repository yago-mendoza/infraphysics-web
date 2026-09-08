---
uid: "HJEZD7NK"
address: "Security//cryptography"
name: "cryptography"
date: "2025-06-14"
---
- Cryptographic primitives that make blockchain trustless: signing, verification, hashing.
- Key pairs generated entirely off-chain, no blockchain connection needed.
- Probability of two keys colliding is astronomically low (2^256 keyspace)
- The private key is the master secret: everything else (public key, address) derives from it.

## Interactions

- [[B5zrSBqy|Key Pair]] : : The private→public→address derivation chain is the foundation of all blockchain identity
