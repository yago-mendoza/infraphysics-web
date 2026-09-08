---
uid: "J2OCjPpb"
address: "Blockchain//Besu//Node Roles//Bootnode"
name: "Bootnode"
date: "2026-02-17"
distinct: ["Blockchain//Bootnode"]
---
- In a Besu network: other nodes list its enode in `--bootnodes`, the discovery entry point.
- Not a special node type. Any node _can_ be a bootnode if others point to it.
- One node can wear multiple hats (bootnode + validator + RPC), but separation is more secure.
- Ideal: dedicated bootnode with no RPC, only P2P connectivity, minimal attack surface.

## Interactions

- [[Wp2y5eP8]] : : General bootnode concept: discovery mechanics, gossip protocol, resilience patterns
- [[1gCBEfat]] : : Bootnodes should not expose RPC: minimum privilege applied to discovery nodes
