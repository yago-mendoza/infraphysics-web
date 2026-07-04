---
uid: "eGfBTEQ5"
address: "ML//Transformer//positional encoding"
name: "Positional Encoding"
date: "2018-08-20"
---
Without position info, a Transformer treats "gato muerde perro" the same as "perro muerde gato" (permutation invariant).
- Original paper: sinusoidal waves summed to embeddings. Problem: train on 512 tokens, see 1000 at inference → degradation (never saw those positions)
- Learned embeddings (GPT-2), [[m0VJ5a3l|RoPE]] (LLaMA, rotates Q and K), [[Al5fD9kX|ALiBi]] (linear bias on attention scores). Each approach handles extrapolation differently.
- The encoding method matters most for long sequences beyond training length.
