---
uid: "Tm6yRs2K"
address: "Infrastructure//edge computing"
name: "edge computing"
date: "2026-03-10"
---
Running code in datacenters geographically close to the user, rather than in a central region. Reduces latency because the request doesn't travel across continents.
- [[Hp5nVw9C|Cloudflare]] has 300+ edge locations worldwide
- The tradeoff: edge runtimes have limitations (no full Node.js, limited CPU time per request, restricted APIs)
- Examples: [[Lk2rXj6D|Cloudflare Workers]], Deno Deploy, Vercel Edge, AWS Lambda@Edge

## Interactions
- [[Lk2rXj6D|Workers]] : : Workers are Cloudflare's implementation of edge computing -- V8 isolates in 300+ datacenters
