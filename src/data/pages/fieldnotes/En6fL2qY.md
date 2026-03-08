---
uid: "En6fL2qY"
address: "ML//Transformer//encoder"
name: "Encoder"
date: "2026-02-24"
---
[[MwbJnjdN|BERT]]-style architecture: [[vCs7RZqL|self-attention]] is fully bidirectional (no [[Cm7jR4sQ|masking]])
- Every token attends to every other token freely — early words get fully disambiguated by later context.
- Output: one vector per token. The [[St5yK9jL|[CLS]]] token aggregates global sentence meaning for classification.
- Without masking = better enrichment of all positions, but can't generate text (seeing the future defeats autoregressive generation)
- Used for understanding tasks: classification, NER, similarity. [[Dl5mK9cJ|Downstream layers]] sit on top to convert vectors into task outputs.

## Interactions

- [[Dc8sW4nR|decoder]] : : Encoder sees everything bidirectionally (understanding), decoder sees only the past causally (generation) — the fundamental architectural split
