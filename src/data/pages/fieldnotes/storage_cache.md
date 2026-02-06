---
address: "storage//cache"
date: "2026-02-06"
---
A fast buffer (usually DRAM or SLC flash) between the host and the storage medium. Write-back caches acknowledge writes before they reach the platter/NAND, boosting throughput at the cost of a power-loss risk window. Read caches keep hot blocks in memory to avoid mechanical seek or flash read latency. The OS page cache, the drive's internal DRAM, and ZFS's ARC are all layers of storage caching. Same principle as [[CPU//cache]] (nanoseconds) and [[networking//cache]] (milliseconds), applied at the microsecond scale.
[[CPU//cache]] :: same concept at the hardware layer
[[networking//cache]] :: same concept at the network edge
