---
uid: "azuwblly"
address: "CPU//mutex//GIL"
name: "GIL"
date: "2026-02-05"
---
- The Global Interpreter Lock — Python's [[xESuHo5A|mutex]] ensuring only one thread executes bytecode at a time
- Simplifies memory management — reference counting is thread-safe without fine-grained locks
- Prevents true [[Z9W6rweD|core]] parallelism for CPU-bound tasks
- Workarounds: multiprocessing, C extensions that release the GIL, or async I/O via the [[cgxZ1IJb|event loop]]
- Python 3.13+ experiments with a free-threaded build (no-GIL mode)
