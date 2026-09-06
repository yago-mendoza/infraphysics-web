---
uid: "AiAccel5"
address: "Hardware//AI accelerator"
name: "AI Accelerator"
date: "2026-09-04"
---

An AI accelerator is hardware specialized for the matrix, vector and data-movement patterns common in machine-learning workloads. GPUs are the dominant general-purpose example, while TPUs, NPUs and custom ASICs make different trade-offs among programmability, efficiency and deployment scale.

Peak arithmetic is only one layer of useful performance. Memory bandwidth, interconnect, kernels, compilers, numerical formats and serving software determine how much of the silicon a real model can use.

A fast chip without a usable software path is an impressive heater.

## Interactions

- [[MemBand6|memory bandwidth]] : : Accelerator performance is frequently constrained by feeding data to arithmetic units rather than by peak FLOPs
