---
uid: "vUgG0AQ4"
address: "Blockchain//Wallet//Network"
name: "Network"
date: "2025-07-07"
distinct: ["Docker//Network"]
---
- Switching networks in Metamask = changing the RPC endpoint URL + Chain ID
- Metamask has zero knowledge of Docker networks — it only understands RPC URLs and chainIds
- Connecting to local Besu: add custom network with `http://localhost:9999` + the genesis chainId
- DApps like Uniswap fail on local networks: the smart contracts don't exist there (different chain)

---
[[8mybr8ae|Chain ID]] :: chainId tells Metamask which blockchain to sign for — crucial for [[u55brDFI|replay protection]]

