---
uid: "LZEkMuDa"
address: "ML//Transformer//attention//cross-attention"
name: "Cross-Attention"
date: "2020-03-15"
---
Q from one sequence, K and V from another: how the [[Dc8sW4nR|decoder]] "looks at" the [[En6fL2qY|encoder]] output.
- No [[Cm7jR4sQ|causal masking]]: the decoder can see ALL encoder tokens freely. Makes sense: when translating, you should see the whole source sentence.
- The Q starts from [[St5yK9jL|[BOS]]], the cold start. "How do I begin translating when I haven't generated anything yet?" The [BOS] embedding, processed by decoder layers, IS the initial query.
- K and V from the encoder are computed once and cached: they don't change as the decoder generates token by token.
- Also how [[oZeWLvGF|DALL-E]] and [[ZY388cmd|Stable Diffusion]] condition image generation on text.
- Self-attention in decoder: [[Cm7jR4sQ|causal masking]] ✓. Cross-attention (dec→enc): no masking ✓. Self-attention in encoder: no masking ✓.
