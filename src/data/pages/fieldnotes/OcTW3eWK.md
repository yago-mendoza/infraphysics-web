---
uid: "OcTW3eWK"
address: "ML//RAG//ColBERT"
name: "ColBERT"
date: "2026-02-26"
---
- Late-interaction retrieval: keep per-token [[haA3MDhG|embeddings]] instead of compressing into single vectors
- MaxSim: each query token matches against its best document token, then sum. More expressive than cosine similarity
- ColPali/ColQwen extend to vision — retrieve documents by visual layout, not just text
- Bridge between cheap bi-encoders and expensive cross-encoder [[SgpRlmXe|rerankers]]
---
[[MwbJnjdN|BERT]] :: architectural descendant — ColBERT is BERT with late interaction, trading single-vector compression for per-token matching
