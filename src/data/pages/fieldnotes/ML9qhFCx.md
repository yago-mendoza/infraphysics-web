---
uid: "ML9qhFCx"
address: "Blockchain//Besu//Enode"
name: "Enode"
date: "2025-05-03"
---
- Format: `enode://<public-key>@<ip>:<port>` — cryptographic identity + network location in one URL
- The public key prevents man-in-the-middle attacks — nodes verify identity during the RLPx handshake
- IP must be explicit — Besu doesn't resolve Docker hostnames inside enode URLs
- The single most critical piece of information for joining a network — who + where
- Mismatched public key → connection rejected during handshake

---
[[Ixdu9hgo|ECDSA]] :: the enode public key is verified through ECDSA during the P2P handshake — proves the peer's identity

