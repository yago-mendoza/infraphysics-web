---
uid: "Wp2y5eP8"
address: "Blockchain//Bootnode"
name: "Bootnode"
date: "2025-03-09"
---
- Discovery entry point — new nodes contact bootnodes to learn about other peers in the network
- Not a special node type — any node can be a bootnode if others list its enode in `--bootnodes`
- Multiple bootnodes = resilience: if one goes down, newcomers can use others
- After initial discovery, nodes find each other through gossip — the bootnode's job is done
- Best topology: mutual bootnode pointing (A→B, B→A) + all nodes listing both
- If the only bootnode dies, existing nodes keep working (they know peers) — only newcomers are affected

---
[[ML9qhFCx|Besu Enode]] :: the enode URL encapsulates both the cryptographic identity and network location of a bootnode

