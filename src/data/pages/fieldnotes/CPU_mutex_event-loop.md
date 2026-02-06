---
address: "CPU//mutex//event loop"
date: "2026-02-05"
---
A single-threaded concurrency model — one [[CPU//core]] runs a loop that dispatches callbacks when [[I/O]] operations complete, avoiding [[CPU//mutex]] contention entirely. JavaScript (Node.js, browsers), Python asyncio, and Rust's tokio all use this pattern. Non-blocking I/O calls (epoll, kqueue, IOCP) register interest, and the loop multiplexes thousands of concurrent connections without spawning threads. Ideal for I/O-bound workloads; CPU-bound tasks block the loop and must be offloaded.
[[CPU//core]]
[[I/O]]
[[CPU//mutex]]
[[CPU//mutex//GIL]]
