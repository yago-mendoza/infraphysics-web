---
uid: "Mq4sLn8W"
address: "Web Dev//SQL//MySQL"
name: "MySQL"
date: "2026-03-12"
---
[[Rdb7Xm3K|Relational database]]. Server-client architecture: a MySQL process runs 24/7, clients connect over TCP. Widely used, battle-tested, fast for simple queries.
- Lighter and faster than [[Pg6tRw2H|PostgreSQL]] for simple read-heavy workloads
- Less strict [[Sv2nKx8R|SQL]] compliance: more forgiving but also more surprising edge cases
- Handles concurrency well, designed for multiple users hitting the same tables simultaneously
- Unlike [[Tb5mWr3J|SQLite]] (single file, single writer), MySQL is built for servers where dozens or thousands of users read and write at the same time
- Since both MySQL and PostgreSQL are already server-based and designed for concurrency, they make sense on heavier infrastructure, not on an [[Tm6yRs2K|edge]] runtime or a local app
---
## Interactions
- [[Pg6tRw2H|PostgreSQL]] : : both relational server DBs, but PostgreSQL is stricter on SQL compliance and supports [[Pv3kBx9D|pgvector]] for vector search. MySQL doesn't have an equivalent vector extension
- [[Tb5mWr3J|SQLite]] : : SQLite is a single file with no server, MySQL is a server process built for concurrency. SQLite for local, MySQL for production with many users
