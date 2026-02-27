---
uid: "wV5gFH9z"
address: "ML//RAG//HNSW"
name: "HNSW"
date: "2026-02-26"
---
- Hierarchical Navigable Small World: the dominant algorithm for approximate nearest neighbor (ANN) search
- Multi-layer graph: upper layers have long-range connections (fast coarse search), lower layers short-range (precise local)
- The algorithm inside most [[TIQNpwbS|vector databases]]: Pinecone, Weaviate, Qdrant, pgvector all use HNSW or variants
- Tradeoff: orders of magnitude faster than exact search, but approximate — 95-99% recall is typical
---
[[TIQNpwbS|vector database]] :: HNSW is the core search algorithm inside most vector databases — a "vector search" is navigating an HNSW graph
