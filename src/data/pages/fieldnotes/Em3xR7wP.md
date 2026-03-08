---
uid: "Em3xR7wP"
address: "ML//Transformer//tokenizer//embedding matrix"
name: "Embedding Matrix"
date: "2026-03-02"
---
Converts token IDs into dense vectors: token_id 4821 → vector[512 dims]. These are trainable parameters.
- The same matrix, transposed, converts the last layer's output back into "similarity with each token in the [[Vb8kM2nQ|vocabulary]]" — this is [[Wt9rB5kH|weight tying]]
- Size = vocab_size × embedding_dim. No matter how big the model, the tokenizer (embedding dimension) bottlenecks comprehension.
- Not a neural network — it's a lookup table that maps discrete IDs to continuous vectors.
- The [[haA3MDhG|embeddings]] it produces are the raw starting point — every [[Fw4pJ8mS|forward pass]] resets from these base vectors.

## Interactions

- [[2GCBLdlB|LM head]] : : The LM head IS the embedding matrix transposed — weight tying means the same parameters encode and decode
