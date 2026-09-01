---
uid: "Pg6tRw2H"
address: "Web Dev//SQL//PostgreSQL"
name: "PostgreSQL"
date: "2026-03-12"
---
[[Rdb7Xm3K|Relational database]]. The most standard-compliant and feature-rich open-source [[Sv2nKx8R|SQL]] database. Server-client architecture, runs as a persistent process.
- More strict than [[Mq4sLn8W|MySQL]] in SQL compliance: catches more errors, fewer surprises
- Extensible: supports custom types, functions, and extensions like [[Pv3kBx9D|pgvector]] for vector search
- Strong concurrency model (MVCC), designed for heavy multi-user workloads
- The combination of relational queries + pgvector means you can do SQL JOINs, complex filters, AND [[Cs3jT7bR|cosine similarity]] search in a single query. All in one DB. The tradeoff: not as fast at pure vector search as dedicated [[TIQNpwbS|vector databases]] like [[Pc7sTm2K|Pinecone]]
- Common pattern: PostgreSQL for everything (relational + vectors via pgvector) when simplicity matters. PostgreSQL + Pinecone (via synced IDs) when vector scale matters.

## Interactions
- [[Pc7sTm2K|Pinecone]] : : common pattern: PostgreSQL for relational data + Pinecone for vector search, synced via IDs. Or: pgvector to do both in one DB, trading scale for simplicity
