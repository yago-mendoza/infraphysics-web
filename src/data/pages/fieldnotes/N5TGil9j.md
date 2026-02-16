---
uid: "N5TGil9j"
address: "Docker//Subnet"
name: "Subnet"
date: "2025-02-03"
---
- Docker networks use private IP ranges (172.x.x.x typically) — separate from host LAN (192.168.x.x)
- CIDR notation: `176.45.0.0/16` means first 16 bits are network (176.45), remaining 16 bits are host (10.2 in 176.45.10.2)
- `/16` gives 65534 usable host addresses — plenty for development networks
- Host `192.168.1.50` and container `172.18.0.5` coexist without conflict — different virtual networks

---
[[cgOcsEWf|LAN]] :: host LAN and Docker network are parallel, isolated layers — [[T0U5VL9d|port mapping]] is the only bridge between them

