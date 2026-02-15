---
uid: "cgxZ1IJb"
address: "CPU//mutex//event loop"
name: "event loop"
date: "2026-02-05"
---
- A single-threaded concurrency model — one [[Z9W6rweD|core]] runs a loop that dispatches callbacks when [[zS3Nqz7G|I/O]] operations complete
- Avoids [[xESuHo5A|mutex]] contention entirely
- JavaScript (Node.js, browsers), Python asyncio, and Rust's tokio all use this pattern
- Non-blocking I/O calls (epoll, kqueue, IOCP) register interest, and the loop multiplexes thousands of concurrent connections without spawning threads
- Ideal for I/O-bound workloads — CPU-bound tasks block the loop and must be offloaded
