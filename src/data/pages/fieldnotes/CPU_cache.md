---
address: "CPU//cache"
date: "2026-02-06"
---
Small, fast SRAM sitting between the [[CPU//core]] and main [[RAM]]. Organized in levels: L1 (per-core, ~4 cycles), L2 (per-core or shared, ~12 cycles), L3 (shared across cores, ~40 cycles). The cache hierarchy exploits temporal and spatial locality — most programs re-access the same data and nearby addresses repeatedly. Cache misses stall the pipeline and dominate performance on memory-bound workloads. Compare with [[storage//cache]] (disk-level) and [[networking//cache]] (CDN/proxy-level) — same principle, different latency scale.
[[storage//cache]] :: same concept at the disk layer
[[networking//cache]] :: same concept at the network edge
