---
uid: "cgOcsEWf"
address: "networking//LAN"
name: "LAN"
date: "2025-02-04"
---
- LAN (192.168.x.x) is your local network — devices on the same WiFi/router
- Host's LAN IP, Docker's virtual network, and localhost are three parallel, isolated layers
- Communication between layers requires explicit bridges: `-p` for Docker↔host, port forwarding for LAN↔internet
- To let a friend access your local Besu: router port forwarding → public IP → host → Docker port map → container

---
[[uMaVCTAm|Gateway]] :: the gateway (192.168.1.1) is your LAN's exit point — the first hop to reach anything outside

