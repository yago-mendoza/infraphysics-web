---
uid: "DGPxwG79"
address: "RPC//JSON-RPC"
name: "JSON-RPC"
date: "2025-08-19"
---
- Format: `{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}`
- Response: `{"jsonrpc":"2.0","id":1,"result":"0x87"}` — values are hex-encoded
- Key methods: `eth_getBalance`, `eth_blockNumber`, `eth_sendRawTransaction`, `eth_getTransactionReceipt`
- Querying one node returns state for any account — the full world state is replicated on every full node

---
[[PgionCm1|RPC]] :: JSON-RPC is the wire protocol; the RPC port is where the node listens for these requests

