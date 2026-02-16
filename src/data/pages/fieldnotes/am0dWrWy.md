---
uid: "am0dWrWy"
address: "Crypto//Derivation Path"
name: "Derivation Path"
date: "2025-06-14"
---
- BIP-44 standard: `m/44'/60'/0'/0/x` where x is the account index
- `44` = BIP-44 purpose, `60` = Ethereum coin type (Bitcoin=0), `0` = default account group, `x` = address index
- Ensures Bitcoin and Ethereum keys never overlap even from the same seed
- "Add Account" in Metamask simply increments x (0→1→2→...) — regenerates deterministically, no new randomness

---
[[kQcY7a5n|HD Wallet]] :: the derivation path is why HD wallets can regenerate the exact same accounts from a seed phrase

