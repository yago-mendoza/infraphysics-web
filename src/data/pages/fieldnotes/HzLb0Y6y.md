---
uid: "HzLb0Y6y"
address: "Crypto//Seed Phrase"
name: "Seed Phrase"
date: "2025-06-14"
---
- 12-24 words (BIP-39 standard) — a human-readable encoding of random entropy
- Entropy → mnemonic words → PBKDF2 → 512-bit binary seed → master key + chain code
- The seed phrase IS the wallet — anyone who has it controls all derived accounts
- Independent from the device password: password = local convenience lock, seed phrase = ultimate master backup
- Entropy comes from the device's random number generator (OS + user interactions for unpredictability)

---
[[am0dWrWy|Derivation Path]] :: from the master key, each account is derived via a structured path (m/44'/60'/0'/0/x)

