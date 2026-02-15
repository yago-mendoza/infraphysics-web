---
uid: "RnKMoC3a"
address: "ML//Transformer//latent space"
name: "latent space"
date: "2026-02-15"
---
- High-dimensional activation paths where matrix multiplications route inputs into specific semantic clusters
- A given context vector is a point — new token, new step along the manifold
- Because logits derive from dot product similarity and generation is auto-regressive and deterministic, LLM output hardly ever diverges the path — even with low temperature
- Mixture of Experts (MoE): dynamic activation paths that route inputs into specialized clusters through gating mechanisms — same space, selective computation
---
[[2GCBLdlB|LM head]] :: logits are dot products between the context vector and LM Head rows — geometry in latent space directly determines token selection
[[5qpyTXdv|Sampling]] :: sampling introduces stochasticity — a new manifold path branches from the same point
