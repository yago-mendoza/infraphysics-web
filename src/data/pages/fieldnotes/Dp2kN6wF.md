---
uid: "Dp2kN6wF"
address: "ML//Transformer//attention//dot product"
name: "Dot Product Attention"
date: "2026-03-01"
---
The mechanism that measures relevance: Q · Kᵀ produces an N×N matrix of alignment scores between every pair of tokens.
- Raw scores look terrible: arbitrarily large, no normalization. Scaled by √d_k to prevent [[Sm8rH4nW|softmax]] saturation.
- Softmax applied per column (each query's distribution over all keys) → probabilities that sum to 1.
- Multiply the softmax weights by V → weighted sum of values = the "suggested change" to each token's representation.
- Full formula: softmax(QKᵀ/√d_k) · V. This whole process is one [[Hd4nK8xS|attention head]]
- The attention matrix is what makes transformers O(n²) in sequence length: for N=4096, that's 16M values per head.
