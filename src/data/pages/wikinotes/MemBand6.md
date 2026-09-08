---
uid: "MemBand6"
address: "Hardware//memory bandwidth"
name: "Memory Bandwidth"
date: "2026-09-04"
---

Memory bandwidth measures how quickly data can move between memory and the compute units that consume it. A processor with enormous arithmetic capability still waits if operands arrive too slowly.

Token-by-token LLM inference often streams large weight tensors for relatively little work per byte, making bandwidth a central limit. Reducing precision can therefore accelerate inference by moving fewer bytes even when the abstract number of arithmetic operations changes little.

Compute is the factory. Bandwidth is the road delivering every part. An idle factory may simply have a traffic problem.

## Interactions

- [[Thr0ugh8|throughput]] : : Available bandwidth caps aggregate work when the serving workload is dominated by data movement
