---
uid: "vCs7RZqL"
address: "ML//Transformer//attention//self-attention"
name: "self-attention"
date: "2018-07-05"
---
- Q, K, V all come from the same sequence — each token attends to all others including itself
- The n² cost that defines transformer scaling: every pair of tokens interacts
- softmax(QKᵀ/√d) V — the dot product measures relevance, softmax normalizes, values get weighted
