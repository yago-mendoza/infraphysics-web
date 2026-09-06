---
uid: "ParWgt8S"
address: "ML//parameters and weights"
name: "Parameters and Weights"
date: "2026-09-04"
---

Parameters are the values a model learns during training. Weights are the parameter tensors that scale and combine signals, although ordinary ML conversation often uses both words almost interchangeably.

Parameter count estimates model storage and some compute, but it does not equal total inference memory. Activations, runtime workspaces and the KV cache may dominate under large batches or long contexts. Nor does a larger parameter count guarantee a better model; architecture, data and training determine what those numbers encode.

Weights are frozen experience. Context is today's paperwork.

## Interactions

- [[VramMem5|model memory footprint]] : : Weight storage is one component of deployment memory rather than the entire footprint
