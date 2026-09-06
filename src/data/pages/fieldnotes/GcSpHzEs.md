---
uid: "GcSpHzEs"
address: "OS//concurrency"
name: "concurrency"
date: "2026-09-01"
---
Concurrency means multiple computations can make progress during overlapping periods. They need not execute at the same instant; that stronger property is parallelism.

- Shared mutable state creates races because correctness begins to depend on timing rather than only on program order.
- [[xESuHo5A|Mutexes]] protect invariants, while event loops serialize selected work onto one thread. Neither removes concurrency; each constrains where interleavings can occur.
- The difficult bugs are often legal executions that happened in an order the programmer did not imagine. Logging can even hide them by changing timing.

Concurrency is less about doing many things at once than about controlling which observations of “at once” the program is allowed to expose.
