---
uid: "C3w8sWpi"
address: "Blockchain//Besu"
name: "Besu"
date: "2025-05-02"
---
- Hyperledger Besu: Java-based Ethereum client, supports PoA (Clique/QBFT) and PoS networks
- Can run entirely via Docker image (`hyperledger/besu`) — no local Java/JDK install required
- Node identity = Ethereum account (key pair + address)
- Configuration layers: [[UFgfX2Jv|genesis.json]] (network rules) + [[ALVPHbmK|config.toml]] (node behavior) + CLI flags

---
[[UFgfX2Jv|Besu Genesis]] :: genesis.json defines the blockchain's birth certificate
[[ALVPHbmK|Besu Config]] :: config.toml tunes individual node behavior

