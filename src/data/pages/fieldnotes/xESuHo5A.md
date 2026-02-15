---
uid: "xESuHo5A"
address: "CPU//mutex"
name: "mutex"
date: "2026-02-05"
---
- A mutual exclusion primitive — a lock that serializes access to shared [[jBm8Zuu2|RAM]] regions across [[Z9W6rweD|core]] boundaries
- Spinlocks, semaphores, and read-write locks are common variants
- Contention on hot mutexes is a top scalability bottleneck
- Language runtimes sometimes enforce broader exclusion — Python's [[azuwblly|GIL]] or JavaScript's [[cgxZ1IJb|event loop]] sidestep data races by constraining concurrency at the language level
---
[[cgxZ1IJb|event loop]] :: single-threaded concurrency model that avoids mutex contention entirely
