---
uid: "Ct7rBn4D"
address: "Infrastructure//Cloudflare//Workers//CPU time"
name: "CPU time"
date: "2026-03-12"
---
The time a [[Lk2rXj6D|Worker]] actually uses the CPU. NOT the same as wall time (total elapsed time from request to response).
- **CPU time**: code actively running on the processor: parsing JSON, computing, transforming data
- **Wall time**: total time including waiting for network (`fetch` to an API, reading from [[Wn4pCx7H|D1]], calling [[Zr6kDj2F|R2]])
- Waiting on network does NOT count as CPU time. A Worker can fetch from 10 APIs and only use 5ms of CPU.
- Free plan: 10ms CPU time per invocation. Paid: 30s default, up to 5 minutes max.
- 10ms sounds tiny, but for [[Tm6yRs2K|edge]] logic it's plenty: routing, auth/JWT, header manipulation, cache decisions, rate limiting, small API responses. These are sub-millisecond operations.
- Why so limited: [[Vi3tLx8G|V8 isolates]] are single-threaded and share the engine. Long CPU hogs would starve other requests in the same [[Pp6rDx2H|PoP]]. The limit keeps the whole system fair.
