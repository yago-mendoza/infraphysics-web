---
address: "CPU//mutex//GIL"
date: "2026-02-05"
---
The Global Interpreter Lock — Python's [[CPU//mutex]] that ensures only one thread executes Python bytecode at a time. Simplifies memory management (reference counting is thread-safe without fine-grained locks) but prevents true [[CPU//core]] parallelism for CPU-bound tasks. Workarounds: multiprocessing (separate processes), C extensions that release the GIL, or async I/O via the [[CPU//mutex//event loop]] for I/O-bound code. Python 3.13+ experiments with a free-threaded build (no-GIL mode).
[[CPU//mutex]]
[[CPU//core]]
[[CPU//mutex//event loop]]
