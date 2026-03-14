---
uid: "Vx8sLn4F"
address: "Web Dev//SQL//vector extension"
name: "Vector Extension"
date: "2026-03-12"
---
The concept of adding vector storage and [[Cs3jT7bR|cosine similarity]] search capabilities to an existing [[Rdb7Xm3K|relational database]]. Instead of using a dedicated [[TIQNpwbS|vector database]], you extend your SQL database to handle [[haA3MDhG|embeddings]].
- Adds a vector column type: stores arrays of floats (embeddings) as first-class data alongside normal columns
- Adds distance functions: cosine similarity, Euclidean distance, inner product — usable directly in [[Sv2nKx8R|SQL]] queries
- Adds specialized indexes: [[wV5gFH9z|HNSW]], IVF — for approximate nearest neighbor search without scanning every row
- The main advantage: relational queries AND vector search in the same database, the same query. No syncing IDs between two systems.
- [[Pv3kBx9D|pgvector]] is the most popular implementation (for [[Pg6tRw2H|PostgreSQL]]). [[Vz4rGs7L|Vectorize]] is Cloudflare's approach but as a standalone service, not a DB extension.
- The tradeoff vs dedicated vector DBs ([[Pc7sTm2K|Pinecone]], [[Wv9rDn4H|Weaviate]]): extensions can't match the raw speed and scale for millions of embeddings, but they keep everything in one place — one query, one system, one source of truth.
