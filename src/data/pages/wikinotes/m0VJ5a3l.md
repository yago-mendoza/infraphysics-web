---
uid: "m0VJ5a3l"
address: "ML//Transformer//positional encoding//RoPE"
name: "RoPE"
date: "2023-03-20"
---
Rotary Position Embedding: instead of summing a position vector, **rotates** [[Qk3vT7mJ|Q and K]] vectors by an angle proportional to their position before the [[Dp2kN6wF|dot product]]
- The elegance: Q·K then depends naturally on the **relative distance** between tokens, not absolute position. Rotation angles compose.
- Extrapolates to longer sequences better than learned absolute embeddings: the rotation pattern generalizes.
- Used in LLaMA, [[xd1c1Ru9|Mistral]], and most modern open LLMs.
