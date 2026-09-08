---
uid: "Mq4sLn8W"
address: "web dev//SQL//MySQL"
name: "MySQL"
date: "2026-03-12"
aliases: ["MariaDB", "InnoDB"]
---
MySQL is a [[Rdb7Xm3K]] that runs as its own server process: clients open a TCP connection (port 3306 by default), send [[Sv2nKx8R]], and the server owns the files, the locks and the cache on their behalf. Almost everything characteristic about it follows from that split. Because one long-lived process mediates every read and write, many clients can hit the same tables at once without corrupting them, and because the process is separate from the application, it can live on another machine, be replicated, backed up and upgraded on its own schedule.

Its reputation was made in the LAMP stack and in the applications built on it (WordPress, early Facebook, most of the 2000s web), which is why it is still the database a hosting provider assumes you want. Since version 5.5 the default storage engine is InnoDB, which brought transactions, row-level locking and crash recovery; the older MyISAM engine, fast for reads and unsafe for concurrent writes, is the source of much of the "MySQL is fast but loose" folklore.

- Its historical weakness is permissiveness. For years the server silently truncated strings that did not fit, turned invalid dates into zeros and accepted `GROUP BY` queries whose results were not well defined. Since 5.7 the default `sql_mode` is strict (`STRICT_TRANS_TABLES`, `ONLY_FULL_GROUP_BY` and friends), so a fresh install now rejects what an old one swallowed. A migration from an old server can therefore break on data the old server never complained about.
- The engine is tuned for many short queries rather than a few heavy ones. Primary-key lookups and simple joins on indexed columns ([[UU9d6RWw]]) are where it shines; analytical queries with wide scans and window functions are where PostgreSQL usually pulls ahead. Replication (one primary, many read replicas) is mature and simple to set up, which is how read-heavy sites scale it.
- MariaDB is the community fork created in 2009 when Sun, which owned MySQL, was bought by Oracle. It stays wire-compatible for most purposes, ships a few engines and features of its own, and is what many Linux distributions install when you ask for "mysql".
- A server database earns its keep on shared infrastructure with many concurrent users. On an [[Tm6yRs2K|edge]] runtime, inside a single-user desktop app or in a prototype, the process, the port and the credentials are overhead that an embedded engine does not have.

## Interactions

- [[Pg6tRw2H|PostgreSQL]] : : Same architecture, opposite temperament: PostgreSQL enforces the SQL standard, favours correctness over leniency and extends through custom types and plugins such as [[Pv3kBx9D|pgvector]]; MySQL favours simple fast paths and broad hosting support and has no comparable vector extension
- [[Tb5mWr3J|SQLite]] : : SQLite is a library that writes one file inside the application, with a single writer at a time; MySQL is a process that serves many writers over the network. The choice is about who owns the data and how many hands are on it, not about SQL syntax
