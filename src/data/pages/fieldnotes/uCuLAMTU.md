---
uid: "uCuLAMTU"
address: "Blockchain//Wallet//Metamask"
name: "Metamask"
date: "2025-07-06"
---
- Browser extension that injects an `ethereum` object into every web page's DOM
- `ethereum.request({ method: 'eth_requestAccounts' })` triggers Metamask's approval popup
- NOT a node — it's a light client that delegates blockchain queries to an RPC endpoint (default: Infura)
- Password encrypts the seed phrase in browser local storage — unlock = decrypt → derive keys on the fly
- Switching networks = changing RPC URL + chainId — tells Metamask where to send and what chain to sign for

---
[[PYsPVUGS|Signing]] :: Metamask handles all signing locally — the private key never leaves the extension

