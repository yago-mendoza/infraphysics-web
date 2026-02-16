---
uid: "uAoOThoW"
address: "networking//Localhost"
name: "Localhost"
date: "2025-02-04"
---
- `127.0.0.1` is the loopback address — traffic never leaves the machine
- NOT part of the private IP ranges (not 10.x.x.x or 192.168.x.x) — its own special class
- `localhost:3000` on your machine is invisible to other LAN devices
- Inside a Docker container, `localhost` refers to the container itself, not the host
- Each container has its own loopback — `ping localhost` inside a container hits the container

---
[[T0U5VL9d|Docker Port Mapping]] :: `-p` bridges the gap between the host's localhost and a container's internal port

