---
uid: "Rdb7Xm3K"
address: "Web Dev//SQL//relational database"
name: "Relational Database"
date: "2026-03-12"
---
Databases organized in tables with rows and columns, where relationships between tables are defined via foreign keys and queried via JOINs. The "relational" part means data is structured in relations (tables) and the language to query them is [[Sv2nKx8R|SQL]].
- Designed for multi-user concurrency: multiple clients reading and writing simultaneously without data corruption
- Server-client architecture: a database process runs 24/7, clients connect over a network
- Contrast with [[Tb5mWr3J|SQLite]]: SQLite is a single file, no server, no concurrent writes. Relational DBs like [[Pg6tRw2H|PostgreSQL]] and [[Mq4sLn8W|MySQL]] are built for servers with many users hitting the same data
- The heavier the workload and the more users, the more a proper relational DB pays off: they're designed to handle the concurrency that SQLite can't
