---
uid: "RnKMoC3a"
address: "ML//Transformer//latent space"
name: "Latent Space"
date: "2026-02-15"
---
High-dimensional activation paths where matrix multiplications route inputs into specific semantic clusters.
- The [[Rs6cD4vX|residual stream]] IS the trajectory through this space — each layer moves the vector to a new point.
- A given context vector is a point — new token, new step along the manifold.
- Path alternates: context ([[ml8njOQc|attention]]) → fact ([[Pr8dt3wz|MLP]]) → context → fact. Each layer moves the vector. The last layer contains organized, routable information.
- Different contexts land in different regions — this is [[Ds3fR7kX|distributional shift]]. Reasoning tokens before an answer position the model in the "coherent conclusion" region. Direct answers land in the "cold response" region. Same model, different neighborhoods.
- The last token's final hidden state has been refined through so many layers that it "knows" exactly what it is relative to everything else — sufficient to predict next.
- Because logits derive from dot product similarity and generation is auto-regressive, LLM output hardly ever diverges the path — even with low [[Pr11SIS0|temperature]]
- [[x5qaZizz|Mixture of Experts]]: dynamic activation paths that route inputs into specialized clusters through gating mechanisms — same space, selective computation.

## Interactions

- [[2GCBLdlB|LM head]] : : Logits are dot products between the context vector and LM Head rows — geometry in latent space directly determines token selection
- [[5qpyTXdv|Sampling]] : : Sampling introduces stochasticity — a new manifold path branches from the same point
- [[Rs6cD4vX|residual stream]] : : The residual stream is the physical implementation of the latent space trajectory — each residual connection writes a new coordinate
