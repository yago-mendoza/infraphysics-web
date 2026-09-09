---
slug: cache-storage
uid: "Xgibd7Nl"
address: "hardware//storage//cache"
name: "cache"
distinct: ["hardware//CPU//cache", "networks//cache"]
date: "2026-02-06"
---
- Fast buffer (usually DRAM or SLC flash) between the host and the storage medium.
- Write-back caches acknowledge writes before they reach the platter/NAND, boosting throughput at the cost of a power-loss risk window.
- Read caches keep hot blocks in memory to avoid mechanical seek or flash read latency.
- Layers include the OS page cache, drive internal DRAM, and ZFS's ARC.
- Same principle as [[rItXgdUN|cache]] (nanoseconds) and [[Q1kGheNp|cache]] (milliseconds), applied at the microsecond scale.
