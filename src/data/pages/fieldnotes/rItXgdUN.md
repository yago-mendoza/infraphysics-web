---
uid: "rItXgdUN"
address: "CPU//cache"
name: "cache"
distinct: ["storage//cache", "networking//cache"]
date: "2026-02-06"
---
- Small, fast SRAM sitting between the [[Z9W6rweD|core]] and main [[jBm8Zuu2|RAM]]
- Organized in levels — L1 (per-core, ~4 cycles), L2 (per-core or shared, ~12 cycles), L3 (shared across cores, ~40 cycles)
- Exploits temporal and spatial locality — most programs re-access the same data and nearby addresses repeatedly
- Cache misses stall the pipeline and dominate performance on memory-bound workloads
- Compare with [[Xgibd7Nl|cache]] (disk-level) and [[Q1kGheNp|cache]] (CDN/proxy-level) — same principle, different latency scale
