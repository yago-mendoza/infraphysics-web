---
uid: "Wv9rDn4H"
address: "ML//RAG//vector database//Weaviate"
name: "Weaviate"
date: "2026-03-12"
---
Dedicated [[TIQNpwbS|vector database]] with graph and ontology capabilities on top. Like [[Pc7sTm2K|Pinecone]] but adds schema-aware relationships between objects.
- Stores vectors + structured data with typed schemas
- Supports hybrid search: vector similarity + keyword (BM25) in the same query, something [[Pc7sTm2K|Pinecone]] and [[Vz4rGs7L|Vectorize]] can't do alone
- Built-in modules for auto-vectorization: plug in an [[KugYH1TK|embedding model]], Weaviate embeds on ingest
- Still not a [[Rdb7Xm3K|relational database]]: no SQL, no JOINs in the traditional sense. Key → vector + structured JSON, like Pinecone but richer.
