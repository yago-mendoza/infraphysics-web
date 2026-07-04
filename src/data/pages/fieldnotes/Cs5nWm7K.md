---
uid: "Cs5nWm7K"
address: "Cloud//edge computing//cold start"
name: "Cold Start"
date: "2026-03-12"
---
The extra latency on the first request to a [[Jn4xWp7B|serverless]] function when the runtime hasn't been initialized yet. First request → spin up runtime → load code → execute → respond. Subsequent requests → already warm → fast.
- In [[Lb5nCx3G|Lambda]] (containers): cold starts range from 100ms to 1s+ depending on language and bundle size. The container has to boot.
- In [[Lk2rXj6D|Workers]] ([[Vi3tLx8G|V8 isolates]]): cold starts are ~0ms because isolates are ultra-lightweight: no container, no VM, no OS boot. Just V8 spinning up a sandbox.
- This is the main reason Workers feel faster than Lambda for the first request: V8 isolates start in microseconds, containers don't.
- After idle (no requests for a while), the function goes cold again and the next request pays the startup cost
---
## Interactions
- [[Vi3tLx8G|V8 isolate]] : : V8 isolates have near-zero cold starts because they're just a sandbox inside the V8 engine: no container to boot, no OS to initialize. Lambda containers (100ms-1s) have to spin up a full process with runtime.
