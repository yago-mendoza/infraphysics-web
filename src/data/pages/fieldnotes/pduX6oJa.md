---
uid: "pduX6oJa"
address: "Docker//Network"
name: "Network"
date: "2025-02-03"
distinct: ["Blockchain//Wallet//Network"]
---
- Docker creates virtual networks isolated from the host LAN — each with its own IP range
- `--network mi-red` connects a container to a named network
- Built-in DNS: containers resolve each other by name (`nodo1` → IP) within the same network
- `http://nodo-besu:8545` works inside Docker — most robust way for inter-container communication
- Docker network ≠ blockchain network: Docker is the transport layer (the road), blockchain is the application layer (the club rules)

---
[[N5TGil9j|Docker Subnet]] :: each network gets its own subnet — Docker assigns IPs from that range

