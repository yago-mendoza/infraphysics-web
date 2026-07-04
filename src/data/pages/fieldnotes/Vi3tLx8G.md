---
uid: "Vi3tLx8G"
address: "Cloud//Cloudflare//Workers//V8 isolate"
name: "V8 Isolate"
date: "2026-03-12"
---
A lightweight sandbox within the [[Rm3xBt7F|V8]] JavaScript engine. Each [[Lk2rXj6D|Worker]] request gets its own isolate, an independent execution context with its own memory, but sharing the same V8 engine process.
- Not a container. Not a VM. Not a [[FlMHYCjo|Docker]] process. Just a V8 sandbox: starts in microseconds, not milliseconds.
- Single-threaded: V8 is single-threaded, so each isolate uses one thread. A [[Pp6rDx2H|PoP]] runs many isolates in parallel across multiple V8 engine instances to handle concurrency.
- Why Workers are so limited: isolates share resources on the same engine. If one isolate hogs the CPU, others in the same engine stall. That's why [[Ct7rBn4D|CPU time]] is capped, to keep every request fair and the [[Pp6rDx2H|PoP]] responsive.
- The tradeoff vs [[Lb5nCx3G|Lambda]] containers: isolates are faster to start (near-zero [[Cs5nWm7K|cold start]]) and lighter, but they can't do heavy compute or access the filesystem. Containers are heavier but more capable.
- No VM, no Docker, no containerization, no OS: just V8. That's why it's so fast AND so limited.
---
## Interactions
- [[FlMHYCjo|Docker]] : : Workers don't use containers. An isolate is a V8 sandbox: microsecond startup, no OS, no filesystem. Docker containers have full OS access but take 100ms+ to cold-start.
