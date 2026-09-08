---
uid: "MdlCmp8R"
address: "ML//model compression"
name: "Model Compression"
date: "2026-09-04"
---

Model compression reduces the storage, memory traffic or computation required by a model while trying to preserve useful capability. It is a family name, not one trick.

- **Quantization** stores numbers with fewer bits.
- **Pruning** removes parameters or structures judged unnecessary.
- **Distillation** trains a smaller student to reproduce a larger teacher.
- **Factorization** replaces large tensors with cheaper structured representations.

The useful metric is not “percentage compressed” in isolation. What matters is whether the target runtime converts that structural change into lower latency, higher throughput or cheaper deployment without unacceptable quality loss.

Smaller on paper is only valuable when the machine notices.

## Interactions

- [[qY2jOLny|quantization]] : : Quantization compresses numerical representation without necessarily changing the model architecture
- [[Prun3M0d|pruning]] : : Pruning removes learned structure, but speed appears only when kernels and hardware exploit the resulting sparsity
- [[Kd3yK6jL|knowledge distillation]] : : Distillation transfers behavior into a newly trained, usually smaller model

