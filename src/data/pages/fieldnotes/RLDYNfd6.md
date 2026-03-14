---
uid: "RLDYNfd6"
address: "Web Dev//SQL//PostgreSQL//pg_trgm"
name: "pg_trgm"
date: "2026-03-14"
---
[[Pg6tRw2H|PostgreSQL]] extension for trigram-based [[xr0O9rcf|fuzzy matching]]. Splits every string into 3-character chunks (trigrams) and compares overlap between query and stored text.
- `CREATE EXTENSION pg_trgm;` — one line to enable. Available on [[Sb7tRx5K|Supabase]] out of the box.
- `similarity(a, b)` → float 0.0–1.0. `a % b` → boolean (above threshold). `SET pg_trgm.similarity_threshold = 0.3;` controls the cutoff.
- GIN index (`CREATE INDEX idx ON table USING gin (column gin_trgm_ops)`) — makes `%` and `similarity()` fast on large tables. Without the index, it's a full table scan.
- The sibling of [[Pv3kBx9D|pgvector]]: pgvector adds vector search to Postgres, pg_trgm adds fuzzy text search. Both are "extend Postgres instead of adding another system" plays.
- Common pattern: use pg_trgm for user-facing search (names, titles, short text) and full-text search (`tsvector`) for body content. They stack — different tools for different jobs.
- At 300 rows it's instant. At 1M rows it's still fast with the GIN index. You need dedicated search (Elasticsearch, Meilisearch) only at serious scale.
---
## Interactions
- [[Pv3kBx9D|pgvector]] : : both are PostgreSQL extensions that add search capabilities — pgvector for semantic (embedding) similarity, pg_trgm for syntactic (character) similarity. Same philosophy: extend Postgres instead of bolting on another system
