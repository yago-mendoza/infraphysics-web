---
uid: "89ceVDr1"
address: "ML//Inference//KV cache"
name: "KV cache"
date: "2023-04-18"
---
- During autoregressive generation, store the K and V matrices for all previous tokens instead of recomputing them
- Trades [[jBm8Zuu2|memory]] for compute. Why inference is memory-bandwidth-bound, not compute-bound.
- For long contexts the KV cache can exceed the model weights in memory
---
[[dpYqVkke|multi-head attention]] :: KV cache stores the K and V projections from each attention head — one cache entry per layer per head per position
