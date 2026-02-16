---
uid: "T0U5VL9d"
address: "Docker//Port Mapping"
name: "Port Mapping"
date: "2025-02-03"
---
- `-p 9999:8545` maps host port 9999 to container port 8545 — the bridge between worlds
- Without `-p`, a container's ports are invisible from the host
- Not a security hole — acts as a controlled bridge for one specific port+container, rest stays isolated
- `-p` is for network, `-v` is for files — both bridge host↔container but in different dimensions
- Only expose what's needed: if one node needs RPC access, only map that node's port

---
[[1gCBEfat|Security: Minimum Privilege]] :: port mapping follows least privilege — expose only the RPC nodes that external clients need

