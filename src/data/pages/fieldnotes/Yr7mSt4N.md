---
uid: "Yr7mSt4N"
address: "Cloud//storage//managed database"
name: "Managed Database"
date: "2026-03-10"
---
A database engine hosted and operated by a cloud provider. You get a connection string; they handle hardware, replication, backups, patching, scaling.
- Examples: [[Wn4pCx7H|Cloudflare D1]] (SQLite), Neon (PostgreSQL), PlanetScale (MySQL), Supabase (PostgreSQL), AWS RDS, Google Cloud SQL, DynamoDB (NoSQL)
- The tradeoff: less control over tuning, potential vendor lock-in, but zero ops burden
---
## Interactions
- [[Wn4pCx7H|D1]] : : D1 is Cloudflare's managed database -- SQLite at the edge, no connection string needed, accessed via bindings
