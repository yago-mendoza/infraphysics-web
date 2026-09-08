---
uid: "Cs3jT7bR"
address: "ML//neural network//embedding//cosine similarity"
name: "Cosine Similarity"
date: "2026-03-05"
---
Measures angular alignment between two vectors: cos(θ) = (A·B)/(|A||B|). Range [-1, 1]. 1 = same direction, 0 = orthogonal, -1 = opposite.
- The standard metric for semantic search in [[yK3RLt0K|RAG]]: encode query and documents as vectors, find highest cosine similarity.
- Why cosine and not dot product? Cosine normalizes for magnitude: a long document vector shouldn't score higher just because it has more words.
- After [[Ct9xL5mW|contrastive learning]] fine-tuning: "Capital of France?" and "Paris is the capital" → high cosine similarity.
- The backbone of [[TIQNpwbS|vector databases]] and [[Sr7tD3vH|sentence transformer]] search pipelines.
