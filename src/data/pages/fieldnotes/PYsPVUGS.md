---
uid: "PYsPVUGS"
address: "Blockchain//Wallet//Signing"
name: "Signing"
date: "2025-07-07"
---
- Metamask receives signing requests from DApps, shows them to the user, signs with the local private key
- `personal_sign`: sign arbitrary data for off-chain authentication — no transaction created
- `eth_sendTransaction`: Metamask signs the transaction and sends it to the RPC node — standard DApp flow
- Admin Faucet pattern: backend signs with a server-side key (from `.env`) — solves the "chicken and egg" funding problem
- EIP-712: structured data signing includes the contract address in the domain hash — prevents cross-contract replay

---
[[Ixdu9hgo|ECDSA]] :: all wallet signing uses ECDSA — private key produces a signature verifiable with the public key

