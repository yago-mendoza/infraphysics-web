---
uid: "Qw9dFn5L"
address: "Cloud//storage"
name: "Cloud Storage"
distinct: ["storage"]
date: "2026-03-10"
---
Data persistence managed by a cloud provider. Unlike physical [[QB8hS8Ts|storage]] (HDDs, SSDs, flash), you don't manage the hardware. The provider handles replication, durability, backups, and scaling.
- Two main categories: object storage ([[Bx3hKp8M|buckets]] -- files/blobs accessed by key) and [[Yr7mSt4N|managed databases]] (SQL/NoSQL engines run by the provider)
- You interact via APIs, not block devices
---
## Interactions
- [[QB8hS8Ts|Storage]] : : cloud storage runs on physical storage underneath, but the abstraction is completely different -- APIs vs block devices, pay-per-use vs own-the-hardware
