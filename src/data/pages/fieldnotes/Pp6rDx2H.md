---
uid: "Pp6rDx2H"
address: "Cloud//edge computing//PoP"
name: "PoP"
date: "2026-03-12"
---
Point of Presence. A physical location (usually a small datacenter or server cluster in a city) where a network provider has equipment to serve users nearby.
- [[Hp5nVw9C|Cloudflare]] has 300+ PoPs worldwide. Each PoP contains multiple edge servers (nodes).
- A PoP is the building. The edge servers inside it are the machines. A request from Madrid hits the Madrid PoP, not a server in Virginia.
- More PoPs = lower latency for more users, because the code runs physically closer to them
- When [[Lk2rXj6D|Workers]] code deploys, it replicates to every PoP. The first request at a given PoP initializes the [[Vi3tLx8G|V8 isolate]] — after that, it's warm.
- A PoP has many [[Vi3tLx8G|V8 isolates]] running in parallel. V8 is single-threaded, but the PoP runs many independent isolates to handle concurrency — the CPU time limit is per isolate, not per PoP.
