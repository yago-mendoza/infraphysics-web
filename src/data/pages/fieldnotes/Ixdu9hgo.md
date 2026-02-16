---
uid: "Ixdu9hgo"
address: "Crypto//ECDSA"
name: "ECDSA"
date: "2025-06-14"
---
- Elliptic Curve Digital Signature Algorithm — signs data with private key, verifiable with public key
- Signature + message hash + public key → mathematical proof that the signer holds the corresponding private key
- Used for: transaction signing, block signing, personal message signing (`personal_sign`)
- Infura API keys are NOT ECDSA — they're service authentication tokens, not cryptographic signatures

---
[[ML9qhFCx|Besu Enode]] :: ECDSA verification during P2P handshake prevents man-in-the-middle attacks

