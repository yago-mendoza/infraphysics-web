---
uid: hvAzfHpn
address: "ML//Inference//semantic continuity"
name: "semantic continuity"
date: "2026-03-05"
---

- How well a model maintains thematic and register coherence across a generation
- Not logical coherence; something subtler: whether the text reads as if written by the same author, in the same context, with the same intent
- Base models (pre-[[3EKErev3|alignment]]) had it sporadically; [[0f5GJDwc|RLHF]] and [[YwfNaR4R|DPO]] trained models have it almost always
- Breaks down when the prompt pushes the model into a region of the latent space it can't sustain, or when [[Pr11SIS0|temperature]] is too high and [[5qpyTXdv|sampling]] drifts off-distribution
- Distinct from factual accuracy; a model can be semantically continuous while hallucinating confidently

## Interactions

- [[3EKErev3|Alignment]] : : alignment solved continuity as a side effect; the explicit goal was helpfulness, but training on human preferences also regularized register and tone
- [[5qpyTXdv|Sampling]] : : aggressive sampling (high temperature, high top-p) breaks continuity first; conservative sampling preserves it at the cost of diversity
