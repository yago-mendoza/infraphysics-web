---
uid: "Ds4pJ8kF"
address: "ML//Inference//decoding step"
name: "Decoding Step"
date: "2026-03-08"
---
One [[Fw4pJ8mS|forward pass]] = one new token generated. The full inference = a sequence of decoding steps.
- At each step: the new token attends to all previous tokens, but previous tokens do NOT attend to the new one ([[Cm7jR4sQ|causal masking]])
- [[89ceVDr1|KV cache]] makes this efficient: only compute K, V for the new token, reuse cached K, V for all previous tokens.
- Without KV cache: for sequence length N, you'd recompute attention over all N tokens at every step. With cache: compute only for the new token. For 4K+ sequences, 10-50x speedup.
- The cache grows linearly with context length — part of why long context is expensive (memory, not compute)
- Forward pass = 1 decoding step. Entire generation = inference.
