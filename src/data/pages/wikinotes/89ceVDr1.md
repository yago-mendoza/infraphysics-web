---
uid: "89ceVDr1"
address: "ML//Inference//KV cache"
name: "KV Cache"
date: "2023-04-18"
---
During autoregressive generation, the KV cache stores attention keys and values for previous tokens instead of recomputing them at every step.
- Only works because of [[Cm7jR4sQ|causal masking]]: previous tokens' representations are "closed". They don't change when a new token arrives. Without masking (BERT-style), every new token would change all previous values → must recompute everything.
- Example: context ["El", "gato"], new token "duerme" → only compute K_duerme, V_duerme. K_El, V_El, K_gato, V_gato already cached.
- The cache reduces repeated computation, but its memory grows with active sequence length, batch size, layer count and representation precision.

##### The tradeoff

- Trades [[jBm8Zuu2|memory]] for compute. For long contexts or many concurrent sequences, cache capacity and bandwidth can become major serving constraints.
- Another reason not to save enriched [[haA3MDhG|embeddings]] across passes: you'd need to recompute everything each time, the [[mBCcy7bn|RNN]]-style dilution problem.

## Interactions

- [[dpYqVkke|multi-head attention]] : : KV cache stores the K and V projections from each attention head: one cache entry per layer per head per position
- [[JUby2DIy|context window]] : : Longer active contexts enlarge the cache even when the model weights remain unchanged
- [[Batch1ng|inference batching]] : : Serving more simultaneous sequences multiplies the cache state held in device memory
