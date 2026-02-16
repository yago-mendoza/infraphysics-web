---
uid: "xLBQ9RnH"
address: "Docker//Volume"
name: "Volume"
date: "2025-02-03"
---
- `-v /host/path:/container/path` creates a persistent bridge between host and container file systems
- Containers are ephemeral — without volumes, all data disappears when the container is removed
- Critical for blockchain nodes: synced chain data (days of work) persists on the host through volumes
- Volume mapping is bidirectional and live — changes on either side are immediately visible on the other
- `--data-path=/data/n1` tells Besu where to write inside the container; `-v` ensures it reaches the host

---
[[FlMHYCjo|Docker]] :: volumes solve the fundamental tension between container ephemerality and blockchain persistence

