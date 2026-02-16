---
uid: "ml8njOQc"
address: "ML//Transformer//attention"
name: "attention"
date: "2018-06-15"
---
- "Attention Is All You Need" (Vaswani et al., 2017) — the paper that started everything
- Every token can look at every other token in parallel. Q, K, V matrices: query asks a question, keys answer relevance, values carry the content.
- Replaced the sequential bottleneck of [[mBCcy7bn|RNNs]] with parallel computation
- O(n²) cost in sequence length — the fundamental scaling constraint
