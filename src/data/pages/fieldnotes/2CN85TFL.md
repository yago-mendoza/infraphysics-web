---
uid: "2CN85TFL"
address: "ML//RAG//BM25"
name: "BM25"
date: "2026-02-26"
---
- Best Matching 25: classic keyword ranking algorithm for information retrieval
- Scores documents by term frequency, inverse document frequency, and document length normalization
- Still competitive with [[haA3MDhG|embeddings]] for exact-match queries. Most production RAG uses BM25 + vectors ([[ebRm86zw|hybrid search]])
---
[[ebRm86zw|hybrid search]] :: BM25 is the keyword half of hybrid search — catches exact term matches that semantic embeddings miss
