---
uid: "2GCBLdlB"
address: "ML//Transformer//LM head"
name: "LM head"
date: "2026-02-15"
---
- Output layer — an n_tokens×D matrix where each row competes to have the highest logit
- Softmax converts logits into probabilities that sum to 1
- The bridge between latent representations and actual token predictions
- Each row represents a token in the vocabulary — the dot product between the context vector and each row produces the logit
---
[[RnKMoC3a|latent space]] :: the context vector lives in latent space — LM Head projects it into vocabulary space
