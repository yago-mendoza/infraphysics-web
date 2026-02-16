---
uid: "2HSHagKF"
address: "Crypto//Keystore"
name: "Keystore"
date: "2025-10-11"
---
- Legacy approach: each account stored as an individual encrypted JSON file in `/data/keystore`
- The node software (Geth) held the keys and signed transactions on behalf of the user
- Volume mapping (`-v`) was critical: keystore files must persist outside the container
- Now largely replaced by [[kQcY7a5n|HD wallets]] — signing delegated to Metamask instead of the node

---
[[kQcY7a5n|HD Wallet]] :: HD wallets replaced per-file keystore management with a single seed phrase for all accounts

