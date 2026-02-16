---
uid: "uMaVCTAm"
address: "networking//Gateway"
name: "Gateway"
date: "2025-02-04"
---
- Default gateway is the router's IP (e.g. 192.168.1.1) — first hop for any traffic destined outside the LAN
- Docker has its own gateway (e.g. 172.20.0.1) for containers to reach the outside world
- Container → Docker gateway → host NAT → internet: Docker applies Network Address Translation for outbound traffic
- Conceptually analogous to a [[Wp2y5eP8|bootnode]]: both are the first point of contact for reaching the broader network

---
[[Wp2y5eP8|Bootnode]] :: bootnodes and gateways are functionally analogous — entry/exit points for their respective networks

