---
address: "CPU//core"
date: "2026-02-05"
---
A single, independent instruction execution pipeline within a [[CPU]]. Modern processors pack 4–128+ cores onto one die, each with private L1/L2 caches and shared L3. Multi-core scaling requires careful synchronization via [[CPU//mutex]] primitives to avoid data races. ARM big.LITTLE pairs high-performance [[ARM//cortex-A]] cores with efficient ones for power-aware scheduling.
[[CPU]]
[[CPU//mutex]]
[[ARM//cortex-A]]
