---
uid: "SgpRlmXe"
address: "ML//RAG//reranker"
name: "Reranker"
date: "2026-03-04"
---
- Second-pass model that re-scores retrieved documents for query relevance.
- First pass ([[2CN85TFL|BM25]] or [[haA3MDhG|embeddings]]) retrieves candidates cheaply; reranker uses cross-[[ml8njOQc|attention]] to evaluate each pair.
- Much more accurate than bi-encoder similarity but too slow for full-index search: hence the two-stage pipeline.
