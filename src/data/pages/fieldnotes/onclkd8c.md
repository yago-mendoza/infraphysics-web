---
uid: "onclkd8c"
address: "RPC//Infura"
name: "Infura"
date: "2025-08-19"
---
- Node-as-a-Service: runs full Ethereum nodes so you don't have to sync one yourself
- API Key authenticates and rate-limits your usage — NOT for cryptographic security of transactions
- Acts as a gateway: receives your signed transaction, relays it to its fleet of nodes, which gossip it to the network
- Flow: your DApp → HTTPS → Infura → TCP/P2P gossip → validators
- Transaction security comes from [[Ixdu9hgo|ECDSA]] signatures done in the wallet, not from Infura's infrastructure

---
[[Ixdu9hgo|ECDSA]] :: Infura never touches your private key — transactions arrive already signed, Infura just relays them

