---
address: "CPU//mutex"
date: "2026-02-05"
---
A mutual exclusion primitive — a lock that serializes access to shared [[RAM]] regions across [[CPU//core]] boundaries. Spinlocks, semaphores, and read-write locks are common variants. Contention on hot mutexes is a top scalability bottleneck. Language runtimes sometimes enforce broader exclusion: Python's [[CPU//mutex//GIL]] or JavaScript's [[CPU//mutex//event loop]] sidestep data races by constraining concurrency at the language level.
[[CPU//core]]
[[RAM]]
[[CPU//mutex//GIL]]
[[CPU//mutex//event loop]]
