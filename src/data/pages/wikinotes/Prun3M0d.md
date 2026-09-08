---
uid: "Prun3M0d"
address: "ML//model compression//pruning"
name: "Model Pruning"
date: "2026-09-04"
---

Pruning removes weights, neurons, attention heads or larger structures estimated to contribute little to a model's useful behavior. The result may be unstructured sparsity (individual zeros) or structured sparsity (whole blocks that regular hardware can skip more easily).

Parameter count can fall without wall-clock inference improving. If the runtime still loads dense tensors or sparse indexing costs more than it saves, the compression remains mathematical rather than operational. Structured pruning often sacrifices some freedom to buy hardware legibility.

Deleting multiplication is easy. Convincing the accelerator not to wait for it is the engineering.

## Interactions

- [[MemB0und|memory-bound]] : : Pruning helps memory-bound inference only when it reduces the bytes actually transferred
