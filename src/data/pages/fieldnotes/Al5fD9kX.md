---
uid: "Al5fD9kX"
address: "ML//Transformer//positional encoding//ALiBi"
name: "ALiBi"
date: "2026-03-02"
---
Attention with Linear Biases — alternative to [[m0VJ5a3l|RoPE]] and sinusoidal [[eGfBTEQ5|positional encoding]]
- Doesn't add position info to embeddings at all — instead subtracts a linear bias from attention scores proportional to distance between tokens.
- Farther tokens get penalized more → natural recency bias without learned position embeddings.
- Extrapolates to longer sequences than seen during training — the linear penalty is simple enough to generalize.
- No extra parameters — just a fixed penalty schedule applied during attention computation.
