---
uid: "Sm8rH4nW"
address: "ML//neural network//softmax"
name: "Softmax"
date: "2026-03-08"
---
Converts a vector of raw scores ([[Lg7cD3vX|logits]]) into probabilities that sum to 1: exp(xᵢ)/Σexp(xⱼ)
- Not an [[RXHPrtTB|activation function]] — it's a normalization that creates a probability distribution.
- Two key uses in transformers:
- In [[ml8njOQc|attention]]: applied per column of QKᵀ scores → how much each token attends to every other.
- In output: applied to [[Lg7cD3vX|logits]] over [[Vb8kM2nQ|vocabulary]] → probability of each possible next token.
- [[Pr11SIS0|Temperature]] controls sharpness: T<1 makes the distribution peakier (more confident), T>1 flattens it (more random)
- The inputs to softmax at the output layer are called logits — raw pre-normalization scores.
