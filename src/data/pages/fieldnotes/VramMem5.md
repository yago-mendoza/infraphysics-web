---
uid: "VramMem5"
address: "Hardware//model memory footprint"
name: "Model Memory Footprint"
date: "2026-09-04"
---

Model memory footprint is the device memory required to run a workload, often allocated in GPU VRAM. It includes weights, activations, KV cache, temporary workspaces and allocator overhead.

This is why “the weights fit” does not guarantee that inference fits. Batch size, context length, numerical precision and serving strategy change the remaining components. Compression may halve weight storage while total memory falls by much less when KV cache dominates.

VRAM is not a cupboard containing only the model. It is the workbench, the parts tray and the notebook at once.

## Interactions

- [[qY2jOLny|quantization]] : : Weight quantization reduces one major component of the footprint, not every allocation made during inference
