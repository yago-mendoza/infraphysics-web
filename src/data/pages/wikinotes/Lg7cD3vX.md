---
uid: "Lg7cD3vX"
address: "ML//Transformer//logits"
name: "Logits"
date: "2026-02-28"
---
Raw scores over the entire [[Vb8kM2nQ|vocabulary]] before normalization: Wu × normalized_output = logits.
- Each value = dot product between the context vector and one row of the [[2GCBLdlB|LM head]]: measures "how aligned is this output with each possible next token".
- Not probabilities: can be negative, arbitrarily large. [[Sm8rH4nW|Softmax]] converts them to a proper distribution.
- [[Pr11SIS0|Temperature]] divides logits before softmax: logits/T. Low T = peaky distribution (confident), high T = flat (creative)
- In [[YwfNaR4R|DPO]]: the model computes logits for both preferred and rejected outputs, widening the gap between them.
