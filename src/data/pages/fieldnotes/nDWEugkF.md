---
uid: "nDWEugkF"
address: "networking//Port"
name: "Port"
date: "2025-02-04"
---
- Ports are like apartment numbers on an IP address — each service gets its own
- Below 1024: "well-known" / privileged (HTTP=80, HTTPS=443, SSH=22) — often require admin rights
- 1024–49151: registered ports (8545=Besu RPC, 30303=Besu P2P, 3000=dev servers)
- Besu uses two main ports: `p2pPort` (30303) for horizontal node↔node, `rpcPort` (8545) for vertical app→node

---
[[T0U5VL9d|Docker Port Mapping]] :: `-p 9999:8545` remaps the container's internal port to a different host port — avoids conflicts

