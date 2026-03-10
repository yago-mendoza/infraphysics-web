---
uid: "Tb5mWr3J"
address: "Web Dev//SQL//SQLite"
name: "SQLite"
date: "2026-03-10"
---
Embedded [[Sv2nKx8R|SQL]] database engine. No separate server needed -- the database is a single file on disk.
- Links directly into the app (it's a C library, not a separate process)
- Zero configuration: no username, no password, no port, no running process. Just a `.sqlite` file.
- Ideal for: mobile apps (Android/iOS use it by default), desktop apps, prototypes, low-to-medium volumes
- Main limitation: single writer at a time (no concurrent writes)
- [[Wn4pCx7H|D1]] is SQLite running at the [[Tm6yRs2K|edge]] -- Cloudflare uses it as the engine for its simplicity and lightness
---
## Interactions
- [[Wn4pCx7H|D1]] : : D1 is SQLite at Cloudflare's edge -- same engine, same SQL syntax, but managed as a service instead of a local file
