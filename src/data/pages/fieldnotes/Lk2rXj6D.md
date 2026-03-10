---
uid: "Lk2rXj6D"
address: "Cloud//Cloudflare//Workers"
name: "Workers"
date: "2026-03-10"
---
Cloudflare's edge function runtime. Code executes in V8 isolates (same engine as Chrome), not Node.js. Runs in 300+ datacenters worldwide.
- Each request gets its own isolate -- startup is ~0ms (no cold start like Lambda)
- Limitations: 10ms CPU time (free) or 30s (paid), no filesystem, limited Node.js API compatibility
- Supports JavaScript, TypeScript, Rust (via WASM), Python
- Workers can access [[Wn4pCx7H|D1]], [[Zr6kDj2F|R2]], KV, and other [[Hp5nVw9C|Cloudflare]] services via bindings declared in wrangler.toml
