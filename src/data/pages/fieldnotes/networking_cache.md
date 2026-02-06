---
address: "networking//cache"
date: "2026-02-06"
---
A store that holds copies of frequently requested content closer to the consumer. CDNs distribute caches across edge PoPs worldwide; reverse proxies (Varnish, nginx) cache at the origin's front door. Cache invalidation — knowing when stale data must be purged — remains one of the two hard problems in computer science. The principle mirrors [[CPU//cache]] (hardware) and [[storage//cache]] (disk), scaled up to geographic distances and HTTP semantics.
[[CPU//cache]] :: same concept at the hardware layer
[[storage//cache]] :: same concept at the disk layer
