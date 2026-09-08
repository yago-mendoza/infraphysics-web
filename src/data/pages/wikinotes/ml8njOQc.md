---
uid: "ml8njOQc"
address: "ML//Transformer//attention"
name: "Attention"
date: "2018-06-15"
---
Attention existed before the 2017 paper. The key contribution of "Attention Is All You Need" was that attention was... all you needed, no [[mBCcy7bn|recurrence]]. [[vCs7RZqL|Self-attention]] specifically was novel.
- Attention does **context routing**: allows encoded information from one token's vector to flow into another's. Every token can look at every other token in parallel.
- [[Qk3vT7mJ|Q, K, V]] matrices: query asks a question, keys answer relevance, values carry the content.
- O(n²) cost in sequence length, the fundamental scaling constraint. Doblar el contexto = 4x memoria y cómputo.
- ~1/3 of all you need: attention handles context, the other 2/3 is [[Pr8dt3wz|MLP]] storing facts.
- Replaced the sequential bottleneck of [[mBCcy7bn|RNNs]] with parallel computation.
