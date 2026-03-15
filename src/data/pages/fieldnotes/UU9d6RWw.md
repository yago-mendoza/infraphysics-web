---
uid: "UU9d6RWw"
address: "Web Dev//SQL//index"
name: "Index"
date: "2026-03-15"
---
A data structure that makes queries faster — like the index at the back of a book. Without it, the database scans every row (full table scan). With it, it jumps straight to the matching rows.
- `CREATE INDEX idx_name ON table (column)` — standard B-tree index for equality and range queries
- `CREATE INDEX ... USING gin (column gin_trgm_ops)` — GIN index for [[xr0O9rcf|fuzzy matching]] with [[RLDYNfd6|pg_trgm]]
- The tradeoff: indexes speed up reads but slow down writes (the index must be updated on every insert/update). At small scale it doesn't matter. At large scale, you index selectively — only columns you query frequently.
- In [[Sb7tRx5K|Supabase]], indexes are created in the SQL Editor via [[1sqlzLdR|DDL]].
