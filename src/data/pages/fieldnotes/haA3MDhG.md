---
uid: "haA3MDhG"
address: "ML//neural network//embedding"
name: "Embedding"
date: "2018-03-08"
---
Mapping discrete tokens to dense vectors — "king" becomes [0.2, -0.5, 0.8, ...]. Typical dimension: 12K+ in large models.
- Word2Vec showed embeddings capture meaning: king - man + woman ≈ queen. Dot product = 0 → perpendicular → unrelated. [[Dr6kN2wY|Directionality]] encodes gender, plurality, semantics.
- Learned during training, not hand-crafted. The model discovers its own feature space.
- Each [[Fw4pJ8mS|forward pass]] starts from the base embeddings — enriched representations from the previous pass are NOT saved (that would be [[mBCcy7bn|RNNs]])
- The [[Em3xR7wP|embedding matrix]] that produces these vectors is also used (transposed) as the output layer via [[Wt9rB5kH|weight tying]]

## Interactions

- [[RnKMoC3a|latent space]] : : Embeddings are the entry point — they project discrete symbols into the continuous latent space where the model thinks
