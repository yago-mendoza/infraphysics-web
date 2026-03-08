---
uid: "Sr7tD3vH"
address: "ML//RAG//sentence transformer"
name: "Sentence Transformer"
date: "2026-03-05"
---
[[MwbJnjdN|BERT]] or RoBERTa models fine-tuned with [[Ct9xL5mW|contrastive learning]] specifically for producing semantically meaningful sentence embeddings.
- Base BERT produces embeddings optimized for [[1zpNyBrj|MLM]], not for similarity search — sentence transformers fix this.
- The fine-tuning objective: similar sentences → high [[Cs3jT7bR|cosine similarity]], dissimilar → low.
- OpenAI's embedding models (text-embedding-ada-002, etc.) are essentially this: encoder models fine-tuned for similarity.
- The backbone of modern [[yK3RLt0K|RAG]] pipelines: encode query → encode documents → find nearest neighbors in [[TIQNpwbS|vector database]]
