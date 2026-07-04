---
uid: "Vz4rGs7L"
address: "Cloud//Cloudflare//Vectorize"
name: "Vectorize"
date: "2026-03-12"
---
[[Hp5nVw9C|Cloudflare]]'s edge-native [[TIQNpwbS|vector database]]. A separate product from [[Wn4pCx7H|D1]]: D1 is [[Tb5mWr3J|SQLite]] and doesn't have [[Vx8sLn4F|vector extensions]] natively.
- Stores [[haA3MDhG|embeddings]] and performs [[Cs3jT7bR|cosine similarity]] search at the edge
- Up to 5M vectors per index, 50K namespaces per account
- Integrates with [[Lk2rXj6D|Workers]] and Workers AI for inference → embed → store → search, all on Cloudflare
- Limitation: no hybrid search (BM25 + vectors in one query). For that you'd need D1 (FTS5 full-text search) + Vectorize together, two products for what [[Wv9rDn4H|Weaviate]] does in one.
- The Cloudflare answer to [[Pv3kBx9D|pgvector]]: instead of adding vectors to your SQL database, it's a dedicated vector service alongside your SQL database
---
## Interactions
- [[Pv3kBx9D|pgvector]] : : pgvector adds vectors to your SQL database (one system, one query). Vectorize is a standalone vector DB at the edge (separate system, separate query). Different approach to the same problem.
