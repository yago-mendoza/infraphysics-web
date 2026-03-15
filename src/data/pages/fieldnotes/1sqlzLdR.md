---
uid: "1sqlzLdR"
address: "Web Dev//SQL//DDL"
name: "DDL"
date: "2026-03-15"
---
Data Definition Language — the subset of [[Sv2nKx8R|SQL]] that defines structure, not data. `CREATE TABLE`, `ALTER TABLE`, `DROP TABLE`. Building the container, not filling it.
- Creating a table with 20 columns is 42 clean lines. SQL is the most optimal way to define big entities — evolutionarily elegant.
- Key constraints in a `CREATE TABLE`:
  - `UUID PRIMARY KEY DEFAULT gen_random_uuid()` — unique identifier per row, auto-generated if not provided
  - `NOT NULL` — mandatory field
  - `REFERENCES tabla(columna)` — foreign key, points to another table
  - `DEFAULT valor` — fallback value
  - `CHECK (col IN (...))` — only accepts these values (like an enum)
  - `UNIQUE (a, b)` — the combination can't repeat
  - `TEXT[]` — array inside a column ([[Pg6tRw2H|PostgreSQL]] specific)
- In [[Sb7tRx5K|Supabase]], you write DDL in the SQL Editor, not the Table Editor. The Table Editor is for viewing and editing rows (spreadsheet mode). The SQL Editor can do everything — [[PrjC4wIH|triggers]], [[UU9d6RWw|indexes]], [[iegOPp9Q|RLS]] policies, complex queries. One is visual, the other is powerful. The SQL Editor even lets you save queries as favorites — that's the kind of thing that makes you go "oh NICE."
