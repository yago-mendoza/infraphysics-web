---
uid: "MemB0und"
address: "Hardware//memory-bound"
name: "Memory-Bound"
date: "2026-09-04"
---

A workload is memory-bound when moving data limits performance before the processor exhausts its arithmetic capacity. Adding more compute units then produces little benefit because they spend more time waiting for operands.

Autoregressive inference at small batch sizes often has this character: model weights must be read for each generated token with limited reuse. Compression can help by reducing bytes moved, but only if decompression or irregular access does not introduce a new bottleneck.

The expensive part of a calculation is sometimes carrying it to the calculator.

## Interactions

- [[MemBand6|memory bandwidth]] : : Available bandwidth sets the ceiling for a workload with low arithmetic intensity
