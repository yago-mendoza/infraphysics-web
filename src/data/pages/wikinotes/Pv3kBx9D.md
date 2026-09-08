---
uid: "Pv3kBx9D"
address: "Web Dev//SQL//PostgreSQL//pgvector"
name: "pgvector"
date: "2026-03-12"
---
Extension for [[Pg6tRw2H|PostgreSQL]] that adds vector columns, storage, and similarity search directly inside the database. Turns Postgres into a lightweight [[TIQNpwbS|vector database]].
- Adds a `VECTOR(n)` column type: stores [[haA3MDhG|embeddings]] alongside normal relational data in the same table
- Supports [[Cs3jT7bR|cosine similarity]], Euclidean distance, and inner product, calculated inside SQL queries
- The killer feature: `SELECT * FROM docs WHERE category='X' ORDER BY embedding <-> query_vector LIMIT 5`, relational filtering AND vector search in one query. No syncing IDs between two systems.
- Uses [[wV5gFH9z|HNSW]] indexes for approximate nearest neighbor search
- The tradeoff vs [[Pc7sTm2K|Pinecone]]/[[Wv9rDn4H|Weaviate]]: pgvector is slower at pure vector search scale (millions of [[haA3MDhG|embeddings]]), but you get everything in one database

## Interactions
- [[TIQNpwbS|vector database]] : : pgvector turns PostgreSQL into a lightweight vector database: same capabilities, less scale, but zero infrastructure overhead and no ID-syncing between systems
