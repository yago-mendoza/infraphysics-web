---
uid: "89ceVDr1"
address: "ML//Inference//KV cache"
name: "KV Cache"
date: "2023-04-18"
---
During autoregressive generation, store the K and V matrices for all previous tokens instead of recomputing them.
- Only works because of [[Cm7jR4sQ|causal masking]]: previous tokens' representations are "closed". They don't change when a new token arrives. Without masking (BERT-style), every new token would change all previous values → must recompute everything.
- Example: context ["El", "gato"], new token "duerme" → only compute K_duerme, V_duerme. K_El, V_El, K_gato, V_gato already cached.
- For 4K+ token sequences, KV cache reduces generation time 10-50x. The cost is memory: cache grows linearly with context length.

##### The tradeoff

- Trades [[jBm8Zuu2|memory]] for compute. Why inference is memory-bandwidth-bound, not compute-bound. For long contexts the KV cache can exceed the model weights in memory.
- Another reason not to save enriched [[haA3MDhG|embeddings]] across passes: you'd need to recompute everything each time, the [[mBCcy7bn|RNN]]-style dilution problem.

## Interactions

- [[dpYqVkke|multi-head attention]] : : KV cache stores the K and V projections from each attention head: one cache entry per layer per head per position
