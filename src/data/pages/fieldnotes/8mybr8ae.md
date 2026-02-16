---
uid: "8mybr8ae"
address: "Blockchain//Chain ID"
name: "Chain ID"
date: "2025-03-22"
---
- Unique integer identifier for each blockchain network — Mainnet=1, Sepolia=11155111, custom=anything
- Included in transaction signatures: a tx signed for chainId 1 is invalid on chainId 5
- Metamask uses chainId + RPC URL to know which blockchain it's talking to
- Immutable after network launch — changing chainId in genesis.json after the first block breaks everything
- Part of the P2P handshake: nodes reject peers with different chain IDs during initial connection

---
[[u55brDFI|Replay Attack]] :: chainId is the primary defense against cross-chain replay attacks (EIP-155)

