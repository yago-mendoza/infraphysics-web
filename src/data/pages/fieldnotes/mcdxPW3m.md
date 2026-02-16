---
uid: "mcdxPW3m"
address: "ML//Transformer//layer normalization"
name: "layer normalization"
date: "2018-09-10"
---
- Normalize activations across the feature dimension (not the batch)
- Stabilizes training — prevents values from exploding or vanishing across layers
- Pre-norm (normalize before attention/FFN) vs post-norm (after) — pre-norm is more stable for deep models
