---
uid: "TIQNpwbS"
address: "ML//RAG//vector database"
name: "vector database"
date: "2026-02-15"
---
- Stores vectors paired with resources (chunked to ~500 token paragraphs)
- Core operation: "given a vector, find the N nearest vectors fast"
- The math: cosine similarity between the question (embedded on-the-fly) and the stored vectors
- HNSW (Hierarchical Navigable Small World graphs): builds a graph where similar vectors are neighbors — hops through ~40 nodes instead of checking all 10M vectors, O(n) → O(log n)
- IVF (Inverted File Index): clusters vectors into buckets first, searches only the closest ones — one drawer instead of the whole filing cabinet
- Implementations: Pinecone, Weaviate, Chroma, Qdrant, Supabase, FAISS
