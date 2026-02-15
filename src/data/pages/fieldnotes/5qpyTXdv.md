---
uid: "5qpyTXdv"
address: "ML//Inference//Sampling"
name: "Sampling"
date: "2026-02-15"
---
- Choosing the next token from the probability distribution over the vocabulary
- Temperature: scales logits before softmax — low = deterministic, high = creative
- Top-k: only consider the k highest-probability tokens
- Top-p (nucleus): only consider tokens whose cumulative probability exceeds p
- Introduces stochasticity — same input can produce different outputs (new [[RnKMoC3a|manifold]] path)
- Temperature is cranked up when generating candidate outputs for [[0f5GJDwc|RLHF]] or [[YwfNaR4R|DPO]] — need diversity
---
[[RnKMoC3a|latent space]] :: sampling picks a point in vocabulary space, which becomes the next step on the manifold — low temperature hugs the most likely path, high temperature explores branches
