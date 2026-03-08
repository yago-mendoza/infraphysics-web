---
uid: "vCs7RZqL"
address: "ML//Transformer//attention//self-attention"
name: "Self-Attention"
date: "2018-07-05"
---
[[Qk3vT7mJ|Q, K, V]] all come from the same sequence — each token attends to all others including itself.
- The novel contribution of the 2017 paper — attention existed before, but self-attention for sequence processing was new.
- The n² cost that defines transformer scaling: every pair of tokens interacts.
- softmax(QKᵀ/√d) V — the [[Dp2kN6wF|dot product]] measures relevance, [[Sm8rH4nW|softmax]] normalizes, values get weighted.
- In [[En6fL2qY|encoder]] (BERT): bidirectional, no masking — every token sees everything.
- In [[Dc8sW4nR|decoder]] (GPT): causal, with [[Cm7jR4sQ|masking]] — each token only sees the past.
