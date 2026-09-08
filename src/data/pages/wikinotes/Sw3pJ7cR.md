---
uid: "Sw3pJ7cR"
address: "ML//Transformer//attention//sliding window attention"
name: "Sliding Window Attention"
date: "2026-02-25"
---
Longformer-style: each token attends only to its w nearest neighbors + a few designated global tokens.
- Reduces attention cost from O(n²) to O(n×w), making very long sequences feasible.
- The tradeoff: tokens far apart can only communicate indirectly (through chains of local windows across layers)
- Global tokens (e.g. [CLS]) still attend to everything, anchor points for aggregation.
- None of these approaches give truly "infinite" context. They're all compromises between cost and attention capacity.
- [[xd1c1Ru9|Mistral]] uses sliding window attention as default.
